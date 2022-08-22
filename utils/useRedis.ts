import Redis from "ioredis";
let redis: Redis = null;

export const useRedis = () => {
  if (!redis) {
    redis = new Redis();
  }

  return redis;
};
