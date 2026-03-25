import json
import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA_PATH = Path("data/used_cars.csv")
MODEL_DIR = Path("model")
MODEL_DIR.mkdir(exist_ok=True)

# Kurs BI JISDOR USD/IDR per 25 Maret 2026
USD_TO_IDR = 16905

CURRENT_YEAR = 2026


def clean_price(x):
    return float(str(x).replace("$", "").replace(",", "").strip())


def clean_milage(x):
    return float(str(x).replace(" mi.", "").replace(",", "").strip())


def normalize_accident(x):
    x = str(x).strip().lower()
    if x == "none reported":
        return "No"
    if "accident" in x or "damage" in x:
        return "Yes"
    return "Unknown"


def normalize_clean_title(x):
    return "Yes" if str(x).strip() == "Yes" else "No"


def normalize_fuel_type(x):
    x = str(x).strip()
    if x in ["", "nan", "None", "–", "not supported"]:
        return "Unknown"
    return x


def normalize_transmission(x):
    x = str(x).lower()
    if "manual" in x or "m/t" in x:
        return "Manual"
    if "cvt" in x:
        return "CVT"
    if "dual shift" in x or "dct" in x:
        return "Dual Shift"
    if "automatic" in x or "a/t" in x:
        return "Automatic"
    return "Other"


def extract_engine_hp(x):
    match = re.search(r"(\d+\.?\d*)\s*HP", str(x), flags=re.IGNORECASE)
    return float(match.group(1)) if match else np.nan


def extract_engine_liters(x):
    match = re.search(r"(\d+\.?\d*)\s*L", str(x), flags=re.IGNORECASE)
    return float(match.group(1)) if match else np.nan


def extract_engine_cylinders(x):
    match = re.search(r"(\d+)\s*Cylinder", str(x), flags=re.IGNORECASE)
    return float(match.group(1)) if match else np.nan


def load_and_prepare_data():
    df = pd.read_csv(DATA_PATH)

    df["price"] = df["price"].apply(clean_price)
    df["milage"] = df["milage"].apply(clean_milage)
    df["accident"] = df["accident"].apply(normalize_accident)
    df["clean_title"] = df["clean_title"].apply(normalize_clean_title)
    df["fuel_type"] = df["fuel_type"].apply(normalize_fuel_type)
    df["transmission"] = df["transmission"].apply(normalize_transmission)

    df["engine_hp"] = df["engine"].apply(extract_engine_hp)
    df["engine_liters"] = df["engine"].apply(extract_engine_liters)
    df["engine_cylinders"] = df["engine"].apply(extract_engine_cylinders)

    df["car_age"] = CURRENT_YEAR - df["model_year"]
    df["brand_model"] = df["brand"].astype(str) + "__" + df["model"].astype(str)

    # Trim outlier ekstrem agar training lebih stabil
    low_q = df["price"].quantile(0.01)
    high_q = df["price"].quantile(0.99)
    df = df[(df["price"] >= low_q) & (df["price"] <= high_q)].copy()

    return df


def build_pipeline():
    categorical_features = [
        "brand",
        "model",
        "brand_model",
        "fuel_type",
        "transmission",
        "accident",
        "clean_title",
        "ext_col",
        "int_col",
    ]

    numeric_features = [
        "model_year",
        "car_age",
        "milage",
        "engine_hp",
        "engine_liters",
        "engine_cylinders",
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", OneHotEncoder(handle_unknown="ignore", min_frequency=5)),
                    ]
                ),
                categorical_features,
            ),
            (
                "num",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                    ]
                ),
                numeric_features,
            ),
        ]
    )

    model = ExtraTreesRegressor(
        n_estimators=500,
        random_state=42,
        n_jobs=-1,
        min_samples_leaf=1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    return pipeline, categorical_features, numeric_features


def build_metadata(df, mae_usd, r2):
    brand_list = sorted(df["brand"].dropna().unique().tolist())
    models_by_brand = {
        brand: sorted(
            df.loc[df["brand"] == brand, "model"].dropna().unique().tolist()
        )
        for brand in brand_list
    }

    metadata = {
        "brands": brand_list,
        "models_by_brand": models_by_brand,
        "fuel_types": sorted(df["fuel_type"].dropna().unique().tolist()),
        "transmissions": ["Automatic", "Manual", "CVT", "Dual Shift", "Other"],
        "accident_options": ["Yes", "No", "Unknown"],
        "clean_title_options": ["Yes", "No"],
        "usd_to_idr": USD_TO_IDR,
        "metrics": {
            "mae_usd": round(float(mae_usd), 2),
            "mae_idr": round(float(mae_usd * USD_TO_IDR), 2),
            "r2": round(float(r2), 4),
        },
        "target_currency": "USD",
        "display_currency": "IDR",
    }
    return metadata


def main():
    df = load_and_prepare_data()

    features = [
        "brand",
        "model",
        "brand_model",
        "model_year",
        "car_age",
        "milage",
        "fuel_type",
        "transmission",
        "accident",
        "clean_title",
        "engine_hp",
        "engine_liters",
        "engine_cylinders",
        "ext_col",
        "int_col",
    ]

    X = df[features].copy()
    y = np.log1p(df["price"].copy())

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipeline, categorical_features, numeric_features = build_pipeline()
    pipeline.fit(X_train, y_train)

    pred_log = pipeline.predict(X_test)
    pred_usd = np.expm1(pred_log)
    y_test_usd = np.expm1(y_test)

    mae_usd = mean_absolute_error(y_test_usd, pred_usd)
    r2 = r2_score(y_test_usd, pred_usd)

    joblib.dump(pipeline, MODEL_DIR / "car_price_pipeline.joblib")

    metadata = build_metadata(df, mae_usd, r2)
    with open(MODEL_DIR / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print("Training selesai")
    print(f"MAE (USD): {mae_usd:.2f}")
    print(f"MAE (IDR): {mae_usd * USD_TO_IDR:.2f}")
    print(f"R2: {r2:.4f}")


if __name__ == "__main__":
    main()