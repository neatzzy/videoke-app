import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    const { upstashRedisRestUrl, upstashRedisRestToken } = useRuntimeConfig()
    _redis = new Redis({
      url: upstashRedisRestUrl,
      token: upstashRedisRestToken,
    })
  }
  return _redis
}
