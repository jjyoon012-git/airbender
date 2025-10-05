import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  getAirTattooIcon, 
  getAqiColor, 
  getAqiBackgroundColor,
  getAqiLevelText,
  getPollutantShortName 
} from "@/lib/air-quality-utils";
import { AirTattooIconComponent } from "@/components/air-tattoo-icon";
import type { AirQualityData } from "@shared/schema";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AirQualityCardProps {
  data: AirQualityData;
}

export function AirQualityCard({ data }: AirQualityCardProps) {
  const { language } = useLanguage();
  
  const tattooIcon = getAirTattooIcon(data.level);
  const colorClass = getAqiColor(data.level);
  const bgClass = getAqiBackgroundColor(data.level);
  const levelText = getAqiLevelText(data.level, language);

  return (
    <Card className="hover-elevate transition-shadow duration-200" data-testid={`card-aqi-${data.level}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === "ko" ? "대기질 지수" : "Air Quality Index"}
          </h3>
          <Badge variant="secondary" className={`${bgClass} ${colorClass} border-0`}>
            {levelText}
          </Badge>
        </div>
        <div className={colorClass} data-testid="text-air-tattoo">
          <AirTattooIconComponent icon={tattooIcon} className="h-12 w-12" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className={`text-4xl font-bold ${colorClass}`} data-testid="text-aqi-value">
              {data.aqi}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {language === "ko" ? "AQI 수치" : "AQI Value"}
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {language === "ko" ? "주요 오염물질:" : "Primary:"}
              </span>
              <span className="font-medium" data-testid="text-primary-pollutant">
                {getPollutantShortName(data.primaryPollutant)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.pollutants).map(([key, value]) => {
              if (value === undefined) return null;
              return (
                <div key={key} className="space-y-1">
                  <div className="text-xs text-muted-foreground">{getPollutantShortName(key as any)}</div>
                  <div className="text-lg font-semibold" data-testid={`text-pollutant-${key.toLowerCase()}`}>
                    {value.toFixed(1)}
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
