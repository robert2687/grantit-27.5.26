export type DraftSectionName =
    | "Executive Summary"
    | "Objectives"
    | "Methodology"
    | "Workplan"
    | "Budget Summary"
    | "Impact"
    | "KPIs";

export type DraftSections = Record<DraftSectionName, string>;

export type UserRole = "viewer" | "reviewer" | "editor" | "admin";

export interface GrantRecord {
    title?: string;
    funder?: string;
    category?: string;
    description?: string;
    deadline?: string;
    amountMin?: number;
    amountMax?: number;
    budgetRequested?: number;
    tags?: string[];
    contactEmail?: string;
    internalNotes?: string;
    [key: string]: unknown;
}

export interface BudgetLineItem {
    name: string;
    amount: number;
}

export interface BudgetSummary {
    currency: string;
    total: number;
    lineItems: BudgetLineItem[];
}

export interface DonorGuidelines {
    donorName: string;
    templatePreference?: string;
    tone?: "formal" | "technical" | "community";
    requiredKeywords?: string[];
    priorities?: string[];
    constraints?: string[];
    budgetRules?: string[];
    contactEmail?: string;
    internalNotes?: string;
}

export interface CreateDraftInput {
    evaluation_id: string;
    donor_guidelines: DonorGuidelines;
    template_id?: string;
    grant_record?: GrantRecord;
}

export interface ReviseDraftInput {
    reviewer_id: string;
    reviewer_comment: string;
    section_updates?: Partial<DraftSections>;
    budget_summary?: BudgetSummary;
    change_reason?: string;
}

export interface ReviewerComment {
    reviewerId: string;
    comment: string;
    role: UserRole;
    createdAt: string;
}

export interface ChangeHistoryItem {
    version: number;
    changedBy: string;
    changedFields: string[];
    reason: string;
    changedAt: string;
}

export interface DraftVersion {
    version: number;
    sections: DraftSections;
    budgetSummary: BudgetSummary;
    comments: ReviewerComment[];
    changedAt: string;
    changedBy: string;
}

export interface ProposalDraft {
    id: string;
    evaluationId: string;
    templateId: string;
    donorGuidelines: DonorGuidelines;
    grantRecord?: GrantRecord;
    sections: DraftSections;
    budgetSummary: BudgetSummary;
    comments: ReviewerComment[];
    versions: DraftVersion[];
    changeHistory: ChangeHistoryItem[];
    currentVersion: number;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateDefinition {
    id: string;
    name: string;
    sectionTemplates: DraftSections;
}

export interface TemplateRenderContext {
    donorName: string;
    grantTitle: string;
    grantCategory: string;
    grantDescription: string;
    deadline: string;
    requestedBudget: string;
    keywordSentence: string;
    prioritiesSentence: string;
    constraintsSentence: string;
}

export interface EventPayloads {
    "evaluation.shortlisted": {
        evaluationId: string;
        aggregatedScore: number | null;
        grantRecord?: GrantRecord;
    };
    "draft.created": {
        draftId: string;
        evaluationId: string;
        version: number;
    };
    "draft.updated": {
        draftId: string;
        evaluationId: string;
        version: number;
        reviewerId: string;
    };
}
