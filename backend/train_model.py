"""
train_model.py
Trains a local, free TF-IDF + Logistic Regression scam classifier.
Run this ONCE to generate the model files (scam_model.pkl, vectorizer.pkl).
No API key or internet required.
"""

import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Load training data
with open("training_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts = data["scam"] + data["normal"]
labels = [1] * len(data["scam"]) + [0] * len(data["normal"])  # 1 = scam, 0 = normal

print(f"Total samples: {len(texts)} ({len(data['scam'])} scam, {len(data['normal'])} normal)")

# Split into train/test so we can report real accuracy
X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.25, random_state=42, stratify=labels
)

# TF-IDF vectorizer: converts text into numeric features
vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words=None)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Logistic Regression classifier
model = LogisticRegression(max_iter=1000, class_weight="balanced")
model.fit(X_train_vec, y_train)

# Evaluate
y_pred = model.predict(X_test_vec)
print("\n--- Model Evaluation on Held-Out Test Set ---")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
print(classification_report(y_test, y_pred, target_names=["normal", "scam"]))

# Retrain on FULL dataset for the actual saved model (more data = better)
X_full_vec = vectorizer.fit_transform(texts)
model.fit(X_full_vec, labels)

# Save model + vectorizer
joblib.dump(model, "scam_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("\nModel and vectorizer saved as scam_model.pkl and vectorizer.pkl")
print("You can now run app.py to serve predictions.")