# Administration Workspace

Administration service for managing users, roles, templates, integrations, and audit logs.

## Endpoints

- `GET/POST/PUT/DELETE /users`
- `GET/POST/PUT/DELETE /roles`
- `GET/POST/PUT/DELETE /templates`
- `GET/POST/PUT/DELETE /integrations`
- `POST /integrations/:id/rotate-key`
- `POST /integrations/:id/test-connection`
- `GET /audit-logs`
- `GET /metrics`
- `GET /schemas/minimal-user`

## Security

- RBAC roles: `admin`, `evaluator`, `copywriter`, `reviewer`, `viewer`
- JWT claim extraction from `Authorization: Bearer <token>` (payload decode)
- Admin write operations require 2FA claim (`two_factor: true`)
- Secrets vault is a placeholder adapter configured by `SECRETS_VAULT_PROVIDER`

## Run

1. `npm install`
2. `npm run test`
3. `npm run dev`
