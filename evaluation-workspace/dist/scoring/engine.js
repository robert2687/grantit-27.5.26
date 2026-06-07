"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWeights = normalizeWeights;
exports.computeWeightedScore = computeWeightedScore;
exports.averageCriteria = averageCriteria;
exports.variance = variance;
const CRITERIA_KEYS = [
    "relevance",
    "capacity_fit",
    "success_probability",
    "budget_fit"
];
function normalizeWeights(weights) {
    const sum = CRITERIA_KEYS.reduce((acc, key) => acc + weights[key], 0);
    if (sum <= 0) {
        throw new Error("Weight sum must be greater than zero.");
    }
    return {
        relevance: weights.relevance / sum,
        capacity_fit: weights.capacity_fit / sum,
        success_probability: weights.success_probability / sum,
        budget_fit: weights.budget_fit / sum
    };
}
function computeWeightedScore(scores, weights) {
    const normalized = normalizeWeights(weights);
    const weighted = CRITERIA_KEYS.reduce((acc, key) => acc + scores[key] * normalized[key], 0);
    return Number(weighted.toFixed(4));
}
function averageCriteria(scores) {
    if (scores.length === 0) {
        return {
            relevance: 0,
            capacity_fit: 0,
            success_probability: 0,
            budget_fit: 0
        };
    }
    const totals = scores.reduce((acc, current) => {
        CRITERIA_KEYS.forEach((key) => {
            acc[key] += current[key];
        });
        return acc;
    }, {
        relevance: 0,
        capacity_fit: 0,
        success_probability: 0,
        budget_fit: 0
    });
    return {
        relevance: Number((totals.relevance / scores.length).toFixed(4)),
        capacity_fit: Number((totals.capacity_fit / scores.length).toFixed(4)),
        success_probability: Number((totals.success_probability / scores.length).toFixed(4)),
        budget_fit: Number((totals.budget_fit / scores.length).toFixed(4))
    };
}
function variance(values) {
    if (values.length <= 1) {
        return 0;
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const meanSquaredError = values.reduce((acc, current) => acc + (current - mean) ** 2, 0) /
        values.length;
    return Number(meanSquaredError.toFixed(6));
}
