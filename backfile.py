# app.py
import os
import json
import time
import requests
from flask import Flask, request, jsonify
from google.cloud import storage, aiplatform

app = Flask(__name__)

# 🔹 환경 변수
PROJECT_ID = "your-gcp-project"
LOCATION = "us-central1"
BUCKET_NAME = "your-bucket"
MODEL_ID = "your-vertex-model-id"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "your-service-key.json"

# ============================================
# 1️⃣ TEMPO CSV 업로드 → GCS
# ============================================
def upload_to_gcs(local_file, bucket_name, destination_blob):
    client = storage.Client(project=PROJECT_ID)
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob)
    blob.upload_from_filename(local_file)
    print(f"✅ Uploaded {local_file} → gs://{bucket_name}/{destination_blob}")
    return f"gs://{bucket_name}/{destination_blob}"

# ============================================
# 2️⃣ Vertex AI Forecast 예측 요청
# ============================================
def run_forecast(input_gcs_path):
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    model = aiplatform.Model(MODEL_ID)

    batch_job = model.batch_predict(
        job_display_name="tempo_forecast_job",
        gcs_source=input_gcs_path,
        gcs_destination_prefix=f"gs://{BUCKET_NAME}/output/",
        instances_format="csv",
        predictions_format="csv"
    )

    batch_job.wait()
    print("✅ Forecast complete")
    return f"gs://{BUCKET_NAME}/output/"

# ============================================
# 3️⃣ GCS → 예측 결과 다운로드
# ============================================
def download_latest_result():
    client = storage.Client(project=PROJECT_ID)
    blobs = list(client.list_blobs(BUCKET_NAME, prefix="output/"))
    latest = sorted(blobs, key=lambda x: x.time_created)[-1]
    local_file = "forecast_result.csv"
    latest.download_to_filename(local_file)
    print(f"✅ Downloaded {latest.name}")
    return local_file

# ============================================
# 4️⃣ Qwen 모델 호출 (로컬 or HuggingFace)
# ============================================
def generate_personalized_message(user_profile, forecast_data):
    prompt = f"""
    You are a helpful AI assistant.
    Using the following user profile and forecast data, generate a short, natural-language alert.

    User profile:
    {json.dumps(user_profile, indent=2)}

    Forecast data:
    {forecast_data}

    Output in the user's preferred language (English or Korean).
    """

    response = requests.post(
        "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct",
        headers={"Authorization": f"Bearer {os.environ['HF_TOKEN']}"},
        json={"inputs": prompt},
    )

    result = response.json()
    return result[0]["generated_text"]

# ============================================
# 5️⃣ Replit API endpoint
# ============================================
@app.route("/generate_alert", methods=["POST"])
def generate_alert():
    data = request.get_json()
    user_profile = data.get("user_profile")

    # Step 1: Upload CSV
    input_gcs = upload_to_gcs("tempo_input.csv", BUCKET_NAME, "input/tempo_input.csv")

    # Step 2: Run Vertex forecast
    run_forecast(input_gcs)

    # Step 3: Download result
    forecast_csv = download_latest_result()
    with open(forecast_csv) as f:
        forecast_data = f.read()

    # Step 4: Generate Qwen alert
    message = generate_personalized_message(user_profile, forecast_data)

    return jsonify({"alert_message": message})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)