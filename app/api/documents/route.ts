import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

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

    // Detectar se é um array ou objeto único
    if (Array.isArray(document)) {
      // Inserir múltiplos documentos
      const result = await collection.insertMany(document);
      return NextResponse.json({
        success: true,
        data: { 
          insertedCount: result.insertedCount,
          insertedIds: Object.values(result.insertedIds).map((id: any) => id.toString())
        },
      });
    } else {
      // Inserir documento único
      const result = await collection.insertOne(document);
      return NextResponse.json({
        success: true,
        data: { insertedId: result.insertedId.toString() },
      });
    }
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
