from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.reports import router

app = FastAPI(
    title="Perfios Report Processor",
    description="Internal API for processing and aggregating Perfios transaction reports",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
