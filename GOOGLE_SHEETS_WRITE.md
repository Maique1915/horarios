# 📝 Como Configurar Google Apps Script para Salvar Dados

## 📋 Passo 1: Criar Script no Google Sheets

1. **Abra sua planilha** no Google Sheets
2. Vá em **Extensões > Apps Script**
3. **Apague** todo o código existente
4. **Cole o código abaixo**:

```javascript
function doPost(e) {
  try {
    // Pega a planilha ativa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse dos dados recebidos
    const data = JSON.parse(e.postData.contents);
    
    // Log para debug
    Logger.log('Dados recebidos: ' + JSON.stringify(data));
    
    // Adicionar nova linha com os dados do curso
    const newRow = [
      data._cu,           // Código do curso
      data._se || 0,      // Semestre
      data._di || '',     // Disciplina
      data._re || '',     // Referência
      data._ap || 0,      // Aulas práticas
      data._at || 0,      // Aulas teóricas
      data._el || false,  // Eletiva
      data._ag || true,   // Ativa
      data._pr || '',     // Pré-requisitos
      data._ho || '[]',   // Horários
      data._au || '',     // Auditório
      data._ha || '[]',   // Histórico
      data._da || ''      // Data
    ];
    
    // Adiciona a linha na planilha
    sheet.appendRow(newRow);
    
    // Log de sucesso
    Logger.log('Linha adicionada com sucesso!');
    
    // Retorna sucesso
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Curso adicionado com sucesso!',
        data: data 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log de erro
    Logger.log('Erro: ' + error.toString());
    
    // Retorna erro
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função para testar via GET (opcional)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'API funcionando! Use POST para enviar dados.',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Função de teste (execute manualmente para testar)
function testarAdicao() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        _cu: 'teste',
        _se: 1,
        _di: 'Disciplina de Teste',
        _re: '1A',
        _ap: 0,
        _at: 4,
        _el: false,
        _ag: true,
        _pr: '',
        _ho: '[]',
        _au: '',
        _ha: '[]',
        _da: ''
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log('Resultado do teste: ' + result.getContent());
}
```

5. **Salve** o projeto (Ctrl+S ou ícone de disquete)
6. Dê um nome ao projeto (ex: "API Matricula")

---

## 🚀 Passo 2: Deploy como Web App

1. Clique no botão **"Implantar"** (Deploy) no canto superior direito
2. Selecione **"Nova implantação"** (New deployment)
3. Clique no ícone de **engrenagem** ⚙️ ao lado de "Select type"
4. Escolha **"Aplicativo da web"** (Web app)
5. Configure:
   - **Descrição**: "API para adicionar cursos"
   - **Executar como**: **"Eu"** (Me) - sua conta Google
   - **Quem tem acesso**: **"Qualquer pessoa"** (Anyone)
6. Clique em **"Implantar"** (Deploy)
7. **Autorize** o script (pode aparecer um aviso de segurança - clique em "Avançado" e "Acessar...")
8. **COPIE A URL** que aparece (será algo como):
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```

---

## 🔧 Passo 3: Configurar no Sistema

1. Abra o arquivo: `src/components/CourseSelector.jsx`
2. Na **linha 6**, cole a URL copiada:

```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/SUA_URL_AQUI/exec';
```

3. **Salve o arquivo**
4. **Recarregue** o sistema no navegador

---

## ✅ Passo 4: Testar

### Teste no Apps Script (Opcional):
1. Volte ao Apps Script
2. Selecione a função `testarAdicao` no dropdown
3. Clique em **Executar** (▶️)
4. Verifique se uma linha foi adicionada na planilha

### Teste no Sistema:
1. Acesse `/edit` no sistema
2. Clique em "Adicionar Curso"
3. Digite um código de teste (ex: `teste123`)
4. Clique em "Adicionar"
5. Aguarde a mensagem de sucesso
6. Verifique se a linha foi adicionada na planilha

---

## 🔍 Debug

Se algo não funcionar, verifique:

### No Apps Script:
- **Visualizar > Registros** (View > Logs) - mostra os logs do Logger.log()
- **Visualizar > Execuções** (View > Executions) - mostra tentativas de execução

### No Sistema:
- Abra o **Console** do navegador (F12)
- Procure por mensagens de erro
- Veja se o fetch está sendo executado

### Problemas Comuns:

❌ **"Script não autorizado"**
- Volte ao Apps Script e execute a função `testarAdicao` manualmente
- Autorize o acesso quando solicitado

❌ **"URL não configurada"**
- Verifique se colou a URL corretamente no `CourseSelector.jsx`
- Certifique-se que tem `/exec` no final da URL

❌ **"Dados não aparecem na planilha"**
- Verifique se o script está olhando para a aba correta
- Tente executar `testarAdicao()` manualmente

---

## 🔄 Atualizar o Script

Se precisar modificar o script:

1. Faça as alterações no código
2. Salve
3. Clique em **Implantar > Gerenciar implantações**
4. Clique no ícone de **lápis** ✏️
5. Em "Versão", selecione **"Nova versão"**
6. Clique em **Implantar**
7. A URL permanece a mesma!

---

## ⚠️ Limitações Conhecidas

- **`mode: 'no-cors'`**: Não conseguimos ler a resposta do servidor
  - Mas os dados **chegam e são salvos** corretamente
  - O sistema assume sucesso após o envio
  
- **Delay**: Pode levar alguns segundos para aparecer na planilha

- **Cache**: O sistema pode não mostrar o novo curso imediatamente
  - Recarregue a página após alguns segundos

---

## 🔒 Segurança

✅ **O script é executado na sua conta Google**
✅ **Apenas você pode modificar o script**
✅ **A URL é pública mas só faz o que você programou**
✅ **Não expõe dados sensíveis**

---

## 💡 Dicas

- Teste primeiro com um curso de teste (`teste123`)
- Mantenha uma cópia do script original
- Use os logs do Apps Script para debug
- O sistema tem fallback: se o Apps Script falhar, oferece download do CSV
