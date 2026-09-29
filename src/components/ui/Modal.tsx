import {
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = "",
  hideHeading = false,
  hideClose = false,
  onAfterClose,
  initialFocus,
  style,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  hideHeading?: boolean;
  hideClose?: boolean;
  onAfterClose?: () => void;
  initialFocus?: string;
  style?: CSSProperties;
}) {
  const { dir, label } = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const afterClose = useRef(onAfterClose);
  afterClose.current = onAfterClose;
  const titleId = useId(),
    descriptionId = useId();
  // Native modality moves focus and makes the background inert atomically.
  // Never aria-hide the shell or restore focus before the dialog has closed.
  useLayoutEffect(() => {
    const node = dialog.current;
    if (!open || !node) return;
    node.showModal();
    // Run after native modality, synchronously in the opening gesture, before any animation.
    if (initialFocus)
      node
        .querySelector<HTMLElement>(initialFocus)
        ?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      afterClose.current?.();
    };
  }, [open, initialFocus]);
  return createPortal(
    <dialog
      ref={dialog}
      style={style}
      dir={dir}
      className={`medclub-modal medclub-native-modal ${className}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const r = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          onClose();
      }}
    >
      <div className={hideHeading ? "sr-only" : "modal-heading"}>
        <h2 id={titleId} data-slot="dialog-title">
          {title}
        </h2>
        <p id={descriptionId} data-slot="dialog-description">
          {description}
        </p>
      </div>
      {open && children}
      {!hideClose && (
        <button
          type="button"
          className="modal-close"
          aria-label={label("close")}
          onClick={onClose}
        >
          <X size={19} />
        </button>
      )}
    </dialog>,
    document.body,
  );
}
