import type { VaultConfig } from "../types";

interface VaultEntry {
  value: string;
  createdAt: string;
}

export class PlaceholderVault {
  private readonly store = new Map<string, VaultEntry>();

  readonly config: VaultConfig = {
    provider: process.env.SECRETS_VAULT_PROVIDER ?? "placeholder-vault",
    pathPrefix: process.env.SECRETS_VAULT_PATH_PREFIX ?? "administration/integrations"
  };

  putSecret(key: string, rawValue: string): string {
    const path = `${this.config.pathPrefix}/${key}`;
    const value = Buffer.from(rawValue, "utf8").toString("base64");
    this.store.set(path, { value, createdAt: new Date().toISOString() });
    return path;
  }

  rotateSecret(key: string, rawValue: string): string {
    return this.putSecret(key, rawValue);
  }

  hasSecret(path: string): boolean {
    return this.store.has(path);
  }
}