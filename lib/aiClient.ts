/**
 * AI Client usando LangChain
 * Cliente unificado para OpenAI e Groq
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getAIProvider, getAIApiKey } from "./env";
import { getAIConfig, MONGODB_DBA_SYSTEM_PROMPT } from "./aiConfig";
import { logger } from "./logger";

/**
 * Criar instância do modelo de chat LangChain
 */
export function createChatModel(): ChatOpenAI | null {
  const provider = getAIProvider();
  const apiKey = getAIApiKey();

  if (!provider || !apiKey) {
    logger.warn("IA não configurada - nenhuma API key encontrada");
    return null;
  }

  const config = getAIConfig(provider);

  try {
    const chatModel = new ChatOpenAI({
      modelName: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      timeout: config.timeout,
      openAIApiKey: apiKey,
      ...(provider === 'groq' && {
        configuration: {
          baseURL: "https://api.groq.com/openai/v1",
        }
      })
    });

    logger.info(`Chat model criado: ${provider} - ${config.model}`);
    return chatModel;
  } catch (error: any) {
    logger.error(`Erro ao criar chat model:`, error);
    return null;
  }
}

/**
 * Interface para sugestão de comando
 */
export interface CommandSuggestion {
  command: string;
  explanation: string;
  performanceTip?: string;
  warning?: string;
}

/**
 * Interface para contexto da sugestão
 */
export interface SuggestionContext {
  database: string;
  collection: string;
  schema?: any;
  indexes?: any[];
  availableCollections?: string[];
  sampleDocuments?: any[];
}

/**
 * Gerar sugestão de comando MongoDB usando IA
 */
export async function generateMongoCommand(
  userPrompt: string,
  context: SuggestionContext
): Promise<CommandSuggestion> {
  const chatModel = createChatModel();

  if (!chatModel) {
    throw new Error("IA não configurada. Configure OPENAI_API_KEY ou GROQ_API_KEY no .env.local");
  }

  try {
    // Construir contexto detalhado
    const contextMessage = buildContextMessage(context);
    
    // Construir prompt do usuário
    const userMessage = `
SOLICITAÇÃO DO USUÁRIO:
${userPrompt}

Por favor, gere um comando MongoDB adequado para essa solicitação, considerando o contexto fornecido.
Responda APENAS com um objeto JSON válido no formato especificado no system prompt.
`;

    logger.info(`Gerando comando para prompt: "${userPrompt}"`);

    // Invocar modelo
    const messages = [
      new SystemMessage(MONGODB_DBA_SYSTEM_PROMPT + "\n\n" + contextMessage),
      new HumanMessage(userMessage)
    ];

    const response = await chatModel.invoke(messages);
    const content = response.content.toString();

    // Parse da resposta
    const suggestion = parseAIResponse(content);
    
    logger.info(`Comando gerado com sucesso: ${suggestion.command.substring(0, 50)}...`);
    
    return suggestion;
  } catch (error: any) {
    logger.error("Erro ao gerar comando:", error);
    throw new Error(`Erro ao gerar comando: ${error.message}`);
  }
}

/**
 * Construir mensagem de contexto para a IA
 */
function buildContextMessage(context: SuggestionContext): string {
  let message = `
CONTEXTO DA SOLICITAÇÃO:

Database: ${context.database}
Collection: ${context.collection}
`;

  // Schema da coleção
  if (context.schema) {
    message += `\nSCHEMA DE VALIDAÇÃO:\n${JSON.stringify(context.schema, null, 2)}\n`;
    
    // Extrair campos do schema
    if (context.schema.$jsonSchema?.properties) {
      const fields = Object.keys(context.schema.$jsonSchema.properties);
      const required = context.schema.$jsonSchema.required || [];
      
      message += `\nCAMPOS DISPONÍVEIS:\n`;
      fields.forEach(field => {
        const prop = context.schema.$jsonSchema.properties[field];
        const isRequired = required.includes(field);
        message += `  - ${field}: ${prop.bsonType || 'any'}${isRequired ? ' (obrigatório)' : ''}`;
        if (prop.description) {
          message += ` - ${prop.description}`;
        }
        message += '\n';
      });
    }
  }

  // Índices disponíveis
  if (context.indexes && context.indexes.length > 0) {
    message += `\nÍNDICES EXISTENTES:\n`;
    context.indexes.forEach(index => {
      const fields = Object.keys(index.key).join(', ');
      message += `  - ${index.name}: [${fields}]`;
      if (index.unique) message += ' (unique)';
      if (index.sparse) message += ' (sparse)';
      message += '\n';
    });
  }

  // Collections disponíveis para joins
  if (context.availableCollections && context.availableCollections.length > 0) {
    message += `\nOUTRAS COLLECTIONS DISPONÍVEIS (para $lookup):\n`;
    context.availableCollections.forEach(coll => {
      message += `  - ${coll}\n`;
    });
  }

  // Documentos de exemplo
  if (context.sampleDocuments && context.sampleDocuments.length > 0) {
    message += `\nEXEMPLO DE DOCUMENTO:\n${JSON.stringify(context.sampleDocuments[0], null, 2)}\n`;
  }

  return message;
}

/**
 * Parse da resposta da IA
 */
function parseAIResponse(content: string): CommandSuggestion {
  try {
    // Tentar extrair JSON da resposta
    // A IA pode retornar JSON puro ou envolvido em markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validar campos obrigatórios
    if (!parsed.command) {
      throw new Error("Resposta da IA não contém campo 'command'");
    }

    if (!parsed.explanation) {
      throw new Error("Resposta da IA não contém campo 'explanation'");
    }

    return {
      command: parsed.command,
      explanation: parsed.explanation,
      performanceTip: parsed.performanceTip || parsed.performance_tip,
      warning: parsed.warning,
    };
  } catch (error: any) {
    logger.error("Erro ao parsear resposta da IA:", error);
    logger.error("Conteúdo recebido:", content);
    
    // Fallback: tentar extrair informação útil da resposta
    throw new Error(`Erro ao processar resposta da IA: ${error.message}`);
  }
}

/**
 * Validar comando MongoDB gerado
 */
export function validateMongoCommand(command: string): { valid: boolean; error?: string } {
  if (!command || command.trim() === '') {
    return { valid: false, error: "Comando vazio" };
  }

  // Verificar se começa com padrão válido
  const validPatterns = [
    /^db\./,                    // db.collection ou db.database
    /^show\s+/,                 // show dbs, show collections
    /^use\s+/,                  // use database
  ];

  const isValid = validPatterns.some(pattern => pattern.test(command.trim()));

  if (!isValid) {
    return { 
      valid: false, 
      error: "Comando não parece ser um comando MongoDB válido" 
    };
  }

  // Verificar comandos muito perigosos
  const dangerousPatterns = [
    /\.drop\(\)/,
    /\.dropDatabase\(\)/,
    /dropIndexes\(\)/,
  ];

  const isDangerous = dangerousPatterns.some(pattern => pattern.test(command));

  if (isDangerous) {
    return {
      valid: true,
      error: "⚠️ ATENÇÃO: Comando potencialmente destrutivo detectado"
    };
  }

  return { valid: true };
}
