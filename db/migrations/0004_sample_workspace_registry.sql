-- FORGE sample workspaces are explicitly identified and tenant-scoped.
-- Production records remain unchanged when loading the demonstration pack.
ALTER TABLE crm_records ADD COLUMN IF NOT EXISTS is_sample boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS crm_records_sample_idx ON crm_records(organization_id,is_sample);
CREATE TABLE IF NOT EXISTS crm_seed_installs (
 organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
 pack_key varchar(90) NOT NULL,
 installed_by uuid NOT NULL REFERENCES crm_users(id),
 installed_at timestamptz NOT NULL DEFAULT now(),
 record_count integer NOT NULL DEFAULT 0,
 PRIMARY KEY(organization_id,pack_key)
);
