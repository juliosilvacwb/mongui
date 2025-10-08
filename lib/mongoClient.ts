import { MongoClient, Db } from "mongodb";

// Fornece um valor padrão vazio durante build time para evitar erros
const uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Singleton pattern para reutilizar conexão
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // Em desenvolvimento, usar variável global para evitar múltiplas conexões
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Em produção, criar nova instância
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Função auxiliar para obter um database específico
export async function getDatabase(dbName: string): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

