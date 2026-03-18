# 📊 Resumo: Adicionar Disciplinas de Física ao Sistema

## ✅ Arquivos Criados

### 1. **physics_subjects.sql** (59 linhas)
- ✅ SQL pronto para copiar e colar no Supabase
- ✅ Contém as 45 disciplinas de Física
- ✅ Setores: 9 períodos (1º ao 9º)
- ✅ 4 optativas identificadas automaticamente

### 2. **csv_to_sql_physics.py** (150 linhas)
- ✅ Script Python para regenerar o SQL se necessário
- ✅ Aceita qualquer CSV no formato especificado
- ✅ Converte automaticamente tipos de dados
- ✅ Identifica optativas pelo nome

### 3. **ADICIONAR_DISCIPLINAS.md**
- ✅ Documentação completa
- ✅ Instruções passo-a-passo
- ✅ Exemplos de uso

## 🚀 Como Usar (Rápido)

### Opção 1: Copiar e Colar SQL (Recomendado)

```bash
# 1. Abra o Supabase Dashboard
# 2. Vá para SQL Editor
# 3. Copie o conteúdo de physics_subjects.sql
cat /home/maiq/Projetos/Horarios/physics_subjects.sql
# 4. Cole no editor do Supabase
# 5. Execute (Run/Execute button)
```

### Opção 2: Regenerar o SQL (Se mudar o CSV)

```bash
cd /home/maiq/Projetos/Horarios
python3 csv_to_sql_physics.py fisica.csv physics_subjects.sql
```

## 📋 Dados Processados

**Total de Disciplinas:** 45

| Período | Obrigatórias | Optativas | Total |
|---------|-------------|-----------|-------|
| 1º      | 4          | 0         | 4     |
| 2º      | 3          | 0         | 3     |
| 3º      | 3          | 0         | 3     |
| 4º      | 5          | 0         | 5     |
| 5º      | 6          | 0         | 6     |
| 6º      | 7          | 0         | 7     |
| 7º      | 5          | 0         | 5     |
| 8º      | 5          | 1         | 6     |
| 9º      | 3          | 3         | 6     |

**Optativas Identificadas:**
- 8F - Optativa I
- 9B - Optativa II
- 9C - Optativa III
- 9D - Optativa IV

## 🔗 Pré-requisitos

Os pré-requisitos foram extraídos do CSV:

```
2C → 1D
3A → 2A, 2C
3B → 1C
3C → 2C
4A → 3A, 3C
4B → 3A, 3C
4C → 3C
4D → 3A
5A → 4A, 4B
5B → 4B, 4C
6A → 5A
6B → 5A, 5B
6C → 5A, 5B
6E → 5E
7A → 6B
7B → 6D
7C → 6A, 6B
7D → 6E
7E → 6F
8A → 4A, 7A
8B → 7A
8D → 7D
9A → 8C
```

**Nota:** Os pré-requisitos precisam ser adicionados manualmente via:
- Interface: `http://localhost:3000/admin/subjects`
- Ou SQL manual após inserir as disciplinas

## 📂 Estrutura do SQL

```sql
INSERT INTO subjects (
    course_id,      -- 5 (Física)
    semester,       -- 1-9
    acronym,        -- código (ex: "1A", "2C")
    name,           -- nome completo
    active,         -- TRUE
    category,       -- 'MANDATORY' ou 'OPTIONAL'
    optional,       -- true/false
    workload,       -- 0
    credits         -- ARRAY[teoria, prática, complementar, outro]
)
VALUES (...)
```

## ✨ Campos Mapeados

| CSV | SQL | Descrição |
|-----|-----|-----------|
| code | acronym | Código da disciplina |
| name | name | Nome completo |
| period | semester | Semestre (1-9) |
| credits | credits | Array de créditos |
| prerequisites | (separado) | Não inclusos no INSERT |

## 🎯 Próximos Passos

1. ✅ Execute o SQL no Supabase
2. ⏳ Verifique em `http://localhost:3000/admin/subjects`
3. ⏳ Adicione pré-requisitos (manual ou SQL)
4. ⏳ Teste o cronograma em `http://localhost:3000/fisica/cronograma`

## 📝 Notas

- **Course ID 5:** ID do curso de Física no banco
- **Optativas:** Identificadas automaticamente pelo campo "Optativa" no nome
- **Créditos:** Array com [teoria, prática, complementar, outro]
- **Pré-requisitos:** Listados no final do arquivo SQL para referência

## 🔧 Customização

Se precisar modificar:

1. **Course ID:** Edite `COURSE_ID = 5` no Python script
2. **Marcadores de Optativa:** Edite a lógica em `"Optativa" in subj['name']`
3. **Novo CSV:** Rode o script novamente com o novo arquivo

---

**Gerado em:** 18 de março de 2026
**Status:** ✅ Pronto para uso
