import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import captures, dataset, events, training, mcu

app = FastAPI(
    title = "NitCiencia2026 API",
    description = "API para la aplicación NitCiencia2026",
    version = "1.0.0"
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:4200")

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
app.include_router(training.router)
app.include_router(mcu.router)
