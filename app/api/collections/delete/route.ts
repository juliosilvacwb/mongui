import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * DELETE - Deletar collection
 * 
 * ATENÇÃO: Esta operação é IRREVERSÍVEL e deleta TODOS os documentos da collection!
 */
export async function DELETE(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de deletar collection em modo read-only");
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
    const confirmation = searchParams.get("confirmation");

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Nome do database e collection são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar confirmação
    if (!confirmation || confirmation !== collectionName) {
      return NextResponse.json(
        {
          success: false,
          error: "Confirmação inválida. Digite o nome da collection para confirmar a exclusão.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    // Verificar se collection existe
    const existingCollections = await db.listCollections({ name: collectionName }).toArray();
    if (existingCollections.length === 0) {
      return NextResponse.json(
        { success: false, error: `Collection '${collectionName}' não foi encontrada no database '${dbName}'` },
        { status: 404 }
      );
    }

    // Deletar collection (IRREVERSÍVEL!)
    await db.collection(collectionName).drop();

    logger.warn(`Collection DELETADA: ${dbName}.${collectionName}`);

    return NextResponse.json({
      success: true,
      data: {
        dbName,
        collectionName,
        message: `Collection '${collectionName}' deletada com sucesso`,
      },
    });
  } catch (error: any) {
    logger.error("Erro ao deletar collection", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

