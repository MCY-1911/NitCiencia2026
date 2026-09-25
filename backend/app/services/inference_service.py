
import tensorflow as tf
import numpy as np

from app.services.notification_service import notifier


class InferenceService:
    def __init__(self, model, class_names):
        self.model = model
        self.class_names = class_names

    def inference(self):
        if self.model is None:
            return {
                "error" : "No hay ningún modelo entrenado"
            }

        image = tf.expand_dims(image, axis=0)

        predictions = self.model.predict(image, verbose=0)

        class_index = int(np.argmax(predictions))[0]

        return {
            "prediction": self.class_names[class_index],
            "confidence": float(predictions[class_index]),
            "probabilities": {
                self.class_names[i]: float(predictions[i])
                for i in range(len(self.class_names))
            }
        }


