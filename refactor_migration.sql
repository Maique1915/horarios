-- =================================================================
-- MIGRATION SCRIPT FOR APP REFACTOR
--
-- This script aligns the 'subjects' table with the application's data model.
--
-- Changes:
-- 1. Adds a 'code' column for the subject's reference code (e.g., 'MA101').
-- 2. Adds an 'active' status column.
-- 3. Replaces boolean flags 'has_practical'/'has_theory' with integer credit columns.
-- 4. Adds JSONB columns for flexible data like prerequisites and schedules.
-- 5. Adds a unique constraint required for the application's upsert logic.
-- =================================================================

-- Step 1: Add new columns with default values
ALTER TABLE subjects ADD COLUMN code VARCHAR(50);
ALTER TABLE subjects ADD COLUMN active BOOLEAN DEFAULT TRUE;
ALTER TABLE subjects ADD COLUMN theoretical_credits INT DEFAULT 0;
ALTER TABLE subjects ADD COLUMN practical_credits INT DEFAULT 0;
ALTER TABLE subjects ADD COLUMN prerequisites JSONB;
ALTER TABLE subjects ADD COLUMN schedule JSONB;

-- Step 2: (Optional but Recommended) Populate the new 'code' column from existing data if possible.
-- This is a placeholder as we don't have a guaranteed source for the code.
-- You might need to populate this manually or from another source.
-- Example: UPDATE subjects SET code = name WHERE code IS NULL;

-- Step 3: Make the new 'code' column not null after populating
-- We can't do this until codes are populated, so this is commented out.
-- ALTER TABLE subjects ALTER COLUMN code SET NOT NULL;

-- Step 4: Drop the old, now redundant, columns
ALTER TABLE subjects DROP COLUMN has_practical;
ALTER TABLE subjects DROP COLUMN has_theory;

-- Step 5: Add the unique constraint for upsert logic.
-- This can only be done if the 'code' for each 'course_id' is unique.
-- Ensure you have populated the 'code' column with unique values before running this.
ALTER TABLE subjects ADD CONSTRAINT uq_course_subject_code UNIQUE (course_id, code);

-- =================================================================
-- NOTES:
-- - You MUST populate the 'code' column for all existing subjects
--   with unique values per course before applying the NOT NULL and
--   UNIQUE constraints.
-- - After running this migration, you may need to update your data
--   ingestion scripts (like migration.sql) if you use them to populate the database.
-- =================================================================
