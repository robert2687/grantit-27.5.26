import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import type { EventPayloads } from "../src/types";

describe("event flow integration", () => {
  it("subscribes to grant.discovered and publishes completion/shortlist events", async () => {
    const { app, eventBus } = createApp();

    const completedEvents: EventPayloads["evaluation.completed"][] = [];
    const shortlistedEvents: EventPayloads["evaluation.shortlisted"][] = [];

    eventBus.subscribe("evaluation.completed", (payload) => {
      completedEvents.push(payload);
    });
    eventBus.subscribe("evaluation.shortlisted", (payload) => {
      shortlistedEvents.push(payload);
    });

    await request(app).post("/events/grant.discovered").send({
      sourceGrantId: "grant-123",
      title: "Digital Access Grant",
      funder: "Example Foundation",
      category: "Education",
      deadline: new Date().toISOString(),
      amountMin: 10000,
      amountMax: 50000,
      organizationProfile: {
        capacityLevel: "medium",
        historicalWinRate: 0.35,
        focusAreas: ["education", "digital inclusion"]
      }
    });

    const listResponse = await request(app).get("/evaluations?status=pending_review");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.length).toBe(1);

    const evaluationId = listResponse.body[0].id as string;

    const reviewResponse = await request(app)
      .post(`/evaluations/${evaluationId}/reviews`)
      .send({
        reviewerId: "reviewer-a",
        comment: "Strong mission alignment",
        scores: {
          relevance: 0.9,
          capacity_fit: 0.8,
          success_probability: 0.7,
          budget_fit: 0.6
        }
      });

    expect(reviewResponse.status).toBe(200);
    expect(completedEvents.length).toBe(1);
    expect(completedEvents[0].evaluationId).toBe(evaluationId);

    const shortlistResponse = await request(app)
      .post(`/evaluations/${evaluationId}/actions`)
      .send({ action: "shortlist" });

    expect(shortlistResponse.status).toBe(200);
    expect(shortlistedEvents.length).toBe(1);
    expect(shortlistedEvents[0].evaluationId).toBe(evaluationId);
  });
});