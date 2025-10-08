import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

// Interface para as opções da coleção
interface CollectionOptions {
  validator?: any;
  validationLevel?: string;
  validationAction?: string;
}

// Interface para informações da coleção
interface CollectionInfoWithOptions {
  name: string;
  type: string;
  options?: CollectionOptions;
}

// GET - Obter schema de validação de uma coleção
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database and collection are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Buscar informações da coleção incluindo validação
    const collectionInfo = await db.listCollections({ name: collectionName }).toArray();
    
    if (collectionInfo.length === 0) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 }
      );
    }

    const info = collectionInfo[0] as CollectionInfoWithOptions;
    const hasValidation = info.options?.validator !== undefined;
    
    return NextResponse.json({
      success: true,
      data: {
        hasValidation,
        validator: info.options?.validator || null,
        validationLevel: info.options?.validationLevel || "strict",
        validationAction: info.options?.validationAction || "error",
      },
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
