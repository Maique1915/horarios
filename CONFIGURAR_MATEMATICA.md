# 🔧 Como Configurar o Curso "matematica"

## ⚠️ Problema Atual

O curso "matematica" não está aparecendo porque a URL ainda tem o placeholder `COLE_O_GID_AQUI`.

## ✅ Solução Rápida

### Passo 1: Descobrir o GID da Aba

1. Abra sua planilha do Google Sheets
2. Clique na aba **"matematica"** (tem que ter esse nome exato)
3. Olhe a URL no navegador:
   ```
   https://docs.google.com/spreadsheets/d/1ABC.../edit#gid=123456789
                                                       ↑
                                                  Este número!
   ```
4. Copie o número que aparece após `gid=`

### Passo 2: Configurar no Código

1. Abra o arquivo: `src/model/loadData.js`
2. Procure pela linha 16 (ou próxima):
   ```javascript
   // 'matematica': 'https://docs.google.com/.../pub?gid=COLE_O_GID_AQUI&single=true&output=csv'
   ```

3. **DESCOMENTE** (remova o `//` do início)
4. **SUBSTITUA** `COLE_O_GID_AQUI` pelo número que você copiou
5. Deve ficar assim:
   ```javascript
   'matematica': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?gid=123456789&single=true&output=csv'
   ```

6. **SALVE** o arquivo
7. **RECARREGUE** o navegador (F5 ou Ctrl+R)

### Passo 3: Verificar

Abra o Console do navegador (F12) e procure por:
```
✅ loadDbData: Dados convertidos para "matematica": X disciplinas
```

Se aparecer:
```
⚠️ loadDbData: Curso "matematica" não está configurado!
```

Significa que ainda tem `COLE_O_GID_AQUI` na URL.

---

## 📋 Exemplo Completo

**Antes:**
```javascript
const GOOGLE_SHEETS_TABS = {
    'engcomp': 'https://docs.google.com/.../pub?gid=0&single=true&output=csv',
    // 'matematica': 'https://docs.google.com/.../pub?gid=COLE_O_GID_AQUI&single=true&output=csv'
};
```

**Depois (com GID = 987654321):**
```javascript
const GOOGLE_SHEETS_TABS = {
    'engcomp': 'https://docs.google.com/.../pub?gid=0&single=true&output=csv',
    'matematica': 'https://docs.google.com/.../pub?gid=987654321&single=true&output=csv'
};
```

---

## 🔍 Como Verificar se a Aba Existe

No Google Sheets, você deve ter:
- ✅ Uma aba chamada exatamente **"matematica"** (minúsculas, sem acento)
- ✅ Com o mesmo formato de colunas da aba "engcomp"
- ✅ Com dados de disciplinas do curso de matemática

---

## 💡 Dica Rápida

Se você não quer configurar agora, pode **comentar a linha** temporariamente:

```javascript
const GOOGLE_SHEETS_TABS = {
    'engcomp': 'https://docs.google.com/.../pub?gid=0&single=true&output=csv',
    // 'matematica': 'https://docs.google.com/.../pub?gid=COLE_O_GID_AQUI&single=true&output=csv' // DESABILITADO
};
```

Assim o sistema só carrega "engcomp" e não tenta carregar "matematica".

---

## ❓ Ainda com Dúvidas?

Veja o arquivo `GOOGLE_SHEETS_TABS.md` para instruções mais detalhadas.
