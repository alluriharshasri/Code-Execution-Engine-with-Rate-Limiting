import time
from core.redis import redis_client

RATE_LIMIT = 5        # requests
WINDOW_SIZE = 60      # seconds


def is_allowed(client_id: str):
    key = f"rate_limit:{client_id}"
    current = redis_client.get(key)

    if current is None:
        redis_client.set(key, 1, ex=WINDOW_SIZE)
        return True

    if int(current) < RATE_LIMIT:
        redis_client.incr(key)
        return True

    ttl = redis_client.ttl(key)
    return False, ttl
