# 📋 Especificação Técnica - Mongo UI Web

**Projeto:** Interface Web para MongoDB (similar ao MongoDB Compass)  
**Stack:** Next.js 14+ (App Router) + Material UI + MongoDB + TypeScript  
**Abordagem:** Implementação sequencial e incremental

---

## 📑 Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Pré-requisitos e Setup Inicial](#2-pré-requisitos-e-setup-inicial)
3. [Fase 1: Infraestrutura Base](#fase-1-infraestrutura-base)
4. [Fase 2: Conexão com MongoDB](#fase-2-conexão-com-mongodb)
5. [Fase 3: Layout e Estrutura Visual](#fase-3-layout-e-estrutura-visual)
6. [Fase 4: Navegação por Databases e Collections](#fase-4-navegação-por-databases-e-collections)
7. [Fase 5: Visualização de Documentos](#fase-5-visualização-de-documentos)
8. [Fase 6: Operações CRUD](#fase-6-operações-crud)
9. [Fase 7: Consultas Avançadas](#fase-7-consultas-avançadas)
10. [Fase 8: Shell Simulator](#fase-8-shell-simulator)
11. [Fase 9: Tema e Estilização](#fase-9-tema-e-estilização)
12. [Fase 10: Polimento e Segurança](#fase-10-polimento-e-segurança)
13. [Checklist de Validação](#checklist-de-validação)

---

## 1. Visão Geral do Projeto

### 1.1 Objetivo

Criar uma interface web que permita:
- Visualizar databases e collections de um MongoDB
- Realizar operações CRUD em documentos
- Executar consultas personalizadas
- Simular o shell MongoDB via interface web
- Proporcionar experiência similar ao MongoDB Compass

### 1.2 Arquitetura

```
┌─────────────────────────────────────┐
│         Cliente (Browser)           │
│  Next.js + Material UI + React      │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│      Next.js API Routes             │
│  (Backend - Server Components)      │
└──────────────┬──────────────────────┘
               │ MongoDB Driver
┌──────────────▼──────────────────────┐
│         MongoDB Database            │
│     (Atlas ou Local/Docker)         │
└─────────────────────────────────────┘
```

### 1.3 Fluxo de Dados

1. **Listagem:** Cliente → API `/databases` → MongoDB → retorna lista de DBs
2. **Navegação:** Usuário clica em DB → API `/collections` → lista collections
3. **Visualização:** Usuário clica em collection → API `/documents` → exibe documentos
4. **CRUD:** Usuário executa ação → API específica → MongoDB → retorna resultado
5. **Shell:** Usuário digita comando → API `/shell` → parser + MongoDB → retorna output

---

## 2. Pré-requisitos e Setup Inicial

### 2.1 Requisitos do Sistema

- **Node.js:** 18.x ou superior
- **npm/yarn:** Gerenciador de pacotes
- **MongoDB:** Acesso a uma instância (Atlas, local ou Docker)
- **Editor:** VS Code (recomendado)

### 2.2 Instalação do Projeto Base

Este projeto já foi iniciado com Next.js. Verificar estrutura existente:

```bash
cd mongui
npm install
```

### 2.3 Dependências Necessárias

#### Instalar Material UI
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-data-grid
```

#### Instalar MongoDB Driver
```bash
npm install mongodb
```

#### Instalar bibliotecas auxiliares
```bash
npm install react-json-view-lite swr
npm install -D @types/node
```

### 2.4 Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```bash
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/?retryWrites=true&w=majority
READ_ONLY=false
```

> ⚠️ **Importante:** Adicionar `.env.local` ao `.gitignore`

---

## Fase 1: Infraestrutura Base ✅ CONCLUÍDA

### 🎯 Objetivo
Preparar a estrutura de pastas, configurar TypeScript e criar utilitários base.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 1
- ✅ Estrutura de diretórios criada (`app/api`, `components`, `lib`, `types`)
- ✅ Tipos TypeScript definidos em `types/index.ts`
- ✅ `.gitignore` já configurado para proteger `.env.local`
- ⚠️ **Ação Manual Necessária:** Criar arquivo `.env.local` com as credenciais do MongoDB

### ⚠️ Nota Importante - Configuração do .env.local
Antes de prosseguir para a Fase 2, você deve criar manualmente o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Read-only mode
READ_ONLY=false
```

Substitua `<usuario>`, `<senha>` e `<cluster>` pelos dados da sua conexão MongoDB.

---

### 📁 Passo 1.1: Estrutura de Diretórios ✅

Criar a seguinte estrutura dentro de `mongui/`:

```
mongui/
├── app/
│   ├── api/              # API Routes ✅ (criada)
│   ├── globals.css       # ✅ (já existe)
│   ├── layout.tsx        # ✅ (já existe - modificar nas próximas fases)
│   └── page.tsx          # ✅ (já existe - modificar nas próximas fases)
├── components/           # ✅ (pasta criada)
├── lib/                  # ✅ (pasta criada)
├── types/                # ✅ (pasta criada)
└── .env.local            # ⚠️ (usuário deve criar manualmente)
```

**Ações:**
```bash
cd mongui
mkdir -p app/api components lib types
```

**Status:** ✅ Concluído - Estrutura de diretórios criada com sucesso

### 📝 Passo 1.2: Definir Types TypeScript ✅

Criar `types/index.ts`:

```typescript
// Tipos para MongoDB
export interface MongoDatabase {
  name: string;
  sizeOnDisk?: number;
  empty?: boolean;
}

export interface MongoCollection {
  name: string;
  type: string;
}

export interface MongoDocument {
  [key: string]: any;
}

// Tipos para UI
export interface DatabaseListItem {
  name: string;
  expanded?: boolean;
  collections?: string[];
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Tipos para Shell
export interface ShellCommand {
  command: string;
  timestamp?: Date;
}

export interface ShellResult {
  output: any;
  error?: string;
  executionTime?: number;
}
```

**Validação:** ✅ Arquivo criado e sem erros de sintaxe TypeScript.

**Status:** ✅ Concluído - Todos os tipos TypeScript definidos em `types/index.ts`

---

## Fase 2: Conexão com MongoDB ✅ CONCLUÍDA

### 🎯 Objetivo
Estabelecer conexão singleton com MongoDB e criar cliente reutilizável.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 2
- ✅ Cliente MongoDB singleton criado em `lib/mongoClient.ts`
- ✅ Função auxiliar `getDatabase()` implementada
- ✅ API de health check criada em `app/api/health/route.ts`
- ✅ Pattern singleton para reutilizar conexão em desenvolvimento
- ✅ Tratamento de erros implementado

---

### 📝 Passo 2.1: Criar Cliente MongoDB ✅

Criar `lib/mongoClient.ts`:

```typescript
import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Por favor, adicione MONGODB_URI ao arquivo .env.local");
}

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Singleton pattern para reutilizar conexão
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // Em desenvolvimento, usar variável global para evitar múltiplas conexões
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Em produção, criar nova instância
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Função auxiliar para obter um database específico
export async function getDatabase(dbName: string): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
```

**Status:** ✅ Concluído - Cliente MongoDB com singleton pattern implementado

### 📝 Passo 2.2: Criar API de Teste de Conexão ✅

Criar `app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    
    return NextResponse.json({
      success: true,
      message: "Conexão com MongoDB estabelecida com sucesso",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

**Status:** ✅ Concluído - API de health check implementada com tratamento de erros

### ✅ Passo 2.3: Validar Conexão ✅

**Testar:**
```bash
npm run dev
# Acessar: http://localhost:3000/api/health
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Conexão com MongoDB estabelecida com sucesso"
}
```

**Status:** ✅ Código implementado e pronto para teste

### 📝 Notas de Implementação da Fase 2

#### Arquivos Criados:
1. **`lib/mongoClient.ts`** (43 linhas)
   - Implementa singleton pattern para conexão MongoDB
   - Previne múltiplas conexões em desenvolvimento
   - Exporta `clientPromise` e função auxiliar `getDatabase()`
   - Validação de variável de ambiente `MONGODB_URI`

2. **`app/api/health/route.ts`** (20 linhas)
   - Endpoint GET para verificar status da conexão
   - Executa comando `ping` no admin database
   - Retorna JSON com status de sucesso ou erro
   - Tratamento de erros com código HTTP 500

#### Como Testar:
```bash
# 1. Iniciar servidor de desenvolvimento
npm run dev

# 2. Testar endpoint (no navegador ou curl)
curl http://localhost:3000/api/health

# Ou acessar diretamente no navegador:
# http://localhost:3000/api/health
```

#### Possíveis Erros e Soluções:
- **Erro:** "Por favor, adicione MONGODB_URI ao arquivo .env.local"
  - **Solução:** Criar arquivo `.env.local` com a URI do MongoDB

- **Erro:** Conexão recusada
  - **Solução:** Verificar se o MongoDB está acessível (IP whitelist no Atlas)

- **Erro:** Autenticação falhou
  - **Solução:** Verificar credenciais no `.env.local`

---

## Fase 3: Layout e Estrutura Visual ✅ CONCLUÍDA

### 🎯 Objetivo
Implementar layout base com AppBar, Drawer e área de conteúdo principal.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 3
- ✅ ThemeRegistry com Material UI Theme Provider criado
- ✅ AppBarTop com status de conexão e controles
- ✅ SideDrawer lateral permanente para navegação
- ✅ Layout principal atualizado com ThemeRegistry
- ✅ Página inicial com estrutura de layout
- ✅ Tema escuro MongoDB (verde #00ED64)

---

### 📝 Passo 3.1: Configurar Material UI Theme Provider ✅

Criar `components/ThemeRegistry.tsx`:

```typescript
"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode, useState, useMemo } from "react";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#00ED64" : "#00684A",
      },
      background: {
        default: mode === "dark" ? "#1C1C1C" : "#F5F5F5",
        paper: mode === "dark" ? "#2C2C2C" : "#FFFFFF",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h6: {
        fontWeight: 600,
      },
    },
  });

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
```

**Status:** ✅ Concluído - ThemeRegistry com tema MongoDB (verde #00ED64 no dark mode)

### 📝 Passo 3.2: Criar AppBar Superior ✅

Criar `components/AppBarTop.tsx`:

```typescript
"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Box, Chip } from "@mui/material";

interface AppBarTopProps {
  onRefresh?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  connectionStatus?: "connected" | "disconnected" | "connecting";
}

export default function AppBarTop({
  onRefresh,
  onToggleTheme,
  isDarkMode = true,
  connectionStatus = "connected",
}: AppBarTopProps) {
  const statusColors = {
    connected: "success",
    disconnected: "error",
    connecting: "warning",
  } as const;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          🍃 Mongo UI
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={connectionStatus}
            color={statusColors[connectionStatus]}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />

          <IconButton color="inherit" onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>

          <IconButton color="inherit" onClick={onToggleTheme}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
```

**Status:** ✅ Concluído - AppBar com título, chip de status e botões de controle

### 📝 Passo 3.3: Criar Drawer Lateral (estrutura inicial) ✅

Criar `components/SideDrawer.tsx`:

```typescript
"use client";

import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const DRAWER_WIDTH = 280;

export default function SideDrawer() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando databases...
        </Typography>
      </Box>
    </Drawer>
  );
}
```

**Status:** ✅ Concluído - Drawer lateral permanente de 280px criado

### 📝 Passo 3.4: Atualizar Layout Principal ✅

Modificar `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Mongo UI - MongoDB Web Interface",
  description: "Interface web para gerenciar MongoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
```

**Status:** ✅ Concluído - Layout atualizado com ThemeRegistry e metadata

### 📝 Passo 3.5: Atualizar Página Principal ✅

Modificar `app/page.tsx`:

```typescript
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>
          Bem-vindo ao Mongo UI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecione um database e collection no menu lateral para começar.
        </Typography>
      </Box>
    </Box>
  );
}
```

**Status:** ✅ Concluído - Página principal com layout completo

### ✅ Passo 3.6: Validar Layout ✅

**Testar:**
```bash
npm run dev
```

**Verificar:**
- [x] AppBar no topo com título "Mongo UI"
- [x] Drawer lateral fixo (vazio por enquanto)
- [x] Área principal com mensagem de boas-vindas
- [x] Tema escuro aplicado

**Status:** ✅ Layout funcionando - Servidor rodando em http://localhost:3001

### 📝 Notas de Implementação da Fase 3

#### Arquivos Criados:
1. **`components/ThemeRegistry.tsx`** (31 linhas)
   - Provider de tema Material UI
   - Tema escuro MongoDB (#00ED64)
   - CssBaseline para normalização de estilos
   - State para gerenciar modo light/dark

2. **`components/AppBarTop.tsx`** (57 linhas)
   - Barra superior fixa com z-index acima do drawer
   - Título "🍃 Mongo UI"
   - Chip de status de conexão (connected/disconnected/connecting)
   - Botões: Refresh, Toggle Theme
   - Props tipadas com TypeScript

3. **`components/SideDrawer.tsx`** (32 linhas)
   - Drawer lateral permanente (280px)
   - Posicionamento abaixo do AppBar (Toolbar spacing)
   - Mensagem de carregamento temporária
   - Overflow auto para scroll

#### Arquivos Modificados:
1. **`app/layout.tsx`**
   - Removidas fontes Geist (não utilizadas)
   - ThemeRegistry envolvendo children
   - Metadata atualizada (título e descrição)
   - Lang alterado para pt-BR

2. **`app/page.tsx`**
   - Removido conteúdo template do Next.js
   - Estrutura com Box flex layout
   - AppBarTop, SideDrawer e área main
   - Mensagem de boas-vindas

#### Estrutura Visual Implementada:
```
┌─────────────────────────────────────────┐
│  AppBar (Fixed, z-index top)            │ ← AppBarTop
├─────────┬───────────────────────────────┤
│         │                               │
│ Drawer  │     Main Content Area         │ ← SideDrawer + Main
│ (280px) │     (Flex grow)               │
│         │                               │
│         │                               │
└─────────┴───────────────────────────────┘
```

#### Temas Implementados:
- **Dark Mode (padrão):**
  - Primary: #00ED64 (verde MongoDB)
  - Background: #1C1C1C
  - Paper: #2C2C2C

- **Light Mode:**
  - Primary: #00684A
  - Background: #F5F5F5
  - Paper: #FFFFFF

---

## Fase 4: Navegação por Databases e Collections ✅ CONCLUÍDA

### 🎯 Objetivo
Implementar listagem de databases e collections com navegação hierárquica.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 4
- ✅ API para listar databases criada (`/api/databases`)
- ✅ API para listar collections criada (`/api/collections`)
- ✅ SideDrawer com navegação interativa implementado
- ✅ Expand/collapse de databases funcionando
- ✅ Seleção de collections com highlight visual
- ✅ Filtro de databases do sistema (admin, local, config)
- ✅ Loading state com CircularProgress

---

### 📝 Passo 4.1: Criar API para Listar Databases ✅

Criar `app/api/databases/route.ts`:

```typescript
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET() {
  try {
    const client = await clientPromise;
    const adminDb = client.db("admin");
    
    const result = await adminDb.admin().listDatabases();
    
    const databases = result.databases
      .filter((db) => !["admin", "local", "config"].includes(db.name))
      .map((db) => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk,
        empty: db.empty,
      }));

    return NextResponse.json({
      success: true,
      data: databases,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

**Status:** ✅ Concluído - API retorna lista de databases excluindo admin, local e config

### 📝 Passo 4.2: Criar API para Listar Collections ✅

Criar `app/api/collections/route.ts`:

```typescript
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");

    if (!dbName) {
      return NextResponse.json(
        { success: false, error: "Database name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    const collections = await db.listCollections().toArray();
    
    const collectionNames = collections.map((col) => ({
      name: col.name,
      type: col.type,
    }));

    return NextResponse.json({
      success: true,
      data: collectionNames,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

**Status:** ✅ Concluído - API retorna collections com query parameter ?db=nome

### 📝 Passo 4.3: Implementar Drawer com Navegação ✅

Atualizar `components/SideDrawer.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import StorageIcon from "@mui/icons-material/Storage";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import Typography from "@mui/material/Typography";

const DRAWER_WIDTH = 280;

interface Database {
  name: string;
  collections?: string[];
  expanded?: boolean;
}

export default function SideDrawer() {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await fetch("/api/databases");
      const result = await response.json();
      
      if (result.success) {
        setDatabases(result.data.map((db: any) => ({ 
          name: db.name, 
          expanded: false 
        })));
      }
    } catch (error) {
      console.error("Erro ao buscar databases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseClick = async (dbName: string) => {
    const db = databases.find((d) => d.name === dbName);
    
    if (db?.expanded) {
      // Fechar
      setDatabases((prev) =>
        prev.map((d) => (d.name === dbName ? { ...d, expanded: false } : d))
      );
    } else {
      // Abrir e carregar collections
      try {
        const response = await fetch(`/api/collections?db=${dbName}`);
        const result = await response.json();
        
        if (result.success) {
          setDatabases((prev) =>
            prev.map((d) =>
              d.name === dbName
                ? { 
                    ...d, 
                    expanded: true, 
                    collections: result.data.map((c: any) => c.name) 
                  }
                : d
            )
          );
        }
      } catch (error) {
        console.error("Erro ao buscar collections:", error);
      }
    }
  };

  const handleCollectionClick = (dbName: string, collectionName: string) => {
    setSelectedCollection(`${dbName}/${collectionName}`);
    // TODO: Navegar para a página de documentos
    console.log(`Navegando para: ${dbName}/${collectionName}`);
  };

  if (loading) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {databases.map((db) => (
            <div key={db.name}>
              <ListItemButton onClick={() => handleDatabaseClick(db.name)}>
                <ListItemIcon>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText primary={db.name} />
                {db.expanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={db.expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {db.collections?.map((collection) => (
                    <ListItemButton
                      key={collection}
                      sx={{ pl: 4 }}
                      selected={selectedCollection === `${db.name}/${collection}`}
                      onClick={() => handleCollectionClick(db.name, collection)}
                    >
                      <ListItemIcon>
                        <DescriptionIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={collection} 
                        primaryTypographyProps={{ fontSize: "0.875rem" }}
                      />
                    </ListItemButton>
                  )) || (
                    <ListItemButton sx={{ pl: 4 }} disabled>
                      <ListItemText 
                        primary="Sem collections" 
                        primaryTypographyProps={{ fontSize: "0.875rem", fontStyle: "italic" }}
                      />
                    </ListItemButton>
                  )}
                </List>
              </Collapse>
            </div>
          ))}

          {databases.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum database encontrado
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Drawer>
  );
}
```

**Status:** ✅ Concluído - SideDrawer com navegação completa, expand/collapse e seleção

### ✅ Passo 4.4: Validar Navegação ✅

**Testar:**
```bash
npm run dev
```

**Verificar:**
- [x] Drawer lista databases conectados
- [x] Clicar em database expande e lista collections
- [x] Clicar em collection destaca item (log no console)
- [x] Ícones aparecem corretamente

**Status:** ✅ Navegação funcionando - Servidor em http://localhost:3001

### 📝 Notas de Implementação da Fase 4

#### Arquivos Criados:
1. **`app/api/databases/route.ts`** (32 linhas)
   - Endpoint GET `/api/databases`
   - Lista databases via `adminDb.admin().listDatabases()`
   - Filtra databases do sistema (admin, local, config)
   - Retorna name, sizeOnDisk, empty
   - Tratamento de erros com status 500

2. **`app/api/collections/route.ts`** (36 linhas)
   - Endpoint GET `/api/collections?db=nome`
   - Valida parâmetro obrigatório `db`
   - Lista collections via `db.listCollections()`
   - Retorna name e type
   - Tratamento de erros com status 400/500

#### Arquivos Modificados:
1. **`components/SideDrawer.tsx`** (180 linhas - reescrito)
   - State management com useState para databases
   - useEffect para carregar databases na montagem
   - Função `fetchDatabases()` - busca lista inicial
   - Função `handleDatabaseClick()` - expand/collapse com lazy loading
   - Função `handleCollectionClick()` - seleciona e loga (TODO: navegação)
   - Loading state com CircularProgress
   - Componentes Material UI: List, ListItemButton, Collapse
   - Ícones: StorageIcon (DB), DescriptionIcon (Collection)
   - Selected state visual em collections

#### Funcionalidades Implementadas:
- **Listagem hierárquica:** Databases → Collections
- **Lazy loading:** Collections carregadas apenas quando database expandido
- **Expand/collapse:** Ícones ExpandMore/ExpandLess
- **Visual feedback:** Collection selecionada highlighted
- **Empty states:** Mensagens quando não há databases/collections
- **Error handling:** Try/catch com logs no console

#### Fluxo de Navegação:
```
1. Componente monta → useEffect → fetchDatabases()
2. Usuário clica em database → handleDatabaseClick()
   → Se fechado: fetch collections → atualiza state com expanded: true
   → Se aberto: atualiza state com expanded: false
3. Usuário clica em collection → handleCollectionClick()
   → Atualiza selectedCollection
   → Log no console (preparado para navegação na Fase 5)
```

---

## Fase 5: Visualização de Documentos ✅ CONCLUÍDA

### 🎯 Objetivo
Criar rota dinâmica para visualizar documentos de uma collection específica.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 5
- ✅ API para listar documentos criada (`/api/documents`)
- ✅ Componente DocumentGrid com Material UI DataGrid
- ✅ Rota dinâmica `/[db]/[collection]` implementada
- ✅ Navegação do SideDrawer para página de documentos
- ✅ Geração dinâmica de colunas baseada nos documentos
- ✅ Paginação configurada (10, 25, 50, 100)
- ✅ Conversão de ObjectId para string

---

### 📝 Passo 5.1: Criar API para Listar Documentos ✅

Criar `app/api/documents/route.ts`:

```typescript
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");
    const limitParam = searchParams.get("limit") || "50";

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database and collection are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const limit = parseInt(limitParam, 10);
    const documents = await collection.find({}).limit(limit).toArray();

    // Converter ObjectId para string para serialização JSON
    const serializedDocs = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedDocs,
      count: serializedDocs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

**Status:** ✅ Concluído - API retorna documentos com limite padrão de 50

### 📝 Passo 5.2: Criar Componente DocumentGrid ✅

Criar `components/DocumentGrid.tsx`:

```typescript
"use client";

import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Box, Paper, Typography } from "@mui/material";
import { useState, useEffect } from "react";

interface DocumentGridProps {
  dbName: string;
  collectionName: string;
}

export default function DocumentGrid({ dbName, collectionName }: DocumentGridProps) {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [dbName, collectionName]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/documents?db=${dbName}&collection=${collectionName}`
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        // Gerar colunas dinamicamente baseado nas chaves do primeiro documento
        const firstDoc = result.data[0];
        const generatedColumns: GridColDef[] = Object.keys(firstDoc).map((key) => ({
          field: key,
          headerName: key,
          width: key === "_id" ? 220 : 150,
          flex: key === "_id" ? 0 : 1,
        }));

        setColumns(generatedColumns);

        // Preparar dados para o grid (usar _id como id)
        const gridRows = result.data.map((doc: any) => ({
          ...doc,
          id: doc._id,
        }));

        setRows(gridRows);
      } else {
        setColumns([]);
        setRows([]);
      }
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6">
          {dbName} → {collectionName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rows.length} documento(s)
        </Typography>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
          },
        }}
      />
    </Paper>
  );
}
```

**Status:** ✅ Concluído - DataGrid com colunas dinâmicas e paginação

### 📝 Passo 5.3: Criar Rota Dinâmica ✅

Criar `app/[db]/[collection]/page.tsx`:

```typescript
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import DocumentGrid from "@/components/DocumentGrid";

export default function CollectionPage({
  params,
}: {
  params: { db: string; collection: string };
}) {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <DocumentGrid dbName={params.db} collectionName={params.collection} />
      </Box>
    </Box>
  );
}
```

**Status:** ✅ Concluído - Rota dinâmica com parâmetros db e collection

### 📝 Passo 5.4: Adicionar Navegação ao SideDrawer ✅

Atualizar `components/SideDrawer.tsx` - modificar a função `handleCollectionClick`:

```typescript
const handleCollectionClick = (dbName: string, collectionName: string) => {
  setSelectedCollection(`${dbName}/${collectionName}`);
  // Navegar para a rota dinâmica
  window.location.href = `/${dbName}/${collectionName}`;
};
```

**Status:** ✅ Concluído - Navegação funcionando com window.location.href

### ✅ Passo 5.5: Validar Visualização ✅

**Testar:**
```bash
npm run dev
```

**Verificar:**
- [x] Clicar em collection navega para URL `/:db/:collection`
- [x] DataGrid exibe documentos da collection
- [x] Colunas são geradas automaticamente
- [x] Paginação funciona
- [x] Contagem de documentos aparece

**Status:** ✅ Visualização funcionando - Servidor em http://localhost:3001

### 📝 Notas de Implementação da Fase 5

#### Arquivos Criados:
1. **`app/api/documents/route.ts`** (43 linhas)
   - Endpoint GET `/api/documents?db=nome&collection=nome`
   - Valida parâmetros obrigatórios db e collection
   - Limite padrão de 50 documentos (configurável)
   - Conversão de ObjectId para string para JSON
   - Retorna data, count e success

2. **`components/DocumentGrid.tsx`** (84 linhas)
   - Componente client com Material UI DataGrid
   - Props: dbName e collectionName
   - useEffect para carregar documentos
   - Geração dinâmica de colunas baseada no primeiro doc
   - Larguras personalizadas (_id: 220px, outros: flex)
   - Paginação: 10, 25, 50, 100 (padrão: 25)
   - Loading state integrado
   - Header com breadcrumb e contagem

3. **`app/[db]/[collection]/page.tsx`** (24 linhas)
   - Rota dinâmica com params
   - Layout completo (AppBar + SideDrawer + Main)
   - Integração do DocumentGrid
   - TypeScript com tipagem de params

#### Arquivos Modificados:
1. **`components/SideDrawer.tsx`**
   - handleCollectionClick agora navega com window.location.href
   - Removido console.log, substituído por navegação real

#### Funcionalidades Implementadas:
- **Roteamento dinâmico:** URL pattern `/:db/:collection`
- **Visualização de dados:** DataGrid responsivo e paginado
- **Colunas automáticas:** Baseadas nas chaves dos documentos
- **Navegação integrada:** Click no drawer → navega para página
- **Performance:** Limite de documentos configurável

#### Fluxo de Visualização:
```
1. Usuário clica em collection no SideDrawer
2. handleCollectionClick() → window.location.href = "/:db/:collection"
3. Next.js carrega CollectionPage com params
4. DocumentGrid monta → useEffect → fetchDocuments()
5. API retorna documentos → gera colunas → exibe no DataGrid
6. Usuário pode paginar, ordenar, etc.
```

---

## Fase 6: Operações CRUD ✅ CONCLUÍDA

### 🎯 Objetivo
Implementar criação, edição e exclusão de documentos.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 6
- ✅ API expandida com métodos POST, PUT, DELETE
- ✅ Componente DocumentModal para edição JSON
- ✅ Barra de ações no DocumentGrid (Novo, Editar, Excluir, Refresh)
- ✅ Integração completa CRUD
- ✅ Feedback visual com Snackbar
- ✅ Validação de JSON no modal
- ✅ Confirmação de exclusão

---

### 📝 Passo 6.1: Expandir API de Documentos (POST, PUT, DELETE) ✅

Atualizar `app/api/documents/route.ts` - adicionar ao final:

```typescript
// POST - Criar novo documento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { db: dbName, collection: collectionName, document } = body;

    if (!dbName || !collectionName || !document) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.insertOne(document);

    return NextResponse.json({
      success: true,
      data: { insertedId: result.insertedId.toString() },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar documento
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { db: dbName, collection: collectionName, id, document } = body;

    if (!dbName || !collectionName || !id || !document) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { ObjectId } = require("mongodb");
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Remover _id do documento de atualização se presente
    const { _id, ...updateDoc } = document;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    return NextResponse.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover documento
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");
    const id = searchParams.get("id");

    if (!dbName || !collectionName || !id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { ObjectId } = require("mongodb");
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

### 📝 Passo 6.2: Criar Modal de Documento

Criar `components/DocumentModal.tsx`:

```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";

interface DocumentModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function DocumentModal({
  open,
  mode,
  initialData,
  onClose,
  onSave,
}: DocumentModalProps) {
  const [jsonText, setJsonText] = useState(
    initialData ? JSON.stringify(initialData, null, 2) : "{}"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      onSave(parsed);
      onClose();
    } catch (err: any) {
      setError("JSON inválido: " + err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Novo Documento" : "Editar Documento"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            variant="outlined"
            error={!!error}
            helperText={error}
            sx={{
              fontFamily: "monospace",
              "& textarea": {
                fontFamily: "Roboto Mono, monospace",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 📝 Passo 6.3: Adicionar Barra de Ações ao DocumentGrid

Atualizar `components/DocumentGrid.tsx` - adicionar imports e estados:

```typescript
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, IconButton, Snackbar, Alert } from "@mui/material";
import DocumentModal from "./DocumentModal";

// Adicionar ao componente:
const [selectedRow, setSelectedRow] = useState<any>(null);
const [modalOpen, setModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<"create" | "edit">("create");
const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
  open: false,
  message: "",
  severity: "success",
});

// Funções de manipulação:
const handleCreate = () => {
  setModalMode("create");
  setSelectedRow(null);
  setModalOpen(true);
};

const handleEdit = () => {
  if (!selectedRow) {
    setSnackbar({ open: true, message: "Selecione um documento", severity: "error" });
    return;
  }
  setModalMode("edit");
  setModalOpen(true);
};

const handleDelete = async () => {
  if (!selectedRow) {
    setSnackbar({ open: true, message: "Selecione um documento", severity: "error" });
    return;
  }

  if (!confirm("Deseja realmente excluir este documento?")) return;

  try {
    const response = await fetch(
      `/api/documents?db=${dbName}&collection=${collectionName}&id=${selectedRow._id}`,
      { method: "DELETE" }
    );
    const result = await response.json();

    if (result.success) {
      setSnackbar({ open: true, message: "Documento excluído", severity: "success" });
      fetchDocuments();
      setSelectedRow(null);
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
  }
};

const handleSave = async (data: any) => {
  try {
    if (modalMode === "create") {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: dbName,
          collection: collectionName,
          document: data,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: "Documento criado", severity: "success" });
        fetchDocuments();
      }
    } else {
      const response = await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: dbName,
          collection: collectionName,
          id: selectedRow._id,
          document: data,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: "Documento atualizado", severity: "success" });
        fetchDocuments();
      }
    }
  } catch (error: any) {
    setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
  }
};
```

Adicionar barra de ações antes do Box que contém título:

```typescript
return (
  <>
    <Paper sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6">
            {dbName} → {collectionName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {rows.length} documento(s)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleCreate}>
            Novo
          </Button>
          <IconButton size="small" onClick={handleEdit} disabled={!selectedRow}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={handleDelete} disabled={!selectedRow} color="error">
            <DeleteIcon />
          </IconButton>
          <IconButton size="small" onClick={fetchDocuments}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        onRowSelectionModelChange={(newSelection) => {
          const selectedId = newSelection[0];
          const selected = rows.find((row) => row.id === selectedId);
          setSelectedRow(selected || null);
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
          },
        }}
      />
    </Paper>

    <DocumentModal
      open={modalOpen}
      mode={modalMode}
      initialData={selectedRow}
      onClose={() => setModalOpen(false)}
      onSave={handleSave}
    />

    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
    >
      <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
    </Snackbar>
  </>
);
```

### ✅ Passo 6.4: Validar CRUD ✅

**Testar:**
- [x] Criar novo documento via botão "Novo"
- [x] Selecionar linha e clicar em editar
- [x] Modificar campos e salvar
- [x] Excluir documento selecionado
- [x] Atualizar lista com botão refresh

**Status:** ✅ CRUD completo funcionando - Servidor em http://localhost:3001

### 📝 Notas de Implementação da Fase 6

#### Arquivos Modificados:
1. **`app/api/documents/route.ts`** (156 linhas - expandido)
   - **POST:** Cria documento com `insertOne()`
   - **PUT:** Atualiza com `updateOne()` e `$set`
   - **DELETE:** Remove com `deleteOne()` usando ObjectId
   - Import do ObjectId do mongodb
   - Validação de campos obrigatórios em todas as rotas
   - Remoção automática do `_id` no update

2. **`components/DocumentModal.tsx`** (85 linhas - novo)
   - Dialog fullWidth com maxWidth="md"
   - TextField multiline (15 rows) para edição JSON
   - Validação JSON com try/catch
   - Mensagens de erro inline
   - Fonte monoespaçada (Roboto Mono)
   - useEffect para resetar dados quando modal abre
   - Props: open, mode, initialData, onClose, onSave

3. **`components/DocumentGrid.tsx`** (232 linhas - reescrito)
   - **Estados adicionados:**
     - selectedRow: documento selecionado
     - modalOpen: controle do modal
     - modalMode: "create" ou "edit"
     - snackbar: feedback visual
   - **Handlers:**
     - handleCreate(): abre modal em modo criação
     - handleEdit(): valida seleção e abre modal
     - handleDelete(): confirma e deleta documento
     - handleSave(): POST ou PUT baseado no mode
   - **Barra de ações:**
     - Botão "Novo" (contained, verde)
     - IconButton Editar (disabled se não selecionado)
     - IconButton Excluir (color="error", disabled)
     - IconButton Refresh
   - **Seleção de linha:**
     - onRowSelectionModelChange configurado
     - Array.isArray() para compatibilidade de tipos
     - selectedRow atualizado automaticamente

#### Funcionalidades Implementadas:
- **Criar documento:**
  - Click "Novo" → Modal vazio → Digite JSON → Salvar
  - Validação JSON antes de enviar
  - Feedback "Documento criado"

- **Editar documento:**
  - Selecione linha → Click editar → Modal com dados
  - Modificar JSON → Salvar
  - Feedback "Documento atualizado"

- **Excluir documento:**
  - Selecione linha → Click excluir → Confirmar
  - Documento removido do MongoDB
  - Grid atualizado automaticamente
  - Feedback "Documento excluído"

- **Refresh:**
  - Click refresh → Recarrega documentos
  - Mantém seleção de collection

#### Fluxo CRUD Completo:
```
CREATE:
1. Click "Novo" → setModalOpen(true), mode="create"
2. Modal abre com JSON vazio {}
3. Usuário digita JSON
4. Click Salvar → handleSave()
5. POST /api/documents
6. insertOne() no MongoDB
7. Snackbar de sucesso
8. fetchDocuments() recarrega grid

UPDATE:
1. Seleciona linha → setSelectedRow()
2. Click Editar → setModalOpen(true), mode="edit"
3. Modal abre com JSON do documento
4. Usuário modifica JSON
5. Click Salvar → handleSave()
6. PUT /api/documents com id
7. updateOne() com $set
8. Snackbar de sucesso
9. fetchDocuments() recarrega grid

DELETE:
1. Seleciona linha → setSelectedRow()
2. Click Excluir → confirm()
3. Se confirmado → handleDelete()
4. DELETE /api/documents?id=...
5. deleteOne() no MongoDB
6. Snackbar de sucesso
7. fetchDocuments() recarrega grid
8. setSelectedRow(null)
```

#### Validações Implementadas:
- ✅ JSON válido no modal (parse)
- ✅ Documento selecionado para editar/excluir
- ✅ Confirmação antes de excluir
- ✅ Parâmetros obrigatórios nas APIs
- ✅ Tratamento de erros com try/catch
- ✅ Feedback visual em todas operações

#### UX/UI:
- Botões desabilitados quando apropriado
- Cores semanticas (error para excluir)
- Snackbar auto-fecha em 3 segundos
- Modal responsivo e acessível
- Editor JSON com fonte monoespaçada

---

## Fase 7: Consultas Avançadas ✅ CONCLUÍDA

### 🎯 Objetivo
Permitir executar consultas personalizadas com filtros, ordenação e limite.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 7
- ✅ API de query POST criada (`/api/query`)
- ✅ QueryPanel com campos de filtro, ordenação e limite
- ✅ Painel colapsável/expansível
- ✅ Integração com DocumentGrid
- ✅ Validação JSON nos campos
- ✅ Atualização dinâmica do grid com resultados
- ✅ Limite padrão de 50 documentos

---

### 📝 Passo 7.1: Criar API de Query ✅

Criar `app/api/query/route.ts`:

```typescript
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { db: dbName, collection: collectionName, filter, sort, limit } = body;

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database and collection are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let query = collection.find(filter || {});

    if (sort) {
      query = query.sort(sort);
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    } else {
      query = query.limit(50); // Default
    }

    const documents = await query.toArray();

    const serializedDocs = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedDocs,
      count: serializedDocs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

**Status:** ✅ Concluído - API aceita filter, sort e limit em JSON

### 📝 Passo 7.2: Criar Componente QueryPanel ✅

Criar `components/QueryPanel.tsx`:

```typescript
"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Collapse,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface QueryPanelProps {
  dbName: string;
  collectionName: string;
  onQueryResult: (results: any[]) => void;
}

export default function QueryPanel({
  dbName,
  collectionName,
  onQueryResult,
}: QueryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("{}");
  const [sort, setSort] = useState("{}");
  const [limit, setLimit] = useState("50");
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    try {
      const parsedFilter = JSON.parse(filter);
      const parsedSort = JSON.parse(sort);

      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: dbName,
          collection: collectionName,
          filter: parsedFilter,
          sort: parsedSort,
          limit: parseInt(limit, 10),
        }),
      });

      const result = await response.json();

      if (result.success) {
        onQueryResult(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError("Erro ao executar query: " + err.message);
    }
  };

  return (
    <Paper sx={{ mb: 2 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle1">🔍 Consulta Avançada</Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Filtro (JSON)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder='{ "idade": { "$gt": 25 } }'
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ordenação (JSON)"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                placeholder='{ "idade": -1 }'
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Limite"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                type="number"
                size="small"
              />
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleQuery}
            >
              Executar Query
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
```

**Status:** ✅ Concluído - Painel colapsável com Grid layout responsivo

### 📝 Passo 7.3: Integrar QueryPanel ao DocumentGrid ✅

Atualizar `components/DocumentGrid.tsx` - adicionar import e função:

```typescript
import QueryPanel from "./QueryPanel";

// Adicionar função:
const handleQueryResult = (results: any[]) => {
  const gridRows = results.map((doc: any) => ({
    ...doc,
    id: doc._id,
  }));
  setRows(gridRows);

  // Atualizar colunas se necessário
  if (results.length > 0) {
    const firstDoc = results[0];
    const generatedColumns: GridColDef[] = Object.keys(firstDoc).map((key) => ({
      field: key,
      headerName: key,
      width: key === "_id" ? 220 : 150,
      flex: key === "_id" ? 0 : 1,
    }));
    setColumns(generatedColumns);
  }
};

// Adicionar QueryPanel antes do Paper:
return (
  <>
    <QueryPanel
      dbName={dbName}
      collectionName={collectionName}
      onQueryResult={handleQueryResult}
    />
    <Paper sx={{ height: "calc(100vh - 250px)", width: "100%" }}>
      {/* resto do código */}
    </Paper>
  </>
);
```

### ✅ Passo 7.4: Validar Consultas ✅

**Testar:**
- [x] Expandir painel de consulta
- [x] Filtrar por campo: `{ "idade": { "$gt": 25 } }`
- [x] Ordenar: `{ "idade": -1 }`
- [x] Limitar resultados
- [x] Ver resultados atualizados no grid

**Status:** ✅ Consultas funcionando - Servidor em http://localhost:3001

### 📝 Notas de Implementação da Fase 7

#### Arquivos Criados:
1. **`app/api/query/route.ts`** (51 linhas)
   - Endpoint POST `/api/query`
   - Aceita: db, collection, filter, sort, limit
   - Validação de parâmetros obrigatórios
   - Query builder com encadeamento MongoDB
   - Limite padrão de 50 documentos
   - Serialização de ObjectId

2. **`components/QueryPanel.tsx`** (137 linhas)
   - Painel colapsável com ícone expand/collapse
   - Grid responsivo (6/3/3 colunas)
   - Campos:
     - Filtro: TextField multiline (3 rows)
     - Ordenação: TextField single line
     - Limite: TextField type="number"
   - Validação JSON com try/catch
   - Botão "Executar Query" com ícone de busca
   - Mensagens de erro inline

#### Arquivos Modificados:
1. **`components/DocumentGrid.tsx`** (adicionadas ~90 linhas)
   - Import do QueryPanel
   - Função `handleQueryResult()`
   - Atualiza rows e columns dinamicamente
   - Adiciona coluna de ações aos resultados
   - Altura ajustada para 250px (espaço para query panel)
   - QueryPanel renderizado acima do Paper

#### Funcionalidades Implementadas:
- **Filtros MongoDB:**
  - Operadores: $gt, $lt, $gte, $lte, $eq, $ne
  - Operadores lógicos: $and, $or, $not
  - Arrays: $in, $nin
  - Regex: $regex
  - Exemplo: `{ "idade": { "$gt": 25 } }`

- **Ordenação:**
  - Ascendente: `{ "nome": 1 }`
  - Descendente: `{ "idade": -1 }`
  - Múltiplos campos: `{ "idade": -1, "nome": 1 }`

- **Limite:**
  - Configurável via campo numérico
  - Padrão: 50 documentos

#### Fluxo de Consulta:
```
1. Usuário expande QueryPanel (click no header)
2. Digite filtro JSON: { "status": "ativo" }
3. Digite ordenação: { "data": -1 }
4. Configure limite: 100
5. Click "Executar Query"
6. handleQuery() → parse JSON → POST /api/query
7. API executa find().sort().limit()
8. Retorna resultados serializados
9. handleQueryResult() atualiza grid
10. Colunas regeneradas se necessário
```

#### Exemplos de Queries:
```javascript
// Filtrar por idade maior que 25
{ "idade": { "$gt": 25 } }

// Filtrar por status E idade
{ "$and": [{ "status": "ativo" }, { "idade": { "$gte": 18 } }] }

// Buscar por nome (regex case-insensitive)
{ "nome": { "$regex": "João", "$options": "i" } }

// Filtrar por categoria em array
{ "categorias": { "$in": ["tecnologia", "ciência"] } }

// Ordenar por data decrescente
{ "data": -1 }

// Ordenar por múltiplos campos
{ "prioridade": -1, "nome": 1 }
```

#### UX/UI:
- Painel discreto (collapsed por padrão)
- Click no header para expandir
- Layout responsivo (Grid 12 colunas)
- Campos com placeholders explicativos
- Erro inline quando JSON inválido
- Botão verde de executar

---

## Fase 8: Shell Simulator ✅ CONCLUÍDA

### 🎯 Objetivo
Criar console interativo para executar comandos MongoDB.

**Status:** ✅ Concluído em 07/10/2025

### 📋 Resumo da Fase 8
- ✅ API Shell com parser de comandos MongoDB criada (`/api/shell`)
- ✅ Suporte a comandos: `show dbs`, `db.<db>.<col>.find()`, `insertOne`, `updateOne`, `deleteOne`, etc.
- ✅ Componente ShellConsole interativo com histórico
- ✅ Output formatado com cores (VS Code style)
- ✅ Navegação de histórico com ↑↓
- ✅ Atalhos: Enter e Ctrl+Enter para executar
- ✅ Botão de limpar histórico
- ✅ Copy-to-clipboard em comandos e resultados
- ✅ Rota `/shell` criada e integrada
- ✅ Link de terminal no AppBar
- ✅ Auto-scroll no output
- ✅ Timestamp e tempo de execução em cada comando

---

### 📝 Notas de Implementação da Fase 8

#### Arquivos Criados:
1. **`app/api/shell/route.ts`** (238 linhas)
   - Parser de comandos MongoDB
   - Suporte a: show dbs, use <db>, db.<db>.<col>.<op>()
   - Operações: find, findOne, insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany, countDocuments, distinct
   - Tratamento de ObjectId
   - Formatação de bytes (KB, MB, GB)
   - Serialização automática de documentos
   - Mensagens de erro detalhadas
   - Medição de tempo de execução

2. **`components/ShellConsole.tsx`** (285 linhas)
   - Console interativo estilo VS Code
   - Histórico de comandos navegável (↑↓)
   - Atalhos: Enter, Ctrl+Enter, Shift+Enter
   - Auto-scroll para último output
   - Copy-to-clipboard em comandos e resultados
   - Formatação JSON colorida
   - Loading state durante execução
   - Timestamp em cada comando
   - Botão limpar histórico
   - Tema claro/escuro adaptativo
   - Suporte multiline no input

3. **`app/shell/page.tsx`** (25 linhas)
   - Rota `/shell` integrada ao layout
   - AppBarTop + SideDrawer + ShellConsole
   - Integração com ThemeRegistry

4. **`SHELL_EXAMPLES.md`** (documentação completa)
   - 19 exemplos de comandos
   - Tabela de operações suportadas
   - Dicas e atalhos
   - Observações de segurança

#### Arquivos Modificados:
1. **`components/AppBarTop.tsx`** (adicionadas ~50 linhas)
   - Link "Home" (só aparece fora da home)
   - Link "Terminal" com ícone (disabled quando já no shell)
   - Tooltips informativos
   - usePathname para detectar página atual
   - Título clicável que retorna à home

#### Funcionalidades Implementadas:

**Parser de Comandos:**
- ✅ `show dbs` - Lista databases com tamanho
- ✅ `use <database>` - Seleciona database (validação)
- ✅ `db.<db>.getCollectionNames()` - Lista collections
- ✅ `db.<db>.<col>.find({})` - Busca documentos (limite 50)
- ✅ `db.<db>.<col>.findOne({})` - Busca um documento
- ✅ `db.<db>.<col>.insertOne({...})` - Insere documento
- ✅ `db.<db>.<col>.insertMany([...])` - Insere múltiplos
- ✅ `db.<db>.<col>.updateOne([{}, {...}])` - Atualiza um
- ✅ `db.<db>.<col>.updateMany([{}, {...}])` - Atualiza múltiplos
- ✅ `db.<db>.<col>.deleteOne({})` - Deleta um
- ✅ `db.<db>.<col>.deleteMany({})` - Deleta múltiplos
- ✅ `db.<db>.<col>.countDocuments({})` - Conta documentos
- ✅ `db.<db>.<col>.distinct("field")` - Valores únicos

**UX/UI:**
- Console dark/light adaptativo
- Syntax highlighting (cores VS Code)
- Histórico persistente durante sessão
- Navegação com setas (↑↓)
- Auto-complete histórico
- Loading spinner
- Tempo de execução exibido
- Timestamp de cada comando
- Copy-to-clipboard hover
- Scroll automático
- Multiline support

**Segurança:**
- Limite de 50 docs no find()
- Parse seguro de JSON (não usa eval diretamente)
- Validação de sintaxe
- Mensagens de erro claras
- Filtro de databases do sistema

#### Fluxo de Execução:
```
1. Usuário digita comando no input
2. Pressiona Enter (ou Ctrl+Enter)
3. ShellConsole → POST /api/shell { command }
4. API → executeCommand(command)
   → Parser identifica tipo de comando
   → Executa operação MongoDB
   → Serializa resultado
   → Retorna JSON + executionTime
5. ShellConsole recebe resultado
   → Adiciona ao history
   → Renderiza output colorido
   → Auto-scroll para fim
   → Limpa input
6. Usuário pode copiar, navegar histórico, etc.
```

#### Exemplos de Comandos Funcionais:
```javascript
// Listar databases
show dbs

// Listar collections
db.ccee.getCollectionNames()

// Buscar documentos
db.ccee.coletas.find({"id_coleta": "12345"})

// Inserir
db.ccee.coletas.insertOne({"id_coleta": "99999", "status": "novo"})

// Atualizar
db.ccee.coletas.updateOne([{"id_coleta": "99999"}, {"$set": {"status": "processado"}}])

// Deletar
db.ccee.coletas.deleteOne({"id_coleta": "99999"})

// Contar
db.ccee.coletas.countDocuments({"id_estabelecimento": "est001"})
```

---

### 📝 Passo 8.1: Criar API Shell ✅

Criar `app/api/shell/route.ts`:

```typescript
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command } = body;

    if (!command) {
      return NextResponse.json(
        { success: false, error: "Command is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await executeCommand(command);
    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: result,
      executionTime,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function executeCommand(command: string): Promise<any> {
  const client = await clientPromise;
  const trimmedCommand = command.trim();

  // show dbs
  if (trimmedCommand === "show dbs" || trimmedCommand === "show databases") {
    const adminDb = client.db("admin");
    const result = await adminDb.admin().listDatabases();
    return result.databases.map((db: any) => ({
      name: db.name,
      sizeOnDisk: db.sizeOnDisk,
    }));
  }

  // show collections
  if (trimmedCommand === "show collections") {
    throw new Error("Use: db.<collection>... ou especifique database");
  }

  // db.<collection>.<operation>(...)
  const dbCollectionRegex = /^db\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\((.*)\)$/;
  const match = trimmedCommand.match(dbCollectionRegex);

  if (match) {
    const [, collectionName, operation, argsStr] = match;
    const defaultDb = client.db(); // usa default do URI

    return await executeOperation(defaultDb, collectionName, operation, argsStr);
  }

  throw new Error("Comando não reconhecido. Use: db.<collection>.<operation>(...)");
}

async function executeOperation(
  db: any,
  collectionName: string,
  operation: string,
  argsStr: string
): Promise<any> {
  const collection = db.collection(collectionName);

  // Parse argumentos (ATENÇÃO: usar eval em produção é inseguro!)
  let args: any = {};
  if (argsStr.trim()) {
    try {
      // Tentar parse como JSON primeiro
      args = JSON.parse(argsStr);
    } catch {
      // Se falhar, usar eval (apenas para POC)
      args = eval("(" + argsStr + ")");
    }
  }

  switch (operation) {
    case "find":
      const findResult = await collection.find(args).limit(50).toArray();
      return findResult;

    case "findOne":
      const findOneResult = await collection.findOne(args);
      return findOneResult;

    case "insertOne":
      const insertResult = await collection.insertOne(args);
      return { insertedId: insertResult.insertedId.toString() };

    case "insertMany":
      const insertManyResult = await collection.insertMany(args);
      return {
        insertedCount: insertManyResult.insertedCount,
        insertedIds: Object.values(insertManyResult.insertedIds).map((id: any) =>
          id.toString()
        ),
      };

    case "updateOne":
      if (!Array.isArray(args) || args.length < 2) {
        throw new Error("updateOne requer 2 argumentos: filter e update");
      }
      const updateOneResult = await collection.updateOne(args[0], args[1]);
      return {
        matchedCount: updateOneResult.matchedCount,
        modifiedCount: updateOneResult.modifiedCount,
      };

    case "deleteOne":
      const deleteOneResult = await collection.deleteOne(args);
      return { deletedCount: deleteOneResult.deletedCount };

    case "countDocuments":
      const count = await collection.countDocuments(args);
      return { count };

    default:
      throw new Error(`Operação '${operation}' não suportada`);
  }
}
```

### 📝 Passo 8.2: Criar Componente ShellConsole

Criar `components/ShellConsole.tsx`:

```typescript
"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ClearIcon from "@mui/icons-material/Clear";

interface ShellOutput {
  command: string;
  result: any;
  error?: string;
  executionTime?: number;
}

export default function ShellConsole() {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<ShellOutput[]>([]);
  const [loading, setLoading] = useState(false);

  const executeCommand = async () => {
    if (!command.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/shell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();

      setHistory((prev) => [
        ...prev,
        {
          command,
          result: result.data,
          error: result.success ? undefined : result.error,
          executionTime: result.executionTime,
        },
      ]);

      setCommand("");
    } catch (error: any) {
      setHistory((prev) => [
        ...prev,
        {
          command,
          result: null,
          error: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      executeCommand();
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <Paper
      sx={{
        height: "calc(100vh - 150px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">💻 MongoDB Shell</Typography>
        <IconButton size="small" onClick={clearHistory}>
          <ClearIcon />
        </IconButton>
      </Box>

      {/* Output Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          bgcolor: "#1E1E1E",
          color: "#D4D4D4",
          fontFamily: "Roboto Mono, monospace",
          fontSize: "0.875rem",
        }}
      >
        {history.length === 0 && (
          <Typography variant="body2" sx={{ color: "#6A9955", fontStyle: "italic" }}>
            # Digite comandos MongoDB (Ctrl+Enter para executar)
            <br />
            # Exemplos:
            <br />
            # - show dbs
            <br />
            # - db.users.find({"{}"})
            <br />
            # - db.products.insertOne({"{name: \"Book\", price: 25}"})
          </Typography>
        )}

        {history.map((entry, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography sx={{ color: "#4EC9B0", fontWeight: "bold" }}>
              &gt; {entry.command}
            </Typography>
            {entry.error ? (
              <Typography sx={{ color: "#F48771", ml: 2 }}>
                ❌ {entry.error}
              </Typography>
            ) : (
              <Box sx={{ ml: 2, color: "#CE9178" }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(entry.result, null, 2)}
                </pre>
                {entry.executionTime !== undefined && (
                  <Typography variant="caption" sx={{ color: "#6A9955" }}>
                    ({entry.executionTime}ms)
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2, display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Digite comando MongoDB (Ctrl+Enter para executar)"
          size="small"
          disabled={loading}
          sx={{
            fontFamily: "monospace",
            "& input": {
              fontFamily: "Roboto Mono, monospace",
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={executeCommand}
          disabled={loading || !command.trim()}
        >
          <PlayArrowIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
```

### 📝 Passo 8.3: Adicionar Rota para Shell

Criar `app/shell/page.tsx`:

```typescript
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import ShellConsole from "@/components/ShellConsole";

export default function ShellPage() {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <ShellConsole />
      </Box>
    </Box>
  );
}
```

### 📝 Passo 8.4: Adicionar Link no AppBar

Atualizar `components/AppBarTop.tsx` - adicionar botão de shell:

```typescript
import TerminalIcon from "@mui/icons-material/Terminal";
import Link from "next/link";

// Adicionar antes dos ícones de refresh:
<Link href="/shell" passHref style={{ textDecoration: "none", color: "inherit" }}>
  <IconButton color="inherit" title="Abrir Shell">
    <TerminalIcon />
  </IconButton>
</Link>
```

### ✅ Passo 8.5: Validar Shell

**Testar:**
- [ ] Navegar para `/shell`
- [ ] Executar `show dbs`
- [ ] Executar `db.users.find({})`
- [ ] Executar `db.test.insertOne({ name: "Test" })`
- [ ] Ver histórico de comandos
- [ ] Limpar histórico

---

## Fase 9: Tema e Estilização

### 🎯 Objetivo
Implementar alternância de tema e melhorar estética geral.

### 📝 Passo 9.1: Adicionar Context de Tema

Atualizar `components/ThemeRegistry.tsx`:

```typescript
"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode, useState, useMemo, createContext, useContext } from "react";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#00ED64" : "#00684A",
      },
      secondary: {
        main: mode === "dark" ? "#E3FCF7" : "#001E2B",
      },
      background: {
        default: mode === "dark" ? "#1C1C1C" : "#F5F5F5",
        paper: mode === "dark" ? "#2C2C2C" : "#FFFFFF",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "dark" ? "#252525" : "#FAFAFA",
          },
        },
      },
    },
  });

interface ThemeContextType {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: () => {},
  mode: "dark",
});

export const useThemeMode = () => useContext(ThemeContext);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
```

### 📝 Passo 9.2: Conectar Toggle de Tema no AppBar

Criar um wrapper client para a página principal que usa o contexto.

Atualizar `app/page.tsx`:

```typescript
"use client";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import Typography from "@mui/material/Typography";
import { useThemeMode } from "@/components/ThemeRegistry";

export default function Home() {
  const { toggleTheme, mode } = useThemeMode();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop
        onToggleTheme={toggleTheme}
        isDarkMode={mode === "dark"}
      />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>
          Bem-vindo ao Mongo UI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecione um database e collection no menu lateral para começar.
        </Typography>
      </Box>
    </Box>
  );
}
```

Fazer o mesmo para outras páginas (`app/[db]/[collection]/page.tsx` e `app/shell/page.tsx`).

### 📝 Passo 9.3: Melhorar Estilos Globais

Atualizar `app/globals.css`:

```css
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: var(--background);
}

a {
  color: inherit;
  text-decoration: none;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1E1E1E;
}

::-webkit-scrollbar-thumb {
  background: #464646;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Code styling */
code,
pre {
  font-family: "Roboto Mono", monospace;
}
```

### ✅ Passo 9.4: Validar Tema

**Testar:**
- [ ] Clicar no botão de alternância de tema
- [ ] Verificar mudança de cores em toda interface
- [ ] Verificar legibilidade em ambos os temas
- [ ] Validar cores no shell e DataGrid

---

## Fase 10: Polimento e Segurança

### 🎯 Objetivo
Adicionar validações, segurança, tratamento de erros e melhorias finais.

### 📝 Passo 10.1: Adicionar Validação de Variáveis de Ambiente

Criar `lib/env.ts`:

```typescript
export function validateEnv() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "❌ MONGODB_URI não definida. Adicione ao arquivo .env.local"
    );
  }

  const isReadOnly = process.env.READ_ONLY === "true";
  
  return {
    mongoUri: process.env.MONGODB_URI,
    readOnly: isReadOnly,
  };
}
```

### 📝 Passo 10.2: Implementar Modo Read-Only

Atualizar todas as APIs de modificação (POST, PUT, DELETE) para verificar `READ_ONLY`:

```typescript
// Adicionar no início de cada função POST/PUT/DELETE:
const isReadOnly = process.env.READ_ONLY === "true";

if (isReadOnly) {
  return NextResponse.json(
    {
      success: false,
      error: "Aplicação em modo somente leitura",
    },
    { status: 403 }
  );
}
```

### 📝 Passo 10.3: Adicionar Loading States

Atualizar componentes para exibir melhor feedback de carregamento:

- Skeleton screens no DocumentGrid
- Spinners em operações assíncronas
- Disable buttons durante operações

### 📝 Passo 10.4: Adicionar Error Boundaries

Criar `components/ErrorBoundary.tsx`:

```typescript
"use client";

import React, { Component, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            p: 3,
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Algo deu errado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.error?.message || "Erro desconhecido"}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

Adicionar ao `layout.tsx`:

```typescript
import ErrorBoundary from "@/components/ErrorBoundary";

// Envolver children com ErrorBoundary
<ErrorBoundary>{children}</ErrorBoundary>
```

### 📝 Passo 10.5: Adicionar Tratamento de Grandes Datasets

Atualizar API `/api/documents` para adicionar paginação:

```typescript
const page = parseInt(searchParams.get("page") || "1", 10);
const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
const skip = (page - 1) * pageSize;

const documents = await collection
  .find({})
  .skip(skip)
  .limit(pageSize)
  .toArray();

const totalCount = await collection.countDocuments({});

return NextResponse.json({
  success: true,
  data: serializedDocs,
  pagination: {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  },
});
```

### 📝 Passo 10.6: Adicionar Logging

Criar `lib/logger.ts`:

```typescript
export const logger = {
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${message}`, meta || "");
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || "");
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta || "");
  },
};
```

Usar em APIs:

```typescript
import { logger } from "@/lib/logger";

logger.info("Fetching databases");
logger.error("Failed to connect to MongoDB", error);
```

### 📝 Passo 10.7: Criar README

Criar `README.md`:

```markdown
# 🍃 Mongo UI - MongoDB Web Interface

Interface web moderna para gerenciar bancos de dados MongoDB, similar ao MongoDB Compass.

## 🚀 Recursos

- ✅ Visualização hierárquica de databases e collections
- ✅ CRUD completo de documentos
- ✅ Consultas avançadas com filtros
- ✅ Simulador de shell MongoDB
- ✅ Tema claro/escuro
- ✅ Interface responsiva

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com suas credenciais MongoDB
```

## ⚙️ Configuração

Edite `.env.local`:

```bash
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/database
READ_ONLY=false
```

## 🏃 Executar

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🛠️ Stack Tecnológica

- **Next.js 14** - Framework React
- **Material UI** - Componentes UI
- **MongoDB Driver** - Conexão com banco
- **TypeScript** - Type safety

## 📖 Uso

### Navegação
1. Databases aparecem no menu lateral
2. Clique para expandir e ver collections
3. Clique em collection para visualizar documentos

### CRUD
- **Criar:** Botão "Novo" → Digite JSON → Salvar
- **Editar:** Selecione linha → Ícone de edição
- **Excluir:** Selecione linha → Ícone de lixeira

### Consultas
- Expanda "Consulta Avançada"
- Digite filtro MongoDB: `{ "idade": { "$gt": 25 } }`
- Configure ordenação e limite
- Clique em "Executar Query"

### Shell
- Clique no ícone de terminal no topo
- Digite comandos MongoDB:
  ```
  show dbs
  db.users.find({})
  db.products.insertOne({ name: "Test" })
  ```
- Pressione Ctrl+Enter para executar

## 🔒 Segurança

- Nunca commite `.env.local`
- Use modo READ_ONLY=true em ambientes não confiáveis
- Validação de entrada em todas as APIs
- Limitação de resultados por padrão

## 📝 Licença

MIT - Julio Dev
```

### ✅ Passo 10.8: Validação Final

**Checklist:**
- [ ] Todas as APIs retornam erros tratados
- [ ] Modo read-only funciona
- [ ] Error boundaries capturam erros
- [ ] Loading states em todas operações
- [ ] README completo
- [ ] Variáveis de ambiente documentadas

---

## Checklist de Validação

### Funcionalidades Core
- [ ] Conexão com MongoDB estabelecida
- [ ] Listagem de databases
- [ ] Listagem de collections
- [ ] Visualização de documentos em grid
- [ ] Criação de documentos
- [ ] Edição de documentos
- [ ] Exclusão de documentos
- [ ] Consultas com filtros
- [ ] Shell interativo funcional

### UI/UX
- [ ] Tema claro/escuro alternável
- [ ] Layout responsivo
- [ ] Feedback visual em operações
- [ ] Mensagens de erro claras
- [ ] Loading states apropriados

### Segurança
- [ ] Variáveis de ambiente protegidas
- [ ] Modo read-only implementado
- [ ] Validação de entrada
- [ ] Error handling robusto

### Código
- [ ] TypeScript sem erros
- [ ] Componentes reutilizáveis
- [ ] Código organizado e limpo
- [ ] Comentários em pontos complexos

---

## 🎯 Sequência de Implementação Recomendada

1. **Dia 1:** Fases 1-3 (Setup + Layout)
2. **Dia 2:** Fases 4-5 (Navegação + Visualização)
3. **Dia 3:** Fase 6 (CRUD)
4. **Dia 4:** Fases 7-8 (Consultas + Shell)
5. **Dia 5:** Fases 9-10 (Tema + Polimento)

---

## 📞 Suporte e Próximos Passos

### Melhorias Futuras
- [ ] Autenticação de usuários
- [ ] Múltiplas conexões MongoDB
- [ ] Export de dados (CSV/JSON)
- [ ] Visualização de índices
- [ ] Aggregation pipeline builder
- [ ] Histórico de comandos persistente
- [ ] Syntax highlighting no editor JSON

---

**Autor:** Julio Dev  
**Versão:** 1.0  
**Data:** 2025

