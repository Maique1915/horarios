-- Migration to fix time_slots and classes relationship:
-- 1. Fix the PKEY sequence (duplicate key issue)
-- 2. Update unique constraint (per-course slots)
-- 3. Add ON DELETE CASCADE to the classes -> time_slots relationship (foreign key issue)
-- 1. RESYNC SEQUENCE (CRITICAL: Fixes the "duplicate key" error)
SELECT setval(
        pg_get_serial_sequence('time_slots', 'id'),
        coalesce(max(id), 1),
        max(id) IS NOT null
    )
FROM time_slots;
-- 2. Fix Unique Constraint (Remove global unique and add per-course unique)
ALTER TABLE time_slots DROP CONSTRAINT IF EXISTS uq_time_slot;
ALTER TABLE time_slots DROP CONSTRAINT IF EXISTS time_slots_start_time_end_time_key;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_time_slot_per_course'
) THEN
ALTER TABLE time_slots
ADD CONSTRAINT uq_time_slot_per_course UNIQUE (start_time, end_time, course_id);
END IF;
END $$;
-- 3. FIX CASCADE DELETE (Fixes the "violates foreign key constraint" error)
-- First, drop the existing constraint (using the name from your error message if possible)
ALTER TABLE classes DROP CONSTRAINT IF EXISTS fk_ss_time;
ALTER TABLE classes DROP CONSTRAINT IF EXISTS fk_classes_time;
-- Now add it back with ON DELETE CASCADE
ALTER TABLE classes
ADD CONSTRAINT fk_classes_time FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE;