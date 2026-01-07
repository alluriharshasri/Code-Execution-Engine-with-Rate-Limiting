# execute.py
# Handles code execution requests with validation + rate limiting + job queue

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from core.languages import SUPPORTED_LANGUAGES
from services.rateLimiter import is_allowed
from services.queueService import enqueue_job, get_result

router = APIRouter()

MAX_CODE_SIZE = 10 * 1024  # 10 KB


# =========================
# Request / Response Models
# =========================

class ExecuteRequest(BaseModel):
    code: str = Field(..., description="Source code to execute")
    language: str = Field(..., description="Programming language")


class ExecuteResponse(BaseModel):
    status: str
    job_id: str


class ResultResponse(BaseModel):
    status: str
    output: str | None = None


# =========================
# Execute Endpoint
# =========================

@router.post("/execute", response_model=ExecuteResponse)
def execute_code(request: Request, payload: ExecuteRequest):
    code = payload.code
    language = payload.language.strip().lower()

    # 1️⃣ Empty code
    if not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    # 2️⃣ Size limit
    if len(code.encode("utf-8")) > MAX_CODE_SIZE:
        raise HTTPException(status_code=400, detail="Code size exceeds 10KB limit")

    # 3️⃣ Language validation
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {language}"
        )

    # 4️⃣ Rate limiting (per IP)
    client_ip = request.client.host
    allowed = is_allowed(client_ip)

    if allowed is not True:
        _, retry_after = allowed
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Retry after {retry_after} seconds"
        )

    # 5️⃣ Enqueue job (NO execution here)
    job_payload = {
        "language": language,
        "code": code
    }

    job_id = enqueue_job(job_payload)

    return {
        "status": "queued",
        "job_id": job_id
    }


# =========================
# Result Polling Endpoint
# =========================

@router.get("/result/{job_id}", response_model=ResultResponse)
def fetch_result(job_id: str):
    result = get_result(job_id)

    if not result:
        return {
            "status": "running",
            "output": None
        }

    return {
        "status": "completed",
        "output": result
    }
