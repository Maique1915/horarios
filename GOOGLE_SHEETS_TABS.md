# 📚 Como Configurar Múltiplas Abas (Tabs) no Google Sheets

## 🎯 Regra Principal

**CADA CURSO = UMA ABA com o MESMO NOME do curso**

```
Google Sheets (uma planilha)
├── Aba "engcomp"     → Curso engcomp
├── Aba "matematica"  → Curso matematica
├── Aba "adm"         → Curso adm
└── Aba "engmec"      → Curso engmec
```

⚠️ **IMPORTANTE**: O nome da aba DEVE ser exatamente igual ao código do curso (minúsculas, sem espaços)

---

## 📋 Passo 1: Obter o GID de cada Aba

### O que é GID?
**GID** (Group ID) é o identificador único de cada aba/sheet no Google Sheets.

### Como Descobrir o GID:

1. **Abra sua planilha** no Google Sheets
2. **Clique na aba** que quer configurar (ex: "matematica")
3. **Olhe a URL** no navegador. Ela será algo como:
   ```
   https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9/edit#gid=123456789
                                                                    ↑
                                                            Este é o GID!
   ```
4. **Copie o número** após `gid=`

### Exemplos:
- Aba "engcomp" → URL termina com `#gid=0` → GID = **0**
- Aba "matematica" → URL termina com `#gid=987654321` → GID = **987654321**

---

## 🔧 Passo 2: Configurar no Sistema

1. Abra o arquivo: `src/model/loadData.js`
2. Na **linha 2-7**, você verá:

```javascript
const GOOGLE_SHEETS_TABS = {
    'engcomp': 'https://docs.google.com/.../pub?gid=0&single=true&output=csv',
    'matematica': 'https://docs.google.com/.../pub?gid=COLE_O_GID_AQUI&single=true&output=csv'
};
```

3. **Substitua `COLE_O_GID_AQUI`** pelo GID que você descobriu
4. **Adicione novos cursos** seguindo o mesmo padrão:

```javascript
const GOOGLE_SHEETS_TABS = {
    'engcomp': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?gid=0&single=true&output=csv',
    'matematica': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?gid=123456789&single=true&output=csv',
    'adm': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?gid=987654321&single=true&output=csv',
    'engmec': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?gid=111222333&single=true&output=csv'
};
```

---

## 📝 Passo 3: Adicionar Novo Curso

### Fluxo COMPLETO ao adicionar um curso:

#### No Sistema:
1. Acesse `/edit`
2. Clique em "Adicionar Curso"
3. Digite o código (ex: `engmec`)
4. Clique "Adicionar"
5. Dados são copiados automaticamente

#### No Google Sheets:
6. **Clique no "+" no canto inferior** para criar nova aba
7. **Renomeie** a aba para `engmec` (exatamente o código que você digitou)
8. **Copie o cabeçalho** (primeira linha) da aba "engcomp"
9. **Cole** na primeira linha da nova aba
10. **Vá para a segunda linha** e cole os dados copiados (Ctrl+V)

#### De volta ao código:
11. **Veja a URL** com a nova aba selecionada: `#gid=123456789`
12. **Copie o GID** (número após `gid=`)
13. **Edite** `src/model/loadData.js`:
    ```javascript
    'engmec': 'URL_DA_PLANILHA/pub?gid=123456789&single=true&output=csv'
    ```
14. **Salve** e **recarregue** o navegador

✅ Pronto! O curso está configurado!

---

## 🎨 Template da URL

Para facilitar, use este template ao adicionar novos cursos:

```javascript
'CODIGO_DO_CURSO': 'https://docs.google.com/spreadsheets/d/e/SEU_ID_AQUI/pub?gid=GID_DA_ABA&single=true&output=csv'
```

**Substituir:**
- `CODIGO_DO_CURSO` → código do curso em minúsculas (ex: `engmec`)
- `SEU_ID_AQUI` → ID da planilha (o mesmo para todas as abas)
- `GID_DA_ABA` → GID específico da aba do curso

---

## 🔍 Como Obter a URL Completa

### Método Automático (Recomendado):

1. Abra sua planilha
2. Clique na aba desejada
3. Vá em **Arquivo > Compartilhar > Publicar na web**
4. Em **"Páginas publicadas"**, selecione a aba específica
5. Em **"Link"**, escolha **"Planilha da Web"**
6. Clique em **"Publicar"**
7. Copie o link gerado
8. Adicione `&single=true&output=csv` no final

### URL Final deve ser:
```
https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=123456&single=true&output=csv
```

---

## ✅ Exemplo Completo

```javascript
// src/model/loadData.js

const GOOGLE_SHEETS_TABS = {
    // Engenharia da Computação (primeira aba, GID = 0)
    'engcomp': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?gid=0&single=true&output=csv',
    
    // Matemática (segunda aba, GID = 123456789)
    'matematica': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?gid=123456789&single=true&output=csv',
    
    // Administração (terceira aba, GID = 987654321)
    'adm': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?gid=987654321&single=true&output=csv'
};
```

---

## 🎯 Formato de Cada Aba

Cada aba deve ter o **mesmo formato de colunas**:

```csv
_cu,_se,_di,_re,_ap,_at,_el,_ag,_pr,_ho,_au,_ha,_da
engcomp,1,Disciplina Exemplo,1A,2,2,false,true,[],"[[0,1]]",T.101,[],
```

**Importante:**
- A coluna `_cu` deve ter o código do curso
- Mantenha o cabeçalho idêntico em todas as abas
- Use vírgula como separador

---

## 🚀 Vantagens

✅ **Organização** - Cada curso tem sua própria aba  
✅ **Facilidade** - Fácil de editar e visualizar  
✅ **Independência** - Cursos separados não se misturam  
✅ **Escalável** - Adicione quantos cursos quiser  
✅ **Performance** - Cache por curso  

---

## ⚠️ Importante

- **Não delete** a primeira aba (engcomp) sem configurar outra como padrão
- **Sempre publique** a planilha na web para as URLs funcionarem
- **Use GID correto** - cada aba tem seu próprio GID único
- **Mantenha o formato** - todas as abas devem ter as mesmas colunas

---

## 🔄 Fluxo de Adicionar Novo Curso

```
1. Sistema → Adicionar Curso → Digite "engmec"
                    ↓
2. Google Sheets → Criar nova aba "engmec"
                    ↓
3. Copiar cabeçalho de outra aba
                    ↓
4. Adicionar primeira disciplina do curso
                    ↓
5. Descobrir GID da aba (olhar URL)
                    ↓
6. Código → Adicionar em GOOGLE_SHEETS_TABS
                    ↓
7. Salvar e recarregar
                    ↓
8. ✅ Novo curso funcionando!
```

---

## 💡 Dicas

- Mantenha nomes de abas em **minúsculas**
- Use nomes **curtos** para os códigos
- **Documente** os GIDs em algum lugar
- Faça **backup** da configuração do `loadData.js`
