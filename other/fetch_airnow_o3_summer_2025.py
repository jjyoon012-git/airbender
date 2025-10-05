import requests
import pandas as pd
from datetime import date, timedelta

# --- 1. 설정 변수 ---
API_KEY = ""  #  AirNow API 키
BBOX_NYC = "-74.259,40.477,-73.700,40.918"     # NYC 광역 BBOX
BASE_URL = "https://www.airnowapi.org/aq/data/"  # www 포함 권장
ALL_DATA = []

# --- 2. 날짜 범위 (2025-06-01 ~ 2025-08-31) ---
start_date = date(2025, 6, 1)
end_date   = date(2025, 8, 31)
delta = timedelta(days=1)
current_date = start_date

print("📡 2025년 6~8월 뉴욕 O3(오존) 데이터 수집 시작...")

# --- 3. 일별 반복 수집 ---
while current_date <= end_date:
    date_str = current_date.strftime("%Y-%m-%d")
    start_time_utc = f"{date_str}T00"
    end_time_utc   = f"{date_str}T23"

    params = {
        "startDate": start_time_utc,
        "endDate": end_time_utc,
        "parameters": "OZONE",        # OZONE
        "BBOX": BBOX_NYC,
        "dataType": "B",              # B = AQI + 농도 포함
        "format": "application/json",
        "verbose": 1,
        "API_KEY": API_KEY
    }

    try:
        r = requests.get(BASE_URL, params=params, timeout=60)
        r.raise_for_status()
        data = r.json()
        if data:
            ALL_DATA.extend(data)
        print(f" 수집 완료: {date_str}")
    except requests.exceptions.RequestException as e:
        print(f" 오류 ({date_str}): {e}")

    current_date += delta

# --- 4. 정리/저장 ---
if ALL_DATA:
    df = pd.DataFrame(ALL_DATA)

    # 시간 정렬
    df = df.sort_values(by=["UTC", "SiteName"]).reset_index(drop=True)

    # O3 단위 표준화: AirNow는 보통 OZONE 단위를 'ppm'으로 반환
    # 모델/해석 편의를 위해 ppb 컬럼 추가
    # - Unit == 'ppm' 이면 ×1000
    # - Unit == 'ppb' 이면 그대로
    def to_ppb(row):
        try:
            val = float(row.get("Value", None))
        except (TypeError, ValueError):
            return None
        unit = str(row.get("Unit", "")).lower()
        if unit == "ppm":
            return val * 1000.0
        return val  # already ppb or unknown

    df["o3_ppb"] = df.apply(to_ppb, axis=1)

    # CSV 저장 (원자료 + 표준화 컬럼 포함)
    raw_out = "nyc_o3_2025_summer_raw.csv"
    df.to_csv(raw_out, index=False, encoding="utf-8")
    print(f"🎉 원자료 저장: {raw_out} (rows={len(df)})")

    # (옵션) 시간당 전체 BBOX 평균값으로 집계한 시계열도 별도 저장
    df_hourly = (
        df.assign(datetime_utc=pd.to_datetime(df["UTC"], utc=True, errors="coerce"))
          .dropna(subset=["datetime_utc", "o3_ppb"])
          .groupby("datetime_utc", as_index=False)["o3_ppb"].mean()
          .sort_values("datetime_utc")
    )
    agg_out = "nyc_o3_2025_summer_hourly_mean.csv"
    df_hourly.to_csv(agg_out, index=False, encoding="utf-8")
    print(f" 시간당 평균 시계열 저장: {agg_out} (rows={len(df_hourly)})")

else:
    print(" 수집된 데이터가 없습니다. API 키와 BBOX, 날짜를 다시 확인해주세요.")
