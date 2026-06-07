export type RoleName = "admin" | "evaluator" | "copywriter" | "reviewer" | "viewer";

export type Permission =
  | "users.read"
  | "users.write"
  | "roles.read"
  | "roles.write"
  | "templates.read"
  | "templates.write"
  | "integrations.read"
  | "integrations.write"
  | "integrations.rotate"
  | "audit.read"
  | "metrics.read";

export interface Role {
  id: string;
  name: RoleName;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  roleIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  firstRoleAssignedAt?: string;
}

export interface MinimalUser {
  id: string;
  displayName: string;
  roles: RoleName[];
  isActive: boolean;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Integration {
  id: string;
  name: string;
  baseUrl: string;
  apiKeyRef: string;
  rotatedAt: string;
  createdAt: string;
  updatedAt: string;
  testStatus: "untested" | "ok" | "failed";
}

export interface AuditEntry {
  id: string;
  who: string;
  what: string;
  when: string;
  targetType: "role" | "template" | "integration" | "user";
  targetId: string;
  details?: Record<string, unknown>;
}

export interface MetricsSnapshot {
  user_onboarding_time: number;
  active_users: number;
  failed_login_attempts: number;
}

export interface JwtClaims {
  sub: string;
  roles: RoleName[];
  permissions?: Permission[];
  two_factor?: boolean;
}

export interface VaultConfig {
  provider: string;
  pathPrefix: string;
}