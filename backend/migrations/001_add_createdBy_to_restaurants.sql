-- Migration: Add createdBy field to restaurants table
-- Date: 2025-12-20
-- Description: Add createdBy column to track restaurant creators and enable deletion permissions

-- Add createdBy column if it doesn't exist
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS createdBy INTEGER NOT NULL DEFAULT 1;

-- Add foreign key constraint
ALTER TABLE restaurants
ADD CONSTRAINT fk_restaurants_createdBy 
FOREIGN KEY (createdBy) 
REFERENCES users(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurants_createdBy 
ON restaurants(createdBy);

-- Update existing restaurants without a creator
-- Set to first admin user or user ID 1
UPDATE restaurants 
SET createdBy = (
  SELECT id 
  FROM users 
  WHERE role = 'admin' 
  ORDER BY id 
  LIMIT 1
)
WHERE createdBy IS NULL OR createdBy = 0;

-- Rollback instructions (if needed):
-- ALTER TABLE restaurants DROP FOREIGN KEY fk_restaurants_createdBy;
-- DROP INDEX IF EXISTS idx_restaurants_createdBy ON restaurants;
-- ALTER TABLE restaurants DROP COLUMN createdBy;