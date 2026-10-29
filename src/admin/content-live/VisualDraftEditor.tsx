import { useEffect, useRef, useState, useReducer } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { ApiError } from "../../services/api/client";
import { requireVersion } from "../../services/api/accounts";
import { createRecordId } from "../../lib/record-id";
import { record, string } from "../../services/api/mapping";
import { PublishedContent } from "../../features/resources/PublishedContent";
import {
  contentValue,
  richTextSource,
  richTextParagraphs,
} from "../../features/resources/content-model";
import { blockTypes } from "./content-fields";
import { C } from "./content-keys";
import {
  type Draft,
  type Block,
  type Section,
  moveItem,
  cloneBlock,
  draftPreview,
  freshBlock,
  canonicalDraft,
  childField,
  blockChildren,
  assertDraft,
} from "./visual-model";
import "../../styles/content-experience.css";
type State = { doc: Draft; past: Draft[]; future: Draft[]; serial: number };
type Action =
  | { type: "change"; next: Draft }
  | { type: "undo" | "redo" }
  | { type: "reset"; next: Draft };
function reduce(s: State, a: Action): State {
  if (a.type === "reset")
    return { doc: a.next, past: [], future: [], serial: s.serial + 1 };
  if (a.type === "change")
    return {
      doc: a.next,
      past: [...s.past.slice(-49), s.doc],
      future: [],
      serial: s.serial + 1,
    };
  if (a.type === "undo" && s.past.length)
    return {
      doc: s.past.at(-1)!,
      past: s.past.slice(0, -1),
      future: [s.doc, ...s.future],
      serial: s.serial + 1,
    };
  if (a.type === "redo" && s.future.length)
    return {
      doc: s.future[0],
      past: [...s.past, s.doc],
      future: s.future.slice(1),
      serial: s.serial + 1,
    };
  return s;
}
type Schema = {
  schemaVersion?: number;
  blockType: string;
  allowedFields: string[];
  additionalProperties: boolean;
  schema: unknown;
};
export function VisualDraftEditor({
  pageId,
  version,
  initial,
  schemas,
  onPending,
  examination,
}: {
  pageId: string;
  version: string;
  initial: Draft;
  schemas: Schema[];
  onPending?: (pending: boolean) => void;
  examination?: boolean;
}) {
  const services = useServices(),
    { snapshot } = useAuth(),
    { t, locale } = useLocale(),
    client = useQueryClient();
  const [state, dispatch] = useReducer(reduce, {
      doc: structuredClone(initial),
      past: [],
      future: [],
      serial: 0,
    }),
    [saved, setSaved] = useState(JSON.stringify(initial)),
    [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false),
    [error, setError] = useState<unknown>(null),
    [device, setDevice] = useState("desktop"),
    [preview, setPreview] = useState(false),
    [notice, setNotice] = useState("");
  const serverVersion = useRef(version),
    lastServer = useRef(version),
    lock = useRef(false),
    attempt = useRef({ payload: "", key: "" }),
    current = useRef(state),
    active = useRef(true);
  const session = services.api?.session.get()?.sessionId,
    owner = snapshot.user?.id,
    scope = useRef({ session, owner });
  current.current = state;
  const encoded = JSON.stringify(state.doc),
    dirty = encoded !== saved;
  useEffect(() => {
    onPending?.(dirty || busy);
  }, [dirty, busy, onPending]);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (version !== lastServer.current) {
      lastServer.current = version;
      if (version === serverVersion.current) return;
      if (!dirty && !lock.current) {
        serverVersion.current = version;
        dispatch({ type: "reset", next: structuredClone(initial) });
        setSaved(JSON.stringify(initial));
      } else {
        setBlocked(true);
        setError(
          new ApiError(
            "A newer server draft is available. Download your draft and reopen the page before continuing.",
            409,
            "DRAFT_CHANGED",
          ),
        );
      }
    }
  }, [version, initial]);
  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const leaveLink = (e: MouseEvent) => {
      if (
        !dirty ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const link =
        e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      )
        return;
      const destination = new URL(link.href, location.href);
      if (
        destination.origin === location.origin &&
        destination.pathname === location.pathname &&
        destination.search === location.search
      )
        return;
      if (
        !window.confirm(
          t({
            en: "This draft has unsaved changes. Leave this page and discard those unsaved changes? Download a draft backup first if you need to keep them.",
            ar: "تحتوي المسودة على تغييرات غير محفوظة. هل تريد مغادرة الصفحة وفقدان هذه التغييرات؟ نزّل نسخة احتياطية أولاً إذا أردت الاحتفاظ بها.",
          }),
        )
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("click", leaveLink, true);
    return () => {
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("click", leaveLink, true);
    };
  }, [dirty, t]);
  async function save() {
    if (lock.current) return;
    const doc = canonicalDraft(current.current.doc),
      payload = JSON.stringify({
        version: serverVersion.current,
        document: doc,
      });
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (
        scope.current.owner !== owner ||
        scope.current.session !== services.api?.session.get()?.sessionId
      )
        throw new ApiError(
          "The account changed. Reopen the editor.",
          401,
          "SESSION_CHANGED",
        );
      assertDraft(doc);
      if (attempt.current.payload !== payload)
        attempt.current = { payload, key: createRecordId() };
      const result = await services.contentApi![C.autosave]({
        path: { pageId },
        body: { version: serverVersion.current, document: doc },
        idempotencyKey: attempt.current.key,
      });
      requireVersion(result?.pageVersion);
      if (!result?.revision?.id)
        throw new ApiError(
          "The saved draft response is incomplete.",
          502,
          "INVALID_RESPONSE",
        );
      if (
        !active.current ||
        scope.current.session !== services.api?.session.get()?.sessionId
      )
        return;
      serverVersion.current = result.pageVersion;
      setSaved(JSON.stringify(doc));
      setBlocked(false);
      attempt.current = { payload: "", key: "" };
      setNotice(
        t({
          en: "Draft saved. Publish separately when ready.",
          ar: "حُفظت المسودة. انشرها بشكل منفصل عندما تصبح جاهزة.",
        }),
      );
      await client.invalidateQueries({
        queryKey: ["native-content", "page", pageId],
      });
    } catch (e) {
      if (active.current) {
        setError(e);
        setBlocked(true);
      }
    } finally {
      lock.current = false;
      if (active.current) setBusy(false);
    }
  }
  useEffect(() => {
    if (!dirty || busy || blocked) return;
    const timer = window.setTimeout(() => void save(), 1200);
    return () => window.clearTimeout(timer);
  }, [encoded, busy, blocked, saved]);
  const change = (edit: (doc: Draft) => void) => {
    const doc = structuredClone(current.current.doc);
    edit(doc);
    dispatch({ type: "change", next: canonicalDraft(doc) });
    setNotice("");
  };
  const remove = (edit: (doc: Draft) => void) => {
    change(edit);
    setNotice(
      t({
        en: "Removed from the draft. Undo is available.",
        ar: "أُزيل من المسودة. يمكنك التراجع.",
      }),
    );
  };
  return (
    <section className="content-editor">
      <div className="content-editor-toolbar">
        <Button
          variant="outline"
          disabled={!state.past.length || busy}
          onClick={() => {
            dispatch({ type: "undo" });
            setNotice("");
          }}
        >
          {t({ en: "Undo", ar: "تراجع" })}
        </Button>
        <Button
          variant="outline"
          disabled={!state.future.length || busy}
          onClick={() => {
            dispatch({ type: "redo" });
            setNotice("");
          }}
        >
          {t({ en: "Redo", ar: "إعادة" })}
        </Button>
        <Button disabled={!dirty || busy} onClick={() => void save()}>
          {t({
            en: busy ? "Saving…" : blocked ? "Retry save" : "Save now",
            ar: busy
              ? "جارٍ الحفظ…"
              : blocked
                ? "إعادة محاولة الحفظ"
                : "حفظ الآن",
          })}
        </Button>
        <Button variant="outline" onClick={() => setPreview(!preview)}>
          {t({
            en: preview ? "Edit content" : "Preview",
            ar: preview ? "تحرير المحتوى" : "معاينة",
          })}
        </Button>
        <select
          aria-label={t({ en: "Preview size", ar: "حجم المعاينة" })}
          value={device}
          onChange={(e) => setDevice(e.target.value)}
        >
          {[
            ["desktop", "Desktop", "كمبيوتر"],
            ["tablet", "Tablet", "لوحي"],
            ["phone", "Phone", "هاتف"],
          ].map(([v, en, ar]) => (
            <option value={v} key={v}>
              {t({ en, ar })}
            </option>
          ))}
        </select>
        <span role="status" className="content-status">
          {t({
            en: blocked
              ? "Autosave paused; your draft is retained."
              : busy
                ? "Saving draft…"
                : dirty
                  ? "Unsaved changes"
                  : "All changes saved",
            ar: blocked
              ? "الحفظ التلقائي متوقف؛ احتُفظ بالمسودة."
              : busy
                ? "جارٍ حفظ المسودة…"
                : dirty
                  ? "تغييرات غير محفوظة"
                  : "حُفظت جميع التغييرات",
          })}
        </span>
      </div>
      <ApiActionError error={error} />
      {blocked && (
        <p>
          {t({
            en: "Resolve the error before retrying. To review newer server content, download your draft first and reopen the page.",
            ar: "عالج الخطأ قبل إعادة المحاولة. لمراجعة نسخة الخادم الأحدث، نزّل مسودتك ثم أعد فتح الصفحة.",
          })}
        </p>
      )}
      <Button
        variant="outline"
        onClick={() => {
          const blob = new Blob([JSON.stringify(state.doc, null, 2)], {
              type: "application/json",
            }),
            url = URL.createObjectURL(blob),
            a = document.createElement("a");
          a.href = url;
          a.download = "medclub-content-draft.json";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        {t({ en: "Download draft backup", ar: "تنزيل نسخة من المسودة" })}
      </Button>
      {notice && <p role="status">{notice}</p>}
      {examination && !state.doc.examination && (
        <Button
          variant="outline"
          onClick={() =>
            change((d) => {
              d.examination = {
                mainUrl: null,
                openInNewTab: true,
                linkStatus: "TemporarilyUnavailable",
                unavailableMessage: null,
              };
            })
          }
        >
          {t({ en: "Configure exam website", ar: "إعداد موقع الامتحانات" })}
        </Button>
      )}
      {state.doc.examination && (
        <fieldset disabled={busy}>
          <legend>
            {t({
              en: "Independent exam website",
              ar: "موقع الامتحانات المستقل",
            })}
          </legend>
          <label>
            {t({
              en: "Exam website URL (HTTPS)",
              ar: "رابط موقع الامتحانات (HTTPS)",
            })}
            <input
              type="url"
              value={state.doc.examination.mainUrl || ""}
              onChange={(e) =>
                change((d) => {
                  d.examination!.mainUrl = e.target.value || null;
                })
              }
            />
          </label>
          <label>
            {t({ en: "Link availability", ar: "حالة الرابط" })}
            <select
              value={state.doc.examination.linkStatus}
              onChange={(e) =>
                change((d) => {
                  d.examination!.linkStatus = e.target.value;
                })
              }
            >
              {["Active", "TemporarilyUnavailable"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            <span>
              <input
                type="checkbox"
                checked={state.doc.examination.openInNewTab}
                onChange={(e) =>
                  change((d) => {
                    d.examination!.openInNewTab = e.target.checked;
                  })
                }
              />
              {t({ en: "Open in a new tab", ar: "فتح في علامة تبويب جديدة" })}
            </span>
          </label>
          <label>
            {t({ en: "Unavailable message", ar: "رسالة عدم التوفر" })} ({locale}
            )
            <textarea
              value={state.doc.examination.unavailableMessage?.[locale] || ""}
              onChange={(e) =>
                change((d) => {
                  d.examination!.unavailableMessage = {
                    ...d.examination!.unavailableMessage,
                    [locale]: e.target.value,
                  };
                })
              }
            />
          </label>
        </fieldset>
      )}
      {preview ? (
        <div className={`content-preview-frame content-preview-${device}`}>
          <PublishedContent content={draftPreview(state.doc, locale)} />
        </div>
      ) : (
        <>
          <h2>{t({ en: "Page content", ar: "محتوى الصفحة" })}</h2>
          {(["title", "description"] as const).map((field) => (
            <label key={field}>
              {t({
                en: field === "title" ? "Page title" : "Description",
                ar: field === "title" ? "عنوان الصفحة" : "الوصف",
              })}{" "}
              ({locale})
              <textarea
                value={contentValue(state.doc[field], locale)}
                onChange={(e) =>
                  change((d) => {
                    d[field] = {
                      ...record(d[field]),
                      [locale]: e.target.value,
                    };
                  })
                }
              />
            </label>
          ))}
          {(state.doc.sections || []).map((section, i) => (
            <article
              className="content-editor-item"
              key={section.id}
              draggable
              onDragStart={(e) => {
                if (
                  (e.target as HTMLElement).closest("input,textarea,select")
                ) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.setData(
                  "application/medclub-section",
                  String(i),
                );
              }}
              onDragOver={(e) => {
                if (
                  e.dataTransfer.types.includes("application/medclub-section")
                )
                  e.preventDefault();
              }}
              onDrop={(e) => {
                const from = e.dataTransfer.getData(
                  "application/medclub-section",
                );
                if (from === "") return;
                e.preventDefault();
                change((d) => {
                  d.sections = moveItem(d.sections || [], Number(from), i);
                });
              }}
            >
              <div className="content-editor-toolbar">
                <strong>
                  {section.title?.[locale] ||
                    section.sectionKey ||
                    t({ en: "Section", ar: "قسم" })}
                </strong>
                {[-1, 1].map((delta) => (
                  <Button
                    key={delta}
                    variant="outline"
                    disabled={
                      i + delta < 0 ||
                      i + delta >= (state.doc.sections || []).length
                    }
                    onClick={() =>
                      change((d) => {
                        d.sections = moveItem(d.sections || [], i, i + delta);
                      })
                    }
                  >
                    {t(
                      delta < 0
                        ? { en: "Move up", ar: "تحريك للأعلى" }
                        : { en: "Move down", ar: "تحريك للأسفل" },
                    )}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    change((d) => {
                      const s = structuredClone(section);
                      s.id = createRecordId();
                      s.sectionKey = string(s.sectionKey) + "-copy";
                      s.blocks = s.blocks?.map(cloneBlock);
                      d.sections?.splice(i + 1, 0, s);
                    })
                  }
                >
                  {t({ en: "Duplicate section", ar: "نسخ القسم" })}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    remove((d) => {
                      d.sections?.splice(i, 1);
                    })
                  }
                >
                  {t({ en: "Remove section", ar: "إزالة القسم" })}
                </Button>
              </div>
              <label>
                {t({ en: "Section title", ar: "عنوان القسم" })} ({locale})
                <input
                  value={section.title?.[locale] || ""}
                  onChange={(e) =>
                    change((d) => {
                      d.sections![i].title = {
                        ...section.title,
                        [locale]: e.target.value,
                      };
                    })
                  }
                />
              </label>
              <label>
                {t({ en: "Section key", ar: "مفتاح القسم" })}
                <input
                  value={section.sectionKey || ""}
                  onChange={(e) =>
                    change((d) => {
                      d.sections![i].sectionKey = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={!!section.isPinned}
                    onChange={(e) =>
                      change((d) => {
                        d.sections![i].isPinned = e.target.checked;
                      })
                    }
                  />
                  {t({ en: "Pin section", ar: "تثبيت القسم" })}
                </span>
              </label>
              <BlocksEditor
                blocks={section.blocks || []}
                schemas={schemas}
                onChange={(blocks) =>
                  change((d) => {
                    d.sections![i].blocks = blocks;
                  })
                }
              />
            </article>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              change((d) => {
                const sections = d.sections || [];
                sections.push({
                  id: createRecordId(),
                  sectionKey: "section-" + (sections.length + 1),
                  sectionType: "Content",
                  title: { en: "New section", ar: "قسم جديد" },
                  position: sections.length,
                  isPinned: false,
                  pinnedFrom: null,
                  pinnedUntil: null,
                  status: "Active",
                  visibility: [],
                  blocks: [],
                });
                d.sections = sections;
              })
            }
          >
            {t({ en: "Add section", ar: "إضافة قسم" })}
          </Button>
        </>
      )}
    </section>
  );
}
function BlocksEditor({
  blocks,
  onChange,
  schemas,
  depth = 0,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  schemas: Schema[];
  depth?: number;
}) {
  const { t, locale } = useLocale(),
    [kind, setKind] = useState<Block["blockType"]>("Text");
  const available = blockTypes.filter((k) =>
    schemas.some((s) => s.blockType === k),
  ) as NonNullable<Block["blockType"]>[];
  const selectedKind = kind && available.includes(kind)
    ? kind
    : available[0];
  const update = (i: number, b: Block) => {
    const next = [...blocks];
    next[i] = b;
    onChange(next);
  };
  return (
    <div>
      {blocks.map((b, i) => {
        const schema = schemas.find((s) => s.blockType === b.blockType),
          c = record(b.configuration);
        const field = (name: string) =>
          Object.keys(c).find((k) => k.toLowerCase() === name.toLowerCase()) ||
          schema?.allowedFields.find(
            (k) => k.toLowerCase() === name.toLowerCase(),
          ) ||
          name;
        const supports = (name: string) =>
          !schema ||
          schema.additionalProperties ||
          schema.allowedFields.some(
            (k) => k.toLowerCase() === name.toLowerCase(),
          );
        const set = (name: string, value: unknown) =>
          update(i, { ...b, configuration: { ...c, [field(name)]: value } });
        const names =
          b.blockType === "Text"
            ? [supports("Content") ? "Content" : "Text"]
            : b.blockType === "Heading"
              ? ["Text"]
              : ["Button", "ExternalLink"].includes(b.blockType || "")
                ? ["Label", "Url"]
                : b.blockType === "Spacer"
                  ? ["Height"]
                  : b.blockType === "ReusableReference"
                    ? ["ReusableBlockId"]
                    : ["Image", "Video", "File", "TrustedEmbed"].includes(
                          b.blockType || "",
                        )
                      ? b.blockType === "TrustedEmbed"
                        ? ["SourceUrl"]
                        : ["AssetId", "Url", "AltText", "Caption"]
                      : [];
        return (
          <div
            key={b.id}
            className="content-editor-item"
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              if ((e.target as HTMLElement).closest("input,textarea,select")) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData(
                "application/medclub-block",
                JSON.stringify({
                  depth,
                  index: i,
                  ids: blocks.map((x) => x.id),
                }),
              );
            }}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("application/medclub-block"))
                e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                const from = JSON.parse(
                  e.dataTransfer.getData("application/medclub-block"),
                );
                if (
                  JSON.stringify(from.ids) ===
                  JSON.stringify(blocks.map((x) => x.id))
                )
                  onChange(moveItem(blocks, from.index, i));
              } catch {}
            }}
          >
            <div className="content-editor-toolbar">
              <strong>{b.blockType}</strong>
              {[-1, 1].map((delta) => (
                <Button
                  key={delta}
                  variant="outline"
                  disabled={i + delta < 0 || i + delta >= blocks.length}
                  onClick={() => onChange(moveItem(blocks, i, i + delta))}
                >
                  {t(
                    delta < 0
                      ? { en: "Up", ar: "أعلى" }
                      : { en: "Down", ar: "أسفل" },
                  )}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  onChange([
                    ...blocks.slice(0, i + 1),
                    cloneBlock(b),
                    ...blocks.slice(i + 1),
                  ])
                }
              >
                {t({ en: "Duplicate", ar: "نسخ" })}
              </Button>
              <Button
                variant="outline"
                onClick={() => onChange(blocks.filter((_, j) => j !== i))}
              >
                {t({ en: "Remove", ar: "إزالة" })}
              </Button>
            </div>
            {names.filter(supports).map((name) => {
              const v = c[field(name)],
                localized = [
                  "Content",
                  "Text",
                  "Label",
                  "Alt",
                  "AltText",
                  "Caption",
                ].includes(name);
              return (
                <label key={name}>
                  {t(
                    (
                      {
                        Content: {
                          en: "Rich text (**bold**, *italic*, - lists)",
                          ar: "نص منسق (فقرات)",
                        },
                        Label: { en: "Label", ar: "العنوان" },
                        AltText: { en: "Alternative text", ar: "النص البديل" },
                        SourceUrl: {
                          en: "Embed source URL",
                          ar: "رابط مصدر التضمين",
                        },
                        Text: {
                          en: "Text (supports **bold**, *italic* and lists)",
                          ar: "النص (يدعم التنسيق والقوائم)",
                        },
                        Url: { en: "Link", ar: "الرابط" },
                        AssetId: {
                          en: "Media asset reference",
                          ar: "معرّف ملف الوسائط",
                        },
                        Alt: { en: "Alternative text", ar: "النص البديل" },
                        Caption: { en: "Caption", ar: "الوصف" },
                        Height: {
                          en: "Space in pixels",
                          ar: "المسافة بالبكسل",
                        },
                        ReusableBlockId: {
                          en: "Reusable content reference",
                          ar: "معرّف المحتوى القابل لإعادة الاستخدام",
                        },
                      } as Record<string, { en: string; ar: string }>
                    )[name],
                  )}
                  {localized ? (
                    <textarea
                      value={richTextSource(v, locale)}
                      onChange={(e) =>
                        set(name, {
                          ...record(v),
                          [locale]:
                            name === "Content"
                              ? richTextParagraphs(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  ) : (
                    <input
                      type={name === "Height" ? "number" : "text"}
                      min={name === "Height" ? 0 : undefined}
                      max={name === "Height" ? 240 : undefined}
                      value={
                        typeof v === "number" || typeof v === "string" ? v : ""
                      }
                      onChange={(e) =>
                        set(
                          name,
                          name === "Height"
                            ? Number(e.target.value)
                            : e.target.value,
                        )
                      }
                    />
                  )}
                </label>
              );
            })}
            {b.blockType === "Group" &&
              (depth < 7 ? (
                <BlocksEditor
                  blocks={blockChildren(b)}
                  schemas={schemas}
                  depth={depth + 1}
                  onChange={(children) =>
                    set(childField(c, schema?.allowedFields), children)
                  }
                />
              ) : (
                <p>
                  {t({
                    en: "Maximum nesting reached.",
                    ar: "وصلت إلى أقصى مستوى تداخل.",
                  })}
                </p>
              ))}
            <details>
              <summary>
                {t({ en: "Advanced configuration", ar: "إعدادات متقدمة" })}
              </summary>
              <JsonConfig
                value={c}
                onApply={(v) => update(i, { ...b, configuration: v })}
              />
            </details>
          </div>
        );
      })}
      <div className="content-editor-toolbar">
        <select
          aria-label={t({ en: "New block type", ar: "نوع الكتلة الجديدة" })}
          value={selectedKind || ""}
          onChange={(e) => setKind(e.target.value as Block["blockType"])}
        >
          {available.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <Button
          variant="outline"
          disabled={!selectedKind}
          onClick={() =>
            selectedKind &&
            onChange([
              ...blocks,
              freshBlock(
                selectedKind,
                schemas.find((s) => s.blockType === selectedKind),
              ),
            ])
          }
        >
          {t({ en: "Add block", ar: "إضافة كتلة" })}
        </Button>
        {!available.length && (
          <p role="status">
            {t({
              en: "Block choices need the server's block schema. Reload the schema before adding blocks.",
              ar: "تحتاج خيارات الكتل إلى مخطط الخادم. أعد تحميل المخطط قبل إضافة الكتل.",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
function JsonConfig({
  value,
  onApply,
}: {
  value: Record<string, unknown>;
  onApply: (v: Record<string, unknown>) => void;
}) {
  const { t } = useLocale(),
    [raw, setRaw] = useState(JSON.stringify(value, null, 2)),
    [error, setError] = useState("");
  useEffect(() => {
    setRaw(JSON.stringify(value, null, 2));
    setError("");
  }, [value]);
  return (
    <>
      <textarea
        aria-label={t({
          en: "Advanced block configuration",
          ar: "إعدادات الكتلة المتقدمة",
        })}
        dir="ltr"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <Button
        variant="outline"
        onClick={() => {
          try {
            const v = JSON.parse(raw);
            if (!v || Array.isArray(v) || typeof v !== "object") throw Error();
            onApply(v);
            setError("");
          } catch {
            setError(
              t({
                en: "Enter a valid JSON object.",
                ar: "أدخل كائن JSON صالحاً.",
              }),
            );
          }
        }}
      >
        {t({ en: "Apply configuration", ar: "تطبيق الإعدادات" })}
      </Button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
