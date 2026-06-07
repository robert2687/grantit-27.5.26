import type { BudgetSummary, DraftSections } from "../types";

const REQUIRED_SECTION_NAMES: (keyof DraftSections)[] = [
    "Executive Summary",
    "Objectives",
    "Methodology",
    "Workplan",
    "Budget Summary",
    "Impact",
    "KPIs"
];

export function validateRequiredSections(sections: DraftSections): void {
    const missing = REQUIRED_SECTION_NAMES.filter((name) => !sections[name]?.trim());
    if (missing.length > 0) {
        throw new Error(`Required section completeness check failed: ${missing.join(", ")}`);
    }
}

export function validateBudgetTotals(summary: BudgetSummary): void {
    const lineItemTotal = summary.lineItems.reduce((acc, item) => acc + item.amount, 0);
    const delta = Math.abs(lineItemTotal - summary.total);
    if (delta > 0.01) {
        throw new Error(
            `Budget totals consistency check failed: lineItems=${lineItemTotal}, total=${summary.total}`
        );
    }
}
