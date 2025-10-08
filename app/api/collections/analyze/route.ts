import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

// GET - Analisar documentos da coleção e gerar schema sugerido
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

    // Buscar amostra de documentos
    const documents = await collection.find({}).limit(sampleSize).toArray();

    if (documents.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              required: [],
              properties: {}
            }
          },
          message: "Nenhum documento encontrado. Schema vazio gerado."
        }
      });
    }

    // Analisar campos de todos os documentos
    const fieldAnalysis: Record<string, { types: Set<string>; count: number; samples: any[] }> = {};

    for (const doc of documents) {
      analyzeDocument(doc, fieldAnalysis);
    }

    // Gerar schema baseado na análise
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [field, analysis] of Object.entries(fieldAnalysis)) {
      if (field === "_id") continue; // Pular _id pois é automático

      const types = Array.from(analysis.types);
      const appearanceRate = analysis.count / documents.length;

      // Se o campo aparece em mais de 80% dos documentos, considerar obrigatório
      if (appearanceRate > 0.8) {
        required.push(field);
      }

      // Determinar tipo predominante
      let bsonType = types.length === 1 ? types[0] : "string";
      const property: any = {
        bsonType: bsonType,
        description: `Campo ${field} (aparece em ${Math.round(appearanceRate * 100)}% dos documentos)`
      };

      // Se for string, analisar se há padrões comuns
      if (bsonType === "string" && analysis.samples.length > 0) {
        const sample = analysis.samples[0];
        
        // Detectar email
        if (typeof sample === "string" && sample.includes("@")) {
          property.pattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
          property.description += " (email)";
        }
      }

      // Se for número, calcular min/max
      if ((bsonType === "int" || bsonType === "double" || bsonType === "number") && analysis.samples.length > 0) {
        const numbers = analysis.samples.filter(s => typeof s === "number");
        if (numbers.length > 0) {
          property.minimum = Math.min(...numbers);
          property.maximum = Math.max(...numbers);
        }
      }

      properties[field] = property;
    }

    const validator = {
      $jsonSchema: {
        bsonType: "object",
        required: required,
        properties: properties
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        validator: validator,
        stats: {
          documentsAnalyzed: documents.length,
          fieldsFound: Object.keys(fieldAnalysis).length,
          requiredFields: required.length
        }
      }
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

function analyzeDocument(doc: any, fieldAnalysis: Record<string, any>, prefix = "") {
  for (const [key, value] of Object.entries(doc)) {
    const fieldName = prefix ? `${prefix}.${key}` : key;
    
    if (!fieldAnalysis[fieldName]) {
      fieldAnalysis[fieldName] = {
        types: new Set<string>(),
        count: 0,
        samples: []
      };
    }

    fieldAnalysis[fieldName].count++;
    
    const bsonType = getBsonType(value);
    fieldAnalysis[fieldName].types.add(bsonType);
    
    // Guardar amostra (máximo 5)
    if (fieldAnalysis[fieldName].samples.length < 5) {
      fieldAnalysis[fieldName].samples.push(value);
    }

    // Analisar objetos aninhados (profundidade máxima 2)
    if (bsonType === "object" && value && typeof value === "object" && !Array.isArray(value) && prefix.split(".").length < 2) {
      analyzeDocument(value, fieldAnalysis, fieldName);
    }
  }
}

function getBsonType(value: any): string {
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
      return "string";
  }
}
