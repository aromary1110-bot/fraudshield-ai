"""
currency_app.py
Serves the trained currency_model.h5 for real/fake note prediction.
Free, runs locally, no API key needed.
"""

import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join("..", "ml-models", "currency_real_fake_model.h5")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found at {MODEL_PATH}. Make sure currency_model.h5 is in the ml-models folder."
    )

model = load_model(MODEL_PATH)

IMAGE_SIZE = (224, 224)

# Binary classifier: class_indices from training = {'fake': 0, 'real': 1}
# Model uses a single sigmoid output neuron:
#   output close to 0 -> fake
#   output close to 1 -> real


def preprocess_image(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize(IMAGE_SIZE)
    arr = image.img_to_array(img)
    arr = arr / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr


@app.route("/api/check-currency", methods=["POST"])
def check_currency():
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded. Use form field name 'image'."}), 400

    file = request.files["image"]
    img_bytes = file.read()

    try:
        processed = preprocess_image(img_bytes)
        raw_output = float(model.predict(processed)[0][0])  # single sigmoid value 0-1

        is_real = raw_output >= 0.5
        # Confidence = how far the output is from the 0.5 decision boundary
        confidence = (raw_output if is_real else (1 - raw_output)) * 100

        result = {
            "verdict": "real" if is_real else "fake",
            "confidence": round(confidence, 1),
            "raw_model_output": round(raw_output, 4)
        }
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "model_loaded": True}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)  # different port from scam classifier (5000)