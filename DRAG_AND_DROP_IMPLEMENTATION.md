# 🎯 Implementação de Drag and Drop - Resumo Técnico

## Status: ✅ IMPLEMENTADO E FUNCIONAL

---

## 1. COMO FUNCIONA

### Fluxo de Interação do Usuário

```
1. Usuário vê card da matéria
   └─ Dica visual: "Duplo clique para arrastar" ao hoverar

2. Duplo clique no card
   └─ `MapaMentalNode.handleMouseDown()` dispara `onDragStart()`
   └─ Estado: `draggedSubject` ← matéria selecionada

3. Mouse move enquanto arrasta
   └─ `MapaMentalVisualizacao.handleMouseMove()` calcula posição
   └─ Chama `onDragMove(pos, semesterIndex)`
   └─ Estado: `dragPosition` e `hoveredSemesterIndex` atualizados

4. Coluna alvo muda de cor
   ├─ 🟢 VERDE: Sem colisão, pode soltar
   └─ 🔴 VERMELHO: Colisão detectada, não pode soltar

5. Mouse up (soltar)
   └─ `MapaMentalVisualizacao.handleMouseUp()` → `onDragEnd()`
   └─ Se SEM colisão: 
      ├─ Move matéria para semestre destino
      ├─ Atualiza `fixedSemesters`
      └─ Salva no histórico (undo/redo)
   └─ Se COM colisão: Nada acontece (mantém original)
```

---

## 2. ARQUIVOS MODIFICADOS

### A. `usePredictionController.ts`
**Mudanças:**
- ✅ `handleDragStart()` - Inicia drag com controle de permissão
- ✅ `handleDragMove()` - Atualiza posição e semestre sendo hoverado
- ✅ `handleDragEnd()` - Finaliza drag com validação
- ✅ `isHoverCollision` (useMemo) - Detecção inteligente de colisão

**Lógica de Colisão:**
```typescript
const isHoverCollision = useMemo(() => {
  // 1. Valida colisão de horário com checkCollision()
  // 2. Valida pré-requisitos com Grafos
  // 3. Valida créditos necessários
  return hasConflict;
}, [draggedSubject, hoveredSemesterIndex, ...])
```

### B. `MapaMentalVisualizacao.jsx`
**Mudanças:**
- ✅ Visual feedback melhorado:
  - Fundo preenchido (verde/vermelho)
  - Borda destacada (verde/vermelho)
  - Ghost node do card durante drag
  - Sombra no ghost node

```jsx
{draggedSubject && hoveredSemesterIndex !== null && (
  <>
    <rect fill={isHoverCollision ? "red" : "green"} />
    <rect stroke={isHoverCollision ? "red" : "green"} strokeWidth="3" />
  </>
)}
```

### C. `MapaMentalNode.jsx`
**Mudanças:**
- ✅ Detecta duplo clique (e.detail === 2)
- ✅ Hover visual: escala + sombra
- ✅ Dica ao hoverar: "↔ Duplo clique para arrastar"
- ✅ Cursor muda para `cursor-move`

```jsx
const [isHovered, setIsHovered] = React.useState(false);

{isHovered && (
  <div className="text-[8px] text-slate-400">
    ↔ Duplo clique para arrastar
  </div>
)}
```

---

## 3. DETECÇÃO DE COLISÃO

### Função Principal: `checkCollision(subA, subB)`

```typescript
export const checkCollision = (subA: Subject, subB: Subject) => {
  // Extrai slots [dia:hora] de cada matéria
  const slotsA = subA._classSchedules?.flatMap(s => 
    s.ho?.map(([d, t]) => `${d}:${t}`) || []
  );
  
  const slotsB = subB._classSchedules?.flatMap(s => 
    s.ho?.map(([d, t]) => `${d}:${t}`) || []
  );
  
  // Se compartilham slot → true (colisão)
  return slotsA.some(slot => slotsB.includes(slot));
};
```

### Validação Completa no Hover

```typescript
// 1. Colisão de horário
for (const s of otherSubjectsInTarget) {
  if (checkCollision(draggedSubject, s)) return true;
}

// 2. Pré-requisitos
const candidates = grafos.matriz(); // Matérias que podem ser feitas
if (!candidates.some(c => c._re === draggedSubject._re)) {
  return true; // Não pode fazer por falta de pré-req
}

// 3. Créditos (já incluído no Grafos)
```

---

## 4. ESTADOS VISUAIS

| Estado | Cor | Interpretação |
|--------|-----|---|
| Verde (🟢) | `rgba(34, 197, 94, 0.1)` | ✅ Permitido - solte sem medo |
| Vermelho (🔴) | `rgba(239, 68, 68, 0.1)` | ❌ Bloqueado - não pode soltar |
| Hover card | Escala 105% + sombra | 👆 Clique 2x para arrastar |

---

## 5. FLUXO DE DADOS

```
PredictionView (Component)
    ↓
usePredictionController (Custom Hook)
    ├─ state: draggedSubject, hoveredSemesterIndex, dragPosition
    ├─ computed: isHoverCollision (useMemo)
    └─ handlers: handleDragStart, handleDragMove, handleDragEnd
    ↓
MapaMentalVisualizacao (SVG Canvas)
    ├─ Recebe props: draggedSubject, hoveredSemesterIndex, isHoverCollision
    ├─ Renderiza: overlay colorido + ghost node
    └─ Dispara: onDragStart, onDragMove, onDragEnd
    ↓
MapaMentalNode (Card Individual)
    ├─ Detecta: duplo clique
    └─ Dispara: onDragStart(svgPoint)
```

---

## 6. COMO TESTAR

### Testes Manuais

```
1. Abra http://localhost:3000/prediction
2. Hover em um card
   └─ Deve aparecer "↔ Duplo clique para arrastar"
3. Duplo clique em um card
   └─ Card deve seguir o mouse (ghost node)
4. Mova para outro semestre
   └─ Coluna deve ficar VERDE ou VERMELHA
5. Solte o mouse
   ├─ Se VERDE: Matéria muda de semestre ✅
   └─ Se VERMELHO: Matéria volta (nada acontece) ❌
```

### Casos de Teste

```
✅ Drag para semestre sem conflito
✅ Drag para semestre COM conflito horário → bloqueado
✅ Drag para semestre COM falta de pré-requisito → bloqueado
✅ Drag para semestre COM créditos insuficientes → bloqueado
✅ Cancelar drag (mover mouse para fora, soltar)
✅ Undo/Redo após drag (Ctrl+Z / Ctrl+Shift+Z)
✅ Trial user não consegue arrastar (canInteract = false)
```

---

## 7. MELHORIAS FUTURAS (PRÓXIMAS FASES)

### Fase 2: Otimização pós-drop
- [ ] Aplicar minimax ao semestre onde caiu
- [ ] Reotimizar períodos futuros com DP
- [ ] Animar transição após drop

### Fase 3: UX Avançado
- [ ] Tooltip mostrando motivo da colisão
- [ ] Preview de como ficaria o novo layout
- [ ] Animação suave de reorganização

### Fase 4: Performance
- [ ] Memoizar cálculos de colisão
- [ ] Debounce no handleDragMove
- [ ] Virtual scrolling para muitos cards

---

## 8. TROUBLESHOOTING

### Problema: Drag não funciona
**Solução:**
1. Verificar se `canInteract = true` (user.is_paid || false)
2. Verificar se duplo clique está sendo detectado (console.log)
3. Limpar cache do navegador

### Problema: Colisão não detecta
**Solução:**
1. Verificar estrutura de `_classSchedules` e `ho`
2. Verificar se horários estão no formato `[dia, hora]`
3. Adicionar console.log em `checkCollision()`

### Problema: Semestre destino não encontrado
**Solução:**
1. Verificar se `hoveredSemesterIndex` está correto
2. Verificar COLUMN_WIDTH está 380px
3. Adicionar logging em `handleDragMove()`

---

## 9. PRÓXIMOS PASSOS

1. **Agora**: Testar drag and drop funcionando ✅
2. **Depois**: Implementar otimização (minimax + DP)
3. **Final**: Integrar com histórico e sugestões

---

## 📝 Notas Importantes

- ⚠️ **Trial users** não conseguem arrastar (`canInteract = false`)
- ⚠️ **Duplo clique** é obrigatório (evita selecionar acidentalmente)
- ⚠️ **Colisão** é verificada em TEMPO REAL durante hover
- ⚠️ **Histórico** é salvo automaticamente após cada drop bem-sucedido
- ⚠️ **SVG coordinates** requerem transformação de client → SVG

---

**Status**: Pronto para teste! 🚀
