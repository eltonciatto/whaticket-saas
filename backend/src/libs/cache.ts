import Redis from "ioredis";

// Configuração do cliente Redis com opções apropriadas para Upstash
const client = new Redis({
  port: 6379, // Porta do Redis
  host: "intense-marmoset-49193.upstash.io", // Host do Redis
  password: "AcApAAIjcDEyNzFhM2M3NWRlNzE0YmQ2YjVmNTVhNDgxNTA4MTA5MHAxMA", // Senha do Redis
  tls: {} // Configuração para uso de SSL/TLS
});

// Função para definir valores no Redis
export async function set(key: string, value: string) {
  try {
    await client.set(key, value);
  } catch (error) {
    console.error(`Erro ao definir o valor para a chave ${key}:`, error);
  }
}

// Função para obter valores do Redis
export async function get(key: string) {
  try {
    return await client.get(key);
  } catch (error) {
    console.error(`Erro ao obter o valor para a chave ${key}:`, error);
  }
}

// Função para deletar uma chave do Redis
export async function del(key: string) {
  try {
    await client.del(key);
  } catch (error) {
    console.error(`Erro ao deletar a chave ${key}:`, error);
  }
}

// Função para obter chaves do Redis com base em um padrão
export async function getKeys(pattern: string) {
  try {
    return await client.keys(pattern);
  } catch (error) {
    console.error(`Erro ao obter chaves com padrão ${pattern}:`, error);
  }
}

// Função para deletar chaves do Redis com base em um padrão
export async function delFromPattern(pattern: string) {
  try {
    const all = await getKeys(pattern);
    for (let item of all) {
      await del(item);
    }
  } catch (error) {
    console.error(`Erro ao deletar chaves com padrão ${pattern}:`, error);
  }
}

// Exporta as funções para acesso externo
export const cacheLayer = {
  set,
  get,
  del,
  getKeys,
  delFromPattern
};
