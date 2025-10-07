# 🧭 Mongui — Especificação Técnica Completa

**Base:** Next.js + Material UI + MongoDB
**Objetivo:** Criar uma interface web semelhante ao **MongoDB Compass**, com um simulador de shell e suporte a CRUD, consultas e navegação hierárquica entre databases e coleções.

---

## 🗂️ Estrutura do Documento

1. [Etapa 1 — Layout Geral](#etapa-1--layout-geral)
2. [Etapa 2 — Menu Lateral (Side Drawer)](#etapa-2--menu-lateral-side-drawer)
3. [Etapa 3 — Corpo Principal (Main Content)](#etapa-3--corpo-principal-main-content)
4. [Etapa 4 — API de Conexão com o MongoDB](#etapa-4--api-de-conexão-com-o-mongodb)
5. [Etapa 5 — CRUD de Documentos](#etapa-5--crud-de-documentos)
6. [Etapa 6 — Consultas Avançadas](#etapa-6--consultas-avançadas)
7. [Etapa 7 — Simulador de Shell MongoDB](#etapa-7--simulador-de-shell-mongodb)
8. [Etapa 8 — Tema e Estilo Visual](#etapa-8--tema-e-estilo-visual)
9. [Etapa 9 — Segurança e Boas Práticas](#etapa-9--segurança-e-boas-práticas)

---

## 🧩 Etapa 1 — Layout Geral

### Estrutura visual

```
---------------------------------------------
| AppBar (Topo)                             |
|-------------------------------------------|
| Sidebar (Esquerda) | Body Principal       |
|                    |                     |
---------------------------------------------
```

### Componentes principais

* **AppBar (topo):**

  * Título "Mongui"
  * Botão de atualizar
  * Botão de alternar tema (claro/escuro)
  * Indicador de conexão

* **Drawer (menu lateral fixo):**

  * Sempre visível (modo `permanent`)
  * Exibe databases e suas collections
  * Expandir/retrair bancos
  * Seleção visual da coleção ativa

* **Main Content (área principal):**

  * Exibe documentos da collection selecionada
  * Usa `DataGrid` do Material UI
  * Suporte a CRUD e consultas

### Estrutura de diretórios

```
app/
├── layout.tsx
├── page.tsx
├── [db]/[collection]/page.tsx
components/
├── AppBarTop.tsx
├── SideDrawer.tsx
├── MainContent.tsx
└── DocumentGrid.tsx
```

---

## 🧱 Etapa 2 — Menu Lateral (Side Drawer)

### Objetivo

Listar databases e collections de forma hierárquica e permitir navegação rápida.

### Componentes

* `Drawer` + `List` + `ListItemButton` (MUI)
* `Collapse` para expandir databases
* Ícones:

  * 📁 database
  * 📄 collection

### API utilizada

`GET /api/databases`
`GET /api/collections?db=<dbName>`

### Interação

* Clicar em um database → expande lista de coleções
* Clicar em uma collection → navega para `/[db]/[collection]`

---

## 📄 Etapa 3 — Corpo Principal (Main Content)

### Objetivo

Exibir documentos da collection selecionada em formato tabular.

### Componentes

* `DocumentGrid.tsx` com MUI `DataGrid`
* Barra de ações:

  * Criar documento
  * Atualizar lista
  * Deletar selecionado
  * Abrir shell

### API utilizada

* `GET /api/documents?db=x&collection=y`
* `POST /api/documents`
* `PUT /api/documents`
* `DELETE /api/documents`

---

## ⚙️ Etapa 4 — API de Conexão com o MongoDB

### Variável de ambiente

Arquivo `.env.local`

```bash
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster-url>/<default-db>?retryWrites=true&w=majority
```

### Conexão única (singleton)

`lib/mongoClient.ts`

```ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI não definida");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;
export default clientPromise;
```

---

## 🧰 Etapa 5 — CRUD de Documentos

### API endpoints

* **GET** `/api/documents` → Lista documentos
* **POST** `/api/documents` → Cria documento
* **PUT** `/api/documents` → Atualiza documento
* **DELETE** `/api/documents` → Remove documento

### Estrutura de resposta

```json
{
  "result": [
    { "_id": "66abc...", "name": "Julio", "age": 38 }
  ]
}
```

### Front-end

* Botões CRUD no topo do DataGrid
* Modal com editor JSON (`react-json-view`)

---

## 🔍 Etapa 6 — Consultas Avançadas

### Objetivo

Permitir executar consultas personalizadas via interface.

### Campos

* Filtro JSON: `{ "idade": { "$gt": 25 } }`
* Ordenação (sort)
* Limite (limit)

### API

`POST /api/query`

```json
{
  "db": "mydb",
  "collection": "users",
  "filter": { "idade": { "$gt": 25 } },
  "sort": { "idade": -1 },
  "limit": 20
}
```

---

## 💻 Etapa 7 — Simulador de Shell MongoDB

### Objetivo

Criar um console interativo que simula o shell do Mongo, aceitando comandos como:

```js
db.users.find({ active: true })
db.products.insertOne({ name: "Book" })
show dbs
```

### UI

* Componente: `ShellConsole.tsx`
* Caixa de texto multiline com execução (`Ctrl + Enter`)
* Output com JSON formatado
* Histórico de comandos
* Estilo terminal (fundo preto, texto verde)

### API

`POST /api/shell`

```json
{
  "command": "db.users.find({ \"active\": true })"
}
```

### Backend — pseudo parser

```ts
const regex = /^db\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\((.*)\)/;
const [, collectionName, operation, argsStr] = command.match(regex);
const args = argsStr ? eval("(" + argsStr + ")") : {};
```

> ⚠️ **Segurança:**
> Em ambiente controlado (POC), `eval()` é aceitável.
> Em produção, substitua por parser seguro com `JSON.parse` validado.

### Comandos suportados

* `show dbs` → lista databases
* `show collections` → lista collections
* `db.<collection>.find()`
* `db.<collection>.insertOne()`
* `db.<collection>.deleteOne()`
* `db.<collection>.updateOne()`

---

## 🎨 Etapa 8 — Tema e Estilo Visual

### Tema principal

```ts
createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00ED64" },
    background: { default: "#1C1C1C", paper: "#2C2C2C" },
  },
  typography: { fontFamily: "Roboto Mono, monospace" }
});
```

### Elementos de estilo

* AppBar: verde Mongo
* Drawer: fundo cinza-escuro
* DataGrid: linhas alternadas
* Shell: fundo preto, texto verde
* Uso consistente de espaçamentos e sombras MUI

---

## 🔐 Etapa 9 — Segurança e Boas Práticas

1. **Nunca expor credenciais no client-side**
2. **Usar variável de ambiente para URI**
3. **Limitar resultados (`limit(50)`)**
4. **Validar JSON recebido nas APIs**
5. **Utilizar SWR/React Query para cache**
6. **Adicionar logs apenas no backend**
7. **Modo read-only opcional via `.env`**

   ```bash
   READ_ONLY=true
   ```

---

## 🧱 Estrutura final do projeto

```
mongo-ui/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [db]/[collection]/page.tsx
│   └── api/
│       ├── databases/route.ts
│       ├── collections/route.ts
│       ├── documents/route.ts
│       ├── query/route.ts
│       └── shell/route.ts
├── components/
│   ├── AppBarTop.tsx
│   ├── SideDrawer.tsx
│   ├── DocumentGrid.tsx
│   ├── ShellConsole.tsx
│   └── ThemeProvider.tsx
├── lib/
│   └── mongoClient.ts
└── .env.local
```

---

## 🚀 Execução

```bash
npm install
npm run dev
```

A aplicação:

* Conecta-se automaticamente via `MONGODB_URI`
* Exibe databases/collections no menu lateral
* Permite visualizar e manipular documentos
* Inclui um **simulador de shell** MongoDB funcional

---

**Autor:** Julio Dev
**Versão:** 1.0 (POC Mongui Web)
**Stack:** Next.js • Material UI • MongoDB • TypeScript
