export type RoleName = "admin" | "evaluator" | "copywriter" | "reviewer" | "viewer";

export type SettingKey =
    | "scan_frequency"
    | "source_whitelist"
    | "source_blacklist"
    | "notification_thresholds"
    | "backup_schedule"
    | "retention_policy";

export interface SettingsModel {
    scan_frequency: string;
    source_whitelist: string[];
    source_blacklist: string[];
    notification_thresholds: {
        low: number;
        medium: number;
        high: number;
    };
    backup_schedule: {
        frequency: "daily" | "weekly" | "monthly";
        time: string;
    };
    retention_policy: {
        days: number;
        archiveAfterDays: number;
    };
}

export interface SettingsUpdateInput {
    scan_frequency?: string;
    source_whitelist?: string[];
    source_blacklist?: string[];
    notification_thresholds?: {
        low: number;
        medium: number;
        high: number;
    };
    backup_schedule?: {
        frequency: "daily" | "weekly" | "monthly";
        time: string;
    };
    retention_policy?: {
        days: number;
        archiveAfterDays: number;
    };
}

export interface AuditEntry {
    id: string;
    who: string;
    what: string;
    when: string;
    key?: SettingKey | "all";
    details?: Record<string, unknown>;
}

export interface EventPayloads {
    "settings.updated": {
        changedBy: string;
        keys: (SettingKey | "all")[];
        before: Partial<SettingsModel>;
        after: Partial<SettingsModel>;
    };
}

export interface JwtClaims {
    sub: string;
    roles: RoleName[];
    two_factor?: boolean;
}
