import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { logger } from "@/lib/logger";

/**
 * GET - Análise completa do schema de uma coleção
 * Retorna schema de validação + análise dos documentos + índices
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");
    const sampleSize = parseInt(searchParams.get("sampleSize") || "100");

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database e collection são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 1. Buscar schema de validação (se existir)
    let validationSchema = null;
    try {
      const collectionInfo = await db.listCollections({ name: collectionName }).toArray();
      if (collectionInfo.length > 0) {
        const info = collectionInfo[0] as any;
        if (info.options?.validator) {
          validationSchema = info.options.validator;
        }
      }
    } catch (error) {
      logger.warn("Não foi possível obter schema de validação:", error);
    }

    // 2. Buscar índices
    let indexes: any[] = [];
    try {
      indexes = await collection.indexes();
    } catch (error) {
      logger.warn("Não foi possível obter índices:", error);
    }

    // 3. Analisar documentos (sample)
    const documents = await collection.find({}).limit(sampleSize).toArray();
    const documentCount = await collection.countDocuments({});

    // 4. Inferir estrutura dos documentos
    const fieldAnalysis = analyzeDocumentStructure(documents);

    // 5. Buscar documentos de exemplo (apenas 3 para não sobrecarregar)
    const sampleDocuments = documents.slice(0, 3).map(doc => {
      const serialized: any = {};
      for (const key in doc) {
        if (key === '_id') {
          serialized[key] = doc[key].toString();
        } else if (doc[key] instanceof Date) {
          serialized[key] = doc[key].toISOString();
        } else {
          serialized[key] = doc[key];
        }
      }
      return serialized;
    });

    // 6. Listar outras collections do database (para sugestões de $lookup)
    let availableCollections: string[] = [];
    try {
      const collections = await db.listCollections().toArray();
      availableCollections = collections
        .map((col: any) => col.name)
        .filter(name => name !== collectionName);
    } catch (error) {
      logger.warn("Não foi possível listar outras collections:", error);
    }

    logger.info(`Schema analisado para ${dbName}.${collectionName}: ${documents.length} documentos, ${Object.keys(fieldAnalysis).length} campos`);

    return NextResponse.json({
      success: true,
      data: {
        database: dbName,
        collection: collectionName,
        validationSchema: validationSchema,
        indexes: indexes,
        fieldAnalysis: fieldAnalysis,
        sampleDocuments: sampleDocuments,
        availableCollections: availableCollections,
        stats: {
          totalDocuments: documentCount,
          analyzedDocuments: documents.length,
          fieldsFound: Object.keys(fieldAnalysis).length,
          indexesCount: indexes.length,
        }
      }
    });
  } catch (error: any) {
    logger.error("Erro ao analisar schema:", error);
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
 * Analisa estrutura dos documentos
 */
function analyzeDocumentStructure(documents: any[]): Record<string, any> {
  const fieldAnalysis: Record<string, {
    type: Set<string>;
    count: number;
    nullCount: number;
    examples: any[];
  }> = {};

  for (const doc of documents) {
    analyzeObject(doc, fieldAnalysis, "");
  }

  // Converter para formato serializável
  const result: Record<string, any> = {};
  for (const [field, analysis] of Object.entries(fieldAnalysis)) {
    const types = Array.from(analysis.type);
    const appearanceRate = (analysis.count / documents.length) * 100;
    
    result[field] = {
      types: types,
      primaryType: types.length === 1 ? types[0] : types[0], // Tipo mais comum
      appearanceRate: Math.round(appearanceRate),
      nullCount: analysis.nullCount,
      examples: analysis.examples.slice(0, 2), // Máximo 2 exemplos
      isCommon: appearanceRate > 80, // Campo aparece em mais de 80% dos docs
    };
  }

  return result;
}

/**
 * Analisa objeto recursivamente
 */
function analyzeObject(
  obj: any,
  analysis: Record<string, any>,
  prefix: string,
  depth: number = 0
) {
  if (depth > 2) return; // Limitar profundidade

  for (const [key, value] of Object.entries(obj)) {
    const fieldName = prefix ? `${prefix}.${key}` : key;

    if (!analysis[fieldName]) {
      analysis[fieldName] = {
        type: new Set<string>(),
        count: 0,
        nullCount: 0,
        examples: []
      };
    }

    analysis[fieldName].count++;

    if (value === null) {
      analysis[fieldName].nullCount++;
      analysis[fieldName].type.add("null");
    } else {
      const type = getValueType(value);
      analysis[fieldName].type.add(type);
      
      // Guardar exemplo (máximo 5)
      if (analysis[fieldName].examples.length < 5) {
        analysis[fieldName].examples.push(value);
      }

      // Analisar objetos aninhados
      if (type === "object" && typeof value === "object" && !Array.isArray(value)) {
        analyzeObject(value, analysis, fieldName, depth + 1);
      }
    }
  }
}

/**
 * Determina tipo de valor
 */
function getValueType(value: any): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  
  const jsType = typeof value;
  
  switch (jsType) {
    case "string":
      return "string";
    case "number":
      return Number.isInteger(value) ? "int" : "double";
    case "boolean":
      return "bool";
    case "object":
      return "object";
    default:
      return "unknown";
  }
}
