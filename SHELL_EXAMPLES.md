# 💻 MongoDB Shell - Exemplos de Comandos

Este documento contém exemplos de comandos que você pode executar no **MongoDB Shell** do Mongo UI.

---

## 📋 Comandos Básicos

### 1. Listar Databases
```javascript
show dbs
```
**Retorna:** Lista de databases com tamanho em disco

---

### 2. Listar Collections de um Database
```javascript
db.ccee.getCollectionNames()
```
**Substitua** `ccee` pelo nome do seu database.

---

## 🔍 Consultas (Find)

### 3. Buscar Todos os Documentos (limitado a 50)
```javascript
db.ccee.coletas.find({})
```

### 4. Buscar com Filtro
```javascript
db.ccee.coletas.find({"id_coleta": "12345"})
```

### 5. Buscar com Operadores
```javascript
// Maior que
db.ccee.coletas.find({"id_coleta": {"$gt": "10000"}})

// Contém (regex)
db.ccee.coletas.find({"id_usuario": {"$regex": "^u98"}})

// In (array)
db.ccee.coletas.find({"id_estabelecimento": {"$in": ["est001", "est002"]}})
```

### 6. Buscar Um Documento
```javascript
db.ccee.coletas.findOne({"id_coleta": "12345"})
```

---

## ➕ Inserção (Create)

### 7. Inserir Um Documento
```javascript
db.ccee.coletas.insertOne({
  "data_coleta": "2025-10-07T15:00:00Z",
  "id_coleta": "99999",
  "id_usuario": "u99999",
  "id_estabelecimento": "est999",
  "id_produto": "prd999",
  "id_fornecedor": "for999",
  "id_transportadora": "tr999",
  "id_destinatario": "dst999"
})
```

### 8. Inserir Múltiplos Documentos
```javascript
db.ccee.coletas.insertMany([
  {"id_coleta": "88888", "id_usuario": "u88888"},
  {"id_coleta": "77777", "id_usuario": "u77777"}
])
```

---

## ✏️ Atualização (Update)

### 9. Atualizar Um Documento
```javascript
db.ccee.coletas.updateOne([
  {"id_coleta": "12345"},
  {"$set": {"id_usuario": "u99999"}}
])
```

### 10. Atualizar Múltiplos Documentos
```javascript
db.ccee.coletas.updateMany([
  {"id_estabelecimento": "est001"},
  {"$set": {"status": "processado"}}
])
```

---

## 🗑️ Exclusão (Delete)

### 11. Deletar Um Documento
```javascript
db.ccee.coletas.deleteOne({"id_coleta": "99999"})
```

### 12. Deletar Múltiplos Documentos
```javascript
db.ccee.coletas.deleteMany({"id_estabelecimento": "est999"})
```

---

## 📊 Agregação e Contagem

### 13. Contar Documentos
```javascript
db.ccee.coletas.countDocuments({})
```

### 14. Contar com Filtro
```javascript
db.ccee.coletas.countDocuments({"id_estabelecimento": "est001"})
```

### 15. Valores Distintos
```javascript
db.ccee.coletas.distinct("id_estabelecimento")
```

---

## 🎯 Comandos Avançados

### 16. Buscar com Múltiplos Filtros (AND)
```javascript
db.ccee.coletas.find({
  "$and": [
    {"id_estabelecimento": "est001"},
    {"id_usuario": {"$regex": "^u98"}}
  ]
})
```

### 17. Buscar com OR
```javascript
db.ccee.coletas.find({
  "$or": [
    {"id_coleta": "12345"},
    {"id_coleta": "12346"}
  ]
})
```

### 18. Campo Existe
```javascript
db.ccee.coletas.find({"id_destinatario": {"$exists": true}})
```

### 19. Campo Não Existe
```javascript
db.ccee.coletas.find({"campo_opcional": {"$exists": false}})
```

---

## 💡 Dicas

### Atalhos do Teclado:
- **Enter** ou **Ctrl+Enter**: Executar comando
- **↑** (Seta para cima): Comando anterior
- **↓** (Seta para baixo): Próximo comando
- **Shift+Enter**: Nova linha (multiline)

### Funcionalidades:
- ✅ Copiar comando clicando no ícone
- ✅ Copiar resultado (hover no output)
- ✅ Histórico de comandos navegável
- ✅ Auto-scroll para último comando
- ✅ Tempo de execução exibido
- ✅ Timestamp de cada comando

---

## ⚠️ Observações Importantes

1. **Limite de Resultados**: `find()` retorna no máximo **50 documentos** por segurança
2. **ObjectId**: Use strings normais, o ObjectId é tratado automaticamente
3. **Sintaxe JSON**: Use aspas duplas `"` para chaves e valores string
4. **Arrays em updateOne/updateMany**: Use formato `[filter, update]`

---

## 🔗 Sintaxe Completa

```
db.<database>.<collection>.<operation>(<args>)
```

**Exemplo:**
```javascript
db.ccee.coletas.find({"id_coleta": "12345"})
│  │    │       │     └─ Argumentos (JSON)
│  │    │       └─────── Operação (find, insertOne, etc)
│  │    └───────────────Collection
│  └────────────────────Database
└───────────────────────Prefixo obrigatório
```

---

## 📚 Operações Suportadas

| Operação | Descrição | Argumentos |
|----------|-----------|------------|
| `find` | Buscar documentos | `{}` ou filtro JSON |
| `findOne` | Buscar um documento | `{}` ou filtro JSON |
| `insertOne` | Inserir documento | Objeto JSON |
| `insertMany` | Inserir múltiplos | Array de objetos |
| `updateOne` | Atualizar um | `[filtro, update]` |
| `updateMany` | Atualizar múltiplos | `[filtro, update]` |
| `deleteOne` | Deletar um | Filtro JSON |
| `deleteMany` | Deletar múltiplos | Filtro JSON |
| `countDocuments` | Contar documentos | `{}` ou filtro |
| `distinct` | Valores únicos | Nome do campo (string) |

---

## 🚀 Comece Agora!

Acesse o shell clicando no ícone **🖥️ Terminal** no canto superior direito da aplicação.

**Comando de teste rápido:**
```javascript
show dbs
```

---

**Desenvolvido com ❤️ para Mongo UI**

