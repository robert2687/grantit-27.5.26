import type { AuditEntry, SettingKey } from "../types";

export class AuditLogger {
    private readonly entries: AuditEntry[] = [];

    record(input: Omit<AuditEntry, "id" | "when"> & { key?: SettingKey | "all" }): AuditEntry {
        const entry: AuditEntry = {
            id: `audit_${this.entries.length + 1}`,
            when: new Date().toISOString(),
            who: input.who,
            what: input.what,
            key: input.key,
            details: input.details
        };
        this.entries.push(entry);
        return entry;
    }

    list(): AuditEntry[] {
        return [...this.entries];
    }
}
