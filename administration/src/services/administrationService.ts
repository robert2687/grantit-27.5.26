import { defaultRolePermissions } from "../security/rbac";
import { PlaceholderVault } from "../security/vault";
import type {
  Integration,
  MetricsSnapshot,
  MinimalUser,
  Role,
  RoleName,
  Template,
  User
} from "../types";

export class AdministrationService {
  private readonly users = new Map<string, User>();
  private readonly roles = new Map<string, Role>();
  private readonly templates = new Map<string, Template>();
  private readonly integrations = new Map<string, Integration>();
  private failedLoginAttempts = 0;

  constructor(private readonly vault: PlaceholderVault) {
    this.seedRoles();
  }

  private seedRoles(): void {
    const now = new Date().toISOString();
    const definitions = defaultRolePermissions();
    (Object.keys(definitions) as RoleName[]).forEach((name) => {
      const role: Role = {
        id: `role_${name}`,
        name,
        permissions: definitions[name],
        createdAt: now,
        updatedAt: now
      };
      this.roles.set(role.id, role);
    });
  }

  listRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  createRole(input: Pick<Role, "name" | "permissions">): Role {
    const now = new Date().toISOString();
    const role: Role = {
      id: `role_custom_${this.roles.size + 1}`,
      name: input.name,
      permissions: input.permissions,
      createdAt: now,
      updatedAt: now
    };
    this.roles.set(role.id, role);
    return role;
  }

  updateRole(id: string, input: Partial<Pick<Role, "permissions">>): Role {
    const existing = this.roles.get(id);
    if (!existing) {
      throw new Error("Role not found");
    }
    const updated: Role = {
      ...existing,
      permissions: input.permissions ?? existing.permissions,
      updatedAt: new Date().toISOString()
    };
    this.roles.set(id, updated);
    return updated;
  }

  deleteRole(id: string): void {
    if (!this.roles.delete(id)) {
      throw new Error("Role not found");
    }
  }

  getRoleById(id: string): Role | undefined {
    return this.roles.get(id);
  }

  private toMinimalUser(user: User): MinimalUser {
    const roleNames = user.roleIds
      .map((roleId) => this.roles.get(roleId)?.name)
      .filter((value): value is RoleName => Boolean(value));
    return {
      id: user.id,
      displayName: user.displayName,
      roles: roleNames,
      isActive: user.isActive
    };
  }

  listUsers(): MinimalUser[] {
    return Array.from(this.users.values()).map((user) => this.toMinimalUser(user));
  }

  getUser(id: string): MinimalUser | undefined {
    const user = this.users.get(id);
    return user ? this.toMinimalUser(user) : undefined;
  }

  createUser(input: Pick<User, "email" | "displayName" | "roleIds">): MinimalUser {
    const now = new Date().toISOString();
    const user: User = {
      id: `user_${this.users.size + 1}`,
      email: input.email,
      displayName: input.displayName,
      roleIds: input.roleIds,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      firstRoleAssignedAt: input.roleIds.length ? now : undefined
    };
    this.users.set(user.id, user);
    return this.toMinimalUser(user);
  }

  updateUser(
    id: string,
    input: Partial<Pick<User, "displayName" | "roleIds" | "isActive">>
  ): { user: MinimalUser; roleChanged: boolean } {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error("User not found");
    }

    const previousRoles = existing.roleIds.join(",");
    const nextRoles = input.roleIds ?? existing.roleIds;
    const firstRoleAssignedAt =
      existing.firstRoleAssignedAt ?? (nextRoles.length ? new Date().toISOString() : undefined);

    const updated: User = {
      ...existing,
      displayName: input.displayName ?? existing.displayName,
      roleIds: nextRoles,
      isActive: input.isActive ?? existing.isActive,
      firstRoleAssignedAt,
      updatedAt: new Date().toISOString()
    };
    this.users.set(id, updated);

    return {
      user: this.toMinimalUser(updated),
      roleChanged: previousRoles !== nextRoles.join(",")
    };
  }

  deleteUser(id: string): void {
    if (!this.users.delete(id)) {
      throw new Error("User not found");
    }
  }

  listTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  createTemplate(input: Pick<Template, "name" | "content" | "tags">): Template {
    const now = new Date().toISOString();
    const template: Template = {
      id: `tpl_${this.templates.size + 1}`,
      name: input.name,
      content: input.content,
      tags: input.tags,
      version: 1,
      createdAt: now,
      updatedAt: now
    };
    this.templates.set(template.id, template);
    return template;
  }

  updateTemplate(
    id: string,
    input: Partial<Pick<Template, "name" | "content" | "tags">>
  ): Template {
    const existing = this.templates.get(id);
    if (!existing) {
      throw new Error("Template not found");
    }
    const updated: Template = {
      ...existing,
      name: input.name ?? existing.name,
      content: input.content ?? existing.content,
      tags: input.tags ?? existing.tags,
      version: existing.version + 1,
      updatedAt: new Date().toISOString()
    };
    this.templates.set(id, updated);
    return updated;
  }

  deleteTemplate(id: string): void {
    if (!this.templates.delete(id)) {
      throw new Error("Template not found");
    }
  }

  listIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  createIntegration(input: { name: string; baseUrl: string; apiKey: string }): Integration {
    const now = new Date().toISOString();
    const id = `int_${this.integrations.size + 1}`;
    const apiKeyRef = this.vault.putSecret(id, input.apiKey);

    const integration: Integration = {
      id,
      name: input.name,
      baseUrl: input.baseUrl,
      apiKeyRef,
      rotatedAt: now,
      createdAt: now,
      updatedAt: now,
      testStatus: "untested"
    };
    this.integrations.set(id, integration);
    return integration;
  }

  updateIntegration(id: string, input: Partial<Pick<Integration, "name" | "baseUrl">>): Integration {
    const existing = this.integrations.get(id);
    if (!existing) {
      throw new Error("Integration not found");
    }
    const updated: Integration = {
      ...existing,
      name: input.name ?? existing.name,
      baseUrl: input.baseUrl ?? existing.baseUrl,
      updatedAt: new Date().toISOString()
    };
    this.integrations.set(id, updated);
    return updated;
  }

  rotateIntegrationKey(id: string, newApiKey: string): Integration {
    const existing = this.integrations.get(id);
    if (!existing) {
      throw new Error("Integration not found");
    }
    const apiKeyRef = this.vault.rotateSecret(id, newApiKey);
    const updated: Integration = {
      ...existing,
      apiKeyRef,
      rotatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.integrations.set(id, updated);
    return updated;
  }

  testIntegrationConnection(id: string): Integration {
    const existing = this.integrations.get(id);
    if (!existing) {
      throw new Error("Integration not found");
    }
    const canConnect = /^https?:\/\//i.test(existing.baseUrl) && this.vault.hasSecret(existing.apiKeyRef);
    const updated: Integration = {
      ...existing,
      testStatus: canConnect ? "ok" : "failed",
      updatedAt: new Date().toISOString()
    };
    this.integrations.set(id, updated);
    return updated;
  }

  deleteIntegration(id: string): void {
    if (!this.integrations.delete(id)) {
      throw new Error("Integration not found");
    }
  }

  recordFailedLoginAttempt(): number {
    this.failedLoginAttempts += 1;
    return this.failedLoginAttempts;
  }

  metrics(): MetricsSnapshot {
    const onboardingValues = Array.from(this.users.values())
      .filter((user) => user.firstRoleAssignedAt)
      .map((user) => {
        const start = new Date(user.createdAt).getTime();
        const end = new Date(user.firstRoleAssignedAt as string).getTime();
        return Math.max(end - start, 0);
      });

    const user_onboarding_time = onboardingValues.length
      ? onboardingValues.reduce((sum, value) => sum + value, 0) / onboardingValues.length
      : 0;

    return {
      user_onboarding_time,
      active_users: Array.from(this.users.values()).filter((user) => user.isActive).length,
      failed_login_attempts: this.failedLoginAttempts
    };
  }

  vaultConfig() {
    return this.vault.config;
  }
}