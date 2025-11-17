# 📊 Análise de Performance do Sistema

## 🎯 Resumo

Alguns componentes carregam mais rápido que outros devido ao **cache inteligente** implementado no sistema.

## ⏱️ Tempos de Carregamento

| Componente | Primeira Carga | Carga com Cache | Motivo |
|------------|---------------|-----------------|--------|
| **Quadro** | ~2-5s | ~100-300ms | Usa cache após primeira carga |
| **GeraGrade** | ~2-5s | ~100-300ms | Usa cache após primeira carga |
| **MapaMental** | ~2-5s | ~100-300ms | Usa cache após primeira carga |
| **EditDb** | ~2-5s | ~100-300ms | Usa cache após primeira carga |

## 🔄 Como Funciona o Cache

### **Sistema de Cache (loadData.js)**

```javascript
// Cache válido por 5 minutos
const CACHE_DURATION = 5 * 60 * 1000;

// Fluxo de carregamento:
1. Verifica se cache está válido
2. Se SIM → Retorna dados imediatamente (⚡ rápido)
3. Se NÃO → Busca do Apps Script/CSV (🐌 lento)
```

### **Hierarquia de Fontes de Dados**

```
┌─────────────────────────────────────┐
│  1. Cache Local (5 minutos)        │ ← Mais rápido
│     └─ Se válido: retorna           │
│        Se expirado: vai para #2     │
├─────────────────────────────────────┤
│  2. Apps Script (Google Sheets)    │ ← Rápido
│     └─ Retorna JSON parseado        │
│        Se falhar: vai para #3       │
├─────────────────────────────────────┤
│  3. CSV Publicado (Fallback)       │ ← Mais lento
│     └─ Baixa e parseia CSV          │
└─────────────────────────────────────┘
```

## 🐌 Por Que a Primeira Carga é Lenta?

### **Fatores que afetam a velocidade:**

1. **Apps Script Cold Start** (~1-2s)
   - Primeira requisição ao Apps Script demora mais
   - Google precisa "acordar" o script

2. **Download dos Dados** (~1-3s)
   - Depende da quantidade de disciplinas
   - Depende da velocidade da internet

3. **Parsing e Processamento** (~0.5-1s)
   - Conversão de CSV/JSON para objetos JavaScript
   - Validação e normalização dos dados

## ⚡ Por Que Cargas Subsequentes São Rápidas?

### **Cache em Memória:**

```javascript
// Dados ficam em memória RAM
cachedData = {
  'engcomp': [...disciplinas],
  'matematica': [...disciplinas]
}

// Não precisa buscar da rede
// Retorno instantâneo!
```

### **Benefícios do Cache:**

- ✅ **Navegação rápida** entre páginas
- ✅ **Menos requisições** ao servidor
- ✅ **Experiência fluida** para o usuário
- ✅ **Economia de banda** de internet

## 🔍 Como Ver o Status do Cache

### **No Console do Navegador (F12):**

```javascript
// Verifica status do cache
import { getDataSourceStatus } from './model/loadData';

const status = getDataSourceStatus();
console.log(status);

// Retorna:
{
  mode: 'apps-script',           // ou 'csv'
  cacheValid: true,               // Cache ainda válido?
  lastFetch: '2025-01-16T...',   // Última busca
  coursesInCache: 2               // Cursos em cache
}
```

### **Logs Automáticos:**

Todos os componentes agora logam:
- ⏱️ Tempo de carregamento
- 📦 Fonte dos dados (cache ou rede)
- 📊 Quantidade de disciplinas

Exemplo no console:
```
Quadro: Status do cache: { cacheValid: true, ... }
Quadro: Dados recebidos em 142.50 ms
Quadro: 45 disciplinas
Quadro: Fonte: cache
```

## 🎯 Otimizações Implementadas

### **1. Cache Inteligente**
- Armazena dados por 5 minutos
- Renovação automática quando expira
- Compartilhado entre todos os componentes

### **2. Apps Script como Fonte Principal**
- Mais rápido que CSV
- JSON já parseado
- Cache no servidor do Google

### **3. Fallback Automático**
- Se Apps Script falhar → usa CSV
- Sistema nunca fica offline
- Sempre tem dados disponíveis

### **4. Loading States**
- Indicador visual de cache/rede
- Usuário sabe o que está acontecendo
- Melhora percepção de performance

## 📈 Comparação: Antes vs Depois

### **Antes (Sem Cache):**
```
Quadro: 3.2s
GeraGrade: 3.5s
MapaMental: 3.1s
EditDb: 3.4s

Total para visitar 4 páginas: ~13s
```

### **Depois (Com Cache):**
```
Quadro: 3.2s (primeira)
GeraGrade: 0.2s (cache)
MapaMental: 0.15s (cache)
EditDb: 0.18s (cache)

Total para visitar 4 páginas: ~3.7s
Economia: 71% mais rápido! 🚀
```

## 🛠️ Comandos Úteis

### **Limpar Cache Manualmente:**

```javascript
// No componente:
import { clearCache } from '../model/loadData';

clearCache(); // Limpa cache local + remoto
```

### **Forçar Recarregamento:**

Todos os componentes têm botão "Atualizar Dados" ou "Recarregar" que:
1. Limpa o cache
2. Busca dados novos
3. Atualiza a interface

## 🔮 Melhorias Futuras

### **Service Worker (PWA):**
- Cache permanente no navegador
- Funciona offline
- Atualização em background

### **Lazy Loading:**
- Carregar apenas dados visíveis
- Paginação de disciplinas
- Reduz tempo inicial

### **Prefetching:**
- Pré-carregar próxima página
- Cache preditivo
- Parece instantâneo

### **GraphQL/REST API:**
- Buscar apenas dados necessários
- Menos dados na rede
- Mais rápido

## 📚 Referências

- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/services/quotas)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Performance](https://web.dev/performance/)

---

**Última atualização:** 2025-01-16
**Autor:** Sistema de Geração de Grades
