import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import captures, dataset, events, mcu, model
from app.services.training_service import TrainingService
from app.services.inference_service import InferenceService


frontend_url = os.getenv("FRONTEND_URL", "http://localhost:4200")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = None
    app.state.class_names = []
    app.state.trainer = TrainingService()
    app.state.inference = InferenceService()
    yield


app = FastAPI(
    title = "NitCiencia2026 API",
    description = "API para la aplicación NitCiencia2026",
    version = "1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(captures.router)
app.include_router(dataset.router)
app.include_router(events.router)
app.include_router(model.router)
app.include_router(mcu.router)
