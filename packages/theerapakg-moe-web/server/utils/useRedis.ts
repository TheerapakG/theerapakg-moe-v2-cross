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
              host: config.redisHost,
              port:
                type("number | parsedInteger")(config.redisPort)?.data ?? 6379,
              password: config.redisPassword,
            }
          : undefined,
      ),
    );
  }

  return redis;
};
