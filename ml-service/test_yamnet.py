import os
from yamnet_model import detect_cry

print("Current working directory:", os.getcwd())
print("Files in this folder:", os.listdir())

result, label = detect_cry("babyCry.m4a")

print("Is Cry:", result)
print("Detected Label:", label)