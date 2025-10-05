import { Smile, Meh, Frown, AlertTriangle, Skull } from "lucide-react";
import type { AirTattooIcon } from "@/lib/air-quality-utils";

interface AirTattooIconComponentProps {
  icon: AirTattooIcon;
  className?: string;
}

export function AirTattooIconComponent({ icon, className = "h-12 w-12" }: AirTattooIconComponentProps) {
  const iconMap = {
    smile: Smile,
    meh: Meh,
    frown: Frown,
    "alert-triangle": AlertTriangle,
    skull: Skull
  };

  const IconComponent = iconMap[icon];
  
  return <IconComponent className={className} />;
}
