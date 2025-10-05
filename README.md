# 🛰️ AIRBENDER — From EarthData to Personalized Action

### Developed by Team NAVI
**Members:**  
- **JEONG AH YOON** — Project Lead & AI Personalization Designer  
- **JIHOON JEONG** — Data Pipeline Architect & Visualization Engineer  
- **JIHO RYU** — Data Scientist & Environmental Data Engineer  

**Challenge:**  
[From EarthData to Action: Cloud Computing with Earth Observation Data for Predicting Cleaner, Safer Skies](https://www.spaceappschallenge.org/2025/challenges/from-earthdata-to-action-cloud-computing-with-earth-observation-data-for-predicting-cleaner-safer-skies)

---

## Project Overview

**AIRBENDER** transforms NASA **TEMPO Level-2 and Level-3 Version 3 datasets** — including **NO₂**, **O₃**, **HCHO**, and **Cloud Fraction** — into **personalized, real-time air-quality intelligence**.  

By fusing satellite observations with meteorological, ground, and urban-context data, AIRBENDER predicts pollution surges, quantifies exposure, and recommends when and where it’s safest to breathe.  

> “From space-based science to everyday life — AIRBENDER turns NASA data into action.”

---

## Demonstration

- **Demo Video:** [https://youtube.com/watch?v=VvfAQruD_C0](https://youtube.com/watch?v=VvfAQruD_C0)  
- **Try AIRBENDER Now:** [https://navi-airbender.replit.app/](https://navi-airbender.replit.app/)  
- **Repository:** [https://github.com/nasa-navi/airbender](https://github.com/nasa-navi/airbender)

---

## The Problem

Most air-quality tools show only city-level averages.  
People make daily choices — when to commute, exercise, or ventilate — without detailed, location-specific guidance.

Although NASA and other agencies provide open atmospheric data, the **user experience remains impersonal**.  
We are **rich in data but poor in personalization** — missing the crucial question:

> “What does this mean for me, right now?”

---

## The Gap

Open datasets (NASA TEMPO, MERRA-2, OpenAQ) exist, but they rarely reach individuals in actionable form.  
Current dashboards show numbers, not meaning.

**AIRBENDER bridges this gap** by combining cloud AI forecasting with large language models that interpret NASA data in a user’s personal context.

---

## Our Solution

AIRBENDER fuses NASA TEMPO data with meteorological covariates to generate hourly nowcasts and short-term forecasts, then **personalizes** the output with a **user context model**.

A large-language-model (LLM) converts raw predictions into natural-language recommendations — adapting tone, timing, and phrasing for each user.

---

##  How It Works

###  Data Acquisition & Preprocessing
- Retrieves **TEMPO NO₂, O₃, HCHO, and Cloud Fraction (CLDO4)** from **NASA Earthdata Cloud** via `earthaccess` API  
- Filters data for NYC region (−74.3 ~ −73.6°, 40.4 ~ 41.0°)  
- Converts NetCDF → CSV using `xarray` and `pandas`  
- Uses **Cloud Fraction** as a **confidence filter**  
- Stores processed files in **Google Cloud Storage (GCS)**

###  Forecasting & Personalization
- Trains **Vertex AI Forecasting** model to predict **hourly O₃ concentration**  
- Features include meteorological variables (temperature, humidity, wind speed) and satellite-derived gases  
- Personalization layer cross-references forecasts with **encrypted user metadata**  
  (occupation / commute hours / exposure / health sensitivity)

####  Model Performance
| Metric | Value |
|:--|--:|
| MAE | 5.639 |
| MAPE | 21.83 |
| RMSE | 7.05 |
| RMSLE | 0.246 |
| R² | 0.569 |

####  Feature Importance
| Rank | Feature | Contribution |
|:--|:--|--:|
| 1 | rh_percent | ~30% |
| 2 | temp_C | ~20% |
| 3 | time_utc | ~15% |
| 4 | o3_ppb (lag) | ~13% |
| 5 | wind_speed_mps | ~9% |
| 6 | hcho_log10 | ~5% |

### Automated Forecasting Pipeline

| Stage | Component | Role |
|:--|:--|:--|
| 1 | TEMPO CSV → GCS | Upload latest data |
| 2 | Vertex AI Forecasting | Batch prediction |
| 3 | GCS Output Bucket | Store `predictions.csv` |
| 4 | Cloud Run / Function | API for apps |
| 5 | Cloud Scheduler | Automation |

➡ **Advantages**
- High accuracy via Vertex AI time-series optimization  
- Fully serverless automation  
- Near real-time updates  
- Scalable & cost-efficient architecture  

---

## Context-Aware Communication
Uses **Qwen 2.5-VL** to turn numeric forecasts into **empathetic messages**, adapting style and timing per user.  
Notifications (e.g., 07:30 brief / 18:00 preview) are delivered via web or email.

---

## Front-End Interface
- Built on **Replit** using HTML/CSS/JS  
- Displays **real-time indices**, **24-hour trends**, and **route-based comparisons**  
- Features dynamic animations created by **Google Gemini Veo 3**, where a tiger character’s behavior reflects air quality  
  (walking in clean air / masking in polluted air)

---

## AI & Cloud Infrastructure

| Component | Role |
|:--|:--|
| **Google Cloud Platform (GCP)** | Cloud storage, forecast pipeline, and API hosting |
| **Vertex AI Forecasting** | PM₂.₅ and O₃ prediction |
| **Qwen 2.5-VL** | Personalized language generation |
| **ChatGPT (GPT-5)** | Text refinement and logo generation |
| **Google Gemini Veo 3** | Character animations |
| **Replit** | Front-end development and deployment |

---

## NASA & Partner Datasets

| Source | Dataset ID | Description |
|:--|:--|:--|
| **NASA TEMPO** | C2930763263-LARC_CLOUD | NO₂ L3 V03 |
|  | C2930761273-LARC_CLOUD | HCHO L3 V03 |
|  | C2930784064-LARC_CLOUD | O₃ L3 V03 (total ozone) |
|  | CLDO4 L2 V03 | Cloud Fraction |
| **Other Data** | OpenAQ   /  Open-Meteo | Ground PM / Meteorology / Weather Profiles |

---

## Impact

### For Citizens & Workers
- Personalized forecasts by location and exposure  
- Context-aware suggestions (e.g., “Delay your commute by 1 hour for cleaner air”)  
- Protects sensitive groups (children, elderly, respiratory patients)

### For Communities & Policy
- Makes NASA TEMPO data interpretable for the public  
- Reveals spatiotemporal pollution patterns  
- Enables data-driven urban planning and awareness  

### For NASA Ecosystem
- Demonstrates TEMPO integration into AI-driven citizen services  
- Provides a reusable cloud pipeline framework  
- Engages the public with NASA open data through personalization  

---

## Future Vision

- **Predictive Analytics:** Longer forecast horizons & richer covariates  
- **Expanded Datasets:** AOD, PM, land use, mobility integration  
- **Partnerships:** Collaboration with municipalities and health agencies  
- **Global Scalability:** Extend to future NASA missions beyond TEMPO  

---

## Case Studies

| User | Situation | Personalized Action |
|:--|:--|:--|
| Urban Commuter | Morning NO₂ spike | Leave 45 min later for cleaner air |
| Outdoor Worker | Afternoon O₃ rise | Split tasks into two cleaner periods |
| Parent of Asthmatic Child | Midday O₃ alert | Move playtime indoors for safety |

---

## Conclusion

**AIRBENDER** connects NASA Earth observations with AI personalization to transform complex atmospheric data into **human-centered, actionable intelligence**.

By scaling across regions and missions, it aims to become a **daily environmental assistant** that helps people **breathe safer, move smarter, and live sustainably** — fulfilling the spirit of  
> **“From EarthData to Action.”**

---
