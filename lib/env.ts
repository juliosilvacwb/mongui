/**
 * Environment Variables Validation
 * Valida e exporta variáveis de ambiente com type safety
 */

export interface EnvConfig {
  mongoUri: string;
  readOnly: boolean;
  nodeEnv: string;
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

  // Log de configuração (apenas em desenvolvimento)
  if (nodeEnv === "development") {
    console.log("✅ Variáveis de ambiente validadas:");
    console.log(`   - MONGODB_URI: ${uri.substring(0, 30)}...`);
    console.log(`   - READ_ONLY: ${readOnly}`);
    console.log(`   - NODE_ENV: ${nodeEnv}`);
  }

  return {
    mongoUri: uri,
    readOnly,
    nodeEnv,
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

// Validar na importação (apenas no servidor e não durante o build)
if (typeof window === "undefined" && process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    validateEnv();
  } catch (error) {
    console.error("\n" + (error as Error).message + "\n");
    // Não lançar erro aqui para permitir que Next.js mostre a página de erro
  }
}

