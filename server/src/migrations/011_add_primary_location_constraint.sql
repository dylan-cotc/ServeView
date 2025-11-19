-- Migration 011: Add Primary Location Constraint
-- Ensures only one location can be primary at a time

-- Drop existing constraint if it exists (for re-runs)
DROP INDEX IF EXISTS idx_locations_primary_only;

-- First, ensure only one location is marked as primary
-- Keep the location with the lowest ID as primary, set others to false
UPDATE locations
SET is_primary = false
WHERE id != (SELECT MIN(id) FROM locations WHERE is_primary = true)
AND is_primary = true;

-- Add a partial unique index to ensure only one location can be primary
-- This prevents multiple locations from being marked as primary simultaneously
CREATE UNIQUE INDEX idx_locations_primary_only
ON locations (is_primary)
WHERE is_primary = true;

-- Add a comment explaining the constraint
COMMENT ON INDEX idx_locations_primary_only IS 'Ensures only one location can be marked as primary at a time';