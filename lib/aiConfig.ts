/**
 * AI Configuration
 * Configurações para provedores de IA (OpenAI e Groq) usando LangChain
 */

export type AIProvider = 'openai' | 'groq';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  streaming?: boolean;
  timeout?: number;
}

/**
 * Configurações padrão para cada provedor
 */
export const AI_PROVIDER_CONFIGS: Record<AIProvider, AIModelConfig> = {
  openai: {
    provider: 'openai',
    model: process.env.AI_MODEL || 'gpt-4o-mini', // gpt-4o-mini é mais econômico e rápido
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
    streaming: false,
    timeout: 30000, // 30 segundos
  },
  groq: {
    provider: 'groq',
    model: process.env.AI_MODEL || 'llama-3.1-70b-versatile', // Melhor modelo do Groq
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
    streaming: false,
    timeout: 30000, // 30 segundos
  },
};

/**
 * Modelos disponíveis por provedor
 */
export const AVAILABLE_MODELS = {
  openai: [
    'gpt-4o',           // Mais poderoso e recente
    'gpt-4o-mini',      // Rápido e econômico (recomendado)
    'gpt-4-turbo',      // Versão turbo do GPT-4
    'gpt-3.5-turbo',    // Econômico mas menos capaz
  ],
  groq: [
    'llama-3.1-70b-versatile',  // Mais poderoso (recomendado)
    'llama-3.1-8b-instant',     // Mais rápido
    'mixtral-8x7b-32768',       // Alternativa boa
    'gemma2-9b-it',             // Google Gemma
  ],
};

/**
 * Obter configuração do provedor ativo
 */
export function getAIConfig(provider: AIProvider): AIModelConfig {
  return AI_PROVIDER_CONFIGS[provider];
}

// System prompt movido para lib/prompts/mongodbExpert.ts
// Importar de lá quando necessário
export { MONGODB_DBA_SYSTEM_PROMPT } from "./prompts/mongodbExpert";

/**
 * Configurações de rate limiting
 */
export const AI_RATE_LIMITS = {
  requestsPerMinute: 20,
  requestsPerHour: 100,
  maxRetries: 3,
  retryDelay: 1000, // ms
};

/**
 * Timeout para requisições de IA
 */
export const AI_TIMEOUT_MS = 30000; // 30 segundos

/**
 * Obter configuração completa do provedor ativo
 */
export function getActiveAIConfig(): (AIModelConfig & { apiKey: string; baseURL?: string }) | null {
  const provider = process.env.OPENAI_API_KEY ? 'openai' : 
                   process.env.GROQ_API_KEY ? 'groq' : null;
  
  if (!provider) return null;

  const apiKey = provider === 'openai' 
    ? process.env.OPENAI_API_KEY 
    : process.env.GROQ_API_KEY;

  if (!apiKey) return null;

  return {
    ...AI_PROVIDER_CONFIGS[provider],
    apiKey,
    ...(provider === 'groq' && {
      baseURL: 'https://api.groq.com/openai/v1'
    })
  };
}
