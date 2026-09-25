from pathlib import Path
from fastapi import APIRouter
from uuid import uuid4
from app.config import ALLOWED_LABELS

router = APIRouter(prefix="/api/dataset", tags=["dataset"])

# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]
DATASET_DIR = BASE_DIR / "data" / "dataset"

# Extensiones que consideraremos imágenes válidas.
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

ACCUMULATED_DATASET_DIR =  BASE_DIR / "data" / "accumulated_dataset"
ACCUMULATED_DATASET_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# GET /api/dataset/classes
# ============================================================


@router.get("/classes")
def get_dataset_classes():
    """
    Devuelve las clases que puede utilizar la aplicación.
    """

    return {"classes": list(ALLOWED_LABELS)}


# ============================================================
# GET /api/dataset/stats
# ============================================================


@router.get("/stats")
def get_dataset_stats():
    """
    Devuelve el número de imágenes almacenadas en cada clase
    y el número total de imágenes del dataset.
    """

    class_stats = {}

    total = 0

    # Recorremos todas las clases conocidas.
    for label in ALLOWED_LABELS:

        label_dir = DATASET_DIR / label

        if not label_dir.exists():
            count = 0

        else:
            count = sum(
                1
                for file in label_dir.iterdir()
                if (file.is_file() and file.suffix.lower() in IMAGE_EXTENSIONS)
            )

        class_stats[label] = count

        total += count

    return {"total": total, "classes": class_stats}


# ============================================================
# POST /api/dataset/archive
# ============================================================

@router.post("/archive")
async def archive_dataset():
    moved = 0

    for label in ALLOWED_LABELS:
        source_dir = DATASET_DIR / label
        target_dir = ACCUMULATED_DATASET_DIR / label
        target_dir.mkdir(parents=True, exist_ok=True)

        for image_path in source_dir.glob("*.jpg"):
            target_path = target_dir / image_path.name

            if target_path.exists():
                target_path = target_dir / f"{uuid4()}_{image_path.name}"

            image_path.rename(target_path)
            moved += 1

    return {"status": "ok", "moved": moved}
