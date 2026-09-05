import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
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
  onAfterClose,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  hideHeading?: boolean;
  onAfterClose?: () => void;
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
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      afterClose.current?.();
    };
  }, [open]);
  return createPortal(
    <dialog
      ref={dialog}
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
      <button
        type="button"
        className="modal-close"
        aria-label={label("close")}
        onClick={onClose}
      >
        <X size={19} />
      </button>
    </dialog>,
    document.body,
  );
}
