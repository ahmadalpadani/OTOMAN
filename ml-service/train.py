import pandas as pd
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from pathlib import Path

DATA_PATH = "data/used_cars.csv"
MODEL_DIR = Path("model")
MODEL_DIR.mkdir(exist_ok=True)

def clean_price(x):
    return float(str(x).replace("$", "").replace(",", "").strip())

def clean_milage(x):
    return float(str(x).replace(" mi.", "").replace(",", "").strip())

def map_accident(x):
    x = str(x).strip()
    if x == "None reported":
        return "No"
    elif "accident" in x.lower() or "damage" in x.lower():
        return "Yes"
    return "No"

def map_clean_title(x):
    return "Yes" if str(x).strip() == "Yes" else "No"

def map_transmission(x):
    x = str(x).lower()
    if "manual" in x or "m/t" in x:
        return "Manual"
    if "automatic" in x or "a/t" in x or "dual shift" in x:
        return "Automatic"
    return "Other"

df = pd.read_csv(DATA_PATH)

df["price"] = df["price"].apply(clean_price)
df["milage"] = df["milage"].apply(clean_milage)
df["accident"] = df["accident"].apply(map_accident)
df["clean_title"] = df["clean_title"].apply(map_clean_title)
df["transmission"] = df["transmission"].apply(map_transmission)

features = [
    "brand", "model", "model_year", "milage",
    "fuel_type", "transmission", "accident", "clean_title"
]
target = "price"

df = df[features + [target]].dropna()

X = df[features]
y = df[target]

categorical_features = ["brand", "model", "fuel_type", "transmission", "accident", "clean_title"]
numeric_features = ["model_year", "milage"]

preprocessor = ColumnTransformer([
    ("cat", Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ]), categorical_features),
    ("num", Pipeline([
        ("imputer", SimpleImputer(strategy="median"))
    ]), numeric_features)
])

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", RandomForestRegressor(n_estimators=200, random_state=42))
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipeline.fit(X_train, y_train)

preds = pipeline.predict(X_test)
mae = mean_absolute_error(y_test, preds)
r2 = r2_score(y_test, preds)

joblib.dump(pipeline, MODEL_DIR / "car_price_pipeline.joblib")

with open(MODEL_DIR / "metadata.json", "w") as f:
    json.dump({
        "features": features,
        "mae": mae,
        "r2": r2
    }, f, indent=2)

print("Training selesai")
print("MAE:", mae)
print("R2:", r2)