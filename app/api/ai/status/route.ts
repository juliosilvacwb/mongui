import { NextResponse } from "next/server";
import { isAIEnabled, getAIProvider, validateAIApiKey, getAIApiKey } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * GET - Verificar status da configuração de IA
 * Retorna se IA está habilitada e qual provedor está ativo
 */
export async function GET() {
  try {
    const enabled = isAIEnabled();
    const provider = getAIProvider();
    const apiKey = getAIApiKey();

    // Se não há provedor configurado
    if (!provider || !apiKey) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          provider: null,
          message: "Nenhuma API key de IA configurada. Adicione OPENAI_API_KEY ou GROQ_API_KEY no arquivo .env.local"
        }
      });
    }

    // Validar formato da API key
    const isValidKey = validateAIApiKey(provider, apiKey);
    
    if (!isValidKey) {
      logger.warn(`API key de ${provider} tem formato inválido`);
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          provider: provider,
          message: `API key de ${provider} está configurada mas tem formato inválido. Verifique se começou com ${provider === 'openai' ? 'sk-' : 'gsk_'}`
        }
      });
    }

    // Tudo OK
    logger.info(`IA habilitada com provedor: ${provider}`);
    return NextResponse.json({
      success: true,
      data: {
        enabled: true,
        provider: provider,
        message: `IA habilitada com ${provider === 'openai' ? 'OpenAI' : 'Groq'}`,
        model: provider === 'openai' 
          ? (process.env.AI_MODEL || 'gpt-4o-mini')
          : (process.env.AI_MODEL || 'llama-3.1-70b-versatile')
      }
    });
  } catch (error: any) {
    logger.error("Erro ao verificar status da IA:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
