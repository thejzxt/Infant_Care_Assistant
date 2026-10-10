from feature_extractor import extract_features
from cry_reason_predictor import predict_cry_reason

# Use any audio from your dataset
audio_path = "datasets/belly_pain/69BDA5D6-0276-4462-9BF7-951799563728-1436936185-1.1-m-26-bp.wav"

features = extract_features(audio_path)

prediction = predict_cry_reason(features)

print("Predicted cry reason:", prediction)