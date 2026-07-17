-- Este script insere as categorias de carga horária para o seu curso na nova tabela `course_workloads`.
-- A página de /profile do frontend lê essa tabela para saber quais blocos (Obrigatórias, Optativas, Eletivas, etc) desenhar na tela.

-- =====================================================================
-- ⚠️ INSTRUÇÕES ⚠️
-- Substitua o valor da variável `meu_curso_id` pelo ID do seu curso!
-- Exemplo: Se o ID do seu curso "Engenharia de Computação" for 1, 
-- coloque 1 ali.
--
-- Se você não sabe o ID do seu curso, você pode descobrir rodando:
-- SELECT id, name FROM courses;
-- =====================================================================

DO $$
DECLARE
    meu_curso_id INT := 1; -- 🔴 MUDE ISTO PARA O ID DO SEU CURSO 🔴
BEGIN

    -- 1. Inserir regra de disciplinas "Obrigatórias"
    INSERT INTO course_workloads (course_id, type, min_credits, min_hours)
    VALUES (meu_curso_id, 'obrigatórias', 140, 2100);

    -- 2. Inserir regra de disciplinas "Optativas"
    INSERT INTO course_workloads (course_id, type, min_credits, min_hours)
    VALUES (meu_curso_id, 'optativas', 20, 300);

    -- 3. Inserir regra de disciplinas "Eletivas"
    -- (Disciplinas que você faz em outros cursos que não sejam o seu oficial)
    INSERT INTO course_workloads (course_id, type, min_credits, min_hours)
    VALUES (meu_curso_id, 'eletivas', 8, 120);

    -- 4. Inserir regra de "Atividades Complementares"
    INSERT INTO course_workloads (course_id, type, min_credits, min_hours)
    VALUES (meu_curso_id, 'atividades complementares', 0, 300);

    RAISE NOTICE 'Cargas horárias inseridas com sucesso para o curso ID %!', meu_curso_id;
END $$;
