import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * DELETE - Deletar database completo
 * 
 * ATENÇÃO: Esta operação é IRREVERSÍVEL e deleta TODOS os dados do database!
 */
export async function DELETE(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de deletar database em modo read-only");
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
    const confirmation = searchParams.get("confirmation");

    if (!dbName) {
      return NextResponse.json(
        { success: false, error: "Nome do database é obrigatório" },
        { status: 400 }
      );
    }

    // Validar confirmação
    if (!confirmation || confirmation !== dbName) {
      return NextResponse.json(
        {
          success: false,
          error: "Confirmação inválida. Digite o nome do database para confirmar a exclusão.",
        },
        { status: 400 }
      );
    }

    // Proteção: não permitir deletar databases do sistema
    const systemDatabases = ["admin", "local", "config"];
    if (systemDatabases.includes(dbName.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Database '${dbName}' é um database do sistema e não pode ser deletado.`,
        },
        { status: 403 }
      );
    }

    const client = await clientPromise;

    // Verificar se database existe
    const adminDb = client.db("admin");
    const existingDbs = await adminDb.admin().listDatabases();
    const dbExists = existingDbs.databases.some((db: any) => db.name === dbName);

    if (!dbExists) {
      return NextResponse.json(
        { success: false, error: `Database '${dbName}' não foi encontrado` },
        { status: 404 }
      );
    }

    // Deletar database (IRREVERSÍVEL!)
    await client.db(dbName).dropDatabase();

    logger.warn(`Database DELETADO: ${dbName}`);

    return NextResponse.json({
      success: true,
      data: { dbName, message: `Database '${dbName}' deletado com sucesso` },
    });
  } catch (error: any) {
    logger.error("Erro ao deletar database", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

