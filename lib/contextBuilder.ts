/**
 * Context Builder
 * Constrói contexto rico e estruturado para a IA
 */

import { SuggestionContext } from "./aiClient";
import { analyzePrompt, selectScenarioPrompt } from "./prompts/promptRefiner";

/**
 * Construir descrição detalhada do schema em linguagem natural
 */
export function describeSchema(schema: any): string {
  if (!schema || !schema.$jsonSchema) {
    return "Schema de validação não definido.";
  }

  const jsonSchema = schema.$jsonSchema;
  let description = "ESTRUTURA DA COLLECTION:\n\n";

  // Campos obrigatórios
  if (jsonSchema.required && jsonSchema.required.length > 0) {
    description += `Campos OBRIGATÓRIOS: ${jsonSchema.required.join(", ")}\n\n`;
  }

  // Propriedades
  if (jsonSchema.properties) {
    description += "CAMPOS E TIPOS:\n";
    for (const [field, prop] of Object.entries<any>(jsonSchema.properties)) {
      description += `  • ${field}: ${prop.bsonType || "any"}`;
      
      if (prop.enum) {
        description += ` (valores: ${prop.enum.join(", ")})`;
      }
      
      if (prop.minimum !== undefined || prop.maximum !== undefined) {
        description += " (";
        if (prop.minimum !== undefined) description += `min: ${prop.minimum}`;
        if (prop.minimum !== undefined && prop.maximum !== undefined) description += ", ";
        if (prop.maximum !== undefined) description += `max: ${prop.maximum}`;
        description += ")";
      }
      
      if (prop.description) {
        description += ` - ${prop.description}`;
      }
      
      description += "\n";
    }
  }

  return description;
}

/**
 * Descrever índices em linguagem natural
 */
export function describeIndexes(indexes: any[]): string {
  if (!indexes || indexes.length === 0) {
    return "Nenhum índice configurado.";
  }

  let description = `ÍNDICES (${indexes.length} total):\n`;
  
  for (const index of indexes) {
    const fields = Object.entries(index.key)
      .map(([field, order]) => {
        if (order === 1) return `${field} (crescente)`;
        if (order === -1) return `${field} (decrescente)`;
        return `${field} (${order})`;
      })
      .join(", ");
    
    description += `  • ${index.name}: [${fields}]`;
    
    const properties = [];
    if (index.unique) properties.push("unique");
    if (index.sparse) properties.push("sparse");
    if (index.partialFilterExpression) properties.push("partial");
    
    if (properties.length > 0) {
      description += ` (${properties.join(", ")})`;
    }
    
    description += "\n";
  }

  return description;
}

/**
 * Formatar análise de campos
 */
export function describeFieldAnalysis(fieldAnalysis: Record<string, any>): string {
  if (!fieldAnalysis || Object.keys(fieldAnalysis).length === 0) {
    return "Nenhum campo analisado.";
  }

  let description = "ANÁLISE DOS CAMPOS (baseado em documentos reais):\n";
  
  const sortedFields = Object.entries(fieldAnalysis)
    .sort(([, a], [, b]) => (b.appearanceRate || 0) - (a.appearanceRate || 0));

  for (const [field, info] of sortedFields) {
    if (field === "_id") continue; // Pular _id
    
    description += `  • ${field}: ${info.primaryType || info.types[0]}`;
    description += ` (presente em ${info.appearanceRate}% dos docs)`;
    
    if (info.examples && info.examples.length > 0) {
      const example = info.examples[0];
      let exampleStr = "";
      
      if (typeof example === "string" && example.length > 30) {
        exampleStr = example.substring(0, 30) + "...";
      } else if (typeof example === "object") {
        exampleStr = "[object]";
      } else {
        exampleStr = String(example);
      }
      
      description += ` (ex: ${exampleStr})`;
    }
    
    description += "\n";
  }

  return description;
}

/**
 * Descrever collections disponíveis
 */
export function describeAvailableCollections(collections: string[]): string {
  if (!collections || collections.length === 0) {
    return "Nenhuma outra collection disponível para joins.";
  }

  return `COLLECTIONS DISPONÍVEIS para $lookup:\n  ${collections.join(", ")}`;
}

/**
 * Construir contexto completo estruturado para a IA com análise de prompt
 */
export function buildFullContextWithAnalysis(
  context: SuggestionContext,
  userPrompt: string
): string {
  // Extrair campos disponíveis
  const availableFields: string[] = [];
  
  if (context.schema?.$jsonSchema?.properties) {
    availableFields.push(...Object.keys(context.schema.$jsonSchema.properties));
  } else if (context.sampleDocuments && context.sampleDocuments.length > 0) {
    const firstDoc = context.sampleDocuments[0];
    availableFields.push(...Object.keys(firstDoc).filter(k => k !== '_id'));
  }
  
  // Analisar prompt do usuário
  const promptAnalysis = analyzePrompt(userPrompt, availableFields);
  
  // Selecionar dicas de cenário
  const scenarioPrompts = selectScenarioPrompt(
    promptAnalysis.operationType,
    promptAnalysis.hasTimeReference,
    promptAnalysis.hasComparison,
    promptAnalysis.hasAggregation,
    promptAnalysis.hasJoin
  );
  
  // Construir contexto base
  let fullContext = buildFullContext(context);
  
  // Adicionar análise do prompt
  if (promptAnalysis.mentionedFields.length > 0) {
    fullContext += "\n───────────────────────────────────────────────────────\n";
    fullContext += `CAMPOS MENCIONADOS NO PROMPT: ${promptAnalysis.mentionedFields.join(", ")}\n`;
  }
  
  // Adicionar dicas de cenário
  if (scenarioPrompts) {
    fullContext += "\n───────────────────────────────────────────────────────\n";
    fullContext += "DICAS PARA ESTE CENÁRIO:\n";
    fullContext += scenarioPrompts;
  }
  
  return fullContext;
}

/**
 * Construir contexto completo estruturado para a IA (versão simples)
 */
export function buildFullContext(context: SuggestionContext): string {
  let fullContext = `
═══════════════════════════════════════════════════════
CONTEXTO DO BANCO DE DADOS
═══════════════════════════════════════════════════════

Database: ${context.database}
Collection Principal: ${context.collection}

`;

  // Schema de validação (se existir)
  if (context.schema) {
    fullContext += "───────────────────────────────────────────────────────\n";
    fullContext += describeSchema(context.schema);
    fullContext += "\n";
  }

  // Análise de campos (se disponível)
  if (context.sampleDocuments && context.sampleDocuments.length > 0) {
    // Extrair todos os campos dos documentos de exemplo
    const allFields = new Set<string>();
    context.sampleDocuments.forEach(doc => {
      Object.keys(doc).forEach(key => allFields.add(key));
    });
    
    if (allFields.size > 0 && !context.schema) {
      fullContext += "───────────────────────────────────────────────────────\n";
      fullContext += "CAMPOS ENCONTRADOS NOS DOCUMENTOS:\n";
      fullContext += `  ${Array.from(allFields).join(", ")}\n\n`;
    }
  }

  // Índices
  if (context.indexes && context.indexes.length > 0) {
    fullContext += "───────────────────────────────────────────────────────\n";
    fullContext += describeIndexes(context.indexes);
    fullContext += "\n";
  }

  // Collections disponíveis
  if (context.availableCollections && context.availableCollections.length > 0) {
    fullContext += "───────────────────────────────────────────────────────\n";
    fullContext += describeAvailableCollections(context.availableCollections);
    fullContext += "\n";
  }

  // Documento de exemplo
  if (context.sampleDocuments && context.sampleDocuments.length > 0) {
    fullContext += "───────────────────────────────────────────────────────\n";
    fullContext += "EXEMPLO DE DOCUMENTO:\n";
    fullContext += JSON.stringify(context.sampleDocuments[0], null, 2);
    fullContext += "\n";
  }

  fullContext += "═══════════════════════════════════════════════════════\n";

  return fullContext;
}

/**
 * Extrair campos mencionados no prompt do usuário
 */
export function extractMentionedFields(prompt: string): string[] {
  const words = prompt.toLowerCase().split(/\s+/);
  const potentialFields = words.filter(word => 
    word.length > 2 && 
    !["the", "and", "or", "com", "por", "para", "que", "dos", "das"].includes(word)
  );
  return potentialFields;
}

/**
 * Sugerir tipo de operação baseado no prompt
 */
export function suggestOperationType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Busca/consulta
  if (
    lowerPrompt.includes("buscar") || 
    lowerPrompt.includes("encontrar") || 
    lowerPrompt.includes("listar") ||
    lowerPrompt.includes("mostrar") ||
    lowerPrompt.includes("find") ||
    lowerPrompt.includes("search")
  ) {
    return "find";
  }

  // Agregação
  if (
    lowerPrompt.includes("contar") ||
    lowerPrompt.includes("agrupar") ||
    lowerPrompt.includes("somar") ||
    lowerPrompt.includes("média") ||
    lowerPrompt.includes("count") ||
    lowerPrompt.includes("group") ||
    lowerPrompt.includes("aggregate")
  ) {
    return "aggregate";
  }

  // Inserção
  if (
    lowerPrompt.includes("inserir") ||
    lowerPrompt.includes("adicionar") ||
    lowerPrompt.includes("criar") ||
    lowerPrompt.includes("insert") ||
    lowerPrompt.includes("add")
  ) {
    return "insert";
  }

  // Atualização
  if (
    lowerPrompt.includes("atualizar") ||
    lowerPrompt.includes("modificar") ||
    lowerPrompt.includes("alterar") ||
    lowerPrompt.includes("update") ||
    lowerPrompt.includes("modify")
  ) {
    return "update";
  }

  // Exclusão
  if (
    lowerPrompt.includes("deletar") ||
    lowerPrompt.includes("remover") ||
    lowerPrompt.includes("excluir") ||
    lowerPrompt.includes("delete") ||
    lowerPrompt.includes("remove")
  ) {
    return "delete";
  }

  return "unknown";
}
