"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const eventBus_1 = require("./events/eventBus");
const evaluationForm_schema_json_1 = __importDefault(require("./schemas/evaluationForm.schema.json"));
const reviewComment_schema_json_1 = __importDefault(require("./schemas/reviewComment.schema.json"));
const evaluationService_1 = require("./services/evaluationService");
function isValidAction(action) {
    return ["shortlist", "reject", "send_to_copywriter"].includes(action);
}
function subscribeToGrantDiscovered(eventBus, service) {
    eventBus.subscribe("grant.discovered", ({ grantRecord }) => {
        service.createFromGrant(grantRecord);
    });
}
function createApp(deps) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const eventBus = deps?.eventBus ?? new eventBus_1.InMemoryEventBus();
    const service = deps?.service ?? new evaluationService_1.EvaluationService();
    subscribeToGrantDiscovered(eventBus, service);
    app.post("/evaluate", (req, res) => {
        try {
            const evaluation = service.createFromGrant(req.body);
            return res.status(201).json(evaluation);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
    app.get("/evaluations/:id", (req, res) => {
        const evaluation = service.getById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: "Evaluation not found" });
        }
        return res.json(evaluation);
    });
    app.get("/evaluations", (req, res) => {
        const status = req.query.status;
        const evaluations = service.list(status);
        return res.json(evaluations);
    });
    app.post("/evaluations/:id/reviews", (req, res) => {
        try {
            const review = req.body;
            const evaluation = service.submitReview(req.params.id, review);
            if (evaluation.aggregated) {
                const payload = {
                    evaluationId: evaluation.id,
                    aggregatedScore: evaluation.aggregated.aggregatedScore,
                    variance: evaluation.aggregated.variance,
                    reviewCount: evaluation.aggregated.reviewCount
                };
                eventBus.publish("evaluation.completed", payload);
            }
            return res.json(evaluation);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
    app.post("/evaluations/:id/actions", (req, res) => {
        try {
            const action = String(req.body.action ?? "");
            if (!isValidAction(action)) {
                return res.status(400).json({ message: "Invalid action" });
            }
            const evaluation = service.applyAction(req.params.id, action);
            if (action === "shortlist") {
                eventBus.publish("evaluation.shortlisted", {
                    evaluationId: evaluation.id,
                    aggregatedScore: evaluation.aggregated?.aggregatedScore ?? null
                });
            }
            return res.json(evaluation);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
    app.post("/events/grant.discovered", (req, res) => {
        eventBus.publish("grant.discovered", { grantRecord: req.body });
        return res.status(202).json({ accepted: true });
    });
    app.get("/admin/config", (_req, res) => {
        return res.json(service.getConfig());
    });
    app.put("/admin/weights", (req, res) => {
        try {
            const weights = service.updateWeights(req.body);
            return res.json({ weights });
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
    app.put("/admin/template", (req, res) => {
        try {
            const template = service.updateTemplate(req.body);
            return res.json({ template });
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
    app.get("/metrics", (_req, res) => {
        return res.json(service.metrics());
    });
    app.get("/schemas/evaluation-form", (_req, res) => {
        return res.json(evaluationForm_schema_json_1.default);
    });
    app.get("/schemas/review-comment", (_req, res) => {
        return res.json(reviewComment_schema_json_1.default);
    });
    return { app, eventBus, service };
}
