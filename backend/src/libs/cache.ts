import Redis from "ioredis";
import { REDIS_URI_CONNECTION } from "../config/redis";
import * as crypto from "crypto";

const redis = new Redis(REDIS_URI_CONNECTION);

function encryptParams(params: any): string {
  const str = JSON.stringify(params);
  return crypto.createHash("sha256").update(str).digest("hex"); // Use hexadecimal encoding
}

export function setFromParams(
  key: string,
  params: any,
  value: string,
  option?: string,
  optionValue?: string | number
) {
  const finalKey = `${key}:${encryptParams(params)}`;
  if (option !== undefined && optionValue !== undefined) {
    return set(finalKey, value, option, optionValue);
  }
  return set(finalKey, value);
}

export function getFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`;
  return get(finalKey);
}

export function delFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`;
  return del(finalKey);
}

export function set(
  key: string,
  value: string,
  option?: string,
  optionValue?: string | number
) {
  if (option !== undefined && optionValue !== undefined) {
    return redis.set(key, value, option, optionValue);
  }
  return redis.set(key, value);
}

export function get(key: string) {
  return redis.get(key);
}

export function getKeys(pattern: string) {
  return redis.keys(pattern);
}

export function del(key: string) {
  return redis.del(key);
}

export async function delFromPattern(pattern: string) {
  const stream = redis.scanStream({ match: pattern });
  const keys: string[] = [];

  stream.on("data", (resultKeys) => {
    keys.push(...resultKeys);
  });

  stream.on("end", () => {
    if (keys.length > 0) {
      redis.del(keys);
    }
  });

  return new Promise<void>((resolve) => {
    stream.on("end", () => resolve());
  });
}

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
