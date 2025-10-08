import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

// GET - Listar todos os índices de uma coleção
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database e collection são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Listar todos os índices
    const indexes = await collection.indexes();
    
    logger.info(`Índices listados para ${dbName}.${collectionName}: ${indexes.length} índices encontrados`);
    
    // Obter estatísticas dos índices (opcional, pode falhar em algumas versões)
    let indexSizes = {};
    try {
      const stats = await db.command({ collStats: collectionName });
      indexSizes = stats.indexSizes || {};
    } catch (statsError: any) {
      logger.warn("Não foi possível obter estatísticas dos índices:", statsError.message);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        indexes: indexes,
        totalIndexes: indexes.length,
        indexSizes: indexSizes
      }
    });
  } catch (error: any) {
    logger.error("Erro ao listar índices:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Criar novo índice
export async function POST(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de criar índice em modo read-only");
    return NextResponse.json(
      {
        success: false,
        error: "Aplicação em modo somente leitura (READ_ONLY=true). Operações de escrita não são permitidas.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { db: dbName, collection: collectionName, keys, options } = body;

    if (!dbName || !collectionName || !keys) {
      return NextResponse.json(
        { success: false, error: "Database, collection e keys são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Criar índice
    const indexName = await collection.createIndex(keys, options || {});
    
    logger.info(`Índice criado: ${indexName} em ${dbName}.${collectionName}`);

    return NextResponse.json({
      success: true,
      data: { indexName }
    });
  } catch (error: any) {
    logger.error("Erro ao criar índice:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover índice
export async function DELETE(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de remover índice em modo read-only");
    return NextResponse.json(
      {
        success: false,
        error: "Aplicação em modo somente leitura (READ_ONLY=true). Operações de escrita não são permitidas.",
      },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");
    const indexName = searchParams.get("indexName");

    if (!dbName || !collectionName || !indexName) {
      return NextResponse.json(
        { success: false, error: "Database, collection e indexName são obrigatórios" },
        { status: 400 }
      );
    }

    // Prevenir exclusão do índice _id
    if (indexName === "_id_") {
      return NextResponse.json(
        { success: false, error: "Não é possível remover o índice _id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Remover índice
    await collection.dropIndex(indexName);
    
    logger.info(`Índice removido: ${indexName} de ${dbName}.${collectionName}`);

    return NextResponse.json({
      success: true,
      data: { indexName }
    });
  } catch (error: any) {
    logger.error("Erro ao remover índice:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
