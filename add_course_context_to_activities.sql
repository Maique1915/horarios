-- Migration to add course-level scoping to complementary activity groups and items

-- 1. Ensure a default course exists to avoid foreign key violations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM courses WHERE code = 'engcomp') THEN
        INSERT INTO courses (code, name) VALUES ('engcomp', 'Engenharia de Computação');
    END IF;
END $$;

-- 2. Modify complementary_activity_groups
ALTER TABLE complementary_activity_groups ADD COLUMN IF NOT EXISTS course_id INTEGER;

-- Use a subquery to find the correct ID instead of hardcoding 1
UPDATE complementary_activity_groups 
SET course_id = (SELECT id FROM courses WHERE code = 'engcomp' LIMIT 1) 
WHERE course_id IS NULL;

ALTER TABLE complementary_activity_groups ALTER COLUMN course_id SET NOT NULL;

-- Establish foreign key
-- We drop it first in case it failed halfway before
ALTER TABLE complementary_activity_groups DROP CONSTRAINT IF EXISTS fk_group_course;
ALTER TABLE complementary_activity_groups 
ADD CONSTRAINT fk_group_course 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Update Primary Key to include course_id
ALTER TABLE complementary_activity_groups DROP CONSTRAINT IF EXISTS complementary_activity_groups_pkey CASCADE;
ALTER TABLE complementary_activity_groups ADD PRIMARY KEY (id, course_id);

-- 3. Modify complementary_activities
ALTER TABLE complementary_activities ADD COLUMN IF NOT EXISTS course_id INTEGER;

UPDATE complementary_activities 
SET course_id = (SELECT id FROM courses WHERE code = 'engcomp' LIMIT 1) 
WHERE course_id IS NULL;

ALTER TABLE complementary_activities ALTER COLUMN course_id SET NOT NULL;

-- Establish foreign key to courses
ALTER TABLE complementary_activities DROP CONSTRAINT IF EXISTS fk_activity_course;
ALTER TABLE complementary_activities 
ADD CONSTRAINT fk_activity_course 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Re-establish foreign key to groups (composite)
ALTER TABLE complementary_activities DROP CONSTRAINT IF EXISTS fk_activities_group;
ALTER TABLE complementary_activities DROP CONSTRAINT IF EXISTS fk_activities_group_scoped;
ALTER TABLE complementary_activities 
ADD CONSTRAINT fk_activities_group_scoped
FOREIGN KEY ("group", course_id) REFERENCES complementary_activity_groups(id, course_id) ON DELETE CASCADE;

-- 4. Index for filtering
CREATE INDEX IF NOT EXISTS idx_complementary_activities_course ON complementary_activities (course_id);
CREATE INDEX IF NOT EXISTS idx_complementary_activity_groups_course ON complementary_activity_groups (course_id);
