# 🎓 Sistema de Gestão de Grades Curriculares - CEFET

Sistema web desenvolvido para gerenciar grades curriculares, horários e matrícula de cursos do CEFET. Integrado com Google Sheets para armazenamento de dados.

## 🚀 Tecnologias

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **React Router** - Navegação
- **Tailwind CSS** - Estilização
- **Google Apps Script** - Backend/Database
- **Lucide React** - Ícones

## ✨ Funcionalidades

### 📚 Gestão de Cursos
- Visualização de grades curriculares por curso
- Mapa mental interativo de pré-requisitos
- Gerador de grade personalizada
- Visualização de horários e períodos

### 🔐 Autenticação
- Sistema de login com Google Sheets
- Três níveis de acesso:
  - **Admin**: Gestão completa
  - **Editor**: Edição de disciplinas
  - **Viewer**: Apenas visualização
- Rotas protegidas para edição

### 📝 Editor de Dados
- Interface CRUD para disciplinas
- Editor de horários visual
- Exportação de dados (CSV/JSON)
- Sincronização em tempo real com Google Sheets

### 🎨 Interface
- Design responsivo e moderno
- Menu lateral retrátil
- Loading padronizado
- Feedback visual de ações

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy no GitHub Pages
npm run deploy
```

## 🔧 Configuração

### Google Apps Script

1. Crie uma planilha no Google Sheets
2. Configure as abas conforme estrutura:
   - **gid=0**: Lista de cursos
   - **Cursos**: Abas por curso com disciplinas
   - **users**: Usuários (username, password_hash, role)

3. Adicione o script do arquivo `google-apps-script-database.js`
4. Publique como Web App
5. Configure a URL no `src/utils/loadData.js`

### Estrutura de Dados

**Cursos (gid=0)**
- `_di`: Sigla do curso
- `name`: Nome completo
- `_da`: Dimensão [horários, dias]
- `gid`: ID da aba

**Disciplinas**
- `_di`: Código único
- `name`: Nome da disciplina
- `_re`: Pré-requisitos
- `_pr`: Período recomendado
- Outros campos configuráveis

## 🌐 Deploy

O sistema está configurado para deploy automático no GitHub Pages:

```bash
npm run deploy
```

Acesse em: https://maique1915.github.io/Matricula/

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes React
│   ├── Home.jsx       # Página inicial
│   ├── GeraGrade.jsx  # Gerador de grades
│   ├── MapaMental.jsx # Visualização de dependências
│   ├── Quadro.jsx     # Quadro de horários
│   ├── EditDb.jsx     # Editor de disciplinas
│   └── ...
├── contexts/          # Context API
│   └── AuthContext.jsx
├── model/             # Classes de domínio
├── utils/             # Funções utilitárias
└── App.jsx           # Componente raiz
```

## 🔒 Segurança

- Senhas hasheadas (SHA-256)
- Tokens de sessão (localStorage)
- Rotas protegidas por nível de acesso
- Validação de permissões no backend

## 📝 Licença

Este projeto é de uso interno do CEFET.

## 👥 Contribuindo

Para contribuir:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 🐛 Reportar Bugs

Abra uma issue descrevendo o problema e os passos para reproduzi-lo.
