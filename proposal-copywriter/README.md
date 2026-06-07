# proposal-copywriter

TypeScript service that generates grant proposal drafts from shortlisted evaluations and donor guidelines.

## Features

- REST API
  - `POST /drafts`
  - `GET /drafts/:id`
  - `PUT /drafts/:id/revise`
  - `GET /drafts/:id/export?format=text|json`
- Draft generator sections:
  - Executive Summary
  - Objectives
  - Methodology
  - Workplan
  - Budget Summary
  - Impact
  - KPIs
- Template engine with multiple donor templates and keyword injection
- Revision workflow with version history, reviewer comments, and change history
- Validation:
  - budget totals consistency check
  - required-section completeness check
- Event integration:
  - subscribes to `evaluation.shortlisted`
  - publishes `draft.created` and `draft.updated`
- Security:
  - sensitive field redaction on export
  - role-based edit permissions for revise action

## Run

```bash
npm install
npm run dev
```

Default: `http://localhost:8086`

## Test

```bash
npm test
```

Includes:

- unit tests for template rendering
- unit tests for budget validation
