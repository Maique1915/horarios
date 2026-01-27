-- Migration to add course_id to current_enrollments
-- This helps differentiate between mandatory subjects of the user's course and optional subjects from other courses.
-- 1. Add the course_id column
ALTER TABLE current_enrollments
ADD COLUMN course_id INTEGER;
-- 2. Update existing records with ID 3 (Engenharia) as per user request
UPDATE current_enrollments
SET course_id = 3
WHERE course_id IS NULL;
-- 3. Add foreign key constraint
ALTER TABLE current_enrollments
ADD CONSTRAINT fk_current_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
-- 4. Make it NOT NULL for future records
ALTER TABLE current_enrollments
ALTER COLUMN course_id
SET NOT NULL;