import { Navigate } from "react-router-dom";
import { useServices } from "../../app/providers/ServicesProvider";
import { MembershipScope } from "./shared";
import { Members, EngagementWorkspace } from "./Members";
export function PublicMembers() {
  const services = useServices();
  return services.membershipApi ? (
    <MembershipScope>
      <Members />
    </MembershipScope>
  ) : (
    <Navigate to="/recruitment" replace />
  );
}
export function MyEngagement() {
  const services = useServices();
  return services.membershipApi ? (
    <MembershipScope>
      <EngagementWorkspace />
    </MembershipScope>
  ) : (
    <Navigate to="/my/activities" replace />
  );
}
