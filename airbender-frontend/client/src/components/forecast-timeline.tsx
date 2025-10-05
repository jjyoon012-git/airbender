import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAirTattooIcon, getAqiLevelText, getAqiColor, getAqiBackgroundColor, formatDate } from "@/lib/air-quality-utils";
import { AirTattooIconComponent } from "@/components/air-tattoo-icon";
import type { ForecastData } from "@shared/schema";
import goodWeatherVideo from "@assets/good-weather.mp4";
import badWeatherVideo from "@assets/bad-weather.mp4";

interface ForecastTimelineProps {
  forecasts: ForecastData[];
}

export function ForecastTimeline({ forecasts }: ForecastTimelineProps) {
  const { language, t } = useLanguage();

  const getVideoUrl = (level: string) => {
    if (level === "excellent" || level === "moderate") {
      return goodWeatherVideo;
    }
    return badWeatherVideo;
  };

  return (
    <Card data-testid="card-forecast-timeline">
      <CardHeader>
        <CardTitle>
          {t("3-Day Air Quality Forecast", "3일 대기질 예보")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-80 h-64 overflow-hidden rounded-lg">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={getVideoUrl(forecasts[0]?.predictedLevel || "moderate")} type="video/mp4" />
            </video>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory flex-1">
            {forecasts.map((forecast) => {
              const colorClass = getAqiColor(forecast.predictedLevel);
              const bgClass = getAqiBackgroundColor(forecast.predictedLevel);
              const levelText = getAqiLevelText(forecast.predictedLevel, language);
              const tattooIcon = getAirTattooIcon(forecast.predictedLevel);

              return (
                <div
                  key={forecast.id}
                  className="flex-shrink-0 w-32 snap-start"
                  data-testid={`forecast-card-${forecast.date}`}
                >
                  <div className={`rounded-lg border p-4 space-y-3 ${bgClass} hover-elevate transition-all h-full`}>
                    <div className="text-sm font-medium text-center">
                      {formatDate(forecast.date, language)}
                    </div>

                    <div className="text-center">
                      <div className={`flex justify-center mb-1 ${colorClass}`} data-testid={`forecast-tattoo-${forecast.date}`}>
                        <AirTattooIconComponent icon={tattooIcon} className="h-8 w-8" />
                      </div>
                      <div className={`text-2xl font-bold ${colorClass}`} data-testid={`forecast-aqi-${forecast.date}`}>
                        {forecast.predictedAqi}
                      </div>
                    </div>

                    <Badge 
                      variant="secondary" 
                      className={`w-full justify-center ${bgClass} ${colorClass} border-0 text-xs`}
                    >
                      {levelText}
                    </Badge>

                    <div className="text-xs text-center text-muted-foreground">
                      {forecast.confidence}% {t("confidence", "신뢰도")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
