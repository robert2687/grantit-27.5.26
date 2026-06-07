import { describe, expect, it } from "vitest";
import { SettingsService } from "../src/services/settingsService";

describe("settings validation", () => {
    it("keeps safe defaults on startup", () => {
        const service = new SettingsService();
        expect(service.defaults()).toEqual(service.getAll());
    });

    it("rejects invalid scan frequency", () => {
        const service = new SettingsService();
        expect(() => service.update({ scan_frequency: "never" as never })).toThrow(/scan_frequency/i);
    });

    it("rejects malformed retention policy", () => {
        const service = new SettingsService();
        expect(() =>
            service.update({
                retention_policy: { days: 7, archiveAfterDays: 10 }
            })
        ).toThrow(/archiveAfterDays/i);
    });

    it("accepts valid updates", () => {
        const service = new SettingsService();
        const updated = service.update({
            scan_frequency: "weekly",
            source_whitelist: ["example.org", "example.org"],
            notification_thresholds: { low: 0.2, medium: 0.5, high: 0.9 }
        });

        expect(updated.keys).toContain("scan_frequency");
        expect(service.getAll().scan_frequency).toBe("weekly");
        expect(service.getAll().source_whitelist).toEqual(["example.org"]);
    });
});
