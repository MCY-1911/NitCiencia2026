from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, File, HTTPException, UploadFile
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

ALLOWED_IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png"}
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

    matches = list(PENDING_DIR.glob(f"*_{capture_id}.*"))

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


@router.post("")
async def create_capture(image: UploadFile = File(...)):
    """
    Recibe una imagen y la almacena como captura pendiente.
    
    El archivo debe enviarse mediante multipart/form-data
    utilizando el campo:
        image
    """

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Formato de imagen no soportado")

    # --------------------------------------------------------
    # Crear nombre del archivo
    # --------------------------------------------------------

    capture_id = str(uuid4())
    created_at = datetime.now(timezone.utc)
    timestamp = created_at.strftime("%Y%m%dT%H%M%S%f")
    extension = ALLOWED_IMAGE_TYPES[image.content_type]
    filename = f"{timestamp}_{capture_id}{extension}"
    file_path = PENDING_DIR / filename

    # --------------------------------------------------------
    # Guardar la imagen por bloques
    # --------------------------------------------------------

    file_size = 0

    try:
        with file_path.open("wb") as output_file:
            while chunk := await image.read(1024 * 1024):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    output_file.close()
                    file_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=413, detail="La imagen supera el límite de 5 MB"
                    )
                output_file.write(chunk)
    finally:
        await image.close()

    await notifier.notify({"type": "new_capture"})

    return {
        "capture_id": capture_id,
        "created_at": created_at.isoformat(),
        "image_url": (f"/api/captures/{capture_id}/image"),
    }


# ============================================================
# GET /api/captures/latest
# ============================================================


@router.get("/latest")
def get_latest_capture():
    """
    Devuelve información sobre la última captura pendiente.
    No devuelve directamente la imagen.
    Devuelve:
        - capture_id
        - image_url
    Angular podrá usar image_url para mostrar la fotografía.
    """

    images = [
        file
        for file in PENDING_DIR.iterdir()
        if file.suffix.lower() in {".jpg", ".jpeg", ".png"}
    ]

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

    images = [
        file
        for file in PENDING_DIR.iterdir()
        if file.suffix.lower() in {".jpg", ".jpeg", ".png"}
    ]

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
    """
    Devuelve el archivo de imagen asociado a una captura.
    """

    file_path = find_capture(capture_id)

    if file_path is None:

        raise HTTPException(status_code=404, detail="Captura no encontrada")

    # Indicamos el tipo MIME en función de la extensión.
    if file_path.suffix.lower() == ".png":
        media_type = "image/png"
    else:
        media_type = "image/jpeg"

    return FileResponse(path=file_path, media_type=media_type)

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
    destination = label_dir / f"{capture_id}{file_path.suffix.lower()}"
    file_path.replace(destination)

    return {"capture_id": capture_id, "label": request.label, "status": "labeled"}
