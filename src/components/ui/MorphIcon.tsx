import {
  ShieldCheck,
  BadgeCheck,
  BadgeInfo,
  BellRing,
  BookCopy,
  BookmarkCheck,
  BrainCircuit,
  BookOpenCheck,
  BookOpenText,
  BriefcaseMedical,
  Building2,
  CalendarClock,
  CalendarRange,
  ChartSpline,
  CircleCheckBig,
  ClipboardPenLine,
  Crosshair,
  DoorOpen,
  FileCheck,
  Handshake,
  HeartPulse,
  History,
  IdCard,
  Images,
  KeySquare,
  ListChecks,
  ListFilterPlus,
  MessageCircleCheck,
  Microscope,
  PackageOpen,
  PanelTopOpen,
  PanelsTopLeft,
  ReceiptText,
  ScanFace,
  ScanSearch,
  ScanLine,
  SlidersVertical,
  SquareActivity,
  Stethoscope,
  Store,
  Telescope,
  TimerReset,
  TextSelect,
  Trophy,
  UserRoundCog,
  UserRoundCheck,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

/*
 * Match by Lucide's stable display name instead of importing every source icon.
 * Navigation modules already own their source icons; keeping only the destination
 * shapes here avoids turning the shared app shell into an oversized icon registry.
 */
const pairs: Record<string, LucideIcon> = {
  Activity: SquareActivity,
  Award: Trophy,
  Bell: BellRing,
  Bone: ScanLine,
  Bookmark: BookmarkCheck,
  Brain: BrainCircuit,
  BookOpen: BookOpenCheck,
  BriefcaseBusiness: BriefcaseMedical,
  CalendarCheck: CalendarClock,
  CalendarDays: CalendarRange,
  Camera: Images,
  ChartNoAxesCombined: ChartSpline,
  ClipboardCheck: ClipboardPenLine,
  ClipboardList: ListChecks,
  ContactRound: IdCard,
  FileCheck2: FileCheck,
  FileClock: History,
  Fingerprint: ScanFace,
  FlaskConical: Microscope,
  HeartHandshake: Handshake,
  HeartPulse: Stethoscope,
  House: DoorOpen,
  Info: BadgeInfo,
  KeyRound: KeySquare,
  Landmark: Building2,
  Languages: TextSelect,
  LayoutDashboard: PanelsTopLeft,
  Library: BookCopy,
  MessageCircleQuestion: MessageCircleCheck,
  Newspaper: BookOpenText,
  PackageCheck: PackageOpen,
  PanelsTopLeft: PanelTopOpen,
  Search: ScanSearch,
  ShieldCheck: ShieldCheck,
  ShoppingBag: Store,
  ShoppingCart: ReceiptText,
  SlidersHorizontal: ListFilterPlus,
  Sparkles: Telescope,
  Stethoscope: HeartPulse,
  Telescope: Crosshair,
  Timer: TimerReset,
  UserRound: UserRoundCheck,
  UserRoundCheck: BadgeCheck,
  Users: UserRoundPlus,
  UsersRound: UserRoundCog,
};

export function MorphIcon({
  icon: From,
  to,
  size = 20,
  className = "",
}: {
  icon: LucideIcon;
  to?: LucideIcon;
  size?: number;
  className?: string;
}) {
  const name = From.displayName || From.name || "icon";
  const To = to || pairs[name] || CircleCheckBig;
  return (
    <span
      className={`motion-icon ${className}`.trim()}
      data-morph={name.toLowerCase()}
      aria-hidden="true"
      style={{ "--motion-icon-size": `${size}px` } as CSSProperties}
    >
      <From className="motion-icon-from" size={size} />
      <To className="motion-icon-to" size={size} />
      <i className="motion-icon-trace" />
    </span>
  );
}
