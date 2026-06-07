import type { SettingsModel, SettingsUpdateInput, SettingKey } from "../types";

const DEFAULT_SETTINGS: SettingsModel = {
    scan_frequency: "daily",
    source_whitelist: ["grant.gov"],
    source_blacklist: [],
    notification_thresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8
    },
    backup_schedule: {
        frequency: "daily",
        time: "02:00"
    },
    retention_policy: {
        days: 365,
        archiveAfterDays: 180
    }
};

const VALID_SCAN_FREQUENCIES = ["hourly", "daily", "weekly", "monthly"] as const;

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTime(value: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function dedupeStrings(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function validateAndNormalize(input: SettingsUpdateInput): SettingsUpdateInput {
    const normalized: SettingsUpdateInput = {};

    if (input.scan_frequency !== undefined) {
        if (!VALID_SCAN_FREQUENCIES.includes(input.scan_frequency as (typeof VALID_SCAN_FREQUENCIES)[number])) {
            throw new Error("Invalid scan_frequency");
        }
        normalized.scan_frequency = input.scan_frequency;
    }

    if (input.source_whitelist !== undefined) {
        if (!Array.isArray(input.source_whitelist) || input.source_whitelist.some((item) => typeof item !== "string")) {
            throw new Error("Invalid source_whitelist");
        }
        normalized.source_whitelist = dedupeStrings(input.source_whitelist);
    }

    if (input.source_blacklist !== undefined) {
        if (!Array.isArray(input.source_blacklist) || input.source_blacklist.some((item) => typeof item !== "string")) {
            throw new Error("Invalid source_blacklist");
        }
        normalized.source_blacklist = dedupeStrings(input.source_blacklist);
    }

    if (input.notification_thresholds !== undefined) {
        const thresholds = input.notification_thresholds;
        if (!isObject(thresholds)) {
            throw new Error("Invalid notification_thresholds");
        }
        const values = [thresholds.low, thresholds.medium, thresholds.high];
        if (values.some((value) => typeof value !== "number" || value < 0 || value > 1)) {
            throw new Error("Invalid notification_thresholds");
        }
        if (!((thresholds.low as number) <= (thresholds.medium as number) && (thresholds.medium as number) <= (thresholds.high as number))) {
            throw new Error("notification_thresholds must be ordered low <= medium <= high");
        }
        normalized.notification_thresholds = thresholds as SettingsModel["notification_thresholds"];
    }

    if (input.backup_schedule !== undefined) {
        const schedule = input.backup_schedule;
        if (!isObject(schedule)) {
            throw new Error("Invalid backup_schedule");
        }
        if (!(["daily", "weekly", "monthly"] as const).includes(schedule.frequency as "daily" | "weekly" | "monthly")) {
            throw new Error("Invalid backup_schedule frequency");
        }
        if (typeof schedule.time !== "string" || !isValidTime(schedule.time)) {
            throw new Error("Invalid backup_schedule time");
        }
        normalized.backup_schedule = schedule as SettingsModel["backup_schedule"];
    }

    if (input.retention_policy !== undefined) {
        const retention = input.retention_policy;
        if (!isObject(retention)) {
            throw new Error("Invalid retention_policy");
        }
        if (typeof retention.days !== "number" || retention.days < 1) {
            throw new Error("Invalid retention_policy days");
        }
        if (typeof retention.archiveAfterDays !== "number" || retention.archiveAfterDays < 0) {
            throw new Error("Invalid retention_policy archiveAfterDays");
        }
        if (retention.archiveAfterDays > retention.days) {
            throw new Error("retention_policy archiveAfterDays cannot exceed days");
        }
        normalized.retention_policy = retention as SettingsModel["retention_policy"];
    }

    return normalized;
}

export class SettingsService {
    private settings: SettingsModel = { ...DEFAULT_SETTINGS };

    getAll(): SettingsModel {
        return { ...this.settings };
    }

    get(key: SettingKey): SettingsModel[SettingKey] {
        return this.settings[key];
    }

    update(input: SettingsUpdateInput): { before: Partial<SettingsModel>; after: Partial<SettingsModel>; keys: SettingKey[] } {
        const normalized = validateAndNormalize(input);
        const before: Partial<SettingsModel> = {};
        const after: Partial<SettingsModel> = {};
        const keys: SettingKey[] = [];

        if (normalized.scan_frequency !== undefined) {
            keys.push("scan_frequency");
            before.scan_frequency = this.settings.scan_frequency;
            this.settings.scan_frequency = normalized.scan_frequency;
            after.scan_frequency = this.settings.scan_frequency;
        }

        if (normalized.source_whitelist !== undefined) {
            keys.push("source_whitelist");
            before.source_whitelist = this.settings.source_whitelist;
            this.settings.source_whitelist = normalized.source_whitelist;
            after.source_whitelist = this.settings.source_whitelist;
        }

        if (normalized.source_blacklist !== undefined) {
            keys.push("source_blacklist");
            before.source_blacklist = this.settings.source_blacklist;
            this.settings.source_blacklist = normalized.source_blacklist;
            after.source_blacklist = this.settings.source_blacklist;
        }

        if (normalized.notification_thresholds !== undefined) {
            keys.push("notification_thresholds");
            before.notification_thresholds = this.settings.notification_thresholds;
            this.settings.notification_thresholds = normalized.notification_thresholds;
            after.notification_thresholds = this.settings.notification_thresholds;
        }

        if (normalized.backup_schedule !== undefined) {
            keys.push("backup_schedule");
            before.backup_schedule = this.settings.backup_schedule;
            this.settings.backup_schedule = normalized.backup_schedule;
            after.backup_schedule = this.settings.backup_schedule;
        }

        if (normalized.retention_policy !== undefined) {
            keys.push("retention_policy");
            before.retention_policy = this.settings.retention_policy;
            this.settings.retention_policy = normalized.retention_policy;
            after.retention_policy = this.settings.retention_policy;
        }

        return { before, after, keys };
    }

    exportSettings(): SettingsModel {
        return this.getAll();
    }

    importSettings(input: unknown): { before: Partial<SettingsModel>; after: Partial<SettingsModel>; keys: SettingKey[] } {
        if (!isObject(input)) {
            throw new Error("Settings import must be an object");
        }

        return this.update(input as SettingsUpdateInput);
    }

    defaults(): SettingsModel {
        return { ...DEFAULT_SETTINGS };
    }
}
