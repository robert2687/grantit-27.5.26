import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("settings.updated events", () => {
    it("emits an update event when admin changes settings", async () => {
        const { app, eventBus } = createApp();
        const events: Array<{ changedBy: string; keys: string[] }> = [];

        eventBus.subscribe("settings.updated", (payload) => {
            events.push({ changedBy: payload.changedBy, keys: payload.keys as string[] });
        });

        const response = await request(app)
            .put("/settings")
            .set("x-user-id", "admin-1")
            .set("x-roles", "admin")
            .set("x-2fa", "true")
            .send({ scan_frequency: "monthly" });

        expect(response.status).toBe(200);
        expect(response.body.scan_frequency).toBe("monthly");
        expect(events).toHaveLength(1);
        expect(events[0].changedBy).toBe("admin-1");
        expect(events[0].keys).toContain("scan_frequency");
    });

    it("blocks non-admin settings changes", async () => {
        const { app } = createApp();

        const response = await request(app)
            .put("/settings")
            .set("x-user-id", "viewer-1")
            .set("x-roles", "viewer")
            .set("x-2fa", "true")
            .send({ scan_frequency: "weekly" });

        expect(response.status).toBe(403);
    });
});
