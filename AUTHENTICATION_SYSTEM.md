# 🔐 Sistema de Autenticação com Google Sheets

## 📝 Objetivo

Implementar autenticação segura para proteger as rotas `/edit` e `/:cur/edit`, permitindo apenas usuários autorizados a gerenciar disciplinas.

---

## 🏗️ Arquitetura

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React App     │─────▶│  Apps Script     │─────▶│  Google Sheets  │
│  (Frontend)     │◀─────│  (Backend API)   │◀─────│   (Database)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
   │
   ├─ AuthContext (gerencia sessão)
   ├─ Login (página de login)
   ├─ ProtectedRoute (protege rotas)
   └─ localStorage (armazena token)
```

---

## 📦 Componentes Criados

### **1. AuthContext.jsx**
**Localização:** `src/contexts/AuthContext.jsx`

**Responsabilidades:**
- Gerenciar estado de autenticação
- Fazer login/logout
- Persistir sessão no localStorage
- Validar token

**API:**
```javascript
const { user, loading, login, logout, isAuthenticated } = useAuth();

// user: { username, name, role }
// loading: boolean (verificando sessão)
// login(username, password): Promise<{success, error}>
// logout(): void
// isAuthenticated(): boolean
```

**Uso:**
```jsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
    const { user, logout } = useAuth();
    
    return (
        <div>
            <p>Bem-vindo, {user.name}!</p>
            <button onClick={logout}>Sair</button>
        </div>
    );
};
```

---

### **2. Login.jsx**
**Localização:** `src/components/Login.jsx`

**Características:**
- ✅ Design moderno e responsivo
- ✅ Validação de campos
- ✅ Mensagens de erro claras
- ✅ Mostrar/ocultar senha
- ✅ Loading durante autenticação
- ✅ Redirect após login

**Visual:**
```
┌─────────────────────────────────┐
│      🔒 Área Restrita           │
│  Acesso exclusivo para admins   │
├─────────────────────────────────┤
│                                 │
│  👤 Usuário                     │
│  ┌─────────────────────────┐   │
│  │ Digite seu usuário      │   │
│  └─────────────────────────┘   │
│                                 │
│  🔑 Senha                       │
│  ┌─────────────────────────┐   │
│  │ Digite sua senha    👁️  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │       Entrar ➡️         │   │
│  └─────────────────────────┘   │
│                                 │
│  ← Voltar para Home             │
└─────────────────────────────────┘
```

---

### **3. ProtectedRoute.jsx**
**Localização:** `src/components/ProtectedRoute.jsx`

**Funcionalidade:**
- Verifica se usuário está autenticado
- Redireciona para `/login` se não estiver
- Salva URL original para redirect após login

**Uso:**
```jsx
<Route 
    path="/edit" 
    element={
        <ProtectedRoute>
            <EditDb />
        </ProtectedRoute>
    }
/>
```

---

## 🗄️ Google Sheets - Estrutura

### **Aba: `users`**

| username | passwordHash | name | role | active |
|----------|-------------|------|------|--------|
| admin | 8c6976e5b5...918 | Administrador | admin | TRUE |
| sandra | 6ca13d52ca...090 | Sandra Silva | editor | TRUE |
| joao | 8d969eef6e...c92 | João Santos | viewer | FALSE |

**Colunas:**

1. **username** (string): Nome de usuário único
2. **passwordHash** (string): Hash SHA-256 da senha
3. **name** (string): Nome completo do usuário
4. **role** (string): Função (admin, editor, viewer)
5. **active** (boolean): Se o usuário está ativo

---

## 🔧 Configuração Passo a Passo

### **Passo 1: Configurar Google Apps Script**

1. Abra seu Google Sheets
2. Vá em **Extensões** → **Apps Script**
3. Copie o código de `google-apps-script-auth.js`
4. Cole no editor
5. Clique em **Salvar** (💾)

### **Passo 2: Executar Configuração Inicial**

1. No Apps Script, vá em **Executar** → `onOpen`
2. Autorize o script (primeira vez)
3. No Google Sheets, aparecerá um menu **🔐 Autenticação**
4. Clique em **🔐 Autenticação** → **Configurar Sistema**
5. Confirme a criação da aba `users`

**Resultado:**
- ✅ Aba `users` criada
- ✅ Usuário admin criado (username: `admin`, senha: `admin`)
- ⚠️ **IMPORTANTE:** Altere a senha padrão!

### **Passo 3: Deploy como Web App**

1. No Apps Script, clique em **Implantar** → **Nova implantação**
2. Tipo: **Aplicativo da Web**
3. Configurações:
   - **Executar como:** Você
   - **Quem tem acesso:** Qualquer pessoa
4. Clique em **Implantar**
5. **Copie a URL** gerada (ex: `https://script.google.com/macros/s/AKfy...`)

### **Passo 4: Atualizar URL no Frontend**

Abra `src/contexts/AuthContext.jsx` e atualize a URL:

```javascript
const AUTH_SCRIPT_URL = 'SUA_URL_AQUI';
```

---

## 🔑 Gerenciamento de Usuários

### **Adicionar Novo Usuário (Via Interface)**

1. No Google Sheets, vá em **🔐 Autenticação** → **Adicionar Usuário**
2. Preencha os dados solicitados
3. Usuário será adicionado automaticamente

### **Adicionar Usuário Manualmente**

1. Vá na aba `users`
2. Adicione uma nova linha com:
   - `username`: nome de usuário
   - `passwordHash`: hash da senha (gere usando o menu)
   - `name`: nome completo
   - `role`: função (admin/editor/viewer)
   - `active`: TRUE

### **Gerar Hash de Senha**

**Método 1: Via Menu**
1. **🔐 Autenticação** → **Gerar Hash de Senha**
2. Edite a função `testHashPassword()` com a senha desejada
3. Execute a função
4. Copie o hash gerado

**Método 2: Online**
1. Acesse: https://emn178.github.io/online-tools/sha256.html
2. Digite a senha
3. Copie o hash (minúsculas)

**Hashes comuns:**
```
admin   → 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
123456  → 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
senha123→ 6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090
```

### **Desativar Usuário**

1. Na aba `users`, localize o usuário
2. Mude a coluna `active` para `FALSE`
3. Usuário não poderá mais fazer login

---

## 🔐 Fluxo de Autenticação

### **1. Login**

```
Usuário digita credenciais
  ↓
Frontend gera hash SHA-256 da senha
  ↓
Envia para Apps Script
  ↓
Apps Script busca na aba 'users'
  ↓
Verifica username e passwordHash
  ↓
Se correto:
  - Retorna dados do usuário
  - Frontend salva no localStorage
  - Redireciona para página solicitada
  ↓
Se incorreto:
  - Retorna erro
  - Exibe mensagem ao usuário
```

### **2. Verificação de Sessão**

```
Usuário acessa página protegida
  ↓
ProtectedRoute verifica localStorage
  ↓
Se tem token válido:
  - Verifica expiração
  - Se válido: permite acesso
  - Se expirado: redireciona para login
  ↓
Se não tem token:
  - Redireciona para login
  - Salva URL atual para redirect
```

### **3. Logout**

```
Usuário clica em "Sair"
  ↓
Frontend limpa localStorage
  ↓
AuthContext limpa estado (user = null)
  ↓
Redireciona para Home
```

---

## 🛡️ Segurança

### **✅ Medidas Implementadas**

1. **Hash de Senhas (SHA-256)**
   - Senhas nunca são armazenadas em texto puro
   - Hash é gerado no frontend antes de enviar

2. **Token com Expiração**
   - Sessão expira em 8 horas
   - Token é validado a cada carregamento

3. **localStorage**
   - Armazena apenas dados não-sensíveis
   - Token é invalidado após logout

4. **Rotas Protegidas**
   - `ProtectedRoute` bloqueia acesso não autorizado
   - Redirect automático para login

### **⚠️ Limitações (Ambiente de Desenvolvimento)**

Este é um sistema **básico** adequado para:
- ✅ Ambientes de desenvolvimento
- ✅ Uso interno/pequenas equipes
- ✅ Dados não-sensíveis

**NÃO use em produção com dados sensíveis sem:**
- ❌ HTTPS obrigatório
- ❌ JWT (JSON Web Tokens)
- ❌ Backend real com autenticação robusta
- ❌ Rate limiting
- ❌ 2FA (autenticação de dois fatores)

---

## 🧪 Testando o Sistema

### **Teste 1: Login com Sucesso**

1. Acesse `http://localhost:5173/edit`
2. Será redirecionado para `/login`
3. Digite:
   - Usuário: `admin`
   - Senha: `admin`
4. Clique em **Entrar**
5. Será redirecionado para `/edit`

### **Teste 2: Login com Erro**

1. Acesse `/login`
2. Digite credenciais inválidas
3. Verifique mensagem de erro
4. Não deve redirecionar

### **Teste 3: Acesso Sem Login**

1. **Não estando logado**, acesse `/edit`
2. Deve ser redirecionado para `/login`
3. Após login, deve voltar para `/edit`

### **Teste 4: Persistência de Sessão**

1. Faça login
2. Recarregue a página (F5)
3. Deve continuar logado
4. Verifique no localStorage:
   - `auth_user`
   - `auth_token`
   - `auth_expiry`

### **Teste 5: Expiração de Sessão**

1. Faça login
2. No console do navegador:
   ```javascript
   // Simular expiração
   localStorage.setItem('auth_expiry', new Date('2020-01-01').toISOString());
   ```
3. Recarregue a página
4. Deve ser deslogado e redirecionado

### **Teste 6: Logout**

1. Faça login
2. Clique no botão **Sair** (no AppLayout)
3. Confirme a ação
4. Deve ser redirecionado para Home
5. Tente acessar `/edit` → deve pedir login novamente

---

## 🎨 Interface do Usuário

### **Botão de Logout no AppLayout**

**Localização:** Header superior direito

```
┌─────────────────────────────────────┐
│ Sistema de Matrículas │ [👤 Admin] [Sair] [⚙️ Admin] │
└─────────────────────────────────────┘
```

**Quando logado:**
- Exibe nome do usuário
- Botão "Sair" visível
- Link para Admin

**Quando NÃO logado:**
- Não exibe informações de usuário
- Link para Admin redireciona para login

---

## 📊 Estrutura de Dados

### **localStorage**

```javascript
{
  "auth_user": {
    "username": "admin",
    "name": "Administrador",
    "role": "admin"
  },
  "auth_token": "YWRtaW46MTczMjE0MzA1MjA2Mw==",
  "auth_expiry": "2025-11-17T10:30:52.063Z"
}
```

### **Resposta do Apps Script (Sucesso)**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "username": "admin",
  "name": "Administrador",
  "role": "admin"
}
```

### **Resposta do Apps Script (Erro)**

```json
{
  "success": false,
  "error": "Senha incorreta"
}
```

---

## 🔄 Rotas Protegidas

```jsx
// src/index.jsx

const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    {
        path: '/',
        element: <AppLayout />,
        children: [
            // ✅ PROTEGIDA
            { 
                path: 'edit', 
                element: (
                    <ProtectedRoute>
                        <CourseSelector />
                    </ProtectedRoute>
                )
            },
            
            // ❌ PÚBLICA
            { path: ':cur', element: <Quadro /> },
            { path: ':cur/grades', element: <GeraGrade /> },
            { path: ':cur/cronograma', element: <MapaMental /> },
            
            // ✅ PROTEGIDA
            { 
                path: ':cur/edit', 
                element: (
                    <ProtectedRoute>
                        <EditDb />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);
```

---

## 🐛 Troubleshooting

### **Problema: "CORS error"**

**Solução:**
1. Verifique se o Apps Script está publicado como "Qualquer pessoa"
2. Reimplante o Apps Script
3. Atualize a URL no `AuthContext.jsx`

### **Problema: "Usuário não encontrado"**

**Solução:**
1. Verifique se a aba `users` existe
2. Verifique se o username está correto (case-sensitive)
3. Verifique se `active = TRUE`

### **Problema: "Senha incorreta"**

**Solução:**
1. Gere o hash correto da senha
2. Verifique se o hash na planilha está correto
3. Verifique se não há espaços extras

### **Problema: "Loop infinito de redirecionamento"**

**Solução:**
1. Limpe o localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Recarregue a página
3. Faça login novamente

---

## 📝 Checklist de Implementação

- [x] Criar `AuthContext.jsx`
- [x] Criar `Login.jsx`
- [x] Criar `ProtectedRoute.jsx`
- [x] Atualizar `index.jsx` com AuthProvider
- [x] Proteger rotas `/edit` e `/:cur/edit`
- [x] Adicionar botão de logout no AppLayout
- [x] Criar script do Google Apps Script
- [x] Documentar configuração
- [x] Testar fluxo completo

---

## 🚀 Próximos Passos (Opcional)

### **1. Níveis de Permissão**

```javascript
// Adicionar verificação de role
const canEdit = user.role === 'admin' || user.role === 'editor';

if (!canEdit) {
    return <div>Você não tem permissão para editar</div>;
}
```

### **2. Log de Atividades**

```javascript
// Registrar ações no Google Sheets
function logActivity(username, action, details) {
    const logSheet = ss.getSheetByName('activity_log');
    logSheet.appendRow([
        new Date(),
        username,
        action,
        details
    ]);
}
```

### **3. Recuperação de Senha**

```javascript
// Enviar email com link de reset
function resetPassword(email) {
    // Gerar token temporário
    // Enviar email via Gmail API
    // Criar página de reset
}
```

---

**Data:** 2025-11-17  
**Versão:** 1.0  
**Status:** ✅ Implementado e Documentado
