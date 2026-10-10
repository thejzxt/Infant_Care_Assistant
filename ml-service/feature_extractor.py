import librosa
import numpy as np

def extract_features(audio_path):

    y, sr = librosa.load(audio_path, sr=16000)

    # Normalize audio (important for phone recordings)
    y = librosa.util.normalize(y)
    y, _ = librosa.effects.trim(y)

    # MFCC
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    mfcc_mean = np.mean(mfcc, axis=1)

    # Delta MFCC
    delta = librosa.feature.delta(mfcc)
    delta_mean = np.mean(delta, axis=1)

    # Delta-Delta MFCC
    delta2 = librosa.feature.delta(mfcc, order=2)
    delta2_mean = np.mean(delta2, axis=1)

    # Spectral features
    centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    bandwidth = np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
    rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))

    # Energy
    rms = np.mean(librosa.feature.rms(y=y))

    # Zero Crossing Rate
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))

    features = np.hstack([
        mfcc_mean,
        delta_mean,
        delta2_mean,
        centroid,
        bandwidth,
        rolloff,
        rms,
        zcr
    ])

    return features