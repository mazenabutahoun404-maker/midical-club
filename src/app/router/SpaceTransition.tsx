import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
/** Animate only the public/personal boundary; don't remount the shell between personal pages. */
export function SpaceTransition({
  space,
  children,
}: {
  space: "personal" | "public" | "auth";
  children: ReactNode;
}) {
  const previous = useRef(space);
  const reduced = useReducedMotion();
  const crossing = previous.current !== space;
  useEffect(() => {
    previous.current = space;
  }, [space]);
  return (
    <motion.div
      key={space}
      className={`space-transition space-transition-${space}`}
      data-workspace={space}
      initial={crossing && !reduced ? { opacity: 0.25 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.28, ease: "easeOut" }}
    >
      {children}
      {crossing && !reduced && (
        <motion.div
          className="space-arrival-wash"
          aria-hidden="true"
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}
