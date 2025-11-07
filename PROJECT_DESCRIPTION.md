# Descrição do Projeto: Planejador de Grade

## 1. Visão Geral do Projeto

**Objetivo:** O "Planejador de Grade" é uma aplicação web projetada para ajudar estudantes universitários a planejarem seus semestres acadêmicos. A ferramenta permite que os usuários gerem sugestões de grades de horário com base nas disciplinas que já cursaram e naquelas que desejam evitar em um determinado semestre.

**Público-Alvo:** Estudantes de cursos universitários que possuem uma grade curricular semi-rígida, onde precisam escolher entre um conjunto de disciplinas disponíveis a cada semestre.

**Principais Funcionalidades:**
- Geração de sugestões de grades de horário personalizadas.
- Visualização da grade curricular completa do curso.
- Ferramenta administrativa para editar o banco de dados de disciplinas e horários.

---

## 2. Modelo de Dados

Para recriar este sistema em uma plataforma como o Firebase, você pode usar as seguintes estruturas de coleção, baseadas nos arquivos `db.json` e `db2.json`.

### Coleção: `cursos`

Armazena as configurações de cada curso. Cada documento nesta coleção representa um curso.

**ID do Documento:** `_cu` (ex: "engcomp", "matematica")

| Campo | Tipo      | Descrição                                                                                             |
| :---- | :-------- | :---------------------------------------------------------------------------------------------------- |
| `_cu` | `string`  | Identificador único do curso (ex: "engcomp").                                                         |
| `_da` | `array`   | Dimensões da grade de horários. `[<número_de_horários>, <número_de_dias_na_semana>]`. Ex: `[12, 5]`.      |
| `_hd` | `array`   | Array de arrays com os horários pré-definidos. Cada subarray é `["<início>", "<fim>"]`. Ex: `[["07:00", "07:50"], ...]`. |

### Coleção: `disciplinas`

Armazena todas as disciplinas de todos os cursos. Cada documento é uma disciplina.

**ID do Documento:** Gerado automaticamente pelo Firestore.

| Campo | Tipo      | Descrição                                                                                                                               |
| :---- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `_se` | `number`  | Semestre/Período ideal da disciplina.                                                                                                   |
| `_di` | `string`  | Nome da disciplina (ex: "Cálculo I").                                                                                                   |
| `_re` | `string`  | Código de referência único da disciplina (ex: "MAT101").                                                                                |
| `_at` | `number`  | Número de aulas teóricas.                                                                                                               |
| `_ap` | `number`  | Número de aulas práticas.                                                                                                               |
| `_pr` | `array`   | Array de strings com os códigos (`_re`) das disciplinas que são pré-requisitos.                                                         |
| `_el` | `boolean` | `true` se a disciplina for eletiva.                                                                                                     |
| `_ag` | `boolean` | `true` se a disciplina está ativa e deve aparecer para os alunos.                                                                       |
| `_cu` | `string`  | Identificador do curso (`_cu`) ao qual a disciplina pertence. Usado para filtrar.                                                      |
| `_ho` | `array`   | Array de arrays com as coordenadas `[dia, horario]` da disciplina na grade. Ex: `[[0, 0], [0, 1]]` (Segunda, nos dois primeiros horários). |
| `_da` | `array`   | Array de arrays com horários customizados. Sincronizado com `_ho`. Se `_da[i]` for `null`, usa-se o horário pré-definido de `_ho[i]`. Caso contrário, `_da[i]` é `["<início>", "<fim>"]`. |

---

## 3. Descrição Detalhada das Telas

### Tela 1: Layout Principal

**Rota:** `/`

É o contêiner visual para a maior parte da aplicação. A URL base determina o curso a ser exibido (ex: `/matematica`, `/engcomp`).

- **Componentes:**
  - **Cabeçalho:** Contém o título "Planejador de Grade".
  - **Menu de Navegação:** Permite ao usuário alternar entre as telas "Grades" e "Gerar a Sua".
- **Funcionalidade:** O conteúdo principal da página é renderizado dinamicamente com base na rota selecionada no menu.

### Tela 2: Gerador de Grade ("Gerar a Sua")

**Rota:** `/:curso` (ex: `/engcomp`)

Um assistente (wizard) em múltiplos passos que guia o usuário na criação de sugestões de horário.

- **Passo 1: Selecionar Matérias Cursadas**
  - **Descrição:** Exibe uma lista de todas as disciplinas ativas do curso, agrupadas por período. Cada disciplina é um checkbox.
  - **Interação:** O usuário marca as disciplinas que já concluiu. Contadores na tela mostram o número de matérias e o total de créditos selecionados. Um botão "Próximo" avança para o passo 2.

- **Passo 2: Selecionar Matérias a Evitar**
  - **Descrição:** Exibe a lista de disciplinas que o usuário *ainda não cursou* (calculada a partir do passo 1).
  - **Interação:** O usuário marca as disciplinas que ele **não** deseja cursar no próximo semestre. Um botão "Voltar" retorna ao passo 1 e "Gerar Grades" avança para o passo 3.

- **Passo 3: Visualizar Grades Sugeridas**
  - **Descrição:** Apresenta uma lista de até 50 grades de horário válidas, geradas por um algoritmo que considera os pré-requisitos, as matérias já cursadas e as matérias a serem evitadas.
  - **Interação:** O usuário pode visualizar as diferentes opções de grade. Um botão "Voltar" retorna ao passo 2.

### Tela 3: Grade Curricular ("Grades")

**Rota:** `/:curso/grades` (ex: `/engcomp/grades`)

- **Descrição:** Apresenta a grade curricular completa e oficial do curso. As disciplinas são organizadas em colunas que representam os períodos/semestres.
- **Interação:** Tela primariamente para visualização e consulta.

### Tela 4: Editor de Banco de Dados ("Editar Grade")

**Rota:** `/:curso/edit` (ex: `/engcomp/edit`)

Uma ferramenta administrativa para CRUD (Criar, Ler, Atualizar, Deletar) de disciplinas. Não é acessível pelo menu principal.

- **Visualização Principal:**
  - **Descrição:** Lista todas as disciplinas do curso selecionado na URL, agrupadas por período.
  - **Interação:**
    - Uma paginação permite navegar entre os períodos.
    - Clicar no nome de uma disciplina abre um overlay com o formulário de edição.
    - Um botão "Adicionar Nova Disciplina" abre um overlay com um formulário em branco.
    - Um botão "Salvar Todas as Alterações" permite baixar um arquivo `json` com o estado atual do banco de dados.

- **Formulário de Edição/Adição (Overlay):**
  - **Descrição:** Um formulário que ocupa a tela para editar ou criar uma disciplina.
  - **Campos:** Contém inputs para todos os campos do modelo de dados `disciplinas` (`_se`, `_di`, `_re`, etc.).
  - **Componente `HorarioEditor`:**
    - Exibe uma tabela que representa a grade de horários do curso (dias vs. horas).
    - O usuário clica nas células da tabela para selecionar/desselecionar os horários da disciplina (populando o campo `_ho`).
    - Abaixo da tabela, uma seção "Horários Selecionados" é exibida, mostrando cada horário escolhido em ordem.
    - Para cada horário na lista, há dois inputs de tempo (`type="time"`) que permitem ao usuário sobrescrever o horário pré-definido, populando o campo `_da`.
  - **Ações:** Botões para "Remover", "Resetar" (desfaz as alterações locais) e "Fechar" o formulário.
