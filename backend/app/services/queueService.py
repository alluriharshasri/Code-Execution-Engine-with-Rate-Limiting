import json
import uuid
from core.redis import redis_client

QUEUE_NAME = "code_execution_queue"


def enqueue_job(payload: dict) -> str:
    job_id = str(uuid.uuid4())
    payload["job_id"] = job_id

    redis_client.rpush(QUEUE_NAME, json.dumps(payload))
    return job_id


def get_result(job_id: str):
    return redis_client.get(f"result:{job_id}")
