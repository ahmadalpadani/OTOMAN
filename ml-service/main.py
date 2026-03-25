from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path

app = FastAPI(title="OTOMAN ML Service")

MODEL_PATH = Path("model/car_price_pipeline.joblib")
model = joblib.load(MODEL_PATH)

class PredictionRequest(BaseModel):
    brand: str
    model: str
    model_year: int
    milage: float
    fuel_type: str
    transmission: str
    accident: str
    clean_title: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(payload: PredictionRequest):
    data = pd.DataFrame([payload.dict()])
    pred = model.predict(data)[0]

    low = pred * 0.9
    high = pred * 1.1

    return {
        "predicted_price": round(float(pred), 2),
        "price_low": round(float(low), 2),
        "price_high": round(float(high), 2),
        "currency": "USD"
    }