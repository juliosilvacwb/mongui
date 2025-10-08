import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

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
  const trimmedCommand = command.trim();

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

  // Se contextDb está definido, aceita: db.<collection>.<operation>(...)
  if (contextDb) {
    const contextPattern = /^db\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_]+)\((.*)\)$/s;
    const contextMatch = trimmedCommand.match(contextPattern);
    if (contextMatch) {
      const [, collectionName, operation, argsStr] = contextMatch;
      const db = client.db(contextDb);
      return await executeOperation(db, collectionName, operation, argsStr.trim());
    }
  }

  // Formato padrão: db.<database>.<collection>.<operation>(...)
  const dbCollectionRegex = /^db\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_]+)\((.*)\)$/s;
  const match = trimmedCommand.match(dbCollectionRegex);

  if (match) {
    const [, dbName, collectionName, operation, argsStr] = match;
    const db = client.db(dbName);

    return await executeOperation(db, collectionName, operation, argsStr.trim());
  }

  const commandsHelp = contextDb 
    ? "Comandos suportados (database: " + contextDb + "):\n" +
      "  • show dbs\n" +
      "  • db.getCollectionNames()\n" +
      "  • db.<collection>.find({})\n" +
      "  • db.<collection>.findOne({})\n" +
      "  • db.<collection>.insertOne({...})\n" +
      "  • db.<collection>.updateOne({}, {...})\n" +
      "  • db.<collection>.deleteOne({})\n" +
      "  • db.<collection>.countDocuments({})"
    : "Comandos suportados:\n" +
      "  • show dbs\n" +
      "  • db.<database>.getCollectionNames()\n" +
      "  • db.<database>.<collection>.find({})\n" +
      "  • db.<database>.<collection>.findOne({})\n" +
      "  • db.<database>.<collection>.insertOne({...})\n" +
      "  • db.<database>.<collection>.updateOne({}, {...})\n" +
      "  • db.<database>.<collection>.deleteOne({})\n" +
      "  • db.<database>.<collection>.countDocuments({})";

  throw new Error("Comando não reconhecido.\n\n" + commandsHelp);
}

async function executeOperation(
  db: any,
  collectionName: string,
  operation: string,
  argsStr: string
): Promise<any> {
  // Verificar read-only para operações de escrita
  const writeOperations = ["insertOne", "insertMany", "updateOne", "updateMany", "deleteOne", "deleteMany"];
  if (isReadOnly() && writeOperations.includes(operation)) {
    throw new Error(
      `Operação '${operation}' não permitida.\n\n` +
      "Aplicação em modo somente leitura (READ_ONLY=true).\n" +
      "Apenas operações de leitura são permitidas: find, findOne, countDocuments, distinct"
    );
  }

  const collection = db.collection(collectionName);

  // Parse argumentos
  let args: any = null;
  if (argsStr) {
    try {
      // Substituir ObjectId() por uma representação que o JSON.parse aceita
      const sanitized = argsStr
        .replace(/ObjectId\("([a-f0-9]+)"\)/gi, '"$1"')
        .replace(/ObjectId\('([a-f0-9]+)'\)/gi, '"$1"');
      
      args = JSON.parse(sanitized);
    } catch (e) {
      throw new Error(`JSON inválido: ${argsStr}\n\nErro: ${(e as Error).message}`);
    }
  }

  switch (operation) {
    case "find":
      const findResult = await collection.find(args || {}).limit(50).toArray();
      return {
        documents: findResult.map(serializeDocument),
        count: findResult.length,
        note: findResult.length === 50 ? "⚠️ Limitado a 50 documentos" : undefined,
      };

    case "findOne":
      const findOneResult = await collection.findOne(args || {});
      return findOneResult ? serializeDocument(findOneResult) : null;

    case "insertOne":
      if (!args) throw new Error("insertOne() requer um documento");
      const insertResult = await collection.insertOne(args);
      return {
        acknowledged: insertResult.acknowledged,
        insertedId: insertResult.insertedId.toString(),
      };

    case "insertMany":
      if (!Array.isArray(args)) throw new Error("insertMany() requer um array de documentos");
      const insertManyResult = await collection.insertMany(args);
      return {
        acknowledged: insertManyResult.acknowledged,
        insertedCount: insertManyResult.insertedCount,
        insertedIds: Object.values(insertManyResult.insertedIds).map((id: any) =>
          id.toString()
        ),
      };

    case "updateOne":
      if (!Array.isArray(args) || args.length < 2) {
        throw new Error("updateOne() requer 2 argumentos: [filter, update]");
      }
      const updateOneResult = await collection.updateOne(args[0], args[1]);
      return {
        acknowledged: updateOneResult.acknowledged,
        matchedCount: updateOneResult.matchedCount,
        modifiedCount: updateOneResult.modifiedCount,
      };

    case "updateMany":
      if (!Array.isArray(args) || args.length < 2) {
        throw new Error("updateMany() requer 2 argumentos: [filter, update]");
      }
      const updateManyResult = await collection.updateMany(args[0], args[1]);
      return {
        acknowledged: updateManyResult.acknowledged,
        matchedCount: updateManyResult.matchedCount,
        modifiedCount: updateManyResult.modifiedCount,
      };

    case "deleteOne":
      if (!args) throw new Error("deleteOne() requer um filtro");
      const deleteOneResult = await collection.deleteOne(args);
      return {
        acknowledged: deleteOneResult.acknowledged,
        deletedCount: deleteOneResult.deletedCount,
      };

    case "deleteMany":
      if (!args) throw new Error("deleteMany() requer um filtro");
      const deleteManyResult = await collection.deleteMany(args);
      return {
        acknowledged: deleteManyResult.acknowledged,
        deletedCount: deleteManyResult.deletedCount,
      };

    case "countDocuments":
      const count = await collection.countDocuments(args || {});
      return { count };

    case "distinct":
      if (!args) throw new Error("distinct() requer um campo");
      const distinctResult = await collection.distinct(args);
      return distinctResult;

    default:
      throw new Error(
        `Operação '${operation}' não suportada.\n\n` +
        "Operações disponíveis:\n" +
        "  • find, findOne\n" +
        "  • insertOne, insertMany\n" +
        "  • updateOne, updateMany\n" +
        "  • deleteOne, deleteMany\n" +
        "  • countDocuments, distinct"
      );
  }
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

