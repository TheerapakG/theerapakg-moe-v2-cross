import { type } from "arktype";
import defu from "defu";
import Redis from "ioredis";
let redis: Redis | null = null;

export const useRedis = () => {
  if (!redis) {
    const config = useRuntimeConfig();
    redis = new Redis(
      defu(
        {},
        config.redisPort
          ? {
              port: type("parsedInteger")(config.redisPort)?.data ?? 6379,
            }
          : undefined,
      ),
    );
  }

  return redis;
};
