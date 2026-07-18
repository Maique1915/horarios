-- ==========================================
-- SCRIPT DE CORREÇÃO DA TABELA CLASSES
-- ==========================================

-- 1. Substituir qualquer class_code NULO por string vazia ('')
UPDATE classes SET class_code = '' WHERE class_code IS NULL;

-- 2. Tornar a coluna class_code NOT NULL e definir o DEFAULT como ''
ALTER TABLE classes ALTER COLUMN class_code SET DEFAULT '';
ALTER TABLE classes ALTER COLUMN class_code SET NOT NULL;

-- 3. Remover a chave primária antiga (pode estar com nome diferente, tentaremos as duas variações mais comuns)
ALTER TABLE classes DROP CONSTRAINT IF EXISTS subject_schedules_pkey CASCADE;
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_pkey CASCADE;

-- 4. Adicionar a nova chave primária INCLUINDO o class_code
ALTER TABLE classes ADD CONSTRAINT classes_pkey PRIMARY KEY (subject_id, class_code, day_id, time_slot_id);
