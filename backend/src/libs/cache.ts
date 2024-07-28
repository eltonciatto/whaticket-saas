import Redis from "ioredis";
import { REDIS_URI_CONNECTION } from "../config/redis";
import * as crypto from "crypto";

// Configuração do cliente Redis com opções de gerenciamento de falhas
const redis = new Redis(REDIS_URI_CONNECTION, {
  connectTimeout: 10000, // Tempo limite de conexão: 10 segundos
  maxRetriesPerRequest: 10, // Número máximo de tentativas de reenvio
  retryStrategy: (times) => {
    // Estrategia de reenvio exponencial
    const delay = Math.min(times * 50, 2000); // Exponencialmente aumente o tempo de espera
    return delay;
  }
});

// Função para criptografar parâmetros
function encryptParams(params: any) {
  const str = JSON.stringify(params);
  return crypto.createHash("sha256").update(str).digest("base64");
}

// Função para definir valores no Redis com base nos parâmetros
export async function setFromParams(
  key: string,
  params: any,
  value: string,
  option?: string,
  optionValue?: string | number
) {
  const finalKey = `${key}:${encryptParams(params)}`;
  try {
    if (option !== undefined && optionValue !== undefined) {
      await redis.set(finalKey, value, option, optionValue);
    } else {
      await redis.set(finalKey, value);
    }
  } catch (error) {
    console.error(`Erro ao definir o valor para a chave ${finalKey}:`, error);
  }
}

// Função para obter valores do Redis com base nos parâmetros
export async function getFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`;
  try {
    return await redis.get(finalKey);
  } catch (error) {
    console.error(`Erro ao obter o valor para a chave ${finalKey}:`, error);
  }
}

// Função para deletar valores do Redis com base nos parâmetros
export async function delFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`;
  try {
    await redis.del(finalKey);
  } catch (error) {
    console.error(`Erro ao deletar a chave ${finalKey}:`, error);
  }
}

// Função para definir valores no Redis
export async function set(
  key: string,
  value: string,
  option?: string,
  optionValue?: string | number
) {
  try {
    if (option !== undefined && optionValue !== undefined) {
      await redis.set(key, value, option, optionValue);
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    console.error(`Erro ao definir o valor para a chave ${key}:`, error);
  }
}

// Função para obter valores do Redis
export async function get(key: string) {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error(`Erro ao obter o valor para a chave ${key}:`, error);
  }
}

// Função para obter chaves do Redis com base em um padrão
export async function getKeys(pattern: string) {
  try {
    return await redis.keys(pattern);
  } catch (error) {
    console.error(`Erro ao obter chaves com padrão ${pattern}:`, error);
  }
}

// Função para deletar uma chave do Redis
export async function del(key: string) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Erro ao deletar a chave ${key}:`, error);
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
  setFromParams,
  get,
  getFromParams,
  getKeys,
  del,
  delFromParams,
  delFromPattern
};
