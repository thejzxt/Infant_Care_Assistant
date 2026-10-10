import requests

url = "http://127.0.0.1:5001/detect-cry"

audio_file = open("datasets/sleepiness/03ADDCFB-354E-416D-BF32-260CF47F7060-1433658024-1.1-f-04-ti_pitch.wav", "rb")

files = {
    "audio": ("test.wav", audio_file, "audio/wav")
}

response = requests.post(url, files=files)

print(response.json())