import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

/**
 * Supports both Vercel's own "Storage → KV" env var naming (KV_REST_API_*)
 * and a manually-connected Upstash Redis database (UPSTASH_REDIS_REST_*).
 */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  return client;
}
