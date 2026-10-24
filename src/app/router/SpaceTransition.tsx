import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "../providers/LocaleProvider";
import { arrivalPlayed } from "../../lib/arrival";

type Space = "personal" | "public" | "auth" | "admin";

/** Cross-fades product worlds without hiding focused content or transforming fixed nav. */
export function SpaceTransition({
  space,
  children,
}: {
  space: Space;
  children: ReactNode;
}) {
  const previous = useRef<Space>(space);
  const reduced = useReducedMotion();
  const { label } = useLocale();
  const from = previous.current;
  const crossing = from !== space;
  const entering =
    crossing && !reduced && !arrivalPlayed("shell") && !arrivalPlayed("chest");
  useEffect(() => {
    previous.current = space;
  }, [space]);
  const transitionLabel =
    space === "admin"
      ? label("spaceEnteringAdmin")
      : from === "admin"
        ? label("spaceLeavingAdmin")
        : space === "personal"
          ? label("spaceLeavingPublic")
          : label("spaceLeavingPersonal");
  return (
    <motion.div
      key={space}
      className={`space-transition space-transition-${space}`}
      data-workspace={space}
      data-arriving={entering || undefined}
      initial={entering ? { opacity: 0.08 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
      {entering && (
        <motion.div
          className="space-flight-gate"
          data-from={from}
          data-to={space}
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="space-flight-aperture">
            <i />
            <i />
            <i />
          </span>
          <span className="space-flight-streaks">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <small>{transitionLabel}</small>
        </motion.div>
      )}
    </motion.div>
  );
}
