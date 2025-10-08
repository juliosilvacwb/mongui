/**
 * JSON Parser for MongoDB Shell
 * Converts relaxed JSON (without quotes on keys) to valid JSON
 * Similar to MongoDB Compass behavior
 */

export function sanitizeMongoJSON(input: string): string {
  if (!input || input.trim() === "") {
    return input;
  }

  let sanitized = input.trim();

  // PASSO 1: Proteger ObjectId() temporariamente
  const objectIdPlaceholders: string[] = [];
  sanitized = sanitized.replace(
    /ObjectId\s*\(\s*["']([a-f0-9]{24})["']\s*\)/gi,
    (match, id) => {
      const placeholder = `__OBJECTID_${objectIdPlaceholders.length}__`;
      objectIdPlaceholders.push(id);
      return `"${placeholder}"`;
    }
  );

  // PASSO 2: Substituir chaves sem aspas por chaves com aspas
  // Exemplo: { name: "João" } → { "name": "João" }
  // Exemplo: { $gt: 18 } → { "$gt": 18 }
  sanitized = sanitized.replace(
    /([{,\[])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    '$1"$2":'
  );

  // PASSO 3: Tratar aspas simples como aspas duplas (comum em JS)
  // Mas cuidado para não substituir dentro de ObjectId placeholders
  sanitized = sanitized.replace(/'/g, '"');

  // PASSO 4: Restaurar ObjectId placeholders com marcador especial
  objectIdPlaceholders.forEach((id, index) => {
    const placeholder = `"__OBJECTID_${index}__"`;
    const replacement = `{"$oid":"${id}"}`;
    sanitized = sanitized.replace(placeholder, replacement);
  });

  return sanitized;
}

/**
 * Parse argumentos de comandos MongoDB
 * Suporta JSON relaxed e tipos especiais (ObjectId, Date, etc.)
 */
export function parseMongoArgs(argsStr: string): any[] {
  if (!argsStr || argsStr.trim() === "") {
    return [];
  }

  try {
    // Casos especiais
    if (argsStr.trim() === "{}") {
      return [{}];
    }

    // Tentar parsear diretamente primeiro
    try {
      const parsed = JSON.parse(argsStr);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Se falhar, tentar sanitizar
      const sanitized = sanitizeMongoJSON(argsStr);
      const parsed = JSON.parse(sanitized);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (error) {
    // Se ainda falhar, tentar dividir por vírgula no nível superior
    try {
      const args = splitTopLevelArgs(argsStr);
      return args.map((arg) => {
        const trimmed = arg.trim();
        
        // Vazio
        if (trimmed === "") return {};
        
        // Objeto
        if (trimmed.startsWith("{")) {
          const sanitized = sanitizeMongoJSON(trimmed);
          return JSON.parse(sanitized);
        }
        
        // Array
        if (trimmed.startsWith("[")) {
          const sanitized = sanitizeMongoJSON(trimmed);
          return JSON.parse(sanitized);
        }
        
        // String
        if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
          return JSON.parse(trimmed.replace(/'/g, '"'));
        }
        
        // Número
        if (!isNaN(Number(trimmed))) {
          return Number(trimmed);
        }
        
        // Boolean
        if (trimmed === "true") return true;
        if (trimmed === "false") return false;
        if (trimmed === "null") return null;
        
        // ObjectId especial
        const objectIdMatch = trimmed.match(/^ObjectId\("([^"]+)"\)$/);
        if (objectIdMatch) {
          return { $oid: objectIdMatch[1] };
        }
        
        // Padrão: tentar parsear
        const sanitized = sanitizeMongoJSON(trimmed);
        return JSON.parse(sanitized);
      });
    } catch (error: any) {
      throw new Error(`Erro ao parsear argumentos: ${error.message}\n\nArgumentos recebidos: ${argsStr}`);
    }
  }
}

/**
 * Divide argumentos no nível superior (não dentro de objetos/arrays)
 */
function splitTopLevelArgs(argsStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    const prevChar = i > 0 ? argsStr[i - 1] : "";

    // Detectar strings
    if ((char === '"' || char === "'") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    // Ignorar caracteres dentro de strings
    if (inString) {
      current += char;
      continue;
    }

    // Rastrear profundidade de objetos/arrays
    if (char === "{" || char === "[") {
      depth++;
    } else if (char === "}" || char === "]") {
      depth--;
    }

    // Vírgula no nível superior = separador de argumentos
    if (char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Adicionar último argumento
  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}
