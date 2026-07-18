from fastapi import FastAPI
from app.routers.status import router
from app.config import API_NAME, API_VERSION

app = FastAPI(
    title=API_NAME
    ,
    version=API_VERSION
)

app.include_router(router)
