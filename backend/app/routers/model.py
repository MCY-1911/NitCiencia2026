from fastapi import APIRouter, HTTPException, status, Request
from app.services.notification_service import notifier
import tensorflow as tf

router = APIRouter(prefix="/api/model", tags=["model"])
training = False

@router.post("/startTrain", status_code=status.HTTP_202_ACCEPTED)
async def start_training(request: Request):

    model, class_names, result = await request.app.state.trainer.run_training()

    request.app.state.model = model
    request.app.state.class_names = class_names

    return result


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

    result = request.app.state.inference.inference(request.app.state.model, request.app.state.class_names, image)
    print(result)

    result["image"] = image_bytes

    notifier.notify(result)

    return {"status": "ok"}