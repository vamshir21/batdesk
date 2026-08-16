from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import API_NAME, API_VERSION, FRONTEND_DIST
from app.routers.audio import router as audio_router
from app.routers.display import router as display_router
from app.routers.network import router as network_router
from app.routers.status import router as status_router
from app.routers.system import router as system_router

app = FastAPI(title=API_NAME, version=API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API = "/api/v1"
app.include_router(status_router, prefix=API)
app.include_router(system_router, prefix=API)
app.include_router(audio_router, prefix=API)
app.include_router(display_router, prefix=API)
app.include_router(network_router, prefix=API)

assets_dir = FRONTEND_DIST / "assets"
if assets_dir.is_dir():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}")
def frontend(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="Not found")

    requested = FRONTEND_DIST / full_path
    if full_path and requested.is_file():
        return FileResponse(requested)

    index = FRONTEND_DIST / "index.html"
    if index.is_file():
        return FileResponse(index)

    return {
        "name": API_NAME,
        "version": API_VERSION,
        "docs": "/docs",
        "hint": "Build the frontend with: cd frontend && npm run build",
    }
