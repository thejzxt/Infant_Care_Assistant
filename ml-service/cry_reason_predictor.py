import joblib
import numpy as np

# Load trained model
model = joblib.load("cry_reason_model.pkl")

def predict_cry_reason(audio_features):

    # 🔹 get prediction
    prediction = model.predict([audio_features])[0]

    # 🔹 get probabilities
    probs = model.predict_proba([audio_features])[0]

    classes = model.classes_

    scores = {}

    for i, label in enumerate(classes):
        scores[str(label)] = float(probs[i])

    return prediction, scores