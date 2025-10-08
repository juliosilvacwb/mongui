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
- 📋 **Dual View Modes** - Switch between Grid and JSON pretty-print views
- 📄 **Server-Side Pagination** - Handle datasets up to 100K documents
- 📋 **Copy-to-Clipboard** - Click on cells and headers to copy values

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

# Create environment file
cp .env.example .env.local

# Edit .env.local with your MongoDB URI
# See "Environment Variables" section below
```

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
# MongoDB Connection URI (Required)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Or for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/

# Or for Docker:
# MONGODB_URI=mongodb://mongoadmin:secret@localhost:27017/?authSource=admin

# Read-Only Mode (Optional, default: false)
# Set to true to prevent all write operations
READ_ONLY=false
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

### 3. View Modes

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

### 5. MongoDB Shell

**Access the shell:**
- Click the **🖥️ Terminal icon** in the top-right corner

**Supported Commands:**

```javascript
// List databases
show dbs

// List collections
db.myDatabase.getCollectionNames()

// Find documents
db.myDatabase.myCollection.find({})
db.myDatabase.myCollection.findOne({"name": "John"})

// Insert
db.myDatabase.myCollection.insertOne({"name": "Alice", "age": 30})
db.myDatabase.myCollection.insertMany([{...}, {...}])

// Update
db.myDatabase.myCollection.updateOne([{"name": "Alice"}, {"$set": {"age": 31}}])

// Delete
db.myDatabase.myCollection.deleteOne({"name": "Alice"})

// Count
db.myDatabase.myCollection.countDocuments({})

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
| **Material UI** | 6.x | UI component library |
| **AG Grid Community** | 34.x | Advanced data grid |
| **MongoDB Driver** | Latest | Official Node.js driver |
| **TypeScript** | 5.x | Type safety |

### Dependencies

```json
{
  "next": "^15.0.0",
  "@mui/material": "^6.0.0",
  "@mui/icons-material": "^6.0.0",
  "@emotion/react": "^11.0.0",
  "@emotion/styled": "^11.0.0",
  "ag-grid-community": "^34.0.0",
  "ag-grid-react": "^34.0.0",
  "mongodb": "latest",
  "typescript": "^5.0.0"
}
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

### Planned Features
- [ ] User authentication (NextAuth.js)
- [ ] Multiple MongoDB connections
- [ ] Data export (CSV/JSON/Excel)
- [ ] Index management and visualization
- [ ] Visual Aggregation Pipeline Builder
- [ ] Persistent command history
- [ ] JSON editor with syntax highlighting (Monaco Editor)
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
