import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * POST - Criar nova collection em um database
 */
export async function POST(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de criar collection em modo read-only");
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
    const { dbName, collectionName } = body;

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Nome do database e collection são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar nome da collection (restrições do MongoDB)
    const validation = validateCollectionName(collectionName);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    // Verificar se collection já existe
    const existingCollections = await db.listCollections({ name: collectionName }).toArray();
    if (existingCollections.length > 0) {
      return NextResponse.json(
        { success: false, error: `Collection '${collectionName}' já existe no database '${dbName}'` },
        { status: 409 }
      );
    }

    // Criar collection
    await db.createCollection(collectionName);

    logger.info(`Collection criada: ${dbName}.${collectionName}`);

    return NextResponse.json({
      success: true,
      data: {
        dbName,
        collectionName,
        message: `Collection '${collectionName}' criada com sucesso em '${dbName}'`,
      },
    });
  } catch (error: any) {
    logger.error("Erro ao criar collection", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Valida nome da collection conforme regras do MongoDB
 * 
 * Restrições:
 * - Não pode começar com "system."
 * - Não pode conter: $ null character
 * - Não pode estar vazio
 * - Max 120 caracteres (considerando namespace completo db.collection)
 * - Namespace completo (db.collection) não pode exceder 120 bytes
 */
function validateCollectionName(name: string): { valid: boolean; error?: string } {
  // Vazio
  if (!name || name.trim() === "") {
    return { valid: false, error: "Nome da collection não pode estar vazio" };
  }

  // Tamanho máximo
  if (name.length > 120) {
    return { valid: false, error: "Nome da collection não pode ter mais de 120 caracteres" };
  }

  // Não pode começar com "system."
  if (name.toLowerCase().startsWith("system.")) {
    return {
      valid: false,
      error: "Nome da collection não pode começar com 'system.' (reservado pelo MongoDB)",
    };
  }

  // Não pode conter $
  if (name.includes("$")) {
    return {
      valid: false,
      error: "Nome da collection não pode conter o caractere '$'",
    };
  }

  // Não pode conter null character
  if (name.includes("\0")) {
    return {
      valid: false,
      error: "Nome da collection não pode conter caractere nulo",
    };
  }

  // Não pode começar ou terminar com espaço
  if (name.trim() !== name) {
    return {
      valid: false,
      error: "Nome da collection não pode começar ou terminar com espaço",
    };
  }

  // Padrão recomendado (apenas letras, números, underscores e hífens)
  const recommendedPattern = /^[a-zA-Z0-9_-]+$/;
  if (!recommendedPattern.test(name)) {
    // Permitir, mas avisar se tiver caracteres especiais
    const hasSpecialChars = /[^a-zA-Z0-9_-]/.test(name);
    if (hasSpecialChars) {
      // Aceitar, mas MongoDB pode ter problemas com alguns caracteres
      logger.warn(`Collection '${name}' contém caracteres especiais (pode causar problemas)`);
    }
  }

  return { valid: true };
}

