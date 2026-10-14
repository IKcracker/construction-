-- Sample data is opt-in, tenant-scoped and explicitly identifiable.
ALTER TABLE crm_records ADD COLUMN IF NOT EXISTS is_sample boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS crm_records_sample_idx ON crm_records(organization_id,is_sample) WHERE is_sample=true;
CREATE TABLE IF NOT EXISTS crm_seed_installs (
 organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
 pack_key varchar(100) NOT NULL,
 installed_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
 record_count integer NOT NULL,
 installed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,pack_key)
);
