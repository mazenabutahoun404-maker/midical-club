import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { MedClubServices } from "../../services/contracts";
import { createLocalStudyService } from "../../services/study/local-study.service";
import { unavailableStudyService } from "../../services/study/unavailable-study.service";
const Context = createContext<MedClubServices | null>(null);
export function ServicesProvider({
  services,
  children,
}: {
  services: MedClubServices;
  children: ReactNode;
}) {
  const ready = useMemo(
    () => ({
      ...services,
      studyHub:
        services.studyHub ||
        (services.contentSnapshot?.kind === "live"
          ? unavailableStudyService()
          : createLocalStudyService({
              auth: services.auth,
              governance: services.governance,
              courses: services.academics.listCourses,
              resources: services.resources.list,
            })),
    }),
    [services],
  );
  return <Context.Provider value={ready}>{children}</Context.Provider>;
}
export function useServices() {
  const services = useContext(Context);
  if (!services) throw new Error("ServicesProvider required");
  return services;
}
