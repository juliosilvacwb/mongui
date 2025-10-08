import { NextResponse } from "next/server";
import { isAIEnabled } from "@/lib/env";
import { generateMongoCommand, validateMongoCommand } from "@/lib/aiClient";
import { logger } from "@/lib/logger";
import { commandCache, generateCacheKey, simpleHash } from "@/lib/aiCache";

/**
 * POST - Gerar sugestão de comando MongoDB usando IA
 */
export async function POST(request: Request) {
  try {
    // Verificar se IA está habilitada
    if (!isAIEnabled()) {
      return NextResponse.json(
        { 
          success: false, 
          error: "IA não configurada. Configure OPENAI_API_KEY ou GROQ_API_KEY no .env.local" 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      prompt, 
      database, 
      collection, 
      schema, 
      indexes,
      availableCollections,
      sampleDocuments 
    } = body;

    // Validar campos obrigatórios
    if (!prompt || !database || !collection) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Campos obrigatórios: prompt, database, collection" 
        },
        { status: 400 }
      );
    }

    // Verificar cache (comandos similares podem ser reutilizados)
    const promptHash = simpleHash(prompt.toLowerCase().trim());
    const cacheKey = generateCacheKey("command", database, collection, promptHash);
    const cached = commandCache.get(cacheKey);
    
    if (cached) {
      logger.info(`Comando retornado do cache para: "${prompt}"`);
      return NextResponse.json({
        success: true,
        data: { ...cached, fromCache: true }
      });
    }

    logger.info(`Gerando comando para: "${prompt}" em ${database}.${collection}`);

    // Gerar comando usando IA
    const suggestion = await generateMongoCommand(prompt, {
      database,
      collection,
      schema,
      indexes,
      availableCollections,
      sampleDocuments,
    });

    // Validar comando gerado
    const validation = validateMongoCommand(suggestion.command);
    
    if (!validation.valid) {
      logger.warn(`Comando gerado é inválido: ${validation.error}`);
      return NextResponse.json({
        success: false,
        error: `Comando gerado é inválido: ${validation.error}`,
        suggestion: suggestion, // Retornar mesmo assim para debug
      }, { status: 400 });
    }

    // Se há warning de validação, incluir na resposta
    if (validation.error) {
      suggestion.warning = validation.error;
    }

    logger.info(`Comando gerado com sucesso: ${suggestion.command}`);

    // Salvar no cache
    commandCache.set(cacheKey, suggestion);

    return NextResponse.json({
      success: true,
      data: suggestion,
    });
  } catch (error: any) {
    logger.error("Erro ao gerar sugestão:", error);
    
    // Tratamento de erros específicos
    let errorMessage = error.message;
    
    // Erros de API key
    if (error.message.includes("API key")) {
      errorMessage = "API key inválida. Verifique sua configuração.";
    }
    
    // Erros de rate limit
    if (error.message.includes("rate limit") || error.message.includes("429")) {
      errorMessage = "Limite de requisições atingido. Aguarde alguns instantes e tente novamente.";
    }
    
    // Erros de timeout
    if (error.message.includes("timeout") || error.message.includes("timed out")) {
      errorMessage = "Timeout ao gerar comando. Tente novamente com um prompt mais simples.";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
