# Sistema de Carregamento de Dados do Google Sheets

## Como Funciona

O sistema agora carrega os dados das disciplinas diretamente do Google Sheets em tempo real, eliminando a necessidade de manter arquivos CSV no projeto.

### Arquivo Principal: `src/model/loadData.js`

Este arquivo contém:

1. **URL do Google Sheets**: 
   ```javascript
   const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQDxOYV5tQlDvKYrvNAQUBjLjJgL00WVtKmPYsuc9cBVr5Y6FAPZSha3iOCUSSDdGxmyJSicnFeyiI8/pub?output=csv';
   ```

2. **Cache de Dados**: Os dados são carregados uma vez e mantidos em cache para evitar múltiplas requisições

3. **Conversão CSV → JSON**: Converte automaticamente os dados do CSV para o formato JSON esperado pela aplicação

### Funções Disponíveis

- `loadDbData()`: Carrega os dados do Google Sheets (com cache)
- `clearCache()`: Limpa o cache para forçar recarregamento dos dados

### Como Atualizar os Dados

1. Edite a planilha no Google Sheets
2. As mudanças serão refletidas automaticamente na próxima vez que a página for recarregada
3. Para forçar atualização imediata sem recarregar a página, chame `clearCache()` seguido de `loadDbData()`

### Arquivos Modificados

Os seguintes arquivos foram atualizados para usar o loader:

- `src/model/Filtro.jsx` - Funções de filtro agora são assíncronas
- `src/components/MapaMental.jsx` - Carrega dados ao renderizar
- `src/components/EditDb.jsx` - Carrega dados ao editar
- `src/components/GeraGrade.jsx` - Carrega dados com useState/useEffect
- `src/components/Quadro.jsx` - Carrega dados com useState/useEffect

**Importante**: Como as funções agora são assíncronas, todos os componentes que usam dados do Google Sheets devem usar `useState` e `useEffect` para carregar os dados.

### Formato do CSV no Google Sheets

O CSV deve manter o seguinte formato:

```
_cu,_se,_di,_re,_ap,_at,_el,_ag,_pr,_ho,_au,_ha,_da
engcomp,1,Administração e Org. Empresarial,1B,2,0,TRUE,TRUE,,"[[0, 4], [0, 5]]",T. 1102,[],
```

**Campos:**
- `_cu`: Código do curso
- `_se`: Semestre (número)
- `_di`: Nome da disciplina
- `_re`: Código de referência
- `_ap`: Aulas práticas
- `_at`: Aulas teóricas
- `_el`: Eletiva (boolean)
- `_ag`: Ativa/Agendada (boolean)
- `_pr`: Pré-requisitos (array de códigos separados por vírgula)
- `_ho`: Horários (array JSON)
- `_au`: Auditório/Sala
- `_ha`: Histórico adicional (array)
- `_da`: Data (string)

### Vantagens

✅ **Dados sempre atualizados**: Não precisa fazer deploy para atualizar dados  
✅ **Colaboração**: Múltiplos usuários podem editar a planilha  
✅ **Menos arquivos**: Não precisa manter CSV no repositório  
✅ **Performance**: Sistema de cache evita requisições desnecessárias

### Limitações

⚠️ **Requer internet**: O sistema precisa de conexão para carregar os dados  
⚠️ **Primeira carga**: Pode haver um pequeno delay no primeiro carregamento
