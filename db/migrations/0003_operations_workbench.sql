-- FORGE Phase 2: relational commercial-to-delivery workflows
-- Safe to apply to existing workspaces; no customer records are modified.
ALTER TABLE crm_records ADD COLUMN IF NOT EXISTS source_tender_id text REFERENCES crm_records(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS crm_records_source_tender_idx ON crm_records(organization_id,source_tender_id);
CREATE UNIQUE INDEX IF NOT EXISTS crm_projects_tender_handover_once ON crm_records(organization_id,source_tender_id) WHERE kind='projects' AND source_tender_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS crm_quote_line_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
 quote_id text NOT NULL REFERENCES crm_records(id) ON DELETE CASCADE,
 description varchar(240) NOT NULL,
 unit varchar(40) NOT NULL DEFAULT 'item',
 quantity numeric(12,3) NOT NULL CHECK(quantity>0 AND quantity<=100000000),
 unit_rate numeric(14,2) NOT NULL CHECK(unit_rate>=0 AND unit_rate<=1000000000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_quote_lines_owner_idx ON crm_quote_line_items(organization_id,quote_id);

CREATE TABLE IF NOT EXISTS crm_project_milestones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
 project_id text NOT NULL REFERENCES crm_records(id) ON DELETE CASCADE,
 title varchar(180) NOT NULL,
 due_date date,
 completed boolean NOT NULL DEFAULT false,
 completed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_milestones_owner_idx ON crm_project_milestones(organization_id,project_id);

CREATE TABLE IF NOT EXISTS crm_tender_requirements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
 tender_id text NOT NULL REFERENCES crm_records(id) ON DELETE CASCADE,
 title varchar(180) NOT NULL,
 completed boolean NOT NULL DEFAULT false,
 completed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_requirements_owner_idx ON crm_tender_requirements(organization_id,tender_id);

CREATE TABLE IF NOT EXISTS crm_record_activities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
 record_id text NOT NULL REFERENCES crm_records(id) ON DELETE CASCADE,
 actor_id uuid NOT NULL REFERENCES crm_users(id),
 category varchar(30) NOT NULL CHECK(category IN ('note','status','system','handover','quote')),
 body varchar(2000) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_activity_record_idx ON crm_record_activities(organization_id,record_id,created_at DESC);
