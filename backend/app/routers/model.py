from fastapi import APIRouter, HTTPException, status, Request
from app.services.notification_service import notifier
import tensorflow as tf

router = APIRouter(prefix="/api/model", tags=["training"])
training = False

@router.post("/startTrain", status_code=status.HTTP_202_ACCEPTED)
async def start_training(request: Request):

    started = await request.app.state.trainer.start()

    if not started:
        raise HTTPException(status_code=409, detail="Ya hay un entrenamiento en curso")

    return {"status": "started"}


@router.post("/inference")
async def inference(request: Request):
    content_type = request.headers.get("content-type", "").split(";")[0].lower()
    
    if content_type != "image/jpeg":
        raise HTTPException(status_code=415, detail="Se esperaba una imagen JPEG")

    
    image_bytes = await request.body()

    try:
        image = tf.io.decode_jpeg(image_bytes, channels=3)
        image = tf.cast(image, tf.float32)
    except tf.errors.InvalidArgumentError:
        raise HTTPException(
            status_code=400,
            detail="El contenido no es un JPEG válido"
        )

    result = request.app.state.inference.inference(image)
    print(result)

    result["image"] = image_bytes

    notifier.notify(result)

    return {"status": "ok"}