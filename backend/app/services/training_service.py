import asyncio

from app.services.notification_service import notifier


class TrainingService:

    def __init__(self):
        self.is_training = False

    async def start(self) -> bool:

        if self.is_training:
            return False

        self.is_training = True
        asyncio.create_task(self._run_training())

        return True

    async def _run_training(self):
        try:

            steps = [
                (10, "Preparando dataset..."),
                (25, "Cargando imágenes..."),
                (40, "Construyendo modelo..."),
                (60, "Entrenando modelo..."),
                (80, "Validando modelo..."),
                (100, "Entrenamiento completado"),
            ]

            for progress, status in steps:

                await notifier.notify(
                    {
                        "type": "training_progress",
                        "progress": progress,
                        "status": status,
                    }
                )

                await asyncio.sleep(1)

            await notifier.notify(
                {
                    "type": "training_completed",
                    "progress": 100,
                    "status": "Entrenamiento completado",
                }
            )

        finally:
            self.is_training = False


trainer = TrainingService()
