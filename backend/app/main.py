from fastapi import FastAPI
from app.routers.status import router

app = FastAPI(
    title="BatDesk API",
    version="1.0.0"
)

app.include_router(router)
