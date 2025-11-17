# 🚀 Context API para Dados do Curso

## 🎯 Problema Resolvido

Antes, cada componente chamava `loadCoursesRegistry()` independentemente para buscar:
- `_da` - Dimensão da grade [numHorarios, numDias]
- `_hd` - Horários fixos definidos [[inicio, fim], ...]

Isso causava **múltiplas requisições** para os mesmos dados.

## ✅ Solução: CourseConfigContext

Criado um **Context Provider** que:
1. Carrega os dados **uma única vez**
2. Compartilha com **todos os componentes filhos**
3. Usa o **cache já implementado** em `Filtro.jsx`

## 📁 Arquitetura

```
┌──────────────────────────────────────────────┐
│     CourseConfigProvider (Context)           │
│  ┌────────────────────────────────────────┐  │
│  │  getCachedCoursesRegistry()            │  │
│  │  (Cache de 5 minutos em Filtro.jsx)   │  │
│  └────────────────────────────────────────┘  │
│           ↓ busca uma vez                    │
│  ┌────────────────────────────────────────┐  │
│  │  courseConfig = {                      │  │
│  │    _cu: 'engcomp',                     │  │
│  │    name: 'Engenharia de Computação',  │  │
│  │    _da: [6, 5],  // horários x dias   │  │
│  │    _hd: [[...]]  // horários fixos    │  │
│  │  }                                     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
         ↓ compartilha
    ┌──────────────────────────────┐
    │     Componentes Filhos       │
    ├──────────────────────────────┤
    │  • Comum.jsx                 │
    │  • HorarioEditor.jsx         │
    │  • (qualquer outro)          │
    └──────────────────────────────┘
```

## 🔧 Como Usar

### **1. Envolver com Provider**

```jsx
import { CourseConfigProvider } from '../model/CourseConfigContext';

function MyComponent() {
  const { cur } = useParams();
  
  return (
    <CourseConfigProvider currentCourse={cur}>
      {/* Componentes filhos aqui */}
      <Comum materias={data} cur={cur} />
      <HorarioEditor cur={cur} />
    </CourseConfigProvider>
  );
}
```

### **2. Consumir no Componente Filho**

#### **Opção A: Hook completo**
```jsx
import { useCourseConfig } from '../model/CourseConfigContext';

function MyComponent() {
  const { courseConfig, loading, error } = useCourseConfig();
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  const [numHorarios, numDias] = courseConfig._da;
  const horariosFixos = courseConfig._hd;
  
  // Usar os dados...
}
```

#### **Opção B: Hooks específicos**
```jsx
import { 
  useCourseDimension, 
  useCourseSchedule 
} from '../model/CourseConfigContext';

function MyComponent() {
  const [numHorarios, numDias] = useCourseDimension();
  const horariosFixos = useCourseSchedule();
  
  // Usar os dados...
}
```

## 📊 Hooks Disponíveis

| Hook | Retorna | Uso |
|------|---------|-----|
| `useCourseConfig()` | `{ courseConfig, loading, error }` | Dados completos + estado |
| `useCourseData()` | `courseConfig \| null` | Apenas dados de config |
| `useCourseDimension()` | `[numHorarios, numDias]` | Dimensão da grade |
| `useCourseSchedule()` | `Array<[inicio, fim]>` | Horários fixos |

## 🎯 Componentes Atualizados

### **1. Comum.jsx**

**Antes:**
```jsx
// ❌ Carregava dados toda vez
useEffect(() => {
  const horariosData = await horarios(_cur);
  const dimData = await dimencao(_cur);
  setH(horariosData);
  setTh(dimData[0]);
  setTd(dimData[1]);
}, [_cur]);
```

**Depois:**
```jsx
// ✅ Usa Context (instantâneo)
const [th, td] = useCourseDimension();
const h = useCourseSchedule();
const { loading, error } = useCourseConfig();
```

### **2. HorarioEditor.jsx**

**Antes:**
```jsx
// ❌ Tinha seu próprio cache
let coursesRegistryCache = null;
useEffect(() => {
  const coursesRegistry = await loadCoursesRegistry();
  const data = coursesRegistry.find(c => c._cu === cur);
  setCursoData(data);
}, [cur]);
```

**Depois:**
```jsx
// ✅ Usa Context (compartilhado)
const { courseConfig, loading, error } = useCourseConfig();
const numHorarios = courseConfig?._da[0] || 0;
const numDias = courseConfig?._da[1] || 0;
const horariosDefinidos = courseConfig?._hd || [];
```

### **3. Quadro.jsx**

**Antes:**
```jsx
return <Comum materias={[a]} cur={cur} />;
```

**Depois:**
```jsx
return (
  <CourseConfigProvider currentCourse={cur}>
    <Comum materias={[a]} cur={cur} />
  </CourseConfigProvider>
);
```

### **4. GeraGrade.jsx**

Mesmo padrão do Quadro.

## 📈 Benefícios

### **Performance:**
- ✅ **Uma única requisição** por curso
- ✅ **Cache compartilhado** entre componentes
- ✅ **Dados sincronizados** automaticamente

### **Antes (Sem Context):**
```
Comum.jsx carrega      → 2-3s (busca servidor)
HorarioEditor carrega  → 2-3s (busca servidor de novo!)
Total: ~4-6s para 2 componentes
```

### **Depois (Com Context):**
```
Provider carrega       → 2-3s (busca servidor uma vez)
Comum.jsx              → instantâneo (usa Context)
HorarioEditor          → instantâneo (usa Context)
Total: ~2-3s para N componentes! 🚀
```

### **Código:**
- ✅ **Menos duplicação** de lógica
- ✅ **Mais fácil** de manter
- ✅ **Centralizado** em um único lugar

### **UX:**
- ✅ **Navegação mais rápida**
- ✅ **Sem recarregamentos** desnecessários
- ✅ **Feedback consistente** (loading states)

## 🔄 Fluxo de Dados

```
1. Component monta
   └─> CourseConfigProvider.useEffect()
       └─> getCachedCoursesRegistry()  // Filtro.jsx
           └─> Cache válido? 
               ├─> SIM: retorna instantâneo ⚡
               └─> NÃO: busca servidor + atualiza cache

2. Provider atualiza courseConfig

3. Todos os componentes filhos recebem dados
   └─> Via hooks: useCourseConfig(), etc.

4. Componentes renderizam com dados
```

## ⚠️ Importante

### **Sempre envolver com Provider:**

```jsx
// ✅ CORRETO
<CourseConfigProvider currentCourse={cur}>
  <Comum ... />
</CourseConfigProvider>

// ❌ ERRO - vai dar erro
<Comum ... />  // sem Provider!
```

### **Provider precisa de `currentCourse`:**

```jsx
// ✅ CORRETO
<CourseConfigProvider currentCourse="engcomp">

// ❌ ERRO - currentCourse é undefined
<CourseConfigProvider>
```

## 🧪 Como Testar

### **No Console (F12):**

1. **Primeira carga:**
   ```
   CourseConfigProvider: Carregando config para: engcomp
   Filtro: Buscando coursesRegistry do servidor
   CourseConfigProvider: Config carregada em 1234.56ms
   ```

2. **Navegação para outra página (mesma aba):**
   ```
   CourseConfigProvider: Carregando config para: engcomp
   Filtro: Usando cache de coursesRegistry  ← CACHE!
   CourseConfigProvider: Config carregada em 0.52ms  ← RÁPIDO!
   ```

3. **Componentes filhos não fazem requisições:**
   - Nenhum log de `horarios()` ou `dimencao()`
   - Dados já disponíveis via Context

## 🔮 Extensões Futuras

### **Adicionar mais dados ao Context:**

```javascript
// CourseConfigContext.jsx
const courseConfig = {
  _cu: data._cu,
  name: data.name,
  _da: data._da,
  _hd: data._hd,
  gid: data.gid,
  // ✨ Adicionar novos campos:
  periodos: data.periodos,
  coordenador: data.coordenador,
  // ... etc
};
```

### **Múltiplos cursos simultâneos:**

```jsx
<CourseConfigProvider currentCourse="engcomp">
  <CourseConfigProvider currentCourse="matematica">
    {/* Nested providers para comparar cursos */}
  </CourseConfigProvider>
</CourseConfigProvider>
```

## 📚 Referências

- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Context Performance](https://react.dev/reference/react/useContext#optimizing-re-renders)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**Data:** 2025-01-17
**Versão:** 3.0
**Status:** ✅ Implementado e Testado
