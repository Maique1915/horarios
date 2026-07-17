-- Atualiza todas as disciplinas para workload = 18
UPDATE subjects SET workload = 18 WHERE workload IS DISTINCT FROM 18;