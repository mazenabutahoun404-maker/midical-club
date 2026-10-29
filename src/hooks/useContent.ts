import { useUndoNotice } from "../components/feedback/useUndoNotice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../app/providers/ServicesProvider";
import { useAuth } from "../app/providers/AuthProvider";
export function useSiteContent() {
  const s = useServices();
  const shell = useQuery({ queryKey: ["site", "shell"], queryFn: s.site.get });
  const published = useQuery({
    queryKey: ["site", "published"],
    queryFn: s.site.getPublished || (async () => null),
    enabled: !!s.site.getPublished,
    retry: false,
  });
  return shell.isSuccess
    ? {
        ...shell,
        data: published.data || shell.data,
        publishedPending: published.isPending,
        publishedError: published.error,
        refreshPublished: published.refetch,
      }
    : {
        ...shell,
        publishedPending: published.isPending,
        publishedError: published.error,
        refreshPublished: published.refetch,
      };
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
  const undoNotice = useUndoNotice();
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
    mutationFn: async (input: import("../types/content").ContributionInput) => {
      const owner = studentId!,
        before = input.id
          ? (await s.contributions.list(owner)).find(
              (item) => item.id === input.id,
            )
          : undefined;
      const after = await s.contributions.saveDraft(owner, input);
      if (before && s.contributions.restoreDraft)
        undoNotice({ en: "Draft updated", ar: "عُدّلت المسودة" }, async () => {
          await s.contributions.restoreDraft!(owner, before, after);
          await client.invalidateQueries({
            queryKey: ["contributions", owner],
          });
        });
      return after;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const submit = useMutation({
    mutationFn: (id: string) => s.contributions.submit(studentId!, id),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const owner = studentId!,
        before = (await s.contributions.list(owner)).find(
          (item) => item.id === id,
        );
      await s.contributions.deleteDraft(owner, id);
      if (before && s.contributions.restoreDraft)
        undoNotice({ en: "Draft deleted", ar: "حُذفت المسودة" }, async () => {
          await s.contributions.restoreDraft!(owner, before, null);
          await client.invalidateQueries({
            queryKey: ["contributions", owner],
          });
        });
    },
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
  const undoNotice = useUndoNotice();
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
    }) => {
      const owner = studentId!;
      return (async () => {
        const previous = (await s.store.getCart(owner)).lines.find(
          (line) =>
            line.productId === productId && line.variantId === variantId,
        );
        const updated = await s.store.setCartLine(
          owner,
          productId,
          variantId,
          quantity,
        );
        const expected =
          updated.lines.find(
            (line) =>
              line.productId === productId && line.variantId === variantId,
          )?.quantity || 0;
        if (previous)
          undoNotice(
            { en: "Quantity updated", ar: "عُدّلت الكمية" },
            async () => {
              const current = await s.store.getCart(owner);
              if (
                (current.lines.find(
                  (line) =>
                    line.productId === productId &&
                    line.variantId === variantId,
                )?.quantity || 0) !== expected
              )
                throw new Error("CART_CHANGED");
              const restored = await s.store.setCartLine(
                owner,
                productId,
                variantId,
                previous.quantity,
              );
              client.setQueryData(["store", "cart", owner], restored);
            },
          );
        return updated;
      })();
    },
    onSuccess: refreshCart,
  });
  const remove = useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => {
      const owner = studentId!;
      return (async () => {
        const previous = (await s.store.getCart(owner)).lines.find(
          (line) =>
            line.productId === productId && line.variantId === variantId,
        );
        const updated = await s.store.removeCartLine(
          owner,
          productId,
          variantId,
        );
        if (previous)
          undoNotice({ en: "Item removed", ar: "حُذف العنصر" }, async () => {
            if (
              (await s.store.getCart(owner)).lines.some(
                (line) =>
                  line.productId === productId && line.variantId === variantId,
              )
            )
              throw new Error("CART_CHANGED");
            const restored = await s.store.setCartLine(
              owner,
              productId,
              variantId,
              previous.quantity,
            );
            client.setQueryData(["store", "cart", owner], restored);
          });
        return updated;
      })();
    },
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

export function useRecruitmentPositions() {
  const services = useServices();
  return useQuery({
    queryKey: ["recruitment", "positions"],
    queryFn: services.recruitment.listPositions,
  });
}

export function useRecruitmentPosition(slug?: string) {
  const services = useServices();
  return useQuery({
    queryKey: ["recruitment", "position", slug],
    queryFn: () => services.recruitment.getPosition(slug!),
    enabled: !!slug,
  });
}

export function useRecruitmentWorkspace() {
  const services = useServices();
  const undoNotice = useUndoNotice();
  const auth = useAuth();
  const profile = useStudentProfile();
  const client = useQueryClient();
  const signedIn = auth.snapshot.status === "authenticated";
  const studentId = signedIn ? profile.data?.id : undefined;
  const applicationKey = ["recruitment", "applications", studentId];
  const memberKey = ["recruitment", "member", studentId];
  const applications = useQuery({
    queryKey: applicationKey,
    queryFn: () => services.recruitment.listApplications(studentId!),
    enabled: !!studentId,
  });
  const membership = useQuery({
    queryKey: memberKey,
    queryFn: () => services.recruitment.getMemberProfile(studentId!),
    enabled: !!studentId,
  });
  const refreshApplications = () =>
    client.invalidateQueries({ queryKey: applicationKey });
  const saveDraft = useMutation({
    mutationFn: (
      input: import("../types/recruitment").RecruitmentApplicationInput,
    ) => {
      const owner = studentId!;
      return (async () => {
        const before = input.id
          ? (await services.recruitment.listApplications(owner)).find(
              (item) => item.id === input.id,
            )
          : undefined;
        const after = await services.recruitment.saveDraft(owner, input);
        if (before)
          undoNotice(
            { en: "Application draft updated", ar: "عُدّلت مسودة الطلب" },
            async () => {
              const current = (
                await services.recruitment.listApplications(owner)
              ).find((item) => item.id === after.id);
              if (JSON.stringify(current) !== JSON.stringify(after))
                throw new Error("APPLICATION_CHANGED");
              await services.recruitment.saveDraft(owner, before);
              await client.invalidateQueries({
                queryKey: ["recruitment", "applications", owner],
              });
            },
          );
        return after;
      })();
    },
    onSuccess: refreshApplications,
  });
  const submit = useMutation({
    mutationFn: (id: string) => services.recruitment.submit(studentId!, id),
    onSuccess: refreshApplications,
  });
  const withdraw = useMutation({
    mutationFn: (id: string) => services.recruitment.withdraw(studentId!, id),
    onSuccess: refreshApplications,
  });
  const toggleOnboardingTask = useMutation({
    mutationFn: ({
      applicationId,
      taskId,
    }: {
      applicationId: string;
      taskId: string;
    }) =>
      services.recruitment.toggleOnboardingTask(
        studentId!,
        applicationId,
        taskId,
      ),
    onSuccess: async () => {
      await Promise.all([
        refreshApplications(),
        client.invalidateQueries({ queryKey: memberKey }),
      ]);
    },
  });
  return {
    signedIn,
    applications: applications.data || [],
    membership: membership.data || null,
    isPending:
      auth.isPending ||
      (signedIn &&
        (profile.isPending || applications.isPending || membership.isPending)),
    isError:
      signedIn &&
      (profile.isError || applications.isError || membership.isError),
    isMutating:
      saveDraft.isPending ||
      submit.isPending ||
      withdraw.isPending ||
      toggleOnboardingTask.isPending,
    saveDraft: saveDraft.mutateAsync,
    submit: submit.mutateAsync,
    withdraw: withdraw.mutateAsync,
    toggleOnboardingTask: toggleOnboardingTask.mutateAsync,
    retry: () => {
      void profile.refetch();
      void applications.refetch();
      void membership.refetch();
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
