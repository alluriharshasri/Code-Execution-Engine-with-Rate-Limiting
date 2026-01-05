from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.execute import router as execute_router
from api.routes.health import router as health_router

app = FastAPI(
    title = "Code Execution Engine",
    description = "Executes user-submitted code in docker with rate limiting.",
    version = "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.get("/")
def root():
    return {
        "message": "Code Execution Engine API is running",
        "docs": "/docs"
    }


app.include_router(health_router)
app.include_router(execute_router)