// Updated: 2025-01-16
// 🔧 CONFIGURAÇÃO DO GOOGLE APPS SCRIPT
// 
// URL do Apps Script que retorna todos os dados em formato JSON
// Este endpoint já inclui cache inteligente e validação de dados
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8E80OOXc9pjXZos9XHuxwT1DkwXZqVshjRPX7DVfEdCDGEYaB89w8P2oyRRQGJSYI4A/exec';

// URLs antigas do CSV (mantidas como fallback)
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?output=csv';
const COURSES_REGISTRY_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?gid=0&single=true&output=csv';

// URLs por aba (mantidas como fallback)
const GOOGLE_SHEETS_TABS = {
  'engcomp': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?gid=0&single=true&output=csv',
  'matematica': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?gid=1740872577&single=true&output=csv'
};

let cachedData = {};
let loadingPromises = {};
let lastFetchTime = null;
let globalDbPromise = null;
let globalRegistryPromise = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em millisegundos

// Modo de operação: 'apps-script' (preferido) ou 'csv' (fallback)
let dataSourceMode = 'apps-script';

// Função para converter string para boolean
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
};

// Função para parsear arrays do formato string
const parseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || value === '[]') return [];

  try {
    // Tenta fazer parse direto se estiver em formato JSON
    const parsed = JSON.parse(value.replace(/'/g, '"'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // Se falhar, tenta split por vírgula
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(v => v.trim());
    }
    return [];
  }
};

// Função para converter CSV em JSON
const csvToJson = (csv) => {
  const lines = csv.trim().split('\n');

  // Detectar separador automaticamente (vírgula ou ponto e vírgula)
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  const headers = firstLine.split(separator);

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    // Parser manual para lidar com separador dentro de aspas
    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Adiciona o último valor

    const obj = {};
    headers.forEach((header, index) => {
      const key = header.trim();
      let value = values[index] || '';

      // Remove aspas do início e fim
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      // Conversão de tipos
      if (key === '_se' || key === '_ap' || key === '_at') {
        obj[key] = value ? parseInt(value, 10) : 0;
      } else if (key === '_el' || key === '_ag') {
        obj[key] = parseBoolean(value);
      } else if (key === '_pr' || key === '_ha') {
        obj[key] = parseArray(value);
      } else if (key === '_ho') {
        try {
          obj[key] = value ? JSON.parse(value) : [];
        } catch (e) {
          obj[key] = [];
        }
      } else if (key === '_da') {
        obj[key] = value || '';
      } else {
        obj[key] = value;
      }
    });

    return obj;
  });
};

// Função para carregar dados do Google Apps Script (preferido)
const loadFromAppsScript = async (action = 'getAllData', params = {}) => {
  console.log(`loadFromAppsScript: Buscando ${action}...`, params);

  try {
    // Monta a URL com os parâmetros
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append('action', action);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log(`loadFromAppsScript: URL: ${url.toString()}`);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    console.log(`loadFromAppsScript: ${action} retornou`, data.length || 'objeto', 'registros');
    return data;

  } catch (error) {
    console.error(`loadFromAppsScript: Erro em ${action}:`, error);
    throw error;
  }
};

// Função para carregar registro de cursos do Apps Script
export const loadCoursesRegistry = async () => {
  // Se já houver uma promessa em andamento, retorna ela
  if (globalRegistryPromise) {
    console.log('loadCoursesRegistry: Retornando promessa global existente');
    return globalRegistryPromise;
  }

  globalRegistryPromise = (async () => {
    console.log('loadCoursesRegistry: Carregando registro de cursos...');

    try {
      // Tenta buscar do Apps Script primeiro
      const coursesData = await loadFromAppsScript('getCoursesRegistry');
      console.log('loadCoursesRegistry: Cursos carregados do Apps Script:', coursesData);
      return coursesData;

    } catch (error) {
      console.error('loadCoursesRegistry: Erro ao carregar do Apps Script, tentando CSV...', error);

      // Fallback para CSV
      try {
        const response = await fetch(COURSES_REGISTRY_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        const coursesData = csvToJson(csvText);

        console.log('loadCoursesRegistry: Cursos carregados do CSV (fallback):', coursesData);

        return coursesData.map(course => ({
          ...course,
          _da: parseArray(course._da),
          _hd: parseArray(course._hd),
          gid: course.gid || course.GID
        }));
      } catch (csvError) {
        console.error('loadCoursesRegistry: Erro ao carregar do CSV:', csvError);
        return [];
      }
    } finally {
      // Limpa a promessa após conclusão (sucesso ou erro) para permitir recarregamento futuro se necessário
      // mas o cache de tempo (lastFetchTime) controlará a frequência real se usarmos loadDbData
      // Aqui, mantemos se quisermos que seja singleton pelo tempo de vida da página ou limpamos.
      // Para preloading efetivo, vamos manter a promessa resolvida.
    }
  })();

  return globalRegistryPromise;
};

// Função para carregar dados do Google Sheets
export const loadDbData = async () => {
  console.log('loadDbData: Verificando cache...');

  // Verifica se o cache ainda é válido
  if (lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
    console.log('loadDbData: Cache ainda válido, usando dados em cache');
    const allCachedData = Object.values(cachedData).flat();
    if (allCachedData.length > 0) {
      return allCachedData;
    }
  }

  // Se já houver uma promessa de carregamento global em curso, usa ela
  if (globalDbPromise) {
    console.log('loadDbData: Retornando promessa global existente');
    return globalDbPromise;
  }

  globalDbPromise = (async () => {
    console.log('loadDbData: Cache expirado ou vazio, carregando TODOS os cursos...');

    try {
      // Tenta carregar do Apps Script primeiro (modo preferido)
      console.log('loadDbData: Tentando carregar do Apps Script...');
      const allData = await loadFromAppsScript('getAllData');

      console.log('loadDbData: Dados carregados do Apps Script:', allData.length, 'disciplinas');

      // Organiza por curso no cache
      cachedData = {};
      allData.forEach(item => {
        if (!cachedData[item._cu]) {
          cachedData[item._cu] = [];
        }
        cachedData[item._cu].push(item);
      });

      lastFetchTime = Date.now();
      dataSourceMode = 'apps-script';

      return allData;

    } catch (error) {
      console.error('loadDbData: Erro ao carregar do Apps Script, tentando CSV...', error);
      dataSourceMode = 'csv';

      // Fallback para o método CSV antigo
      const data = await loadFromCSV();
      return data;
    } finally {
      // Diferente de loadCoursesRegistry, loadDbData gerencia seu próprio lastFetchTime.
      // Podemos limpar globalDbPromise ou deixá-la. Vamos limpá-la para que novas chamadas 
      // após CACHE_DURATION iniciem novo ciclo se necessário.
      globalDbPromise = null;
    }
  })();

  return globalDbPromise;
};

// Função fallback para carregar do CSV (método antigo)
const loadFromCSV = async () => {
  console.log('loadFromCSV: Carregando do CSV (modo fallback)...');

  const coursesRegistry = await loadCoursesRegistry();
  console.log('loadFromCSV: Registro de cursos:', coursesRegistry);

  const allData = [];
  const coursesToLoad = coursesRegistry.length > 0
    ? coursesRegistry.map(c => ({ code: c._cu, gid: c.gid }))
    : Object.keys(GOOGLE_SHEETS_TABS).map(code => ({ code, url: GOOGLE_SHEETS_TABS[code] }));

  for (const courseInfo of coursesToLoad) {
    const curso = courseInfo.code;

    try {
      console.log(`loadFromCSV: Carregando aba "${curso}"...`);

      if (cachedData[curso]) {
        console.log(`loadFromCSV: Usando cache para "${curso}":`, cachedData[curso].length, 'disciplinas');
        allData.push(...cachedData[curso]);
        continue;
      }

      if (loadingPromises[curso]) {
        console.log(`loadFromCSV: Aguardando carregamento de "${curso}"...`);
        const data = await loadingPromises[curso];
        allData.push(...data);
        continue;
      }

      let url;
      if (courseInfo.gid) {
        const baseUrl = GOOGLE_SHEETS_URL.split('?')[0].replace('/pub?', '/pub');
        url = `${baseUrl}?gid=${courseInfo.gid}&single=true&output=csv`;
      } else if (courseInfo.url) {
        url = courseInfo.url;
      } else {
        console.warn(`⚠️ loadFromCSV: Curso "${curso}" não tem GID ou URL configurado!`);
        continue;
      }

      if (url.includes('COLE_O_GID_AQUI')) {
        console.warn(`⚠️ loadFromCSV: Curso "${curso}" não está configurado!`);
        continue;
      }

      loadingPromises[curso] = fetch(url)
        .then(response => {
          console.log(`loadFromCSV: Response status para "${curso}":`, response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(csvText => {
          console.log(`loadFromCSV: CSV recebido para "${curso}", tamanho:`, csvText.length, 'caracteres');
          const jsonData = csvToJson(csvText);
          console.log(`loadFromCSV: Dados convertidos para "${curso}":`, jsonData.length, 'disciplinas');

          jsonData.forEach(item => {
            if (!item._cu) item._cu = curso;
          });

          cachedData[curso] = jsonData;
          loadingPromises[curso] = null;
          return jsonData;
        })
        .catch(error => {
          console.error(`loadFromCSV: Erro ao carregar "${curso}":`, error);
          loadingPromises[curso] = null;
          return [];
        });

      const data = await loadingPromises[curso];
      allData.push(...data);

    } catch (error) {
      console.error(`loadFromCSV: Erro ao processar curso "${curso}":`, error);
    }
  }

  console.log('loadFromCSV: Total de disciplinas carregadas:', allData.length);
  lastFetchTime = Date.now();
  return allData;
};

// Função para pré-carregamento imediato
export const preloadData = () => {
  console.log('preloadData: Iniciando carregamento assíncrono antecipado...');
  // Dispara ambos os carregamentos sem aguardar (fire and forget)
  // Mas como retornam promessas globais, qualquer chamada subsequente aguardará as mesmas promessas
  loadCoursesRegistry();
  loadDbData();
};

// Função para limpar o cache (útil para forçar recarregamento)
export const clearCache = () => {
  console.log('clearCache: Limpando cache local...');
  cachedData = {};
  loadingPromises = {};
  lastFetchTime = null;

  // Se estiver usando Apps Script, também limpa o cache remoto
  if (dataSourceMode === 'apps-script') {
    console.log('clearCache: Limpando cache remoto do Apps Script...');
    loadFromAppsScript('clearCache')
      .then(() => console.log('clearCache: Cache remoto limpo com sucesso'))
      .catch(err => console.error('clearCache: Erro ao limpar cache remoto:', err));
  }
};

// Função para obter lista de cursos configurados
export const getAvailableCourses = async () => {
  const coursesRegistry = await loadCoursesRegistry();
  return coursesRegistry.map(c => c._cu);
};

// Função para obter status da fonte de dados
export const getDataSourceStatus = () => {
  return {
    mode: dataSourceMode,
    cacheValid: lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION,
    lastFetch: lastFetchTime ? new Date(lastFetchTime).toISOString() : null,
    coursesInCache: Object.keys(cachedData).length
  };
};

// Função para adicionar novo curso (retorna a URL que deve ser configurada)
export const getNewCourseSheetUrl = (courseCode, spreadsheetId, gid) => {
  return `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?gid=${gid}&single=true&output=csv`;
};
