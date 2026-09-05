import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AcademicTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="academic-route-transition"
      initial={reduced ? false : { opacity: 0, y: 10, scale: 0.997 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0 : 0.32, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {!reduced && (
        <motion.span
          className="academic-route-thread"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0.7 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      )}
      {children}
    </motion.div>
  );
}
