/**
 * AI Helper
 * Funções auxiliares para integração completa da IA
 */

import { logger } from "./logger";
import { sanitizeDocuments } from "./sanitizer";

/**
 * Buscar contexto completo para sugestão de comando
 */
export async function fetchFullContext(
  dbName: string,
  collectionName: string
): Promise<{
  schema: any;
  indexes: any[];
  availableCollections: string[];
  sampleDocuments: any[];
  fieldAnalysis: any;
}> {
  try {
    const response = await fetch(
      `/api/collections/analyze-schema?db=${dbName}&collection=${collectionName}&sampleSize=50`
    );
    const result = await response.json();

    if (result.success) {
      return {
        schema: result.data.validationSchema,
        indexes: result.data.indexes || [],
        availableCollections: result.data.availableCollections || [],
        sampleDocuments: sanitizeDocuments(result.data.sampleDocuments || []),
        fieldAnalysis: result.data.fieldAnalysis || {},
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    logger.error("Erro ao buscar contexto:", error);
    throw error;
  }
}

/**
 * Gerar comando MongoDB usando IA
 */
export async function requestAICommand(
  prompt: string,
  database: string,
  collection: string,
  context?: {
    schema?: any;
    indexes?: any[];
    availableCollections?: string[];
    sampleDocuments?: any[];
  }
): Promise<{
  command: string;
  explanation: string;
  performanceTip?: string;
  warning?: string;
}> {
  try {
    // Se contexto não foi fornecido, buscar
    let fullContext = context;
    if (!fullContext) {
      fullContext = await fetchFullContext(database, collection);
    }

    const response = await fetch("/api/ai/suggest-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        database,
        collection,
        schema: fullContext.schema,
        indexes: fullContext.indexes,
        availableCollections: fullContext.availableCollections,
        sampleDocuments: sanitizeDocuments(fullContext.sampleDocuments || []),
      }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    logger.error("Erro ao solicitar comando da IA:", error);
    throw error;
  }
}

/**
 * Formatador de erro de IA para mensagens amigáveis
 */
export function formatAIError(error: any): string {
  const message = error.message || String(error);

  if (message.includes("IA não configurada")) {
    return "⚙️ Configure uma API key (OpenAI ou Groq) no arquivo .env.local para usar IA";
  }

  if (message.includes("API key inválida")) {
    return "🔑 API key inválida. Verifique se copiou corretamente (OpenAI começa com sk-, Groq com gsk_)";
  }

  if (message.includes("rate limit") || message.includes("429")) {
    return "⏱️ Limite de requisições atingido. Aguarde alguns instantes e tente novamente";
  }

  if (message.includes("timeout") || message.includes("timed out")) {
    return "⏰ Timeout ao gerar comando. Tente um prompt mais simples ou tente novamente";
  }

  if (message.includes("Insufficient credits") || message.includes("quota")) {
    return "💳 Créditos insuficientes na sua conta OpenAI. Adicione créditos em platform.openai.com";
  }

  return `❌ Erro: ${message}`;
}
