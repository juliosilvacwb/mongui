// Tipos para MongoDB
export interface MongoDatabase {
  name: string;
  sizeOnDisk?: number;
  empty?: boolean;
}

export interface MongoCollection {
  name: string;
  type: string;
}

export interface MongoDocument {
  [key: string]: any;
}

// Tipos para UI
export interface DatabaseListItem {
  name: string;
  expanded?: boolean;
  collections?: string[];
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Tipos para Shell
export interface ShellCommand {
  command: string;
  timestamp?: Date;
}

export interface ShellResult {
  output: any;
  error?: string;
  executionTime?: number;
}

