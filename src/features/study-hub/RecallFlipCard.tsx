import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Rotate3D, Check } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import "./recall-cards.css";
export interface RecallQueuePreview {
  id: string;
  prompt: string;
  course?: string;
}
type Face = { key: string; prompt: string; answer: string; flipped: boolean };
/** Upcoming sheets contain actual next questions; only the active card can reveal an answer. */
export function RecallFlipCard({
  prompt,
  answer,
  course,
  flipped,
  onFlip,
  disabled = false,
  image,
  cardId = prompt,
  nextCards = [],
  index = 1,
  total,
}: {
  prompt: string;
  answer: string;
  course?: string;
  flipped: boolean;
  onFlip: () => void;
  disabled?: boolean;
  image?: { url: string; alt: string };
  cardId?: string;
  nextCards?: RecallQueuePreview[];
  index?: number;
  total?: number;
}) {
  const { t } = useLocale();
  const last = useRef<Face>({ key: cardId, prompt, answer, flipped });
  const [departing, setDeparting] = useState<Face | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useLayoutEffect(() => {
    if (last.current.key !== cardId) {
      clearTimeout(timer.current);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDeparting(last.current);
        timer.current = setTimeout(() => {
          setDeparting(null);
          if (document.activeElement === document.body)
            document
              .querySelector<HTMLButtonElement>(".recall-flip-card")
              ?.focus({ preventScroll: true });
        }, 380);
      } else setDeparting(null);
    }
    last.current = { key: cardId, prompt, answer, flipped };
  }, [cardId, prompt, answer, flipped]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (media.matches) {
        clearTimeout(timer.current);
        setDeparting(null);
      }
    };
    media.addEventListener("change", stop);
    return () => {
      clearTimeout(timer.current);
      media.removeEventListener("change", stop);
    };
  }, []);
  return (
    <div
      className="recall-card-scene"
      data-advancing={!!departing || undefined}
      data-remaining={nextCards.length}
    >
      <div className="recall-queue" aria-hidden="true">
        {nextCards
          .slice(0, 3)
          .map((card, i) => (
            <div
              key={card.id}
              className="recall-next-card"
              data-next-card-id={card.id}
              style={{ "--depth": i + 1 } as CSSProperties}
            >
              <span className="recall-sheet-number">
                {String(index + i + 1).padStart(2, "0")}
              </span>
              <span className="recall-next-course">
                {card.course || course}
              </span>
              <span className="recall-next-title" dir="auto">
                {card.prompt}
              </span>
            </div>
          ))
          .reverse()}
      </div>
      <button
        type="button"
        className="recall-flip-card"
        data-card-id={cardId}
        data-flipped={flipped}
        aria-pressed={flipped}
        disabled={disabled}
        onClick={onFlip}
        aria-label={
          (flipped
            ? t({ en: "Answer", ar: "الإجابة" }) + ": " + answer
            : prompt) +
          ". " +
          t(
            flipped
              ? { en: "Tap to return to question", ar: "اضغط للعودة للسؤال" }
              : {
                  en: "Think of the answer, then tap to reveal",
                  ar: "أجب في ذهنك ثم اضغط للكشف",
                },
          )
        }
      >
        <span className="recall-card-rotator">
          <span
            className="recall-card-face recall-card-front"
            aria-hidden={flipped}
          >
            <span className="recall-card-overline">
              <span className="recall-card-kind">
                {t({ en: "Question", ar: "السؤال" })}
              </span>
              <span className="recall-sheet-number">
                {String(index).padStart(2, "0")}
                {total ? (
                  <small> / {String(total).padStart(2, "0")}</small>
                ) : null}
              </span>
            </span>
            <span className="recall-card-course">{course}</span>
            <strong className="recall-card-text" dir="auto">
              {prompt}
            </strong>
            {image && (
              <img
                className="recall-prompt-image"
                src={image.url}
                alt={image.alt}
              />
            )}
            <span className="recall-card-instruction">
              <Rotate3D size={16} />
              {t({
                en: "Think first. Tap to turn.",
                ar: "فكّر أولاً. اضغط للقلب.",
              })}
            </span>
          </span>
          <span
            className="recall-card-face recall-card-back"
            aria-hidden={!flipped}
          >
            <span className="recall-card-overline">
              <span className="recall-card-kind">
                <Check size={16} />
                {t({ en: "Answer", ar: "الإجابة" })}
              </span>
              <span className="recall-sheet-number">
                {String(index).padStart(2, "0")}
              </span>
            </span>
            <span className="recall-card-course">{course}</span>
            <span className="recall-card-text" dir="auto">
              {flipped ? answer : ""}
            </span>
            <span className="recall-card-instruction">
              <Rotate3D size={16} />
              {t({
                en: "Tap to see the question again",
                ar: "اضغط لرؤية السؤال مجدداً",
              })}
            </span>
          </span>
        </span>
      </button>
      {departing && (
        <div className="recall-departing-card" aria-hidden="true">
          <span className="recall-card-kind">
            <Check size={17} />
            {t({ en: "Reviewed", ar: "تمت المراجعة" })}
          </span>
          <span className="recall-card-text" dir="auto">
            {departing.flipped ? departing.answer : departing.prompt}
          </span>
        </div>
      )}
      <span className="sr-only" role="status">
        {flipped
          ? t({
              en: "Answer revealed. Rate your recall below.",
              ar: "ظهرت الإجابة. قيّم استرجاعك أدناه.",
            })
          : ""}
      </span>
    </div>
  );
}
