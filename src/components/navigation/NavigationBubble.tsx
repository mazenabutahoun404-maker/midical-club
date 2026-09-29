import { motion, useReducedMotion } from "framer-motion";
export function NavigationBubble({
  active,
  group,
}: {
  active: boolean;
  group: string;
}) {
  const reduced = useReducedMotion();
  return active ? (
    <motion.i
      aria-hidden="true"
      className="navigation-bubble"
      layoutId={`navigation-bubble-${group}`}
      transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 0.7, 0.2, 1] }}
    />
  ) : null;
}
