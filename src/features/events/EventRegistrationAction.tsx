import { useState } from "react";
import { Check, TicketCheck, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { eventAvailability } from "../../lib/discovery";
import { useEventRegistrations } from "../../hooks/useContent";
import type { ClubEvent } from "../../types/content";

export function EventRegistrationAction({ event }: { event: ClubEvent }) {
  const { label } = useLocale();
  const registrations = useEventRegistrations();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const registration = registrations.registrations.find(
    (item) => item.eventId === event.id,
  );
  const availability = eventAvailability(event);
  const canJoin = availability === "open" || availability === "waitlist";

  async function join() {
    try {
      const result = await registrations.register(event.id);
      toast.success(
        label(
          result.status === "registered"
            ? "registrationConfirmed"
            : "waitlistConfirmed",
        ),
      );
    } catch {
      toast.error(label("registrationFailed"));
    }
  }
  async function cancel() {
    try {
      await registrations.cancel(event.id);
      setConfirmCancel(false);
      toast.success(label("registrationCancelled"));
    } catch {
      toast.error(label("registrationFailed"));
    }
  }

  return (
    <div className="registration-action">
      {registration ? (
        <>
          <div
            className="registration-confirmed"
            data-status={registration.status}
            role="status"
          >
            <span>
              {registration.status === "registered" ? (
                <Check size={20} />
              ) : (
                <UsersRound size={20} />
              )}
            </span>
            <div>
              <small>{label("registrationStatus")}</small>
              <strong>{label(registration.status)}</strong>
            </div>
          </div>
          <Button
            variant="outline"
            className="button"
            onClick={() => setConfirmCancel(true)}
          >
            <X size={17} />
            {label("cancelRegistration")}
          </Button>
        </>
      ) : (
        <Button
          className="button button-primary registration-button"
          disabled={
            !canJoin || registrations.isMutating || registrations.isPending
          }
          onClick={() => void join()}
        >
          {availability === "waitlist" ? (
            <UsersRound size={18} />
          ) : (
            <TicketCheck size={18} />
          )}
          {label(
            availability === "waitlist"
              ? "joinWaitlist"
              : availability === "upcoming"
                ? "opensSoon"
                : availability === "closed" || availability === "ended"
                  ? "registrationClosed"
                  : "registerEvent",
          )}
        </Button>
      )}
      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={label("cancelRegistrationTitle")}
        description={label("cancelRegistrationBody")}
      >
        <div className="workspace-form-actions">
          <Button variant="outline" onClick={() => setConfirmCancel(false)}>
            {label("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={registrations.isMutating}
            onClick={() => void cancel()}
          >
            {label("cancelRegistration")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
