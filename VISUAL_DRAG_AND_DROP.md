# 📸 VISUAL: Como Funciona o Drag and Drop

## Estado 1: Normal (Antes de Hover)

```
┌─────────────────────────────────┐
│ Período 1                       │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ Matéria A                 │  │ ← Cartão normal
│  │ MAT001 - Cálculo I        │  │   (sem destaque)
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

## Estado 2: Hover (Mouse sobre o cartão)

```
┌─────────────────────────────────┐
│ Período 1                       │
├─────────────────────────────────┤
│                                 │
│  ┌═══════════════════════════┐  │
│  ║ ↔ Duplo clique           ║  │ ← Dica aparece
│  ║ Matéria A                 ║  │   (escala 105%)
│  ║ MAT001 - Cálculo I        ║  │   (sombra)
│  ║                           ║  │
│  └═══════════════════════════┘  │
│  ▓▓▓ (sombra)          ▓▓▓       │
│                                 │
└─────────────────────────────────┘

cursor: cursor-move
```

---

## Estado 3: Duplo Clique (Drag Iniciado)

```
┌─────────────────────────────────┐
│ Período 1                       │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Matéria A                 │  │ ← Original fica no lugar
│  │ MAT001 - Cálculo I        │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
              ↓
        (mouse move)
              ↓
          ╔════════════════════════════╗
          ║ ▓ Matéria A               ║ ← Ghost node
          ║ ▓ MAT001 - Cálculo I      ║   (segue o mouse)
          ║ ▓                         ║   (opacidade 95%)
          ╚════════════════════════════╝
```

---

## Estado 4: Hovering Sobre Período (Sem Colisão)

```
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│ Período 1                       │         │ Período 2  🟢 VERDE            │ ← Coluna muda cor
├─────────────────────────────────┤         ├─────────────────────────────────┤
│  ┌───────────────────────────┐  │         │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│  │ Matéria A                 │  │         │░ ┌───────────────────────────┐ │ ← OK! Pode soltar
│  │ MAT001 - Cálculo I        │  │         │░ │ Matéria B                 │ │
│  │                           │  │         │░ │ FIS001 - Física            │ │
│  └───────────────────────────┘  │         │░ │                           │ │
│                                 │         │░ └───────────────────────────┘ │
└─────────────────────────────────┘         │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
                                            └─────────────────────────────────┘
                                            Overlay: rgba(34, 197, 94, 0.1)
                                            Borda: #22c55e (3px)
```

---

## Estado 5: Hovering Sobre Período (Com Colisão)

```
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│ Período 1                       │         │ Período 2  🔴 VERMELHA         │ ← Coluna fica vermelha
├─────────────────────────────────┤         ├─────────────────────────────────┤
│  ┌───────────────────────────┐  │         │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│  │ Matéria A                 │  │         │▒ ┌───────────────────────────┐ │ ← ❌ Não pode soltar
│  │ MAT001 - Cálculo I        │  │         │▒ │ Matéria B                 │ │    (Colisão!)
│  │ Seg 7:00-9:00            │  │         │▒ │ FIS001 - Física            │ │
│  │                           │  │         │▒ │ Seg 8:00-10:00            │ │
│  └───────────────────────────┘  │         │▒ │                           │ │
│                                 │         │▒ └───────────────────────────┘ │
└─────────────────────────────────┘         │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
                                            └─────────────────────────────────┘
                                            Overlay: rgba(239, 68, 68, 0.1)
                                            Borda: #ef4444 (3px)

                        ⚠️ Colisão: Seg 7:00-9:00 vs Seg 8:00-10:00
```

---

## Estado 6: Drop Bem-Sucedido (Sem Colisão)

```
ANTES:
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│ Período 1                       │         │ Período 2                       │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│  ┌───────────────────────────┐  │         │  ┌───────────────────────────┐  │
│  │ Matéria A                 │  │         │  │ Matéria B                 │  │
│  │ MAT001 - Cálculo I        │  │         │  │ FIS001 - Física           │  │
│  │                           │  │         │  │                           │  │
│  └───────────────────────────┘  │         │  └───────────────────────────┘  │
└─────────────────────────────────┘         └─────────────────────────────────┘
          
                           SOLTAR O MOUSE (sem colisão)
                                    ↓
                                    
DEPOIS:
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│ Período 1                       │         │ Período 2                       │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│                                 │         │  ┌───────────────────────────┐  │
│  ┌───────────────────────────┐  │         │  │ Matéria A ← MOVEU!        │  │
│  │ Matéria B                 │  │         │  │ MAT001 - Cálculo I        │  │
│  │ FIS001 - Física           │  │         │  │                           │  │
│  │                           │  │         │  └───────────────────────────┘  │
│  └───────────────────────────┘  │         │  ┌───────────────────────────┐  │
│                                 │         │  │ Matéria B                 │  │
└─────────────────────────────────┘         │  │ FIS001 - Física           │  │
                                            │  │                           │  │
                                            │  └───────────────────────────┘  │
                                            └─────────────────────────────────┘
```

---

## Estado 7: Drop Cancelado (Com Colisão)

```
DURANTE DRAG (com colisão):
         ┌─────────────────────────────────┐
         │ Período 2  🔴 VERMELHA         │
         ├─────────────────────────────────┤
         │▒▒▒▒▒ NÃO SOLTE AQUI! ▒▒▒▒▒▒▒▒▒│
         └─────────────────────────────────┘
                    
                SOLTAR O MOUSE (com colisão)
                        ↓ (CANCELADO)
                        
RESULTADO: Matéria volta à posição original
           (Como se nada tivesse acontecido)
```

---

## Estado 8: Undo/Redo

```
1. Após mover uma matéria:

   Período 1: [B, C]
   Período 2: [A, D]
   
2. Pressione Ctrl+Z (UNDO):

   Período 1: [A, B, C]  ← A volta!
   Período 2: [D]
   
3. Pressione Ctrl+Shift+Z (REDO):

   Período 1: [B, C]     ← A se move novamente
   Período 2: [A, D]
```

---

## Cores e Estados Visuais

### Verde (Sem Colisão) ✅
```
Cor: rgba(34, 197, 94, 0.1)
RGB: (34, 197, 94)
Hex: #22c55e
Significado: OK! Pode soltar com segurança
```

### Vermelho (Com Colisão) ❌
```
Cor: rgba(239, 68, 68, 0.1)
RGB: (239, 68, 68)
Hex: #ef4444
Significado: Colisão detectada! NÃO solte aqui
```

---

## Transições e Animações

```
Hover Card:
├─ Scale: 1 → 1.05 (105%)
├─ Box-shadow: none → drop-shadow-lg
├─ Duration: 200ms
└─ Timing: ease-in-out

Column Overlay:
├─ Fill color: change (green ↔ red)
├─ Duration: 150ms
├─ Timing: ease
└─ Instant: true (sem delay)

Ghost Node:
├─ Follow: cursor position
├─ Opacity: 95%
├─ Scale: 1 (normal)
└─ Shadow: drop-shadow-lg
```

---

## Fluxo Resumido

```
┌─────────────────────────────────────────────────────────┐
│ 1. NORMAL: Cartão invisível                           │
├─────────────────────────────────────────────────────────┤
│ 2. HOVER: Mostra dica "↔ Duplo clique para arrastar"  │
├─────────────────────────────────────────────────────────┤
│ 3. DUPLO CLIQUE: Ghost node segue o mouse            │
├─────────────────────────────────────────────────────────┤
│ 4. ARRASTO: Coluna muda para VERDE ou VERMELHA       │
├─────────────────────────────────────────────────────────┤
│ 5. DROP:                                               │
│    ├─ Se VERDE → Move a matéria (SUCCESS) ✅          │
│    └─ Se VERMELHA → Cancela, volta original (CANCEL) ❌│
├─────────────────────────────────────────────────────────┤
│ 6. UNDO/REDO: Ctrl+Z / Ctrl+Shift+Z                  │
└─────────────────────────────────────────────────────────┘
```

---

**Pronto para testar?** Recarregue a página e tente! 🚀
