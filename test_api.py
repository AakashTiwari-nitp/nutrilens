import requests
url="http://127.0.0.1:8000/predict"
data = {
    "calories": 100,
    "protein_g": 2,
    "fat_g": 1,
    "sat_fat_g": 1,
    "trans_fat_g": 0,
    "carbs_g": 0,
    "fiber_g": 0,
    "sugar_g": 0,
    "sodium_mg": 0,
    "potassium_mg": 1,
    "calcium_mg": 1,
    "has_processed_meat":0,
    "has_red_meat":0,
    "has_trans_fats":0,
    "has_artificial_colors":0,
    "has_preservatives":0,
    "preservative_count":0,
    "is_male_flag":0,
    "carcinogen_flag":0,
    "habitat_region":0,
    "age_group":0,
    "near_equator":0,
    "urbanicity":0,
    "bp_flag":0,
    "pregnancy_flag":0,
    "diabetes_flag":0,
    "cardiac_flag":0,
    "bmi_class":0,
}
response=requests.post(url,json=data)
print(response.json())