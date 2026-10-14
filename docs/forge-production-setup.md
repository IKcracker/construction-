# FORGE Construction CRM — Production Setup

FORGE is a persistent, staff-authenticated construction CRM at `/crm`. The old `/crm-demo` URL redirects to the private workspace. The public STRATA website remains independent.

## Database
A dedicated Neon PostgreSQL project named **forge-construction-crm**, database **forgecrm**, was created for this workspace. Do not reuse the database from any client work or another Code Tech Agency application.

Schema: `db/forge-schema.sql` — organization, staff, sessions, records, document attachments, audit events and login throttling. The schema has been applied to the dedicated Neon project.

## Private environment settings
At the deployment platform, set:
- `FORGE_DATABASE_URL`: dedicated PostgreSQL connection string for `forgecrm`, SSL required, configured as a server-only secret.
- `FORGE_BOOTSTRAP_TOKEN`: generate using `openssl rand -hex 32`; secret must have 32+ characters. Remove this setting after the first admin signs up.
- `FORGE_RATE_LIMIT_SALT`: optional additional random 32+ character secret.

Do not set these as `NEXT_PUBLIC_*`. Do not commit credentials or actual user information. Environment variables are not configured by the code changes.

## First administrator
1. Deploy only after configuring the secure database and using HTTPS.
2. Visit `/crm`. With no users and a valid `FORGE_BOOTSTRAP_TOKEN`, the initial setup form appears.
3. Enter company name, administrator name, work email, strong password (12+ characters) and private setup token.
4. Sign in. The initial setup route rejects further setup attempts after the first account is created.
5. Remove `FORGE_BOOTSTRAP_TOKEN` from hosting settings and redeploy.
6. Invite staff from the Team dialog. Staff should change their temporary password at first sign-in.

## Roles
- Admin: read/write/delete records, manage team, delete document attachments.
- Editor: read/write records, upload attachments.
- Viewer: read-only access and downloads.

The application validates role and tenant membership on **every** API request; hiding UI controls is not the security boundary. Sessions are random, hashed in the database, and set in HTTP-only, secure (in production), same-site cookies with 7-day expiry.

## What actually works
- Persistent tenders, RFQs, estimates, quotations, projects, contacts, tasks, document metadata.
- Staff sign-in and roles; create staff accounts; forced password change for new users.
- Create/update/delete workflows; progress updates; search and kanban views; dashboards/reporting; CSV export.
- Real PDF, JPEG and PNG attachments with a 4MB per-file limit stored securely in PostgreSQL, downloaded through authenticated API.
- Audit events tracking record and attachment mutations.
- Empty database to start: **no fabricated customers or sample transactions**.

## Current operational constraints
This is a production-oriented MVP, not a completed enterprise rollout. Before entering sensitive live customer data, perform end-to-end staging verification for sign-in, password resets, upload/download, permissions, simultaneous staff edits, backups, disaster recovery, database restore, and security controls. Backups and restore testing remain the operator's responsibility. No outgoing emails, accounting integrations, bid portal integrations, PDF quotation generation, file virus scanning, advanced permissions, or external automation have been implemented.

Document attachment storage in PostgreSQL is suitable only for the initial small-team stage; migrate to private object storage with signed access as usage grows.

## Validation
GitHub Actions builds the public site and the CRM, checks `/crm` is never a public records page when database credentials are absent, and verifies stylesheet delivery. Actual database and authentication integration tests must be executed in staging with private configuration.

## Next deployment task
Connect a supported Vercel project or another hosting provider to the repository, set server-only environment variables, verify the site over HTTPS, complete initial administrator setup, and run staging UAT. No production deployment or configuration change was made as part of this work.
