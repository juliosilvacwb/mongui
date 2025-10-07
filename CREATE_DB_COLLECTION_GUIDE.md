# 🗄️ Guia de Criação - Databases e Collections

Este documento explica como criar databases e collections no Mongui.

---

## 📊 Criação de Database

### Como Criar

1. Clique no botão **"Novo Database"** no topo do menu lateral
2. Digite o **nome do database** (exemplo: `ecommerce`)
3. Digite o **nome da collection inicial** (exemplo: `produtos`)
4. Clique em **"Criar Database"**

> 💡 **Por que collection inicial?** O MongoDB só cria o database quando há pelo menos uma collection nele. Isso garante que o database fique visível imediatamente.

### 📋 Restrições do MongoDB

O nome do database deve seguir estas regras:

#### ✅ Permitido:
- **Letras:** `a-z`, `A-Z`
- **Números:** `0-9`
- **Underscore:** `_`
- **Hífen:** `-`

#### ❌ NÃO Permitido:
- **Caracteres especiais:** `/`, `\`, `.`, `"`, `*`, `<`, `>`, `:`, `|`, `?`, `$`
- **Espaços**
- **Caractere nulo** (`\0`)

#### 🚫 Nomes Reservados:
- `admin` - Database de administração do MongoDB
- `local` - Database local do MongoDB
- `config` - Database de configuração

#### 📏 Tamanho:
- **Mínimo:** 1 caractere
- **Máximo:** 64 caracteres

### Exemplos Válidos:
```
✅ meu_database
✅ producao-2025
✅ database_teste_123
✅ analytics_v2
✅ db-staging
```

### Exemplos Inválidos:
```
❌ meu database        (contém espaço)
❌ database.teste      (contém ponto)
❌ admin               (nome reservado)
❌ database$2025       (contém $)
❌ <database>          (contém < e >)
❌ database:test       (contém :)
```

### ⚠️ Nota Importante

O MongoDB cria databases **automaticamente** ao inserir dados. Por isso, ao criar um database no Mongui, você deve informar o nome da **primeira collection**.

Isso garante que:
- ✅ O database seja criado imediatamente
- ✅ Fique visível na lista de databases
- ✅ Você comece com uma collection útil (não temporária)

---

## 📁 Criação de Collection

### Como Criar

1. **Expanda um database** (clique nele)
2. Clique no botão **"Nova Collection"** dentro do database
3. Digite o nome da collection
4. Clique em **"Criar Collection"**

### 📋 Restrições do MongoDB

O nome da collection deve seguir estas regras:

#### ✅ Permitido:
- **Letras:** `a-z`, `A-Z`
- **Números:** `0-9`
- **Underscore:** `_`
- **Hífen:** `-`
- **Ponto:** `.` (permitido, mas não recomendado)

#### ❌ NÃO Permitido:
- **Começar com:** `system.` (reservado pelo MongoDB)
- **Conter:** `$` (caractere especial do MongoDB)
- **Caractere nulo** (`\0`)
- **Começar/terminar com espaço**

#### 📏 Tamanho:
- **Mínimo:** 1 caractere
- **Máximo:** 120 caracteres
- **Namespace completo** (db.collection): máximo 120 bytes

### Exemplos Válidos:
```
✅ usuarios
✅ produtos
✅ vendas_2025
✅ log-eventos
✅ analytics_data
✅ cache_sessions
```

### Exemplos Inválidos:
```
❌ system.usuarios     (começa com system.)
❌ produtos$2025       (contém $)
❌ usuarios            (já existe)
❌ collection          (espaço no início)
❌ (vazio)             (nome vazio)
```

---

## 🎯 Fluxos Completos

### Fluxo 1: Criar Database do Zero

```
1. Click "Novo Database" no menu lateral
2. Digite Database: "ecommerce"
3. Digite Collection Inicial: "produtos"
4. Click "Criar Database"
5. ✅ Database aparece na lista
6. ✅ Collection "produtos" já está criada
7. Expanda o database → Veja "produtos"
8. Click em "produtos" → Visualize documentos
```

### Fluxo 2: Adicionar Collection em Database Existente

```
1. Expanda um database existente
2. Click "Nova Collection"
3. Digite nome da collection
4. Click "Criar Collection"
5. Collection aparece na lista
6. Click na collection → Comece a trabalhar
```

---

## 🔐 Segurança

### Modo Read-Only

Se `READ_ONLY=true` estiver ativo:
- ❌ Botões de criar ficam **visíveis**
- ❌ Ao tentar criar, retorna **erro 403**
- ⚠️ Mensagem: "Aplicação em modo somente leitura"

### Validações

**Client-Side (Tempo Real):**
- ✅ Validação enquanto digita
- ✅ Mensagens de erro instantâneas
- ✅ Botão "Criar" desabilitado se inválido

**Server-Side (API):**
- ✅ Validação completa no servidor
- ✅ Verificação de duplicatas
- ✅ Validação de formato
- ✅ Retorno de erros claros

---

## 📊 Mensagens de Erro

### Database

**Nome vazio:**
```
❌ Nome do database não pode estar vazio
```

**Nome reservado:**
```
❌ Nome 'admin' é reservado pelo MongoDB
```

**Caractere inválido:**
```
❌ Nome do database não pode conter o caractere: '$'
```

**Tamanho excedido:**
```
❌ Nome do database não pode ter mais de 64 caracteres
```

**Database já existe:**
```
❌ Database 'ecommerce' já existe
```

### Collection

**Nome vazio:**
```
❌ Nome da collection não pode estar vazio
```

**Começa com system:**
```
❌ Nome da collection não pode começar com 'system.' (reservado pelo MongoDB)
```

**Contém $:**
```
❌ Nome da collection não pode conter o caractere '$'
```

**Collection já existe:**
```
❌ Collection 'usuarios' já existe no database 'ecommerce'
```

---

## 💡 Dicas e Boas Práticas

### Nomenclatura

**Databases:**
```
✅ Use minúsculas: analytics, ecommerce, crm
✅ Use underscore para separar: user_data, sales_2025
✅ Use hífen para ambientes: prod-db, staging-db
✅ Seja descritivo: analytics, não apenas db1
```

**Collections:**
```
✅ Use plural: users, products, orders
✅ Use snake_case: user_sessions, order_items
✅ Seja descritivo: customer_reviews, não apenas data
✅ Organize por módulo: auth_users, auth_tokens
```

### Organização

**Por Ambiente:**
```
dev-ecommerce
staging-ecommerce
prod-ecommerce
```

**Por Módulo:**
```
ecommerce
  ├── products
  ├── orders
  ├── customers
  └── payments
```

**Por Versão:**
```
analytics
  ├── events_v1
  ├── events_v2
  └── metrics_daily
```

---

## 🔄 Após Criação

### Database Criado

1. ✅ Aparece automaticamente na lista
2. ✅ Pode ser expandido
3. ✅ Contém collection `_init` (pode deletar)
4. ✅ Pronto para receber collections

### Collection Criada

1. ✅ Aparece na lista do database
2. ✅ Pode ser clicada
3. ✅ Está vazia (0 documentos)
4. ✅ Pronta para receber documentos

---

## 🧪 Exemplos Práticos

### Exemplo 1: E-commerce

```bash
# 1. Criar database com collection inicial
Database: ecommerce
Collection Inicial: produtos

# 2. Adicionar mais collections
Collections adicionais:
  - pedidos
  - clientes
  - pagamentos
  - avaliacoes
```

### Exemplo 2: Sistema de Logs

```bash
# 1. Criar database com collection inicial
Database: logs-sistema
Collection Inicial: logs_erro

# 2. Adicionar mais collections
Collections adicionais:
  - logs_acesso
  - logs_api
  - logs_db
```

### Exemplo 3: Multi-Tenant

```bash
# 1. Criar databases por cliente (com collection inicial)
Database: cliente_001
Collection Inicial: usuarios

Database: cliente_002
Collection Inicial: usuarios

Database: cliente_003
Collection Inicial: usuarios

# 2. Adicionar collections adicionais em cada database
Collections adicionais (para cada database):
  - configuracoes
  - dados
  - logs
```

---

## 🚨 Troubleshooting

### "Database já existe"
**Solução:** Use um nome diferente ou delete o database existente (via MongoDB Compass/Shell)

### "Collection já existe"
**Solução:** Use um nome diferente ou delete a collection existente

### "Modo somente leitura"
**Solução:** Configure `READ_ONLY=false` no `.env.local`

### "Nome inválido"
**Solução:** Siga as restrições do MongoDB listadas acima

### Database não aparece
**Solução:** 
1. Aguarde alguns segundos
2. Click no botão refresh (↻) do AppBar
3. Recarregue a página se necessário

---

## ⌨️ Atalhos

### No Modal
- **Enter**: Criar (se válido)
- **Esc**: Cancelar

### Navegação
- **Click** no database → Expandir/Retrair
- **Click** na collection → Visualizar documentos

---

## 📚 Documentação MongoDB

Para mais informações sobre restrições de nomes:

- [Database Names](https://docs.mongodb.com/manual/reference/limits/#naming-restrictions)
- [Collection Names](https://docs.mongodb.com/manual/reference/limits/#naming-restrictions)

---

## ✨ Recursos

### Validação em Tempo Real
- ✅ Feedback instantâneo
- ✅ Mensagens claras
- ✅ Botão desabilitado se inválido

### UI/UX
- ✅ Modais responsivos
- ✅ Alertas informativos
- ✅ Chips com restrições
- ✅ Feedback de sucesso/erro
- ✅ Loading states

### Segurança
- ✅ Validação client + server
- ✅ Proteção read-only
- ✅ Logs de operações
- ✅ Verificação de duplicatas

---

**Mongui** - Gerencie sua estrutura MongoDB com facilidade! 🗄️✨

