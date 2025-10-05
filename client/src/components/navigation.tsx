import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Globe, LogIn, LogOut, User, Settings, Sparkles } from "lucide-react";
import { Link } from "wouter";

export function Navigation() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.setQueryData(["/api/auth/user"], null);
    window.location.href = "/api/logout";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/90 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Airbender
            </div>
            <div className="hidden sm:block text-sm text-muted-foreground">
              {t("Air Quality Intelligence", "대기질 예측")}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user && (
              <Button
                variant="ghost"
                size="default"
                asChild
                className="gap-2"
                data-testid="button-alerts"
              >
                <Link href="/alerts">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("AI Alerts", "AI 알림")}</span>
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              aria-label={t("Toggle theme", "테마 전환")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="default"
              onClick={() => setLanguage(language === "en" ? "ko" : "en")}
              data-testid="button-language-toggle"
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium">{language === "en" ? "한국어" : "English"}</span>
            </Button>

            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="gap-2"
                        data-testid="button-user-menu"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline font-medium">
                          {user.firstName || user.email?.split('@')[0] || 'User'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel data-testid="text-user-email">
                        {user.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link 
                          href="/onboarding" 
                          className="cursor-pointer flex items-center"
                          data-testid="button-profile-setup"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t("Profile Setup", "프로필 설정")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="cursor-pointer"
                        data-testid="button-logout"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("Logout", "로그아웃")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="default"
                    size="default"
                    asChild
                    className="gap-2"
                    data-testid="button-login"
                  >
                    <a href="/api/login">
                      <LogIn className="h-4 w-4" />
                      <span>{t("Login", "로그인")}</span>
                    </a>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
