import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppearanceProvider } from "./AppearanceProvider";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { TooltipProvider } from "../../components/ui/tooltip";
import { LocaleProvider, useLocale } from "./LocaleProvider";
import { ServicesProvider } from "./ServicesProvider";
import { SavedItemsProvider } from "./SavedItemsProvider";
import { OverlayProvider } from "./OverlayProvider";
import { mockServices } from "../../services/mock-services";
import { QUERY_STALE_TIME } from "../../constants/config";
import type { MedClubServices } from "../../services/contracts";
import type { Locale } from "../../types/content";
function Notifications() {
  const { dir } = useLocale();
  return (
    <Toaster
      position={dir === "rtl" ? "bottom-left" : "bottom-right"}
      dir={dir}
      theme="light"
    />
  );
}
export function AppProviders({
  children,
  services = mockServices,
  initialLocale,
}: {
  children: ReactNode;
  services?: MedClubServices;
  initialLocale?: Locale;
}) {
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
      <ServicesProvider services={services}>
        <LocaleProvider initialLocale={initialLocale}>
          <AppearanceProvider>
            <MotionConfig reducedMotion="user">
              <TooltipProvider delayDuration={350}>
                <SavedItemsProvider>
                  <OverlayProvider>
                    {children}
                    <Notifications />
                  </OverlayProvider>
                </SavedItemsProvider>
              </TooltipProvider>
            </MotionConfig>
          </AppearanceProvider>
        </LocaleProvider>
      </ServicesProvider>
    </QueryClientProvider>
  );
}
