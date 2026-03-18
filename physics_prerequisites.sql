-- OPTIONAL: Add Prerequisites for Physics Subjects
-- Run this AFTER inserting the subjects with physics_subjects.sql
-- 
-- Prerequisites Map:
-- subject_code → [prerequisite_codes]
-- 
-- Note: You need to know the IDs of the subjects first!
-- Get them with: SELECT id, acronym FROM subjects WHERE course_id = 5;

-- Example of how to add prerequisites:
-- First, get the subject IDs:
-- 1A = id_1A
-- 1D = id_1D
-- 2C = id_2C
-- etc.

-- Then insert prerequisites like this:
-- INSERT INTO subject_requirements (subject_id, type, prerequisite_subject_id)
-- VALUES (id_2C, 'SUBJECT', id_1D);  -- 2C requires 1D

-- OPTION 1: Using a WITH clause to find IDs first
WITH subject_ids AS (
    SELECT id, acronym FROM subjects WHERE course_id = 5
),
prerequisites_data AS (
    VALUES
        ('2C', '1D'),      -- Cálculo II requires Cálculo I
        ('2A', '1A'),      -- Mecânica Básica requires Introdução às Ciências Experimentais
        ('2A', '1D'),      -- Mecânica Básica requires Cálculo I
        ('2B', '1B'),      -- Pensamento Computacional II requires Pensamento Computacional I
        ('2B', '1C'),      -- Pensamento Computacional II requires Geometria Analítica I
        ('3A', '2A'),      -- Mecânica requires Mecânica Básica
        ('3A', '2C'),      -- Mecânica requires Cálculo II
        ('3B', '1C'),      -- Álgebra Linear requires Geometria Analítica I
        ('3C', '2C'),      -- Cálculo III requires Cálculo II
        ('4A', '3A'),      -- Física Térmica requires Mecânica
        ('4A', '3C'),      -- Física Térmica requires Cálculo III
        ('4B', '3A'),      -- Eletromagnetismo Básico requires Mecânica
        ('4B', '3C'),      -- Eletromagnetismo Básico requires Cálculo III
        ('4C', '3C'),      -- Cálculo IV requires Cálculo III
        ('4D', '3A'),      -- Projetos de Ensino de Física Térmica requires Mecânica
        ('5A', '4A'),      -- Física Ondulatória e Óptica requires Física Térmica
        ('5A', '4B'),      -- Física Ondulatória e Óptica requires Eletromagnetismo Básico
        ('5B', '4B'),      -- Eletromagnetismo requires Eletromagnetismo Básico
        ('5B', '4C'),      -- Eletromagnetismo requires Cálculo IV
        ('6A', '5A'),      -- Relatividade requires Física Ondulatória e Óptica
        ('6B', '5A'),      -- Física Quântica requires Física Ondulatória e Óptica
        ('6B', '5B'),      -- Física Quântica requires Eletromagnetismo
        ('6C', '5A'),      -- Projetos de Ensino de Eletromag e Ondulatória requires Física Ondulatória e Óptica
        ('6C', '5B'),      -- Projetos de Ensino de Eletromag e Ondulatória requires Eletromagnetismo
        ('6E', '5E'),      -- Prática Docente II requires Prática Docente I
        ('7A', '6B'),      -- Física Moderna requires Física Quântica
        ('7B', '6D'),      -- Epistemologia requires História e Filosofia da Ciência
        ('7C', '6A'),      -- Projetos de Ensino de Física Moderna requires Relatividade
        ('7C', '6B'),      -- Projetos de Ensino de Física Moderna requires Física Quântica
        ('7D', '6E'),      -- Prática Docente III requires Prática Docente II
        ('7E', '6F'),      -- Metodologia do Ensino de Física requires Educação em Ciências e Diversidade
        ('8A', '4A'),      -- Física Estatística requires Física Térmica
        ('8A', '7A'),      -- Física Estatística requires Física Moderna
        ('8B', '7A'),      -- Introdução à Física do Estado Sólido requires Física Moderna
        ('8D', '7D'),      -- Prática Docente IV requires Prática Docente III
        ('9A', '8C')       -- Trabalho de Conclusão de Curso II requires Trabalho de Conclusão de Curso I
)
INSERT INTO subject_requirements (subject_id, type, prerequisite_subject_id)
SELECT 
    s1.id as subject_id,
    'SUBJECT' as type,
    s2.id as prerequisite_subject_id
FROM prerequisites_data as pd
JOIN subject_ids s1 ON pd.column1 = s1.acronym
JOIN subject_ids s2 ON pd.column2 = s2.acronym;

-- OPTION 2: If the above doesn't work (older PostgreSQL), use individual INSERTs:
-- This would require you to manually replace the IDs
-- Example:
-- INSERT INTO subject_requirements (subject_id, type, prerequisite_subject_id) VALUES (7, 'SUBJECT', 4);  -- 2C -> 1D
-- INSERT INTO subject_requirements (subject_id, type, prerequisite_subject_id) VALUES (5, 'SUBJECT', 1);  -- 2A -> 1A
-- INSERT INTO subject_requirements (subject_id, type, prerequisite_subject_id) VALUES (5, 'SUBJECT', 4);  -- 2A -> 1D
-- ... etc

-- OPTION 3: Manual method using admin interface
-- Go to http://localhost:3000/admin/subjects
-- 1. Select Physics course
-- 2. Click edit on each subject
-- 3. Add prerequisites from dropdown
-- 4. Save
