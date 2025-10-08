/**
 * Environment Variables Validation
 * Valida e exporta variáveis de ambiente com type safety
 */

export interface EnvConfig {
  mongoUri: string;
  readOnly: boolean;
  nodeEnv: string;
  ai?: {
    provider: 'openai' | 'groq' | null;
    apiKey: string | null;
  };
}

/**
 * Valida as variáveis de ambiente necessárias
 * @throws {Error} Se alguma variável obrigatória estiver faltando
 */
export function validateEnv(): EnvConfig {
  // Validar MONGODB_URI (obrigatória)
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "❌ MONGODB_URI não está definida!\n\n" +
      "Por favor, crie o arquivo .env.local na raiz do projeto com:\n" +
      "MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/\n\n" +
      "Exemplo:\n" +
      "MONGODB_URI=mongodb+srv://admin:senha123@cluster0.mongodb.net/?retryWrites=true&w=majority"
    );
  }

  // Validar formato da URI
  const uri = process.env.MONGODB_URI;
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      "❌ MONGODB_URI inválida!\n\n" +
      "A URI deve começar com 'mongodb://' ou 'mongodb+srv://'\n" +
      `URI atual: ${uri.substring(0, 20)}...`
    );
  }

  // Read-only mode (opcional, padrão: false)
  const readOnly = process.env.READ_ONLY === "true";

  // Node environment
  const nodeEnv = process.env.NODE_ENV || "development";

  // AI Configuration (opcional)
  const aiConfig = detectAIProvider();

  // Log de configuração (apenas em desenvolvimento)
  if (nodeEnv === "development") {
    console.log("✅ Variáveis de ambiente validadas:");
    console.log(`   - MONGODB_URI: ${uri.substring(0, 30)}...`);
    console.log(`   - READ_ONLY: ${readOnly}`);
    console.log(`   - NODE_ENV: ${nodeEnv}`);
    if (aiConfig.provider) {
      console.log(`   - AI_PROVIDER: ${aiConfig.provider}`);
    } else {
      console.log(`   - AI_PROVIDER: não configurado`);
    }
  }

  return {
    mongoUri: uri,
    readOnly,
    nodeEnv,
    ai: aiConfig,
  };
}

/**
 * Retorna se o modo read-only está ativo
 */
export function isReadOnly(): boolean {
  return process.env.READ_ONLY === "true";
}

/**
 * Retorna se está em ambiente de desenvolvimento
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Retorna se está em ambiente de produção
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Detecta qual provedor de IA está configurado
 * Prioridade: OpenAI > Groq
 */
function detectAIProvider(): { provider: 'openai' | 'groq' | null; apiKey: string | null } {
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Priorizar OpenAI se ambos estiverem configurados
  if (openaiKey && openaiKey.trim()) {
    return { provider: 'openai', apiKey: openaiKey };
  }

  if (groqKey && groqKey.trim()) {
    return { provider: 'groq', apiKey: groqKey };
  }

  return { provider: null, apiKey: null };
}

/**
 * Retorna se IA está habilitada
 */
export function isAIEnabled(): boolean {
  const config = detectAIProvider();
  return config.provider !== null && config.apiKey !== null;
}

/**
 * Retorna o provedor de IA ativo
 */
export function getAIProvider(): 'openai' | 'groq' | null {
  return detectAIProvider().provider;
}

/**
 * Retorna a API key do provedor ativo
 */
export function getAIApiKey(): string | null {
  return detectAIProvider().apiKey;
}

/**
 * Valida se a API key tem formato válido
 */
export function validateAIApiKey(provider: 'openai' | 'groq', apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  // OpenAI keys começam com "sk-"
  if (provider === 'openai') {
    return apiKey.startsWith('sk-');
  }

  // Groq keys começam com "gsk_"
  if (provider === 'groq') {
    return apiKey.startsWith('gsk_');
  }

  return false;
}

// Validar na importação (apenas no servidor e não durante o build)
if (typeof window === "undefined" && process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    validateEnv();
  } catch (error) {
    console.error("\n" + (error as Error).message + "\n");
    // Não lançar erro aqui para permitir que Next.js mostre a página de erro
  }
}

