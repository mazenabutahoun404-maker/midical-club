import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import type {
  AccessChangeInput,
  AccessDecisionInput,
  Capability,
} from "../../types/governance";

export function useAccess() {
  const services = useServices();
  return useQuery({ queryKey: ["governance", "access"], queryFn: services.governance.getAccess });
}
export function useGovernanceOverview() {
  const services = useServices();
  return useQuery({ queryKey: ["governance", "overview"], queryFn: services.governance.getOverview });
}
export function useGovernanceUsers() {
  const services = useServices();
  return useQuery({ queryKey: ["governance", "users"], queryFn: services.governance.listUsers });
}
export function useGovernanceRoles() {
  const services = useServices();
  return useQuery({ queryKey: ["governance", "roles"], queryFn: services.governance.listRoles });
}
export function useCapabilities() {
  const services = useServices();
  return useQuery({ queryKey: ["governance", "capabilities"], queryFn: services.governance.listCapabilities });
}
export function useAccessRequests() {
  const services = useServices();
  return useQuery({ queryKey: ["governance", "requests"], queryFn: services.governance.listRequests });
}
export function useGovernanceActions() {
  const services = useServices();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["governance"] });
  const updateRole = useMutation({ mutationFn: ({ roleId, capabilities }: { roleId: string; capabilities: Capability[] }) => services.governance.updateRoleCapabilities(roleId, capabilities), onSuccess: refresh });
  const requestChange = useMutation({ mutationFn: (input: AccessChangeInput) => services.governance.requestAccessChange(input), onSuccess: refresh });
  const decide = useMutation({ mutationFn: (input: AccessDecisionInput) => services.governance.decideRequest(input), onSuccess: refresh });
  const suspend = useMutation({ mutationFn: services.governance.suspendUser, onSuccess: refresh });
  return {
    updateRole: updateRole.mutateAsync,
    requestChange: requestChange.mutateAsync,
    decide: decide.mutateAsync,
    suspend: suspend.mutateAsync,
    isMutating: updateRole.isPending || requestChange.isPending || decide.isPending || suspend.isPending,
  };
}
