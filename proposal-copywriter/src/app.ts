import express from "express";
import { InMemoryEventBus } from "./events/eventBus";
import { DraftService } from "./services/draftService";
import type { CreateDraftInput, ReviseDraftInput, UserRole } from "./types";

export interface AppDeps {
    eventBus?: InMemoryEventBus;
    service?: DraftService;
}

function getRole(req: express.Request): UserRole {
    const role = String(req.header("x-role") ?? "viewer").toLowerCase();
    if (["viewer", "reviewer", "editor", "admin"].includes(role)) {
        return role as UserRole;
    }
    return "viewer";
}

function subscribeToShortlisted(eventBus: InMemoryEventBus, service: DraftService): void {
    eventBus.subscribe("evaluation.shortlisted", (payload) => {
        service.markShortlisted(payload.evaluationId, payload.grantRecord);
    });
}

export function createApp(deps?: AppDeps) {
    const app = express();
    app.use(express.json());

    const eventBus = deps?.eventBus ?? new InMemoryEventBus();
    const service = deps?.service ?? new DraftService();
    subscribeToShortlisted(eventBus, service);

    app.post("/drafts", (req, res) => {
        try {
            const draft = service.create(req.body as CreateDraftInput);
            eventBus.publish("draft.created", {
                draftId: draft.id,
                evaluationId: draft.evaluationId,
                version: draft.currentVersion
            });
            return res.status(201).json(draft);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    });

    app.get("/drafts/:id", (req, res) => {
        const draft = service.getById(req.params.id);
        if (!draft) {
            return res.status(404).json({ message: "Draft not found" });
        }
        return res.json(draft);
    });

    app.put("/drafts/:id/revise", (req, res) => {
        try {
            const role = getRole(req);
            const revised = service.revise(req.params.id, req.body as ReviseDraftInput, role);
            eventBus.publish("draft.updated", {
                draftId: revised.id,
                evaluationId: revised.evaluationId,
                version: revised.currentVersion,
                reviewerId: req.body.reviewer_id
            });
            return res.json(revised);
        } catch (error) {
            const message = (error as Error).message;
            const status = /not permitted/i.test(message) ? 403 : 400;
            return res.status(status).json({ message });
        }
    });

    app.get("/drafts/:id/export", (req, res) => {
        try {
            const format = String(req.query.format ?? "json").toLowerCase();
            if (format !== "text" && format !== "json") {
                return res.status(400).json({ message: "format must be text or json" });
            }

            const payload = service.exportDraft(req.params.id, format);
            if (format === "text") {
                res.type("text/plain");
            }
            return res.send(payload);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    });

    app.post("/events/evaluation.shortlisted", (req, res) => {
        eventBus.publish("evaluation.shortlisted", req.body);
        return res.status(202).json({ accepted: true });
    });

    return { app, service, eventBus };
}
