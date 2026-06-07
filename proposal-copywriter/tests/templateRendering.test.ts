import { describe, expect, it } from "vitest";
import { renderDraftSections } from "../src/templates/engine";

describe("template rendering", () => {
    it("renders all required sections with keyword injection", () => {
        const sections = renderDraftSections("foundation_default", {
            donorName: "Civic Impact Foundation",
            grantTitle: "Digital Equity Grant",
            grantCategory: "Education",
            grantDescription: "Digital inclusion outcomes",
            deadline: "2027-01-15",
            requestedBudget: "50000",
            keywordSentence: "equity, community resilience",
            prioritiesSentence: "underserved communities, measurable outcomes",
            constraintsSentence: "12-month delivery, quarterly reporting"
        });

        expect(Object.keys(sections)).toEqual([
            "Executive Summary",
            "Objectives",
            "Methodology",
            "Workplan",
            "Budget Summary",
            "Impact",
            "KPIs"
        ]);

        expect(sections["Executive Summary"]).toContain("Digital Equity Grant");
        expect(sections["Executive Summary"]).toContain("equity, community resilience");
        expect(sections.Objectives).toContain("underserved communities");
    });
});
