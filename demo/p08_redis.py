"""One shared Redis connection pool for the cache and the job queue."""

import os

import redis

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6388/0")

# decode_responses=True: Redis hands back str, not bytes.
pool = redis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)


def get_redis() -> redis.Redis:
    """A FastAPI dependency: cheap to build, the pool does the real work."""
    return redis.Redis(connection_pool=pool)
