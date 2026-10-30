import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  register: (input: RegisterInput) => Promise<AuthSnapshot>;
  verifyEmail: (code: string) => Promise<AuthSnapshot>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateProfile: (input: AuthProfileInput) => Promise<AuthSnapshot>;
  signOut: () => Promise<AuthSnapshot>;
}

const initialSnapshot: AuthSnapshot = { status: "anonymous", user: null };
const Context = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const services = useServices();
  const { setAccountAvailable } = useAppearance();
  const queryClient = useQueryClient();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isPending, setPending] = useState(true);

  const commit = useCallback(
    async (next: AuthSnapshot) => {
      setSnapshot(next);
      setAccountAvailable(next.status !== "anonymous");
      if (next.user)
        queryClient.setQueryData(["personal", "profile"], next.user.profile);
      else queryClient.removeQueries({ queryKey: ["personal", "profile"] });
      return next;
    },
    [queryClient, setAccountAvailable],
  );

  const refresh = useCallback(async () => {
    const next = await services.auth.getSnapshot();
    setPending(false);
    return commit(next);
  }, [commit, services.auth]);

  useEffect(() => {
    void refresh();
    return services.auth.subscribe(() => void refresh());
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
      refresh,
      signIn: (input) => run(() => services.auth.signIn(input)),
      register: (input) => run(async () => {
        const next = await services.auth.register(input);
        // A newly created account starts with the guest's selected MedClub mode.
        if (next.status !== "anonymous") {
          try {
            const mode = localStorage.getItem("medclub.guest-appearance.v1") === "dark" ? "dark" : "light";
            localStorage.setItem("medclub.appearance.v1", JSON.stringify({ navigation: "vertical", sidebarCollapsed: false, palette: "medclub", colorMode: mode }));
            window.dispatchEvent(new StorageEvent("storage", { key: "medclub.appearance.v1" }));
          } catch { /* Account creation remains available without browser storage. */ }
        }
        return next;
      }),
      verifyEmail: (code) => run(() => services.auth.verifyEmail(code)),
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
    [isPending, refresh, run, services.auth, snapshot],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider required");
  return value;
}
