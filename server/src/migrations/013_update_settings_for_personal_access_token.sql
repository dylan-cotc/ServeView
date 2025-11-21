-- Migration 013: Update Settings for Personal Access Token
-- Replace OAuth fields with Personal Access Token field

-- Remove OAuth-related columns if they exist
ALTER TABLE settings DROP COLUMN IF EXISTS pc_oauth_client_id;
ALTER TABLE settings DROP COLUMN IF EXISTS pc_oauth_client_secret;
ALTER TABLE settings DROP COLUMN IF EXISTS is_oauth;

-- Add Personal Access Token column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS pc_personal_access_token TEXT;

-- Add comment for the new field
COMMENT ON COLUMN settings.pc_personal_access_token IS 'Planning Center Personal Access Token for API authentication';

-- Drop OAuth tokens table if it exists (cleanup from previous OAuth implementation)
DROP TABLE IF EXISTS oauth_tokens;