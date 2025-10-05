import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import heroImage from "@assets/generated_images/NASA_TEMPO_satellite_Earth_view_8684a74c.png";

export function Hero() {
  const { t } = useLanguage();

  const scrollToContent = () => {
    const content = document.getElementById("dashboard");
    content?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    const footer = document.querySelector("footer");
    footer?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          {t(
            "Real-Time Air Quality Intelligence",
            "실시간 대기질 예측"
          )}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto">
          {t(
            "Powered by NASA TEMPO Satellite Data",
            "NASA TEMPO 위성 데이터 기반"
          )}
        </p>
        <p className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          {t(
            "Track NO₂, O₃, and particulate matter levels with precision. Get real-time updates and health advisories for your location.",
            "NO₂, O₃, 미세먼지 수치를 정밀하게 추적하세요. 실시간 업데이트와 건강 권고사항을 확인하세요."
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={scrollToContent}
            data-testid="button-view-dashboard"
            className="bg-primary text-primary-foreground border border-primary-border hover-elevate active-elevate-2 gap-2 min-w-[200px]"
          >
            {t("View Dashboard", "대시보드 보기")}
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToAbout}
            data-testid="button-learn-more"
            className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 min-w-[200px]"
          >
            {t("Learn More", "자세히 보기")}
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-sm sm:text-base text-white/70">
              {t("Monitoring", "모니터링")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">4</div>
            <div className="text-sm sm:text-base text-white/70">
              {t("Pollutants", "오염물질")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">3</div>
            <div className="text-sm sm:text-base text-white/70">
              {t("Day Forecast", "일 예보")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
