/**
 * GOOGLE APPS SCRIPT - BANCO DE DADOS COM GOOGLE SHEETS
 * 
 * Este script transforma o Google Sheets em um banco de dados
 * com operações CRUD (Create, Read, Update, Delete)
 * 
 * ESTRUTURA DO GOOGLE SHEETS:
 * - gid=0: Aba "cursos" com registro de todos os cursos
 *   Colunas: _cu (sigla do curso), name (nome completo), _da (dimensão [horarios, dias]), gid (ID da aba)
 * - Outras abas: Uma para cada curso, nomeada com a sigla (_cu)
 *   Colunas: _cu, _se, _di, _re, _ap, _at, _el, _ag, _pr, _ho, etc.
 * - Aba "users": Para autenticação
 *   Colunas: username, passwordHash, role, createdAt
 * 
 * COMO USAR:
 * 1. Abra seu Google Sheets
 * 2. Vá em Extensões > Apps Script
 * 3. Cole este código
 * 4. Salve e execute onOpen() uma vez
 * 5. Publique como Web App (Implantar > Nova implantação)
 * 6. Configure: Executar como "Eu", Acesso "Qualquer pessoa"
 * 7. Copie a URL gerada e use na sua aplicação
 */

// ========================================
// CONFIGURAÇÕES
// ========================================

const CONFIG = {
  COURSES_REGISTRY_SHEET: 'cursos', // gid=0, aba com registro de cursos
  CACHE_TIME: 300, // Tempo de cache em segundos (5 minutos)
  CACHE_KEYS: {
    ALL_DATA: 'all_data',
    COURSES_REGISTRY: 'courses_registry'
  }
};

// ========================================
// FUNÇÕES DE ACESSO AO SHEETS
// ========================================

/**
 * Retorna a planilha ativa
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Retorna uma aba específica
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log(`Aba "${sheetName}" criada`);
  }
  
  return sheet;
}

/**
 * Retorna todas as abas de cursos (exceto 'cursos')
 * Usa o registro de cursos para saber quais abas existem
 */
function getCourseSheets() {
  const coursesRegistry = getCoursesRegistry();
  const ss = getSpreadsheet();
  
  return coursesRegistry
    .map(course => {
      const sheet = ss.getSheetByName(course._cu);
      return sheet;
    })
    .filter(sheet => sheet !== null);
}

/**
 * Retorna informações de um curso pelo _cu
 */
function getCourseInfo(courseCu) {
  const coursesRegistry = getCoursesRegistry();
  return coursesRegistry.find(course => course._cu === courseCu);
}

/**
 * Retorna a aba de um curso específico pelo _cu
 */
function getCourseSheet(courseCu) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(courseCu);
}

// ========================================
// FUNÇÕES DE CACHE
// ========================================

/**
 * Armazena dados no cache
 */
function setCache(key, data) {
  const cache = CacheService.getScriptCache();
  const jsonData = JSON.stringify(data);
  cache.put(key, jsonData, CONFIG.CACHE_TIME);
}

/**
 * Recupera dados do cache
 */
function getCache(key) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  return null;
}

/**
 * Limpa todo o cache
 */
function clearAllCache() {
  const cache = CacheService.getScriptCache();
  
  // Limpa cache de dados gerais
  cache.remove(CONFIG.CACHE_KEYS.ALL_DATA);
  cache.remove(CONFIG.CACHE_KEYS.COURSES_REGISTRY);
  
  // Limpa cache de cursos individuais
  const coursesRegistry = getCoursesRegistryDirect(); // Busca direto sem cache
  coursesRegistry.forEach(course => {
    cache.remove(`course_${course._cu}`);
  });
  
  Logger.log('Cache limpo com sucesso');
  return { success: true, message: 'Cache limpo com sucesso' };
}

/**
 * Limpa cache de um curso específico
 */
function clearCourseCache(courseCu) {
  const cache = CacheService.getScriptCache();
  cache.remove(`course_${courseCu}`);
  cache.remove(CONFIG.CACHE_KEYS.ALL_DATA); // Limpa também o cache geral
  
  Logger.log(`Cache do curso ${courseCu} limpo`);
  return { success: true, message: `Cache do curso ${courseCu} limpo` };
}

// ========================================
// OPERAÇÕES DE LEITURA (READ)
// ========================================

/**
 * Converte os dados da planilha em JSON
 */
function sheetToJson(sheet) {
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      const value = row[index];
      
      // Conversão de tipos
      if (header === '_se' || header === '_ap' || header === '_at' || header === 'gid') {
        obj[header] = parseInt(value) || 0;
      } else if (header === '_el' || header === '_ag') {
        obj[header] = value === true || value === 'TRUE' || value === 'true';
      } else if (header === '_pr' || header === '_ha' || header === '_hd') {
        // Arrays de strings (pré-requisitos, horários disponíveis)
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            // Tenta parsear como JSON primeiro
            obj[header] = JSON.parse(value.replace(/'/g, '"'));
          } catch (e) {
            // Se falhar, divide por vírgula
            obj[header] = value.split(',').map(v => v.trim()).filter(v => v);
          }
        } else if (Array.isArray(value)) {
          obj[header] = value;
        } else {
          obj[header] = [];
        }
      } else if (header === '_da') {
        // Dimensão da grade [horários, dias]
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            const parsed = JSON.parse(value.replace(/'/g, '"'));
            obj[header] = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            // Tenta split por vírgula e converter para números
            obj[header] = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
          }
        } else if (Array.isArray(value)) {
          obj[header] = value;
        } else {
          obj[header] = [];
        }
      } else if (header === '_ho') {
        // Horários (array de arrays) [[dia, horario], [dia, horario]]
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            obj[header] = JSON.parse(value);
          } catch (e) {
            obj[header] = [];
          }
        } else {
          obj[header] = [];
        }
      } else {
        obj[header] = value || '';
      }
    });
    
    return obj;
  }).filter(obj => {
    // Filtra linhas vazias (onde _re ou _cu está vazio)
    return obj._re || obj._cu;
  });
}

/**
 * Retorna todos os dados de todas as abas de cursos
 */
function getAllData() {
  // Tenta buscar do cache primeiro
  const cached = getCache(CONFIG.CACHE_KEYS.ALL_DATA);
  if (cached) {
    Logger.log('Retornando dados do cache');
    return cached;
  }
  
  Logger.log('Buscando dados de todas as abas de cursos...');
  
  const allData = [];
  const sheets = getCourseSheets();
  
  sheets.forEach(sheet => {
    Logger.log(`Lendo aba: ${sheet.getName()}`);
    const data = sheetToJson(sheet);
    allData.push(...data);
  });
  
  Logger.log(`Total de disciplinas carregadas: ${allData.length}`);
  
  // Armazena no cache
  setCache(CONFIG.CACHE_KEYS.ALL_DATA, allData);
  
  return allData;
}

/**
 * Retorna dados de um curso específico pelo _cu
 */
function getDataByCourse(courseCu) {
  // Tenta buscar do cache primeiro
  const cacheKey = `course_${courseCu}`;
  const cached = getCache(cacheKey);
  if (cached) {
    Logger.log(`Retornando dados do curso ${courseCu} do cache`);
    return cached;
  }
  
  Logger.log(`Buscando dados do curso: ${courseCu}`);
  
  const sheet = getCourseSheet(courseCu);
  if (!sheet) {
    Logger.log(`Aba do curso ${courseCu} não encontrada`);
    return [];
  }
  
  const data = sheetToJson(sheet);
  Logger.log(`${data.length} disciplinas encontradas no curso ${courseCu}`);
  
  // Armazena no cache
  setCache(cacheKey, data);
  
  return data;
}

/**
 * Retorna registro de cursos (gid=0) - COM cache
 */
function getCoursesRegistry() {
  // Tenta buscar do cache primeiro
  const cached = getCache(CONFIG.CACHE_KEYS.COURSES_REGISTRY);
  if (cached) {
    Logger.log('Retornando registro de cursos do cache');
    return cached;
  }
  
  return getCoursesRegistryDirect();
}

/**
 * Retorna registro de cursos (gid=0) - SEM cache
 */
function getCoursesRegistryDirect() {
  Logger.log('Buscando registro de cursos (gid=0)...');
  
  const sheet = getSheet(CONFIG.COURSES_REGISTRY_SHEET);
  if (!sheet) {
    Logger.log('Aba de registro de cursos não encontrada');
    return [];
  }
  
  const data = sheetToJson(sheet);
  Logger.log(`${data.length} cursos registrados`);
  
  // Armazena no cache
  setCache(CONFIG.CACHE_KEYS.COURSES_REGISTRY, data);
  
  return data;
}

/**
 * Busca disciplinas ativas de um curso (_ag = true)
 */
function getActiveDisciplines(courseCu) {
  Logger.log(`Buscando disciplinas ativas do curso: ${courseCu}`);
  const data = getDataByCourse(courseCu);
  const active = data.filter(item => item._ag === true);
  Logger.log(`${active.length} disciplinas ativas encontradas`);
  return active;
}

/**
 * Busca disciplina por referência
 */
function findByReference(reference) {
  const allData = getAllData();
  return allData.find(item => item._re === reference);
}

/**
 * Busca disciplinas por período (_se)
 */
function findByPeriod(courseCu, period) {
  const data = getDataByCourse(courseCu);
  return data.filter(item => item._se === parseInt(period));
}

/**
 * Retorna a dimensão da grade de um curso [horários, dias]
 */
function getCourseDimension(courseCu) {
  const courseInfo = getCourseInfo(courseCu);
  if (courseInfo && courseInfo._da) {
    return courseInfo._da;
  }
  return [0, 0]; // Default
}

/**
 * Retorna o nome completo de um curso
 */
function getCourseName(courseCu) {
  const courseInfo = getCourseInfo(courseCu);
  return courseInfo ? courseInfo.name : courseCu;
}

/**
 * Lista todos os cursos disponíveis
 */
function listAllCourses() {
  const coursesRegistry = getCoursesRegistry();
  return coursesRegistry.map(course => ({
    sigla: course._cu,
    nome: course.name,
    dimensao: course._da,
    gid: course.gid
  }));
}

// ========================================
// OPERAÇÕES DE ESCRITA (CREATE/UPDATE)
// ========================================

/**
 * Adiciona uma nova disciplina na aba do curso
 */
function addDiscipline(courseCu, disciplineData) {
  Logger.log(`Adicionando disciplina no curso: ${courseCu}`);
  
  const sheet = getCourseSheet(courseCu);
  if (!sheet) {
    return { success: false, message: `Aba do curso ${courseCu} não encontrada` };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (headers.length === 0) {
    return { success: false, message: 'Cabeçalho não encontrado' };
  }
  
  // Valida dados obrigatórios
  if (!disciplineData._re || !disciplineData._di) {
    return { success: false, message: 'Campos _re e _di são obrigatórios' };
  }
  
  // Define _cu como o nome da aba se não fornecido
  if (!disciplineData._cu) {
    disciplineData._cu = courseCu;
  }
  
  // Monta o array de valores na ordem correta dos cabeçalhos
  const values = headers.map(header => {
    const value = disciplineData[header];
    
    // Serializa arrays e objetos
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    
    return value !== undefined ? value : '';
  });
  
  sheet.appendRow(values);
  
  // Limpa o cache do curso e geral
  clearCourseCache(courseCu);
  
  Logger.log(`Disciplina ${disciplineData._re} adicionada com sucesso`);
  return { success: true, message: 'Disciplina adicionada com sucesso', reference: disciplineData._re };
}

/**
 * Atualiza uma disciplina existente
 */
function updateDiscipline(courseCu, reference, newData) {
  Logger.log(`Atualizando disciplina ${reference} no curso: ${courseCu}`);
  
  const sheet = getCourseSheet(courseCu);
  if (!sheet) {
    return { success: false, message: `Aba do curso ${courseCu} não encontrada` };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const refIndex = headers.indexOf('_re');
  
  if (refIndex === -1) {
    return { success: false, message: 'Coluna _re não encontrada' };
  }
  
  // Encontra a linha
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][refIndex] === reference) {
      rowIndex = i + 1; // +1 porque getRange é 1-indexed
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { success: false, message: `Referência ${reference} não encontrada` };
  }
  
  // Atualiza os valores
  headers.forEach((header, index) => {
    if (newData[header] !== undefined) {
      let value = newData[header];
      
      // Serializa arrays e objetos
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        value = JSON.stringify(value);
      }
      
      sheet.getRange(rowIndex, index + 1).setValue(value);
    }
  });
  
  // Limpa o cache do curso
  clearCourseCache(courseCu);
  
  Logger.log(`Disciplina ${reference} atualizada com sucesso`);
  return { success: true, message: 'Disciplina atualizada com sucesso' };
}

/**
 * Adiciona pré-requisito a uma disciplina
 */
function addPrerequisite(courseCu, disciplineRef, prerequisiteRef) {
  Logger.log(`Adicionando pré-requisito ${prerequisiteRef} na disciplina ${disciplineRef} do curso ${courseCu}`);
  
  const sheet = getCourseSheet(courseCu);
  if (!sheet) {
    return { success: false, message: `Aba do curso ${courseCu} não encontrada` };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const refIndex = headers.indexOf('_re');
  const prIndex = headers.indexOf('_pr');
  
  if (refIndex === -1 || prIndex === -1) {
    return { success: false, message: 'Colunas _re ou _pr não encontradas' };
  }
  
  // Encontra a linha
  for (let i = 1; i < data.length; i++) {
    if (data[i][refIndex] === disciplineRef) {
      let prerequisites = [];
      
      // Parse dos pré-requisitos existentes
      const currentValue = data[i][prIndex];
      if (currentValue && currentValue !== '') {
        try {
          prerequisites = JSON.parse(currentValue.replace(/'/g, '"'));
          if (!Array.isArray(prerequisites)) prerequisites = [];
        } catch (e) {
          prerequisites = currentValue.split(',').map(v => v.trim()).filter(v => v);
        }
      }
      
      // Adiciona o novo pré-requisito se não existir
      if (!prerequisites.includes(prerequisiteRef)) {
        prerequisites.push(prerequisiteRef);
        sheet.getRange(i + 1, prIndex + 1).setValue(JSON.stringify(prerequisites));
        
        // Limpa o cache do curso
        clearCourseCache(courseCu);
        
        Logger.log(`Pré-requisito ${prerequisiteRef} adicionado com sucesso`);
        return { success: true, message: 'Pré-requisito adicionado', prerequisites: prerequisites };
      } else {
        return { success: false, message: 'Pré-requisito já existe' };
      }
    }
  }
  
  return { success: false, message: 'Disciplina não encontrada' };
}

/**
 * Remove pré-requisito de uma disciplina
 */
function removePrerequisite(courseCu, disciplineRef, prerequisiteRef) {
  Logger.log(`Removendo pré-requisito ${prerequisiteRef} da disciplina ${disciplineRef} do curso ${courseCu}`);
  
  const sheet = getCourseSheet(courseCu);
  if (!sheet) {
    return { success: false, message: `Aba do curso ${courseCu} não encontrada` };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const refIndex = headers.indexOf('_re');
  const prIndex = headers.indexOf('_pr');
  
  if (refIndex === -1 || prIndex === -1) {
    return { success: false, message: 'Colunas _re ou _pr não encontradas' };
  }
  
  // Encontra a linha
  for (let i = 1; i < data.length; i++) {
    if (data[i][refIndex] === disciplineRef) {
      let prerequisites = [];
      
      // Parse dos pré-requisitos existentes
      const currentValue = data[i][prIndex];
      if (currentValue && currentValue !== '') {
        try {
          prerequisites = JSON.parse(currentValue.replace(/'/g, '"'));
          if (!Array.isArray(prerequisites)) prerequisites = [];
        } catch (e) {
          prerequisites = currentValue.split(',').map(v => v.trim()).filter(v => v);
        }
      }
      
      // Remove o pré-requisito
      const index = prerequisites.indexOf(prerequisiteRef);
      if (index > -1) {
        prerequisites.splice(index, 1);
        sheet.getRange(i + 1, prIndex + 1).setValue(JSON.stringify(prerequisites));
        
        // Limpa o cache do curso
        clearCourseCache(courseCu);
        
        Logger.log(`Pré-requisito ${prerequisiteRef} removido com sucesso`);
        return { success: true, message: 'Pré-requisito removido', prerequisites: prerequisites };
      } else {
        return { success: false, message: 'Pré-requisito não existe' };
      }
    }
  }
  
  return { success: false, message: 'Disciplina não encontrada' };
}

// ========================================
// OPERAÇÕES DE EXCLUSÃO (DELETE)
// ========================================

/**
 * Remove uma disciplina da planilha
 */
function deleteDiscipline(courseCu, reference) {
  Logger.log(`Removendo disciplina ${reference} do curso: ${courseCu}`);
  
  const sheet = getCourseSheet(courseCu);
  if (!sheet) {
    return { success: false, message: `Aba do curso ${courseCu} não encontrada` };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const refIndex = headers.indexOf('_re');
  
  if (refIndex === -1) {
    return { success: false, message: 'Coluna _re não encontrada' };
  }
  
  // Encontra a linha
  for (let i = 1; i < data.length; i++) {
    if (data[i][refIndex] === reference) {
      sheet.deleteRow(i + 1); // +1 porque deleteRow é 1-indexed
      
      // Limpa o cache do curso
      clearCourseCache(courseCu);
      
      Logger.log(`Disciplina ${reference} removida com sucesso`);
      return { success: true, message: 'Disciplina removida com sucesso' };
    }
  }
  
  return { success: false, message: 'Referência não encontrada' };
}

/**
 * Desativa uma disciplina (marca _ag como false)
 */
function deactivateDiscipline(courseCu, reference) {
  Logger.log(`Desativando disciplina ${reference} do curso: ${courseCu}`);
  return updateDiscipline(courseCu, reference, { _ag: false });
}

/**
 * Ativa uma disciplina (marca _ag como true)
 */
function activateDiscipline(courseCu, reference) {
  Logger.log(`Ativando disciplina ${reference} do curso: ${courseCu}`);
  return updateDiscipline(courseCu, reference, { _ag: true });
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

/**
 * Valida estrutura de disciplina
 */
function validateDiscipline(data) {
  const required = ['_cu', '_di', '_re', '_se'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      message: `Campos obrigatórios faltando: ${missing.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Exporta dados para JSON
 */
function exportToJson() {
  const allData = getAllData();
  return JSON.stringify(allData, null, 2);
}

/**
 * Conta disciplinas por curso
 */
function countDisciplinesByCourse() {
  const allData = getAllData();
  const counts = {};
  
  allData.forEach(item => {
    counts[item._cu] = (counts[item._cu] || 0) + 1;
  });
  
  return counts;
}

/**
 * Lista todas as disciplinas com seus pré-requisitos
 */
function listPrerequisites(courseCu) {
  const data = getDataByCourse(courseCu);
  return data
    .filter(item => item._pr && item._pr.length > 0)
    .map(item => ({
      disciplina: item._di,
      referencia: item._re,
      periodo: item._se,
      prerequisitos: item._pr
    }));
}

/**
 * Verifica integridade dos pré-requisitos (se todas as referências existem)
 */
function validatePrerequisites(courseCu) {
  const data = getDataByCourse(courseCu);
  const references = new Set(data.map(d => d._re));
  const errors = [];
  
  data.forEach(discipline => {
    if (discipline._pr && discipline._pr.length > 0) {
      discipline._pr.forEach(prereq => {
        // Pula validação de pré-requisitos numéricos (créditos)
        if (typeof prereq === 'number' || !isNaN(prereq)) return;
        
        if (!references.has(prereq)) {
          errors.push({
            disciplina: discipline._re,
            nome: discipline._di,
            prerequisitoInvalido: prereq
          });
        }
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ========================================
// WEB APP - ENDPOINT HTTP
// ========================================

/**
 * Endpoint HTTP GET
 * 
 * Exemplos de uso:
 * - ?action=getAllData
 * - ?action=getDataByCourse&course=engcomp
 * - ?action=getCoursesRegistry
 * - ?action=getActiveDisciplines&course=engcomp
 * - ?action=listCourses
 * - ?action=getCourseDimension&course=engcomp
 * - ?action=clearCache
 * - ?action=clearCourseCache&course=engcomp
 */
function doGet(e) {
  const action = e.parameter.action || 'getAllData';
  const course = e.parameter.course;
  
  let result;
  
  try {
    Logger.log(`Requisição GET: ${action}${course ? ' - Curso: ' + course : ''}`);
    
    switch (action) {
      case 'getAllData':
        result = getAllData();
        break;
        
      case 'getDataByCourse':
        if (!course) {
          return ContentService.createTextOutput(
            JSON.stringify({ error: 'Parâmetro "course" é obrigatório' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = getDataByCourse(course);
        break;
        
      case 'getCoursesRegistry':
        result = getCoursesRegistry();
        break;
        
      case 'getActiveDisciplines':
        if (!course) {
          return ContentService.createTextOutput(
            JSON.stringify({ error: 'Parâmetro "course" é obrigatório' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = getActiveDisciplines(course);
        break;
        
      case 'listCourses':
        result = listAllCourses();
        break;
        
      case 'getCourseDimension':
        if (!course) {
          return ContentService.createTextOutput(
            JSON.stringify({ error: 'Parâmetro "course" é obrigatório' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = { course: course, dimension: getCourseDimension(course) };
        break;
        
      case 'clearCache':
        result = clearAllCache();
        break;
        
      case 'clearCourseCache':
        if (!course) {
          return ContentService.createTextOutput(
            JSON.stringify({ error: 'Parâmetro "course" é obrigatório' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = clearCourseCache(course);
        break;
        
      case 'validatePrerequisites':
        if (!course) {
          return ContentService.createTextOutput(
            JSON.stringify({ error: 'Parâmetro "course" é obrigatório' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = validatePrerequisites(course);
        break;
        
      case 'login':
        const username = e.parameter.username;
        const passwordHash = e.parameter.passwordHash;
        if (!username || !passwordHash) {
          return ContentService.createTextOutput(
            JSON.stringify({ success: false, error: 'Username e passwordHash são obrigatórios' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = authenticateUser(username, passwordHash);
        break;
        
      case 'register':
        const newUsername = e.parameter.username;
        const newPasswordHash = e.parameter.passwordHash;
        const newName = e.parameter.name || newUsername;
        const newRole = e.parameter.role || 'user';
        if (!newUsername || !newPasswordHash) {
          return ContentService.createTextOutput(
            JSON.stringify({ success: false, error: 'Username e passwordHash são obrigatórios' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = addUser(newUsername, newPasswordHash, newName, newRole);
        break;
        
      case 'changePassword':
        const changeUsername = e.parameter.username;
        const oldPasswordHash = e.parameter.oldPasswordHash;
        const newPasswordHashChange = e.parameter.newPasswordHash;
        if (!changeUsername || !oldPasswordHash || !newPasswordHashChange) {
          return ContentService.createTextOutput(
            JSON.stringify({ success: false, error: 'Username, oldPasswordHash e newPasswordHash são obrigatórios' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = changePassword(changeUsername, oldPasswordHash, newPasswordHashChange);
        break;
        
      default:
        result = { error: 'Ação não reconhecida. Ações disponíveis: getAllData, getDataByCourse, getCoursesRegistry, getActiveDisciplines, listCourses, getCourseDimension, clearCache, clearCourseCache, validatePrerequisites, login, register, changePassword' };
    }
    
    Logger.log(`Requisição concluída: ${JSON.stringify(result).substring(0, 100)}...`);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log(`Erro na requisição: ${error.toString()}`);
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint HTTP POST para operações de escrita
 * 
 * Exemplos de payload:
 * - { "action": "addDiscipline", "course": "engcomp", "data": {...} }
 * - { "action": "updateDiscipline", "course": "engcomp", "reference": "2A", "data": {...} }
 * - { "action": "deleteDiscipline", "course": "engcomp", "reference": "2A" }
 * - { "action": "addPrerequisite", "course": "engcomp", "discipline": "2F", "prerequisite": "1E" }
 * - { "action": "removePrerequisite", "course": "engcomp", "discipline": "2F", "prerequisite": "1E" }
 * - { "action": "deactivate", "course": "engcomp", "reference": "2A" }
 * - { "action": "activate", "course": "engcomp", "reference": "2A" }
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const course = data.course;
    
    Logger.log(`Requisição POST: ${action}${course ? ' - Curso: ' + course : ''}`);
    
    let result;
    
    switch (action) {
      case 'addDiscipline':
        if (!course || !data.data) {
          result = { success: false, message: 'Parâmetros "course" e "data" são obrigatórios' };
          break;
        }
        result = addDiscipline(course, data.data);
        break;
        
      case 'updateDiscipline':
        if (!course || !data.reference || !data.data) {
          result = { success: false, message: 'Parâmetros "course", "reference" e "data" são obrigatórios' };
          break;
        }
        result = updateDiscipline(course, data.reference, data.data);
        break;
        
      case 'deleteDiscipline':
        if (!course || !data.reference) {
          result = { success: false, message: 'Parâmetros "course" e "reference" são obrigatórios' };
          break;
        }
        result = deleteDiscipline(course, data.reference);
        break;
        
      case 'addPrerequisite':
        if (!course || !data.discipline || !data.prerequisite) {
          result = { success: false, message: 'Parâmetros "course", "discipline" e "prerequisite" são obrigatórios' };
          break;
        }
        result = addPrerequisite(course, data.discipline, data.prerequisite);
        break;
        
      case 'removePrerequisite':
        if (!course || !data.discipline || !data.prerequisite) {
          result = { success: false, message: 'Parâmetros "course", "discipline" e "prerequisite" são obrigatórios' };
          break;
        }
        result = removePrerequisite(course, data.discipline, data.prerequisite);
        break;
        
      case 'deactivate':
        if (!course || !data.reference) {
          result = { success: false, message: 'Parâmetros "course" e "reference" são obrigatórios' };
          break;
        }
        result = deactivateDiscipline(course, data.reference);
        break;
        
      case 'activate':
        if (!course || !data.reference) {
          result = { success: false, message: 'Parâmetros "course" e "reference" são obrigatórios' };
          break;
        }
        result = activateDiscipline(course, data.reference);
        break;
        
      case 'login':
        if (!data.username || !data.passwordHash) {
          result = { success: false, error: 'Parâmetros "username" e "passwordHash" são obrigatórios' };
          break;
        }
        result = authenticateUser(data.username, data.passwordHash);
        break;
        
      default:
        result = { success: false, message: 'Ação não reconhecida. Ações disponíveis: addDiscipline, updateDiscipline, deleteDiscipline, addPrerequisite, removePrerequisite, deactivate, activate, login' };
    }
    
    Logger.log(`Resultado: ${JSON.stringify(result)}`);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log(`Erro na requisição POST: ${error.toString()}`);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// TRIGGERS E AUTOMAÇÕES
// ========================================

/**
 * Trigger que executa quando a planilha é editada
 * Limpa o cache automaticamente
 */
function onEdit(e) {
  Logger.log('Planilha editada, limpando cache...');
  clearAllCache();
}

/**
 * Cria um menu customizado no Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Banco de Dados')
    .addItem('🔄 Limpar Cache Geral', 'clearAllCache')
    .addItem('🧹 Limpar Cache de um Curso', 'promptClearCourseCache')
    .addSeparator()
    .addItem('📋 Listar Cursos', 'showCoursesList')
    .addItem('📊 Contar Disciplinas', 'showDisciplineCounts')
    .addItem('🔗 Listar Pré-requisitos', 'showPrerequisites')
    .addItem('✅ Validar Pré-requisitos', 'promptValidatePrerequisites')
    .addSeparator()
    .addItem('📤 Exportar JSON', 'showJsonExport')
    .addItem('ℹ️ Sobre', 'showAbout')
    .addToUi();
  
  ui.createMenu('🔐 Autenticação')
    .addItem('⚙️ Configurar Sistema', 'setupAuthSystem')
    .addItem('➕ Adicionar Usuário', 'promptAddUser')
    .addItem('🔑 Gerar Hash de Senha', 'testHashPassword')
    .addToUi();
}

/**
 * Prompt para limpar cache de um curso específico
 */
function promptClearCourseCache() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt('Limpar Cache', 'Digite a sigla do curso (_cu):', ui.ButtonSet.OK_CANCEL);
  
  if (result.getSelectedButton() == ui.Button.OK) {
    const courseCu = result.getResponseText().trim();
    const clearResult = clearCourseCache(courseCu);
    ui.alert('Cache Limpo', clearResult.message, ui.ButtonSet.OK);
  }
}

/**
 * Mostra lista de cursos
 */
function showCoursesList() {
  const courses = listAllCourses();
  const message = courses
    .map(c => `${c.sigla}: ${c.nome} - Dimensão: [${c.dimensao}] - GID: ${c.gid}`)
    .join('\n');
  
  const ui = SpreadsheetApp.getUi();
  ui.alert('Cursos Cadastrados', message || 'Nenhum curso cadastrado', ui.ButtonSet.OK);
}

/**
 * Mostra contagem de disciplinas
 */
function showDisciplineCounts() {
  const counts = countDisciplinesByCourse();
  const message = Object.entries(counts)
    .map(([course, count]) => `${course}: ${count} disciplinas`)
    .join('\n');
  
  const ui = SpreadsheetApp.getUi();
  ui.alert('Contagem de Disciplinas', message || 'Nenhuma disciplina encontrada', ui.ButtonSet.OK);
}

/**
 * Mostra pré-requisitos
 */
function showPrerequisites() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt('Listar Pré-requisitos', 'Digite a sigla do curso (_cu):', ui.ButtonSet.OK_CANCEL);
  
  if (result.getSelectedButton() == ui.Button.OK) {
    const courseCu = result.getResponseText().trim();
    const prerequisites = listPrerequisites(courseCu);
    
    if (prerequisites.length === 0) {
      ui.alert('Nenhum pré-requisito encontrado para ' + courseCu);
    } else {
      const message = prerequisites
        .map(p => `[P${p.periodo}] ${p.referencia} - ${p.disciplina}:\n   → ${p.prerequisitos.join(', ')}`)
        .join('\n\n');
      ui.alert('Pré-requisitos de ' + courseCu, message, ui.ButtonSet.OK);
    }
  }
}

/**
 * Valida pré-requisitos de um curso
 */
function promptValidatePrerequisites() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt('Validar Pré-requisitos', 'Digite a sigla do curso (_cu):', ui.ButtonSet.OK_CANCEL);
  
  if (result.getSelectedButton() == ui.Button.OK) {
    const courseCu = result.getResponseText().trim();
    const validation = validatePrerequisites(courseCu);
    
    if (validation.valid) {
      ui.alert('Validação', 'Todos os pré-requisitos estão válidos! ✅', ui.ButtonSet.OK);
    } else {
      const message = validation.errors
        .map(e => `${e.disciplina} (${e.nome}):\n   ❌ Pré-requisito inválido: ${e.prerequisitoInvalido}`)
        .join('\n\n');
      ui.alert('Erros Encontrados', message, ui.ButtonSet.OK);
    }
  }
}

/**
 * Mostra informações sobre o sistema
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  const message = 
    '📊 Sistema de Banco de Dados com Google Sheets\n\n' +
    'Este script transforma seu Google Sheets em um banco de dados\n' +
    'com operações CRUD completas.\n\n' +
    'Estrutura:\n' +
    '• gid=0 (cursos): Registro de cursos\n' +
    '• Outras abas: Disciplinas de cada curso\n\n' +
    'Desenvolvido para o Sistema de Geração de Grades\n' +
    'Versão: 2.0\n' +
    'Data: Janeiro 2025';
  
  ui.alert('Sobre o Sistema', message, ui.ButtonSet.OK);
}

// ========================================
// SISTEMA DE AUTENTICAÇÃO
// ========================================

/**
 * Configura o sistema de autenticação
 * Cria a aba 'users' se não existir
 */
function setupAuthSystem() {
  const ss = getSpreadsheet();
  let usersSheet = ss.getSheetByName('users');
  
  if (!usersSheet) {
    // Criar aba users
    usersSheet = ss.insertSheet('users');
    
    // Adicionar cabeçalhos
    usersSheet.getRange(1, 1, 1, 5).setValues([
      ['username', 'passwordHash', 'name', 'role', 'active']
    ]);
    
    // Formatar cabeçalho
    usersSheet.getRange(1, 1, 1, 5)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');
    
    // Adicionar usuário admin padrão
    // Senha: admin
    const adminHash = generateHash('admin');
    usersSheet.appendRow(['admin', adminHash, 'Administrador', 'admin', true]);
    
    SpreadsheetApp.getUi().alert(
      'Sistema de Autenticação Configurado!',
      'Aba "users" criada com sucesso.\n\n' +
      'Usuário padrão criado:\n' +
      'Username: admin\n' +
      'Senha: admin\n\n' +
      '⚠️ IMPORTANTE: Altere a senha padrão!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    SpreadsheetApp.getUi().alert(
      'Sistema já configurado',
      'A aba "users" já existe.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Autentica um usuário
 */
function authenticateUser(username, passwordHash) {
  try {
    const ss = getSpreadsheet();
    const usersSheet = ss.getSheetByName('users');
    
    if (!usersSheet) {
      return {
        success: false,
        error: 'Sistema de autenticação não configurado'
      };
    }
    
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Índices das colunas
    const usernameCol = headers.indexOf('username');
    const passwordHashCol = headers.indexOf('passwordHash');
    const nameCol = headers.indexOf('name');
    const roleCol = headers.indexOf('role');
    const activeCol = headers.indexOf('active');
    
    // Buscar usuário
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (row[usernameCol] === username) {
        // Usuário encontrado, verificar se está ativo
        if (!row[activeCol]) {
          return {
            success: false,
            error: 'Usuário desativado'
          };
        }
        
        // Verificar senha
        if (row[passwordHashCol] === passwordHash) {
          return {
            success: true,
            message: 'Login realizado com sucesso',
            username: row[usernameCol],
            name: row[nameCol],
            role: row[roleCol]
          };
        } else {
          return {
            success: false,
            error: 'Senha incorreta'
          };
        }
      }
    }
    
    // Usuário não encontrado
    return {
      success: false,
      error: 'Usuário não encontrado'
    };
    
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao autenticar: ' + error.message
    };
  }
}

/**
 * Adiciona um novo usuário
 */
function addUser(username, passwordHash, name, role) {
  try {
    const ss = getSpreadsheet();
    const usersSheet = ss.getSheetByName('users');
    
    if (!usersSheet) {
      return {
        success: false,
        error: 'Sistema de autenticação não configurado. Execute setupAuthSystem() primeiro.'
      };
    }
    
    // Verificar se usuário já existe
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    const usernameCol = headers.indexOf('username');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][usernameCol] === username) {
        return {
          success: false,
          error: 'Usuário já existe'
        };
      }
    }
    
    // Adicionar novo usuário
    usersSheet.appendRow([username, passwordHash, name, role || 'editor', true]);
    
    return {
      success: true,
      message: 'Usuário adicionado com sucesso'
    };
    
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao adicionar usuário: ' + error.message
    };
  }
}

/**
 * Prompt para adicionar usuário
 */
function promptAddUser() {
  const ui = SpreadsheetApp.getUi();
  
  // Username
  const usernameResult = ui.prompt('Adicionar Usuário', 'Digite o username:', ui.ButtonSet.OK_CANCEL);
  if (usernameResult.getSelectedButton() != ui.Button.OK) return;
  const username = usernameResult.getResponseText().trim();
  
  // Nome
  const nameResult = ui.prompt('Adicionar Usuário', 'Digite o nome completo:', ui.ButtonSet.OK_CANCEL);
  if (nameResult.getSelectedButton() != ui.Button.OK) return;
  const name = nameResult.getResponseText().trim();
  
  // Senha
  const passwordResult = ui.prompt('Adicionar Usuário', 'Digite a senha:', ui.ButtonSet.OK_CANCEL);
  if (passwordResult.getSelectedButton() != ui.Button.OK) return;
  const password = passwordResult.getResponseText();
  
  // Role
  const roleResult = ui.prompt('Adicionar Usuário', 'Digite o role (admin/editor/viewer):', ui.ButtonSet.OK_CANCEL);
  if (roleResult.getSelectedButton() != ui.Button.OK) return;
  const role = roleResult.getResponseText().trim();
  
  // Gerar hash SHA-256
  const passwordHash = generateHash(password);
  
  // Adicionar usuário
  const result = addUser(username, passwordHash, name, role);
  
  if (result.success) {
    ui.alert('Sucesso', result.message, ui.ButtonSet.OK);
  } else {
    ui.alert('Erro', result.error, ui.ButtonSet.OK);
  }
}

/**
 * Teste de hash de senha
 */
function testHashPassword() {
  const password = 'admin'; // ALTERE AQUI
  
  const passwordHash = generateHash(password);
  
  Logger.log('Senha: ' + password);
  Logger.log('Hash: ' + passwordHash);
  
  SpreadsheetApp.getUi().alert(
    'Hash Gerado',
    'Senha: ' + password + '\n\nHash: ' + passwordHash,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Gera hash SHA-256 de uma string
 * Função auxiliar reutilizável
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

// ========================================
// FUNÇÕES DO MENU (UI)
// ========================================

/**
 * Exibe JSON de todos os dados em um modal
 */
function showJsonExport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const data = getAllData();
    const jsonString = JSON.stringify(data, null, 2);
    
    // Criar HTML com textarea copiável
    const html = HtmlService.createHtmlOutput(`
      <style>
        body { font-family: Arial, sans-serif; padding: 10px; }
        textarea { width: 100%; height: 400px; font-family: monospace; font-size: 12px; }
        button { padding: 10px 20px; margin: 10px 5px; cursor: pointer; }
      </style>
      <h3>📤 Exportar JSON</h3>
      <p>Total de disciplinas: ${data.length}</p>
      <textarea id="jsonData">${jsonString}</textarea>
      <br>
      <button onclick="copyToClipboard()">📋 Copiar</button>
      <button onclick="google.script.host.close()">❌ Fechar</button>
      
      <script>
        function copyToClipboard() {
          const textarea = document.getElementById('jsonData');
          textarea.select();
          document.execCommand('copy');
          alert('JSON copiado para a área de transferência!');
        }
      </script>
    `)
    .setWidth(800)
    .setHeight(600);
    
    ui.showModalDialog(html, 'Exportar JSON');
  } catch (error) {
    ui.alert('Erro', 'Erro ao exportar JSON: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Mostra informações sobre o sistema
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  const version = '2.0.0';
  const message = `
🎓 Sistema de Banco de Dados com Google Sheets
Versão: ${version}

📋 Funcionalidades:
• CRUD completo (Create, Read, Update, Delete)
• Sistema de cache para performance
• Autenticação com hash de senha
• Validação de pré-requisitos
• API REST via Web App

👨‍💻 Desenvolvido para o Sistema de Matrícula
  `;
  
  ui.alert('Sobre', message, ui.ButtonSet.OK);
}

/**
 * Exibe estatísticas do banco de dados
 */
function showStats() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const coursesRegistry = getCoursesRegistryInternal();
    const totalDisciplines = getAllDataInternal().length;
    
    let stats = '📊 ESTATÍSTICAS DO BANCO DE DADOS\n\n';
    stats += `Total de Cursos: ${coursesRegistry.length}\n`;
    stats += `Total de Disciplinas: ${totalDisciplines}\n\n`;
    stats += '📚 CURSOS:\n';
    
    coursesRegistry.forEach(course => {
      const courseData = getDataByCourseInternal(course._di);
      stats += `\n• ${course.name} (${course._di})\n`;
      stats += `  Disciplinas: ${courseData.length}\n`;
      stats += `  Dimensão: ${course._da}\n`;
    });
    
    ui.alert('Estatísticas', stats, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('Erro', 'Erro ao calcular estatísticas: ' + error.message, ui.ButtonSet.OK);
  }
}
