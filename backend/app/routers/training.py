from fastapi import APIRouter, HTTPException, status
from app.services.training_service import trainer

router = APIRouter(prefix="/api/training", tags=["training"])
training = False

@router.post("/start", status_code=status.HTTP_202_ACCEPTED)
async def start_training():

    started = await trainer.start()

    if not started:
        raise HTTPException(status_code=409, detail="Ya hay un entrenamiento en curso")

    return {"status": "started"}
