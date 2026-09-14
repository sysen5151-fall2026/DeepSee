import io
import logging

import numpy as np
from PIL import Image

from .model_loader import ModelLoader

logger = logging.getLogger(__name__)

MODEL_VERSION = "cnn-pneumonia-v1"
INPUT_SIZE = (150, 150)
PNEUMONIA_THRESHOLD = 0.5


def predict_pneumonia(image_file) -> tuple[bool, float]:
    """
    Run the pneumonia classifier on an uploaded image.

    Args:
        image_file: UploadedFile from request.FILES

    Returns:
        (has_pneumonia, probability) where probability is the model's
        sigmoid output for the pneumonia class.
    """
    try:
        image_file.seek(0)
        img = Image.open(io.BytesIO(image_file.read()))
        img = img.convert("L").resize(INPUT_SIZE)

        img_array = np.asarray(img, dtype="float32") / 255.0
        img_array = img_array.reshape(1, INPUT_SIZE[1], INPUT_SIZE[0], 1)

        model = ModelLoader.get_instance().get_model()
        prediction = model.predict(img_array, verbose=0)
        probability = float(prediction[0][0])
        has_pneumonia = probability > PNEUMONIA_THRESHOLD

        logger.info("Pneumonia probability %.4f (positive=%s)", probability, has_pneumonia)
        return has_pneumonia, probability
    except Exception as exc:
        logger.error("Error in pneumonia prediction: %s", exc)
        raise
