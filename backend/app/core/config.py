from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Code Execution Engine"
    DEBUG: bool = False

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 5
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Execution Limits
    MAX_CODE_SIZE: int = 10 * 1024  # 10 KB
    EXECUTION_TIMEOUT: int = 10  # seconds
    EXECUTION_MEMORY: str = "256m"
    EXECUTION_CPUS: str = "1.0"
    EXECUTION_MAX_PIDS: str = "256"
    MAX_OUTPUT_CHARS: int = 10_000

    # Result Storage
    RESULT_TTL: int = 300  # 5 minutes

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
