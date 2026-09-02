import { createContext, useContext, type ReactNode } from "react";
import type { MedClubServices } from "../../services/contracts";
const Context = createContext<MedClubServices | null>(null);
export function ServicesProvider({
  services,
  children,
}: {
  services: MedClubServices;
  children: ReactNode;
}) {
  return <Context.Provider value={services}>{children}</Context.Provider>;
}
export function useServices() {
  const services = useContext(Context);
  if (!services) throw new Error("ServicesProvider required");
  return services;
}
