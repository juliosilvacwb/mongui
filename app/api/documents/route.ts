import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";
import { EJSON } from "bson";

// Função auxiliar para converter Extended JSON em objetos MongoDB nativos
function parseExtendedJSON(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Se for array, processar cada item
  if (Array.isArray(obj)) {
    return obj.map(item => parseExtendedJSON(item));
  }

  // Se não for objeto, retornar como está
  if (typeof obj !== 'object') {
    return obj;
  }

  // Detectar e converter tipos Extended JSON
  // $date
  if (obj.$date !== undefined) {
    if (typeof obj.$date === 'string') {
      return new Date(obj.$date);
    }
    if (obj.$date.$numberLong !== undefined) {
      return new Date(parseInt(obj.$date.$numberLong));
    }
    return new Date(obj.$date);
  }

  // $oid (ObjectId)
  if (obj.$oid !== undefined) {
    return new ObjectId(obj.$oid);
  }

  // $numberInt
  if (obj.$numberInt !== undefined) {
    return parseInt(obj.$numberInt);
  }

  // $numberLong
  if (obj.$numberLong !== undefined) {
    return parseInt(obj.$numberLong);
  }

  // $numberDouble
  if (obj.$numberDouble !== undefined) {
    return parseFloat(obj.$numberDouble);
  }

  // $numberDecimal
  if (obj.$numberDecimal !== undefined) {
    return parseFloat(obj.$numberDecimal);
  }

  // Se for objeto normal, processar recursivamente todas as propriedades
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = parseExtendedJSON(value);
  }
  return result;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");
    const pageParam = searchParams.get("page") || "0";
    const pageSizeParam = searchParams.get("pageSize") || "25";

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database and collection are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const page = parseInt(pageParam, 10);
    const pageSize = parseInt(pageSizeParam, 10);
    const skip = page * pageSize;
    
    // Buscar documentos da página atual e contar o total
    const [documents, totalCount] = await Promise.all([
      collection.find({}).skip(skip).limit(pageSize).toArray(),
      collection.countDocuments({})
    ]);

    // Converter ObjectId para string para serialização JSON
    const serializedDocs = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedDocs,
      totalCount: totalCount,
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

// POST - Criar novo documento(s)
export async function POST(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de criar documento em modo read-only");
    return NextResponse.json(
      {
        success: false,
        error: "Aplicação em modo somente leitura (READ_ONLY=true). Operações de escrita não são permitidas.",
      },
      { status: 403 }
    );
  }

  const startTime = Date.now();
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

    // Converter Extended JSON para tipos nativos do MongoDB
    const parsedDocument = parseExtendedJSON(document);

    // Detectar se é um array ou objeto único
    if (Array.isArray(parsedDocument)) {
      // Inserir múltiplos documentos
      const result = await collection.insertMany(parsedDocument);
      return NextResponse.json({
        success: true,
        data: { 
          insertedCount: result.insertedCount,
          insertedIds: Object.values(result.insertedIds).map((id: any) => id.toString())
        },
      });
    } else {
      // Inserir documento único
      const result = await collection.insertOne(parsedDocument);
      return NextResponse.json({
        success: true,
        data: { insertedId: result.insertedId.toString() },
      });
    }
  } catch (error: any) {
    // Tratar erros de validação de schema (código 121)
    if (error.code === 121) {
      const validationError = error.errInfo?.details?.schemaRulesNotSatisfied || [];
      const friendlyMessage = formatValidationError(validationError);
      
      return NextResponse.json(
        {
          success: false,
          error: `Erro de validação: ${friendlyMessage}`,
          validationError: true,
          details: validationError,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para formatar erros de validação
function formatValidationError(rules: any[]): string {
  if (!rules || rules.length === 0) {
    return "O documento não atende aos requisitos de validação da coleção.";
  }

  const messages: string[] = [];
  
  for (const rule of rules) {
    const operatorName = rule.operatorName;
    const properties = rule.propertiesNotSatisfied || [];
    const missing = rule.missingProperties || [];
    
    if (operatorName === "properties" && properties.length > 0) {
      for (const prop of properties) {
        const propName = prop.propertyName;
        const reason = prop.description || formatPropertyError(prop);
        messages.push(`Campo '${propName}': ${reason}`);
      }
    }
    
    if (missing.length > 0) {
      messages.push(`Campos obrigatórios ausentes: ${missing.join(", ")}`);
    }
    
    if (operatorName === "bsonType" && rule.consideredType) {
      messages.push(`Tipo inválido. Esperado: ${rule.specifiedAs?.bsonType}, Recebido: ${rule.consideredType}`);
    }
  }
  
  return messages.length > 0 ? messages.join("; ") : "Falha na validação do schema.";
}

function formatPropertyError(prop: any): string {
  if (prop.operatorName === "bsonType") {
    return `tipo esperado '${prop.specifiedAs?.bsonType}', mas recebeu '${prop.consideredValue !== undefined ? typeof prop.consideredValue : "undefined"}'`;
  }
  
  if (prop.operatorName === "pattern") {
    return `deve corresponder ao padrão: ${prop.specifiedAs?.pattern}`;
  }
  
  if (prop.operatorName === "minimum") {
    return `deve ser no mínimo ${prop.specifiedAs?.minimum}`;
  }
  
  if (prop.operatorName === "maximum") {
    return `deve ser no máximo ${prop.specifiedAs?.maximum}`;
  }
  
  if (prop.operatorName === "enum") {
    return `deve ser um dos valores: ${prop.specifiedAs?.enum?.join(", ")}`;
  }
  
  return prop.reason || "validação falhou";
}

// PUT - Atualizar documento
export async function PUT(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de atualizar documento em modo read-only");
    return NextResponse.json(
      {
        success: false,
        error: "Aplicação em modo somente leitura (READ_ONLY=true). Operações de escrita não são permitidas.",
      },
      { status: 403 }
    );
  }

  const startTime = Date.now();
  try {
    const body = await request.json();
    const { db: dbName, collection: collectionName, id, document } = body;

    if (!dbName || !collectionName || !id || !document) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Converter Extended JSON para tipos nativos do MongoDB
    const parsedDocument = parseExtendedJSON(document);

    // Remover _id do documento de atualização se presente
    const { _id, ...updateDoc } = parsedDocument;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    return NextResponse.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error: any) {
    // Tratar erros de validação de schema (código 121)
    if (error.code === 121) {
      const validationError = error.errInfo?.details?.schemaRulesNotSatisfied || [];
      const friendlyMessage = formatValidationError(validationError);
      
      return NextResponse.json(
        {
          success: false,
          error: `Erro de validação: ${friendlyMessage}`,
          validationError: true,
          details: validationError,
        },
        { status: 400 }
      );
    }
    
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
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de deletar documento em modo read-only");
    return NextResponse.json(
      {
        success: false,
        error: "Aplicação em modo somente leitura (READ_ONLY=true). Operações de escrita não são permitidas.",
      },
      { status: 403 }
    );
  }

  const startTime = Date.now();
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
