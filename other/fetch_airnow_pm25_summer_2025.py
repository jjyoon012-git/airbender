import requests
import pandas as pd
from datetime import date, timedelta

# --- 1. 설정 변수 (API 키는 그대로 유지) ---
API_KEY = "" # 사용자가 입력한 API 키
# 뉴욕시 광범위 지역 BBOX
BBOX_NYC = "-74.259,40.477,-73.700,40.918" 
BASE_URL = "https://airnowapi.org/aq/data/"
ALL_DATA = []

# --- 2. 날짜 범위 설정 (2025년 6월 1일 ~ 8월 31일로 설정) ---
start_date = date(2025, 6, 1)  # 시작 날짜: 2025년 6월 1일
end_date = date(2025, 8, 31) # 종료 날짜: 2025년 8월 31일
delta = timedelta(days=1)

current_date = start_date

print(f" 2025년 6월 1일부터 8월 31일까지 뉴욕 PM2.5 데이터 수집을 시작합니다...")

# --- 3. 일별 API 요청 반복 및 데이터 수집 ---
while current_date <= end_date:
    date_str = current_date.strftime("%Y-%m-%d")
    
    # AirNow API 요청은 날짜뿐만 아니라 UTC 기준 시간도 필요합니다.
    # 해당 날짜의 0시(T00)부터 23시(T23)까지 데이터를 요청합니다.
    start_time_utc = f"{date_str}T00"
    end_time_utc = f"{date_str}T23"
    
    params = {
        "startDate": start_time_utc,
        "endDate": end_time_utc,
        "parameters": "PM25",  # PM2.5 데이터 요청
        "BBOX": BBOX_NYC,
        "dataType": "B",       # AQI와 농도(Concentration) 모두 포함
        "format": "application/json",
        "verbose": 1,          # 상세 관측소 정보 포함
        "API_KEY": API_KEY
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status() # HTTP 오류(4xx, 5xx) 발생 시 중단
        
        data = response.json()
        if data:
            ALL_DATA.extend(data)
        
        print(f" 데이터 수집 완료: {date_str}")
        
    except requests.exceptions.RequestException as e:
        print(f" 데이터 수집 오류 발생 ({date_str}): {e}")
        
    current_date += delta # 다음 날짜로 이동

# --- 4. 데이터 정리 및 CSV 파일로 저장 ---
if ALL_DATA:
    df = pd.DataFrame(ALL_DATA)
    output_filename = "nyc_pm25_2025_summer.csv" # 파일 이름 변경
    
    # 데이터를 시간(UTC) 기준으로 정렬합니다.
    df_final = df.sort_values(by=["UTC", "SiteName"])
    
    # 모든 컬럼을 저장하되, 후속 분석을 위해 주로 사용되는 컬럼을 확인하는 것이 좋습니다.
    df_final.to_csv(output_filename, index=False, encoding='utf-8')
    
    print("-" * 50)
    print(f" 2025년 6월~8월 뉴욕 PM2.5 데이터 {len(df_final)}개 레코드가 성공적으로 저장되었습니다.")
    print(f"파일 이름: {output_filename}")
    print("-" * 50)
else:
    print(" 수집된 데이터가 없습니다. API 키와 BBOX 설정을 다시 확인해주세요.")
