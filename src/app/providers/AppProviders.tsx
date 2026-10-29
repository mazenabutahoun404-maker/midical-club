import { useEffect, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppearanceProvider, useAppearance } from "./AppearanceProvider";
import { MotionConfig } from "framer-motion";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "../../components/ui/tooltip";
import { LocaleProvider, useLocale } from "./LocaleProvider";
import { ServicesProvider } from "./ServicesProvider";
import { SavedItemsProvider } from "./SavedItemsProvider";
import { OverlayProvider } from "./OverlayProvider";
import { WorkspaceProvider } from "./WorkspaceProvider";
import { createHttpServices } from "../../services/http-services";
import { QUERY_STALE_TIME } from "../../constants/config";
import type { MedClubServices } from "../../services/contracts";
import type { Locale } from "../../types/content";
import { AuthProvider, useAuth } from "./AuthProvider";
import { StudyChromeProvider } from "./StudyChromeProvider";
function Notifications() {
  const { dir, t } = useLocale();
  const { resolvedTheme } = useAppearance();
  const { hasNewlyUnlockedFeatures } = useAuth();
  const navigate = useNavigate();
  const discoveryPrompted = useRef(false);
  useEffect(() => {
    if (!hasNewlyUnlockedFeatures) {
      discoveryPrompted.current = false;
      toast.dismiss("account-features-available");
      return;
    }
    if (discoveryPrompted.current) return;
    discoveryPrompted.current = true;
    toast(
      t({
        en: "More to explore after sign-in",
        ar: "المزيد للاستكشاف بعد تسجيل الدخول",
      }),
      {
        id: "account-features-available",
        description: t({
          en: "Your library, exams and account links are now available.",
          ar: "أصبحت مكتبتك والامتحانات وروابط حسابك متاحة الآن.",
        }),
        duration: 8000,
        action: {
          label: t({ en: "Show me", ar: "أرني" }),
          onClick: () => navigate("/#site-footer"),
        },
      },
    );
  }, [hasNewlyUnlockedFeatures, navigate, t]);
  return (
    <Toaster
      position={dir === "rtl" ? "bottom-left" : "bottom-right"}
      dir={dir}
      theme={resolvedTheme}
    />
  );
}
export function AppProviders({
  children,
  services,
  initialLocale,
}: {
  children: ReactNode;
  services?: MedClubServices;
  initialLocale?: Locale;
}) {
  const [defaultServices] = useState(() => createHttpServices());
  const activeServices = services || defaultServices;
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ServicesProvider services={activeServices}>
        <LocaleProvider initialLocale={initialLocale}>
          <AppearanceProvider>
            <AuthProvider>
              <MotionConfig reducedMotion="user">
                <TooltipProvider delayDuration={350}>
                  <WorkspaceProvider>
                    <SavedItemsProvider>
                      <OverlayProvider>
                        <StudyChromeProvider>
                          {children}
                          <Notifications />
                        </StudyChromeProvider>
                      </OverlayProvider>
                    </SavedItemsProvider>
                  </WorkspaceProvider>
                </TooltipProvider>
              </MotionConfig>
            </AuthProvider>
          </AppearanceProvider>
        </LocaleProvider>
      </ServicesProvider>
    </QueryClientProvider>
  );
}
