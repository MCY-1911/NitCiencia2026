from fastapi import APIRouter, HTTPException, status, Request
from app.services.training_service import trainer

router = APIRouter(prefix="/api/training", tags=["training"])
training = False

@router.post("/start", status_code=status.HTTP_202_ACCEPTED)
async def start_training(request: Request):

    started = await trainer.start(request.app)

    if not started:
        raise HTTPException(status_code=409, detail="Ya hay un entrenamiento en curso")

    return {"status": "started"}
