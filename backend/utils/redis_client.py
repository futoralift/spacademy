import os
import redis.asyncio as redis

# Use the REDIS_URL from environment variables, or fallback to localhost for development
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

redis_client = redis.from_url(
    redis_url,
    decode_responses=True,
)