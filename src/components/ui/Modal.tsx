import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";
import { useLocale } from "../../app/providers/LocaleProvider";
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = "",
  hideHeading = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  hideHeading?: boolean;
}) {
  const { dir, label } = useLocale();
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent
        dir={dir}
        showCloseButton={false}
        className={`medclub-modal ${className}`}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className={hideHeading ? "sr-only" : "modal-heading"}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        {children}
        <DialogClose className="modal-close" aria-label={label("close")}>
          <X size={19} />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
