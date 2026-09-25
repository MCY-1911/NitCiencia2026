import asyncio
from pathlib import Path
import tensorflow as tf

from app.services.notification_service import notifier
from app.models.model import create_model


class TrainingService:

    def __init__(self):
        self.is_training = False
        self.img_size = (324, 324)
        self.batch_size = 16
        self.epochs = 20

    async def start(self) -> bool:

        if self.is_training:
            return False

        self.is_training = True
        asyncio.create_task(self._run_training())

        return True


    async def run_training(self):
        try:

            # steps = [
            #     (10, "Preparando dataset..."),
            #     (25, "Cargando imágenes..."),
            #     (40, "Construyendo modelo..."),
            #     (60, "Entrenando modelo..."),
            #     (80, "Validando modelo..."),
            #     (100, "Entrenamiento completado"),
            # ]

            # for progress, status in steps:

            #     await notifier.notify(
            #         {
            #             "type": "training_progress",
            #             "progress": progress,
            #             "status": status,
            #         }
            #     )

            #     await asyncio.sleep(1)

            # await notifier.notify(
            #     {
            #         "type": "training_completed",
            #         "progress": 100,
            #         "status": "Entrenamiento completado",
            #     }
            # )

            BASE_DIR = Path(__file__).resolve().parents[2]
            DATASET_DIR = BASE_DIR / "data" / "dataset"

            train_ds = tf.keras.utils.image_dataset_from_directory(
                DATASET_DIR,
                validation_split=0.2,
                subset="training",
                seed=42,
                image_size=self.img_size,
                batch_size=self.batch_size,
            )

            val_ds = tf.keras.utils.image_dataset_from_directory(
                DATASET_DIR,
                validation_split=0.2,
                subset="validation",
                seed=42,
                image_size=self.img_size,
                batch_size=self.batch_size,
            )

            class_names = train_ds.class_names

            self.class_names = class_names

            model = create_model(len(class_names))

            history = model.fit(
                train_ds,
                validation_data=val_ds,
                epochs=self.epochs,
                verbose=0
            )

            return model, class_names, {
                "classes": class_names,
                "accuracy": float(history.history["accuracy"][-1]),
                "val_accuracy": float(history.history["val_accuracy"][-1]),
            }

        finally:
            self.is_training = False