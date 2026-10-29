import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { Button } from "../../components/ui/button";
import {
  usePublicationConnection,
  QueryStatus,
} from "../../features/publications/shared";
import { publicationSections } from "../../services/api/publication-contracts";
import { sectionInfo } from "../../features/publications/model";
import { PublicationDesk } from "./PublicationDesk";
import { AboutDesk } from "./AboutDesk";
import { Categories } from "./Categories";
import { Monitoring } from "./Monitoring";
export default function AdminPublicationsPage() {
  const { owner, session, services } = usePublicationConnection();
  return services.publicationApi ? (
    <AdminPublications key={String(owner) + session} />
  ) : null;
}
function AdminPublications() {
  const { t } = useLocale(),
    access = useAccess(),
    permissions = access.data?.permissions || [],
    [selected, setSelected] = useState("");
  const visible = publicationSections.filter((section) =>
    permissions.includes(sectionInfo[section].prefix + ".view_admin"),
  );
  const tabs = [
    ...visible.map((id) => ({ id, label: t(sectionInfo[id]) })),
    ...(permissions.includes("about.view_admin")
      ? [{ id: "about", label: t({ en: "About", ar: "نبذة النادي" }) }]
      : []),
    ...(["activities", "honor-plate"] as const)
      .filter((id) =>
        permissions.includes(sectionInfo[id].prefix + ".categories.manage"),
      )
      .map((id) => ({
        id: "categories:" + id,
        label:
          t(sectionInfo[id]) + " · " + t({ en: "Categories", ar: "الفئات" }),
      })),
    ...(visible.length || permissions.includes("about.view_admin")
      ? [
          {
            id: "monitoring",
            label: t({ en: "Jobs & schedules", ar: "المهام والجدولة" }),
          },
        ]
      : []),
  ];
  const tab = tabs.some((x) => x.id === selected) ? selected : tabs[0]?.id;
  return (
    <div className="container academic-admin publication-admin">
      <header className="admin-page-heading">
        <span className="eyebrow">medClub</span>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Club publications", ar: "منشورات النادي" })}
        </h1>
        <p>
          {t({
            en: "Manage club stories, people and media. Draft saves and publication remain separate.",
            ar: "إدارة قصص النادي وأفراده ووسائطه. يبقى حفظ المسودة منفصلًا عن النشر.",
          })}
        </p>
      </header>
      <QueryStatus query={access} />
      <nav
        className="publication-tabs"
        aria-label={t({ en: "Publication sections", ar: "أقسام المنشورات" })}
      >
        {tabs.map((x) => (
          <Button
            key={x.id}
            variant={tab === x.id ? "default" : "outline"}
            onClick={() => setSelected(x.id)}
          >
            {x.label}
          </Button>
        ))}
      </nav>
      {!access.isPending && !access.error && !tabs.length && (
        <p>
          {t({
            en: "No publication permissions are available for this account.",
            ar: "لا تتوفر صلاحيات منشورات لهذا الحساب.",
          })}
        </p>
      )}
      {visible.map((section) =>
        tab === section ? (
          <PublicationDesk
            key={section}
            section={section}
            permissions={permissions}
          />
        ) : null,
      )}
      {tab === "about" && <AboutDesk permissions={permissions} />}{" "}
      {tab?.startsWith("categories:") && (
        <Categories
          key={tab}
          section={tab.slice(11) as "activities" | "honor-plate"}
        />
      )}{" "}
      {tab === "monitoring" && (
        <Monitoring
          canRetry={permissions.some((p) =>
            /^(about|activities|journal|conferences|executive_bodies|honor|alumni|media)\.publish$/.test(
              p,
            ),
          )}
        />
      )}
    </div>
  );
}
