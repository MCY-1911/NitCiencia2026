from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix="/api/dataset", tags=["dataset"])
from app.config import ALLOWED_LABELS

# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]
DATASET_DIR = BASE_DIR / "data" / "dataset"

# Extensiones que consideraremos imágenes válidas.
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

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
