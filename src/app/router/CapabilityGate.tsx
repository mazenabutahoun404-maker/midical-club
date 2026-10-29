import type { ReactNode } from "react";
import type { Capability } from "../../types/governance";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { useLocale } from "../providers/LocaleProvider";
import { useAccess } from "../../admin/governance/useGovernance";

export function CapabilityGate({
  capability,
  children,
}: {
  capability: Capability;
  children: ReactNode;
}) {
  const { label } = useLocale();
  const access = useAccess();
  if (access.isPending) return <LoadingState />;
  if (access.isError) return <ErrorState retry={() => void access.refetch()} />;
  const allowed =
    access.data.capabilities.includes(capability) ||
    (!access.data.permissions &&
      capability === "roles.view" &&
      access.data.capabilities.includes("roles.manage"));
  if (!allowed) {
    return (
      <section className="container governance-forbidden" role="alert">
        <span aria-hidden="true">403</span>
        <h1 data-page-heading tabIndex={-1}>
          {label("governanceForbiddenTitle")}
        </h1>
        <p>{label("governanceForbiddenBody")}</p>
      </section>
    );
  }
  return <>{children}</>;
}
