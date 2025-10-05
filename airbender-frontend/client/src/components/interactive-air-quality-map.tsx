import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { getAirTattooIcon, getAqiColor, getAqiBackgroundColor, getAqiLevelText } from "@/lib/air-quality-utils";
import { AirTattooIconComponent } from "@/components/air-tattoo-icon";
import type { Location, AirQualityData, AirQualityLevel } from "@shared/schema";
import { MapPin, Wind } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveAirQualityMapProps {
  locations: Array<{
    location: Location;
    airQuality: AirQualityData;
  }>;
}

function getHazeOpacity(level: AirQualityLevel): number {
  switch (level) {
    case "excellent":
      return 0;
    case "moderate":
      return 0.15;
    case "unhealthy":
      return 0.35;
    case "hazardous":
      return 0.55;
    case "critical":
      return 0.75;
    default:
      return 0;
  }
}

function getHazeColor(level: AirQualityLevel): string {
  switch (level) {
    case "excellent":
      return "#10b981";
    case "moderate":
      return "#f59e0b";
    case "unhealthy":
      return "#ef4444";
    case "hazardous":
      return "#991b1b";
    case "critical":
      return "#450a0a";
    default:
      return "#6b7280";
  }
}

function HazeOverlay({ location, level }: { location: Location; level: AirQualityLevel }) {
  const opacity = getHazeOpacity(level);
  const color = getHazeColor(level);
  
  if (opacity === 0) return null;
  
  return (
    <Circle
      center={[location.latitude, location.longitude]}
      radius={50000}
      pathOptions={{
        fillColor: color,
        fillOpacity: opacity,
        color: color,
        opacity: opacity * 0.5,
        weight: 2,
      }}
    />
  );
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function InteractiveAirQualityMap({ locations }: InteractiveAirQualityMapProps) {
  const { language, t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const newYorkLocation = useMemo(() => {
    return locations.find(loc => 
      loc.location.id === "newyork" || 
      loc.location.name.toLowerCase().includes("new york")
    );
  }, [locations]);

  const center: [number, number] = newYorkLocation 
    ? [newYorkLocation.location.latitude, newYorkLocation.location.longitude]
    : [40.7128, -74.0060];

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: white; border: 3px solid #3b82f6; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  return (
    <Card data-testid="card-interactive-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t("Interactive Air Quality Map", "인터랙티브 대기질 지도")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-[500px] rounded-b-lg overflow-hidden">
          <MapContainer
            center={center}
            zoom={10}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            data-testid="map-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapRecenter center={center} />

            {locations.map(({ location, airQuality }) => {
              const isNewYork = location.id === "newyork" || location.name.toLowerCase().includes("new york");
              const colorClass = getAqiColor(airQuality.level);
              const bgClass = getAqiBackgroundColor(airQuality.level);
              const levelText = getAqiLevelText(airQuality.level, language);
              const tattooIcon = getAirTattooIcon(airQuality.level);
              const locationName = language === "ko" ? location.nameKo : location.name;

              return (
                <div key={location.id}>
                  <HazeOverlay location={location} level={airQuality.level} />
                  
                  {isNewYork && (
                    <Marker
                      position={[location.latitude, location.longitude]}
                      icon={customIcon}
                      eventHandlers={{
                        click: () => {
                          setSelectedLocation(location.id);
                        },
                      }}
                      data-testid={`marker-${location.id}`}
                    >
                      <Popup data-testid={`popup-${location.id}`}>
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-lg">{locationName}</h3>
                              <p className="text-xs text-muted-foreground">
                                {location.region}, {location.country}
                              </p>
                            </div>
                            <div className={colorClass}>
                              <AirTattooIconComponent icon={tattooIcon} className="h-8 w-8" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-end justify-between">
                              <div>
                                <div className={`text-3xl font-bold ${colorClass}`}>
                                  {airQuality.aqi}
                                </div>
                                <div className="text-xs text-muted-foreground">AQI</div>
                              </div>
                              <Badge variant="secondary" className={`${bgClass} ${colorClass} border-0`}>
                                {levelText}
                              </Badge>
                            </div>

                            <div className="border-t pt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {t("Primary Pollutant", "주요 오염물질")}:
                                </span>
                                <span className="font-medium">{airQuality.primaryPollutant}</span>
                              </div>
                              
                              {airQuality.pollutants.NO2 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">NO₂:</span>
                                  <span className="font-medium">{airQuality.pollutants.NO2.toFixed(1)} ppb</span>
                                </div>
                              )}
                              
                              {airQuality.pollutants.O3 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">O₃:</span>
                                  <span className="font-medium">{airQuality.pollutants.O3.toFixed(1)} ppb</span>
                                </div>
                              )}
                              
                              {airQuality.pollutants.PM25 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">PM2.5:</span>
                                  <span className="font-medium">{airQuality.pollutants.PM25.toFixed(1)} μg/m³</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </div>
              );
            })}
          </MapContainer>

          <div className="absolute bottom-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
            <div className="flex items-center gap-2 text-sm">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {t("Click on New York", "뉴욕을 클릭하세요")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("to view air quality details", "대기질 상세정보 확인")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
