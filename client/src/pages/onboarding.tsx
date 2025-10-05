import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const onboardingSchema = z.object({
  residence: z.string().min(1, "거주지를 입력해주세요"),
  occupation: z.string().min(1, "직업을 선택해주세요"),
  occupationCustom: z.string().optional(),
  outdoorExposure: z.enum(["low", "medium", "high"], {
    required_error: "야외 노출 정도를 선택해주세요",
  }),
  commuteStartTime: z.string().optional(),
  commuteEndTime: z.string().optional(),
  ageGroup: z.enum(["child", "teen", "adult", "senior"], {
    required_error: "연령대를 선택해주세요",
  }),
  healthConditions: z.array(z.string()).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const occupationOptions = [
  { value: "student", label: { en: "Student", ko: "학생" } },
  { value: "office_worker", label: { en: "Office Worker", ko: "사무직" } },
  { value: "outdoor_worker", label: { en: "Outdoor Worker", ko: "야외근로자" } },
  { value: "service_worker", label: { en: "Service Worker", ko: "서비스직" } },
  { value: "healthcare", label: { en: "Healthcare", ko: "의료직" } },
  { value: "retired", label: { en: "Retired", ko: "은퇴" } },
  { value: "other", label: { en: "Other", ko: "기타" } },
];

const healthConditionOptions = [
  { value: "asthma", label: { en: "Asthma", ko: "천식" } },
  { value: "copd", label: { en: "COPD", ko: "만성폐쇄성폐질환" } },
  { value: "heart_disease", label: { en: "Heart Disease", ko: "심장질환" } },
  { value: "allergies", label: { en: "Allergies", ko: "알레르기" } },
  { value: "diabetes", label: { en: "Diabetes", ko: "당뇨" } },
  { value: "none", label: { en: "None", ko: "해당없음" } },
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedHealthConditions, setSelectedHealthConditions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      residence: "New York",
      occupation: "",
      occupationCustom: "",
      outdoorExposure: "medium",
      commuteStartTime: "",
      commuteEndTime: "",
      ageGroup: "adult",
      healthConditions: [],
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    try {
      const profileData = {
        residence: data.residence,
        occupation: data.occupation,
        occupationCustom: data.occupation === "other" ? data.occupationCustom : null,
        outdoorExposure: data.outdoorExposure,
        commuteStartTime: data.commuteStartTime || null,
        commuteEndTime: data.commuteEndTime || null,
        ageGroup: data.ageGroup,
        healthConditions: selectedHealthConditions,
      };

      localStorage.setItem("userProfile", JSON.stringify(profileData));

      toast({
        title: language === "ko" ? "프로필 저장 완료" : "Profile Saved",
        description: language === "ko" 
          ? "맞춤형 대기질 정보를 제공해드립니다." 
          : "We'll provide personalized air quality information.",
      });
      
      setLocation("/");
    } catch (error) {
      console.error("Profile save error:", error);
      toast({
        title: language === "ko" ? "오류 발생" : "Error",
        description: language === "ko" ? "프로필 저장 중 오류가 발생했습니다" : "An error occurred while saving your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchOccupation = form.watch("occupation");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle data-testid="text-onboarding-title">
            {language === "ko" ? "프로필 설정" : "Profile Setup"}
          </CardTitle>
          <CardDescription data-testid="text-onboarding-description">
            {language === "ko" 
              ? "맞춤형 대기질 정보를 제공하기 위해 몇 가지 정보를 입력해주세요." 
              : "Please provide some information to get personalized air quality updates."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="residence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ko" ? "거주지" : "Residence"}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={language === "ko" ? "예: New York" : "e.g., New York"}
                        data-testid="input-residence"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ko" ? "직업" : "Occupation"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-occupation">
                          <SelectValue placeholder={language === "ko" ? "직업을 선택하세요" : "Select occupation"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {occupationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} data-testid={`option-occupation-${option.value}`}>
                            {option.label[language as "en" | "ko"]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchOccupation === "other" && (
                <FormField
                  control={form.control}
                  name="occupationCustom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ko" ? "직업 (직접 입력)" : "Occupation (Specify)"}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={language === "ko" ? "직업을 입력하세요" : "Enter your occupation"}
                          data-testid="input-occupation-custom"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="outdoorExposure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ko" ? "야외 노출 정도" : "Outdoor Exposure"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-outdoor-exposure">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low" data-testid="option-exposure-low">
                          {language === "ko" ? "낮음 (주로 실내)" : "Low (Mostly Indoors)"}
                        </SelectItem>
                        <SelectItem value="medium" data-testid="option-exposure-medium">
                          {language === "ko" ? "보통 (출퇴근 등)" : "Medium (Commuting, etc)"}
                        </SelectItem>
                        <SelectItem value="high" data-testid="option-exposure-high">
                          {language === "ko" ? "높음 (야외 활동 많음)" : "High (Frequent Outdoor Activities)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="commuteStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ko" ? "출근 시간" : "Commute Start"}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="time" 
                          data-testid="input-commute-start"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commuteEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ko" ? "퇴근 시간" : "Commute End"}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="time" 
                          data-testid="input-commute-end"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ko" ? "연령대" : "Age Group"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-age-group">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="child" data-testid="option-age-child">
                          {language === "ko" ? "어린이 (0-12세)" : "Child (0-12)"}
                        </SelectItem>
                        <SelectItem value="teen" data-testid="option-age-teen">
                          {language === "ko" ? "청소년 (13-19세)" : "Teen (13-19)"}
                        </SelectItem>
                        <SelectItem value="adult" data-testid="option-age-adult">
                          {language === "ko" ? "성인 (20-64세)" : "Adult (20-64)"}
                        </SelectItem>
                        <SelectItem value="senior" data-testid="option-age-senior">
                          {language === "ko" ? "노인 (65세 이상)" : "Senior (65+)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>{language === "ko" ? "건강 상태" : "Health Conditions"}</FormLabel>
                <div className="space-y-2">
                  {healthConditionOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={selectedHealthConditions.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedHealthConditions([...selectedHealthConditions, option.value]);
                          } else {
                            setSelectedHealthConditions(selectedHealthConditions.filter((v) => v !== option.value));
                          }
                        }}
                        data-testid={`checkbox-health-${option.value}`}
                      />
                      <label
                        htmlFor={option.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label[language as "en" | "ko"]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                data-testid="button-submit-onboarding"
              >
                {language === "ko" ? "프로필 저장" : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
