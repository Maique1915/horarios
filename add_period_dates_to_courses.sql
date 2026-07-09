-- =====================================================
-- ADICIONAR DATAS DE PERÍODO LETIVO NA TABELA COURSES
-- =====================================================
-- Execute este script no painel do Supabase (SQL Editor)
-- Após rodar, preencha as datas em cada curso via painel.

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS period_end   DATE;

-- Exemplo de como preencher (ajuste os valores e IDs conforme seu banco):
-- UPDATE courses SET period_start = '2026-03-01', period_end = '2026-07-31' WHERE code = 'MAT';
-- UPDATE courses SET period_start = '2026-03-01', period_end = '2026-07-31' WHERE code = 'FIS';

-- Para verificar os cursos existentes:
-- SELECT id, code, name, period_start, period_end FROM courses;
