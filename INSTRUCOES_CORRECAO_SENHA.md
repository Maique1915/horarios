# Como Aplicar a Correção da Validação de Senha

## Problema Resolvido
Agora o sistema só vai pedir a senha atual quando o usuário realmente tentar mudar a senha. Se ele só quiser alterar o nome ou username, não precisa informar a senha atual.

## Passos para Aplicar

### 1. Atualizar o Banco de Dados (Supabase)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `fix_update_user_password_validation.sql`
4. Copie todo o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** para executar

### 2. Verificar as Mudanças no Frontend

As seguintes mudanças já foram aplicadas automaticamente:

- ✅ `src/app/(user)/profile/useProfileController.ts` - Agora só envia `currentPassword` quando o usuário quer mudar a senha
- ✅ `src/contexts/AuthContext.tsx` - Atualizado para enviar `null` quando não há senha atual

### 3. Testar

Após aplicar o SQL no Supabase, teste os seguintes cenários:

1. **Editar apenas o nome** - Deve funcionar sem pedir senha
2. **Editar apenas o username** - Deve funcionar sem pedir senha
3. **Editar nome e username** - Deve funcionar sem pedir senha
4. **Clicar em "Alterar senha" e tentar mudar a senha** - Deve pedir a senha atual
5. **Clicar em "Alterar senha" mas deixar os campos vazios** - Deve salvar normalmente sem alterar a senha

## Mudanças Técnicas

### Backend (SQL)
- A função `update_user` agora só valida `current_password_in` quando `new_password_in` não é nulo/vazio
- A ordem dos parâmetros foi ajustada para: `user_id_in`, `name_in`, `username_in`, `new_password_in`, `current_password_in`

### Frontend
- `handleUpdateProfile` agora só envia `currentPassword` quando `showPassword` é true e `password` está preenchido
- Validação adicional para garantir que a senha atual seja informada quando tentar mudar a senha
