import { BrowserRouter, useInRouterContext } from "react-router-dom";
import { AppProviders } from "./app/providers/AppProviders";
import { AppRouter } from "./app/router/AppRouter";
import { AppErrorBoundary } from "./components/feedback/AppErrorBoundary";
import type { MedClubServices } from "./services/contracts";
import type { Locale } from "./types/content";
import "./styles/index.css";
export interface AppProps {
  services?: MedClubServices;
  initialLocale?: Locale;
}
export default function App(props: AppProps) {
  const insideRouter = useInRouterContext();
  const content = (
    <AppErrorBoundary>
      <AppProviders {...props}>
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  );
  return insideRouter ? (
    content
  ) : (
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}
    >
      {content}
    </BrowserRouter>
  );
}
