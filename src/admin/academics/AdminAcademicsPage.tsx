import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAccess } from "../governance/useGovernance";
import { PageIntro } from "../../components/data-display/PageIntro";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { AcademicCatalogPanel } from "./AcademicCatalogPanel";
import { AcademicImportsPanel } from "./AcademicImportsPanel";
import { AcademicProgressionPanel } from "./AcademicProgressionPanel";
import { AcademicStudentsPanel } from "./AcademicStudentsPanel";
import { sectionLabels, type CatalogSection } from "./academic-fields";
import type { Text } from "../../types/content";
import { useAuth } from "../../app/providers/AuthProvider";
import "../../styles/account-access.css";
import "../../styles/academic-admin.css";
const panels: {
  id: CatalogSection | "imports" | "progression" | "students";
  label: Text;
  permission: string;
}[] = [
  ...(
    [
      "years",
      "semesters",
      "batches",
      "subjects",
      "offerings",
    ] as CatalogSection[]
  ).map((id) => ({
    id,
    label: sectionLabels[id],
    permission: `academics.${id}.manage`,
  })),
  {
    id: "imports",
    label: { en: "Imports", ar: "الاستيراد" },
    permission: "academics.import",
  },
  {
    id: "progression",
    label: { en: "Promotion runs", ar: "عمليات الترفيع" },
    permission: "academics.promotions.preview",
  },
  {
    id: "students",
    label: { en: "Student records", ar: "سجلات الطلبة" },
    permission: "academics.read",
  },
];
export default function AdminAcademicsPage() {
  const { t } = useLocale(),
    services = useServices(),
    access = useAccess(),
    [selected, setSelected] = useState("");
  const [params] = useSearchParams();
  const studentId = params.get("student") || "";
  const owner = useAuth().snapshot.user?.id || "anonymous";
  const can = (permission: string) =>
    !!access.data?.permissions?.includes(permission);
  const allowed = panels.filter((panel) => can(panel.permission));
  const tab =
    allowed.find(
      (panel) => panel.id === (selected || (studentId ? "students" : "")),
    )?.id || allowed[0]?.id;
  if (access.isPending) return <LoadingState />;
  if (access.isError) return <ErrorState retry={() => void access.refetch()} />;
  return (
    <div className="container academic-admin">
      <PageIntro
        eyebrow={t({ en: "Academic operations", ar: "الإدارة الأكاديمية" })}
        title={t({
          en: "Academic catalog & progression",
          ar: "الدليل والتقدم الأكاديمي",
        })}
        description={t({
          en: "Manage the calendar, batches and course offerings. Review imports and student progression before applying changes.",
          ar: "أدر التقويم والدفعات والمساقات، وراجع الاستيراد وتقدم الطلبة قبل تطبيق التغييرات.",
        })}
      />
      {!services.academicAdmin ? (
        <p>
          {t({
            en: "Academic administration is not available in this environment.",
            ar: "الإدارة الأكاديمية غير متاحة في هذه البيئة.",
          })}
        </p>
      ) : (
        <>
          <nav
            className="academic-admin-tabs"
            aria-label={t({
              en: "Academic administration sections",
              ar: "أقسام الإدارة الأكاديمية",
            })}
          >
            {allowed.map((panel) => (
              <button
                key={panel.id}
                aria-pressed={tab === panel.id}
                onClick={() => setSelected(panel.id)}
              >
                {t(panel.label)}
              </button>
            ))}
          </nav>
          {tab &&
            (
              [
                "years",
                "semesters",
                "batches",
                "subjects",
                "offerings",
              ] as string[]
            ).includes(tab) && (
              <AcademicCatalogPanel
                key={owner + tab}
                section={tab as CatalogSection}
                can={can}
              />
            )}
          {tab === "imports" && <AcademicImportsPanel key={owner} />}
          {tab === "progression" && <AcademicProgressionPanel key={owner} />}
          {tab === "students" && (
            <AcademicStudentsPanel
              key={owner + studentId}
              initialUserId={studentId}
            />
          )}
          {!tab && (
            <p>
              {t({
                en: "No academic administration sections are available to this account.",
                ar: "لا تتوفر أقسام إدارة أكاديمية لهذا الحساب.",
              })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
