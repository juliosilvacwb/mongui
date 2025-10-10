/**
 * JSON Parser for MongoDB Shell
 * Converts relaxed JSON (without quotes on keys) to valid JSON
 * Similar to MongoDB Compass behavior
 * 
 * Suporta:
 * - ObjectId("...") → { $oid: "..." }
 * - ISODate("...") → { $date: "..." }
 * - new Date("...") → { $date: "..." }
 * - new Date(timestamp) → { $date: "..." }
 * - Date.now() → { $date: "..." }
 * - Date.now() - 7*24*60*60*1000 → { $date: "..." }
 * - Chaves sem aspas → chaves com aspas
 */

export function sanitizeMongoJSON(input: string): string {
  if (!input || input.trim() === "") {
    return input;
  }

  let sanitized = input.trim();
  
  // DEBUG: Log do input original
  if (typeof console !== 'undefined' && input.includes('ISODate')) {
    console.log('🔍 [sanitizeMongoJSON] Input original:', input);
  }

  // PASSO 0: Proteger funções de data ANTES de qualquer processamento
  // Isso garante que ISODate, new Date, etc. sejam capturados corretamente
  
  // PASSO 0A: Proteger ObjectId() temporariamente
  const objectIdPlaceholders: string[] = [];
  sanitized = sanitized.replace(
    /ObjectId\s*\(\s*["']?([a-f0-9]{24})["']?\s*\)/gi,
    (match, id) => {
      const placeholder = `__OBJECTID_${objectIdPlaceholders.length}__`;
      objectIdPlaceholders.push(id);
      return placeholder;
    }
  );

  // PASSO 0B: Proteger ISODate() temporariamente (regex mais robusto)
  const isoDatePlaceholders: string[] = [];
  sanitized = sanitized.replace(
    /ISODate\s*\(\s*["']?([^"')]+)["']?\s*\)/gi,
    (match, dateStr) => {
      const placeholder = `__ISODATE_${isoDatePlaceholders.length}__`;
      isoDatePlaceholders.push(dateStr);
      if (typeof console !== 'undefined') {
        console.log('✅ [ISODate] Capturado:', match, '→', placeholder, '(data:', dateStr + ')');
      }
      return placeholder;
    }
  );

  // PASSO 0C: Proteger new Date() com string temporariamente
  const newDatePlaceholders: string[] = [];
  sanitized = sanitized.replace(
    /new\s+Date\s*\(\s*["']?([^"')]+?)["']?\s*\)/gi,
    (match, content) => {
      // Verificar se é um timestamp numérico ou uma string de data
      if (/^\d+$/.test(content.trim())) {
        const placeholder = `__NEWDATETS_${newDatePlaceholders.length}__`;
        newDatePlaceholders.push(content.trim());
        return placeholder;
      } else {
        const placeholder = `__NEWDATE_${newDatePlaceholders.length}__`;
        newDatePlaceholders.push(content);
        return placeholder;
      }
    }
  );

  // PASSO 0D: Proteger Date.now() em cálculos PRIMEIRO (ex: Date.now() - 7*24*60*60*1000)
  const dateCalcPlaceholders: string[] = [];
  sanitized = sanitized.replace(
    /Date\.now\s*\(\s*\)\s*([\+\-\*\/])\s*([\d\+\-\*\/\(\)\s]+)/gi,
    (match) => {
      const placeholder = `__DATECALC_${dateCalcPlaceholders.length}__`;
      dateCalcPlaceholders.push(match);
      return placeholder;
    }
  );

  // PASSO 0E: Proteger Date.now() sozinho
  sanitized = sanitized.replace(
    /Date\.now\s*\(\s*\)/gi,
    () => {
      return `__DATENOW__`;
    }
  );

  // PASSO 1: Tratar aspas simples como aspas duplas (comum em JS)
  sanitized = sanitized.replace(/'/g, '"');

  // PASSO 2: Substituir chaves sem aspas por chaves com aspas
  // Exemplo: { name: "João" } → { "name": "João" }
  // Exemplo: { $gt: 18 } → { "$gt": 18 }
  // Mas não adicionar aspas em placeholders
  sanitized = sanitized.replace(
    /([{,\[])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    (match, before, key) => {
      // Não adicionar aspas se for um placeholder
      if (key.startsWith('__')) {
        return match;
      }
      return `${before}"${key}":`;
    }
  );

  // PASSO 3: Restaurar placeholders com marcadores especiais Extended JSON
  
  // 3A: Restaurar ObjectId
  objectIdPlaceholders.forEach((id, index) => {
    const placeholder = `__OBJECTID_${index}__`;
    const replacement = `{"$oid":"${id}"}`;
    // Tentar com e sem aspas
    sanitized = sanitized.replace(new RegExp(`"${placeholder}"`, 'g'), replacement);
    sanitized = sanitized.replace(new RegExp(placeholder, 'g'), replacement);
  });

  // 3B: Restaurar ISODate
  isoDatePlaceholders.forEach((dateStr, index) => {
    const placeholder = `__ISODATE_${index}__`;
    const replacement = `{"$date":"${dateStr}"}`;
    // Tentar com e sem aspas
    sanitized = sanitized.replace(new RegExp(`"${placeholder}"`, 'g'), replacement);
    sanitized = sanitized.replace(new RegExp(placeholder, 'g'), replacement);
    if (typeof console !== 'undefined') {
      console.log('🔄 [ISODate] Restaurado:', placeholder, '→', replacement);
    }
  });

  // 3C: Restaurar new Date() com string
  newDatePlaceholders.forEach((dateStr, index) => {
    const placeholder = `__NEWDATE_${index}__`;
    const replacement = `{"$date":"${dateStr}"}`;
    // Tentar com e sem aspas
    sanitized = sanitized.replace(new RegExp(`"${placeholder}"`, 'g'), replacement);
    sanitized = sanitized.replace(new RegExp(placeholder, 'g'), replacement);
  });

  // 3D: Restaurar new Date(timestamp)
  newDatePlaceholders.forEach((timestamp, index) => {
    const placeholder = `__NEWDATETS_${index}__`;
    // Converter timestamp para ISOString
    const dateStr = new Date(parseInt(timestamp)).toISOString();
    const replacement = `{"$date":"${dateStr}"}`;
    // Tentar com e sem aspas
    sanitized = sanitized.replace(new RegExp(`"${placeholder}"`, 'g'), replacement);
    sanitized = sanitized.replace(new RegExp(placeholder, 'g'), replacement);
  });

  // 3E: Restaurar Date.now()
  const nowTimestamp = Date.now();
  const nowISOString = new Date(nowTimestamp).toISOString();
  const nowReplacement = `{"$date":"${nowISOString}"}`;
  sanitized = sanitized.replace(new RegExp(`"__DATENOW__"`, 'g'), nowReplacement);
  sanitized = sanitized.replace(new RegExp(`__DATENOW__`, 'g'), nowReplacement);

  // 3F: Restaurar cálculos com Date.now()
  dateCalcPlaceholders.forEach((calc, index) => {
    const placeholder = `__DATECALC_${index}__`;
    try {
      // Avaliar a expressão (seguro porque já foi capturado com regex)
      const calcResult = eval(calc.replace(/Date\.now\(\)/g, Date.now().toString()));
      const dateStr = new Date(calcResult).toISOString();
      const replacement = `{"$date":"${dateStr}"}`;
      // Tentar com e sem aspas
      sanitized = sanitized.replace(new RegExp(`"${placeholder}"`, 'g'), replacement);
      sanitized = sanitized.replace(new RegExp(placeholder, 'g'), replacement);
    } catch (error) {
      // Se falhar, manter como está
      sanitized = sanitized.replace(new RegExp(`"${placeholder}"`, 'g'), `"${calc}"`);
      sanitized = sanitized.replace(new RegExp(placeholder, 'g'), `"${calc}"`);
    }
  });
  
  // DEBUG: Log do resultado final
  if (typeof console !== 'undefined' && input.includes('ISODate')) {
    console.log('✨ [sanitizeMongoJSON] Output final:', sanitized);
  }

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

        // ISODate especial
        const isoDateMatch = trimmed.match(/^ISODate\("([^"]+)"\)$/);
        if (isoDateMatch) {
          return { $date: isoDateMatch[1] };
        }

        // new Date() especial
        const newDateMatch = trimmed.match(/^new\s+Date\("([^"]+)"\)$/);
        if (newDateMatch) {
          return { $date: newDateMatch[1] };
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
