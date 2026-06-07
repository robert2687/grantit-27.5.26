import express from "express";
import minimalUserSchema from "./schemas/minimalUser.schema.json";
import { AuditLogger } from "./audit/auditLogger";
import { authMiddleware, requireAdminWith2FA, requirePermission } from "./security/rbac";
import { PlaceholderVault } from "./security/vault";
import { AdministrationService } from "./services/administrationService";

export interface AppDeps {
  service?: AdministrationService;
  auditLogger?: AuditLogger;
}

export function createApp(deps?: AppDeps) {
  const app = express();
  app.use(express.json());

  const vault = new PlaceholderVault();
  const service = deps?.service ?? new AdministrationService(vault);
  const audit = deps?.auditLogger ?? new AuditLogger();

  app.use(authMiddleware(() => service.listRoles()));

  app.get("/users", requirePermission("users.read"), (_req, res) => {
    return res.json(service.listUsers());
  });

  app.get("/users/:id", requirePermission("users.read"), (req, res) => {
    const user = service.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  });

  app.post("/users", requirePermission("users.write"), requireAdminWith2FA, (req, res) => {
    try {
      const user = service.createUser(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/users/:id", requirePermission("users.write"), requireAdminWith2FA, (req, res) => {
    try {
      const updated = service.updateUser(req.params.id, req.body);
      if (updated.roleChanged) {
        audit.record({
          who: req.auth?.userId ?? "unknown",
          what: "role.changed",
          targetType: "user",
          targetId: req.params.id,
          details: { roleIds: req.body.roleIds ?? [] }
        });
      }
      return res.json(updated.user);
    } catch (error) {
      const message = (error as Error).message;
      const status = /not found/i.test(message) ? 404 : 400;
      return res.status(status).json({ message });
    }
  });

  app.delete("/users/:id", requirePermission("users.write"), requireAdminWith2FA, (req, res) => {
    try {
      service.deleteUser(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ message: (error as Error).message });
    }
  });

  app.get("/roles", requirePermission("roles.read"), (_req, res) => {
    return res.json(service.listRoles());
  });

  app.get("/roles/:id", requirePermission("roles.read"), (req, res) => {
    const role = service.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.json(role);
  });

  app.post("/roles", requirePermission("roles.write"), requireAdminWith2FA, (req, res) => {
    try {
      const role = service.createRole(req.body);
      audit.record({
        who: req.auth?.userId ?? "unknown",
        what: "role.created",
        targetType: "role",
        targetId: role.id
      });
      return res.status(201).json(role);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/roles/:id", requirePermission("roles.write"), requireAdminWith2FA, (req, res) => {
    try {
      const role = service.updateRole(req.params.id, req.body);
      audit.record({
        who: req.auth?.userId ?? "unknown",
        what: "role.updated",
        targetType: "role",
        targetId: role.id
      });
      return res.json(role);
    } catch (error) {
      const message = (error as Error).message;
      const status = /not found/i.test(message) ? 404 : 400;
      return res.status(status).json({ message });
    }
  });

  app.delete("/roles/:id", requirePermission("roles.write"), requireAdminWith2FA, (req, res) => {
    try {
      service.deleteRole(req.params.id);
      audit.record({
        who: req.auth?.userId ?? "unknown",
        what: "role.deleted",
        targetType: "role",
        targetId: req.params.id
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ message: (error as Error).message });
    }
  });

  app.get("/templates", requirePermission("templates.read"), (_req, res) => {
    return res.json(service.listTemplates());
  });

  app.get("/templates/:id", requirePermission("templates.read"), (req, res) => {
    const template = service.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    return res.json(template);
  });

  app.post("/templates", requirePermission("templates.write"), requireAdminWith2FA, (req, res) => {
    try {
      const template = service.createTemplate(req.body);
      audit.record({
        who: req.auth?.userId ?? "unknown",
        what: "template.created",
        targetType: "template",
        targetId: template.id
      });
      return res.status(201).json(template);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/templates/:id", requirePermission("templates.write"), requireAdminWith2FA, (req, res) => {
    try {
      const template = service.updateTemplate(req.params.id, req.body);
      audit.record({
        who: req.auth?.userId ?? "unknown",
        what: "template.updated",
        targetType: "template",
        targetId: template.id
      });
      return res.json(template);
    } catch (error) {
      const message = (error as Error).message;
      const status = /not found/i.test(message) ? 404 : 400;
      return res.status(status).json({ message });
    }
  });

  app.delete("/templates/:id", requirePermission("templates.write"), requireAdminWith2FA, (req, res) => {
    try {
      service.deleteTemplate(req.params.id);
      audit.record({
        who: req.auth?.userId ?? "unknown",
        what: "template.deleted",
        targetType: "template",
        targetId: req.params.id
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ message: (error as Error).message });
    }
  });

  app.get("/integrations", requirePermission("integrations.read"), (_req, res) => {
    return res.json(service.listIntegrations());
  });

  app.get("/integrations/:id", requirePermission("integrations.read"), (req, res) => {
    const integration = service.getIntegration(req.params.id);
    if (!integration) {
      return res.status(404).json({ message: "Integration not found" });
    }
    return res.json(integration);
  });

  app.post(
    "/integrations",
    requirePermission("integrations.write"),
    requireAdminWith2FA,
    (req, res) => {
      try {
        const integration = service.createIntegration(req.body);
        audit.record({
          who: req.auth?.userId ?? "unknown",
          what: "integration.created",
          targetType: "integration",
          targetId: integration.id
        });
        return res.status(201).json(integration);
      } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
      }
    }
  );

  app.put(
    "/integrations/:id",
    requirePermission("integrations.write"),
    requireAdminWith2FA,
    (req, res) => {
      try {
        const integration = service.updateIntegration(req.params.id, req.body);
        return res.json(integration);
      } catch (error) {
        const message = (error as Error).message;
        const status = /not found/i.test(message) ? 404 : 400;
        return res.status(status).json({ message });
      }
    }
  );

  app.delete(
    "/integrations/:id",
    requirePermission("integrations.write"),
    requireAdminWith2FA,
    (req, res) => {
      try {
        service.deleteIntegration(req.params.id);
        return res.status(204).send();
      } catch (error) {
        return res.status(404).json({ message: (error as Error).message });
      }
    }
  );

  app.post(
    "/integrations/:id/rotate-key",
    requirePermission("integrations.rotate"),
    requireAdminWith2FA,
    (req, res) => {
      try {
        const integration = service.rotateIntegrationKey(req.params.id, String(req.body.apiKey ?? ""));
        audit.record({
          who: req.auth?.userId ?? "unknown",
          what: "integration.key_rotated",
          targetType: "integration",
          targetId: integration.id
        });
        return res.json(integration);
      } catch (error) {
        const message = (error as Error).message;
        const status = /not found/i.test(message) ? 404 : 400;
        return res.status(status).json({ message });
      }
    }
  );

  app.post(
    "/integrations/:id/test-connection",
    requirePermission("integrations.read"),
    requireAdminWith2FA,
    (req, res) => {
      try {
        const integration = service.testIntegrationConnection(req.params.id);
        return res.json({ id: integration.id, status: integration.testStatus });
      } catch (error) {
        const message = (error as Error).message;
        const status = /not found/i.test(message) ? 404 : 400;
        return res.status(status).json({ message });
      }
    }
  );

  app.get("/audit-logs", requirePermission("audit.read"), (_req, res) => {
    return res.json(audit.list());
  });

  app.post("/auth/failed-login", (_req, res) => {
    return res.json({ failed_login_attempts: service.recordFailedLoginAttempt() });
  });

  app.get("/metrics", requirePermission("metrics.read"), (_req, res) => {
    return res.json(service.metrics());
  });

  app.get("/admin/security-config", requirePermission("roles.write"), requireAdminWith2FA, (_req, res) => {
    return res.json({ secrets_vault: service.vaultConfig() });
  });

  app.get("/schemas/minimal-user", (_req, res) => {
    return res.json(minimalUserSchema);
  });

  return { app, service, audit };
}