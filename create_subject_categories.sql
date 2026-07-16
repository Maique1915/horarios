-- ============================================================================
-- Migração: Normalização de Categorias de Disciplinas
-- Cria tabela própria e migra os dados textuais da tabela subjects
-- ============================================================================

-- 1. Cria a nova tabela
CREATE TABLE IF NOT EXISTS subject_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insere as categorias únicas que já existem nas disciplinas (ignorando nulos/vazios)
INSERT INTO subject_categories (name)
SELECT DISTINCT TRIM(category)
FROM subjects
WHERE category IS NOT NULL AND TRIM(category) != ''
ON CONFLICT (name) DO NOTHING;

-- 3. Adiciona a coluna FK na tabela subjects
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS category_id INT REFERENCES subject_categories(id) ON DELETE SET NULL;

-- 4. Atualiza os registros existentes com seus respectivos IDs
UPDATE subjects s
SET category_id = c.id
FROM subject_categories c
WHERE TRIM(s.category) = c.name
  AND s.category IS NOT NULL 
  AND TRIM(s.category) != '';

-- 5. Opcional, mas recomendado: Exclui a coluna de texto antiga
-- (Descomente a linha abaixo quando tiver certeza de que a aplicação parou de usar a string direta)
-- ALTER TABLE subjects DROP COLUMN category;
