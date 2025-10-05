import requests
import pandas as pd

def fetch_open_meteo_hourly(lat=40.71, lon=-74.00,
                            start_date="2025-06-01", end_date="2025-08-31"):
    """
    Open-Meteo Archive API에서 시간당 기온(°C), 상대습도(%), 풍속(m/s)을 가져옵니다.
    """
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        "timezone": "UTC"
    }

    # 요청
    r = requests.get(url, params=params, timeout=60)
    r.raise_for_status()
    js = r.json()

    # DataFrame 구성
    hourly = js.get("hourly", {})
    if not hourly or "time" not in hourly:
        raise RuntimeError("No hourly data returned. 날짜/좌표를 확인하세요.")

    df = pd.DataFrame({
        "datetime_utc": hourly["time"],
        "temp_C": hourly["temperature_2m"],
        "rh_percent": hourly["relative_humidity_2m"],
        "wind_speed_mps": hourly["wind_speed_10m"]
    })

    # 시간 정렬 및 UTC 변환
    df["datetime_utc"] = pd.to_datetime(df["datetime_utc"], utc=True)
    df = df.sort_values("datetime_utc").reset_index(drop=True)
    return df


if __name__ == "__main__":
    LAT, LON = 40.71, -74.00
    START, END = "2025-06-01", "2025-08-31"

    df = fetch_open_meteo_hourly(LAT, LON, START, END)
    out_path = "nyc_2025_summer_meteo_hourly.csv"
    df.to_csv(out_path, index=False)

    print(f" Saved: {out_path}  (rows={len(df)})")
    print(df.head(12).to_string(index=False))
