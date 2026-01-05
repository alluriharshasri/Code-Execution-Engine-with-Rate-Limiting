# execute.py
# Handles code execution requests with validation + Docker execution

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from core.languages import SUPPORTED_LANGUAGES
from services.executionService import ExecutionService

router = APIRouter()
executor = ExecutionService()

MAX_CODE_SIZE = 10 * 1024  # 10 KB


class ExecuteRequest(BaseModel):
    code: str = Field(..., description="Source code to execute")
    language: str = Field(..., description="Programming language")


class ExecuteResponse(BaseModel):
    status: str
    output: str


@router.post("/execute", response_model=ExecuteResponse)
def execute_code(request: ExecuteRequest):
    code = request.code
    language = request.language.strip().lower()

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

    # 4️⃣ Execute via Docker
    result = executor.execute(language, code)

    if result["exit_code"] != 0:
        raise HTTPException(
            status_code=400,
            detail=result["stderr"] or "Execution failed"
        )

    return {
        "status": "success",
        "output": result["stdout"]
    }
