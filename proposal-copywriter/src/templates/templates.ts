import type { DraftSections, TemplateDefinition } from "../types";

function sections(input: DraftSections): DraftSections {
    return input;
}

export const donorTemplates: Record<string, TemplateDefinition> = {
    foundation_default: {
        id: "foundation_default",
        name: "Foundation Default",
        sectionTemplates: sections({
            "Executive Summary":
                "{{grantTitle}} is a {{grantCategory}} opportunity from {{donorName}}. This proposal centers on {{keywordSentence}}.",
            Objectives:
                "Primary objectives include delivering measurable outcomes aligned with {{prioritiesSentence}}.",
            Methodology:
                "Our methodology combines evidence-informed program design with practical delivery constraints: {{constraintsSentence}}.",
            Workplan:
                "The workplan is structured in phased milestones through {{deadline}} with clear ownership and reporting checkpoints.",
            "Budget Summary":
                "Requested budget is {{requestedBudget}} and is allocated to direct implementation, coordination, and monitoring activities.",
            Impact:
                "Expected impact includes sustained benefits for target beneficiaries and stronger implementation capacity.",
            KPIs:
                "KPIs include reach, completion rate, quality score, and outcomes linked to {{grantDescription}}."
        })
    },
    government_strict: {
        id: "government_strict",
        name: "Government Structured",
        sectionTemplates: sections({
            "Executive Summary":
                "This submission responds to {{grantTitle}} under {{donorName}} with a compliance-ready plan focused on {{keywordSentence}}.",
            Objectives:
                "Objectives are SMART, auditable, and mapped to program priorities: {{prioritiesSentence}}.",
            Methodology:
                "Delivery methodology uses controlled implementation cycles, risk logs, and documented QA under constraints: {{constraintsSentence}}.",
            Workplan:
                "Workplan defines timeline, milestones, and governance gates up to {{deadline}}.",
            "Budget Summary":
                "Budget request {{requestedBudget}} is justified by line-item rationale and accountable procurement controls.",
            Impact:
                "Impact is measured against baseline and endline indicators with explicit attribution assumptions.",
            KPIs:
                "KPIs include on-time milestone completion, budget adherence, beneficiary outcomes, and reporting compliance."
        })
    }
};
