# Plano de Implementação - Ajuste de Tema e Hover Dark Mode

O objetivo é garantir que o modo escuro funcione perfeitamente, incluindo a correção de efeitos de hover que estão com contraste inadequado (fundo claro em texto claro).

## Tarefas

1. **Investigação de Componentes**: Localizar o componente responsável pela lista de disciplinas mostrada na imagem.
2. **Correção de Estilos CSS**:
    - Ajustar `globals.css` para garantir que as variáveis de hover sejam sensíveis ao tema.
    - Atualizar classes utilitárias de hover no componente específico.
3. **Refinamento do ThemeContext**: Garantir que a persistência e aplicação da classe `.dark` estejam sólidas.
4. **Verificação Visual**: Garantir que o contraste seja legível em ambos os modos.

## Plano de Ação

- Pesquisar por "cr •" para achar o componente da lista.
- Adicionar variáveis de hover ao `:root` e `.dark` no `globals.css`.
- Substituir cores fixas de hover por variáveis ou cores compatíveis com `dark:hover`.
