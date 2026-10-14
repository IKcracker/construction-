-- FORGE CRM production schema. Apply to a dedicated, empty PostgreSQL database.
-- All entities are tenant-scoped and no sample records are inserted.

CREATE TABLE IF NOT EXISTS crm_organizations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS crm_users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE, name text NOT NULL, email text NOT NULL, password_hash text NOT NULL, role text NOT NULL CHECK(role IN ('admin','editor','viewer')), must_change_password boolean NOT NULL DEFAULT false, disabled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,email));

CREATE UNIQUE INDEX IF NOT EXISTS crm_users_email_unique ON crm_users (lower(email));

CREATE TABLE IF NOT EXISTS crm_sessions (token_hash char(64) PRIMARY KEY, user_id uuid NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS crm_sessions_expiry_idx ON crm_sessions(expires_at);

CREATE TABLE IF NOT EXISTS crm_records (id text PRIMARY KEY, organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE, kind text NOT NULL CHECK (kind IN ('tenders','quotes','projects','clients','tasks','documents')), title varchar(160) NOT NULL, client varchar(160) NOT NULL, owner varchar(120) NOT NULL, status varchar(60) NOT NULL, amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(amount>=0), target_date date NOT NULL, description text NOT NULL DEFAULT '', progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100), created_by uuid NOT NULL REFERENCES crm_users(id), updated_by uuid NOT NULL REFERENCES crm_users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS crm_records_tenant_kind ON crm_records(organization_id,kind,updated_at DESC);

CREATE TABLE IF NOT EXISTS crm_attachments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE, record_id text NOT NULL REFERENCES crm_records(id) ON DELETE CASCADE, filename varchar(180) NOT NULL, content_type varchar(90) NOT NULL, size_bytes integer NOT NULL CHECK(size_bytes BETWEEN 1 AND 5242880), contents bytea NOT NULL, uploaded_by uuid NOT NULL REFERENCES crm_users(id), created_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS crm_attachments_record_idx ON crm_attachments(organization_id,record_id);

CREATE TABLE IF NOT EXISTS crm_audit_events (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE, actor_id uuid REFERENCES crm_users(id) ON DELETE SET NULL, event_type varchar(50) NOT NULL, record_kind varchar(30), record_id text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS crm_audit_tenant_idx ON crm_audit_events(organization_id,created_at DESC);

CREATE TABLE IF NOT EXISTS crm_login_attempts (email text NOT NULL, fingerprint text NOT NULL, attempted_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS crm_login_attempts_idx ON crm_login_attempts(email,fingerprint,attempted_at DESC);
