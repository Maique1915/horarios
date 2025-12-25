-- Add new columns for detailed progress tracking
ALTER TABLE subjects 
ADD COLUMN has_pratical INTEGER DEFAULT 0,
ADD COLUMN has_theory INTEGER DEFAULT 0,
ADD COLUMN category VARCHAR(20) DEFAULT 'MANDATORY' CHECK (category IN ('MANDATORY', 'ELECTIVE', 'COMPLEMENTARY'));

-- Migrate existing 'elective' flag to 'category'
UPDATE subjects SET category = 'ELECTIVE' WHERE elective = TRUE;

-- Initialize new credit columns from legacy boolean flags (approximate fallback)
-- Ideally, we'd want to populate this from the JSON data, but as a safe default:
-- If has_practical is true, set practical_credits to 2 (default)
UPDATE subjects SET has_pratical = 2 WHERE has_pratical = TRUE;
-- If has_theory is true, set theory_credits to 2 (default)
UPDATE subjects SET has_theory = 2 WHERE has_theory = TRUE;

-- (Optional) We could drop the old columns, but let's keep them for safety until code is fully updated
-- ALTER TABLE subjects DROP COLUMN elective;
-- ALTER TABLE subjects DROP COLUMN has_practical;
-- ALTER TABLE subjects DROP COLUMN has_theory;
