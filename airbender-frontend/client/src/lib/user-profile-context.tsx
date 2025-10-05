import { createContext, useContext, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserType, UserProfileDB } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface UserProfileContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  hasProfile: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Map occupation to userType
function occupationToUserType(occupation: string | null | undefined): UserType {
  if (!occupation) return "general";
  
  switch (occupation) {
    case "student":
      return "student";
    case "retired":
      return "elderly";
    case "office_worker":
    case "outdoor_worker":
    case "service_worker":
    case "healthcare":
      return "worker";
    default:
      return "general";
  }
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const { data: profile } = useQuery<UserProfileDB | null>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const userType = useMemo(() => {
    return occupationToUserType(profile?.occupation);
  }, [profile?.occupation]);

  const hasProfile = !!profile;

  const setUserType = () => {
    // This is now read-only from the database
    console.warn("userType is now derived from occupation in the database");
  };

  return (
    <UserProfileContext.Provider value={{ userType, setUserType, hasProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
}
