from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import numpy as np
import pickle
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="🍎 Food Rater API")
model_load=pickle.load(open('model.pkl','rb'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Content(BaseModel):
    calories: float
    protein_g: float
    fat_g: float
    sat_fat_g: float
    trans_fat_g: float
    carbs_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: float
    potassium_mg: float
    calcium_mg: float
    has_processed_meat: float
    has_red_meat: float
    has_trans_fats: float
    has_artificial_colors: float
    has_preservatives: float
    preservative_count: float
    is_male_flag: float
    carcinogen_flag: float
    habitat_region: float
    age_group: float
    near_equator: float
    urbanicity: float
    bp_flag: float
    pregnancy_flag: float
    diabetes_flag: float
    cardiac_flag: float
    bmi_class: float

@app.post("/predict")
def predict(request: Content):
    features = np.array([[
        request.calories, request.protein_g, request.fat_g, request.sat_fat_g,
        request.trans_fat_g, request.carbs_g, request.fiber_g, request.sugar_g,
        request.sodium_mg, request.potassium_mg, request.calcium_mg,
        request.has_processed_meat, request.has_red_meat, request.has_trans_fats,
        request.has_artificial_colors, request.has_preservatives,
        request.preservative_count, request.is_male_flag, request.carcinogen_flag,
        request.habitat_region, request.age_group, request.near_equator,
        request.urbanicity, request.bp_flag, request.pregnancy_flag,
        request.diabetes_flag, request.cardiac_flag, request.bmi_class
    ]])
    features=np.reshape(features,(1,-1))
    res = model_load.predict(features)

    # Interpret prediction
    if isinstance(res[0], (list, np.ndarray)) and len(res[0]) >= 2:
        rating = float(res[0][0])
        disease_code = int(res[0][1])
    else:
        rating = float(res[0]) if np.isscalar(res[0]) else float(res[0][0])
        disease_code = -1

    disease_map = {
        0: "Cardiac issue",
        1: "Diabetes",
        2: "High cholesterol",
        3: "Hypertension",
        5: "Obesity"
    }

    return {"rating": rating, "predicted_disease": disease_map.get(disease_code, "None")}
@app.get('/health')
def health():
  return "server is running properly"
