import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import {
  useCourses,
  useResources,
  useStudentProfile,
} from "../../hooks/useContent";
import { useHubQuery, useStudyHub } from "../study-hub/useStudyHub";
import {
  findResume,
  homePreferencesKey,
  nextHomeExam,
  readHomePreferences,
  type HomePreferences,
} from "./personal-home-model";

export function usePersonalHome() {
  const services = useServices(),
    auth = useAuth(),
    workspace = useWorkspace();
  const profile = useStudentProfile(),
    courses = useCourses(),
    resources = useResources();
  const owner = auth.snapshot.user?.id || "guest";
  const hub = useStudyHub();
  const [secondary, setSecondary] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [preferences, setPreferences] = useState(() =>
    readHomePreferences(owner),
  );
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setSecondary(true), 180);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      setNow(Date.now());
      timer = setTimeout(tick, 60_000);
    };
    tick();
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === homePreferencesKey(owner) || event.key === null)
        setPreferences(readHomePreferences(owner));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [owner]);
  const savePreferences = (next: HomePreferences) => {
    setPreferences(next);
    try {
      localStorage.setItem(homePreferencesKey(owner), JSON.stringify(next));
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  };
  const academic = useQuery({
    queryKey: ["personal", "calendar"],
    queryFn: services.calendar.list,
  });
  const cards = useHubQuery(
    "recall",
    (signal) => hub.service.listRecall(undefined, { signal }),
    "",
    undefined,
    secondary,
  );
  const claims = useHubQuery(
    "claims",
    (signal) => hub.service.listClaims({ signal }),
    "",
    undefined,
    secondary,
  );
  const rooms = useHubQuery(
    "rooms",
    (signal) => hub.service.listRooms({ signal }),
    "",
    undefined,
    secondary,
  );
  const mentorship = useQuery({
    queryKey: ["mentorship", "requests", profile.data?.id],
    queryFn: () => services.mentorship.listRequests(profile.data!.id),
    enabled: secondary && !!profile.data,
  });
  const contributions = useQuery({
    queryKey: ["contributions", profile.data?.id],
    queryFn: () => services.contributions.list(profile.data!.id),
    enabled: secondary && !!profile.data,
  });
  const myCourses = useMemo(
    () =>
      (courses.data || []).filter((c) =>
        profile.data?.courseIds.includes(c.id),
      ),
    [courses.data, profile.data],
  );
  const myResources = useMemo(
    () =>
      (resources.data || []).filter((r) =>
        myCourses.some((c) => c.id === r.courseId),
      ),
    [resources.data, myCourses],
  );
  const resume = useMemo(
    () =>
      findResume(
        owner,
        myCourses,
        myResources,
        workspace.state.recentResources,
      ),
    [owner, myCourses, myResources, workspace.state.recentResources],
  );
  const exam = nextHomeExam(
    preferences.exam,
    academic.data || [],
    myCourses,
    now,
    services.contentSnapshot?.kind === "live",
  );
  const examSoon =
    !!exam && Date.parse(exam.startsAt) - now <= 24 * 60 * 60_000;
  const upcoming = [
    ...(services.contentSnapshot?.kind === "live" ? academic.data || [] : []),
    ...workspace.state.studyEntries.map((e) => ({
      id: e.id,
      title: { en: e.title, ar: e.title },
      startsAt: `${e.date}T${e.time}:00+03:00`,
      kind: "study" as const,
      courseId: e.courseId,
    })),
    ...(exam ? [exam] : []),
  ]
    .filter(
      (e, index, items) =>
        Date.parse(e.startsAt) > now &&
        (!e.courseId || myCourses.some((c) => c.id === e.courseId)) &&
        items.findIndex((i) => i.id === e.id) === index,
    )
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 3);
  return {
    owner,
    profile,
    courses,
    resources,
    workspace,
    myCourses,
    myResources,
    resume,
    preferences,
    savePreferences,
    persistent,
    now,
    exam,
    examSoon,
    upcoming,
    cards,
    claims,
    rooms,
    mentorship,
    contributions,
    reviewed: myResources.filter((r) =>
      workspace.state.reviewedResourceIds.includes(r.id),
    ),
    dueCards: (cards.data || []).filter((c) => Date.parse(c.dueAt) <= now),
    criticalPending:
      profile.isPending ||
      courses.isPending ||
      resources.isPending ||
      workspace.isPending,
    criticalError:
      profile.isError ||
      courses.isError ||
      resources.isError ||
      workspace.isError,
  };
}
export type PersonalHomeData = ReturnType<typeof usePersonalHome>;
