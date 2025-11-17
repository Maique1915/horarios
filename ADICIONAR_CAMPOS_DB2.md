# 📊 Como Adicionar Campos de db2.json no Google Sheets

## 🎯 Objetivo

Adicionar os campos de configuração do curso (`name`, `_da`, `_hd`) nas abas já existentes do Google Sheets.

## 📋 Campos a Adicionar

### 1. **name** (Nome do Curso)
- Nome completo do curso em maiúsculas
- Exemplo: "ENGCOMP", "MATEMATICA"
- Opcional: pode deixar vazio se não quiser mostrar

### 2. **_da** (Dimensões)
- Array `[horários, dias]`
- Define tamanho da grade de horários
- Exemplo: `[12, 5]` = 12 horários por dia, 5 dias
- **MESMO VALOR** para todas as disciplinas do curso

### 3. **_hd** (Horários Disponíveis)
- Array de `[[inicio, fim], ...]`
- Define os horários possíveis do curso
- Exemplo: `[["07:00", "07:50"], ["07:50", "08:40"], ...]`
- **MESMO VALOR** para todas as disciplinas do curso

## 🚀 Passo a Passo

### Passo 1: Gerar Arquivos CSV

```bash
cd /home/sandra/Projetos/Matricula
python3 generate_db2_fields.py
```

Isso cria:
- `db2_engcomp.csv`
- `db2_matematica.csv`
- `db2_fisica.csv`
- `db2_turismo.csv`

### Passo 2: Adicionar Colunas no Google Sheets

Para **cada aba** (engcomp, matematica, etc):

1. **Abra a planilha** do Google Sheets
2. **Clique na aba** do curso
3. **Role até o final** das colunas (após `_da` atual)
4. **Adicione 3 novas colunas** com os nomes:
   - `name`
   - `_da`
   - `_hd`

**Layout das colunas:**
```
| _cu | _se | _di | _re | ... | _au | _ha | _da | name | _da | _hd |
```

> ⚠️ **ATENÇÃO**: Sim, teremos duas colunas `_da` por enquanto (uma antiga, uma nova)

### Passo 3: Preencher os Valores

#### 3.1 Abrir o CSV do curso

Exemplo para engcomp:
```bash
# No computador, abra com Bloco de Notas ou editor
db2_engcomp.csv
```

Conteúdo:
```csv
_cu,name,_da,_hd
"engcomp","ENGCOMP","[12, 5]","[["07:00", "07:50"], ...]"
```

#### 3.2 Copiar Valores

**Método Manual:**

1. Abra o arquivo CSV
2. Copie o valor de `name`: `ENGCOMP`
3. Cole na coluna `name`, **primeira linha** de dados
4. Copie o valor de `_da`: `[12, 5]`
5. Cole na nova coluna `_da`, **primeira linha**
6. Copie o valor de `_hd`: `[["07:00", "07:50"], ...]`
7. Cole na coluna `_hd`, **primeira linha**

**Método Rápido (Importar):**

1. No Google Sheets, clique em **Arquivo > Importar**
2. Faça upload do arquivo `db2_engcomp.csv`
3. Selecione **"Anexar à planilha atual"**
4. Copie apenas os valores das colunas `name`, `_da`, `_hd`
5. Cole nas novas colunas da aba

### Passo 4: Preencher para Todas as Linhas

**Para `_da` e `_hd`** (DEVEM SER IGUAIS EM TODAS AS LINHAS):

1. Selecione a célula com o valor
2. Copie (Ctrl+C ou Cmd+C)
3. Selecione **todas as células abaixo** na mesma coluna
4. Cole (Ctrl+V ou Cmd+V)

**Ou use o atalho:**

1. Selecione a célula com o valor
2. Selecione até a última linha da coluna
3. Pressione **Ctrl+D** (Windows) ou **Cmd+D** (Mac)
   - Isso preenche para baixo automaticamente

**Para `name`:**
- Pode deixar vazio
- Ou copiar o nome da disciplina (coluna `_di`)
- Ou usar um nome personalizado

## 📊 Exemplo Visual

### Antes:
```
| _cu      | _se | _di                | ... | _da |
|----------|-----|--------------------|-----|-----|
| engcomp  | 1   | Cálculo I          | ... |     |
| engcomp  | 1   | Programação        | ... |     |
```

### Depois:
```
| _cu      | _se | _di          | ... | _da | name    | _da      | _hd                    |
|----------|-----|--------------|-----|-----|---------|----------|------------------------|
| engcomp  | 1   | Cálculo I    | ... |     | ENGCOMP | [12, 5]  | [["07:00","07:50"],...]|
| engcomp  | 1   | Programação  | ... |     | ENGCOMP | [12, 5]  | [["07:00","07:50"],...]|
```

## 🔍 Valores por Curso

### Engenharia da Computação
```json
{
  "name": "ENGCOMP",
  "_da": [12, 5],
  "_hd": [
    ["07:00", "07:50"], ["07:50", "08:40"], ["08:40", "09:30"],
    ["10:00", "10:50"], ["10:50", "11:40"], ["11:40", "12:30"],
    ["14:00", "14:50"], ["14:50", "15:40"], ["15:40", "16:30"],
    ["16:30", "17:20"], ["17:20", "18:10"], ["18:10", "19:00"]
  ]
}
```

### Matemática
```json
{
  "name": "MATEMATICA",
  "_da": [7, 5],
  "_hd": [
    ["15:30", "16:30"], ["16:30", "17:30"], ["17:30", "18:30"],
    ["18:30", "19:30"], ["20:00", "21:00"], ["21:00", "22:00"],
    ["22:00", "23:00"]
  ]
}
```

### Física
```json
{
  "name": "FISICA",
  "_da": [8, 5],
  "_hd": [
    ["14:30", "15:30"], ["15:30", "16:30"], ["16:30", "17:30"],
    ["17:30", "18:30"], ["18:30", "19:30"], ["20:30", "21:30"],
    ["21:30", "22:30"], ["22:30", "23:30"]
  ]
}
```

### Turismo
```json
{
  "name": "TURISMO",
  "_da": [5, 6],
  "_hd": [
    ["18:30", "19:15"], ["19:15", "20:00"], ["20:15", "21:00"],
    ["21:00", "21:45"], ["21:45", "22:30"]
  ]
}
```

## ⚠️ Importante

1. **NÃO APAGUE** a coluna `_da` antiga ainda
2. Os valores de `_da` e `_hd` **DEVEM SER IDÊNTICOS** em todas as linhas do curso
3. O campo `name` pode variar por linha (opcional)
4. Mantenha as aspas nos arrays JSON
5. Não adicione espaços extras

## ✅ Verificação

Após adicionar, verifique:

- [ ] Coluna `name` adicionada
- [ ] Coluna `_da` (nova) adicionada  
- [ ] Coluna `_hd` adicionada
- [ ] Valores preenchidos em **todas as linhas**
- [ ] Arrays JSON mantêm o formato correto
- [ ] Valores de `_da` e `_hd` são iguais em todas as linhas

## 🔄 Depois de Adicionar

1. **Publique** a planilha novamente na web
2. **Recarregue** a página do sistema (F5)
3. **Teste** a funcionalidade

## 💡 Dicas

- Use **Ctrl+D** ou **Cmd+D** para preencher rapidamente
- Cole os valores em bloco (selecione todas as células)
- Confira se os arrays JSON estão corretos
- Mantenha backup da planilha antes de modificar

## 🛠️ Problemas Comuns

### "Coluna duplicada _da"
- Normal! Teremos duas por enquanto
- A antiga será removida depois

### "Array não está formatado corretamente"
- Certifique-se de copiar com aspas duplas
- Não adicione espaços extras
- Mantenha o formato: `[["07:00","07:50"],...]`

### "Valores diferentes entre linhas"
- `_da` e `_hd` devem ser IGUAIS em todas as linhas
- Use Ctrl+D para copiar para baixo

## 📚 Arquivos Relacionados

- `db2.json` - Configurações originais
- `generate_db2_fields.py` - Script gerador
- `db2_*.csv` - CSVs gerados para cada curso
- `GOOGLE_SHEETS_TABS.md` - Guia das abas

---

**Pronto!** Agora seus cursos terão as configurações de horário necessárias! 🎓
