// TESTE SIMPLIFICADO DE DRAG AND DROP
// Cole este código no console do DevTools (F12 → Console)
// e execute para fazer testes básicos

(() => {
  console.log('🚀 Iniciando testes de Drag and Drop...');

  // Teste 1: Verificar se há elementos SVG
  const svg = document.querySelector('svg');
  if (svg) {
    console.log('✅ SVG encontrado:', svg);
  } else {
    console.log('❌ SVG não encontrado!');
    return;
  }

  // Teste 2: Verificar se há cartões (foreignObject)
  const foreignObjects = document.querySelectorAll('svg foreignObject');
  console.log(`✅ ${foreignObjects.length} cartões encontrados`);

  // Teste 3: Simular duplo clique em primeiro cartão
  if (foreignObjects.length > 0) {
    const firstCard = foreignObjects[0];
    const div = firstCard.querySelector('div');
    
    if (div) {
      console.log('🔵 Simulando duplo clique no primeiro cartão...');
      
      // Criar evento de duplo clique
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: 2, // Important: detail = 2 para duplo clique
        button: 0
      });
      
      div.dispatchEvent(dblClickEvent);
      console.log('✅ Duplo clique simulado');
    }
  }

  // Teste 4: Verificar se o cursor muda
  const cartoes = document.querySelectorAll('svg g[class*="cursor-move"]');
  console.log(`✅ ${cartoes.length} cartões com cursor-move encontrados`);

  // Teste 5: Verificar hover
  if (foreignObjects.length > 0) {
    const firstDiv = foreignObjects[0].querySelector('div');
    if (firstDiv) {
      console.log('🔵 Simulando hover...');
      
      const hoverEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      firstDiv.dispatchEvent(hoverEvent);
      
      // Verificar se dica aparece
      setTimeout(() => {
        const hint = firstDiv.querySelector('[class*="Duplo clique"]');
        if (hint && hint.textContent.includes('Duplo clique')) {
          console.log('✅ Dica de drag apareceu!');
        } else {
          console.log('⚠️ Dica não visível (pode estar oculta por CSS)');
        }
      }, 100);
    }
  }

  console.log('✅ Testes concluídos! Verifique o console acima para resultados.');
})();
