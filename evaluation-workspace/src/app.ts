import express from "express";
import { InMemoryEventBus } from "./events/eventBus";
import evaluationFormSchema from "./schemas/evaluationForm.schema.json";
import reviewCommentSchema from "./schemas/reviewComment.schema.json";
import { EvaluationService } from "./services/evaluationService";
import type {
  EvaluationStatus,
  EventPayloads,
  ReviewInput,
  WeightConfig,
  WorkflowAction
} from "./types";

export interface AppDeps {
  eventBus?: InMemoryEventBus;
  service?: EvaluationService;
}

function isValidAction(action: string): action is WorkflowAction {
  return ["shortlist", "reject", "send_to_copywriter"].includes(action);
}

function subscribeToGrantDiscovered(
  eventBus: InMemoryEventBus,
  service: EvaluationService
): void {
  eventBus.subscribe("grant.discovered", ({ grantRecord }) => {
    service.createFromGrant(grantRecord);
  });
}

export function createApp(deps?: AppDeps) {
  const app = express();
  app.use(express.json());

  const eventBus = deps?.eventBus ?? new InMemoryEventBus();
  const service = deps?.service ?? new EvaluationService();
  subscribeToGrantDiscovered(eventBus, service);

  app.post("/evaluate", (req, res) => {
    try {
      const evaluation = service.createFromGrant(req.body);
      return res.status(201).json(evaluation);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
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
    const status = req.query.status as EvaluationStatus | undefined;
    const evaluations = service.list(status);
    return res.json(evaluations);
  });

  app.post("/evaluations/:id/reviews", (req, res) => {
    try {
      const review = req.body as ReviewInput;
      const evaluation = service.submitReview(req.params.id, review);

      if (evaluation.aggregated) {
        const payload: EventPayloads["evaluation.completed"] = {
          evaluationId: evaluation.id,
          aggregatedScore: evaluation.aggregated.aggregatedScore,
          variance: evaluation.aggregated.variance,
          reviewCount: evaluation.aggregated.reviewCount
        };
        eventBus.publish("evaluation.completed", payload);
      }

      return res.json(evaluation);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
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
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
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
      const weights = service.updateWeights(req.body as WeightConfig);
      return res.json({ weights });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/admin/template", (req, res) => {
    try {
      const template = service.updateTemplate(req.body);
      return res.json({ template });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/metrics", (_req, res) => {
    return res.json(service.metrics());
  });

  app.get("/schemas/evaluation-form", (_req, res) => {
    return res.json(evaluationFormSchema);
  });

  app.get("/schemas/review-comment", (_req, res) => {
    return res.json(reviewCommentSchema);
  });

  return { app, eventBus, service };
}