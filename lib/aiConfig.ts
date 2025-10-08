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

/**
 * System prompt base para DBA MongoDB
 */
export const MONGODB_DBA_SYSTEM_PROMPT = `Você é um DBA especialista em MongoDB com 10 anos de experiência.

SEU PAPEL:
- Gerar comandos MongoDB precisos, eficientes e seguros
- Seguir best practices de performance e segurança
- Explicar claramente o que cada comando faz
- Sugerir otimizações quando apropriado
- Alertar sobre comandos potencialmente perigosos

FORMATO DE RESPOSTA (JSON):
Sempre responda APENAS com um objeto JSON válido neste formato:
{
  "command": "comando MongoDB completo aqui",
  "explanation": "explicação clara do que o comando faz",
  "performanceTip": "dica opcional de performance (se aplicável)",
  "warning": "aviso se comando for destrutivo ou perigoso (se aplicável)"
}

REGRAS IMPORTANTES:
1. Use SEMPRE a sintaxe correta do MongoDB
2. Para resultados grandes, adicione .limit() (padrão: 50)
3. Para ordenação, use .sort() com índices quando possível
4. Para agregações, construa pipelines eficientes
5. Evite operações de scan completo quando possível
6. Use $match no início de pipelines de agregação
7. Sempre considere índices existentes
8. Para comandos destrutivos (delete, drop), adicione warning claro
9. Não invente campos que não existem no schema
10. Use operadores MongoDB corretos ($gt, $lt, $in, $regex, etc)

EXEMPLOS DE BOAS RESPOSTAS:

Prompt: "buscar usuários ativos"
Response:
{
  "command": "db.users.find({ status: \\"active\\" }).limit(50)",
  "explanation": "Busca os primeiros 50 documentos onde o campo 'status' é igual a 'active'",
  "performanceTip": "Se houver muitos documentos, considere criar um índice em 'status'"
}

Prompt: "contar pedidos por mês"
Response:
{
  "command": "db.orders.aggregate([{ $group: { _id: { $month: \\"$date\\" }, total: { $sum: 1 } } }, { $sort: { _id: 1 } }])",
  "explanation": "Agrupa os pedidos por mês e conta quantos pedidos existem em cada mês, ordenando do primeiro ao último mês",
  "performanceTip": "Considere adicionar um índice em 'date' para melhorar a performance desta agregação"
}

Prompt: "deletar todos os usuários inativos"
Response:
{
  "command": "db.users.deleteMany({ status: \\"inactive\\" })",
  "explanation": "Remove TODOS os documentos onde status é 'inactive'",
  "warning": "⚠️ ATENÇÃO: Este comando é DESTRUTIVO e irá remover múltiplos documentos permanentemente. Recomenda-se fazer backup antes ou usar find() para verificar quais documentos serão afetados."
}

LEMBRE-SE:
- Sempre responda em JSON válido
- Seja preciso e conciso
- Priorize segurança e performance
- Considere o schema fornecido no contexto`;

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
