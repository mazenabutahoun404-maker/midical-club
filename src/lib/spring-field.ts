export type SpringAxis = { position: number; velocity: number };
/** Semi-implicit spring integration with a bounded timestep for suspended tabs. */
export function springStep(
  axis: SpringAxis,
  target: number,
  seconds: number,
  stiffness = 170,
  damping = 19,
) {
  const dt = Math.max(0, Math.min(1 / 30, seconds));
  const velocity =
    axis.velocity +
    ((target - axis.position) * stiffness - axis.velocity * damping) * dt;
  const position = axis.position + velocity * dt;
  return Math.abs(target - position) < 0.015 && Math.abs(velocity) < 0.025
    ? { position: target, velocity: 0 }
    : { position, velocity };
}
export function repel(
  x: number,
  y: number,
  px: number,
  py: number,
  radius: number,
  strength: number,
) {
  const dx = x - px,
    dy = y - py,
    distance = Math.hypot(dx, dy);
  if (distance >= radius) return { x: 0, y: 0 };
  const force = (1 - distance / radius) ** 2 * strength;
  // A deterministic direction handles a pointer exactly on a particle center.
  return {
    x: (distance ? dx / distance : 1) * force,
    y: (distance ? dy / distance : 0) * force,
  };
}
