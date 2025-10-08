/**
 * AI Cache
 * Sistema de cache para respostas da IA e contextos
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache simples em memória com TTL
 */
class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000; // Converter para ms
  }

  set(key: string, data: T): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }
}

/**
 * Cache de schemas analisados (5 minutos)
 */
export const schemaCache = new SimpleCache<any>(5);

/**
 * Cache de comandos gerados (10 minutos)
 * Key: hash do prompt + database + collection
 */
export const commandCache = new SimpleCache<any>(10);

/**
 * Gerar chave de cache baseada em múltiplos parâmetros
 */
export function generateCacheKey(...parts: string[]): string {
  return parts.join("::");
}

/**
 * Gerar hash simples de uma string (para keys de cache)
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Limpar todos os caches
 */
export function clearAllCaches(): void {
  schemaCache.clear();
  commandCache.clear();
}

/**
 * Obter estatísticas dos caches
 */
export function getCacheStats(): {
  schemaCache: number;
  commandCache: number;
  total: number;
} {
  return {
    schemaCache: schemaCache.size(),
    commandCache: commandCache.size(),
    total: schemaCache.size() + commandCache.size(),
  };
}

// Limpar caches expirados a cada 10 minutos
if (typeof window === "undefined") {
  setInterval(() => {
    schemaCache.cleanup();
    commandCache.cleanup();
  }, 10 * 60 * 1000);
}
