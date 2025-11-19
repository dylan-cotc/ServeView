-- Initial settings (will be populated via admin panel)
INSERT INTO settings (key, value) VALUES
  ('church_name', 'My Church'),
  ('pc_oauth_client_id', ''),
  ('pc_oauth_client_secret', ''),
  ('pc_oauth_access_token', ''),
  ('pc_oauth_refresh_token', ''),
  ('setlist_hidden_items', '["Worship Team - Dress-code", "Vocal Warm-ups"]')
ON CONFLICT (key) DO NOTHING;

-- Note: Initial admin user will be created via a setup script
-- Password should be hashed using bcrypt before insertion
