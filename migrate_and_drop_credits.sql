-- ============================================================================
-- Migração: Remoção da coluna 'credits' (Array) de 'subjects'
-- ============================================================================

-- 1. IMPORTANTE: Antes de dropar a coluna, garanta que a tabela associativa
-- 'subject_credits' já esteja populada com os dados correspondentes.
-- Se você ainda não fez a migração dos dados do array para a nova tabela,
-- você perderá a informação dos créditos.

-- O comando abaixo assume que a migração de dados já foi feita 
-- (ou que será tratada separadamente, como discutido anteriormente).
ALTER TABLE subjects DROP COLUMN IF EXISTS credits;
