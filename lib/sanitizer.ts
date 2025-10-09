/**
 * Sanitizer - Sanitização de documentos MongoDB
 * Substitui dados sensíveis por valores fictícios mantendo estrutura e tipos
 */

import { logger } from "./logger";

/**
 * Sanitizar strings baseado no nome do campo e formato
 */
function sanitizeStringField(fieldName: string, value: string): string {
  const lowerField = fieldName.toLowerCase();
  
  // Email
  if (lowerField.includes('email') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "usuario@example.com";
  }
  
  // Senha/Token/Secret
  if (lowerField.includes('password') || lowerField.includes('token') || lowerField.includes('secret') || lowerField.includes('key')) {
    return "***REDACTED***";
  }
  
  // Telefone
  if (lowerField.includes('phone') || lowerField.includes('tel') || lowerField.includes('celular') || /^\+?[\d\s\-()]+$/.test(value)) {
    return "+55 11 98765-4321";
  }
  
  // CPF/CNPJ
  if (lowerField.includes('cpf')) {
    return "123.456.789-00";
  }
  if (lowerField.includes('cnpj')) {
    return "12.345.678/0001-90";
  }
  
  // RG/Documentos
  if (lowerField.includes('rg') || lowerField.includes('documento')) {
    return "12.345.678-9";
  }
  
  // Endereço
  if (lowerField.includes('address') || lowerField.includes('endereco') || lowerField.includes('rua') || lowerField.includes('street')) {
    return "Rua Exemplo, 123";
  }
  
  // Cidade
  if (lowerField.includes('city') || lowerField.includes('cidade')) {
    return "São Paulo";
  }
  
  // Estado
  if (lowerField.includes('state') || lowerField.includes('estado') || lowerField.includes('uf')) {
    return "SP";
  }
  
  // CEP
  if (lowerField.includes('cep') || lowerField.includes('zipcode') || lowerField.includes('postal')) {
    return "01234-567";
  }
  
  // País
  if (lowerField.includes('country') || lowerField.includes('pais')) {
    return "Brasil";
  }
  
  // Nome
  if (lowerField.includes('name') || lowerField.includes('nome')) {
    return "Usuario Exemplo";
  }
  
  // Sobrenome
  if (lowerField.includes('lastname') || lowerField.includes('sobrenome') || lowerField.includes('surname')) {
    return "da Silva";
  }
  
  // URL
  if (lowerField.includes('url') || lowerField.includes('link') || lowerField.includes('website') || value.startsWith('http')) {
    return "https://example.com/resource";
  }
  
  // IP Address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
    return "192.168.1.1";
  }
  
  // ISO Date String
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return "2024-01-15T10:30:00.000Z";
  }
  
  // UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return "550e8400-e29b-41d4-a716-446655440000";
  }
  
  // Descrição/Comentário (campos longos)
  if (lowerField.includes('description') || lowerField.includes('descricao') || lowerField.includes('comment') || lowerField.includes('obs')) {
    if (value.length > 100) {
      return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Exemplo de texto longo para demonstração.";
    }
    return "Texto de exemplo";
  }
  
  // Status/Enum (valores curtos e simples - geralmente são enums, manter)
  if (value.length < 20 && /^[a-z_\-]+$/i.test(value)) {
    return value; // Provavelmente enum ou status, manter
  }
  
  // String genérica - manter tamanho similar
  if (value.length === 0) {
    return "";
  } else if (value.length < 10) {
    return "texto";
  } else if (value.length < 50) {
    return "Texto de exemplo médio";
  } else if (value.length < 200) {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Exemplo de texto longo.";
  } else {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
  }
}

/**
 * Sanitizar documento individual (recursivo)
 */
function sanitizeDocument(doc: any, depth: number = 0): any {
  // Limitar profundidade para evitar recursão infinita
  if (depth > 5) {
    return '<nested object>';
  }
  
  // Lidar com null/undefined
  if (doc === null) return null;
  if (doc === undefined) return undefined;
  
  // Arrays
  if (Array.isArray(doc)) {
    // Sanitizar apenas primeiro item como exemplo (reduzir tamanho)
    if (doc.length === 0) return [];
    return [sanitizeDocument(doc[0], depth + 1)];
  }
  
  // Datas
  if (doc instanceof Date) {
    return "2024-01-15T10:30:00.000Z";
  }
  
  // ObjectId do MongoDB (várias formas de representação)
  if (doc?._bsontype === 'ObjectID' || doc?.constructor?.name === 'ObjectId') {
    return { $oid: "507f1f77bcf86cd799439011" };
  }
  
  // Objeto simples com $oid (serialização JSON do ObjectId)
  if (doc?.$oid && typeof doc.$oid === 'string') {
    return { $oid: "507f1f77bcf86cd799439011" };
  }
  
  // Objetos
  if (typeof doc === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(doc)) {
      // _id especial - sempre trocar por fictício
      if (key === '_id') {
        if (typeof value === 'string') {
          sanitized[key] = "507f1f77bcf86cd799439011";
        } else if (value && typeof value === 'object') {
          sanitized[key] = { $oid: "507f1f77bcf86cd799439011" };
        } else {
          sanitized[key] = value;
        }
        continue;
      }
      
      // Recursão para objetos/arrays aninhados
      if (value && typeof value === 'object') {
        sanitized[key] = sanitizeDocument(value, depth + 1);
        continue;
      }
      
      // Strings - detectar padrões
      if (typeof value === 'string') {
        sanitized[key] = sanitizeStringField(key, value);
        continue;
      }
      
      // Números
      if (typeof value === 'number') {
        // Manter inteiros como 42, decimais como 3.14
        sanitized[key] = Number.isInteger(value) ? 42 : 3.14;
        continue;
      }
      
      // Booleanos - manter como true
      if (typeof value === 'boolean') {
        sanitized[key] = true;
        continue;
      }
      
      // Outros tipos (passar adiante)
      sanitized[key] = value;
    }
    
    return sanitized;
  }
  
  // Primitivos - retornar como está
  return doc;
}

/**
 * Sanitizar array de documentos para envio à IA
 * Remove dados sensíveis substituindo por valores fictícios
 * 
 * @param documents - Array de documentos do MongoDB
 * @returns Array com documento(s) sanitizado(s)
 */
export function sanitizeDocuments(documents: any[]): any[] {
  if (!documents || documents.length === 0) {
    return [];
  }
  
  try {
    // Sanitizar apenas o primeiro documento como exemplo
    // (não precisa enviar múltiplos exemplos - economiza tokens e mantém segurança)
    const sanitized = sanitizeDocument(documents[0]);
    
    logger.info(`Documento sanitizado com sucesso (${Object.keys(sanitized).length} campos)`);
    
    return [sanitized];
  } catch (error: any) {
    logger.error("Erro ao sanitizar documentos:", error);
    // Em caso de erro, retornar array vazio (seguro)
    return [];
  }
}

/**
 * Verificar se um valor parece ser sensível
 * Útil para logging e debugging
 */
export function isSensitiveField(fieldName: string): boolean {
  const lowerField = fieldName.toLowerCase();
  const sensitivePatterns = [
    'password', 'senha', 'token', 'secret', 'key',
    'cpf', 'cnpj', 'rg', 'ssn',
    'credit', 'card', 'cartao',
    'bank', 'banco', 'account', 'conta'
  ];
  
  return sensitivePatterns.some(pattern => lowerField.includes(pattern));
}

