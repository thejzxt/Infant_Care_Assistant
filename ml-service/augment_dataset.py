import os
import numpy as np
import librosa
import soundfile as sf
from tqdm import tqdm
from pydub import AudioSegment

DATASET_PATH = "datasets"

TARGET_PER_CLASS = 700   # desired dataset size per class

def add_noise(y):
    noise = np.random.normal(0, 0.005, len(y))
    return y + noise

def pitch_shift(y, sr):
    return librosa.effects.pitch_shift(y, sr=sr, n_steps=2)

def time_stretch(y):
    return librosa.effects.time_stretch(y, rate=1.1)

# ✅ NEW: increase volume
def increase_volume(y, factor=1.5):
    y_loud = y * factor
    y_loud = np.clip(y_loud, -1.0, 1.0)
    return y_loud

# ✅ NEW: decrease volume
def decrease_volume(y, factor=0.5):
    return y * factor

def convert_to_phone_audio(path):
    audio = AudioSegment.from_file(path)
    m4a_path = path.replace(".wav", "_phone.m4a")
    wav_back = path.replace(".wav", "_phone.wav")

    audio.export(m4a_path, format="ipod")
    AudioSegment.from_file(m4a_path).export(wav_back, format="wav")

    os.remove(m4a_path)
    return wav_back


for label in os.listdir(DATASET_PATH):

    label_path = os.path.join(DATASET_PATH, label)

    if not os.path.isdir(label_path):
        continue

    files = [f for f in os.listdir(label_path) if f.endswith(".wav")]

    print("Processing:", label)
    print("Original files:", len(files))

    current_count = len(files)

    for file in tqdm(files):

        if current_count >= TARGET_PER_CLASS:
            break

        path = os.path.join(label_path, file)

        y, sr = librosa.load(path, sr=16000)

        # Add noise
        y_noise = add_noise(y)
        sf.write(path.replace(".wav", "_noise.wav"), y_noise, sr)
        current_count += 1
        if current_count >= TARGET_PER_CLASS:
            break

        # Pitch shift
        y_pitch = pitch_shift(y, sr)
        sf.write(path.replace(".wav", "_pitch.wav"), y_pitch, sr)
        current_count += 1
        if current_count >= TARGET_PER_CLASS:
            break

        # Time stretch
        y_speed = time_stretch(y)
        sf.write(path.replace(".wav", "_speed.wav"), y_speed, sr)
        current_count += 1
        if current_count >= TARGET_PER_CLASS:
            break

        # ✅ NEW: Increase volume
        y_loud = increase_volume(y)
        sf.write(path.replace(".wav", "_loud.wav"), y_loud, sr)
        current_count += 1
        if current_count >= TARGET_PER_CLASS:
            break

        # ✅ NEW: Decrease volume
        y_quiet = decrease_volume(y)
        sf.write(path.replace(".wav", "_quiet.wav"), y_quiet, sr)
        current_count += 1
        if current_count >= TARGET_PER_CLASS:
            break

        # Phone-like audio
        convert_to_phone_audio(path)
        current_count += 1

    print("Final dataset size:", current_count)