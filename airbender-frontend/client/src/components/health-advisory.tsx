import { useLanguage } from "@/lib/language-context";
import { useUserProfile } from "@/lib/user-profile-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAqiBackgroundColor, getAqiColor } from "@/lib/air-quality-utils";
import { getPersonalizedHealthAdvisory } from "@/lib/personalized-health-advisory";
import type { AirQualityLevel } from "@shared/schema";
import { Heart, User } from "lucide-react";

interface HealthAdvisoryProps {
  level: AirQualityLevel;
}

export function HealthAdvisoryCard({ level }: HealthAdvisoryProps) {
  const { language, t } = useLanguage();
  const { userType } = useUserProfile();
  
  const bgClass = getAqiBackgroundColor(level);
  const colorClass = getAqiColor(level);

  const advisory = getPersonalizedHealthAdvisory(level, userType);
  const message = language === "ko" ? advisory.messageKo : advisory.message;
  const activities = language === "ko" ? advisory.activitiesKo : advisory.activities;

  const userTypeLabels = {
    student: { en: "Student", ko: "학생" },
    elderly: { en: "Elderly", ko: "노인" },
    worker: { en: "Worker", ko: "직장인" },
    general: { en: "General", ko: "일반" }
  };

  const currentUserLabel = language === "ko" ? userTypeLabels[userType].ko : userTypeLabels[userType].en;

  return (
    <Card className={`${bgClass} border-2 ${colorClass.replace('text-', 'border-')}`} data-testid="card-health-advisory">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {t("Health Advisory", "건강 권고사항")}
          </div>
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            {currentUserLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-foreground leading-relaxed" data-testid="text-advisory-personalized">
              {message}
            </p>
          </div>

          {activities.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">
                {t("Recommended Activities", "권장 활동")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {activities.map((activity, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-background/50"
                    data-testid={`badge-activity-${index}`}
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
