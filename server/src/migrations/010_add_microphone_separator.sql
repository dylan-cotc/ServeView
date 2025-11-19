-- Migration 010: Add Microphone Separator Column
-- This migration adds the is_separator column to the microphones table
-- to support visual separators in the display interface

ALTER TABLE microphones
ADD COLUMN IF NOT EXISTS is_separator BOOLEAN DEFAULT false;

-- Create index for performance when filtering separators
CREATE INDEX IF NOT EXISTS idx_microphones_is_separator ON microphones(is_separator);