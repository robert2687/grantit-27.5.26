"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationService = void 0;
const node_crypto_1 = require("node:crypto");
const engine_1 = require("../scoring/engine");
const DEFAULT_WEIGHTS = {
    relevance: 0.4,
    capacity_fit: 0.2,
    success_probability: 0.3,
    budget_fit: 0.1
};
const DEFAULT_TEMPLATE = {
    templateId: "grant-evaluation-v1",
    version: "1.0.0",
    commentGuidance: [
        "Summarize mission alignment in one sentence.",
        "List top risk and mitigation.",
        "Call out evidence supporting success probability."
    ]
};
class EvaluationService {
    evaluations = new Map();
    evaluationsPerReviewer = new Map();
    weights = DEFAULT_WEIGHTS;
    template = DEFAULT_TEMPLATE;
    getConfig() {
        return {
            weights: this.weights,
            template: this.template
        };
    }
    updateWeights(newWeights) {
        this.weights = (0, engine_1.normalizeWeights)(newWeights);
        return this.weights;
    }
    updateTemplate(template) {
        this.template = template;
        return this.template;
    }
    createFromGrant(grantRecord) {
        const id = (0, node_crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const evaluation = {
            id,
            grantRecord,
            prepopulatedForm: this.prepopulate(grantRecord),
            status: "pending_review",
            reviews: [],
            createdAt: now,
            updatedAt: now
        };
        this.evaluations.set(id, evaluation);
        return evaluation;
    }
    getById(id) {
        return this.evaluations.get(id);
    }
    list(status) {
        const all = [...this.evaluations.values()];
        if (!status) {
            return all;
        }
        return all.filter((e) => e.status === status);
    }
    submitReview(evaluationId, input) {
        const evaluation = this.evaluations.get(evaluationId);
        if (!evaluation) {
            throw new Error("Evaluation not found.");
        }
        const weightedScore = (0, engine_1.computeWeightedScore)(input.scores, this.weights);
        const review = {
            ...input,
            weightedScore,
            reviewedAt: new Date().toISOString()
        };
        const existingIndex = evaluation.reviews.findIndex((r) => r.reviewerId === input.reviewerId);
        const isNewReviewer = existingIndex < 0;
        if (isNewReviewer) {
            evaluation.reviews.push(review);
            this.evaluationsPerReviewer.set(input.reviewerId, (this.evaluationsPerReviewer.get(input.reviewerId) ?? 0) + 1);
        }
        else {
            evaluation.reviews[existingIndex] = review;
        }
        const criterionAverages = (0, engine_1.averageCriteria)(evaluation.reviews.map((r) => r.scores));
        const aggregatedScore = (0, engine_1.computeWeightedScore)(criterionAverages, this.weights);
        const reviewVariance = (0, engine_1.variance)(evaluation.reviews.map((r) => r.weightedScore));
        evaluation.aggregated = {
            criterionAverages,
            aggregatedScore,
            variance: reviewVariance,
            reviewCount: evaluation.reviews.length
        };
        if (!evaluation.completedAt) {
            evaluation.completedAt = new Date().toISOString();
        }
        evaluation.status = "completed";
        evaluation.updatedAt = new Date().toISOString();
        this.evaluations.set(evaluation.id, evaluation);
        return evaluation;
    }
    applyAction(evaluationId, action) {
        const evaluation = this.evaluations.get(evaluationId);
        if (!evaluation) {
            throw new Error("Evaluation not found.");
        }
        const actionToStatus = {
            shortlist: "shortlisted",
            reject: "rejected",
            send_to_copywriter: "sent_to_copywriter"
        };
        evaluation.status = actionToStatus[action];
        evaluation.updatedAt = new Date().toISOString();
        this.evaluations.set(evaluation.id, evaluation);
        return evaluation;
    }
    metrics() {
        const completed = [...this.evaluations.values()].filter((e) => !!e.completedAt);
        const avgEvaluationTime = completed.length === 0
            ? 0
            : completed.reduce((acc, curr) => {
                const start = new Date(curr.createdAt).getTime();
                const end = new Date(curr.completedAt).getTime();
                return acc + (end - start);
            }, 0) /
                completed.length /
                1000;
        return {
            avg_evaluation_time: Number(avgEvaluationTime.toFixed(2)),
            correlation_with_success: null,
            evaluations_per_reviewer: Object.fromEntries(this.evaluationsPerReviewer.entries())
        };
    }
    prepopulate(grant) {
        const budgetRange = [grant.amountMin, grant.amountMax]
            .filter((v) => typeof v === "number")
            .join(" - ");
        const capacity = grant.organizationProfile?.capacityLevel ?? "unknown";
        const winRate = grant.organizationProfile?.historicalWinRate;
        return {
            grantTitle: grant.title,
            funder: grant.funder ?? "unknown",
            category: grant.category ?? "unclassified",
            geography: grant.geography ?? "unspecified",
            deadline: grant.deadline ?? "unspecified",
            budgetRange: budgetRange || "unspecified",
            organizationCapacity: capacity,
            keyStrengths: [
                ...(grant.organizationProfile?.focusAreas ?? []),
                ...(grant.tags ?? [])
            ].slice(0, 5),
            riskFlags: winRate !== undefined && winRate < 0.2
                ? ["low_historical_win_rate"]
                : [],
            notes: "Auto-prepopulated from discovered grant record"
        };
    }
}
exports.EvaluationService = EvaluationService;
