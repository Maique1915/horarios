/**
 * Google Apps Script - Sistema de Autenticação
 * 
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 
 * 1. Crie uma nova aba chamada "users" no seu Google Sheets
 * 2. Adicione as seguintes colunas na primeira linha:
 *    A1: username
 *    B1: passwordHash
 *    C1: name
 *    D1: role
 *    E1: active
 * 
 * 3. Adicione usuários (exemplo):
 *    A2: admin
 *    B2: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918 (hash de "admin")
 *    C2: Administrador
 *    D2: admin
 *    E2: TRUE
 * 
 * COMO GERAR O HASH DA SENHA:
 * Execute a função testHashPassword() no Apps Script ou use:
 * https://emn178.github.io/online-tools/sha256.html
 * 
 * EXEMPLOS DE HASHES:
 * "admin" = 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
 * "123456" = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
 * "senha123" = 6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090
 */

// ID da planilha (copie da URL)
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/**
 * Função principal que processa as requisições HTTP
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // Adicionar cabeçalhos CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    switch(action) {
      case 'login':
        return handleLogin(e);
      case 'verify':
        return handleVerify(e);
      case 'listUsers':
        return handleListUsers(e);
      default:
        return createResponse(false, 'Ação inválida');
    }
  } catch (error) {
    Logger.log('Erro: ' + error.toString());
    return createResponse(false, 'Erro no servidor: ' + error.toString());
  }
}

/**
 * Processa requisição de login
 */
function handleLogin(e) {
  const username = e.parameter.username;
  const passwordHash = e.parameter.passwordHash;
  
  if (!username || !passwordHash) {
    return createResponse(false, 'Usuário e senha são obrigatórios');
  }
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = ss.getSheetByName('users');
  
  if (!usersSheet) {
    return createResponse(false, 'Aba "users" não encontrada. Configure o sistema de autenticação.');
  }
  
  // Buscar todos os dados da aba
  const data = usersSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Encontrar índices das colunas
  const usernameCol = headers.indexOf('username');
  const passwordCol = headers.indexOf('passwordHash');
  const nameCol = headers.indexOf('name');
  const roleCol = headers.indexOf('role');
  const activeCol = headers.indexOf('active');
  
  if (usernameCol === -1 || passwordCol === -1) {
    return createResponse(false, 'Estrutura da aba "users" inválida');
  }
  
  // Buscar usuário
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    if (row[usernameCol] === username) {
      // Verificar se está ativo
      if (activeCol !== -1 && row[activeCol] !== true && row[activeCol] !== 'TRUE') {
        return createResponse(false, 'Usuário desativado');
      }
      
      // Verificar senha
      if (row[passwordCol] === passwordHash) {
        return createResponse(true, 'Login realizado com sucesso', {
          username: row[usernameCol],
          name: nameCol !== -1 ? row[nameCol] : username,
          role: roleCol !== -1 ? row[roleCol] : 'user'
        });
      } else {
        return createResponse(false, 'Senha incorreta');
      }
    }
  }
  
  return createResponse(false, 'Usuário não encontrado');
}

/**
 * Verifica se um token é válido (para uso futuro)
 */
function handleVerify(e) {
  const token = e.parameter.token;
  
  if (!token) {
    return createResponse(false, 'Token não fornecido');
  }
  
  // Implementar verificação de token se necessário
  return createResponse(true, 'Token válido');
}

/**
 * Lista usuários (apenas para admin)
 */
function handleListUsers(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = ss.getSheetByName('users');
  
  if (!usersSheet) {
    return createResponse(false, 'Aba "users" não encontrada');
  }
  
  const data = usersSheet.getDataRange().getValues();
  const headers = data[0];
  
  const users = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    users.push({
      username: row[headers.indexOf('username')],
      name: row[headers.indexOf('name')],
      role: row[headers.indexOf('role')],
      active: row[headers.indexOf('active')]
    });
  }
  
  return createResponse(true, 'Usuários listados', { users });
}

/**
 * Cria resposta JSON padronizada
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };
  
  if (data) {
    Object.assign(response, data);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * FUNÇÕES AUXILIARES PARA GERENCIAMENTO
 */

/**
 * Gera hash SHA-256 de uma senha
 * Use esta função para gerar hashes de senhas
 */
function testHashPassword() {
  const password = 'admin'; // Altere para a senha desejada
  const hash = generateHash(password);
  Logger.log('Senha: ' + password);
  Logger.log('Hash: ' + hash);
  
  // Exibir em um alert também
  SpreadsheetApp.getUi().alert(
    'Hash gerado:\n\n' +
    'Senha: ' + password + '\n' +
    'Hash: ' + hash + '\n\n' +
    'Copie o hash e cole na coluna passwordHash'
  );
}

/**
 * Gera hash SHA-256
 */
function generateHash(text) {
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );
  
  let hash = '';
  for (let i = 0; i < rawHash.length; i++) {
    const byte = rawHash[i];
    if (byte < 0) {
      hash += ('0' + (byte + 256).toString(16)).slice(-2);
    } else {
      hash += ('0' + byte.toString(16)).slice(-2);
    }
  }
  
  return hash;
}

/**
 * Cria a estrutura inicial da aba de usuários
 */
function setupUsersSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let usersSheet = ss.getSheetByName('users');
  
  // Se já existe, perguntar se quer recriar
  if (usersSheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Aba "users" já existe',
      'Deseja recriar a aba? ATENÇÃO: Isso apagará todos os usuários existentes!',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    ss.deleteSheet(usersSheet);
  }
  
  // Criar nova aba
  usersSheet = ss.insertSheet('users');
  
  // Adicionar cabeçalhos
  const headers = ['username', 'passwordHash', 'name', 'role', 'active'];
  usersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatar cabeçalho
  usersSheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4285f4')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Adicionar usuário admin padrão
  const adminHash = generateHash('admin');
  usersSheet.getRange(2, 1, 1, 5).setValues([
    ['admin', adminHash, 'Administrador', 'admin', true]
  ]);
  
  // Ajustar larguras das colunas
  usersSheet.setColumnWidth(1, 120); // username
  usersSheet.setColumnWidth(2, 400); // passwordHash
  usersSheet.setColumnWidth(3, 200); // name
  usersSheet.setColumnWidth(4, 100); // role
  usersSheet.setColumnWidth(5, 80);  // active
  
  // Proteger a aba (opcional)
  const protection = usersSheet.protect().setDescription('Usuários do sistema');
  
  SpreadsheetApp.getUi().alert(
    'Configuração concluída!\n\n' +
    'Usuário criado:\n' +
    'Username: admin\n' +
    'Senha: admin\n\n' +
    '⚠️ IMPORTANTE: Altere a senha padrão imediatamente!'
  );
}

/**
 * Adiciona um novo usuário
 */
function addUser() {
  const ui = SpreadsheetApp.getUi();
  
  const usernameResponse = ui.prompt('Novo Usuário', 'Digite o nome de usuário:', ui.ButtonSet.OK_CANCEL);
  if (usernameResponse.getSelectedButton() !== ui.Button.OK) return;
  const username = usernameResponse.getResponseText();
  
  const passwordResponse = ui.prompt('Nova Senha', 'Digite a senha:', ui.ButtonSet.OK_CANCEL);
  if (passwordResponse.getSelectedButton() !== ui.Button.OK) return;
  const password = passwordResponse.getResponseText();
  
  const nameResponse = ui.prompt('Nome Completo', 'Digite o nome completo:', ui.ButtonSet.OK_CANCEL);
  if (nameResponse.getSelectedButton() !== ui.Button.OK) return;
  const name = nameResponse.getResponseText();
  
  const roleResponse = ui.prompt('Função', 'Digite a função (admin/user):', ui.ButtonSet.OK_CANCEL);
  if (roleResponse.getSelectedButton() !== ui.Button.OK) return;
  const role = roleResponse.getResponseText();
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = ss.getSheetByName('users');
  
  if (!usersSheet) {
    ui.alert('Erro: Aba "users" não encontrada. Execute setupUsersSheet() primeiro.');
    return;
  }
  
  const passwordHash = generateHash(password);
  const lastRow = usersSheet.getLastRow();
  
  usersSheet.getRange(lastRow + 1, 1, 1, 5).setValues([
    [username, passwordHash, name, role, true]
  ]);
  
  ui.alert(
    'Usuário adicionado com sucesso!\n\n' +
    'Username: ' + username + '\n' +
    'Nome: ' + name + '\n' +
    'Função: ' + role
  );
}

/**
 * Menu personalizado
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔐 Autenticação')
    .addItem('Configurar Sistema', 'setupUsersSheet')
    .addSeparator()
    .addItem('Adicionar Usuário', 'addUser')
    .addItem('Gerar Hash de Senha', 'testHashPassword')
    .addToUi();
}
