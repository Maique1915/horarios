-- =====================================================
-- TABELA DE EQUIVALÊNCIAS (Refatorada)
-- Permite definir que uma ou mais disciplinas (source) 
-- equivalem a uma disciplina alvo (target).
-- =====================================================
CREATE TABLE subject_equivalencies (
    id SERIAL PRIMARY KEY,
    -- Se course_id for preenchido, a equivalência só é válida para este curso acadêmico.
    -- Se for NULL, a equivalência é considerada global.
    course_id INT,
    -- A disciplina que o aluno "ganha" (o objetivo)
    target_subject_id INT NOT NULL,
    -- A disciplina que o aluno "tem" (a origem)
    source_subject_id INT NOT NULL,
    -- Agrupador para casos 1:N ou N:1. 
    -- Se múltiplas linhas tiverem o mesmo (target_subject_id, equivalence_group_id),
    -- o aluno precisa ter TODAS as 'source_subject_id' daquele grupo para ganhar a 'target'.
    equivalence_group_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_equiv_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_equiv_target FOREIGN KEY (target_subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_equiv_source FOREIGN KEY (source_subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
CREATE INDEX idx_equiv_target ON subject_equivalencies(target_subject_id);
CREATE INDEX idx_equiv_course ON subject_equivalencies(course_id);
COMMENT ON TABLE subject_equivalencies IS 'Tabela única para mapear equivalências. Suporta 1:1 e N:1 através de grupos.';
COMMENT ON COLUMN subject_equivalencies.equivalence_group_id IS 'Disciplinas com mesmo target e group_id formam um conjunto obrigatório para a equivalência.';