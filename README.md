# 🍃 Mongui - Interface Web MongoDB

Interface web moderna e interativa para gerenciar bancos de dados MongoDB.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🚀 Recursos

- ✅ **Visualização Hierárquica** - Navegue por databases e collections com interface intuitiva
- ✅ **CRUD Completo** - Crie, edite, visualize e delete documentos
- ✅ **Consultas Avançadas** - Execute queries MongoDB com filtros, ordenação e limite
- ✅ **MongoDB Shell** - Console interativo com suporte a comandos MongoDB
- ✅ **AG Grid Integration** - Visualização de dados com paginação até 100K documentos
- ✅ **Tema Claro/Escuro** - Alterne entre temas com persistência
- ✅ **Interface Responsiva** - Design adaptável e moderno com Material UI
- ✅ **Copy-to-Clipboard** - Copie campos e headers facilmente
- ✅ **Server-Side Pagination** - Performance otimizada para grandes datasets

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- Acesso a uma instância **MongoDB** (Atlas, local ou Docker)

### Passos

```bash
# 1. Clone o repositório (ou extraia os arquivos)
cd mongui

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie o arquivo .env.local na raiz do projeto
```

---

## ⚙️ Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Read-only mode (opcional)
READ_ONLY=false
```

**Substitua** `<usuario>`, `<senha>` e `<cluster>` pelos dados da sua conexão MongoDB.

> ⚠️ **Importante:** O arquivo `.env.local` está no `.gitignore` e não deve ser commitado.

---

## 🏃 Executar

```bash
# Modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

```bash
# Build para produção
npm run build
npm start
```

---

## 📖 Como Usar

### 1️⃣ Navegação por Databases e Collections

1. Ao abrir a aplicação, você verá os **databases** listados no menu lateral esquerdo
2. **Clique** em um database para expandir e ver suas **collections**
3. **Clique** em uma collection para visualizar seus documentos

### 2️⃣ Operações CRUD

#### ➕ Criar Documento
- Clique no botão **"Novo"**
- Digite o documento em formato **JSON**
- Clique em **"Salvar"**

**Exemplo:**
```json
{
  "nome": "João Silva",
  "idade": 30,
  "email": "joao@example.com"
}
```

**Inserir Múltiplos:**
```json
[
  {"nome": "Maria", "idade": 25},
  {"nome": "Pedro", "idade": 28}
]
```

#### ✏️ Editar Documento
- **Passe o mouse** sobre uma linha
- Clique no ícone de **edição** (lápis)
- Modifique o JSON
- Clique em **"Salvar"**

#### 🗑️ Deletar Documento
- **Passe o mouse** sobre uma linha
- Clique no ícone de **exclusão** (lixeira)
- **Confirme** a exclusão

#### 🔄 Atualizar Lista
- Clique no botão de **refresh** para recarregar os documentos

### 3️⃣ Consultas Avançadas

1. Clique em **"🔍 Consulta Avançada"** para expandir o painel
2. Digite o **filtro** em JSON
3. (Opcional) Configure a **ordenação**
4. Clique em **"Executar Query"**

**Exemplos de Filtros:**

```json
// Buscar por campo específico
{"nome": "João"}

// Operadores de comparação
{"idade": {"$gt": 25}}
{"idade": {"$gte": 18, "$lte": 65}}

// Regex (busca por padrão)
{"email": {"$regex": "@gmail.com$"}}

// In (múltiplos valores)
{"status": {"$in": ["ativo", "pendente"]}}

// And lógico
{"$and": [{"idade": {"$gte": 18}}, {"status": "ativo"}]}

// Campo existe
{"campo_opcional": {"$exists": true}}
```

**Ordenação:**
```json
{"idade": -1}           // Decrescente
{"nome": 1}             // Crescente
{"idade": -1, "nome": 1} // Múltiplos campos
```

> 💡 **Dica:** Clique no ícone **ℹ️** ao lado de "Consulta Avançada" para ver todos os operadores disponíveis

### 4️⃣ MongoDB Shell Interativo

1. Clique no ícone **🖥️ Terminal** no canto superior direito
2. Digite comandos MongoDB
3. Pressione **Enter** (ou **Ctrl+Enter**) para executar

**Comandos Básicos:**

```javascript
// Listar databases
show dbs

// Listar collections
db.seu_database.getCollectionNames()

// Buscar documentos
db.seu_database.sua_collection.find({})
db.seu_database.sua_collection.findOne({"nome": "João"})

// Inserir
db.seu_database.sua_collection.insertOne({"nome": "Maria", "idade": 25})

// Atualizar
db.seu_database.sua_collection.updateOne([
  {"nome": "João"},
  {"$set": {"idade": 31}}
])

// Deletar
db.seu_database.sua_collection.deleteOne({"nome": "João"})

// Contar
db.seu_database.sua_collection.countDocuments({})
```

**Atalhos do Shell:**
- **Enter** ou **Ctrl+Enter**: Executar comando
- **↑** (Seta para cima): Comando anterior
- **↓** (Seta para baixo): Próximo comando
- **Shift+Enter**: Nova linha (multiline)

> 📚 **Documentação Completa:** Veja `SHELL_EXAMPLES.md` para mais exemplos

### 5️⃣ Copy-to-Clipboard

- **Células:** Clique em qualquer célula da tabela para copiar o valor
- **Headers:** Clique no nome da coluna para copiar o nome do campo
- **Shell:** Hover no resultado e clique no ícone de copiar

### 6️⃣ Paginação

- Selecione o número de documentos por página: **25, 50, 100, 1K, 10K, 100K**
- Navegue entre páginas usando os controles inferiores
- O contador mostra: **"Exibindo X-Y de Z documentos"**

> ⚠️ **Nota:** Filtros e ordenação na tabela são **locais** (apenas nos dados visíveis). Para filtros **server-side**, use a **Consulta Avançada**.

### 7️⃣ Tema Claro/Escuro

- Clique no ícone **☀️/🌙** no canto superior direito
- A preferência é salva automaticamente no navegador

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js** | 15.x | Framework React com App Router |
| **Material UI** | 6.x | Biblioteca de componentes UI |
| **AG Grid Community** | 34.x | Grid de dados avançado |
| **MongoDB Driver** | Latest | Driver oficial Node.js para MongoDB |
| **TypeScript** | 5.x | Type safety e intellisense |

**Dependências Principais:**
```json
{
  "next": "^15.0.0",
  "@mui/material": "^6.0.0",
  "ag-grid-community": "^34.0.0",
  "ag-grid-react": "^34.0.0",
  "mongodb": "^latest",
  "typescript": "^5.0.0"
}
```

---

## 🔒 Segurança

### Modo Read-Only

Para ambientes não confiáveis, habilite o modo **somente leitura**:

```bash
# .env.local
READ_ONLY=true
```

Quando ativo:
- ❌ Operações de **criação** bloqueadas
- ❌ Operações de **edição** bloqueadas
- ❌ Operações de **exclusão** bloqueadas
- ✅ Operações de **leitura** permitidas

### Boas Práticas

1. ✅ **Nunca commite** o arquivo `.env.local`
2. ✅ Use **credenciais com permissões mínimas**
3. ✅ Configure **IP whitelist** no MongoDB Atlas
4. ✅ Use **conexões SSL/TLS** (incluídas no URI)
5. ✅ Revise **logs de auditoria** periodicamente
6. ⚠️ **Não exponha** esta aplicação publicamente sem autenticação

---

## 📁 Estrutura do Projeto

```
Mongui/
├── app/
│   ├── api/
│   │   ├── health/route.ts        # Health check
│   │   ├── databases/route.ts     # Listar databases
│   │   ├── collections/route.ts   # Listar collections
│   │   ├── documents/route.ts     # CRUD de documentos
│   │   ├── query/route.ts         # Queries avançadas
│   │   └── shell/route.ts         # Shell MongoDB
│   ├── [db]/[collection]/page.tsx # Rota dinâmica de collection
│   ├── shell/page.tsx             # Página do shell
│   ├── layout.tsx                 # Layout principal
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Estilos globais
│   └── ag-grid-custom.css         # Estilos AG Grid
├── components/
│   ├── ThemeRegistry.tsx          # Provider de tema
│   ├── AppBarTop.tsx              # Barra superior
│   ├── SideDrawer.tsx             # Menu lateral
│   ├── DocumentGrid.tsx           # Grid de documentos
│   ├── DocumentModal.tsx          # Modal de edição
│   ├── QueryPanel.tsx             # Painel de consultas
│   ├── QueryHelpModal.tsx         # Modal de ajuda
│   └── ShellConsole.tsx           # Console do shell
├── lib/
│   └── mongoClient.ts             # Cliente MongoDB singleton
├── types/
│   └── index.ts                   # TypeScript types
├── .env.local                     # Variáveis de ambiente (criar)
├── .gitignore                     # Arquivos ignorados pelo git
├── package.json                   # Dependências
├── tsconfig.json                  # Configuração TypeScript
├── README.md                      # Este arquivo
├── SHELL_EXAMPLES.md              # Exemplos de comandos do shell
└── especificacao-tecnica.md       # Documentação técnica completa
```

---

## 🐛 Troubleshooting

### Erro: "Por favor, adicione MONGODB_URI ao arquivo .env.local"
- ✅ Certifique-se de criar o arquivo `.env.local` na **raiz** do projeto
- ✅ Verifique se a variável está correta: `MONGODB_URI=mongodb+srv://...`
- ✅ Reinicie o servidor após criar o arquivo

### Erro: "Conexão com MongoDB recusada"
- ✅ Verifique se o **IP** está na whitelist do MongoDB Atlas
- ✅ Teste a conexão usando MongoDB Compass
- ✅ Verifique se as **credenciais** estão corretas

### Erro: "pageSize cannot exceed 100 in the MIT version"
- ✅ Esta aplicação usa **AG Grid Community** para suportar páginas grandes
- ✅ Se você ainda vê este erro, limpe o cache: `rm -rf .next && npm run dev`

### Tabela não carrega ou fica em branco
- ✅ Abra o **DevTools** (F12) e verifique o console
- ✅ Teste o endpoint diretamente: `http://localhost:3000/api/health`
- ✅ Verifique se há erros de serialização (campos com tipos não suportados)

### Shell não executa comandos
- ✅ Verifique se o comando está na **sintaxe correta**: `db.<database>.<collection>.<operation>()`
- ✅ Use **aspas duplas** para strings: `{"campo": "valor"}`
- ✅ Veja exemplos em `SHELL_EXAMPLES.md`

---

## 📝 Roadmap / Melhorias Futuras

- [ ] Autenticação de usuários
- [ ] Múltiplas conexões MongoDB simultâneas
- [ ] Export de dados (CSV/JSON/Excel)
- [ ] Visualização e gerenciamento de índices
- [ ] Aggregation Pipeline Builder visual
- [ ] Histórico de comandos persistente (localStorage)
- [ ] Syntax highlighting no editor JSON
- [ ] Modo offline com cache
- [ ] Temas customizáveis
- [ ] Suporte a MongoDB Realm/Atlas Search

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

**Julio Dev**  
Desenvolvido com ❤️ usando Next.js, Material UI e MongoDB

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React incrível
- [Material UI](https://mui.com/) - Componentes UI elegantes
- [AG Grid](https://www.ag-grid.com/) - Grid de dados poderoso
- [MongoDB](https://www.mongodb.com/) - Banco de dados NoSQL líder

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- 📧 Email: [seu-email@example.com]
- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/mongui/issues)
- 📖 Documentação: Veja `especificacao-tecnica.md` e `SHELL_EXAMPLES.md`

---

**Mongui** - Gerenciamento MongoDB simplificado e poderoso 🍃✨
