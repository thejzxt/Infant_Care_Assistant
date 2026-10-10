import tensorflow_hub as hub
import numpy as np
import librosa
from pydub import AudioSegment
import csv
import os

print("Loading YAMNet model...")

yamnet_model = hub.load("https://tfhub.dev/google/yamnet/1")

# Properly load only display_name (skip CSV header automatically)
class_map_path = yamnet_model.class_map_path().numpy()

with open(class_map_path, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    class_names = [row['display_name'] for row in reader]

print("YAMNet Loaded Successfully!")


# 🔹 Convert m4a → wav automatically
def convert_to_wav_if_needed(audio_path):
    if audio_path.lower().endswith(".m4a"):
        print("Converting M4A to WAV (16kHz mono)...")

        sound = AudioSegment.from_file(audio_path, format="m4a")
        sound = sound.set_frame_rate(16000).set_channels(1)

        wav_path = audio_path.replace(".m4a", "_converted.wav")
        sound.export(wav_path, format="wav")

        return wav_path

    return audio_path

def detect_cry(audio_path):

    # Convert if needed
    audio_path = convert_to_wav_if_needed(audio_path)

    # Load audio as 16kHz mono
    waveform, sr = librosa.load(audio_path, sr=16000, mono=True)

    scores, embeddings, spectrogram = yamnet_model(waveform)
    scores = scores.numpy()

    mean_scores = np.mean(scores, axis=0)

    cry_keywords = ["cry", "infant", "sobbing", "whimper", "screaming"]

    cry_score = 0.0
    cry_labels_detected = []

    for i, label in enumerate(class_names):
        if any(keyword in label.lower() for keyword in cry_keywords):
            cry_score += mean_scores[i]
            cry_labels_detected.append((label, float(mean_scores[i])))

    print("\nCry-related predictions:")
    for label, score in cry_labels_detected:
        if score > 0.01:
            print(label, ":", round(score, 3))

    print("\nTotal Cry Score:", round(cry_score, 3))

    threshold = 0.05

    if cry_score > threshold:
        return True, f"Cry detected (score={round(cry_score,3)})", audio_path
    else:
        return False, f"No cry (score={round(cry_score,3)})", audio_path