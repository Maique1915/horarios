-- =====================================================
-- SEED DE EQUIVALÊNCIAS (Engenharia -> Física)
-- Baseado no arquivo equivalencias.pdf
-- Lógica: Se o aluno da Engenharia cursou X, ele ganha Y da Física.
-- Ou: Se o aluno da Física cursar Y1+Y2, ele ganha X da Engenharia (conforme PDF).
-- O PDF foca em: "O que o aluno de Física precisa cursar para ter equivalência na Eng."
-- =====================================================
DO $$
DECLARE v_course_eng_id INT;
BEGIN -- Pegar o ID do curso de Engenharia de Computação (exemplo)
SELECT id INTO v_course_eng_id
FROM courses
WHERE code = 'engcomp';
-- 1. Mecânica Clássica (GCOM2012PE)
-- Para ganhar GCOM2012PE, precisa de MEC I (GLFI4205PE) e MEC II (GLFI4310PE)
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM2012PE'
    AND s.acronym IN ('GLFI4205PE', 'GLFI4310PE');
-- 2. Termodinâmica (GCOM3018PE)
-- Para ganhar GCOM3018PE, precisa de Física Térmica (GLFI4414PE)
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM3018PE'
    AND s.acronym = 'GLFI4414PE';
-- 3. Eletromagnetismo (GCOM4023PE)
-- Para ganhar GCOM4023PE, precisa de Eletromag Básico (GLFI4518PE) e Circuitos (GLFI4624PE)
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM4023PE'
    AND s.acronym IN ('GLFI4518PE', 'GLFI4624PE');
-- 4. Ondulatória e Física Moderna (GCOM6039PE)
-- Para ganhar GCOM6039PE, precisa das 4 listadas no PDF
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM6039PE'
    AND s.acronym IN (
        'GLFI4517PE',
        'GLFI4623PE',
        'GLFI4730PE',
        'GLFI4626PE'
    );
-- 5. Cálculos (1:1)
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM2010PE'
    AND s.acronym = 'GMAT4409PE';
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM3017PE'
    AND s.acronym = 'GMAT4515PE';
-- 6. Outras (1:1)
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM3016PE'
    AND s.acronym = 'GLFI4416PE';
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM2011PE'
    AND s.acronym = 'GMAT4514PE';
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM1003PE'
    AND s.acronym = 'GMAT4411PE';
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM1007PE'
    AND s.acronym = 'GLFI9205PE';
INSERT INTO subject_equivalencies (
        course_id,
        target_subject_id,
        source_subject_id,
        equivalence_group_id
    )
SELECT v_course_eng_id,
    t.id,
    s.id,
    1
FROM subjects t,
    subjects s
WHERE t.acronym = 'GCOM1002PE'
    AND s.acronym = 'BTURPE4002';
END $$;