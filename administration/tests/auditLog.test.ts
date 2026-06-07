import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const adminHeaders = {
  "x-user-id": "u_admin_1",
  "x-roles": "admin",
  "x-2fa": "true"
};

describe("audit log", () => {
  it("records template edits and role changes", async () => {
    const { app } = createApp();

    const templateCreate = await request(app)
      .post("/templates")
      .set(adminHeaders)
      .send({ name: "Base", content: "v1", tags: [] });
    expect(templateCreate.status).toBe(201);

    const templateId = templateCreate.body.id as string;

    const templateUpdate = await request(app)
      .put(`/templates/${templateId}`)
      .set(adminHeaders)
      .send({ content: "v2" });
    expect(templateUpdate.status).toBe(200);

    const userCreate = await request(app)
      .post("/users")
      .set(adminHeaders)
      .send({
        email: "eva@example.org",
        displayName: "Eva",
        roleIds: ["role_viewer"]
      });
    expect(userCreate.status).toBe(201);

    const userId = userCreate.body.id as string;
    const userUpdate = await request(app)
      .put(`/users/${userId}`)
      .set(adminHeaders)
      .send({ roleIds: ["role_admin"] });
    expect(userUpdate.status).toBe(200);

    const logs = await request(app).get("/audit-logs").set(adminHeaders);
    expect(logs.status).toBe(200);

    const actions = (logs.body as Array<{ what: string }>).map((entry) => entry.what);
    expect(actions).toContain("template.updated");
    expect(actions).toContain("role.changed");
  });
});