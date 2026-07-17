-- 1. RPC para buscar matérias com créditos somados (Grid de matérias)
DROP FUNCTION IF EXISTS get_subjects_with_credits(INT);
CREATE OR REPLACE FUNCTION get_subjects_with_credits(p_course_id INT DEFAULT NULL)
RETURNS TABLE (
    id INT,
    semester INT,
    name TEXT,
    acronym TEXT,
    category_id INT,
    optional BOOLEAN,
    active BOOLEAN,
    workload INT,
    course_id INT,
    course_code TEXT,
    course_name TEXT,
    total_credits INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.semester,
        s.name::TEXT,
        s.acronym::TEXT,
        s.category_id,
        s.optional,
        s.active,
        s.workload,
        s.course_id,
        c.code::TEXT AS course_code,
        c.name::TEXT AS course_name,
        COALESCE(SUM(sc.amount), 0)::INT AS total_credits
    FROM subjects s
    LEFT JOIN courses c ON s.course_id = c.id
    LEFT JOIN subject_credits sc ON s.id = sc.subject_id
    WHERE (p_course_id IS NULL OR s.course_id = p_course_id)
    GROUP BY s.id, c.id;
END;
$$ LANGUAGE plpgsql;

-- 2. RPC para Matérias Concluídas (completed_subjects)
DROP FUNCTION IF EXISTS get_user_completed_subjects(BIGINT);
CREATE OR REPLACE FUNCTION get_user_completed_subjects(p_user_id BIGINT)
RETURNS TABLE (
    completed_at TIMESTAMP,
    id INT,
    semester INT,
    name TEXT,
    acronym TEXT,
    category_id INT,
    optional BOOLEAN,
    active BOOLEAN,
    workload INT,
    course_id INT,
    course_code TEXT,
    course_name TEXT,
    total_credits INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.completed_at,
        s.id,
        s.semester,
        s.name::TEXT,
        s.acronym::TEXT,
        s.category_id,
        s.optional,
        s.active,
        s.workload,
        s.course_id,
        c.code::TEXT AS course_code,
        c.name::TEXT AS course_name,
        COALESCE(SUM(sc.amount), 0)::INT AS total_credits
    FROM completed_subjects cs
    JOIN subjects s ON cs.subject_id = s.id
    LEFT JOIN courses c ON s.course_id = c.id
    LEFT JOIN subject_credits sc ON s.id = sc.subject_id
    WHERE cs.user_id = p_user_id
    GROUP BY cs.completed_at, s.id, c.id;
END;
$$ LANGUAGE plpgsql;

-- 3. RPC para Matérias Matriculadas (current_enrollments)
DROP FUNCTION IF EXISTS get_user_current_enrollments(BIGINT);
CREATE OR REPLACE FUNCTION get_user_current_enrollments(p_user_id BIGINT)
RETURNS TABLE (
    class_code TEXT,
    enrollment_semester TEXT,
    schedule_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    id INT,
    semester INT,
    name TEXT,
    acronym TEXT,
    category_id INT,
    optional BOOLEAN,
    active BOOLEAN,
    workload INT,
    course_id INT,
    course_code TEXT,
    course_name TEXT,
    total_credits INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.class_code,
        ce.semester AS enrollment_semester,
        ce.schedule_data,
        ce.created_at,
        s.id,
        s.semester,
        s.name::TEXT,
        s.acronym::TEXT,
        s.category_id,
        s.optional,
        s.active,
        s.workload,
        s.course_id,
        c.code::TEXT AS course_code,
        c.name::TEXT AS course_name,
        COALESCE(SUM(sc.amount), 0)::INT AS total_credits
    FROM current_enrollments ce
    JOIN subjects s ON ce.subject_id = s.id
    LEFT JOIN courses c ON s.course_id = c.id
    LEFT JOIN subject_credits sc ON s.id = sc.subject_id
    WHERE ce.user_id = p_user_id
    GROUP BY ce.id, s.id, c.id;
END;
$$ LANGUAGE plpgsql;
