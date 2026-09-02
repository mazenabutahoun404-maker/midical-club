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
}: {
  name: IconName;
  className?: string;
}) {
  const Component = icons[name];
  return <Component className={className} aria-hidden="true" />;
}
