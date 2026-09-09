import {
  BookOpen,
  Stethoscope,
  ClipboardCheck,
  Timer,
  Library,
  HeartPulse,
  Brain,
  FlaskConical,
  Bone,
  Users,
} from "lucide-react";
import type { IconName } from "../../types/content";
import { MorphIcon } from "./MorphIcon";
const icons = {
  book: BookOpen,
  stethoscope: Stethoscope,
  exam: ClipboardCheck,
  timer: Timer,
  library: Library,
  heart: HeartPulse,
  brain: Brain,
  flask: FlaskConical,
  bone: Bone,
  users: Users,
};
export function Icon({
  name,
  className,
  motion = false,
}: {
  name: IconName;
  className?: string;
  motion?: boolean;
}) {
  const Component = icons[name];
  if (motion) return <MorphIcon icon={Component} className={className} />;
  return <Component className={className} aria-hidden="true" />;
}
