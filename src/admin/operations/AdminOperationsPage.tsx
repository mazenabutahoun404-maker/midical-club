import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { Button } from "../../components/ui/button";
import { useOperationsConnection, QueryStatus } from "./shared";
import { Overview, Analytics, ContentHealth } from "./Analytics";
import { Audit, SecurityAlerts } from "./Audit";
import { Governance } from "./Governance";
import { System } from "./System";
import { Search } from "./Search";
import "../../styles/operations-connect.css";
export default function AdminOperationsPage({
  initial = "overview",
}: {
  initial?: string;
}) {
  const { owner, session } = useOperationsConnection();
  return <Workspace key={String(owner) + session} initial={initial} />;
}
function Workspace({ initial }: { initial: string }) {
  const { t } = useLocale(),
    access = useAccess(),
    permissions = access.data?.permissions || [],
    [selected, setSelected] = useState(initial);
  const tabs = [
      { id: "overview", en: "Overview", ar: "نظرة عامة" },
      { id: "analytics", en: "Analytics", ar: "التحليلات" },
      { id: "health", en: "Content health", ar: "صحة المحتوى" },
      ...(permissions.includes("audit.read") ||
      permissions.includes("audit.export")
        ? [{ id: "audit", en: "Audit", ar: "التدقيق" }]
        : []),
      { id: "security", en: "Security alerts", ar: "التنبيهات الأمنية" },
      { id: "governance", en: "Governance", ar: "الحوكمة" },
      { id: "system", en: "System", ar: "النظام" },
      { id: "search", en: "Search", ar: "البحث" },
    ],
    tab = tabs.some((v) => v.id === selected) ? selected : "overview";
  return (
    <div className="container operations-connected engagement-page">
      <header className="engagement-heading">
        <span className="eyebrow">medClub</span>
        <h1 tabIndex={-1} data-page-heading>
          {t({ en: "Insights & operations", ar: "التحليلات والعمليات" })}
        </h1>
        <p>
          {t({
            en: "Review activity, content quality and operational requests.",
            ar: "مراجعة النشاط وجودة المحتوى وطلبات العمليات.",
          })}
        </p>
      </header>
      <QueryStatus query={access} />
      <nav
        className="engagement-tabs"
        aria-label={t({ en: "Operations sections", ar: "أقسام العمليات" })}
      >
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => setSelected(item.id)}
          >
            {t(item)}
          </Button>
        ))}
      </nav>
      {tab === "overview" && <Overview />}
      {tab === "analytics" && <Analytics permissions={permissions} />}{" "}
      {tab === "health" && <ContentHealth />}
      {tab === "audit" && <Audit permissions={permissions} />}{" "}
      {tab === "security" && <SecurityAlerts />}
      {tab === "governance" && <Governance permissions={permissions} />}{" "}
      {tab === "system" && <System />}
      {tab === "search" && <Search permissions={permissions} />}
    </div>
  );
}
