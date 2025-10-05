import { useLanguage } from "@/lib/language-context";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { AirQualityCard } from "@/components/air-quality-card";
import { HistoricalChart } from "@/components/historical-chart";
import { ForecastTimeline } from "@/components/forecast-timeline";
import { AlertBanner } from "@/components/alert-banner";
import { InteractiveAirQualityMap } from "@/components/interactive-air-quality-map";
import { UserProfileSelector } from "@/components/user-profile-selector";
import { WeatherVideoBackground } from "@/components/weather-video-background";
import { RealtimeNYCData } from "@/components/realtime-nyc-data";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { AirQualityResponse, AiGeneratedAlert, AlertPreferences } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useRef } from "react";

export default function Dashboard() {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const lastAutoGenDate = useRef<string | null>(null);

  const { data, isLoading, error } = useQuery<AirQualityResponse>({
    queryKey: ["/api/air-quality"],
  });

  const { data: preferences } = useQuery<AlertPreferences>({
    queryKey: ["/api/alerts/preferences"],
    enabled: isAuthenticated,
  });

  const { data: alerts } = useQuery<AiGeneratedAlert[]>({
    queryKey: ["/api/alerts"],
    enabled: isAuthenticated,
  });

  const generateAlertMutation = useMutation({
    mutationFn: async (language: string) => {
      const res = await apiRequest("POST", "/api/alerts/generate", { language });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  useEffect(() => {
    if (isAuthenticated && alerts !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString();
      
      const hasRecentAlert = alerts?.some(alert => {
        const alertDate = new Date(alert.generatedAt);
        alertDate.setHours(0, 0, 0, 0);
        return alertDate.getTime() === today.getTime();
      });

      if (!hasRecentAlert && !generateAlertMutation.isPending && lastAutoGenDate.current !== todayString) {
        lastAutoGenDate.current = todayString;
        const userLanguage = preferences?.language || language || "en";
        generateAlertMutation.mutate(userLanguage);
      }
    }
  }, [isAuthenticated, alerts, preferences, language]);

  return (
    <div className="min-h-screen bg-background relative">
      {data?.current && <WeatherVideoBackground level={data.current.level} />}
      <Navigation />
      <Hero />

      <main id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {data?.alerts && data.alerts.length > 0 && data.alerts[0].active && (
          <AlertBanner alert={data.alerts[0]} />
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "Failed to load air quality data. Please try again later.",
                "대기질 데이터를 불러오는데 실패했습니다. 나중에 다시 시도해주세요."
              )}
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && alerts && alerts.length > 0 && (
          <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" data-testid="card-personalized-alert">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold text-primary" data-testid="heading-ai-alert">
                      {t("AI Personalized Alert", "AI 맞춤형 알림")}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const userLanguage = preferences?.language || language || "en";
                        generateAlertMutation.mutate(userLanguage);
                      }}
                      disabled={generateAlertMutation.isPending}
                      data-testid="button-refresh-alert"
                    >
                      <RefreshCw className={`h-4 w-4 ${generateAlertMutation.isPending ? 'animate-spin' : ''}`} />
                      <span className="ml-2">
                        {generateAlertMutation.isPending 
                          ? t("Generating...", "생성 중...") 
                          : t("New Advice", "새 조언")}
                      </span>
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-base leading-relaxed" data-testid="text-alert-content">
                    {alerts[0].alertContent}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-alert-timestamp">
                    {new Date(alerts[0].generatedAt).toLocaleDateString(
                      language === "ko" ? "ko-KR" : "en-US",
                      { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {t("Current Air Quality", "현재 대기질")}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-[300px]" />
                  <Skeleton className="h-[300px] lg:col-span-2" />
                </>
              ) : data ? (
                <>
                  <AirQualityCard data={data.current} />
                  <div className="lg:col-span-2">
                    <HistoricalChart data={data.historical} />
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <section>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : data?.forecast && data.forecast.length > 0 ? (
              <ForecastTimeline forecasts={data.forecast} />
            ) : null}
          </section>

          <section>
            <RealtimeNYCData />
          </section>

          <section>
            <UserProfileSelector />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">
              {t("Regional Overview", "지역별 현황")}
            </h2>
            {isLoading ? (
              <Skeleton className="h-[400px]" />
            ) : data ? (
              <InteractiveAirQualityMap 
                locations={[
                  { location: data.location, airQuality: data.current }
                ]} 
              />
            ) : null}
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">
                {t("About", "소개")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Real-time air quality monitoring powered by NASA TEMPO satellite data.",
                  "NASA TEMPO 위성 데이터 기반 실시간 대기질 모니터링"
                )}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">
                {t("Data Sources", "데이터 출처")}
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>NASA TEMPO Satellite</li>
                <li>{t("Weather APIs", "기상 API")}</li>
                <li>{t("Real-time monitoring", "실시간 모니터링")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">
                {t("Contact", "문의")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("Powered by NASA TEMPO Satellite Data", "NASA TEMPO 위성 데이터 기반")}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
