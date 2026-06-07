import type { AuditEntry } from "../types";

export class AuditLogger {
  private readonly entries: AuditEntry[] = [];

  record(entry: Omit<AuditEntry, "id" | "when">): AuditEntry {
    const full: AuditEntry = {
      id: `audit_${this.entries.length + 1}`,
      when: new Date().toISOString(),
      ...entry
    };
    this.entries.push(full);
    return full;
  }

  list(): AuditEntry[] {
    return [...this.entries];
  }
}