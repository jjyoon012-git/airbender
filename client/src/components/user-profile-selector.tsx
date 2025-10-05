import { useLanguage } from "@/lib/language-context";
import { useUserProfile } from "@/lib/user-profile-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Users, User } from "lucide-react";
import type { UserType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

function userTypeToOccupation(userType: UserType): string | null {
  switch (userType) {
    case "student":
      return "student";
    case "elderly":
      return "retired";
    case "worker":
      return "office_worker";
    case "general":
    default:
      return null;
  }
}

export function UserProfileSelector() {
  const { t, language } = useLanguage();
  const { userType, setUserType } = useUserProfile();
  const { toast } = useToast();

  const profiles: Array<{
    type: UserType;
    icon: typeof GraduationCap;
    label: { en: string; ko: string };
    description: { en: string; ko: string };
  }> = [
    {
      type: "student",
      icon: GraduationCap,
      label: { en: "Student", ko: "학생" },
      description: { en: "Get health advice tailored for students", ko: "학생을 위한 맞춤 건강 조언" }
    },
    {
      type: "elderly",
      icon: Users,
      label: { en: "Elderly", ko: "노인" },
      description: { en: "Special care for seniors", ko: "어르신을 위한 특별 케어" }
    },
    {
      type: "worker",
      icon: Briefcase,
      label: { en: "Worker", ko: "직장인" },
      description: { en: "Health tips for working professionals", ko: "직장인을 위한 건강 팁" }
    },
    {
      type: "general",
      icon: User,
      label: { en: "General", ko: "일반" },
      description: { en: "Standard health recommendations", ko: "일반적인 건강 권고" }
    }
  ];

  const handleProfileSelect = (selectedUserType: UserType) => {
    try {
      setUserType(selectedUserType);
      
      const occupation = userTypeToOccupation(selectedUserType);
      const existingProfile = localStorage.getItem("userProfile");
      const profileData = existingProfile ? JSON.parse(existingProfile) : {};
      
      profileData.occupation = occupation || profileData.occupation;
      profileData.selectedUserType = selectedUserType;
      
      localStorage.setItem("userProfile", JSON.stringify(profileData));

      toast({
        title: t("Profile updated", "프로필 업데이트됨"),
        description: t(
          "Your health advice will be personalized based on your selection",
          "선택하신 프로필에 맞춰 건강 조언이 제공됩니다"
        ),
      });
    } catch (error) {
      toast({
        title: t("Update failed", "업데이트 실패"),
        description: t(
          "Failed to update profile. Please try again.",
          "프로필 업데이트에 실패했습니다. 다시 시도해주세요."
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <Card data-testid="card-profile-selector">
      <CardHeader>
        <CardTitle>
          {t("Select Your Profile", "프로필 선택")}
        </CardTitle>
        <CardDescription>
          {t(
            "Get personalized health advice based on your profile",
            "프로필에 따라 맞춤형 건강 조언을 받으세요"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            const isSelected = userType === profile.type;
            
            return (
              <button
                key={profile.type}
                onClick={() => handleProfileSelect(profile.type)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover-elevate'
                  }
                `}
                data-testid={`button-profile-${profile.type}`}
              >
                <Icon className={`h-8 w-8 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="font-semibold mb-1" data-testid={`text-profile-label-${profile.type}`}>
                  {language === "ko" ? profile.label.ko : profile.label.en}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === "ko" ? profile.description.ko : profile.description.en}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
