from fastapi import FastAPI
from app.routers.status import router as status_router
from app.routers.system import router as system_router
from app.routers.audio import router as audio_router
from app.routers.display import router as display_router
from app.routers import network
from app.config import API_NAME, API_VERSION

app = FastAPI(title=API_NAME,version=API_VERSION)

app.include_router(status_router, prefix="/api/v1")
app.include_router(system_router, prefix="/api/v1")
app.include_router(audio_router)
app.include_router(display_router)
app.include_router(network.router, prefix="/api/v1")
