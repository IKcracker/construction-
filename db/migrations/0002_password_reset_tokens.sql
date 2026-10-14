CREATE TABLE IF NOT EXISTS crm_password_reset_tokens (
 token_hash char(64) PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_password_reset_user_idx ON crm_password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS crm_password_reset_expiry_idx ON crm_password_reset_tokens(expires_at);
