-- Migration 013: Update Settings for Personal Access Token
-- Replace OAuth fields with Personal Access Token credentials

-- Remove OAuth-related columns if they exist
ALTER TABLE settings DROP COLUMN IF EXISTS pc_oauth_client_id;
ALTER TABLE settings DROP COLUMN IF EXISTS pc_oauth_client_secret;
ALTER TABLE settings DROP COLUMN IF EXISTS pc_personal_access_token;
ALTER TABLE settings DROP COLUMN IF EXISTS is_oauth;

-- Add Personal Access Token credential columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS pc_client_id TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS pc_client_secret TEXT;

-- Add comments for the new fields
COMMENT ON COLUMN settings.pc_client_id IS 'Planning Center Personal Access Token Application ID (Client ID) for API authentication';
COMMENT ON COLUMN settings.pc_client_secret IS 'Planning Center Personal Access Token Secret for API authentication';

-- Drop OAuth tokens table if it exists (cleanup from previous OAuth implementation)
DROP TABLE IF EXISTS oauth_tokens;