import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";
import { parseMongoArgs, sanitizeMongoJSON } from "@/lib/jsonParser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, db } = body;

    if (!command) {
      return NextResponse.json(
        { success: false, error: "Command is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await executeCommand(command, db);
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

async function executeCommand(command: string, contextDb?: string): Promise<any> {
  const client = await clientPromise;
  let trimmedCommand = command.trim();

  // Pré-processar: transformar db.getCollection("nome") em db.nome
  // Suporta: db.getCollection("users") -> db.users
  // Suporta: db.database.getCollection("users") -> db.database.users
  trimmedCommand = trimmedCommand.replace(
    /\.getCollection\(["']([a-zA-Z0-9_-]+)["']\)/g,
    '.$1'
  );

  // show dbs / show databases
  if (trimmedCommand === "show dbs" || trimmedCommand === "show databases") {
    const adminDb = client.db("admin");
    const result = await adminDb.admin().listDatabases();
    return result.databases
      .filter((db: any) => !["admin", "local", "config"].includes(db.name))
      .map((db: any) => ({
        name: db.name,
        sizeOnDisk: formatBytes(db.sizeOnDisk),
        empty: db.empty,
      }));
  }

  // show collections
  if (trimmedCommand === "show collections") {
    throw new Error("Use: use <database> antes de listar collections, ou db.getCollectionNames()");
  }

  // use <database>
  const useDbRegex = /^use\s+([a-zA-Z0-9_-]+)$/;
  const useMatch = trimmedCommand.match(useDbRegex);
  if (useMatch) {
    const dbName = useMatch[1];
    // Apenas validar se o database existe
    const adminDb = client.db("admin");
    const result = await adminDb.admin().listDatabases();
    const dbExists = result.databases.some((db: any) => db.name === dbName);
    
    if (dbExists) {
      return {
        message: `Switched to db ${dbName}`,
        note: "⚠️ Nota: Use db.<database>.<collection>.<operation>() para especificar o database",
      };
    } else {
      throw new Error(`Database '${dbName}' não existe`);
    }
  }

  // db.getCollectionNames() quando contextDb está definido
  if (contextDb && trimmedCommand === "db.getCollectionNames()") {
    const db = client.db(contextDb);
    const collections = await db.listCollections().toArray();
    return collections.map((col: any) => col.name);
  }

  // db.<database>.getCollectionNames()
  const getCollectionsRegex = /^db\.([a-zA-Z0-9_-]+)\.getCollectionNames\(\)$/;
  const collectionsMatch = trimmedCommand.match(getCollectionsRegex);
  if (collectionsMatch) {
    const dbName = collectionsMatch[1];
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    return collections.map((col: any) => col.name);
  }

  // Se contextDb está definido, aceita: db.<collection>.<operation>(...) com chaining
  if (contextDb) {
    const contextPattern = /^db\.([a-zA-Z0-9_-]+)\.(.+)$/s;
    const contextMatch = trimmedCommand.match(contextPattern);
    if (contextMatch) {
      const [, collectionName, operationsChain] = contextMatch;
      const db = client.db(contextDb);
      return await executeOperationChain(db, collectionName, operationsChain);
    }
  }

  // Formato padrão: db.<database>.<collection>.<operation>(...) com chaining
  const dbCollectionRegex = /^db\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.(.+)$/s;
  const match = trimmedCommand.match(dbCollectionRegex);

  if (match) {
    const [, dbName, collectionName, operationsChain] = match;
    const db = client.db(dbName);

    return await executeOperationChain(db, collectionName, operationsChain);
  }

  const commandsHelp = contextDb 
    ? "Comandos suportados (database: " + contextDb + "):\n" +
      "  • show dbs\n" +
      "  • db.getCollectionNames()\n" +
      "  • db.<collection>.find({})\n" +
      "  • db.getCollection(\"<collection>\").find({})\n" +
      "  • db.<collection>.find().sort({}).limit(n)\n" +
      "  • db.<collection>.aggregate([...])\n" +
      "  • db.<collection>.findOne({})\n" +
      "  • db.<collection>.insertOne({...})\n" +
      "  • db.<collection>.updateOne({}, {...})\n" +
      "  • db.<collection>.deleteOne({})\n" +
      "  • db.<collection>.countDocuments({})"
    : "Comandos suportados:\n" +
      "  • show dbs\n" +
      "  • db.<database>.getCollectionNames()\n" +
      "  • db.<database>.<collection>.find({})\n" +
      "  • db.<database>.getCollection(\"<collection>\").find({})\n" +
      "  • db.<database>.<collection>.find().sort({}).limit(n)\n" +
      "  • db.<database>.<collection>.aggregate([...])\n" +
      "  • db.<database>.<collection>.findOne({})\n" +
      "  • db.<database>.<collection>.insertOne({...})\n" +
      "  • db.<database>.<collection>.updateOne({}, {...})\n" +
      "  • db.<database>.<collection>.deleteOne({})\n" +
      "  • db.<database>.<collection>.countDocuments({})";

  throw new Error("Comando não reconhecido.\n\n" + commandsHelp);
}

/**
 * Executa uma cadeia de operações encadeadas (ex: find().sort().limit())
 */
async function executeOperationChain(
  db: any,
  collectionName: string,
  operationsChain: string
): Promise<any> {
  const collection = db.collection(collectionName);

  // Parse a cadeia de operações
  // Exemplo: find({ status: "ativo" }).sort({ idade: -1 }).limit(10)
  const operations = parseOperationChain(operationsChain);

  let cursor: any = null;
  let result: any = null;

  for (const op of operations) {
    const { method, args } = op;

    // Verificar read-only para operações de escrita
    const writeOperations = ["insertOne", "insertMany", "updateOne", "updateMany", "deleteOne", "deleteMany"];
    if (isReadOnly() && writeOperations.includes(method)) {
      throw new Error(
        `Operação '${method}' não permitida.\n\n` +
        "Aplicação em modo somente leitura (READ_ONLY=true).\n" +
        "Apenas operações de leitura são permitidas: find, findOne, countDocuments, distinct"
      );
    }

    // Operações que iniciam cursor
    if (method === "find") {
      const findArg = args[0] || {};
      cursor = collection.find(findArg);
    }
    // Operações que modificam cursor
    else if (cursor && (method === "sort" || method === "limit" || method === "skip")) {
      if (method === "sort") {
        const sortArg = args[0] || {};
        cursor = cursor.sort(sortArg);
      } else if (method === "limit") {
        const limitArg = args[0] || 50;
        cursor = cursor.limit(typeof limitArg === "number" ? limitArg : parseInt(limitArg));
      } else if (method === "skip") {
        const skipArg = args[0] || 0;
        cursor = cursor.skip(typeof skipArg === "number" ? skipArg : parseInt(skipArg));
      }
    }
    // Operações diretas (não encadeáveis)
    else {
      return await executeSingleOperation(collection, method, args);
    }
  }

  // Se temos um cursor, executar toArray()
  if (cursor) {
    const documents = await cursor.toArray();
    return {
      documents: documents.map(serializeDocument),
      count: documents.length,
    };
  }

  return result;
}

/**
 * Parse cadeia de operações encadeadas
 * Exemplo: "find({ status: 'ativo' }).sort({ idade: -1 }).limit(10)"
 * Retorna: [{ method: "find", args: [...] }, { method: "sort", args: [...] }, ...]
 */
function parseOperationChain(chain: string): Array<{ method: string; args: any[] }> {
  const operations: Array<{ method: string; args: any[] }> = [];
  
  // Regex para capturar método(argumentos)
  const operationRegex = /([a-zA-Z0-9_]+)\(([^()]*|\{[^}]*\})*\)/g;
  let match;

  // Usar um approach mais robusto - encontrar cada método e seus argumentos
  let remaining = chain;
  
  while (remaining.length > 0) {
    // Encontrar próximo método
    const methodMatch = remaining.match(/^([a-zA-Z0-9_]+)\(/);
    if (!methodMatch) break;
    
    const method = methodMatch[1];
    let argsStart = method.length + 1; // Após "método("
    
    // Encontrar o fechamento correspondente do parênteses
    let parenDepth = 1;
    let bracketDepth = 0;
    let braceDepth = 0;
    let i = argsStart;
    let inString = false;
    let stringChar = "";
    
    while (i < remaining.length && parenDepth > 0) {
      const char = remaining[i];
      const prevChar = i > 0 ? remaining[i - 1] : "";
      
      // Detectar strings
      if ((char === '"' || char === "'") && prevChar !== "\\") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === "(") parenDepth++;
        if (char === ")") parenDepth--;
        if (char === "[") bracketDepth++;
        if (char === "]") bracketDepth--;
        if (char === "{") braceDepth++;
        if (char === "}") braceDepth--;
      }
      
      i++;
    }
    
    const argsStr = remaining.substring(argsStart, i - 1);
    
    // Parse argumentos
    let args: any[] = [];
    if (argsStr.trim()) {
      try {
        // Se começa com [, é um array - não dividir em argumentos múltiplos
        if (argsStr.trim().startsWith('[')) {
          const sanitized = sanitizeMongoJSON(argsStr);
          const parsed = JSON.parse(sanitized);
          args = [parsed]; // Array completo é um único argumento
        } else {
          args = parseMongoArgs(argsStr);
        }
        args = args.map((arg) => convertObjectIds(arg));
      } catch (error: any) {
        throw new Error(`Erro ao parsear argumentos de ${method}(): ${error.message}`);
      }
    }
    
    operations.push({ method, args });
    
    // Avançar para próxima operação
    remaining = remaining.substring(i).trim();
    if (remaining.startsWith(".")) {
      remaining = remaining.substring(1).trim();
    }
  }
  
  return operations;
}

/**
 * Executa uma operação única (não encadeada)
 */
async function executeSingleOperation(
  collection: any,
  operation: string,
  args: any[]
): Promise<any> {

  switch (operation) {
    case "find":
      const findArg = args[0] || {};
      const findResult = await collection.find(findArg).limit(50).toArray();
      return {
        documents: findResult.map(serializeDocument),
        count: findResult.length,
        note: findResult.length === 50 ? "⚠️ Limitado a 50 documentos" : undefined,
      };

    case "findOne":
      const findOneArg = args[0] || {};
      const findOneResult = await collection.findOne(findOneArg);
      return findOneResult ? serializeDocument(findOneResult) : null;

    case "aggregate":
      const pipeline = args[0];
      if (!pipeline || !Array.isArray(pipeline)) {
        throw new Error("aggregate() requer um array de stages. Ex: [{ $match: {...} }, { $group: {...} }]");
      }
      const aggregateResult = await collection.aggregate(pipeline).toArray();
      return {
        documents: aggregateResult.map(serializeDocument),
        count: aggregateResult.length,
      };

    case "insertOne":
      const insertDoc = args[0];
      if (!insertDoc) throw new Error("insertOne() requer um documento");
      const insertResult = await collection.insertOne(insertDoc);
      return {
        acknowledged: insertResult.acknowledged,
        insertedId: insertResult.insertedId.toString(),
      };

    case "insertMany":
      const insertDocs = args[0];
      if (!insertDocs || !Array.isArray(insertDocs)) throw new Error("insertMany() requer um array de documentos");
      const insertManyResult = await collection.insertMany(insertDocs);
      return {
        acknowledged: insertManyResult.acknowledged,
        insertedCount: insertManyResult.insertedCount,
        insertedIds: Object.values(insertManyResult.insertedIds).map((id: any) =>
          id.toString()
        ),
      };

    case "updateOne":
      const updateFilter = args[0];
      const updateDoc = args[1];
      if (!updateFilter || !updateDoc) {
        throw new Error("updateOne() requer 2 argumentos: filtro e update. Ex: {id: 1}, {$set: {name: 'New'}}");
      }
      const updateOneResult = await collection.updateOne(updateFilter, updateDoc);
      return {
        acknowledged: updateOneResult.acknowledged,
        matchedCount: updateOneResult.matchedCount,
        modifiedCount: updateOneResult.modifiedCount,
      };

    case "updateMany":
      const updateManyFilter = args[0];
      const updateManyDoc = args[1];
      if (!updateManyFilter || !updateManyDoc) {
        throw new Error("updateMany() requer 2 argumentos: filtro e update");
      }
      const updateManyResult = await collection.updateMany(updateManyFilter, updateManyDoc);
      return {
        acknowledged: updateManyResult.acknowledged,
        matchedCount: updateManyResult.matchedCount,
        modifiedCount: updateManyResult.modifiedCount,
      };

    case "deleteOne":
      const deleteOneArg = args[0] || {};
      const deleteOneResult = await collection.deleteOne(deleteOneArg);
      return {
        acknowledged: deleteOneResult.acknowledged,
        deletedCount: deleteOneResult.deletedCount,
      };

    case "deleteMany":
      const deleteManyArg = args[0] || {};
      const deleteManyResult = await collection.deleteMany(deleteManyArg);
      return {
        acknowledged: deleteManyResult.acknowledged,
        deletedCount: deleteManyResult.deletedCount,
      };

    case "countDocuments":
      const countArg = args[0] || {};
      const count = await collection.countDocuments(countArg);
      return count;

    case "distinct":
      const distinctField = args[0];
      if (!distinctField) throw new Error("distinct() requer um campo");
      const distinctResult = await collection.distinct(distinctField);
      return distinctResult;

    default:
      throw new Error(
        `Operação '${operation}' não suportada.\n\n` +
        "Operações disponíveis:\n" +
        "  • find, findOne\n" +
        "  • aggregate (com pipeline)\n" +
        "  • insertOne, insertMany\n" +
        "  • updateOne, updateMany\n" +
        "  • deleteOne, deleteMany\n" +
        "  • countDocuments, distinct\n" +
        "  • Chaining: find().sort().limit()"
      );
  }
}

/**
 * Converte recursivamente markers de ObjectId para ObjectId reais
 */
function convertObjectIds(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Se é um marker de ObjectId { $oid: "..." }
  if (obj.$oid && typeof obj.$oid === "string") {
    try {
      return new ObjectId(obj.$oid);
    } catch {
      return obj;
    }
  }

  // Se é um array
  if (Array.isArray(obj)) {
    return obj.map((item) => convertObjectIds(item));
  }

  // Se é um objeto
  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertObjectIds(obj[key]);
    }
    return converted;
  }

  return obj;
}

// Serializar documento para JSON (converter ObjectId)
function serializeDocument(doc: any): any {
  if (!doc) return doc;
  
  const serialized: any = {};
  for (const key in doc) {
    if (doc[key] instanceof ObjectId) {
      serialized[key] = doc[key].toString();
    } else if (typeof doc[key] === "object" && doc[key] !== null) {
      serialized[key] = serializeDocument(doc[key]);
    } else {
      serialized[key] = doc[key];
    }
  }
  return serialized;
}

// Formatar bytes para formato legível
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

