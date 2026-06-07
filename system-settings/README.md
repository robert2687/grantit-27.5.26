# system-settings

TypeScript microservice for global configuration management: scan schedules, source filters, notification rules, and backup settings.

## Endpoints

- `GET /settings`
- `PUT /settings`
- `GET /settings/:key`
- `GET /settings/export`
- `POST /settings/import`
- `GET /audit-logs`
- `GET /schemas/settings`

## Features

- Schema validation for each setting
- Safe defaults on startup
- Admin-only changes
- `settings.updated` event emission
- Audit logging of who changed what and when
- JSON import/export hooks for backup and restore

## Run

```bash
npm install
npm run test
npm run dev
```

Default port: `4104`
