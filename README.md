# 🛰️ AIRBENDER : From EarthData to Personalized Action

**AIRBENDER** is a real-time, personalized air-quality intelligence platform that transforms **NASA TEMPO** satellite data into individualized forecasts and actionable guidance.  
Developed by **Team NAVI** for the **NASA Space Apps Challenge 2025**, it bridges space-based science and everyday life - helping people breathe safer, live smarter, and stay informed in real time.

---

## Overview

AIRBENDER turns NASA TEMPO Level-2 and Level-3 Version 3 data - including **NO₂, O₃, HCHO, and Cloud Fraction (CLDO4)** - into personalized, human-centric air-quality intelligence.  
Unlike conventional dashboards showing city-level indices, AIRBENDER adapts forecasts to each user's **location, routine, and health context**, combining cloud computing and large language models (LLMs) to deliver empathetic, actionable insights.

---

## What Exactly Does It Do?

AIRBENDER continuously retrieves and processes NASA TEMPO data through a cloud pipeline built on the **Google Cloud Platform (GCP)**.  
It generates hourly nowcasts and short-term forecasts that are:
- Location-specific  
- Context-aware  
- Personalized to user profiles  

Based on these predictions, a **large language model (LLM)** converts scientific outputs into natural, human-like messages - adjusting tone, timing, and phrasing to fit each user’s lifestyle and preferences.

---

## How It Works

### 1. Data Acquisition and Preprocessing
- Connects to the **NASA Earthdata Cloud** using the *earthaccess API*  
- Retrieves TEMPO **NO₂, O₃, HCHO**, and **Cloud Fraction (CLDO4)** datasets  
- Filters by geographic coordinates (e.g., NYC: −74.3 to −73.6°, 40.4 to 41.0°)  
- Converts NetCDF → structured time-series using *xarray* and *pandas*  
- Stores cleaned data in **Google Cloud Storage** with version control  

### 2. Forecasting and Personalization
- Uses a lightweight AI model on **Google Cloud Run**  
- Combines historical TEMPO data with meteorological covariates  
- Cross-references forecasts with each user’s encrypted metadata:
  - Occupation  
  - Outdoor exposure  
  - Commute schedule  
  - Health sensitivity  
- Produces individualized forecast layers for each user  

### 3. Context-Aware Communication
- Integrated **LLM (Qwen 2.5-VL)** generates human-like recommendations  
- Adapts message tone and timing dynamically  
- Sends alerts via push/email notifications (e.g., “07:30 morning brief”, “18:00 preview”)  

### 4. Continuous Improvement
- Modular design supports easy integration of:
  - **AOD (Aerosol Optical Depth)** data  
  - Ground-station PM₂.₅ / PM₁₀  
  - Future **TEMPO V04** products  
- Scalable architecture enables global deployment  

---

## Benefits

### Personal Impact
- Provides **real-time, personalized forecasts** per user  
- Issues actionable, empathetic recommendations like  
  *“Delay your commute by one hour for cleaner air.”*  
- Protects sensitive groups (children, elderly, respiratory patients)  
- Encourages preventive behavior (mask use, ventilation timing, exercise scheduling)  

### Social and Environmental Impact
- Makes NASA TEMPO data accessible and interpretable to the public  
- Supports **urban planners and local authorities** in identifying pollution patterns  
- Promotes data-driven awareness and community-level behavioral change  

### Scientific and Technological Contribution
- Demonstrates how **TEMPO L3 V03** can power citizen-facing AI services  
- Provides a reusable framework for merging satellite data + AI personalization  
- Fosters public engagement with NASA open data  

### Long-Term Vision
- Envisions a world where **everyone receives personalized environmental intelligence**  
- Expands beyond TEMPO to other satellite missions, connecting people globally to NASA’s Earth science ecosystem  

---

## Project Goals

AIRBENDER aims to evolve into a **cloud-based environmental intelligence agent** -  
a personal assistant that interprets NASA Earth observation data in real time.  

It embodies the Space Apps theme **“From EarthData to Action”** by turning complex atmospheric measurements into **personalized, meaningful actions** that empower individuals and communities to live sustainably.

---

## Tools, Languages, and Infrastructure

### Languages and Core Development
- **Python, JavaScript, HTML/CSS**  
  - Python: Data ingestion, preprocessing, forecasting  
  - JS/CSS: Interactive visualization and control  

### Data Access and Processing
- **NASA Earthdata (earthaccess API)** for TEMPO datasets  
- **xarray, pandas, NumPy** for NetCDF handling and preprocessing  
- **Google Cloud Storage** for data management  

### Cloud Infrastructure and Forecasting
- **Google Cloud Platform (GCP)** components:
  - Cloud Run – AI forecasting API  
  - Cloud Storage – dataset repository  
  - Cloud Functions – automation and orchestration  

### Personalization and Communication
- **Qwen 2.5-VL (Alibaba Cloud LLM)** for adaptive, context-aware notifications  
- Dynamically adjusts **tone, timing, and message style**  
- **Google Gemini Veo 3** for animated, data-driven storytelling  

### Collaboration and Version Control
- **GitHub** for source code and version tracking  
- **Notion** for documentation, dataset logs, and progress tracking  

---

## Team NAVI

**Members**  
- **Jeong Ah Yoon** – Project Lead & AI Personalization Designer  
  [github.com/jjyoon012-git](https://github.com/jjyoon012-git)

- **Jihoon Jeong** – Data Pipeline Architect & Visualization Engineer  
  [github.com/jeehun3020](https://github.com/jeehun3020)

- **Jiho Ryu** – Data Scientist & Environmental Data Engineer  
  [github.com/ryujihos0105](https://github.com/ryujihos0105)

**Challenge**  
*From EarthData to Action: Cloud Computing with Earth Observation Data for Predicting Cleaner, Safer Skies*  
(NASA Space Apps Challenge 2025)

---

## Contact

For inquiries or collaboration:  
**Team NAVI** – jjyoon012@gmail.com  

GitHub: [https://github.com/nasa-navi](https://github.com/nasa-navi)
