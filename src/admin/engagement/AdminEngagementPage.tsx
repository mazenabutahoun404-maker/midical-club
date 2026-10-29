import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { useAccess } from "../governance/useGovernance";
import {
  useEngagementConnection,
  QueryStatus,
} from "../../features/engagement/shared";
import { EventsAdmin } from "./EventsAdmin";
import { OpportunitiesAdmin } from "./OpportunitiesAdmin";
import { AttendanceScanner } from "./AttendanceAdmin";
import { CertificateTemplates } from "./CertificatesAdmin";
import { VolunteerHours } from "../../features/engagement/VolunteerHours";
import { EventJobs } from "./Jobs";
export default function AdminEngagementPage() {
  const { owner, session } = useEngagementConnection();
  return <AdminEngagement key={String(owner) + session} />;
}
function AdminEngagement() {
  const { t } = useLocale(),
    access = useAccess(),
    permissions = access.data?.permissions || [],
    [selected, setSelected] = useState(""),
    tabs = [
      ...(permissions.some(
        (p) =>
          p.startsWith("events.") ||
          p.startsWith("attendance.") ||
          p.startsWith("certificates."),
      )
        ? [{ id: "events", label: t({ en: "Events", ar: "الفعاليات" }) }]
        : []),
      ...(permissions.includes("opportunities.view_admin")
        ? [
            {
              id: "opportunities",
              label: t({ en: "Opportunities", ar: "الفرص" }),
            },
          ]
        : []),
      ...(permissions.includes("attendance.scan")
        ? [
            {
              id: "scan",
              label: t({ en: "Attendance desk", ar: "مكتب الحضور" }),
            },
          ]
        : []),
      ...(permissions.includes("certificates.templates.manage")
        ? [
            {
              id: "templates",
              label: t({ en: "Certificate templates", ar: "قوالب الشهادات" }),
            },
          ]
        : []),
      ...(permissions.includes("volunteer_hours.view_all") ||
      permissions.includes("volunteer_hours.create_admin")
        ? [
            {
              id: "hours",
              label: t({ en: "Volunteer hours", ar: "الساعات التطوعية" }),
            },
          ]
        : []),
      ...(permissions.includes("events.view_admin")
        ? [{ id: "jobs", label: t({ en: "Jobs", ar: "المهام" }) }]
        : []),
    ],
    tab = tabs.some((item) => item.id === selected) ? selected : tabs[0]?.id;
  return (
    <div className="container engagement-admin engagement-page">
      <header className="engagement-heading">
        <span className="eyebrow">medClub</span>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Events & participation", ar: "الفعاليات والمشاركة" })}
        </h1>
        <p>
          {t({
            en: "Manage events, registration, attendance and recognition with reviewed server actions.",
            ar: "إدارة الفعاليات والتسجيل والحضور والتكريم بإجراءات مراجعة على الخادم.",
          })}
        </p>
      </header>
      <QueryStatus query={access} />
      <nav
        className="engagement-tabs"
        aria-label={t({
          en: "Participation administration",
          ar: "إدارة المشاركة",
        })}
      >
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => setSelected(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      {tab === "events" && <EventsAdmin permissions={permissions} />}{" "}
      {tab === "opportunities" && (
        <OpportunitiesAdmin permissions={permissions} />
      )}{" "}
      {tab === "scan" && <AttendanceScanner />}{" "}
      {tab === "templates" && <CertificateTemplates />}{" "}
      {tab === "hours" && <VolunteerHours admin permissions={permissions} />}{" "}
      {tab === "jobs" && <EventJobs />}
    </div>
  );
}
