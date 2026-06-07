import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("role enforcement", () => {
  it("blocks non-admin user from admin-only endpoint", async () => {
    const { app } = createApp();

    const response = await request(app)
      .post("/templates")
      .set("x-user-id", "u_viewer")
      .set("x-roles", "viewer")
      .set("x-2fa", "true")
      .send({ name: "T1", content: "Body", tags: [] });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("Missing permission");
  });

  it("requires 2FA for admin write actions", async () => {
    const { app } = createApp();

    const response = await request(app)
      .post("/templates")
      .set("x-user-id", "u_admin")
      .set("x-roles", "admin")
      .set("x-2fa", "false")
      .send({ name: "T1", content: "Body", tags: ["grant"] });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("2FA required");
  });

  it("allows admin with 2FA to create resources", async () => {
    const { app } = createApp();

    const response = await request(app)
      .post("/templates")
      .set("x-user-id", "u_admin")
      .set("x-roles", "admin")
      .set("x-2fa", "true")
      .send({ name: "Template", content: "proposal section", tags: ["donor"] });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.version).toBe(1);
  });
});