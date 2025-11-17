# 🔐 Instruções para Ativar o Sistema de Login

## ✅ Passo a Passo

### 1️⃣ Atualizar o Google Apps Script

1. Abra seu Google Sheets
2. Vá em **Extensões** → **Apps Script**
3. **SUBSTITUA TODO O CÓDIGO** pelo conteúdo de `google-apps-script-database.js`
4. Clique em **Salvar** (💾)

### 2️⃣ Configurar o Sistema de Autenticação

1. Execute a função `onOpen`:
   - No Apps Script, selecione `onOpen` no menu dropdown
   - Clique em **Executar** (▶️)
   - Autorize se solicitado

2. Volte ao Google Sheets
3. Você verá dois menus novos:
   - 📊 **Banco de Dados**
   - 🔐 **Autenticação** ← este é o novo!

4. Clique em **🔐 Autenticação** → **⚙️ Configurar Sistema**
5. Confirme quando aparecer a mensagem

**Resultado:**
- ✅ Aba `users` criada
- ✅ Usuário `admin` criado com senha `admin`

### 3️⃣ Testar o Login

1. No terminal, execute:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:5173/edit`
3. Será redirecionado para `/login`
4. Digite:
   - **Usuário:** `admin`
   - **Senha:** `admin`
5. Clique em **Entrar**
6. Deve ser redirecionado para `/edit` ✅

### 4️⃣ IMPORTANTE: Alterar Senha Padrão

⚠️ A senha padrão `admin` é **insegura**!

**Para alterar:**

1. No Google Sheets, vá na aba `users`
2. Clique em **🔐 Autenticação** → **🔑 Gerar Hash de Senha**
3. Na função `testHashPassword()`, altere:
   ```javascript
   const password = 'admin'; // ← ALTERE AQUI para sua nova senha
   ```
4. Execute a função (▶️)
5. Copie o **hash** gerado
6. Na aba `users`, substitua o hash antigo pelo novo
7. Salve

---

## �� Resumo das Mudanças

### Arquivos Atualizados:

1. **`google-apps-script-database.js`** ← ESTE É O MAIS IMPORTANTE!
   - ✅ Funções de autenticação adicionadas
   - ✅ Caso `login` no `doPost`
   - ✅ Menu de autenticação no `onOpen`

2. **Frontend (já configurado):**
   - `src/contexts/AuthContext.jsx`
   - `src/components/Login.jsx`
   - `src/components/ProtectedRoute.jsx`
   - `src/index.jsx`

---

## 🧪 Testando

### ✅ Login Correto
- Usuário: `admin`, Senha: `admin`
- Deve entrar com sucesso

### ❌ Login Incorreto
- Senha errada → "Senha incorreta"
- Usuário não existe → "Usuário não encontrado"
- Usuário desativado → "Usuário desativado"

### 🔒 Rotas Protegidas
- `/edit` → precisa login
- `/:cur/edit` → precisa login
- Outras rotas → públicas

---

## 🆘 Problemas?

### "Ação não reconhecida"
→ Você **não atualizou** o Apps Script. Volte ao passo 1.

### "Sistema de autenticação não configurado"
→ Execute **🔐 Autenticação → ⚙️ Configurar Sistema**

### "CORS error"
→ Verifique se o Apps Script está publicado como "Qualquer pessoa"

### Loop de redirecionamento
→ Limpe o localStorage:
```javascript
localStorage.clear();
```

---

## 👥 Gerenciar Usuários

### Adicionar Novo Usuário:

**Via Interface:**
1. **🔐 Autenticação** → **➕ Adicionar Usuário**
2. Preencha os dados
3. Pronto!

**Manualmente:**
1. Vá na aba `users`
2. Gere o hash da senha (**🔑 Gerar Hash de Senha**)
3. Adicione uma nova linha:
   - username, passwordHash, name, role (admin/editor), active (TRUE)

### Desativar Usuário:
1. Vá na aba `users`
2. Mude `active` para `FALSE`

---

**Data:** 2025-11-17  
**Status:** ✅ Pronto para uso!
