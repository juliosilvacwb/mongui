/**
 * Scenario-Specific Prompts
 * Prompts especializados para cenários específicos de uso
 */

/**
 * Prompts para cenários de busca avançada
 */
export const ADVANCED_SEARCH_SCENARIOS = {
  textSearch: `
Para busca de texto:
- Use $regex para busca parcial: { campo: { $regex: "termo", $options: "i" } }
- Use $text para full-text search se houver índice de texto
- Cuidado: $regex sem índice é LENTO em collections grandes
`,

  dateRange: `
Para busca por período/data:
- Use $gte e $lte para ranges: { data: { $gte: inicio, $lte: fim } }
- Use new Date() para data atual
- Para "últimos X dias": new Date(Date.now() - X*24*60*60*1000)
- Sempre adicione índice em campos de data para performance
`,

  arraySearch: `
Para busca em arrays:
- Use $in para verificar se valor está no array
- Use $elemMatch para condições complexas em arrays de objetos
- Use $all para verificar se todos os valores estão presentes
`,

  nestedFields: `
Para campos aninhados:
- Use notação de ponto: { "endereco.cidade": "São Paulo" }
- Para arrays aninhados: use $elemMatch
- Para existência de campo: { campo: { $exists: true } }
`,
};

/**
 * Prompts para agregações complexas
 */
export const AGGREGATION_SCENARIOS = {
  grouping: `
Para agrupamento:
- $group sempre com _id definindo o agrupamento
- Use acumuladores: $sum, $avg, $min, $max, $first, $last, $push
- Exemplo: { $group: { _id: "$campo", total: { $sum: 1 } } }
`,

  filtering: `
Para filtros em agregação:
- $match no INÍCIO para reduzir dados processados
- $match depois de $group para filtrar grupos
- Use $project para limitar campos e reduzir memória
`,

  sorting: `
Para ordenação em agregação:
- $sort pode usar índices se for primeiro ou logo após $match
- Ordene antes de $limit para top N
- Considere memória: sorts grandes podem ser lentos
`,

  lookup: `
Para joins ($lookup):
- Minimize documentos ANTES do lookup (use $match)
- Certifique-se de índices nos campos de join
- Use $unwind se precisar "achatar" o array resultante
- Pipeline lookup para joins mais complexos
`,
};

/**
 * Prompts para operações de escrita
 */
export const WRITE_OPERATION_SCENARIOS = {
  insert: `
Para inserção:
- insertOne() para um documento
- insertMany() para múltiplos (mais eficiente)
- Inclua TODOS os campos obrigatórios do schema
- Use tipos corretos (não envie string onde schema espera number)
- Para dates: new Date() ou new Date("2024-01-15")
`,

  update: `
Para atualização:
- updateOne() para atualizar o primeiro encontrado
- updateMany() para atualizar múltiplos
- Use $set para modificar campos específicos
- Use $inc para incrementar números
- Use $push/$pull para arrays
- SEMPRE adicione filtro específico - NUNCA {}
`,

  delete: `
Para exclusão:
- deleteOne() para remover apenas um documento
- deleteMany() para remover múltiplos
- SEMPRE adicione filtro específico
- NUNCA use {} como filtro (remove tudo)
- Adicione WARNING se for deleteMany
`,
};

/**
 * Prompts para casos especiais
 */
export const SPECIAL_CASE_SCENARIOS = {
  pagination: `
Para paginação:
- Use .skip() e .limit()
- Skip = (página - 1) * tamanhoPágina
- Limit = tamanhoPágina
- CUIDADO: skip é lento em valores grandes
- Alternativa: use _id como cursor para pagination eficiente
`,

  distinct: `
Para valores únicos:
- Use .distinct("campo") para listar valores únicos
- Mais eficiente que aggregate com $group
- Retorna array de valores
`,

  count: `
Para contagem:
- Use .countDocuments(filtro) para contar com filtro
- Use .estimatedDocumentCount() para contagem rápida sem filtro (aproximado)
- countDocuments é mais preciso mas pode ser mais lento
`,

  bulk: `
Para operações em lote:
- Use bulkWrite() para múltiplas operações
- Mais eficiente que múltiplas chamadas individuais
- Suporta insert, update, delete em uma única operação
`,
};

/**
 * Selecionar cenário apropriado baseado na análise
 */
export function selectScenarioPrompt(
  operationType: string,
  hasTimeReference: boolean,
  hasComparison: boolean,
  hasAggregation: boolean,
  hasJoin: boolean
): string {
  let scenarioPrompt = "";
  
  // Adicionar dicas baseadas em características detectadas
  if (hasTimeReference) {
    scenarioPrompt += ADVANCED_SEARCH_SCENARIOS.dateRange;
  }
  
  if (hasComparison) {
    scenarioPrompt += "\n" + ADVANCED_SEARCH_SCENARIOS.textSearch;
  }
  
  if (hasAggregation) {
    scenarioPrompt += "\n" + AGGREGATION_SCENARIOS.grouping;
    scenarioPrompt += "\n" + AGGREGATION_SCENARIOS.filtering;
  }
  
  if (hasJoin) {
    scenarioPrompt += "\n" + AGGREGATION_SCENARIOS.lookup;
  }
  
  // Adicionar dicas do tipo de operação
  switch (operationType) {
    case "insert":
      scenarioPrompt += "\n" + WRITE_OPERATION_SCENARIOS.insert;
      break;
    case "update":
      scenarioPrompt += "\n" + WRITE_OPERATION_SCENARIOS.update;
      break;
    case "delete":
      scenarioPrompt += "\n" + WRITE_OPERATION_SCENARIOS.delete;
      break;
  }
  
  return scenarioPrompt;
}

/**
 * Gerar exemplos contextualizados
 */
export function generateContextualExamples(
  operationType: string,
  collection: string,
  sampleFields: string[]
): string[] {
  const examples: string[] = [];
  const field1 = sampleFields[0] || "campo1";
  const field2 = sampleFields[1] || "campo2";
  
  switch (operationType) {
    case "find":
      examples.push(`db.${collection}.find({ ${field1}: "valor" }).limit(50)`);
      examples.push(`db.${collection}.find({ ${field1}: { $gt: 10 } }).sort({ ${field2}: -1 }).limit(20)`);
      break;
      
    case "aggregate":
      examples.push(`db.${collection}.aggregate([{ $group: { _id: "$${field1}", total: { $sum: 1 } } }])`);
      examples.push(`db.${collection}.aggregate([{ $match: { ${field1}: "valor" } }, { $group: { _id: "$${field2}", count: { $sum: 1 } } }])`);
      break;
      
    case "insert":
      examples.push(`db.${collection}.insertOne({ ${field1}: "valor", ${field2}: 123 })`);
      break;
      
    case "update":
      examples.push(`db.${collection}.updateOne({ ${field1}: "valor" }, { $set: { ${field2}: "novo_valor" } })`);
      break;
      
    case "delete":
      examples.push(`db.${collection}.deleteOne({ ${field1}: "valor" })`);
      break;
  }
  
  return examples;
}

/**
 * Keywords para detecção avançada
 */
export const OPERATION_KEYWORDS = {
  find: [
    "buscar", "encontrar", "listar", "mostrar", "procurar", "ver",
    "find", "search", "list", "show", "get", "retrieve"
  ],
  aggregate: [
    "contar", "agrupar", "somar", "calcular", "média", "total", "estatística",
    "count", "group", "sum", "average", "calculate", "statistics", "top"
  ],
  insert: [
    "inserir", "adicionar", "criar", "novo",
    "insert", "add", "create", "new"
  ],
  update: [
    "atualizar", "modificar", "alterar", "mudar", "editar",
    "update", "modify", "change", "edit", "set"
  ],
  delete: [
    "deletar", "remover", "excluir", "apagar",
    "delete", "remove", "drop"
  ],
  distinct: [
    "únicos", "distintos", "diferentes",
    "unique", "distinct", "different"
  ],
  sort: [
    "ordenar", "ordenação", "ordem",
    "sort", "order"
  ],
};

/**
 * Comparadores para detecção
 */
export const COMPARISON_OPERATORS = {
  greater: ["maior", "acima", "superior", "greater", "above", ">"],
  less: ["menor", "abaixo", "inferior", "less", "below", "<"],
  equal: ["igual", "exatamente", "equal", "exactly", "=", "=="],
  between: ["entre", "between"],
  in: ["em", "dentro", "in"],
  notEqual: ["diferente", "não igual", "different", "not equal", "!="],
};

/**
 * Detectar operador de comparação no prompt
 */
export function detectComparisonOperator(prompt: string): string | null {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [operator, keywords] of Object.entries(COMPARISON_OPERATORS)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      switch (operator) {
        case "greater": return "$gt";
        case "less": return "$lt";
        case "equal": return "$eq";
        case "between": return "$gte,$lte";
        case "in": return "$in";
        case "notEqual": return "$ne";
      }
    }
  }
  
  return null;
}
