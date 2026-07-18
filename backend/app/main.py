from fastapi import FastAPI
from app.routers.status import router as status_router
from app.routers.system import router as system_router
from app.config import API_NAME, API_VERSION

app = FastAPI(
    title=API_NAME
    ,
    version=API_VERSION
)

app.include_router(status_router, prefix="/api/v1")
app.include_router(system_router, prefix="/api/v1")
