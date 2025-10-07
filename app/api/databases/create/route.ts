import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { isReadOnly } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * POST - Criar novo database
 * 
 * MongoDB cria um database automaticamente ao criar uma collection nele.
 * Vamos criar um database com uma collection inicial.
 */
export async function POST(request: Request) {
  // Verificar modo read-only
  if (isReadOnly()) {
    logger.warn("Tentativa de criar database em modo read-only");
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
        { success: false, error: "Nome do database e da collection inicial são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar nome do database (restrições do MongoDB)
    const dbValidation = validateDatabaseName(dbName);
    if (!dbValidation.valid) {
      return NextResponse.json(
        { success: false, error: dbValidation.error },
        { status: 400 }
      );
    }

    // Validar nome da collection
    const collectionValidation = validateCollectionName(collectionName);
    if (!collectionValidation.valid) {
      return NextResponse.json(
        { success: false, error: collectionValidation.error },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    
    // Verificar se database já existe
    const adminDb = client.db("admin");
    const existingDbs = await adminDb.admin().listDatabases();
    const dbExists = existingDbs.databases.some((db: any) => db.name === dbName);

    if (dbExists) {
      return NextResponse.json(
        { success: false, error: `Database '${dbName}' já existe` },
        { status: 409 }
      );
    }

    // MongoDB cria database automaticamente ao criar uma collection
    const db = client.db(dbName);
    await db.createCollection(collectionName);

    logger.info(`Database criado: ${dbName} com collection inicial: ${collectionName}`);

    return NextResponse.json({
      success: true,
      data: { 
        dbName, 
        collectionName,
        message: `Database '${dbName}' criado com collection '${collectionName}'` 
      },
    });
  } catch (error: any) {
    logger.error("Erro ao criar database", error);
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
 * Valida nome do database conforme regras do MongoDB
 * 
 * Restrições:
 * - Não pode conter: / \ . " * < > : | ? $ espaço null
 * - Não pode estar vazio
 * - Max 64 caracteres
 * - Case-sensitive (mas evitar nomes que diferem apenas por case)
 * - Não pode ser: admin, local, config
 */
function validateDatabaseName(name: string): { valid: boolean; error?: string } {
  // Vazio
  if (!name || name.trim() === "") {
    return { valid: false, error: "Nome do database não pode estar vazio" };
  }

  // Tamanho máximo
  if (name.length > 64) {
    return { valid: false, error: "Nome do database não pode ter mais de 64 caracteres" };
  }

  // Nomes reservados
  const reservedNames = ["admin", "local", "config"];
  if (reservedNames.includes(name.toLowerCase())) {
    return { valid: false, error: `Nome '${name}' é reservado pelo MongoDB` };
  }

  // Caracteres inválidos
  const invalidChars = ["/", "\\", ".", '"', "*", "<", ">", ":", "|", "?", "$", " ", "\0"];
  for (const char of invalidChars) {
    if (name.includes(char)) {
      return {
        valid: false,
        error: `Nome do database não pode conter o caractere: '${char === " " ? "espaço" : char}'`,
      };
    }
  }

  // Apenas letras, números, underscores e hífens
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(name)) {
    return {
      valid: false,
      error: "Nome do database deve conter apenas letras, números, underscores (_) e hífens (-)",
    };
  }

  return { valid: true };
}

/**
 * Valida nome da collection conforme regras do MongoDB
 */
function validateCollectionName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === "") {
    return { valid: false, error: "Nome da collection não pode estar vazio" };
  }

  if (name.length > 120) {
    return { valid: false, error: "Nome da collection não pode ter mais de 120 caracteres" };
  }

  if (name.toLowerCase().startsWith("system.")) {
    return {
      valid: false,
      error: "Nome da collection não pode começar com 'system.' (reservado pelo MongoDB)",
    };
  }

  if (name.includes("$")) {
    return {
      valid: false,
      error: "Nome da collection não pode conter o caractere '$'",
    };
  }

  if (name.includes("\0")) {
    return {
      valid: false,
      error: "Nome da collection não pode conter caractere nulo",
    };
  }

  if (name.trim() !== name) {
    return {
      valid: false,
      error: "Nome da collection não pode começar ou terminar com espaço",
    };
  }

  return { valid: true };
}


