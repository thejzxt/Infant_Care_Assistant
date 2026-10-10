from flask import Flask, request, jsonify
from yamnet_model import detect_cry
from feature_extractor import extract_features
from cry_reason_predictor import predict_cry_reason
import os
import uuid
import traceback

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/detect-cry", methods=["POST"])
def detect_cry_api():
    try:
        # 🔹 Check if file exists
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        file = request.files["audio"]

        if file.filename == "":
            return jsonify({"error": "Empty file name"}), 400

        # 🔹 Create unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

        # 🔹 Save file
        file.save(file_path)

        print(f"Saved file: {file_path}")

        # 🔹 Run YAMNet detection
        is_cry, message, wav_path = detect_cry(file_path)

        cry_reason = None

        # 🔹 If cry detected → extract features automatically
        if is_cry:
            print("Cry detected → extracting audio features")
            features = extract_features(wav_path)
            print("Feature length:", len(features))

            # 🔹 Predict cry reason using trained model
            cry_reason , scores= predict_cry_reason(features)
            print("Predicted reason:", cry_reason)
            print("Scores:", scores)

        # 🔹 Delete file after processing (optional but recommended)
        if os.path.exists(file_path):
            os.remove(file_path)

        if os.path.exists(wav_path) and wav_path != file_path:
            os.remove(wav_path)

        # 🔹 Return clean response
        return jsonify({
            "success": True,
            "isCry": is_cry,
            "message": message,
            "reason": cry_reason,
            "scores": scores
        })

    except Exception as e:
        print("Error during detection:")
        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


if __name__ == "__main__":
    # 🔹 Make accessible to other devices (important for mobile testing)
    app.run(host="0.0.0.0", port=5001)