import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { notificationPreferences } from "../../services/api/schedule-contracts";
import {
  Panel,
  QueryStatus,
  useScheduleAction,
  useScheduleConnection,
  useScheduleQuery,
} from "./shared";
export function NotificationPreferences() {
  const { api } = useScheduleConnection(),
    { t } = useLocale(),
    action = useScheduleAction();
  const query = useScheduleQuery("preferences", (signal) =>
    api.get_api_v1_notification_preferences({ signal }),
  );
  const [changes, setChanges] = useState<Record<string, boolean>>({});
  return (
    <Panel
      title={t({ en: "Notification preferences", ar: "تفضيلات الإشعارات" })}
    >
      <QueryStatus query={query} />
      {query.data && (
        <form
          className="schedule-fields"
          onSubmit={(e) => {
            e.preventDefault();
            void action.run(
              () =>
                api.put_api_v1_notification_preferences({
                  body: notificationPreferences(query.data, changes),
                }),
              () => setChanges({}),
            );
          }}
        >
          <p>
            {query.data.channel}
            {query.data.required
              ? ` · ${t({ en: "Required channel", ar: "قناة مطلوبة" })}`
              : ""}
          </p>
          {query.data.categories.map((category) => {
            const selected = Object.hasOwn(changes, category.category)
              ? String(changes[category.category])
              : category.enabled === null
                ? "default"
                : String(category.enabled);
            return (
              <label
                className="notification-preference"
                key={category.category}
              >
                <span>
                  {category.category}
                  {!category.canDisable && (
                    <small> · {t({ en: "Required", ar: "مطلوب" })}</small>
                  )}
                </span>
                <select
                  aria-label={category.category}
                  value={selected}
                  disabled={!category.canDisable || action.busy}
                  onChange={(e) =>
                    setChanges((v) => ({
                      ...v,
                      [category.category]: e.target.value === "true",
                    }))
                  }
                >
                  {category.enabled === null &&
                    !Object.hasOwn(changes, category.category) && (
                      <option value="default">
                        {t({
                          en: "Server default",
                          ar: "الإعداد الافتراضي للخدمة",
                        })}
                      </option>
                    )}
                  <option value="true">
                    {t({ en: "Enabled", ar: "مفعّل" })}
                  </option>
                  <option value="false">
                    {t({ en: "Disabled", ar: "معطّل" })}
                  </option>
                </select>
              </label>
            );
          })}
          <Button disabled={action.busy || !Object.keys(changes).length}>
            {t({ en: "Save preferences", ar: "حفظ التفضيلات" })}
          </Button>
        </form>
      )}
      {action.feedback}
    </Panel>
  );
}
