/**
 * Logger System
 * Sistema de logging centralizado com níveis e formatação
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  /**
   * Formata a mensagem de log com timestamp e nível
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getEmoji(level);
    return `${emoji} [${timestamp}] [${level}] ${message}`;
  }

  /**
   * Retorna emoji baseado no nível do log
   */
  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "🔍";
      case LogLevel.INFO:
        return "ℹ️";
      case LogLevel.WARN:
        return "⚠️";
      case LogLevel.ERROR:
        return "❌";
      default:
        return "📝";
    }
  }

  /**
   * Cria uma entrada de log estruturada
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    meta?: any
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta,
    };
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, meta?: any): void {
    if (!this.isDevelopment) return;

    const formatted = this.formatMessage(LogLevel.DEBUG, message);
    console.debug(formatted, meta || "");
  }

  /**
   * Log informativo
   */
  info(message: string, meta?: any): void {
    const formatted = this.formatMessage(LogLevel.INFO, message);
    console.log(formatted, meta || "");
  }

  /**
   * Log de aviso
   */
  warn(message: string, meta?: any): void {
    const formatted = this.formatMessage(LogLevel.WARN, message);
    console.warn(formatted, meta || "");
  }

  /**
   * Log de erro
   */
  error(message: string, error?: any): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message);
    console.error(formatted, error || "");

    // Em produção, você poderia enviar para um serviço de monitoring
    // Ex: Sentry, LogRocket, DataDog, etc.
    if (!this.isDevelopment) {
      // TODO: Integrar com serviço de monitoring
      // this.sendToMonitoring(this.createLogEntry(LogLevel.ERROR, message, error));
    }
  }

  /**
   * Log de operação de API
   */
  api(method: string, endpoint: string, status: number, duration?: number): void {
    const message = `${method} ${endpoint} - ${status}${duration ? ` (${duration}ms)` : ""}`;
    
    if (status >= 500) {
      this.error(message);
    } else if (status >= 400) {
      this.warn(message);
    } else {
      this.info(message);
    }
  }

  /**
   * Log de operação MongoDB
   */
  mongo(operation: string, collection: string, duration?: number): void {
    const message = `MongoDB: ${operation} on ${collection}${duration ? ` (${duration}ms)` : ""}`;
    this.debug(message);
  }

  /**
   * Log de autenticação/autorização
   */
  auth(action: string, success: boolean, details?: string): void {
    const message = `Auth: ${action} - ${success ? "✅ Success" : "❌ Failed"}${details ? ` - ${details}` : ""}`;
    
    if (success) {
      this.info(message);
    } else {
      this.warn(message);
    }
  }

  /**
   * Log de performance
   */
  perf(operation: string, duration: number, threshold?: number): void {
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (threshold && duration > threshold) {
      this.warn(`${message} (exceeds threshold of ${threshold}ms)`);
    } else {
      this.debug(message);
    }
  }

  /**
   * Log estruturado em JSON (útil para parsers de log)
   */
  json(level: LogLevel, message: string, meta?: any): void {
    const entry = this.createLogEntry(level, message, meta);
    console.log(JSON.stringify(entry));
  }

  /**
   * Grupo de logs (útil para operações complexas)
   */
  group(title: string, callback: () => void): void {
    if (!this.isDevelopment) {
      callback();
      return;
    }

    console.group(`📦 ${title}`);
    callback();
    console.groupEnd();
  }

  /**
   * Tempo de execução (profiling)
   */
  time(label: string): void {
    console.time(`⏱️ ${label}`);
  }

  /**
   * Finaliza timing
   */
  timeEnd(label: string): void {
    console.timeEnd(`⏱️ ${label}`);
  }
}

// Singleton instance
export const logger = new Logger();

// Export default
export default logger;

// Utility functions
export const log = {
  debug: (msg: string, meta?: any) => logger.debug(msg, meta),
  info: (msg: string, meta?: any) => logger.info(msg, meta),
  warn: (msg: string, meta?: any) => logger.warn(msg, meta),
  error: (msg: string, error?: any) => logger.error(msg, error),
  api: (method: string, endpoint: string, status: number, duration?: number) =>
    logger.api(method, endpoint, status, duration),
  mongo: (operation: string, collection: string, duration?: number) =>
    logger.mongo(operation, collection, duration),
};

