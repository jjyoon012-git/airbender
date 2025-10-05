import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { getAqiBackgroundColor, getAqiColor } from "@/lib/air-quality-utils";
import type { Alert } from "@shared/schema";

interface AlertBannerProps {
  alert: Alert;
  onDismiss?: () => void;
}

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !alert.active) return null;

  const bgClass = getAqiBackgroundColor(alert.level);
  const colorClass = getAqiColor(alert.level);
  const message = language === "ko" ? alert.messageKo : alert.message;

  return (
    <div 
      className={`${bgClass} ${colorClass} border-l-4 ${colorClass.replace('text-', 'border-')} p-4 mb-6 animate-in slide-in-from-top duration-300`}
      data-testid="alert-banner"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold mb-1" data-testid="text-alert-message">
            {message}
          </p>
          <p className="text-sm opacity-90">
            {new Date(alert.timestamp).toLocaleString(language === "ko" ? "ko-KR" : "en-US")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="flex-shrink-0 hover-elevate"
          data-testid="button-dismiss-alert"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
