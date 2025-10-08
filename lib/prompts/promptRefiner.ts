/**
 * Prompt Refiner
 * Refinamento e análise inteligente de prompts do usuário
 */

import { suggestOperationType } from "../contextBuilder";

/**
 * Analisar prompt e extrair informações estruturadas
 */
export interface PromptAnalysis {
  originalPrompt: string;
  operationType: string;
  mentionedFields: string[];
  mentionedValues: string[];
  hasTimeReference: boolean;
  hasComparison: boolean;
  hasAggregation: boolean;
  hasJoin: boolean;
  confidence: number;
  suggestions: string[];
}

/**
 * Analisar prompt do usuário em profundidade
 */
export function analyzePrompt(prompt: string, availableFields?: string[]): PromptAnalysis {
  const lowerPrompt = prompt.toLowerCase();
  const words = prompt.split(/\s+/);
  
  // Detectar tipo de operação
  const operationType = suggestOperationType(prompt);
  
  // Extrair campos mencionados
  const mentionedFields: string[] = [];
  if (availableFields) {
    availableFields.forEach(field => {
      if (lowerPrompt.includes(field.toLowerCase())) {
        mentionedFields.push(field);
      }
    });
  }
  
  // Extrair valores mencionados (números, strings entre aspas)
  const mentionedValues: string[] = [];
  const numberMatches = prompt.match(/\b\d+\b/g);
  if (numberMatches) {
    mentionedValues.push(...numberMatches);
  }
  
  const stringMatches = prompt.match(/"([^"]+)"|'([^']+)'/g);
  if (stringMatches) {
    mentionedValues.push(...stringMatches);
  }
  
  // Detectar referências temporais
  const timeKeywords = ["dia", "dias", "mês", "meses", "ano", "anos", "hora", "horas", 
                        "semana", "semanas", "hoje", "ontem", "últim", "day", "month", 
                        "year", "week", "last", "recent"];
  const hasTimeReference = timeKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Detectar comparações
  const comparisonKeywords = ["maior", "menor", "igual", "diferente", "entre", "acima", 
                              "abaixo", "greater", "less", "equal", "between", ">", "<"];
  const hasComparison = comparisonKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Detectar agregação
  const aggregationKeywords = ["contar", "somar", "média", "total", "agrupar", "count", 
                                "sum", "average", "group", "top"];
  const hasAggregation = aggregationKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Detectar join
  const joinKeywords = ["com", "junto", "incluir", "relacionado", "with", "join", "include"];
  const hasJoin = joinKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Calcular confiança baseado em palavras-chave claras
  let confidence = 50; // Base
  if (operationType !== "unknown") confidence += 20;
  if (mentionedFields.length > 0) confidence += 15;
  if (hasComparison || hasAggregation) confidence += 10;
  if (mentionedValues.length > 0) confidence += 5;
  
  // Gerar sugestões de refinamento
  const suggestions: string[] = [];
  if (mentionedFields.length === 0 && availableFields && availableFields.length > 0) {
    suggestions.push("Considere mencionar campos específicos como: " + availableFields.slice(0, 3).join(", "));
  }
  if (operationType === "unknown") {
    suggestions.push("Tente ser mais específico sobre o que deseja fazer (buscar, contar, atualizar, etc)");
  }
  
  return {
    originalPrompt: prompt,
    operationType,
    mentionedFields,
    mentionedValues,
    hasTimeReference,
    hasComparison,
    hasAggregation,
    hasJoin,
    confidence: Math.min(confidence, 95),
    suggestions,
  };
}

/**
 * Refinar prompt baseado na análise
 */
export function refinePrompt(prompt: string, analysis: PromptAnalysis): string {
  let refined = prompt;
  
  // Adicionar contexto de tempo se detectado
  if (analysis.hasTimeReference && !refined.includes("Date")) {
    refined += " (considere usar campos de data disponíveis)";
  }
  
  // Adicionar sugestão de ordenação para buscas
  if (analysis.operationType === "find" && !refined.toLowerCase().includes("ordem")) {
    refined += " (ordenar por relevância se aplicável)";
  }
  
  // Adicionar sugestão de limite para agregações grandes
  if (analysis.hasAggregation && !refined.toLowerCase().includes("limit")) {
    refined += " (limitar resultados se necessário)";
  }
  
  return refined;
}

/**
 * Gerar dicas baseadas no prompt
 */
export function generatePromptTips(analysis: PromptAnalysis): string[] {
  const tips: string[] = [];
  
  if (analysis.confidence < 70) {
    tips.push("💡 Tente ser mais específico para melhores resultados");
  }
  
  if (analysis.hasTimeReference) {
    tips.push("📅 Certifique-se de que a collection tem campos de data");
  }
  
  if (analysis.hasJoin) {
    tips.push("🔗 Joins usando $lookup podem ser lentos em collections grandes");
  }
  
  if (analysis.operationType === "delete") {
    tips.push("⚠️ Comandos de exclusão são irreversíveis - tenha cuidado!");
  }
  
  if (analysis.hasAggregation) {
    tips.push("📊 Agregações complexas podem ser lentas - considere índices apropriados");
  }
  
  return tips;
}

/**
 * Validar se prompt faz sentido no contexto
 */
export function validatePromptContext(
  prompt: string, 
  context: { availableFields?: string[]; collection?: string }
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // Verificar se menciona collection incorreta
  if (context.collection && lowerPrompt.includes("collection")) {
    const words = prompt.split(/\s+/);
    const collectionMentioned = words.find(w => 
      w.toLowerCase() !== context.collection?.toLowerCase() && 
      w.length > 3
    );
    if (collectionMentioned) {
      issues.push(`Você está na collection '${context.collection}'. Tem certeza que quer buscar em outra?`);
    }
  }
  
  // Verificar campos mencionados existem
  if (context.availableFields && context.availableFields.length > 0) {
    const analysis = analyzePrompt(prompt, context.availableFields);
    if (analysis.mentionedFields.length === 0 && prompt.length > 10) {
      issues.push("Nenhum campo conhecido foi mencionado. A IA vai tentar inferir baseado no contexto.");
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
