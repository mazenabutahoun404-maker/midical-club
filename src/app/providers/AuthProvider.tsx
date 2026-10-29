import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppearance } from "./AppearanceProvider";
import { useServices } from "./ServicesProvider";
import type {
  AuthProfileInput,
  AuthSnapshot,
  RegisterInput,
  SignInInput,
} from "../../types/auth";

interface AuthContextValue {
  snapshot: AuthSnapshot;
  isPending: boolean;
  refresh: () => Promise<AuthSnapshot>;
  signIn: (input: SignInInput) => Promise<AuthSnapshot>;
  reauthenticate: (password: string) => Promise<AuthSnapshot>;
  register: (input: RegisterInput) => Promise<AuthSnapshot>;
  verifyEmail: (code: string) => Promise<AuthSnapshot>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateProfile: (input: AuthProfileInput) => Promise<AuthSnapshot>;
  signOut: () => Promise<AuthSnapshot>;
  hasNewlyUnlockedFeatures: boolean;
  dismissNewlyUnlockedFeatures: () => void;
}

const initialSnapshot: AuthSnapshot = { status: "anonymous", user: null };
const Context = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const services = useServices();
  const { setAccountAvailable } = useAppearance();
  const queryClient = useQueryClient();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isPending, setPending] = useState(true);
  const [hasNewlyUnlockedFeatures, setNewlyUnlockedFeatures] = useState(false);
  const previousOwner = useRef("anonymous:");
  const commitRevision = useRef(0);

  const commit = useCallback(
    async (next: AuthSnapshot) => {
      const revision = ++commitRevision.current;
      const owner = `${next.status}:${next.user?.id || ""}`;
      if (owner !== previousOwner.current) {
        previousOwner.current = owner;
        await queryClient.cancelQueries();
        if (revision !== commitRevision.current) return next;
        queryClient.clear();
      }
      setSnapshot(next);
      if (next.status !== "authenticated") setNewlyUnlockedFeatures(false);
      setAccountAvailable(next.status !== "anonymous");
      if (next.user)
        queryClient.setQueryData(["personal", "profile"], next.user.profile);
      else queryClient.removeQueries({ queryKey: ["personal", "profile"] });
      return next;
    },
    [queryClient, setAccountAvailable],
  );

  const refresh = useCallback(async () => {
    try {
      return await commit(await services.auth.getSnapshot());
    } finally {
      setPending(false);
    }
  }, [commit, services.auth]);

  useEffect(() => {
    void refresh().catch(() => undefined);
    return services.auth.subscribe(() => {
      void refresh().catch(() => undefined);
    });
  }, [refresh, services.auth]);

  const run = useCallback(
    async (action: () => Promise<AuthSnapshot>) => {
      setPending(true);
      try {
        return await commit(await action());
      } finally {
        setPending(false);
      }
    },
    [commit],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      snapshot,
      isPending,
      hasNewlyUnlockedFeatures,
      dismissNewlyUnlockedFeatures: () => setNewlyUnlockedFeatures(false),
      refresh,
      signIn: async (input) => {
        const next = await run(() => services.auth.signIn(input));
        if (next.status === "authenticated") setNewlyUnlockedFeatures(true);
        return next;
      },
      reauthenticate: (password) =>
        run(() => {
          if (!services.auth.reauthenticate)
            throw new Error("REAUTHENTICATION_NOT_AVAILABLE");
          return services.auth.reauthenticate(password);
        }),
      register: (input) =>
        run(async () => {
          const next = await services.auth.register(input);
          // A newly created account starts with the guest's selected MedClub mode.
          if (next.status !== "anonymous") {
            try {
              const mode =
                localStorage.getItem("medclub.guest-appearance.v1") === "dark"
                  ? "dark"
                  : "light";
              localStorage.setItem(
                "medclub.appearance.v1",
                JSON.stringify({
                  navigation: "vertical",
                  sidebarCollapsed: false,
                  palette: "medclub",
                  colorMode: mode,
                }),
              );
              window.dispatchEvent(
                new StorageEvent("storage", { key: "medclub.appearance.v1" }),
              );
            } catch {
              /* Account creation remains available without browser storage. */
            }
          }
          return next;
        }),
      verifyEmail: async (code) => {
        const next = await run(() => services.auth.verifyEmail(code));
        if (next.status === "authenticated") setNewlyUnlockedFeatures(true);
        return next;
      },
      requestPasswordReset: async (email) => {
        setPending(true);
        try {
          await services.auth.requestPasswordReset(email);
        } finally {
          setPending(false);
        }
      },
      updateProfile: (input) => run(() => services.auth.updateProfile(input)),
      signOut: () => run(() => services.auth.signOut()),
    }),
    [
      hasNewlyUnlockedFeatures,
      isPending,
      refresh,
      run,
      services.auth,
      snapshot,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider required");
  return value;
}
