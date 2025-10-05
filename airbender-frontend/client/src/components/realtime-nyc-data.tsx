import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Thermometer, Droplets, Wind, Activity } from "lucide-react";

interface RealtimeNYCData {
  datetime_local: string;
  weather: {
    temp: number;
    humidity: number;
    wind: number;
    time: string;
  };
  air_quality: {
    "PM2.5"?: {
      AQI: number;
      Category: string;
      Concentration: number;
    };
    "O3"?: {
      AQI: number;
      Category: string;
      Concentration: number;
    };
  };
}

export function RealtimeNYCData() {
  const { language, t } = useLanguage();

  const { data, isLoading, error } = useQuery<RealtimeNYCData>({
    queryKey: ["/api/realtime/nyc"],
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <Card data-testid="card-realtime-nyc">
        <CardHeader>
          <CardTitle>
            {t("Real-time NYC Data", "실시간 뉴욕 데이터")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="card-realtime-nyc">
        <CardHeader>
          <CardTitle>
            {t("Real-time NYC Data", "실시간 뉴욕 데이터")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "Failed to load real-time data. Please try again later.",
                "실시간 데이터를 불러오는데 실패했습니다. 나중에 다시 시도해주세요."
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const pm25 = data.air_quality["PM2.5"];
  const o3 = data.air_quality["O3"];

  return (
    <Card data-testid="card-realtime-nyc">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("Real-time NYC Data", "실시간 뉴욕 데이터")}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {data.datetime_local}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            {t("Weather", "날씨")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Thermometer className="h-5 w-5 text-chart-1" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("Temperature", "온도")}
                </div>
                <div className="text-lg font-semibold" data-testid="text-temp">
                  {data.weather.temp}°C
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Droplets className="h-5 w-5 text-chart-2" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("Humidity", "습도")}
                </div>
                <div className="text-lg font-semibold" data-testid="text-humidity">
                  {data.weather.humidity}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Wind className="h-5 w-5 text-chart-3" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("Wind Speed", "풍속")}
                </div>
                <div className="text-lg font-semibold" data-testid="text-wind">
                  {data.weather.wind} m/s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            {t("Air Quality", "대기질")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pm25 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-chart-4" />
                  <span className="font-semibold">PM2.5</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AQI</span>
                    <span className="text-xl font-bold" data-testid="text-pm25-aqi">
                      {pm25.AQI}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Category", "등급")}
                    </span>
                    <span className="text-sm font-medium" data-testid="text-pm25-category">
                      {pm25.Category}
                    </span>
                  </div>
                  {pm25.Concentration && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t("Concentration", "농도")}
                      </span>
                      <span className="text-sm" data-testid="text-pm25-concentration">
                        {pm25.Concentration} µg/m³
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {o3 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-chart-5" />
                  <span className="font-semibold">O₃</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AQI</span>
                    <span className="text-xl font-bold" data-testid="text-o3-aqi">
                      {o3.AQI}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("Category", "등급")}
                    </span>
                    <span className="text-sm font-medium" data-testid="text-o3-category">
                      {o3.Category}
                    </span>
                  </div>
                  {o3.Concentration && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t("Concentration", "농도")}
                      </span>
                      <span className="text-sm" data-testid="text-o3-concentration">
                        {o3.Concentration} ppb
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
