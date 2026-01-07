# worker.py
# Background worker that consumes execution jobs from Redis queue
# and executes them using ExecutionService (Docker-based)

import json
import time

from core.redis import redis_client
from services.executionService import ExecutionService

QUEUE_NAME = "code_execution_queue"
RESULT_TTL = 300  # seconds (5 minutes)


def start_worker():
    executor = ExecutionService()
    print("🚀 Worker started. Waiting for jobs...")

    while True:
        try:
            # Blocking pop (efficient, no CPU waste)
            _, job_data = redis_client.blpop(QUEUE_NAME)

            job = json.loads(job_data)
            job_id = job["job_id"]
            language = job["language"]
            code = job["code"]

            print(f"▶️ Executing job {job_id} [{language}]")

            start_time = time.time()

            # Execute code via existing ExecutionService
            result = executor.execute(language, code)

            execution_time = round(time.time() - start_time, 3)

            # Prepare result payload
            if result["exit_code"] == 0:
                output = result["stdout"]
                status = "success"
            else:
                output = result["stderr"] or "Execution failed"
                status = "error"

            response = {
                "status": status,
                "output": output,
                "execution_time": execution_time
            }

            # Store result in Redis
            redis_client.set(
                f"result:{job_id}",
                json.dumps(response),
                ex=RESULT_TTL
            )

            print(f"✅ Job {job_id} completed in {execution_time}s")

        except Exception as e:
            print(f"❌ Worker error: {e}")


if __name__ == "__main__":
    start_worker()
