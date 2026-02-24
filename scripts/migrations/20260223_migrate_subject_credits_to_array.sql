-- Migration: Migrate has_theory and has_practical to credits array in subjects table
-- 1. Add the new credits column
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS credits INTEGER [];
-- 2. Migrate data from has_theory and has_practical to the credits array
-- Index 1 corresponds to "theory" (has_theory)
-- Index 2 corresponds to "practical" (has_practical)
-- Remaining indices are filled with 0 based on the course's credit_categories length.
UPDATE subjects s
SET credits = sub.new_credits
FROM (
        SELECT s.id,
            CASE
                WHEN c.credit_categories IS NULL
                OR jsonb_array_length(c.credit_categories) = 0 THEN ARRAY []::INTEGER []
                WHEN jsonb_array_length(c.credit_categories) = 1 THEN ARRAY [COALESCE(s.has_theory, 0)]
                WHEN jsonb_array_length(c.credit_categories) = 2 THEN ARRAY [COALESCE(s.has_theory, 0), COALESCE(s.has_practical, 0)]
                ELSE (
                    ARRAY [COALESCE(s.has_theory, 0), COALESCE(s.has_practical, 0)] || array_fill(
                        0,
                        ARRAY [jsonb_array_length(c.credit_categories) - 2]
                    )
                )
            END as new_credits
        FROM subjects s
            JOIN courses c ON c.id = s.course_id
    ) sub
WHERE s.id = sub.id;
-- 3. Remove the old columns
ALTER TABLE subjects DROP COLUMN IF EXISTS has_theory;
ALTER TABLE subjects DROP COLUMN IF EXISTS has_practical;
-- Comment on the new column
COMMENT ON COLUMN subjects.credits IS 'Array of credit values mapping to course.credit_categories. Index 1: Theory, Index 2: Practical, etc.';