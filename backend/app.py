"""
app.py
Free version - uses a locally trained ML model (no API key, no cost).
Run train_model.py first to generate scam_model.pkl and vectorizer.pkl.
"""

import os
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- Load the locally trained model (free, offline, no API needed) ---
MODEL_PATH = "scam_model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
    raise FileNotFoundError(
        "Model files not found. Run 'python train_model.py' first to train and save the model."
    )

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

# --- Rules layer: keyword signals commonly seen in digital arrest / scam scripts ---
SCAM_KEYWORDS = [
    "cbi", "ed officer", "enforcement directorate", "customs department", "digital arrest",
    "stay on video call", "do not disconnect", "maintain secrecy",
    "aadhaar", "money laundering", "narcotics", "drugs",
    "arrest warrant", "supreme court order", "rbi verification",
    "share otp", "verify upi pin", "upi pin", "refundable deposit", "trai notice",
    "sim card block", "court notice", "fedex parcel", "customs seized",
    "non-bailable warrant", "income tax department", "kyc", "cvv"
]

def keyword_matches(text: str):
    text_lower = text.lower()
    return [kw for kw in SCAM_KEYWORDS if kw in text_lower]


def classify_scam_type(matched_keywords, text_lower):
    if any(k in matched_keywords for k in ["cbi", "ed officer", "enforcement directorate", "digital arrest", "arrest warrant", "non-bailable warrant"]):
        return "digital_arrest"
    if any(k in matched_keywords for k in ["upi pin", "verify upi pin", "cvv"]):
        return "upi_fraud"
    if "kyc" in matched_keywords or "link" in text_lower:
        return "phishing"
    if "lottery" in text_lower or "won" in text_lower or "prize" in text_lower:
        return "lottery_scam"
    if matched_keywords:
        return "other"
    return "none"


@app.route("/api/analyze-message", methods=["POST"])
def analyze_message():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field in request body"}), 400

    message_text = data["text"].strip()
    if not message_text:
        return jsonify({"error": "Empty message text"}), 400

    # ML model prediction
    vec = vectorizer.transform([message_text])
    prediction = model.predict(vec)[0]  # 0 = normal, 1 = scam
    probabilities = model.predict_proba(vec)[0]  # [P(normal), P(scam)]
    scam_probability = probabilities[1]

    # Keyword rules layer (adds explainability + catches edge cases)
    matched_keywords = keyword_matches(message_text)

    # Combine ML + rules into a final risk verdict
    if prediction == 1 and scam_probability >= 0.75:
        risk = "high"
    elif prediction == 1 or (matched_keywords and scam_probability >= 0.4):
        risk = "medium"
    elif matched_keywords:
        risk = "medium"
    else:
        risk = "low"

    scam_type = classify_scam_type(matched_keywords, message_text.lower())

    reason_parts = []
    if prediction == 1:
        reason_parts.append(f"Our ML model classified this as scam-like with {scam_probability*100:.0f}% confidence.")
    else:
        reason_parts.append(f"Our ML model found this mostly consistent with normal messages ({(1-scam_probability)*100:.0f}% confidence).")
    if matched_keywords:
        reason_parts.append(f"Detected {len(matched_keywords)} known scam-pattern keyword(s): {', '.join(matched_keywords[:5])}.")

    recommended_action = (
        "Do not share OTP, UPI PIN, or bank details. Hang up and verify independently via official helpline 1930 or the agency's official website."
        if risk in ("high", "medium")
        else "This message appears safe, but always verify unfamiliar requests independently."
    )

    result = {
        "risk": risk,
        "confidence": round(float(scam_probability) * 100, 1),
        "scam_type": scam_type,
        "reason": " ".join(reason_parts),
        "recommended_action": recommended_action,
        "matched_keywords": matched_keywords,
        "keyword_hit_count": len(matched_keywords),
        "ml_prediction": "scam" if prediction == 1 else "normal"
    }

    return jsonify(result), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "model_loaded": True}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)