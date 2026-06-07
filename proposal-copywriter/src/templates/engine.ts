import type { DraftSections, TemplateRenderContext } from "../types";
import { donorTemplates } from "./templates";

const REQUIRED_SECTIONS: (keyof DraftSections)[] = [
    "Executive Summary",
    "Objectives",
    "Methodology",
    "Workplan",
    "Budget Summary",
    "Impact",
    "KPIs"
];

function replacePlaceholders(input: string, context: TemplateRenderContext): string {
    return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
        const value = context[key as keyof TemplateRenderContext];
        return value ?? "";
    });
}

export function renderDraftSections(
    templateId: string,
    context: TemplateRenderContext
): DraftSections {
    const template = donorTemplates[templateId] ?? donorTemplates.foundation_default;

    const rendered: DraftSections = {
        "Executive Summary": replacePlaceholders(
            template.sectionTemplates["Executive Summary"],
            context
        ),
        Objectives: replacePlaceholders(template.sectionTemplates.Objectives, context),
        Methodology: replacePlaceholders(
            template.sectionTemplates.Methodology,
            context
        ),
        Workplan: replacePlaceholders(template.sectionTemplates.Workplan, context),
        "Budget Summary": replacePlaceholders(
            template.sectionTemplates["Budget Summary"],
            context
        ),
        Impact: replacePlaceholders(template.sectionTemplates.Impact, context),
        KPIs: replacePlaceholders(template.sectionTemplates.KPIs, context)
    };

    const missing = REQUIRED_SECTIONS.filter((section) => !rendered[section]?.trim());
    if (missing.length > 0) {
        throw new Error(`Required sections are missing content: ${missing.join(", ")}`);
    }

    return rendered;
}
