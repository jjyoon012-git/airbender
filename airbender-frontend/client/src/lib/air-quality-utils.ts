import type { AirQualityLevel, PollutantType } from "@shared/schema";

// Air Tattoo icon system - visual representation of air quality using lucide icons
export type AirTattooIcon = "smile" | "meh" | "frown" | "alert-triangle" | "skull";

export function getAirTattooIcon(level: AirQualityLevel): AirTattooIcon {
  const icons: Record<AirQualityLevel, AirTattooIcon> = {
    excellent: "smile",
    moderate: "meh",
    unhealthy: "frown",
    hazardous: "alert-triangle",
    critical: "skull"
  };
  return icons[level];
}

// Get color class for air quality level
export function getAqiColor(level: AirQualityLevel): string {
  const colors = {
    excellent: "text-chart-1",
    moderate: "text-chart-3", 
    unhealthy: "text-chart-4",
    hazardous: "text-destructive",
    critical: "text-chart-5"
  };
  return colors[level];
}

// Get background color for air quality level
export function getAqiBackgroundColor(level: AirQualityLevel): string {
  const colors = {
    excellent: "bg-chart-1/10",
    moderate: "bg-chart-3/10",
    unhealthy: "bg-chart-4/10",
    hazardous: "bg-destructive/10",
    critical: "bg-chart-5/10"
  };
  return colors[level];
}

// Get border color for air quality level
export function getAqiBorderColor(level: AirQualityLevel): string {
  const colors = {
    excellent: "border-chart-1",
    moderate: "border-chart-3",
    unhealthy: "border-chart-4",
    hazardous: "border-destructive",
    critical: "border-chart-5"
  };
  return colors[level];
}

// Get level from AQI value
export function getAqiLevel(aqi: number): AirQualityLevel {
  if (aqi <= 50) return "excellent";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy";
  if (aqi <= 300) return "hazardous";
  return "critical";
}

// Get level text in English and Korean
export function getAqiLevelText(level: AirQualityLevel, language: "en" | "ko"): string {
  const texts = {
    excellent: { en: "Excellent", ko: "좋음" },
    moderate: { en: "Moderate", ko: "보통" },
    unhealthy: { en: "Unhealthy", ko: "나쁨" },
    hazardous: { en: "Hazardous", ko: "매우 나쁨" },
    critical: { en: "Critical", ko: "위험" }
  };
  return texts[level][language];
}

// Get pollutant name
export function getPollutantName(pollutant: PollutantType, language: "en" | "ko"): string {
  const names = {
    NO2: { en: "Nitrogen Dioxide", ko: "이산화질소" },
    O3: { en: "Ozone", ko: "오존" },
    PM25: { en: "Fine Particles (PM2.5)", ko: "초미세먼지" },
    PM10: { en: "Particles (PM10)", ko: "미세먼지" }
  };
  return names[pollutant][language];
}

// Get pollutant short name
export function getPollutantShortName(pollutant: PollutantType): string {
  const names = {
    NO2: "NO₂",
    O3: "O₃",
    PM25: "PM2.5",
    PM10: "PM10"
  };
  return names[pollutant];
}

// Format date for display
export function formatDate(dateString: string, language: "en" | "ko"): string {
  const date = new Date(dateString);
  if (language === "ko") {
    return date.toLocaleDateString("ko-KR", { 
      month: "long", 
      day: "numeric",
      weekday: "short"
    });
  }
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    weekday: "short"
  });
}

// Format time for display
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit"
  });
}
