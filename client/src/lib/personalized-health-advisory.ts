import type { AirQualityLevel, UserType } from "@shared/schema";

interface PersonalizedAdvisory {
  message: string;
  messageKo: string;
  activities: string[];
  activitiesKo: string[];
}

export function getPersonalizedHealthAdvisory(
  level: AirQualityLevel,
  userType: UserType
): PersonalizedAdvisory {
  const advisories: Record<AirQualityLevel, Record<UserType, PersonalizedAdvisory>> = {
    excellent: {
      student: {
        message: "Perfect air quality! Great day for outdoor sports and physical education classes. Enjoy outdoor activities freely.",
        messageKo: "완벽한 대기질입니다! 야외 스포츠와 체육 수업에 좋은 날입니다. 자유롭게 야외 활동을 즐기세요.",
        activities: ["Outdoor sports", "PE classes", "Playground activities", "Cycling to school"],
        activitiesKo: ["야외 스포츠", "체육 수업", "운동장 활동", "자전거 등교"]
      },
      elderly: {
        message: "Excellent air quality! Perfect for morning walks and outdoor exercise. Take advantage of the fresh air.",
        messageKo: "훌륭한 대기질입니다! 아침 산책과 야외 운동에 완벽합니다. 신선한 공기를 마음껏 즐기세요.",
        activities: ["Morning walks", "Park visits", "Gentle outdoor exercise", "Gardening"],
        activitiesKo: ["아침 산책", "공원 방문", "가벼운 야외 운동", "정원 가꾸기"]
      },
      worker: {
        message: "Great air quality! Consider walking or cycling to work. Perfect for lunch break outdoor activities.",
        messageKo: "좋은 대기질입니다! 걸어서 또는 자전거로 출근하는 것을 고려하세요. 점심 시간 야외 활동에 완벽합니다.",
        activities: ["Walk/cycle to work", "Outdoor lunch breaks", "Evening jogging", "Outdoor meetings"],
        activitiesKo: ["도보/자전거 출근", "야외 점심", "저녁 조깅", "야외 회의"]
      },
      general: {
        message: "Air quality is excellent. Perfect day for outdoor activities!",
        messageKo: "대기질이 매우 좋습니다. 야외 활동하기 완벽한 날입니다!",
        activities: ["Outdoor exercise", "Sports", "Hiking"],
        activitiesKo: ["야외 운동", "스포츠", "등산"]
      }
    },
    moderate: {
      student: {
        message: "Air quality is acceptable. Reduce intense outdoor activities during recess. Stay hydrated during sports.",
        messageKo: "대기질이 보통입니다. 쉬는 시간 격렬한 야외 활동을 줄이세요. 운동 중 수분 섭취하세요.",
        activities: ["Indoor sports", "Library study", "Light outdoor play", "Art activities"],
        activitiesKo: ["실내 스포츠", "도서관 학습", "가벼운 야외 놀이", "미술 활동"]
      },
      elderly: {
        message: "Moderate air quality. Consider indoor activities or short outdoor walks during cooler hours. Monitor for any discomfort.",
        messageKo: "보통 대기질입니다. 실내 활동이나 서늘한 시간에 짧은 산책을 고려하세요. 불편함을 주의 깊게 살피세요.",
        activities: ["Indoor exercise", "Shopping malls walks", "Light housework", "Indoor hobbies"],
        activitiesKo: ["실내 운동", "쇼핑몰 산책", "가벼운 집안일", "실내 취미"]
      },
      worker: {
        message: "Acceptable air quality. Take indoor breaks. If commuting, consider public transport over walking long distances.",
        messageKo: "허용 가능한 대기질입니다. 실내에서 휴식하세요. 출퇴근 시 장거리 도보보다 대중교통을 이용하세요.",
        activities: ["Indoor gym", "Elevator instead of stairs", "Indoor meetings", "Telecommuting if possible"],
        activitiesKo: ["실내 헬스장", "계단 대신 엘리베이터", "실내 회의", "재택근무 가능시"]
      },
      general: {
        message: "Air quality is acceptable. Most people can enjoy outdoor activities.",
        messageKo: "대기질이 보통입니다. 대부분의 사람들이 야외 활동을 즐길 수 있습니다.",
        activities: ["Light exercise", "Walking", "Indoor activities"],
        activitiesKo: ["가벼운 운동", "산책", "실내 활동"]
      }
    },
    unhealthy: {
      student: {
        message: "Unhealthy air quality for students. Cancel outdoor PE classes. Stay indoors during breaks. Close classroom windows.",
        messageKo: "학생들에게 나쁜 대기질입니다. 야외 체육 수업을 취소하세요. 쉬는 시간 실내에 머무세요. 교실 창문을 닫으세요.",
        activities: ["Indoor classes only", "Computer lab", "Indoor games", "Reading activities"],
        activitiesKo: ["실내 수업만", "컴퓨터실", "실내 게임", "독서 활동"]
      },
      elderly: {
        message: "Unhealthy air quality. Stay indoors with windows closed. Use air purifiers. Avoid all outdoor activities. Seek medical attention if experiencing symptoms.",
        messageKo: "나쁜 대기질입니다. 창문을 닫고 실내에 머무세요. 공기청정기를 사용하세요. 모든 야외 활동을 피하세요. 증상이 있으면 의료 지원을 받으세요.",
        activities: ["Stay indoors", "Air purifier use", "Light indoor stretching", "Monitor health"],
        activitiesKo: ["실내 체류", "공기청정기 사용", "가벼운 실내 스트레칭", "건강 모니터링"]
      },
      worker: {
        message: "Unhealthy air quality. Work from home if possible. Avoid outdoor commuting. Keep office windows closed. Limit physical exertion.",
        messageKo: "나쁜 대기질입니다. 가능하면 재택근무하세요. 야외 통근을 피하세요. 사무실 창문을 닫으세요. 신체 활동을 제한하세요.",
        activities: ["Remote work", "Indoor only", "Minimal movement", "Use masks if must go out"],
        activitiesKo: ["재택근무", "실내만 이용", "최소한의 이동", "외출 시 마스크 착용"]
      },
      general: {
        message: "Everyone may experience health effects. Limit prolonged outdoor activities.",
        messageKo: "모든 사람이 건강상 영향을 경험할 수 있습니다. 장시간 야외 활동을 제한하세요.",
        activities: ["Indoor exercise", "Stay hydrated", "Use air purifiers"],
        activitiesKo: ["실내 운동", "수분 섭취", "공기청정기 사용"]
      }
    },
    hazardous: {
      student: {
        message: "HAZARDOUS for students! School closure recommended. Emergency indoor-only policy. Ensure all students stay home. Provide online classes.",
        messageKo: "학생들에게 매우 위험합니다! 학교 휴교 권장. 긴급 실내 전용 정책. 모든 학생이 집에 머물도록 하세요. 온라인 수업을 제공하세요.",
        activities: ["Stay home", "Online learning", "Indoor rest", "Emergency contacts ready"],
        activitiesKo: ["집에 머물기", "온라인 학습", "실내 휴식", "긴급 연락처 준비"]
      },
      elderly: {
        message: "HAZARDOUS! Emergency indoor confinement. Use N95 masks if must go out. Monitor vital signs. Have emergency contacts ready. Seek immediate medical help if symptoms appear.",
        messageKo: "매우 위험합니다! 긴급 실내 대피. 외출 필수시 N95 마스크 착용. 활력 징후를 모니터링하세요. 긴급 연락처를 준비하세요. 증상 발생 시 즉시 의료 지원 받으세요.",
        activities: ["Emergency indoor stay", "N95 masks", "Medical monitoring", "Emergency preparedness"],
        activitiesKo: ["긴급 실내 대피", "N95 마스크", "의료 모니터링", "비상 대비"]
      },
      worker: {
        message: "HAZARDOUS air quality! Mandatory work from home. Do not commute. Cancel all outdoor meetings. Seal office/home windows. Emergency response plan in effect.",
        messageKo: "매우 위험한 대기질입니다! 의무 재택근무. 출근하지 마세요. 모든 야외 회의 취소. 사무실/집 창문 밀폐. 비상 대응 계획 시행.",
        activities: ["Mandatory remote work", "Seal windows", "Emergency stay", "Health monitoring"],
        activitiesKo: ["의무 재택근무", "창문 밀폐", "비상 대피", "건강 모니터링"]
      },
      general: {
        message: "Health alert: everyone should reduce outdoor activities. Wear masks if going outside.",
        messageKo: "건강 경보: 모든 사람이 야외 활동을 줄여야 합니다. 외출 시 마스크를 착용하세요.",
        activities: ["Stay indoors", "Use N95 masks", "Monitor symptoms"],
        activitiesKo: ["실내 생활", "N95 마스크 사용", "증상 모니터링"]
      }
    },
    critical: {
      student: {
        message: "CRITICAL EMERGENCY for students! Immediate school closure. All students must stay home with sealed windows. Emergency health monitoring. Medical teams on standby.",
        messageKo: "학생 긴급 비상사태! 즉각 학교 휴교. 모든 학생은 창문을 밀폐한 채 집에 머물러야 합니다. 긴급 건강 모니터링. 의료팀 대기.",
        activities: ["Critical emergency stay", "Sealed environment", "Medical standby", "Emergency hotline"],
        activitiesKo: ["긴급 비상 대피", "밀폐 환경", "의료팀 대기", "긴급 핫라인"]
      },
      elderly: {
        message: "CRITICAL HEALTH EMERGENCY! Highest risk group. Immediate medical supervision needed. Stay in sealed rooms with air purifiers. Emergency medical services on alert. Call emergency services immediately if any symptoms.",
        messageKo: "긴급 건강 비상사태! 최고 위험군입니다. 즉각 의료 감독 필요. 공기청정기가 있는 밀폐된 방에 머무세요. 응급 의료 서비스 경계 태세. 증상 발생 시 즉시 응급 서비스에 연락하세요.",
        activities: ["Critical medical supervision", "Sealed rooms", "Emergency medical alert", "Immediate response"],
        activitiesKo: ["긴급 의료 감독", "밀폐된 방", "응급 의료 경보", "즉각 대응"]
      },
      worker: {
        message: "CRITICAL EMERGENCY! All work suspended. Do not leave home under any circumstances. Emergency declared. Government response in effect. Await official instructions.",
        messageKo: "긴급 비상사태! 모든 업무 중단. 어떤 상황에서도 집을 나서지 마세요. 비상사태 선포. 정부 대응 발효. 공식 지시 대기.",
        activities: ["Total lockdown", "Emergency suspension", "Sealed indoors", "Official instructions only"],
        activitiesKo: ["완전 봉쇄", "비상 중단", "실내 밀폐", "공식 지시만 따름"]
      },
      general: {
        message: "Health emergency: Avoid all outdoor activities. Stay indoors with windows closed.",
        messageKo: "건강 비상사태: 모든 야외 활동을 피하세요. 창문을 닫고 실내에 머무르세요.",
        activities: ["Emergency indoor stay", "Seal windows", "Emergency contacts ready"],
        activitiesKo: ["긴급 실내 대피", "창문 밀폐", "긴급 연락처 준비"]
      }
    }
  };

  return advisories[level][userType];
}
