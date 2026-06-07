import express from "express";
import settingsSchema from "./schemas/settings.schema.json";
import { AuditLogger } from "./audit/auditLogger";
import { InMemoryEventBus } from "./events/eventBus";
import { authMiddleware, requireAdmin } from "./security/auth";
import { SettingsService } from "./services/settingsService";

export interface AppDeps {
    service?: SettingsService;
    auditLogger?: AuditLogger;
    eventBus?: InMemoryEventBus;
}

export function createApp(deps?: AppDeps) {
    const app = express();
    app.use(express.json());

    const service = deps?.service ?? new SettingsService();
    const audit = deps?.auditLogger ?? new AuditLogger();
    const eventBus = deps?.eventBus ?? new InMemoryEventBus();

    app.use(authMiddleware);

    app.get("/settings", (_req, res) => {
        return res.json(service.getAll());
    });

    app.get("/settings/:key", (req, res) => {
        const key = req.params.key as keyof ReturnType<SettingsService["getAll"]>;
        const settings = service.getAll();
        if (!(key in settings)) {
            return res.status(404).json({ message: "Setting not found" });
        }
        return res.json({ key, value: settings[key] });
    });

    app.put("/settings", requireAdmin, (req, res) => {
        try {
            const result = service.update(req.body);
            audit.record({
                who: req.auth?.userId ?? "unknown",
                what: "settings.updated",
                key: "all",
                details: result
            });
            eventBus.publish("settings.updated", {
                changedBy: req.auth?.userId ?? "unknown",
                keys: result.keys.length ? result.keys : ["all"],
                before: result.before,
                after: result.after
            });
            return res.json(service.getAll());
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    });

    app.get("/settings/export", requireAdmin, (_req, res) => {
        return res.json(service.exportSettings());
    });

    app.post("/settings/import", requireAdmin, (req, res) => {
        try {
            const result = service.importSettings(req.body);
            audit.record({
                who: req.auth?.userId ?? "unknown",
                what: "settings.imported",
                key: "all",
                details: result
            });
            eventBus.publish("settings.updated", {
                changedBy: req.auth?.userId ?? "unknown",
                keys: result.keys.length ? result.keys : ["all"],
                before: result.before,
                after: result.after
            });
            return res.status(200).json(service.getAll());
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    });

    app.get("/audit-logs", requireAdmin, (_req, res) => {
        return res.json(audit.list());
    });

    app.get("/schemas/settings", (_req, res) => {
        return res.json(settingsSchema);
    });

    return { app, service, audit, eventBus };
}
