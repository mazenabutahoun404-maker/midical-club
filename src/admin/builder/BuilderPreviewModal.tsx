import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import type { BuilderDevice, BuilderPageDocument } from "../../types/builder";
import { BuilderBlockPreview } from "./BuilderBlockPreview";
import { builderAudienceKey } from "./builder-format";

export function BuilderPreviewModal({
  open,
  onClose,
  page,
  device,
  onDeviceChange,
}: {
  open: boolean;
  onClose: () => void;
  page: BuilderPageDocument;
  device: BuilderDevice;
  onDeviceChange: (device: BuilderDevice) => void;
}) {
  const { label } = useLocale();
  const devices = [
    { id: "desktop", label: "builderDesktop", icon: Monitor },
    { id: "tablet", label: "builderTablet", icon: Tablet },
    { id: "phone", label: "builderPhone", icon: Smartphone },
  ] as const;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={label("builderPreviewTitle")}
      description={label("builderPreviewDescription")}
      className="builder-preview-modal"
    >
      <div className="builder-preview-toolbar">
        <div
          className="builder-device-switcher"
          role="group"
          aria-label={label("builderPreview")}
        >
          {devices.map(({ id, label: key, icon: Icon }) => (
            <button
              type="button"
              aria-pressed={device === id}
              onClick={() => onDeviceChange(id)}
              key={id}
            >
              <Icon size={16} />
              <span>{label(key)}</span>
            </button>
          ))}
        </div>
        <div className="builder-preview-facts">
          <span>{label(builderAudienceKey(page.audience))}</span>
          <span>{page.slug}</span>
        </div>
      </div>
      <div className="builder-full-preview-stage">
        <div
          className="builder-full-preview"
          data-device={device}
          data-theme={page.theme}
        >
          <div className="builder-preview-sitebar">
            <strong>MEDCLUB</strong>
            <span>Learn&nbsp;&nbsp; Community&nbsp;&nbsp; Events</span>
            <i />
          </div>
          {page.blocks
            .filter((block) => block.enabled)
            .map((block) => (
              <div className="builder-preview-block" key={block.id}>
                {(block.visibility.audience !== "public" ||
                  block.schedule.startsAt ||
                  block.schedule.endsAt) && (
                  <div className="builder-preview-rule-note">
                    {label(builderAudienceKey(block.visibility.audience))}
                    {(block.schedule.startsAt || block.schedule.endsAt) &&
                      ` · ${label("builderSchedule")}`}
                  </div>
                )}
                <BuilderBlockPreview block={block} />
              </div>
            ))}
        </div>
      </div>
    </Modal>
  );
}
