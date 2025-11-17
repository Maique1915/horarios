# 📝 Converter db_mat.json para CSV

## 🎯 Objetivo

Converter o arquivo `db_mat.json` (formato antigo) para o formato padrão e exportar como CSV para importar no Google Sheets.

## 🔧 Transformações Realizadas

### 1. **Campo `_ho` (Horários)**

**Antes** (matriz de booleanos):
```json
"_ho": [
  [false, true, false, false, ...],  // Segunda: horário 1
  [true, false, false, false, ...],  // Terça: horário 0
  ...
]
```

**Depois** (lista de coordenadas):
```json
"_ho": [[0, 1], [1, 0]]  // [dia, horário]
```

### 2. **Campos Adicionados**

Se não existirem, são adicionados:
- `_au`: Auditório/Sala (vazio por padrão)
- `_ha`: Histórico (array vazio)
- `_da`: Data (string vazia)

### 3. **Ordem dos Campos**

Garante a mesma ordem do `db.json`:
```
_cu, _se, _di, _re, _ap, _at, _el, _ag, _pr, _ho, _au, _ha, _da
```

## 🚀 Como Usar

### Passo 1: Executar o Script

```bash
cd /home/sandra/Projetos/Matricula
python3 convert_db_mat.py
```

### Passo 2: Verificar Arquivos Gerados

O script gera dois arquivos:

1. **`src/model/db_mat_transformed.json`**
   - JSON no formato padrão
   - Útil para conferir os dados antes de importar

2. **`db_mat_matematica.csv`**
   - CSV pronto para importar no Google Sheets
   - Inclui cabeçalho

### Passo 3: Importar no Google Sheets

1. Abra sua planilha do Google Sheets
2. Clique na aba **"matematica"**
3. Vá em **Arquivo > Importar**
4. Escolha **"Fazer upload"**
5. Selecione o arquivo **`db_mat_matematica.csv`**
6. Configurações:
   - Local de importação: **"Substituir planilha atual"** ou **"Anexar à planilha atual"**
   - Tipo de separador: **"Detectar automaticamente"** (vírgula)
7. Clique em **"Importar dados"**

## 📊 Exemplo de Saída

### Console:
```
============================================================
🔧 Conversor db_mat.json → db.json + CSV
============================================================

📖 Lendo db_mat.json...
✅ 43 disciplinas carregadas
✅ 43 disciplinas transformadas

💾 JSON salvo: src/model/db_mat_transformed.json
💾 CSV salvo: db_mat_matematica.csv
📊 43 linhas + 1 cabeçalho

✅ CONVERSÃO COMPLETA!
```

### CSV Gerado:
```csv
_cu,_se,_di,_re,_ap,_at,_el,_ag,_pr,_ho,_au,_ha,_da
matematica,1,Educação e Sociedade,1A,3,0,true,false,[],[],,[],
matematica,1,Educação Financeira,1B,0,3,true,false,[],[],,[],
...
```

## 🔍 Validação

### JSON Transformado
O arquivo `db_mat_transformed.json` pode ser usado para:
- Conferir se todos os horários foram convertidos corretamente
- Verificar se os campos estão na ordem correta
- Comparar com o formato do `db.json` original

### CSV
- Todas as listas são convertidas para strings JSON: `[]`, `["1A"]`
- Booleanos são convertidos para lowercase: `true`, `false`
- Campos vazios são representados como strings vazias

## ⚠️ Notas Importantes

1. **Horários Vazios**: Disciplinas sem horários terão `_ho: []`
2. **Curso**: Todas as disciplinas terão `_cu: "matematica"`
3. **Ativa**: O campo `_ag` (ativa) mantém o valor original do `db_mat.json`
4. **Backup**: Recomenda-se fazer backup da aba antes de importar

## 🛠️ Solução de Problemas

### Erro: "Arquivo não encontrado"
- Verifique se `src/model/db_mat.json` existe
- Execute o script a partir da pasta raiz do projeto

### CSV não importa corretamente
- Verifique se o arquivo está codificado em UTF-8
- Tente usar ";" como separador se a vírgula não funcionar
- Abra o CSV no Bloco de Notas para verificar o conteúdo

### Horários não aparecem
- Os horários vazios (`[]`) são normais para disciplinas sem horário definido
- Você pode editar manualmente no Google Sheets depois

## 📚 Arquivos Relacionados

- `src/model/db_mat.json` - Arquivo original (formato antigo)
- `src/transform_ho.py` - Script antigo que transforma apenas `_ho`
- `db.json` - Exemplo do formato padrão (engcomp)
- `convert_db_mat.py` - **Este script** (conversão completa)

## 💡 Dicas

- Execute o script sempre que atualizar o `db_mat.json`
- Mantenha uma cópia do CSV gerado como backup
- Após importar no Google Sheets, configure o GID da aba no `loadData.js`
