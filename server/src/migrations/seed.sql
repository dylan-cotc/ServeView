-- Initial settings for the primary location (will be populated via admin panel)
-- Insert settings for the primary location only
INSERT INTO settings (key, value, location_id)
SELECT
  s.key,
  s.value,
  l.id
FROM (
  VALUES
    ('church_name', 'My Church'),
    ('pc_oauth_client_id', ''),
    ('pc_oauth_client_secret', ''),
    ('pc_oauth_access_token', ''),
    ('pc_oauth_refresh_token', ''),
    ('setlist_hidden_items', '["Worship Team - Dress-code", "Vocal Warm-ups"]')
) AS s(key, value)
CROSS JOIN (SELECT id FROM locations WHERE is_primary = true LIMIT 1) AS l
ON CONFLICT (key, location_id) DO NOTHING;

-- Note: Initial admin user will be created via a setup script
-- Password should be hashed using bcrypt before insertion
