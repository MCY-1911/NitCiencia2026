
import tensorflow as tf
import numpy as np

from app.services.notification_service import notifier


class InferenceService:
    def __init__(self):
        pass

    def inference(self, model, class_names, image):
        if model is None:
            return {
                "error" : "No hay ningún modelo entrenado"
            }

        image = tf.expand_dims(image, axis=0)

        predictions = model.predict(image, verbose=0)[0]

        class_index = int(np.argmax(predictions))

        return {
            "prediction": class_names[class_index],
            "confidence": float(predictions[class_index]),
            "probabilities": {
                class_names[i]: float(predictions[i])
                for i in range(len(class_names))
            }
        }


