# evaluation-workspace

TypeScript service scaffold for grant evaluation workflows with weighted scoring, multi-review aggregation, event integration, admin configuration, and metrics.

## Features

- REST API
  - `POST /evaluate` (ingests normalized grant record and auto-prepopulates evaluation form)
  - `GET /evaluations/:id`
  - `GET /evaluations?status=`
  - `POST /evaluations/:id/reviews` (multi-review submission)
  - `POST /evaluations/:id/actions` (`shortlist`, `reject`, `send_to_copywriter`)
- Scoring engine with configurable weighted criteria:
  - `relevance`
  - `capacity_fit`
  - `success_probability`
  - `budget_fit`
- Multi-review aggregation:
  - aggregated score
  - per-criterion averages
  - score variance
- Event integration:
  - subscribes to `grant.discovered`
  - publishes `evaluation.completed`
  - publishes `evaluation.shortlisted`
- UI contracts:
  - `GET /schemas/evaluation-form`
  - `GET /schemas/review-comment`
- Admin API:
  - `GET /admin/config`
  - `PUT /admin/weights`
  - `PUT /admin/template`
- Metrics:
  - `GET /metrics`
  - fields: `avg_evaluation_time`, `correlation_with_success` (placeholder), `evaluations_per_reviewer`

## Run

```bash
npm install
npm run dev
```

Service runs on `http://localhost:8085` by default.

## Test

```bash
npm test
```

Includes:

- scoring unit tests
- integration test for event flow (`grant.discovered` -> review -> shortlist)
