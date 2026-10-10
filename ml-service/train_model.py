import os
import numpy as np
import joblib
from tqdm import tqdm
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils import shuffle   # ✅ added
from feature_extractor import extract_features

DATASET_PATH = "datasets"

X = []
y = []

print("Starting dataset processing...")

for label in os.listdir(DATASET_PATH):

    label_path = os.path.join(DATASET_PATH, label)

    if not os.path.isdir(label_path):
        continue

    print(f"\nProcessing class: {label}")

    for file in tqdm(os.listdir(label_path)):

        file_path = os.path.join(label_path, file)

        try:
            features = extract_features(file_path)

            X.append(features)
            y.append(label)

        except Exception as e:
            print("Error processing:", file_path)

X = np.array(X)
y = np.array(y)

print("\nTotal samples processed:", len(X))

# ✅ Shuffle dataset (important)
X, y = shuffle(X, y, random_state=42)

# Train model
model = RandomForestClassifier(
    n_estimators=300,        # ✅ slightly increased
    class_weight="balanced", # already good
    random_state=42
)

print("\nTraining model...")

model.fit(X, y)

# Save model
joblib.dump(model, "cry_reason_model.pkl")

print("\nModel training complete!")
print("Model saved as cry_reason_model.pkl")