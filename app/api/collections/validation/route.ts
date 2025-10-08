import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

// POST/PUT - Criar ou atualizar validação de schema
export async function POST(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de modificar validação em modo read-only");
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
    const { db: dbName, collection: collectionName, validator, validationLevel, validationAction } = body;

    if (!dbName || !collectionName || !validator) {
      return NextResponse.json(
        { success: false, error: "Database, collection e validator são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Usar collMod para atualizar ou criar validação
    const result = await db.command({
      collMod: collectionName,
      validator: validator,
      validationLevel: validationLevel || "strict",
      validationAction: validationAction || "error"
    });

    logger.info(`Validação atualizada para ${dbName}.${collectionName}`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error("Erro ao atualizar validação:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover validação de schema
export async function DELETE(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de remover validação em modo read-only");
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

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database e collection são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Remover validação usando collMod com validator vazio
    const result = await db.command({
      collMod: collectionName,
      validator: {},
      validationLevel: "off"
    });

    logger.info(`Validação removida de ${dbName}.${collectionName}`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error("Erro ao remover validação:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
