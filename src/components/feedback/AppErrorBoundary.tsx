import { Component, type ReactNode } from "react";
import { messages } from "../../constants/messages";
import { STORAGE_KEYS } from "../../constants/config";
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    let locale: "en" | "ar" = "en";
    try {
      if (localStorage.getItem(STORAGE_KEYS.locale) === "ar") locale = "ar";
    } catch {}
    const m = messages[locale];
    return (
      <main
        className="container not-found"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <h1>{m.errorTitle}</h1>
        <p>{m.errorBody}</p>
        <button
          className="button button-primary"
          onClick={() => window.location.reload()}
        >
          {m.retry}
        </button>
      </main>
    );
  }
}
