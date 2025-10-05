import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Languages, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import type { AiGeneratedAlert, AlertPreferences } from "@shared/schema";

export default function AlertsPage() {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const { data: preferences, isLoading: prefsLoading } = useQuery<AlertPreferences>({
    queryKey: ["/api/alerts/preferences"],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<AiGeneratedAlert[]>({
    queryKey: ["/api/alerts"],
  });

  useEffect(() => {
    if (preferences?.language) {
      setSelectedLanguage(preferences.language);
    }
  }, [preferences]);

  const generateAlertMutation = useMutation({
    mutationFn: async (language: string) => {
      const res = await apiRequest("POST", "/api/alerts/generate", { language });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: t("Alert Generated", "알림 생성됨"),
        description: t("Your personalized alert has been created successfully.", "맞춤형 알림이 성공적으로 생성되었습니다."),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Generation Failed", "생성 실패"),
        description: error.message || t("Failed to generate alert. Please try again.", "알림 생성에 실패했습니다. 다시 시도해주세요."),
        variant: "destructive",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (language: string) => {
      const res = await apiRequest("PATCH", "/api/alerts/preferences", { language });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/preferences"] });
      toast({
        title: t("Preferences Updated", "설정 업데이트됨"),
        description: t("Your language preference has been saved.", "언어 설정이 저장되었습니다."),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Update Failed", "업데이트 실패"),
        description: error.message || t("Failed to update preferences. Please try again.", "설정 업데이트에 실패했습니다. 다시 시도해주세요."),
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    updatePreferencesMutation.mutate(language);
  };

  const handleGenerateAlert = () => {
    generateAlertMutation.mutate(selectedLanguage);
  };

  if (prefsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" data-testid="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-alerts">
              {t("AI Personalized Alerts", "AI 맞춤형 알림")}
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-description">
              {t(
                "Daily personalized health and lifestyle advice powered by Qwen 2.5 Instruct",
                "Qwen 2.5 Instruct가 제공하는 일일 맞춤형 건강 및 생활 조언"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px]" data-testid="select-language">
                <Languages className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" data-testid="option-language-en">{t("English", "영어")}</SelectItem>
                <SelectItem value="ko" data-testid="option-language-ko">{t("Korean", "한국어")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerateAlert}
              disabled={generateAlertMutation.isPending}
              data-testid="button-generate-alert"
            >
              {generateAlertMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("Generating...", "생성 중...")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("Generate Alert", "알림 생성")}
                </>
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle data-testid="heading-how-it-works">
              {t("How It Works", "작동 방식")}
            </CardTitle>
            <CardDescription data-testid="text-how-it-works-description">
              {t(
                "The system automatically uses your profile data (location, health conditions, commute times, hobbies) to generate personalized advice about weather, air quality, commute safety, and outdoor activities in New York.",
                "시스템은 자동으로 프로필 데이터(위치, 건강 상태, 통근 시간, 취미)를 사용하여 뉴욕의 날씨, 대기질, 통근 안전성, 야외 활동에 대한 맞춤형 조언을 생성합니다."
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold" data-testid="heading-your-alerts">
            {t("Your Alerts", "내 알림")}
          </h2>

          {alertsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" data-testid="loading-alerts"></div>
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="hover-elevate" data-testid={`card-alert-${alert.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-muted-foreground" data-testid={`text-alert-date-${alert.id}`}>
                          {new Date(alert.generatedAt).toLocaleDateString(
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
                        <p className="whitespace-pre-wrap text-base leading-relaxed" data-testid={`text-alert-content-${alert.id}`}>
                          {alert.alertContent}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Languages className="h-3 w-3" />
                          <span data-testid={`text-alert-language-${alert.id}`}>
                            {alert.language === "ko" ? t("Korean", "한국어") : t("English", "영어")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4" data-testid="text-no-alerts">
                  {t(
                    "No alerts generated yet. Click the button above to generate your first personalized alert!",
                    "아직 생성된 알림이 없습니다. 위의 버튼을 클릭하여 첫 번째 맞춤형 알림을 생성하세요!"
                  )}
                </p>
                <Button onClick={handleGenerateAlert} disabled={generateAlertMutation.isPending} data-testid="button-generate-first-alert">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("Generate First Alert", "첫 알림 생성")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
