# 🍃 Mongui - MongoDB Web Interface

A modern, feature-rich web interface for managing MongoDB databases - inspired by MongoDB Compass.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Features

### Core Functionality
- 🗄️ **Database & Collection Management** - Create, view, and delete databases and collections
- 📊 **Document CRUD** - Full Create, Read, Update, Delete operations
- 🔍 **Advanced Queries** - Execute MongoDB queries with filters, sorting, and limits
- 💻 **Interactive Shell** - Built-in MongoDB shell with command history
- 🤖 **AI-Powered Assistant** - Generate MongoDB commands from natural language (OpenAI/Groq)
- 📋 **Dual View Modes** - Switch between Grid and JSON pretty-print views
- 📄 **Server-Side Pagination** - Handle datasets up to 100K documents
- 📋 **Copy-to-Clipboard** - Click on cells and headers to copy values
- 🛡️ **Schema Validation** - View and manage MongoDB schema validation rules
- 💾 **Index Management** - Create, view, and delete indexes with visual interface

### User Experience
- 🌓 **Dark/Light Theme** - Seamless theme switching with persistence
- 🌐 **Internationalization** - English (default) and Portuguese (Português) support
- 🎨 **Modern UI** - Material UI components with custom MongoDB styling
- ⚡ **High Performance** - AG Grid Community for blazing-fast data rendering
- 🔄 **Real-time Validation** - Instant feedback on database/collection names
- 🛡️ **Safe Deletion** - Type-to-confirm deletion for databases and collections

### Security
- 🔒 **Read-Only Mode** - Protect production data from accidental modifications
- 🛡️ **Error Boundaries** - Graceful error handling with recovery options
- 📊 **Logging System** - Comprehensive logging for debugging and auditing
- ✅ **Input Validation** - Client and server-side validation

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **MongoDB** instance (Atlas, local, or Docker)

### Installation

```bash
# Clone or download the repository
cd mongui

# Install dependencies
npm install

# Install AI dependencies (optional - for AI assistant)
npm install @langchain/openai @langchain/core langchain

# Create environment file
cp .env.example .env.local

# Edit .env.local with your MongoDB URI
# See "Environment Variables" section below
```

---

## 🤖 AI Assistant (Optional)

### Setup AI Assistant

The Mongui includes an optional **AI-powered assistant** that generates MongoDB commands from natural language prompts.

**Supported Providers:**
- **Groq** (Free, fast) - Recommended for development
- **OpenAI** (Paid, precise) - Recommended for production

### Quick Setup

**1. Get API Key:**
- **Groq (Free):** https://console.groq.com/keys
- **OpenAI (Paid):** https://platform.openai.com/api-keys

**2. Add to `.env.local`:**
```bash
# Groq (Free - Recommended)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OR OpenAI (Paid)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Customize AI behavior
AI_MODEL=gpt-4o-mini              # or llama-3.3-70b-versatile
AI_TEMPERATURE=0.1                # 0.0-1.0 (lower = more precise)
AI_MAX_TOKENS=2000
```

**3. Restart Server:**
```bash
npm run dev
```

### Using AI Assistant

**1. Open Shell Tab:**
- Navigate to any collection
- Click "Shell" tab

**2. Activate Assistant:**
- Click ✨ button in header
- OR press `Ctrl+Space`

**3. Generate Command:**
- Type: "find active users created in last 30 days"
- Click "Generate" or press `Ctrl+Enter`
- Get instant MongoDB command with explanation!

### Example Prompts

```
✅ "find users with age greater than 25"
✅ "count orders by status"
✅ "top 10 most expensive products"
✅ "users who haven't logged in for 90 days"
✅ "orders with customer information"
✅ "group sales by month"
```

### AI Features

- 🎯 **Context-Aware** - Understands your schema and indexes
- ⚡ **Smart Caching** - Instant responses for repeated prompts
- 💡 **Performance Tips** - Suggests optimizations and indexes
- ⚠️ **Safety Warnings** - Alerts for destructive commands
- 🔗 **Join Suggestions** - Automatically suggests $lookup when needed
- 📊 **Aggregation Pipelines** - Generates complex pipelines
- 🌐 **Multi-Language** - Works with prompts in Portuguese and English

**Note:** AI assistant is completely optional. All features work without it.

---

## 🔐 AI Privacy & Security

### What Data is Sent to AI Providers?

**⚠️ IMPORTANT:** Data is ONLY sent to AI providers (OpenAI/Groq) when you **explicitly request** AI assistance by clicking the ✨ button or pressing `Ctrl+Space`. If you don't use the AI assistant, **no data is ever sent** to external services.

When you request an AI suggestion, the following information is sent:

| Information Type | Example | Criticality | Sent to AI? |
|------------------|---------|-------------|-------------|
| **Your Prompt** | "find active users" | 🟢 Low | ✅ Yes (user input) |
| **Database Name** | `ecommerce` | 🟡 Medium | ✅ Yes (required for context) |
| **Collection Name** | `users` | 🟡 Medium | ✅ Yes (required for context) |
| **Schema Structure** | Field names and types | 🟡 Medium | ✅ Yes (helps AI understand data) |
| **Index Information** | Index names and fields | 🟡 Medium | ✅ Yes (for performance tips) |
| **Collection List** | Available collections | 🟡 Medium | ✅ Yes (for JOIN suggestions) |
| **Sample Documents** | 1 example document | 🔴 **HIGH** | ✅ Yes - **SANITIZED** |

### 🛡️ Security Implementation: Data Sanitization

To protect your sensitive data, **all sample documents are automatically sanitized** before being sent to AI providers. Real values are replaced with realistic fictional data.

#### Example of Data Sanitization:

**BEFORE Sanitization (Real Data - NEVER SENT):**
```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "João Silva",
  "email": "joao.silva@empresa.com.br",
  "cpf": "123.456.789-00",
  "phone": "+55 11 99999-8888",
  "password": "minhaSenha123",
  "salary": 15000.00,
  "address": "Rua Confidencial, 456",
  "token": "abc123xyz789",
  "ip": "201.45.123.98"
}
```

**AFTER Sanitization (Fictional Data - SAFE TO SEND):**
```json
{
  "_id": { "$oid": "507f1f77bcf86cd799439011" },
  "name": "Usuario Exemplo",
  "email": "usuario@example.com",
  "cpf": "123.456.789-00",
  "phone": "+55 11 98765-4321",
  "password": "***REDACTED***",
  "salary": 3.14,
  "address": "Rua Exemplo, 123",
  "token": "***REDACTED***",
  "ip": "192.168.1.1"
}
```

### 🔒 Automatic Field Detection

The sanitization system automatically detects and protects sensitive fields:

| Field Type | Detected Patterns | Replacement Value |
|------------|-------------------|-------------------|
| **Emails** | `email`, `@` pattern | `usuario@example.com` |
| **Passwords** | `password`, `senha`, `token`, `secret`, `key` | `***REDACTED***` |
| **Phones** | `phone`, `tel`, `celular` | `+55 11 98765-4321` |
| **CPF/CNPJ** | `cpf`, `cnpj`, `rg` | `123.456.789-00` |
| **Addresses** | `address`, `endereco`, `rua` | `Rua Exemplo, 123` |
| **Names** | `name`, `nome` | `Usuario Exemplo` |
| **IPs** | IP format pattern | `192.168.1.1` |
| **UUIDs** | UUID format | `550e8400-e29b-41d4-a716-446655440000` |
| **URLs** | `url`, `link`, `http` | `https://example.com/resource` |
| **Dates** | ISO date format | `2024-01-15T10:30:00.000Z` |
| **Numbers** | All numeric values | `42` (integers) or `3.14` (floats) |

### ✅ Security Guarantees

- ✅ **No data sent without your action** - AI is opt-in only
- ✅ **Automatic sanitization** - All sample documents are cleaned
- ✅ **Only 1 sample document** - Minimal data exposure
- ✅ **Recursive protection** - Nested objects are also sanitized
- ✅ **Pattern-based detection** - Smart field recognition
- ✅ **No credentials stored** - API keys only in `.env.local`
- ✅ **Local caching** - Repeated prompts don't resend data

### 🎯 What AI Providers See

AI providers (OpenAI/Groq) receive:
1. Your natural language prompt
2. Database and collection names
3. Schema structure (field names and types)
4. Index information
5. **ONE sanitized sample document with fictional values**

They **NEVER** receive:
- ❌ Real document content
- ❌ Passwords or tokens
- ❌ Personal information (emails, phones, addresses)
- ❌ Financial data
- ❌ Any sensitive field values

### 📊 Privacy Impact Assessment

| Concern | Risk Level | Mitigation |
|---------|------------|------------|
| Personal data exposure | 🔴 High | ✅ Automatic sanitization |
| Database structure disclosure | 🟡 Medium | ⚠️ Acceptable (needed for context) |
| Query pattern analysis | 🟢 Low | ✅ Cached queries reduce exposure |
| API key leakage | 🔴 High | ✅ Stored in `.env.local` (not committed) |

### 🔐 Best Practices

1. ✅ **Review prompts** - Don't include sensitive data in your prompts
2. ✅ **Use Groq for testing** - Free tier for development
3. ✅ **Monitor API usage** - Check your AI provider dashboard
4. ✅ **Keep API keys secure** - Never commit `.env.local`
5. ✅ **Disable AI if not needed** - Just don't configure API keys
6. ⚠️ **Be aware** - Even sanitized structure reveals your data model

### 📝 Implementation Details

The sanitization system is implemented in `lib/sanitizer.ts` and automatically applies to:
- `lib/aiHelper.ts` - When fetching context
- `app/api/ai/suggest-command/route.ts` - Before sending to AI

**No configuration needed** - sanitization is always active when using AI features.

---

## 🐳 MongoDB with Docker (For Testing)

### Option 1: Docker Run (Quick Start)

```bash
# Start MongoDB container
docker run -d \
  --name mongodb-test \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:latest

# MongoDB will be available at:
# mongodb://mongoadmin:secret@localhost:27017/
```

### Option 2: Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb-test
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: mongoadmin
      MONGO_INITDB_ROOT_PASSWORD: secret
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Start the container:

```bash
# Start MongoDB
docker-compose up -d

# Check logs
docker-compose logs -f mongodb

# Stop MongoDB
docker-compose down

# Stop and remove data
docker-compose down -v
```

### Connection URI for Docker

Add to `.env.local`:

```bash
MONGODB_URI=mongodb://mongoadmin:secret@localhost:27017/?authSource=admin
READ_ONLY=false
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```bash
# ============================================
# MongoDB Connection (Required)
# ============================================
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Or for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/

# Or for Docker:
# MONGODB_URI=mongodb://mongoadmin:secret@localhost:27017/?authSource=admin

# ============================================
# Read-Only Mode (Optional)
# ============================================
# Set to true to prevent all write operations
READ_ONLY=false

# ============================================
# AI Assistant (Optional)
# ============================================
# Choose ONE provider below (OpenAI has priority if both configured)

# Option 1: Groq (Free, Fast - Recommended for development)
# Get key at: https://console.groq.com/keys
# GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Option 2: OpenAI (Paid, Precise - Recommended for production)
# Get key at: https://platform.openai.com/api-keys
# OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx

# AI Configuration (Optional)
# AI_MODEL=gpt-4o-mini                 # or llama-3.1-70b-versatile
# AI_TEMPERATURE=0.1                   # 0.0-1.0 (lower = more precise)
# AI_MAX_TOKENS=2000                   # Maximum tokens in response
```

> ⚠️ **Important:** The `.env.local` file is already in `.gitignore` and should never be committed.

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Access: **http://localhost:3000**

### Production Build

```bash
npm run build
npm start
```

---

## 📖 Usage Guide

### 1. Database & Collection Navigation

**Create Database:**
1. Click **"Novo Database"** button in the sidebar
2. Enter database name (e.g., `ecommerce`)
3. Enter initial collection name (e.g., `products`)
4. Click **"Criar Database"**

**Create Collection:**
1. Expand a database
2. Click **"Nova Collection"**
3. Enter collection name
4. Click **"Criar Collection"**

**Delete Database/Collection:**
1. Hover over database or collection name
2. Click the **trash icon** 🗑️ that appears
3. **Type the exact name** to confirm deletion
4. Click **"Deletar"**

> ⚠️ Deletion is **IRREVERSIBLE**! Type-to-confirm prevents accidents.

### 2. Document Operations (CRUD)

**View Documents:**
- Click on a collection to view its documents

**Create Document:**
- Click **"Novo"** button
- Enter JSON (single object or array of objects)
- Click **"Salvar"**

**Edit Document:**
- Hover over a row
- Click the **edit icon** (pencil)
- Modify JSON
- Click **"Salvar"**

**Delete Document:**
- Hover over a row
- Click the **delete icon** (trash)
- Confirm deletion

### 3. Collection Tabs (MongoDB Compass-like)

When you open a collection, you'll see multiple tabs:

**📄 Documents Tab:**
- View, create, edit, and delete documents
- Grid or JSON view modes
- Advanced queries with filters and sorting
- Pagination up to 100K documents
- Click cells to copy values

**🛡️ Validation Tab:**
- View MongoDB schema validation rules
- Create validation with auto-generation from existing documents
- Edit validation rules with visual editor
- See required fields and constraints
- Copy schema for reuse

**💾 Indexes Tab:**
- List all indexes with properties (unique, sparse, TTL)
- Create new indexes (single or compound)
- Visual index builder with ordering options
- Delete indexes (protected _id index)
- Performance information

**💻 Shell Tab:**
- MongoDB shell with database context
- **AI Assistant** for command generation (✨)
- Command history with ↑/↓ navigation
- Syntax highlighting in output
- Copy commands and results

### 4. View Modes (Documents Tab)

**Toggle between views** using the buttons at the top:

**Grid View (Default):**
- Tabular display with AG Grid
- Pagination up to 100K documents
- Click cells to copy values
- Click headers to copy field names
- Hover actions for edit/delete

**JSON View:**
- Pretty-printed JSON with syntax highlighting
- Copy entire JSON with one click
- Ideal for schema analysis and data export

### 4. Advanced Queries

**Execute MongoDB Queries:**
1. Click **"🔍 Consulta Avançada"** to expand
2. Enter filter JSON: `{"age": {"$gt": 25}}`
3. (Optional) Enter sort JSON: `{"age": -1}`
4. Click **"Executar Query"**

**Available Operators:**
- Comparison: `$gt`, `$gte`, `$lt`, `$lte`, `$eq`, `$ne`
- Arrays: `$in`, `$nin`
- Logical: `$and`, `$or`, `$not`, `$nor`
- Strings: `$regex`, `$text`
- Other: `$exists`

Click the **ℹ️ icon** next to "Consulta Avançada" for examples and documentation.

> 💡 **Important:** Remember to use quotes for string values: `{"id": "123"}` not `{"id": 123}`

### 5. MongoDB Shell with AI Assistant

**Access the shell:**
- Navigate to any collection → Click **"Shell"** tab
- OR click the **🖥️ Terminal icon** in the top-right corner

**AI Assistant (✨):**
- Click ✨ button or press `Ctrl+Space` to activate
- Type natural language prompt: "find active users from last 30 days"
- Get MongoDB command with explanation + performance tips
- Copy or execute directly
- Works in Portuguese and English!

**Manual Commands (Supported):**

```javascript
// List databases
show dbs

// List collections  
db.getCollectionNames()

// Find documents
db.users.find({})
db.getCollection("users").find({status: "active"})
db.users.findOne({name: "John"})

// Aggregations
db.users.aggregate([
  {$group: {_id: "$status", total: {$sum: 1}}}
])

// Insert (Extended JSON support)
db.users.insertOne({
  name: "Alice", 
  age: 30,
  createdAt: {"$date": "2024-01-15T10:00:00Z"}
})

// Update
db.users.updateOne({name: "Alice"}, {$set: {age: 31}})

// Delete
db.users.deleteOne({name: "Alice"})

// Count
db.users.countDocuments({status: "active"})

// Distinct values
db.myDatabase.myCollection.distinct("field_name")
```

**Keyboard Shortcuts:**
- `Enter` or `Ctrl+Enter` - Execute command
- `↑` Arrow Up - Previous command
- `↓` Arrow Down - Next command
- `Shift+Enter` - New line (multiline)

---

## 🔒 Security

### Read-Only Mode

Enable read-only mode to prevent all write operations:

```bash
# .env.local
READ_ONLY=true
```

When enabled:
- ❌ Create, update, and delete operations are blocked
- ✅ Read operations are allowed
- ⚠️ HTTP 403 responses for blocked operations

### Best Practices

1. ✅ **Never commit** `.env.local` to version control
2. ✅ Use **minimal privileges** MongoDB credentials
3. ✅ Configure **IP whitelist** on MongoDB Atlas
4. ✅ Use **SSL/TLS** connections (included in connection URI)
5. ✅ Enable **READ_ONLY** mode for untrusted environments
6. ⚠️ **Do not expose** this application publicly without authentication

### MongoDB Naming Restrictions

**Databases:**
- Max 64 characters
- Only: `a-z`, `A-Z`, `0-9`, `_`, `-`
- Cannot be: `admin`, `local`, `config`
- Cannot contain: `/ \ . " * < > : | ? $` or spaces

**Collections:**
- Max 120 characters
- Cannot start with: `system.`
- Cannot contain: `$` or null character
- Recommended: `a-z`, `A-Z`, `0-9`, `_`, `-`

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x | React framework with App Router |
| **Material UI** | 7.x | UI component library |
| **AG Grid Community** | 34.x | Advanced data grid |
| **MongoDB Driver** | 6.x | Official Node.js driver |
| **LangChain** | Latest | AI integration (OpenAI/Groq) |
| **TypeScript** | 5.x | Type safety |

### Core Dependencies

```json
{
  "next": "^15.0.0",
  "@mui/material": "^7.0.0",
  "@mui/icons-material": "^7.0.0",
  "@emotion/react": "^11.0.0",
  "@emotion/styled": "^11.0.0",
  "ag-grid-community": "^34.0.0",
  "ag-grid-react": "^34.0.0",
  "mongodb": "latest",
  "typescript": "^5.0.0"
}
```

### AI Dependencies (Optional)

```json
{
  "@langchain/openai": "latest",
  "@langchain/core": "latest",
  "langchain": "latest"
}
```

**Install AI dependencies:**
```bash
npm install @langchain/openai @langchain/core langchain
```

---

## 📁 Project Structure

```
Mongui/
├── app/
│   ├── api/
│   │   ├── health/route.ts              # Health check endpoint
│   │   ├── databases/
│   │   │   ├── route.ts                 # List databases
│   │   │   ├── create/route.ts          # Create database
│   │   │   └── delete/route.ts          # Delete database
│   │   ├── collections/
│   │   │   ├── route.ts                 # List collections
│   │   │   ├── create/route.ts          # Create collection
│   │   │   └── delete/route.ts          # Delete collection
│   │   ├── documents/route.ts           # CRUD documents
│   │   ├── query/route.ts               # Advanced queries
│   │   └── shell/route.ts               # MongoDB shell
│   ├── [db]/[collection]/page.tsx       # Dynamic collection route
│   ├── shell/page.tsx                   # Shell page
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Home page
│   ├── globals.css                      # Global styles
│   ├── ag-grid-custom.css               # AG Grid theming
│   └── icon.svg                         # Favicon (🍃)
├── components/
│   ├── ThemeRegistry.tsx                # Theme provider
│   ├── AppBarTop.tsx                    # Top bar
│   ├── SideDrawer.tsx                   # Sidebar navigation
│   ├── DocumentGrid.tsx                 # Document grid/JSON viewer
│   ├── DocumentModal.tsx                # Document editor
│   ├── QueryPanel.tsx                   # Query builder
│   ├── QueryHelpModal.tsx               # Query help
│   ├── ShellConsole.tsx                 # Interactive shell
│   ├── JsonViewer.tsx                   # JSON viewer
│   ├── CreateDatabaseModal.tsx          # Create DB modal
│   ├── CreateCollectionModal.tsx        # Create collection modal
│   ├── DeleteDatabaseModal.tsx          # Delete DB modal
│   ├── DeleteCollectionModal.tsx        # Delete collection modal
│   └── ErrorBoundary.tsx                # Error handling
├── lib/
│   ├── mongoClient.ts                   # MongoDB singleton client
│   ├── env.ts                           # Environment validation
│   └── logger.ts                        # Logging system
├── types/
│   └── index.ts                         # TypeScript types
├── .env.local                           # Environment variables (create this)
├── .gitignore                           # Git ignore
├── package.json                         # Dependencies
└── README.md                            # This file
```

---

## 🎯 Key Features Explained

### Database & Collection Management

**Create Database:**
- Requires initial collection name (MongoDB creates DB when first collection is created)
- Validates names according to MongoDB restrictions
- Real-time validation feedback

**Delete Database/Collection:**
- Hover-only trash icons for clean UI
- **Type-to-confirm** deletion (prevents accidents)
- Cannot delete system databases (`admin`, `local`, `config`)
- Auto-redirects if you were viewing the deleted item

### Document Operations

**Grid View:**
- AG Grid Community for high performance
- Pagination: 25, 50, 100, 1K, 10K, 100K documents per page
- Hover-only edit/delete buttons on each row
- Click cells to copy values
- Click headers to copy field names
- Server-side pagination for large datasets

**JSON View:**
- Syntax-highlighted JSON (VS Code style colors)
- Pretty-printed with 2-space indentation
- Copy entire JSON with one click
- Dark/light theme adaptive colors
- Perfect for schema analysis and data export

### Advanced Queries

Execute MongoDB queries directly:

```json
// Filter examples
{"age": {"$gt": 25}}
{"status": "active"}
{"email": {"$regex": "@gmail.com$"}}
{"category": {"$in": ["tech", "science"]}}

// Sort examples
{"createdAt": -1}        // Descending
{"name": 1, "age": -1}   // Multiple fields
```

**Query Panel Features:**
- Collapsible panel to save space
- Filter and sort JSON inputs
- Validates JSON syntax
- Shows number of results
- Help modal with all operators
- Type safety alert (string vs number)

### Interactive MongoDB Shell

**Full shell simulator:**
- Command history with ↑/↓ navigation
- Auto-scroll to latest output
- Execution time display
- Timestamp for each command
- Copy commands and results
- Syntax highlighting (VS Code colors)

**Command syntax:**
```javascript
db.<database>.<collection>.<operation>(<args>)
```

**Supported operations:**
- `find`, `findOne` - Query documents
- `insertOne`, `insertMany` - Insert documents
- `updateOne`, `updateMany` - Update documents
- `deleteOne`, `deleteMany` - Delete documents
- `countDocuments` - Count documents
- `distinct` - Get unique values
- `getCollectionNames()` - List collections
- `show dbs` - List databases

### AI-Powered Command Generation

**What is it?**
- Natural language → MongoDB commands
- Powered by LangChain (OpenAI or Groq)
- Context-aware with schema and indexes knowledge

**How to use:**
1. Navigate to collection → Shell tab
2. Click ✨ button (or press `Ctrl+Space`)
3. Type what you want in plain language
4. Get MongoDB command + explanation

**Example:**
```
You type: "find active users created in last 7 days"

AI generates:
db.users.find({ 
  status: "active",
  createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
}).limit(50)

+ Explanation of what it does
+ Performance tips (use indexes)
+ Warnings (if destructive)
```

**Features:**
- 🧠 Understands your schema structure
- ⚡ Smart caching (instant for repeated prompts)
- 🎯 Detects operation type (find, aggregate, update, etc)
- 💡 Suggests optimizations and indexes
- ⚠️ Warns about destructive operations
- 🔗 Generates $lookup for joins automatically
- 🌐 Works in English and Portuguese

**Keyboard shortcuts:**
- `Ctrl+Space` - Toggle AI assistant
- `Ctrl+Enter` - Generate command

**Cost & Performance:**
- **Groq:** 100% FREE with 30 requests/min limit
- **OpenAI:** ~$0.0005 per command (gpt-4o-mini)
- Cache hit rate: ~40% (instant responses)
- Response time: 2-3s (first time), <50ms (cached)

### Schema Validation Management

**View Validation:**
- See if collection has schema validation
- View validation level (strict/moderate)
- View validation action (error/warn)
- See all validation rules in JSON format
- Visual summary of required fields and constraints

**Create/Edit Validation:**
- Auto-generate schema from existing documents
- Create manually with JSON Schema format
- Edit existing validation rules
- Visual editor with real-time validation
- Copy schema for reuse

**Example validation:**
```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["name", "email", "age"],
    "properties": {
      "name": { "bsonType": "string" },
      "email": { 
        "bsonType": "string",
        "pattern": "^.+@.+\\..+$"
      },
      "age": { 
        "bsonType": "int",
        "minimum": 18,
        "maximum": 120
      }
    }
  }
}
```

### Index Management

**View Indexes:**
- Table view with all indexes
- Shows fields and sort order (↑↓)
- Index properties (unique, sparse, TTL)
- Index type (standard, text, geospatial)

**Create Indexes:**
- Visual builder for index creation
- Support for compound indexes (multiple fields)
- Options: unique, sparse, background
- Custom index names
- Real-time validation

**Delete Indexes:**
- Material-UI confirmation dialog
- Protected _id index (cannot delete)
- Safe deletion with confirmation

---

## 🎨 Theme System

### Dark Mode (Default)
- Background: `#1C1C1C`
- Paper: `#2C2C2C`
- Primary: `#00ED64` (MongoDB Green)
- Syntax: VS Code dark theme colors

### Light Mode
- Background: `#F5F5F5`
- Paper: `#FFFFFF`
- Primary: `#00684A` (Dark Green)
- Syntax: VS Code light theme colors

**Toggle theme** by clicking the ☀️/🌙 icon in the top-right corner.

Theme preference is saved to `localStorage` and persists across sessions.

### Custom Scrollbar
- MongoDB green on hover
- Smooth transitions
- Dark/light mode adaptive

### Language Support

**Available Languages:**
- 🇺🇸 **English** (Default)
- 🇧🇷 **Português**

**How to change language:**
1. Click the **🌐 Language icon** in the top-right corner
2. Select your preferred language from the menu
3. The interface updates instantly
4. Language preference is saved to `localStorage`

**What's translated:**
- All UI labels and buttons
- Modal dialogs and confirmations
- Messages and notifications
- Error messages
- Help text and tooltips
- Query examples and documentation

---

## 🔍 Advanced Features

### Copy-to-Clipboard

**In Grid View:**
- Click any cell → Copy cell value
- Click any header → Copy field name
- Feedback snackbar confirms copy

**In JSON View:**
- Click copy button → Copy entire JSON
- ✅ icon feedback for 2 seconds

**In Shell:**
- Hover over output → Copy button appears
- Click command → Copy command text

### Pagination

**Server-Side Pagination:**
- Loads only requested page from MongoDB
- Shows accurate total count: "Showing 1-25 of 1,234 documents"
- Configurable page sizes
- Efficient for large datasets

**Custom Query Mode:**
- Switches to client-side pagination
- Shows all results from query
- Indicates query is active

### Query Help Modal

Click the **ℹ️ icon** next to "Consulta Avançada" to see:
- All MongoDB operators
- Practical examples
- Syntax guidelines
- Type safety warnings

---

## 🐛 Troubleshooting

### Error: "Please add MONGODB_URI to .env.local"

**Solution:**
1. Create `.env.local` file in project root
2. Add `MONGODB_URI=mongodb://...`
3. Restart the server

### Error: "Connection refused"

**Solution:**
1. Check if MongoDB is running
2. Verify IP whitelist (MongoDB Atlas)
3. Test connection with MongoDB Compass
4. Check credentials in `.env.local`

### Error: "Database/Collection already exists"

**Solution:**
- Use a different name, or
- Delete the existing database/collection first

### Theme not switching

**Solution:**
1. Clear browser cache
2. Check console for errors
3. Try hard reload: `Ctrl+Shift+R`

### Pagination shows wrong count

**Solution:**
- Server-side pagination is implemented
- If using Advanced Query, count reflects query results only
- Click "Limpar Filtro" to return to normal pagination

### Shell commands not working

**Solution:**
- Use exact syntax: `db.<database>.<collection>.<operation>(<args>)`
- Use double quotes for strings: `{"field": "value"}`
- Check examples in the shell help text
- Verify JSON is valid

### Cannot delete database "admin"

**Solution:**
- System databases (`admin`, `local`, `config`) are protected
- This is intentional for safety

---

## 📊 MongoDB Query Examples

### Comparison Operators

```javascript
// Greater than
{"age": {"$gt": 25}}

// Greater than or equal
{"price": {"$gte": 100}}

// Less than
{"quantity": {"$lt": 10}}

// Not equal
{"status": {"$ne": "inactive"}}

// In array
{"category": {"$in": ["electronics", "books"]}}
```

### Logical Operators

```javascript
// AND
{"$and": [{"age": {"$gte": 18}}, {"status": "active"}]}

// OR
{"$or": [{"role": "admin"}, {"role": "moderator"}]}

// NOT
{"age": {"$not": {"$lt": 18}}}
```

### Text and Regex

```javascript
// Regex (case-insensitive)
{"email": {"$regex": "@gmail.com$", "$options": "i"}}

// Starts with
{"name": {"$regex": "^John"}}

// Contains
{"description": {"$regex": "mongodb"}}
```

### Existence and Type

```javascript
// Field exists
{"optional_field": {"$exists": true}}

// Field does not exist
{"deleted_at": {"$exists": false}}
```

### Sorting

```javascript
// Descending
{"createdAt": -1}

// Ascending
{"name": 1}

// Multiple fields
{"priority": -1, "createdAt": -1}
```

---

## 🎮 Keyboard Shortcuts

### Shell Console
- `Enter` or `Ctrl+Enter` - Execute command
- `↑` - Previous command (history)
- `↓` - Next command (history)
- `Shift+Enter` - New line (multiline input)

### Modals
- `Enter` - Confirm/Save
- `Esc` - Cancel/Close

---

## 📈 Performance Tips

### For Large Datasets (10K+ documents)

1. **Use Grid View** - Optimized for large datasets
2. **Adjust page size** - Start with 25-100, increase if needed
3. **Use Advanced Queries** - Filter before loading
4. **Index your fields** - Create indexes in MongoDB for faster queries

### For Small Datasets (< 1K documents)

1. **Use JSON View** - Better for schema analysis
2. **Larger page sizes** - Load 1K-10K at once
3. **Local filtering** - Use browser search (Ctrl+F)

---

## 🔐 Production Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:***@cluster.mongodb.net/
READ_ONLY=false  # or true for read-only production
```

### Recommended Setup

1. **MongoDB Atlas** - Managed MongoDB hosting
2. **Vercel/Railway** - Deploy Next.js application
3. **Set Default Language** - Configure in `TranslationContext.tsx` (line 35)
4. **Enable READ_ONLY** - For public/untrusted access
5. **Configure IP Whitelist** - Atlas security
6. **Use SSL/TLS** - Always (included in `mongodb+srv://`)
7. **Monitor Logs** - Set up error tracking (Sentry, LogRocket)

### Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] MongoDB credentials are secure
- [ ] IP whitelist configured
- [ ] SSL/TLS enabled
- [ ] READ_ONLY mode configured (if applicable)
- [ ] Error monitoring set up
- [ ] Regular backups configured

---

## 🧪 Testing

### Test MongoDB Connection

```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"success":true,"message":"Conexão com MongoDB estabelecida com sucesso"}
```

### Test with Sample Data

```javascript
// In MongoDB Shell
db.test_db.test_collection.insertMany([
  {"name": "Alice", "age": 30, "city": "NYC"},
  {"name": "Bob", "age": 25, "city": "LA"},
  {"name": "Charlie", "age": 35, "city": "Chicago"}
])

// Then view in Mongui:
// Navigate to: test_db → test_collection
```

---

## 📦 Building from Source

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Type checking
npm run build

# Production build
npm run build
npm start

# Linting
npm run lint
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

---

## 🗺️ Roadmap

### Recently Added Features ✨
- [x] **AI Assistant** - Generate MongoDB commands from natural language (OpenAI/Groq)
- [x] **Schema Validation Management** - View, create, and edit validation rules
- [x] **Index Management** - Visual interface for creating and managing indexes
- [x] **Collection Tabs** - MongoDB Compass-like interface (Documents/Validation/Indexes/Shell)
- [x] **Extended JSON Support** - Support for dates, ObjectIds, and special types
- [x] **Material-UI Confirm Dialogs** - Elegant confirmation dialogs for destructive operations
- [x] **Relaxed JSON Parser** - Accept JSON without quotes on keys

### Planned Features
- [ ] User authentication (NextAuth.js)
- [ ] Multiple MongoDB connections
- [ ] Data export (CSV/JSON/Excel)
- [ ] Visual Aggregation Pipeline Builder
- [ ] Persistent command history
- [ ] JSON editor with syntax highlighting (Monaco Editor)
- [ ] AI command history and favorites
- [ ] Offline mode with caching
- [ ] Custom themes
- [ ] More languages (Spanish, French, German, Chinese)
- [ ] MongoDB Realm/Atlas Search support

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Julio Silva

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Amazing React framework
- [Material UI](https://mui.com/) - Beautiful UI components
- [AG Grid](https://www.ag-grid.com/) - Powerful data grid
- [MongoDB](https://www.mongodb.com/) - Leading NoSQL database

---

## 📞 Support

For questions, suggestions, or issues:
- 📧 Email: [julio.silva.cwb@gmail.com]
- 💬 Issues: [GitHub Issues](https://github.com/juliosilvacwb/mongui/issues)
- 📖 Documentation: See inline help and modals in the application

---

## 👨‍💻 Author

**Julio Silva**  
Developed with ❤️ using Next.js, Material UI, and MongoDB

---

## 🌟 Star This Project

If you find Mongui useful, please consider giving it a star on GitHub! ⭐

---

**🍃 Mongui** - Professional MongoDB management made simple ✨

**Version:** 1.0  
**Last Updated:** October 2025
