import os
from yamnet_model import detect_cry
from feature_extractor import extract_features

audio_file = "babyCry.m4a"

print("Checking cry detection...")

is_cry, label = detect_cry(audio_file)

print("Is Cry:", is_cry)
print("Detected Label:", label)

if is_cry:

    print("\nCry detected → extracting features")

    features = extract_features(audio_file)

    print("\nExtracted Features:")
    print(features)

    print("Feature length:", len(features))

else:
    print("\nAudio is not a baby cry")