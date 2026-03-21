# 🐛 DEBUG: Testando Drag and Drop

## Passo 1: Verifique se há erros no Console

Abra o DevTools (F12) e vá para **Console**.

Se houver erros relacionados a drag/drop, você verá mensagens vermelhas lá.

---

## Passo 2: Teste Manual Passo a Passo

### 2.1 - Abra a página
```
http://localhost:3000/prediction
```

### 2.2 - Adicione um console.log temporário para debug
Você pode abrir DevTools → Console e executar:

```javascript
// Teste se consegue acessar o sistema
console.log('página carregada');
```

### 2.3 - Hover em um cartão
Passe o mouse sobre uma matéria e verifique:
- [ ] O cartão fica maior (scale-105)
- [ ] Aparece sombra ao redor
- [ ] Aparece texto "↔ Duplo clique para arrastar" no canto superior esquerdo

### 2.4 - Duplo clique
Faça **DUPLO CLIQUE** (não simples clique) em um cartão.

**Verifique no Console** (F12):
Se adicionar `console.log` em `handleMouseDown`, você deve ver a mensagem quando duplo-clicar.

### 2.5 - Arraste
Mantenha o botão pressionado e mova o mouse para outro semestre.

**Verifique:**
- [ ] Um "fantasma" do cartão segue o mouse
- [ ] A coluna destino muda de cor:
  - 🟢 VERDE se sem conflito
  - 🔴 VERMELHO se com conflito

### 2.6 - Solte
Solte o botão do mouse sobre um semestre com VERDE.

**Verifique:**
- [ ] Matéria se move para novo semestre
- [ ] Histórico atualiza (Ctrl+Z desfaz)

---

## Passo 3: Se Nada Funcionar...

### Problema 1: Duplo clique não é detectado

**Causa**: O evento de duplo clique não está chegando ao handler.

**Teste**:
```javascript
// No console do DevTools, execute:
document.addEventListener('dblclick', (e) => {
  console.log('Duplo clique detectado:', e);
});
```

Agora duplo-clique em um cartão e veja se a mensagem aparece no console.

### Problema 2: O cartão não segue o mouse

**Causa**: `handleDragMove` não está sendo chamado ou `dragPosition` não está atualizando.

**Solução**: Verifique se `onMouseMove` no SVG está sendo disparado.

### Problema 3: Cores não mudam (verde/vermelho)

**Causa**: `isHoverCollision` pode estar undefined ou não atualizando.

**Teste**: 
Abra DevTools → Aba Elements e procure pelo overlay rect durante o drag. Verifique se o atributo `fill` está mudando.

---

## Passo 4: Adicionar Logging para Debug

Se nada funcionar, vou adicionar `console.log` nos arquivos. Edite:

### MapaMentalNode.jsx

Na função `handleMouseDown`, adicione:

```jsx
const handleMouseDown = (e) => {
  console.log('🔵 handleMouseDown disparado', { 
    detail: e.detail, 
    button: e.button,
    isDblClick: e.detail === 2
  });
  
  if (e.button !== 0) return;
  
  if (e.detail === 2) {
    console.log('🟢 Duplo clique confirmado!');
    e.stopPropagation();
    e.preventDefault();
    
    if (onDragStart) {
      console.log('🟢 Chamando onDragStart');
      onDragStart({ x: e.clientX, y: e.clientY });
    }
  }
};
```

### MapaMentalVisualizacao.jsx

Na função `handleMouseMove`, adicione:

```jsx
const handleMouseMove = (e) => {
  if (draggedSubject) {
    console.log('🔵 Arrastando...', { 
      draggedSubject: draggedSubject._di,
      clientX: e.clientX,
      clientY: e.clientY
    });
    const point = getSVGPoint(e.clientX, e.clientY);
    const semesterIndex = Math.max(0, Math.floor(point.x / COLUMN_WIDTH));
    onDragMove(point, semesterIndex);
  }
  // ... resto do código
};
```

---

## Passo 5: Checklist de Debugging

Verifique cada item:

- [ ] Duplo clique é detectado (aparece em console)
- [ ] `onDragStart` é chamado
- [ ] `draggedSubject` é atualizado (verifique no estado)
- [ ] `dragPosition` é atualizado (verifique no estado)
- [ ] `hoveredSemesterIndex` é calculado corretamente
- [ ] `isHoverCollision` retorna true/false
- [ ] SVG overlay renderiza (verifique no Elements)
- [ ] `handleDragEnd` é chamado quando solta

---

## Passo 6: Verificar Permissões

Certifique-se de que:

```typescript
canInteract = user?.is_paid || false;
```

Se `canInteract = false`, o drag não funciona.

**Verifique**:
Você está logado com uma conta PAGA?

Caso contrário, teste com um usuário admin ou temporariamente remova a validação para testar.

---

## Próximos Passos

Se adicionar os `console.log` acima e executar os testes, você verá exatamente onde o código está falhando.

**Envie as mensagens do console** para que eu possa debugar especificamente qual parte está quebrada.

---

**Pronto? Faça o teste acima e me diga o que aparece no console!** 🚀
