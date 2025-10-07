# 🔒 Guia de Segurança - Mongo UI

Este documento descreve as medidas de segurança implementadas no Mongo UI.

---

## 🛡️ Recursos de Segurança

### 1. Modo Read-Only
### 2. Error Boundary
### 3. Validação de Ambiente
### 4. Logger System
### 5. Proteção de APIs

---

## 1. 🔐 Modo Read-Only

### O que é?
Modo que **bloqueia todas operações de escrita**, permitindo apenas leitura de dados.

### Quando usar?
- ✅ Ambientes de demonstração
- ✅ Ambientes de teste
- ✅ Produção onde não é necessário escrever
- ✅ Auditoria de dados
- ✅ Análise de dados

### Como habilitar?

Adicione ao `.env.local`:
```bash
READ_ONLY=true
```

### O que é bloqueado?

**APIs REST:**
- ❌ `POST /api/documents` - Criar documentos
- ❌ `PUT /api/documents` - Atualizar documentos
- ❌ `DELETE /api/documents` - Deletar documentos

**MongoDB Shell:**
- ❌ `insertOne()` - Inserir documento
- ❌ `insertMany()` - Inserir múltiplos
- ❌ `updateOne()` - Atualizar um
- ❌ `updateMany()` - Atualizar múltiplos
- ❌ `deleteOne()` - Deletar um
- ❌ `deleteMany()` - Deletar múltiplos

### O que é permitido?

**APIs REST:**
- ✅ `GET /api/health` - Health check
- ✅ `GET /api/databases` - Listar databases
- ✅ `GET /api/collections` - Listar collections
- ✅ `GET /api/documents` - Listar documentos
- ✅ `POST /api/query` - Queries de leitura

**MongoDB Shell:**
- ✅ `show dbs` - Listar databases
- ✅ `db.<db>.getCollectionNames()` - Listar collections
- ✅ `find()` - Buscar documentos
- ✅ `findOne()` - Buscar um documento
- ✅ `countDocuments()` - Contar documentos
- ✅ `distinct()` - Valores únicos

### Resposta de Erro

Quando uma operação bloqueada é tentada:

**HTTP Status:** `403 Forbidden`

**Response Body:**
```json
{
  "success": false,
  "error": "Aplicação em modo somente leitura (READ_ONLY=true). Operações de escrita não são permitidas."
}
```

### Logs

Tentativas bloqueadas são registradas:
```
⚠️ [2025-10-07T12:34:56.789Z] [WARN] Tentativa de criar documento em modo read-only
```

---

## 2. 🛡️ Error Boundary

### O que é?
Componente React que **captura erros não tratados** e exibe UI de fallback.

### Onde está?
Envolvendo toda a aplicação no `app/layout.tsx`:
```tsx
<ErrorBoundary>
  <ThemeRegistry>{children}</ThemeRegistry>
</ErrorBoundary>
```

### O que captura?
- ✅ Erros de renderização
- ✅ Erros em lifecycle methods
- ✅ Erros em construtores
- ✅ Erros em event handlers
- ❌ **NÃO** captura:
  - Erros em async code (use try/catch)
  - Erros em event handlers (use try/catch)
  - Erros no servidor (SSR)

### UI de Fallback

**Desenvolvimento:**
- ❌ Ícone de erro
- 📝 Mensagem amigável
- 🐛 Detalhes do erro
- 📋 Stack trace completo
- 🔄 Botões de ação

**Produção:**
- ❌ Ícone de erro
- 📝 Mensagem amigável
- 🆔 Error ID único
- 🔄 Botões de ação
- ❌ **SEM** detalhes técnicos

### Ações Disponíveis

1. **Recarregar Página** - `window.location.reload()`
2. **Voltar ao Início** - `window.location.href = "/"`
3. **Resetar Erro** (dev only) - Limpa estado do erro

### Integração com Monitoring

Pronto para integração com:
- 🔴 Sentry
- 📊 LogRocket
- 📈 DataDog
- 🔍 New Relic

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // TODO: Enviar para serviço de monitoring
  if (process.env.NODE_ENV === "production") {
    sendErrorToMonitoring(error, errorInfo);
  }
}
```

---

## 3. ✅ Validação de Ambiente

### O que valida?

**MONGODB_URI (obrigatória):**
- ✅ Existência da variável
- ✅ Formato correto (`mongodb://` ou `mongodb+srv://`)
- ❌ Erro claro se inválida

**READ_ONLY (opcional):**
- ✅ Default: `false`
- ✅ Aceita: `"true"` ou `"false"`

### Mensagens de Erro

**URI não definida:**
```
❌ MONGODB_URI não está definida!

Por favor, crie o arquivo .env.local na raiz do projeto com:
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/

Exemplo:
MONGODB_URI=mongodb+srv://admin:senha123@cluster0.mongodb.net/...
```

**URI inválida:**
```
❌ MONGODB_URI inválida!

A URI deve começar com 'mongodb://' ou 'mongodb+srv://'
URI atual: postgres://...
```

### Helpers Disponíveis

```typescript
import { isReadOnly, isDevelopment, isProduction } from "@/lib/env";

if (isReadOnly()) {
  // Bloquear operação
}

if (isDevelopment()) {
  // Mostrar logs detalhados
}

if (isProduction()) {
  // Enviar para monitoring
}
```

---

## 4. 📊 Logger System

### Níveis de Log

| Nível | Emoji | Quando usar |
|-------|-------|-------------|
| `DEBUG` | 🔍 | Detalhes técnicos (dev only) |
| `INFO` | ℹ️ | Informações gerais |
| `WARN` | ⚠️ | Avisos, não bloqueiam |
| `ERROR` | ❌ | Erros, requerem atenção |

### Métodos Básicos

```typescript
import { logger } from "@/lib/logger";

// Debug (apenas desenvolvimento)
logger.debug("Dados carregados", { count: 50 });

// Info
logger.info("Usuário logado", { userId: "123" });

// Warn
logger.warn("Limite próximo", { usage: 95 });

// Error
logger.error("Falha na conexão", error);
```

### Métodos Especializados

```typescript
// API logs
logger.api("POST", "/api/documents", 201, 45); // 45ms
// ℹ️ [2025-10-07T...] [INFO] POST /api/documents - 201 (45ms)

// MongoDB operations
logger.mongo("find", "users", 12); // 12ms
// 🔍 [2025-10-07T...] [DEBUG] MongoDB: find on users (12ms)

// Autenticação
logger.auth("login", true, "user@example.com");
// ℹ️ [2025-10-07T...] [INFO] Auth: login - ✅ Success - user@example.com

// Performance
logger.perf("Query execution", 250, 200); // Threshold 200ms
// ⚠️ [2025-10-07T...] [WARN] Performance: Query execution took 250ms (exceeds threshold of 200ms)
```

### Profiling

```typescript
logger.time("Operação Complexa");
// ... código ...
logger.timeEnd("Operação Complexa");
// ⏱️ Operação Complexa: 123.45ms
```

### Logs Agrupados

```typescript
logger.group("Carregando dados", () => {
  logger.info("Step 1");
  logger.info("Step 2");
  logger.info("Step 3");
});
// 📦 Carregando dados
//   ℹ️ Step 1
//   ℹ️ Step 2
//   ℹ️ Step 3
```

### JSON Structured Logs

```typescript
logger.json(LogLevel.INFO, "User action", {
  userId: "123",
  action: "create_document",
  timestamp: new Date(),
});
// {"level":"INFO","message":"User action","timestamp":"2025-10-07T...","meta":{...}}
```

---

## 5. 🔐 Proteção de APIs

### Verificações Implementadas

**Todas APIs de Escrita:**
1. ✅ Verificação de read-only
2. ✅ Validação de parâmetros
3. ✅ Tratamento de erros
4. ✅ Logging de operações
5. ✅ HTTP status correto

### Padrão de Proteção

```typescript
export async function POST(request: Request) {
  // 1. Verificar read-only
  if (isReadOnly()) {
    logger.warn("Operação bloqueada em read-only");
    return NextResponse.json({
      success: false,
      error: "Modo somente leitura"
    }, { status: 403 });
  }

  // 2. Timing
  const startTime = Date.now();

  try {
    // 3. Validar parâmetros
    const body = await request.json();
    if (!body.required) {
      return NextResponse.json({
        success: false,
        error: "Parâmetro obrigatório"
      }, { status: 400 });
    }

    // 4. Executar operação
    const result = await mongoOperation();

    // 5. Log de sucesso
    const duration = Date.now() - startTime;
    logger.api("POST", "/api/endpoint", 200, duration);

    // 6. Retornar resultado
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    // 7. Log de erro
    logger.error("Erro na operação", error);

    // 8. Retornar erro
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

---

## 🎯 Checklist de Segurança

### Antes de Deploy

- [ ] `.env.local` está no `.gitignore`
- [ ] `MONGODB_URI` está configurada
- [ ] `READ_ONLY` está definido (se necessário)
- [ ] Error Boundary está ativo
- [ ] Logger está configurado
- [ ] Credenciais MongoDB são seguras
- [ ] IP whitelist configurado no MongoDB Atlas
- [ ] SSL/TLS habilitado na conexão
- [ ] Testes de read-only funcionando

### Em Produção

- [ ] Monitoring service integrado (Sentry, etc.)
- [ ] Logs sendo coletados
- [ ] Alertas configurados
- [ ] Backup automático habilitado
- [ ] Rate limiting configurado (opcional)
- [ ] CORS configurado corretamente
- [ ] HTTPS habilitado

---

## 🚨 Incidentes e Resposta

### Se ocorrer um erro:

1. **Error Boundary captura** → UI de fallback
2. **Logger registra** → Console + monitoring
3. **Usuário vê** → Mensagem amigável + ações
4. **Time é notificado** → Via monitoring service
5. **Investigação** → Logs estruturados
6. **Fix** → Deploy rápido
7. **Post-mortem** → Documentar e prevenir

### Logs úteis para debug:

```bash
# Filtrar por nível
grep "ERROR" logs.txt

# Filtrar por operação
grep "MongoDB: find" logs.txt

# Filtrar por API
grep "POST /api/documents" logs.txt

# Filtrar por tempo
grep "2025-10-07T12:" logs.txt
```

---

## 📚 Recursos Externos

### Monitoring Services
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay
- [DataDog](https://www.datadoghq.com/) - APM
- [New Relic](https://newrelic.com/) - Observability

### Segurança MongoDB
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)

---

## 📞 Contato

Em caso de problemas de segurança, entre em contato:
- 🔒 Email: security@your-domain.com
- 📱 Slack: #security-alerts

---

**Mongo UI** - Segurança em primeiro lugar 🔒✨

