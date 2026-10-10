import librosa
import numpy as np

audio_file = "test1_converted.wav"   # your test audio file

y, sr = librosa.load(audio_file, sr=16000)

# Extract MFCC features
mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
mfcc_mean = np.mean(mfcc.T, axis=0)

# Extract Zero Crossing Rate
zcr = np.mean(librosa.feature.zero_crossing_rate(y))

# Extract Spectral Centroid
centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))

features = np.hstack([mfcc_mean, zcr, centroid])

print("Extracted Features:")
print(features)
print("Feature vector length:", len(features))