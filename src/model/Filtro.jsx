import { loadDbData, loadCoursesRegistry } from './loadData';

// Cache estático para coursesRegistry
let coursesRegistryCache = null;
let coursesRegistryCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função auxiliar para buscar coursesRegistry com cache
async function getCachedCoursesRegistry() {
    const now = Date.now();
    
    // Verifica se o cache ainda é válido
    if (coursesRegistryCache && coursesRegistryCacheTime && (now - coursesRegistryCacheTime) < CACHE_DURATION) {
        console.log('Filtro: Usando cache de coursesRegistry');
        return coursesRegistryCache;
    }
    
    // Busca do servidor
    console.log('Filtro: Buscando coursesRegistry do servidor');
    const startTime = performance.now();
    const data = await loadCoursesRegistry();
    const endTime = performance.now();
    
    console.log(`Filtro: coursesRegistry carregado em ${(endTime - startTime).toFixed(2)}ms`);
    
    // Atualiza o cache
    coursesRegistryCache = data;
    coursesRegistryCacheTime = now;
    
    return data;
}

async function ativas(e) {
    console.log('ativas: Chamada para curso:', e);
    const db = await loadDbData();
    console.log('ativas: Dados recebidos do loadDbData:', db?.length, 'total de disciplinas');
    const a = db.filter((item) => (item._ag === true) && item._cu === e);
    console.log('ativas: Disciplinas ativas filtradas para', e, ':', a.length);
    return a !== undefined ? a : [];
}

async function periodos(e) {
    const vet = await ativas(e);
    const v = new Set(vet.map(item => item._se));
    return v.size > 0 ? v.size : undefined;
}

async function cursos() {
    const coursesRegistry = await getCachedCoursesRegistry();
    return coursesRegistry.map(item => item._cu);
}

async function horarios(e) {
    const coursesRegistry = await getCachedCoursesRegistry();
    const v = coursesRegistry.find((item) => item._cu === e);
    return v === undefined || v === null ? [] : v._hd
}

async function dimencao(e) {
    const coursesRegistry = await getCachedCoursesRegistry();
    const v = coursesRegistry.find((item) => item._cu === e);
    if (v === undefined)
        return []
    return v._da === undefined ? [] : v._da;
}

export { ativas, periodos, cursos, horarios, dimencao, getCachedCoursesRegistry };
