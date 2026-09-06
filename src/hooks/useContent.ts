import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../app/providers/ServicesProvider";
export function useSiteContent() {
  const s = useServices();
  return useQuery({ queryKey: ["site"], queryFn: s.site.get });
}
export function useCourses() {
  const s = useServices();
  return useQuery({ queryKey: ["courses"], queryFn: s.academics.listCourses });
}
export function useBatches() {
  const s = useServices();
  return useQuery({
    queryKey: ["academics", "batches"],
    queryFn: s.academics.listBatches,
  });
}
export function useClinicalYears() {
  const s = useServices();
  return useQuery({
    queryKey: ["academics", "clinical-years"],
    queryFn: s.academics.listClinicalYears,
  });
}
export function useResources() {
  const s = useServices();
  return useQuery({ queryKey: ["resources"], queryFn: s.resources.list });
}
export function useEvents() {
  const s = useServices();
  return useQuery({ queryKey: ["events"], queryFn: s.events.list });
}
export function useEvent(slug?: string) {
  const s = useServices();
  return useQuery({
    queryKey: ["events", "detail", slug],
    queryFn: () => s.events.get(slug!),
    enabled: !!slug,
  });
}
export function useEventRegistrations() {
  const s = useServices();
  const profile = useStudentProfile();
  const client = useQueryClient();
  const studentId = profile.data?.id;
  const key = ["events", "registrations", studentId];
  const query = useQuery({
    queryKey: key,
    queryFn: () => s.events.listRegistrations(studentId!),
    enabled: !!studentId,
  });
  const register = useMutation({
    mutationFn: (eventId: string) => s.events.register(studentId!, eventId),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const cancel = useMutation({
    mutationFn: (eventId: string) => s.events.cancel(studentId!, eventId),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  return {
    registrations: query.data || [],
    isPending: profile.isPending || query.isPending,
    isError: profile.isError || query.isError,
    register: register.mutateAsync,
    cancel: cancel.mutateAsync,
    isMutating: register.isPending || cancel.isPending,
    retry: () => {
      void profile.refetch();
      void query.refetch();
    },
  };
}
export function useOpportunities() {
  const s = useServices();
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: s.opportunities.list,
  });
}
export function useOpportunity(slug?: string) {
  const s = useServices();
  return useQuery({
    queryKey: ["opportunities", "detail", slug],
    queryFn: () => s.opportunities.get(slug!),
    enabled: !!slug,
  });
}
export function useJournal() {
  const s = useServices();
  return useQuery({ queryKey: ["journal"], queryFn: s.journal.list });
}
export function useArticle(slug?: string) {
  const s = useServices();
  return useQuery({
    queryKey: ["journal", "article", slug],
    queryFn: () => s.journal.get(slug!),
    enabled: !!slug,
  });
}
export function useCommunityActivities() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "activities"],
    queryFn: s.community.listActivities,
  });
}
export function useCommunityMedia() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "media"],
    queryFn: s.community.listMedia,
  });
}
export function useExecutiveBodies() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "executive-bodies"],
    queryFn: s.community.listExecutiveBodies,
  });
}
export function useRecognitions() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "recognitions"],
    queryFn: s.community.listRecognitions,
  });
}
export function useClubValues() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "values"],
    queryFn: s.community.listValues,
  });
}

export function useMentors() {
  const s = useServices();
  return useQuery({
    queryKey: ["mentorship", "mentors"],
    queryFn: s.mentorship.listMentors,
  });
}
export function useMentorshipSessions() {
  const s = useServices();
  return useQuery({
    queryKey: ["mentorship", "sessions"],
    queryFn: s.mentorship.listSessions,
  });
}
export function useMentorshipQuestions() {
  const s = useServices();
  return useQuery({
    queryKey: ["mentorship", "questions"],
    queryFn: s.mentorship.listQuestions,
  });
}
export function useMentorshipWorkspace() {
  const s = useServices();
  const profile = useStudentProfile();
  const client = useQueryClient();
  const studentId = profile.data?.id;
  const requestKey = ["mentorship", "requests", studentId];
  const registrationKey = ["mentorship", "registrations", studentId];
  const requests = useQuery({
    queryKey: requestKey,
    queryFn: () => s.mentorship.listRequests(studentId!),
    enabled: !!studentId,
  });
  const registrations = useQuery({
    queryKey: registrationKey,
    queryFn: () => s.mentorship.listSessionRegistrations(studentId!),
    enabled: !!studentId,
  });
  const request = useMutation({
    mutationFn: (input: import("../types/content").MentorshipRequestInput) =>
      s.mentorship.request(studentId!, input),
    onSuccess: () => client.invalidateQueries({ queryKey: requestKey }),
  });
  const cancelRequest = useMutation({
    mutationFn: (requestId: string) =>
      s.mentorship.cancelRequest(studentId!, requestId),
    onSuccess: () => client.invalidateQueries({ queryKey: requestKey }),
  });
  const registerSession = useMutation({
    mutationFn: (sessionId: string) =>
      s.mentorship.registerSession(studentId!, sessionId),
    onSuccess: () => client.invalidateQueries({ queryKey: registrationKey }),
  });
  const cancelSession = useMutation({
    mutationFn: (sessionId: string) =>
      s.mentorship.cancelSessionRegistration(studentId!, sessionId),
    onSuccess: () => client.invalidateQueries({ queryKey: registrationKey }),
  });
  return {
    requests: requests.data || [],
    registrations: registrations.data || [],
    isPending:
      profile.isPending || requests.isPending || registrations.isPending,
    isError: profile.isError || requests.isError || registrations.isError,
    isMutating:
      request.isPending ||
      cancelRequest.isPending ||
      registerSession.isPending ||
      cancelSession.isPending,
    request: request.mutateAsync,
    cancelRequest: cancelRequest.mutateAsync,
    registerSession: registerSession.mutateAsync,
    cancelSession: cancelSession.mutateAsync,
    retry: () => {
      void profile.refetch();
      void requests.refetch();
      void registrations.refetch();
    },
  };
}
export function useContributions() {
  const s = useServices();
  const profile = useStudentProfile();
  const client = useQueryClient();
  const studentId = profile.data?.id;
  const key = ["contributions", studentId];
  const query = useQuery({
    queryKey: key,
    queryFn: () => s.contributions.list(studentId!),
    enabled: !!studentId,
  });
  const save = useMutation({
    mutationFn: (input: import("../types/content").ContributionInput) =>
      s.contributions.saveDraft(studentId!, input),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const submit = useMutation({
    mutationFn: (id: string) => s.contributions.submit(studentId!, id),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => s.contributions.deleteDraft(studentId!, id),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  return {
    items: query.data || [],
    isPending: profile.isPending || query.isPending,
    isError: profile.isError || query.isError,
    isMutating: save.isPending || submit.isPending || remove.isPending,
    saveDraft: save.mutateAsync,
    submit: submit.mutateAsync,
    deleteDraft: remove.mutateAsync,
    retry: () => {
      void profile.refetch();
      void query.refetch();
    },
  };
}

export function useStoreProducts() {
  const s = useServices();
  return useQuery({
    queryKey: ["store", "products"],
    queryFn: s.store.listProducts,
  });
}
export function useStoreProduct(slug?: string) {
  const s = useServices();
  return useQuery({
    queryKey: ["store", "product", slug],
    queryFn: () => s.store.getProduct(slug!),
    enabled: !!slug,
  });
}
export function useStoreWorkspace() {
  const s = useServices();
  const profile = useStudentProfile();
  const client = useQueryClient();
  const studentId = profile.data?.id;
  const cartKey = ["store", "cart", studentId];
  const orderKey = ["store", "orders", studentId];
  const cart = useQuery({
    queryKey: cartKey,
    queryFn: () => s.store.getCart(studentId!),
    enabled: !!studentId,
  });
  const orders = useQuery({
    queryKey: orderKey,
    queryFn: () => s.store.listOrders(studentId!),
    enabled: !!studentId,
  });
  const refreshCart = () => client.invalidateQueries({ queryKey: cartKey });
  const refreshOrders = () => client.invalidateQueries({ queryKey: orderKey });
  const add = useMutation({
    mutationFn: ({
      productId,
      variantId,
      quantity,
    }: {
      productId: string;
      variantId: string;
      quantity: number;
    }) => s.store.addCartLine(studentId!, productId, variantId, quantity),
    onSuccess: refreshCart,
  });
  const setQuantity = useMutation({
    mutationFn: ({
      productId,
      variantId,
      quantity,
    }: {
      productId: string;
      variantId: string;
      quantity: number;
    }) => s.store.setCartLine(studentId!, productId, variantId, quantity),
    onSuccess: refreshCart,
  });
  const remove = useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => s.store.removeCartLine(studentId!, productId, variantId),
    onSuccess: refreshCart,
  });
  const reserve = useMutation({
    mutationFn: () => s.store.reserveCart(studentId!),
    onSuccess: async () => {
      await Promise.all([refreshCart(), refreshOrders()]);
    },
  });
  const cancelOrder = useMutation({
    mutationFn: (orderId: string) => s.store.cancelOrder(studentId!, orderId),
    onSuccess: refreshOrders,
  });
  return {
    cart: cart.data || { studentId: studentId || "", lines: [], updatedAt: "" },
    orders: orders.data || [],
    isPending: profile.isPending || cart.isPending || orders.isPending,
    isError: profile.isError || cart.isError || orders.isError,
    isMutating:
      add.isPending ||
      setQuantity.isPending ||
      remove.isPending ||
      reserve.isPending ||
      cancelOrder.isPending,
    add: add.mutateAsync,
    setQuantity: setQuantity.mutateAsync,
    remove: remove.mutateAsync,
    reserve: reserve.mutateAsync,
    cancelOrder: cancelOrder.mutateAsync,
    retry: () => {
      void profile.refetch();
      void cart.refetch();
      void orders.refetch();
    },
  };
}

export function useStudentProfile() {
  const services = useServices();
  return useQuery({
    queryKey: ["personal", "profile"],
    queryFn: services.personal.getProfile,
  });
}
