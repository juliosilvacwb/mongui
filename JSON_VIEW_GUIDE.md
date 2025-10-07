# 📋 Guia de Visualização JSON - Mongo UI

Este documento descreve como usar a visualização JSON Pretty no Mongo UI.

---

## 🎯 Visão Geral

O Mongo UI oferece **duas formas de visualizar dados**:

1. **📊 Tabela (Grid)** - Visualização tabelar com AG Grid
2. **📋 JSON** - Visualização formatada e colorida do JSON

---

## 🔄 Como Alternar

### Toggle Button
No canto superior direito da área de documentos, você encontrará dois botões:

```
┌─────────┬──────┐
│ 📊 Tabela │ 📋 JSON │
└─────────┴──────┘
```

**Clique** em qualquer botão para alternar entre as visualizações.

---

## 📊 Modo Tabela (Grid)

### Características:
- ✅ Visualização em formato de tabela
- ✅ Colunas geradas automaticamente
- ✅ Paginação (25 a 100K docs)
- ✅ Copy-to-clipboard (células e headers)
- ✅ Botões de ação hover (Edit/Delete)
- ✅ Scrolling horizontal/vertical
- ✅ Responsivo

### Quando usar:
- 📊 Visualizar múltiplos documentos
- 🔍 Comparar valores entre documentos
- ⚡ Performance com grandes datasets
- ✏️ Editar/deletar documentos rapidamente

---

## 📋 Modo JSON

### Características:
- ✅ JSON formatado (pretty-printed)
- ✅ Syntax highlighting colorido
- ✅ Indentação de 2 espaços
- ✅ Copy-to-clipboard (todo JSON)
- ✅ Scrolling suave
- ✅ Wrap automático de linhas longas
- ✅ Tema dark/light adaptativo

### Quando usar:
- 📋 Copiar estrutura completa dos documentos
- 🔍 Analisar estrutura JSON detalhadamente
- 💾 Export de dados
- 🐛 Debug de campos complexos
- 📚 Documentação de schema

---

## 🎨 Syntax Highlighting

### Cores Dark Mode:
```json
{
  "campo": "valor",      ← Keys: #4EC9B0 (cyan)
  "string": "texto",     ← Strings: #CE9178 (laranja)
  "numero": 123,         ← Numbers: #B5CEA8 (verde claro)
  "boolean": true,       ← Booleans: #569CD6 (azul)
  "nulo": null           ← Null: #569CD6 (azul)
}
```

### Cores Light Mode:
```json
{
  "campo": "valor",      ← Keys: #0451A5 (azul escuro)
  "string": "texto",     ← Strings: #A31515 (vermelho)
  "numero": 123,         ← Numbers: #098658 (verde)
  "boolean": true,       ← Booleans: #0000FF (azul)
  "nulo": null           ← Null: #0000FF (azul)
}
```

**Baseado no VS Code!** 💻

---

## 📋 Copy-to-Clipboard

### Botão Global
No canto superior direito do JSON view:

```
┌────────────────────────┐
│  📋 Copiar todo JSON   │ ← IconButton
└────────────────────────┘
```

**Funcionalidades:**
- ✅ Copia **todo o JSON** formatado
- ✅ Feedback visual (ícone muda para ✅)
- ✅ Auto-reset após 2 segundos
- ✅ Tooltip "Copiado!"

**Como usar:**
1. Clique no ícone de copiar
2. Ícone muda para ✅ (check)
3. JSON copiado para área de transferência
4. Cole onde quiser (Ctrl+V)

---

## 🎨 Formatação

### Indentação
```json
{
  "nivel1": {
    "nivel2": {
      "nivel3": "valor"
    }
  }
}
```
**2 espaços por nível** (padrão JSON.stringify)

### Quebra de Linha
```json
{
  "campo_com_valor_muito_longo": "Este texto longo será quebrado automaticamente sem perder a formatação e mantendo a legibilidade do JSON"
}
```
**Word wrap automático** ✅

---

## 📊 Comparação: Grid vs JSON

| Recurso | Grid 📊 | JSON 📋 |
|---------|---------|---------|
| **Visualização** | Tabular | Textual |
| **Edição Rápida** | ✅ Hover actions | ❌ Via modal |
| **Copy** | ✅ Células individuais | ✅ JSON completo |
| **Paginação** | ✅ Sim | ❌ Scroll infinito |
| **Performance** | ✅ Otimizada | 🟡 Adequada |
| **Export** | 🟡 Via copy cells | ✅ Via copy JSON |
| **Schema Analysis** | ❌ Difícil | ✅ Fácil |
| **Comparação** | ✅ Side-by-side | ❌ Sequencial |
| **Syntax Highlighting** | ❌ Não | ✅ Sim |

---

## 💡 Casos de Uso

### Use Grid quando:
```
✅ Editar/deletar múltiplos documentos
✅ Comparar valores entre documentos
✅ Navegar por grandes datasets (100K docs)
✅ Ordenar por colunas específicas
✅ Trabalho rápido e interativo
```

### Use JSON quando:
```
✅ Copiar estrutura completa
✅ Analisar schema dos documentos
✅ Export de dados para outras ferramentas
✅ Debug de campos nested/complexos
✅ Documentação de estrutura
✅ Compartilhar dados com outros
```

---

## 🔧 Atalhos e Dicas

### Atalhos
```
Alternar View: Click no toggle button
Copiar JSON:   Click no ícone de copiar
Scroll:        Mouse wheel ou scrollbar
```

### Dicas
- 💡 **JSON preserva ordem** dos campos do MongoDB
- 💡 **ObjectId** é serializado como string
- 💡 **Arrays e objetos nested** são formatados corretamente
- 💡 **Datas** aparecem no formato ISO 8601
- 💡 **Null** e **undefined** são tratados corretamente

---

## 🎨 Exemplo de Output

```json
[
  {
    "_id": "68e3b6c1c2448c011b1eb140",
    "data_coleta": "2025-01-01",
    "id_coleta": "1234567890",
    "id_usuario": "1234567890",
    "id_estabelecimento": "1234567890",
    "id_produto": "1234567890",
    "nested": {
      "campo1": "valor1",
      "campo2": 123,
      "campo3": true
    },
    "array": [
      "item1",
      "item2",
      "item3"
    ]
  },
  {
    "_id": "68e52d61f8c7ccb23b20c9fc",
    "data_coleta": "2025-10-07T08:00:00Z",
    "id_coleta": "12345",
    ...
  }
]
```

**Com syntax highlighting colorido!** 🌈

---

## 🚀 Workflow Recomendado

### 1. Exploração Inicial
```
1. Abra collection
2. Use Grid para visão geral
3. Alterne para JSON para ver estrutura
```

### 2. Análise de Schema
```
1. Alterne para JSON
2. Analise campos e tipos
3. Copie estrutura para documentação
```

### 3. Export de Dados
```
1. Execute query avançada
2. Alterne para JSON
3. Copie JSON completo
4. Cole em arquivo ou ferramenta
```

### 4. Debug
```
1. Alterne para JSON
2. Procure por campos específicos (Ctrl+F)
3. Analise valores nested
4. Copie para testes
```

---

## 🔍 Busca no JSON

Use o **Ctrl+F** do navegador para buscar no JSON:

```
Ctrl+F → Digite "id_coleta" → Enter
```

Funciona para:
- ✅ Nomes de campos
- ✅ Valores
- ✅ ObjectIds
- ✅ Qualquer texto no JSON

---

## 📱 Responsividade

O JSON View é **totalmente responsivo**:

- 📱 Mobile: Scroll vertical
- 💻 Desktop: Scroll vertical + horizontal (se necessário)
- 🖥️ Ultrawide: JSON centralizado com padding

---

## ♿ Accessibility

- ✅ **ARIA labels** nos botões de toggle
- ✅ **Keyboard navigation** funciona
- ✅ **Screen readers** podem ler o JSON
- ✅ **Focus styles** visíveis
- ✅ **Alto contraste** para leitura

---

## 🎯 Best Practices

### Para Copiar Dados:
```
1. Use Grid para copiar células específicas
2. Use JSON para copiar estrutura completa
3. Use Query Avançada para filtrar antes de copiar
```

### Para Performance:
```
1. Grid é melhor para 1K+ documentos
2. JSON é melhor para < 100 documentos
3. Use paginação para grandes datasets
```

### Para Análise:
```
1. JSON mostra estrutura completa
2. Grid mostra visão comparativa
3. Combine ambos para melhor entendimento
```

---

## 🚀 Exemplos Práticos

### Exemplo 1: Export para Postman
```
1. Execute query avançada
2. Alterne para JSON
3. Copie JSON
4. Cole no Postman body
```

### Exemplo 2: Documentar Schema
```
1. Busque 1 documento
2. Alterne para JSON
3. Copie estrutura
4. Use em documentação
```

### Exemplo 3: Debug de Campo
```
1. Alterne para JSON
2. Ctrl+F → procure campo
3. Analise valor
4. Copie para teste
```

---

## 🎨 Customização

O JSON View respeita o **tema global** (dark/light).

**Troque o tema:**
```
Click no ícone ☀️/🌙 no AppBar
→ JSON muda cores automaticamente!
```

---

## 📞 Feedback

Se encontrar problemas ou tiver sugestões:
- 📧 Email: feedback@your-domain.com
- 💬 Issues: GitHub Issues

---

**Mongo UI** - Visualize seus dados como quiser! 📊📋✨

