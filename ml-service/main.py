from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import numpy as np
from pathlib import Path

app = FastAPI(title="OTOMAN ML Service")

MODEL_PATH = Path("model/car_price_pipeline.joblib")
METADATA_PATH = Path("model/metadata.json")

model = joblib.load(MODEL_PATH)

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)

USD_TO_IDR = metadata.get("usd_to_idr", 16905)


class PredictionRequest(BaseModel):
    brand: str
    model: str
    model_year: int
    milage: float
    fuel_type: str
    transmission: str
    accident: str
    clean_title: str
    engine: str | None = None
    ext_col: str | None = None
    int_col: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/form-options")
def form_options():
    return metadata


def extract_engine_hp(x):
    import re
    match = re.search(r"(\d+\.?\d*)\s*HP", str(x), flags=re.IGNORECASE)
    return float(match.group(1)) if match else np.nan


def extract_engine_liters(x):
    import re
    match = re.search(r"(\d+\.?\d*)\s*L", str(x), flags=re.IGNORECASE)
    return float(match.group(1)) if match else np.nan


def extract_engine_cylinders(x):
    import re
    match = re.search(r"(\d+)\s*Cylinder", str(x), flags=re.IGNORECASE)
    return float(match.group(1)) if match else np.nan


@app.post("/predict")
def predict(payload: PredictionRequest):
    row = payload.model_dump()

    row["car_age"] = 2026 - row["model_year"]
    row["brand_model"] = f'{row["brand"]}__{row["model"]}'
    row["engine_hp"] = extract_engine_hp(row.get("engine"))
    row["engine_liters"] = extract_engine_liters(row.get("engine"))
    row["engine_cylinders"] = extract_engine_cylinders(row.get("engine"))

    data = pd.DataFrame([row])

    pred_log = model.predict(data)[0]
    pred_usd = float(np.expm1(pred_log))

    low_usd = pred_usd * 0.9
    high_usd = pred_usd * 1.1

    pred_idr = pred_usd * USD_TO_IDR
    low_idr = low_usd * USD_TO_IDR
    high_idr = high_usd * USD_TO_IDR

    return {
        "predicted_price": round(pred_idr, 0),
        "price_low": round(low_idr, 0),
        "price_high": round(high_idr, 0),
        "currency": "IDR",
        "exchange_rate_usd_to_idr": USD_TO_IDR,
        "raw_usd_prediction": round(pred_usd, 2)
    }