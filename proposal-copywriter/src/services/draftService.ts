import { randomUUID } from "node:crypto";
import { renderDraftSections } from "../templates/engine";
import { validateBudgetTotals, validateRequiredSections } from "../validation/validators";
import type {
    BudgetSummary,
    ChangeHistoryItem,
    CreateDraftInput,
    DonorGuidelines,
    DraftSections,
    DraftVersion,
    GrantRecord,
    ProposalDraft,
    ReviseDraftInput,
    UserRole
} from "../types";

function sentenceOrDefault(items: string[] | undefined, fallback: string): string {
    if (!items || items.length === 0) {
        return fallback;
    }
    return items.join(", ");
}

function redactSensitive(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((v) => redactSensitive(v));
    }

    if (value && typeof value === "object") {
        const output: Record<string, unknown> = {};
        for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
            if (/email|phone|ssn|bank|account|internal|secret|tax/i.test(key)) {
                output[key] = "[REDACTED]";
            } else {
                output[key] = redactSensitive(inner);
            }
        }
        return output;
    }

    return value;
}

function defaultBudgetSummary(input: CreateDraftInput): BudgetSummary {
    const requested =
        input.grant_record?.budgetRequested ?? input.grant_record?.amountMax ?? 0;

    const rounded = Number(requested.toFixed(2));
    return {
        currency: "USD",
        total: rounded,
        lineItems: [
            { name: "Program Delivery", amount: Number((rounded * 0.7).toFixed(2)) },
            { name: "Monitoring and Evaluation", amount: Number((rounded * 0.2).toFixed(2)) },
            {
                name: "Administration",
                amount: Number((rounded - rounded * 0.7 - rounded * 0.2).toFixed(2))
            }
        ]
    };
}

export class DraftService {
    private readonly drafts = new Map<string, ProposalDraft>();
    private readonly shortlisted = new Set<string>();
    private readonly grantRecordByEvaluation = new Map<string, GrantRecord | undefined>();

    markShortlisted(evaluationId: string, grantRecord?: GrantRecord): void {
        this.shortlisted.add(evaluationId);
        this.grantRecordByEvaluation.set(evaluationId, grantRecord);
    }

    create(input: CreateDraftInput): ProposalDraft {
        if (!this.shortlisted.has(input.evaluation_id)) {
            throw new Error("Evaluation is not shortlisted. Cannot create draft.");
        }

        const draftId = randomUUID();
        const now = new Date().toISOString();
        const grant = input.grant_record ?? this.grantRecordByEvaluation.get(input.evaluation_id);

        const donor: DonorGuidelines = input.donor_guidelines;
        const templateId = input.template_id ?? donor.templatePreference ?? "foundation_default";

        const sections = renderDraftSections(templateId, {
            donorName: donor.donorName,
            grantTitle: grant?.title ?? "Untitled Grant",
            grantCategory: grant?.category ?? "general",
            grantDescription: grant?.description ?? "program goals",
            deadline: grant?.deadline ?? "TBD",
            requestedBudget: String(grant?.budgetRequested ?? grant?.amountMax ?? "TBD"),
            keywordSentence: sentenceOrDefault(
                [...(donor.requiredKeywords ?? []), ...(grant?.tags ?? [])],
                "mission alignment and measurable outcomes"
            ),
            prioritiesSentence: sentenceOrDefault(donor.priorities, "equity and implementation quality"),
            constraintsSentence: sentenceOrDefault(donor.constraints, "timeline and capacity constraints")
        });

        const budgetSummary = defaultBudgetSummary(input);
        validateRequiredSections(sections);
        validateBudgetTotals(budgetSummary);

        const initialVersion: DraftVersion = {
            version: 1,
            sections,
            budgetSummary,
            comments: [],
            changedAt: now,
            changedBy: "system"
        };

        const draft: ProposalDraft = {
            id: draftId,
            evaluationId: input.evaluation_id,
            templateId,
            donorGuidelines: donor,
            grantRecord: grant,
            sections,
            budgetSummary,
            comments: [],
            versions: [initialVersion],
            changeHistory: [
                {
                    version: 1,
                    changedBy: "system",
                    changedFields: ["sections", "budgetSummary"],
                    reason: "Initial draft generated",
                    changedAt: now
                }
            ],
            currentVersion: 1,
            createdAt: now,
            updatedAt: now
        };

        this.drafts.set(draftId, draft);
        return draft;
    }

    getById(id: string): ProposalDraft | undefined {
        return this.drafts.get(id);
    }

    revise(id: string, input: ReviseDraftInput, role: UserRole): ProposalDraft {
        if (!["editor", "admin"].includes(role)) {
            throw new Error("Role is not permitted to revise draft.");
        }

        const draft = this.drafts.get(id);
        if (!draft) {
            throw new Error("Draft not found.");
        }

        const now = new Date().toISOString();
        const revisedSections: DraftSections = {
            ...draft.sections,
            ...(input.section_updates ?? {})
        };
        const revisedBudget = input.budget_summary ?? draft.budgetSummary;

        validateRequiredSections(revisedSections);
        validateBudgetTotals(revisedBudget);

        const newComment = {
            reviewerId: input.reviewer_id,
            comment: input.reviewer_comment,
            role,
            createdAt: now
        };

        const nextVersion = draft.currentVersion + 1;
        draft.sections = revisedSections;
        draft.budgetSummary = revisedBudget;
        draft.currentVersion = nextVersion;
        draft.updatedAt = now;
        draft.comments.push(newComment);

        const changedFields = [
            ...(input.section_updates ? ["sections"] : []),
            ...(input.budget_summary ? ["budgetSummary"] : []),
            "comments"
        ];

        const historyItem: ChangeHistoryItem = {
            version: nextVersion,
            changedBy: input.reviewer_id,
            changedFields,
            reason: input.change_reason ?? "Revision submitted",
            changedAt: now
        };

        draft.changeHistory.push(historyItem);
        draft.versions.push({
            version: nextVersion,
            sections: revisedSections,
            budgetSummary: revisedBudget,
            comments: [...draft.comments],
            changedAt: now,
            changedBy: input.reviewer_id
        });

        this.drafts.set(draft.id, draft);
        return draft;
    }

    exportDraft(id: string, format: "text" | "json"): string | Record<string, unknown> {
        const draft = this.drafts.get(id);
        if (!draft) {
            throw new Error("Draft not found.");
        }

        if (format === "text") {
            return [
                `Draft ID: ${draft.id}`,
                `Evaluation ID: ${draft.evaluationId}`,
                `Version: ${draft.currentVersion}`,
                "",
                ...Object.entries(draft.sections).map(([name, body]) => `${name}\n${body}\n`),
                `Budget Total: ${draft.budgetSummary.currency} ${draft.budgetSummary.total}`
            ].join("\n");
        }

        return {
            draft_id: draft.id,
            evaluation_id: draft.evaluationId,
            template_id: draft.templateId,
            version: draft.currentVersion,
            sections: draft.sections,
            budget_summary: draft.budgetSummary,
            donor_guidelines: redactSensitive(draft.donorGuidelines),
            grant_record: redactSensitive(draft.grantRecord),
            comments: draft.comments,
            change_history: draft.changeHistory
        };
    }
}
