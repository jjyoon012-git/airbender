import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAirTattooIcon, getAqiColor, getAqiBackgroundColor, getAqiLevelText } from "@/lib/air-quality-utils";
import { AirTattooIconComponent } from "@/components/air-tattoo-icon";
import type { Location, AirQualityData } from "@shared/schema";
import { MapPin } from "lucide-react";

interface LocationMapProps {
  locations: Array<{
    location: Location;
    airQuality: AirQualityData;
  }>;
}

export function LocationMap({ locations }: LocationMapProps) {
  const { language, t } = useLanguage();

  return (
    <Card data-testid="card-location-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t("Locations Overview", "지역별 현황")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(({ location, airQuality }) => {
            const colorClass = getAqiColor(airQuality.level);
            const bgClass = getAqiBackgroundColor(airQuality.level);
            const levelText = getAqiLevelText(airQuality.level, language);
            const tattooIcon = getAirTattooIcon(airQuality.level);
            const locationName = language === "ko" ? location.nameKo : location.name;

            return (
              <div
                key={location.id}
                className={`rounded-lg border p-4 space-y-3 ${bgClass} hover-elevate transition-all cursor-pointer`}
                data-testid={`location-card-${location.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1" data-testid={`text-location-name-${location.id}`}>
                      {locationName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {location.region}, {location.country}
                    </p>
                  </div>
                  <div className={colorClass} data-testid={`location-tattoo-${location.id}`}>
                    <AirTattooIconComponent icon={tattooIcon} className="h-8 w-8" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className={`text-2xl font-bold ${colorClass}`} data-testid={`location-aqi-${location.id}`}>
                      {airQuality.aqi}
                    </div>
                    <div className="text-xs text-muted-foreground">AQI</div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${bgClass} ${colorClass} border-0`}
                  >
                    {levelText}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
