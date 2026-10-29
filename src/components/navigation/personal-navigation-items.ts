import {
  House,
  FileQuestion,
  BookOpen,
  Bookmark,
  Timer,
  CalendarDays,
  HeartHandshake,
  PackageCheck,
  ClipboardList,
  ContactRound,
  Layers,
} from "lucide-react";
import type { MessageKey } from "../../constants/messages";

/** Shared by the desktop rail and the phone's secondary menu. */
export const personalNavigationItems = [
  { href: "/my", label: "mySpace", icon: House },
  { href: "/my/learning", label: "myLearning", icon: BookOpen },
  { href: "/my/exams", label: "exams", icon: FileQuestion },
  { href: "/my/library", label: "libraryShort", icon: Bookmark },
  { href: "/my/calendar", label: "calendar", icon: CalendarDays },
  { href: "/my/activities", label: "myActivities", icon: Layers },
  { href: "/my/engagement", label:"myEngagement",icon:Layers },
  { href: "/my/mentorship", label: "myMentorship", icon: HeartHandshake },
  { href: "/my/orders", label: "myOrders", icon: PackageCheck },
  { href: "/my/applications", label: "myApplications", icon: ClipboardList },
  { href: "/my/team", label: "teamProfile", icon: ContactRound },
  { href: "/my/focus", label: "myFocus", icon: Timer },
] satisfies { href: string; label: MessageKey; icon: typeof House }[];
