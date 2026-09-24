from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.notification_service import notifier
from app.config import ALLOWED_LABELS

router = APIRouter(prefix="/api/captures", tags=["captures"])


# ============================================================
# CONFIGURACIÓN
# ============================================================

# Carpeta en la que guardaremos temporalmente las imágenes
# que todavía no han sido etiquetadas.
BASE_DIR = Path(__file__).resolve().parents[2]
PENDING_DIR = BASE_DIR / "data" / "pending"
DATASET_DIR = BASE_DIR / "data" / "dataset"
PENDING_DIR.mkdir(parents=True, exist_ok=True)
DATASET_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024
CAPTURE_TIMESTAMP_FORMAT = "%Y%m%dT%H%M%S%f"


class CaptureLabelRequest(BaseModel):
    label: str

class CaptureResponse(BaseModel):
    capture_id: str
    image_url: str
    created_at: str | None = None
    label: str | None = None


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================


def find_capture(capture_id: str) -> Path | None:
    """
    Busca una imagen pendiente a partir de su capture_id.

    Los archivos tienen una estructura como:

        20260921T102530_a1b2c3d4.jpg

    donde:
        - la primera parte es la fecha
        - la segunda parte es el UUID de la captura
    """

    matches = list(PENDING_DIR.glob(f"*_{capture_id}.jpg"))

    if not matches:
        return None

    return matches[0]


def parse_capture_file(file_path: Path):
    timestamp, capture_id = file_path.stem.split("_", maxsplit=1)

    created_at = datetime.strptime(timestamp, CAPTURE_TIMESTAMP_FORMAT).replace(
        tzinfo=timezone.utc
    )

    return capture_id, created_at


# ============================================================
# POST /api/captures
# ============================================================


@router.post("", response_model=CaptureResponse)
async def create_capture(request: Request):

    content_type = request.headers.get("content-type", "").split(";")[0].lower()

    if content_type != "image/jpeg":
        raise HTTPException(status_code=415, detail="Se esperaba una imagen JPEG")

    capture_id = str(uuid4())
    created_at = datetime.now(timezone.utc)

    timestamp = created_at.strftime("%Y%m%dT%H%M%S%f")

    file_path = PENDING_DIR / f"{timestamp}_{capture_id}.jpg"

    file_size = 0

    try:
        with file_path.open("wb") as file:
            async for chunk in request.stream():

                file_size += len(chunk)

                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="La imagen supera el tamaño máximo permitido",
                    )

                file.write(chunk)

    except Exception:
        file_path.unlink(missing_ok=True)
        raise

    if file_size == 0:
        file_path.unlink(missing_ok=True)

        raise HTTPException(status_code=400, detail="La imagen está vacía")

    await notifier.notify({"type": "new_capture"})

    return {
        "capture_id": capture_id,
        "image_url": f"/api/captures/{capture_id}/image",
        "created_at": created_at.isoformat(),
    }


# ============================================================
# GET /api/captures/latest
# ============================================================


@router.get("/latest", response_model=CaptureResponse)
def get_latest_capture():
    """
    Devuelve información sobre la última captura pendiente.
    No devuelve directamente la imagen.
    Devuelve:
        - capture_id
        - image_url
    Angular podrá usar image_url para mostrar la fotografía.
    """

    images = list(PENDING_DIR.glob("*.jpg"))

    if not images:
        raise HTTPException(status_code=404, detail="No hay capturas pendientes")

    latest_image = max(images, key=lambda file: file.name)
    capture_id, created_at = parse_capture_file(latest_image)

    return {
        "capture_id": capture_id,
        "image_url": f"/api/captures/{capture_id}/image",
        "created_at": created_at.isoformat()
    }

# ============================================================
# GET /api/captures/pending
# ============================================================

@router.get("/pending", response_model=list[CaptureResponse])
def get_pending_captures():

    images = list(PENDING_DIR.glob("*.jpg"))

    captures = []

    for image in sorted(images, reverse=True):

        capture_id, created_at = parse_capture_file(image)

        captures.append(
            {
                "capture_id": capture_id,
                "image_url": f"/api/captures/{capture_id}/image",
                "created_at": created_at.isoformat(),
            }
        )

    return captures


# ============================================================
# GET /api/captures/{capture_id}/image
# ============================================================

@router.get("/{capture_id}/image")
def get_capture_image(capture_id: str):

    file_path = find_capture(capture_id)

    if file_path is None:
        raise HTTPException(status_code=404, detail="Captura no encontrada")

    return FileResponse(path=file_path, media_type="image/jpeg")


# ============================================================
# POST /api/captures/{capture_id}/label
# ============================================================


@router.post("/{capture_id}/label")
def label_capture(capture_id: str, request: CaptureLabelRequest):
    """
    Asocia una etiqueta a una captura pendiente.

    La imagen pasa de data/pending/ a data/dataset/<label>/

    """

    if request.label not in ALLOWED_LABELS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Etiqueta no válida. "
                f"Las etiquetas permitidas son: "
                f"{sorted(ALLOWED_LABELS)}"
            ),
        )

    file_path = find_capture(capture_id)

    if file_path is None:
        raise HTTPException(status_code=404, detail="Captura pendiente no encontrada")

    # Guardamos la imagen etiquetada gracias al nombre del directorio
    label_dir = DATASET_DIR / request.label
    label_dir.mkdir(parents=True, exist_ok=True)
    destination = label_dir / f"{capture_id}.jpg"
    file_path.replace(destination)

    return {"capture_id": capture_id, "label": request.label, "status": "labeled"}


# ============================================================
# DELETE /api/captures/{capture_id}
# ============================================================


@router.delete("/{capture_id}", status_code=204)
async def delete_capture(capture_id: str):
    capture_path = find_capture(capture_id)

    if not capture_path:
        raise HTTPException(status_code=404, detail="Captura no encontrada")

    capture_path.unlink()
