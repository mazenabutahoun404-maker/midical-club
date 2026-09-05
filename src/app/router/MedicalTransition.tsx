import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function MedicalTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="medical-route-transition"
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.32, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {!reduced && (
        <motion.div
          className="medical-scan"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0.9 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <i />
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}
