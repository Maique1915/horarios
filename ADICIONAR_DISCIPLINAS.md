# Como Adicionar Disciplinas ao Banco de Dados

## 📋 Resumo

Você tem dois arquivos para adicionar as disciplinas de Física:

1. **`csv_to_sql_physics.py`** - Script Python que converte CSV em SQL
2. **`physics_subjects.sql`** - Arquivo SQL pronto para copiar e colar (já foi gerado!)

## 🚀 Passo 1: Entender a Estrutura

### Campos de Disciplina no Sistema

```sql
INSERT INTO subjects (
    course_id,        -- ID do curso (5 = Física)
    semester,         -- Semestre (1-9)
    acronym,          -- Código da disciplina (ex: "1A", "2C")
    name,             -- Nome completo da disciplina
    active,           -- TRUE/FALSE (ativa ou não)
    category,         -- 'MANDATORY' ou 'OPTIONAL'
    optional,         -- true/false (mesmo que category)
    workload,         -- Carga horária (geralmente 0)
    credits           -- Array de créditos [teoria, prática, complementar, outro]
)
```

**Formato de Créditos:** `ARRAY[4, 0, 0, 0]`
- Primeira posição: créditos teóricos
- Segunda: créditos práticos
- Terceira: atividades complementares
- Quarta: outro tipo

## 📄 Passo 2: Usar o Arquivo SQL Já Gerado

O arquivo `physics_subjects.sql` já foi criado e contém todos os 45 registros do curso de Física.

### Para adicionar via Supabase:

1. Acesse o Supabase Dashboard
2. Vá para **SQL Editor**
3. Crie uma nova query
4. Copie o conteúdo de `physics_subjects.sql`
5. Cole no editor SQL
6. Clique em **Run** ou **Execute**

**Localização:** `/home/maiq/Projetos/Horarios/physics_subjects.sql`

## 🐍 Passo 3: Se Precisar Regenerar ou Modificar

Se as disciplinas mudarem, regenere o SQL usando:

```bash
cd /home/maiq/Projetos/Horarios
python3 csv_to_sql_physics.py fisica.csv physics_subjects.sql
```

### Opções de Customização

Edite o script `csv_to_sql_physics.py`:

```python
# Configuration - MODIFY THESE VALUES
COURSE_ID = 5          # Mudar se Física tiver outro ID
MAKE_OPTIONAL = False  # True para marcar tudo como opcional
```

## 📊 Estrutura do CSV

O arquivo `fisica.csv` deve ter as colunas:

```csv
code,name,period,credits,prerequisites
1A,Introdução às Ciências Experimentais,1,"[1, 2, 0, 0]",[]
2A,Mecânica Básica,2,"[3, 1, 0, 0]","[""1A"", ""1D""]"
```

- **code**: Código da disciplina (ex: "1A", "2C")
- **name**: Nome completo
- **period**: Semestre (1-9)
- **credits**: Array JSON com [teoria, prática, complementar, outro]
- **prerequisites**: Array JSON com códigos de pré-requisitos

## 🔗 Passo 4: Adicionar Pré-requisitos

Os pré-requisitos **não são adicionados** automaticamente na inserção de disciplinas. Você tem duas opções:

### Opção A: Usar a Interface Web

1. Acesse `http://localhost:3000/admin/subjects`
2. Selecione o curso de Física
3. Para cada disciplina, clique em editar
4. Adicione os pré-requisitos manualmente

### Opção B: Usar Supabase SQL (Avançado)

Você verá a lista de pré-requisitos no final do arquivo `physics_subjects.sql`:

```
-- PREREQUISITES MAPPING (for reference)
-- 2C requires: 1D
-- 3B requires: 1C
-- etc...
```

Para inserir via SQL, execute após inserir as disciplinas:

```sql
-- Primeiro, obter os IDs das disciplinas
SELECT id, acronym FROM subjects WHERE course_id = 5;

-- Depois, inserir os pré-requisitos
-- Exemplo: Se 2C tem ID 7 e 1D tem ID 4:
INSERT INTO subject_requirements (subject_id, type, prerequisite_subject_id)
VALUES (7, 'SUBJECT', 4);  -- 2C requer 1D
```

## ✅ Verificação

Após adicionar, verifique:

1. **Ver disciplinas adicionadas:**
   ```bash
   curl "http://localhost:3000/api/courses/5" 2>/dev/null | jq
   ```

2. **No admin:**
   - Acesse `http://localhost:3000/admin/subjects`
   - Selecione "Curso de Física"
   - Veja todas as 45 disciplinas listadas

3. **No cronograma:**
   - Acesse `http://localhost:3000/fisica/cronograma`
   - Veja o mapa com os períodos e disciplinas

## 🎯 Resumo Rápido

1. ✅ Arquivo SQL já foi gerado: `physics_subjects.sql`
2. ✅ Copie o conteúdo dele
3. ✅ Cole no Supabase SQL Editor
4. ✅ Execute (Run)
5. ✅ Pronto! As 45 disciplinas foram adicionadas

Se precisar regenerar: `python3 csv_to_sql_physics.py fisica.csv`

## 🛠️ Estrutura Técnica

### Fluxo de Adição no Sistema

```
CSV (fisica.csv)
    ↓
Python Script (csv_to_sql_physics.py)
    ↓
SQL INSERT (physics_subjects.sql)
    ↓
Supabase Database
    ↓
API carrega via loadDbData()
    ↓
Interface web mostra disciplinas
```

### Tabelas Envolvidas

- **subjects**: Armazena as disciplinas
- **subject_requirements**: Armazena os pré-requisitos
- **courses**: Armazena os cursos (Física = ID 5)

---

**Última atualização:** 18 de março de 2026
