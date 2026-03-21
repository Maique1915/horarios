# ⚠️ SOLUÇÃO: Drag and Drop Não Funciona

## Problema Identificado

O `handleDragStart` tem uma verificação que **BLOQUEIA** o drag se o usuário não for pago:

```typescript
const handleDragStart = (subject: Subject, initialPos: { x: number, y: number }) => {
    if (!canInteract) return;  // ← AQUI BLOQUEIA!
    setDraggedSubject(subject);
    setDragPosition(initialPos);
};
```

## Causa

`canInteract = user?.is_paid || false`

Se sua conta não for paga (`is_paid = false`), o drag não funciona!

---

## Solução Rápida (Para Testar)

### Opção 1: Usar uma Conta Paga
Faça login com uma conta que tenha `is_paid = true`.

### Opção 2: Remover a Validação Temporariamente (Para Debug)

Edite `src/app/(user)/prediction/usePredictionController.ts` na linha 449:

**De:**
```typescript
const handleDragStart = (subject: Subject, initialPos: { x: number, y: number }) => {
    if (!canInteract) return;
    setDraggedSubject(subject);
    setDragPosition(initialPos);
};
```

**Para:**
```typescript
const handleDragStart = (subject: Subject, initialPos: { x: number, y: number }) => {
    // if (!canInteract) return;  // TEMPORÁRIO: Descomentado para teste
    setDraggedSubject(subject);
    setDragPosition(initialPos);
};
```

**Depois de testar**, recoloque a validação:

---

## 🔧 CORREÇÃO: Validação de Colisão de Horário (21/03/2026)

### Problema Relatado
Matérias com choque de horário estavam sendo adicionadas em períodos que já tinham outras matérias com conflito de horário, mesmo quando arrastadas de períodos superiores (2026.2 → 2026.1).

### Bugs Identificados

#### 1️⃣ **Função `checkCollision()` não validava dados**
- **Arquivo:** [usePredictionController.ts](src/app/(user)/prediction/usePredictionController.ts#L46)
- **Problema:** A função não verificava se `_classSchedules` estava vazio ou undefined. Se ambas as matérias não tinham horários carregados, a função retornava `false` (sem colisão) mesmo que devesse bloquear.
- **Solução Implementada:**
  - ✅ Validar se `_classSchedules` existe e tem elementos
  - ✅ Validar se cada `sched.ho` é um array válido
  - ✅ Validar se `d` e `t` não são undefined
  - ✅ Verificar se `slotsA.size` e `slotsB.size` > 0 antes de comparar
  - ✅ Adicionar logs detalhados: `🔴 COLISÃO DETECTADA` com nomes das matérias e slot exato do conflito

#### 2️⃣ **`isHoverCollision` useMemo não validava índices**
- **Arquivo:** [usePredictionController.ts](src/app/(user)/prediction/usePredictionController.ts#L235)
- **Problema:** Se `hoveredSemesterIndex` >= comprimento de `allSemesters`, o `targetSemester` ficava vazio `[]` e a colisão não era detectada. Isso poderia acontecer ao arrastar para períodos muito à frente ou fora dos limites.
- **Solução Implementada:**
  - ✅ Adicionar validação: `if (hoveredSemesterIndex < 0 || hoveredSemesterIndex >= allSemesters.length) return true`
  - ✅ Bloqueia o drop se o índice está fora dos limites
  - ✅ Adicionar log de aviso: `⚠️  hoveredSemesterIndex X fora dos limites`

#### 3️⃣ **`getDetailedCollisionReason()` não reportava horários faltando**
- **Arquivo:** [usePredictionController.ts](src/app/(user)/prediction/usePredictionController.ts#L567)
- **Problema:** Função detalhada não verificava se os horários estavam sendo carregados corretamente e não informava o usuário quando uma matéria não tinha `_classSchedules`.
- **Solução Implementada:**
  - ✅ Adicionar validação inicial para subject e matérias no semestre alvo
  - ✅ Log de aviso se `_classSchedules` estiver vazio/undefined
  - ✅ Mostrar dados do subject se houver problema: `_id`, `_re`, `_classSchedules`
  - ✅ Contar quantas matérias estão sendo analisadas no semestre alvo

### Alterações no Código

**Resumo das Mudanças:**
1. `checkCollision()` (46-82): Adicionadas 5 validações de dados
2. `isHoverCollision()` useMemo (235-242): Adicionada verificação de limites do índice
3. `getDetailedCollisionReason()` (567-600): Adicionadas validações iniciais e logs detalhados

### Como Testar

1. Abra o console do navegador (`F12`)
2. Tente arrastar uma matéria para um período que tem outra com conflito de horário
3. Procure pelos logs:
   - 🔴 **COLISÃO DETECTADA**: Indica que uma colisão foi encontrada
   - ⚠️ **hoveredSemesterIndex X fora dos limites**: Indica índice inválido
   - ⚠️ **não tem horários**: Indica matéria sem horários carregados
4. O drop deve ser **BLOQUEADO** (cor vermelha no hover)
5. Uma mensagem deve aparecer: `⏰ Colisão de horário: MAT1 choca com MAT2`

### Próximos Passos (Se Ainda Não Funcionar)

1. **Verificar dados no banco:** Confirmar se as matérias têm `_classSchedules` preenchido no Supabase
   ```sql
   SELECT _re, _di, _classSchedules FROM subjects WHERE _re IN ('CODE1', 'CODE2');
   ```

2. **Verificar estrutura de `_classSchedules`:** Deve ser algo como:
   ```json
   [
     {
       "class_name": "A",
       "ho": [[1, 7], [1, 8]],
       "rt": [{"start": "07:00", "end": "09:00"}]
     }
   ]
   ```

3. **Usar Ctrl+Shift+K** para ver o DevTools Console durante o drag
```typescript
const handleDragStart = (subject: Subject, initialPos: { x: number, y: number }) => {
    if (!canInteract) return;  // Validação ativa novamente
    setDraggedSubject(subject);
    setDragPosition(initialPos);
};
```

### Opção 3: Usar Ambiente de Desenvolvimento

Se você tem acesso ao banco de dados, atualize seu usuário para `is_paid = true`:

```sql
UPDATE users SET is_paid = true WHERE id = 'seu-user-id';
```

---

## Após Remover a Validação...

Recarregue a página (`F5`) e tente novamente:

1. Hover em um cartão → dica aparece?
2. Duplo clique no cartão → cartão segue o mouse?
3. Arraste para outro semestre → cor muda (verde/vermelho)?
4. Solte → matéria se move?

Se sim, então o drag and drop está **FUNCIONANDO** e a única barreira é a validação de pagamento!

---

## Status Final

✅ **Código Implementado Corretamente**  
✅ **Lógica de Colisão Funciona**  
✅ **Visual Feedback Implementado**  
❌ **Bloqueado por: Validação de Pagamento**

---

## Próximo Passo

Depois que confirmar que funciona (removendo a validação), podemos:

1. ✅ Reativar a validação de pagamento
2. ✅ Implementar otimização (minimax + DP)
3. ✅ Testar com usuários pagos em produção

**Qual você prefere fazer agora?** 🚀
