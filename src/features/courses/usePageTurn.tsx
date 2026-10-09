import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  dragProgress,
  shouldCommitTurn,
  type TurnDirection,
} from "./page-turn";

export interface TurnState {
  direction: TurnDirection;
  progress: number;
  settling: boolean;
}
export function usePageTurn({
  rtl,
  canTurn,
  onCommit,
  identity,
}: {
  rtl: boolean;
  canTurn: (direction: TurnDirection) => boolean;
  onCommit: (direction: TurnDirection) => void;
  identity?: string;
}) {
  const [turn, setTurn] = useState<TurnState | null>(null);
  const current = useRef<TurnState | null>(null);
  const callbacks = useRef({ canTurn, onCommit, rtl });
  callbacks.current = { canTurn, onCommit, rtl };
  const gesture = useRef<{
    id: number;
    start: number;
    startY: number;
    last: number;
    time: number;
    width: number;
    velocity: number;
  } | null>(null);
  const frame = useRef(0),
    suppressClick = useRef(false);
  const update = (next: TurnState | null) => {
    current.current = next;
    setTurn(next);
  };
  function settle(commit: boolean) {
    const state = current.current;
    if (!state) return;
    cancelAnimationFrame(frame.current);
    const from = state.progress,
      to = commit ? 1 : 0,
      start = performance.now();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : Math.max(160, Math.abs(to - from) * 360);
    const animate = (now: number) => {
      const elapsed = duration ? Math.min(1, (now - start) / duration) : 1;
      const progress =
        from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * elapsed));
      update({ ...state, progress, settling: true });
      if (elapsed < 1) frame.current = requestAnimationFrame(animate);
      else {
        if (commit) callbacks.current.onCommit(state.direction);
        update(null);
      }
    };
    frame.current = requestAnimationFrame(animate);
  }
  function request(direction: TurnDirection) {
    if (current.current || !callbacks.current.canTurn(direction)) return;
    update({ direction, progress: 0, settling: true });
    settle(true);
  }
  function edge(direction: TurnDirection) {
    return {
      onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          current.current ||
          !callbacks.current.canTurn(direction)
        )
          return;
        event.stopPropagation();
        suppressClick.current = true;
        const width =
          event.currentTarget.parentElement?.clientWidth || window.innerWidth;
        gesture.current = {
          id: event.pointerId,
          start: event.clientX,
          startY: event.clientY,
          last: event.clientX,
          time: performance.now(),
          width,
          velocity: 0,
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
        update({ direction, progress: 0, settling: false });
      },
      onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
        const point = gesture.current,
          state = current.current;
        if (!point || point.id !== event.pointerId || !state || state.settling)
          return;
        const now = performance.now();
        point.velocity =
          ((point.last - event.clientX) *
            direction *
            (callbacks.current.rtl ? -1 : 1)) /
          Math.max(1, now - point.time);
        point.last = event.clientX;
        point.time = now;
        update({
          ...state,
          progress: dragProgress(
            point.start,
            event.clientX,
            point.width,
            direction,
            callbacks.current.rtl,
          ),
        });
      },
      onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
        const point = gesture.current,
          state = current.current;
        if (!point || point.id !== event.pointerId || !state) return;
        gesture.current = null;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        settle(
          Math.hypot(
            point.start - event.clientX,
            point.startY - event.clientY,
          ) < 5 || shouldCommitTurn(state.progress, point.velocity),
        );
      },
      onPointerCancel() {
        gesture.current = null;
        suppressClick.current = false;
        settle(false);
      },
      onClick() {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        request(direction);
      },
    };
  }
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      gesture.current = null;
    },
    [],
  );
  useEffect(() => {
    cancelAnimationFrame(frame.current);
    gesture.current = null;
    current.current = null;
    setTurn(null);
  }, [identity, rtl]);
  return {
    turn,
    request,
    edge,
    cancel: () => {
      gesture.current = null;
      settle(false);
    },
  };
}
export function TurnLeaf({
  turn,
  rtl,
  twoPages = true,
  front,
  back,
}: {
  turn: TurnState;
  rtl: boolean;
  twoPages?: boolean;
  front: ReactNode;
  back: ReactNode;
}) {
  const forward = turn.direction === 1;
  const physicalRight = forward !== rtl;
  const angle = turn.progress * 180 * (physicalRight ? -1 : 1);
  return (
    <div
      className="hand-turn-leaf"
      data-side={physicalRight ? "right" : "left"}
      data-single={!twoPages || undefined}
      aria-hidden="true"
      inert
      style={
        {
          "--turn-progress": turn.progress,
          transform:
            "rotateY(" +
            angle +
            "deg) scaleY(" +
            (1 - Math.sin(turn.progress * Math.PI) * 0.035) +
            ")",
          "--turn-bend": Math.sin(turn.progress * Math.PI),
        } as CSSProperties
      }
    >
      <div className="hand-turn-body">
        <div className="hand-turn-front">{front}</div>
        <div className="hand-turn-back">{back}</div>
      </div>
      <div className="hand-turn-curl">
        <div className="hand-turn-curl-front">
          <div className="hand-turn-curl-content">{front}</div>
        </div>
        <div className="hand-turn-curl-back">
          <div className="hand-turn-curl-content">{back}</div>
        </div>
      </div>
      <i className="hand-turn-crease" />
      <i className="hand-turn-curled-edge" />
    </div>
  );
}
