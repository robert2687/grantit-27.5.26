import { describe, expect, it } from "vitest";
import { validateBudgetTotals } from "../src/validation/validators";

describe("budget validation", () => {
    it("passes when line item sum matches total", () => {
        expect(() =>
            validateBudgetTotals({
                currency: "USD",
                total: 1000,
                lineItems: [
                    { name: "Program", amount: 700 },
                    { name: "M&E", amount: 200 },
                    { name: "Admin", amount: 100 }
                ]
            })
        ).not.toThrow();
    });

    it("fails when line item sum differs from total", () => {
        expect(() =>
            validateBudgetTotals({
                currency: "USD",
                total: 900,
                lineItems: [
                    { name: "Program", amount: 700 },
                    { name: "M&E", amount: 200 },
                    { name: "Admin", amount: 100 }
                ]
            })
        ).toThrow(/consistency check failed/i);
    });
});
