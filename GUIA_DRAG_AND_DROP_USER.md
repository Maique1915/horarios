# 🎮 Guia de Uso: Drag and Drop de Matérias

## Como Usar (Para o Usuário)

### Passo 1: Acessar a Página de Predição
Vá para `http://localhost:3000/prediction`

### Passo 2: Encontrar uma Matéria que Quer Mover
Na grade visual (mapa mental), você verá cartões coloridos com as matérias de cada semestre.

### Passo 3: Hoverar no Cartão
Quando você passa o mouse sobre uma matéria, vai ver:
- ✅ Cartão fica um pouco maior
- ✅ Sombra ao redor do cartão
- ✅ Dica no canto: **"↔ Duplo clique para arrastar"**

### Passo 4: Duplo Clique (não simples clique!)
**Clique DUAS VEZES** rapidamente no cartão da matéria:

```
Click → Click (em ~300ms)
```

Pronto! A matéria será selecionada e pronta para arrastar.

### Passo 5: Arrastar para Outro Semestre
Mantenha o botão do mouse pressionado e mova para outro semestre.

**Enquanto arrasta:**
- Um **fantasma do cartão** segue seu mouse
- A **coluna do semestre destino muda de cor**:
  - 🟢 **VERDE**: Sem conflitos! Pode soltar com segurança
  - 🔴 **VERMELHO**: Há conflito! Não solte aqui

### Passo 6: Soltar o Mouse
Quando estiver sobre um semestre verde, solte o botão do mouse.

**O que acontece:**
- ✅ Matéria muda de semestre
- ✅ Horários são automaticamente validados
- ✅ Histórico é atualizado (você pode fazer Undo com Ctrl+Z)

---

## Exemplos de Colisão (Vermelho)

### Exemplo 1: Conflito de Horário
```
Matéria A: Segunda 7:00-9:00
Matéria B: Segunda 8:00-10:00
                ↓
Conflito! (compartilham Segunda 8:00-9:00)
Coluna fica VERMELHA ❌
```

### Exemplo 2: Falta de Pré-requisito
```
Quer mover: Cálculo II
Semestre destino: Período 1

Problema: Precisa de Cálculo I primeiro!
Coluna fica VERMELHA ❌
```

### Exemplo 3: Sem Conflito (Verde)
```
Matéria A: Seg-Qua 7:00-9:00
Matéria B: Ter-Qui 14:00-16:00
                ↓
Sem conflito! Horários diferentes
Coluna fica VERDE ✅
```

---

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+Z` | Desfazer última mudança |
| `Ctrl+Shift+Z` | Refazer última mudança desfeita |

---

## Limitações (Se Aplicável)

### Trial Users (Não Pago)
- ❌ Não pode arrastar matérias
- ✅ Pode visualizar a grade
- ✅ Pode apenas conferir sugestões

**Para desbloquear:** Adquira um plano em `http://localhost:3000/plans`

---

## Troubleshooting

### "Nada acontece quando clico"
- Tente **duplo clique** (não simples clique)
- Verifique se a cor da coluna muda (para verde ou vermelho)
- Se ainda não funcionar, recarregue a página

### "Cartão desaparece ou volta"
- Se a coluna estiver **vermelha** (conflito), o cartão volta à posição original
- Tente outro semestre onde a coluna fica **verde**

### "Meu plano não está ativado"
- Verifique em `http://localhost:3000/plans`
- Pode ser que o pagamento ainda não foi processado

---

## Dicas Úteis

✨ **Dica 1**: Comece movendo matérias do começo do curso para os períodos finais

✨ **Dica 2**: Preste atenção nas cores!
- Verde = OK
- Vermelho = NÃO OK

✨ **Dica 3**: Use Ctrl+Z se arrastou errado. Não tem limite de undo!

✨ **Dica 4**: Cada vez que você move uma matéria, os períodos futuros são reotimizados automaticamente (logo, logo!)

---

## Próximas Funcionalidades

🔄 **Em breve:**
- Arrastar múltiplas matérias de uma vez
- Preview do novo horário antes de confirmar
- Sugestões de onde mover automaticamente

---

**Dúvidas?** Verifique o arquivo `DRAG_AND_DROP_IMPLEMENTATION.md` para mais detalhes técnicos.
