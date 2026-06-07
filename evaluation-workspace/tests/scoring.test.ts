import { describe, expect, it } from "vitest";
import {
  averageCriteria,
  computeWeightedScore,
  normalizeWeights,
  variance
} from "../src/scoring/engine";

describe("scoring engine", () => {
  it("computes weighted score", () => {
    const score = computeWeightedScore(
      {
        relevance: 0.8,
        capacity_fit: 0.7,
        success_probability: 0.6,
        budget_fit: 0.5
      },
      {
        relevance: 0.4,
        capacity_fit: 0.2,
        success_probability: 0.3,
        budget_fit: 0.1
      }
    );

    expect(score).toBe(0.69);
  });

  it("normalizes weights that do not sum to 1", () => {
    const normalized = normalizeWeights({
      relevance: 4,
      capacity_fit: 2,
      success_probability: 3,
      budget_fit: 1
    });

    expect(normalized.relevance).toBeCloseTo(0.4, 6);
    expect(normalized.capacity_fit).toBeCloseTo(0.2, 6);
    expect(normalized.success_probability).toBeCloseTo(0.3, 6);
    expect(normalized.budget_fit).toBeCloseTo(0.1, 6);
  });

  it("aggregates criteria and computes variance", () => {
    const average = averageCriteria([
      {
        relevance: 0.7,
        capacity_fit: 0.6,
        success_probability: 0.8,
        budget_fit: 0.4
      },
      {
        relevance: 0.9,
        capacity_fit: 0.8,
        success_probability: 0.6,
        budget_fit: 0.6
      }
    ]);

    expect(average).toEqual({
      relevance: 0.8,
      capacity_fit: 0.7,
      success_probability: 0.7,
      budget_fit: 0.5
    });

    expect(variance([0.4, 0.8])).toBe(0.04);
  });
});