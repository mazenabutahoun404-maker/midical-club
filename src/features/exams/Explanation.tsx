import { memo, useMemo, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  parseInline,
  parseMnSyntax,
  type MnInlineToken,
} from "./portable/mn-syntax";
import { safeExamImage } from "./exam-model";
function Inline({
  tokens,
  depth = 0,
}: {
  tokens: MnInlineToken[];
  depth?: number;
}) {
  return (
    <>
      {tokens.map((token, i) =>
        token.type === "bold" ? (
          <strong key={i}>
            {depth < 4 ? (
              <Inline tokens={parseInline(token.value)} depth={depth + 1} />
            ) : (
              token.value
            )}
          </strong>
        ) : token.type === "italic" ? (
          <em key={i}>{token.value}</em>
        ) : token.type === "underline" ? (
          <u key={i}>{token.value}</u>
        ) : (
          <span key={i} className={`mn-${token.type}`}>
            {token.value}
          </span>
        ),
      )}
    </>
  );
}
export const Explanation = memo(function Explanation({
  content,
  images = {},
}: {
  content: string;
  images?: Partial<Record<1 | 2 | 3, string>>;
}) {
  const tokens = useMemo(
    () => parseMnSyntax(content.slice(0, 30000)),
    [content],
  );
  const { t } = useLocale();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="exam-explanation" dir="auto">
      {tokens.map((token, i) => {
        if (token.type === "paragraph")
          return (
            <p key={i}>
              <Inline tokens={token.children} />
            </p>
          );
        if (token.type === "list")
          return (
            <ul key={i}>
              {token.items.map((row, j) => (
                <li key={j}>
                  <Inline tokens={row} />
                </li>
              ))}
            </ul>
          );
        if (token.type === "callout")
          return (
            <aside className="exam-callout" key={i}>
              <Inline tokens={token.children} />
            </aside>
          );
        if (token.type === "table")
          return (
            <div className="exam-table-scroll" key={i} tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    {token.headers.map((row, j) => (
                      <th key={j}>
                        <Inline tokens={row} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {token.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, n) => (
                        <td key={n}>
                          <Inline tokens={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        const source =
          images[token.slotNumber] && safeExamImage(images[token.slotNumber]!);
        return source ? (
          <button
            key={i}
            type="button"
            className="exam-image"
            onClick={() => setExpanded(source)}
            aria-label={t({
              en: "Expand explanation image",
              ar: "تكبير صورة الشرح",
            })}
          >
            <img
              src={source}
              alt={t({ en: "Explanation image", ar: "صورة توضيحية" })}
              loading="lazy"
              decoding="async"
            />
          </button>
        ) : null;
      })}
      {expanded && (
        <Modal
          open
          onClose={() => setExpanded(null)}
          title={t({ en: "Explanation image", ar: "صورة الشرح" })}
          description=""
          className="exam-image-dialog"
        >
          <img
            src={expanded}
            alt={t({ en: "Explanation image", ar: "صورة توضيحية" })}
          />
        </Modal>
      )}
    </div>
  );
});
