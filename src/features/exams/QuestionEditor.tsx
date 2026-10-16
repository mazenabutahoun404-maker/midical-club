import { useState } from "react";
import type { ChoiceKey, ExamQuestion, ExamSet } from "../../types/exams";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useExams, useExamError } from "./useExams";
import {
  bilingual,
  choiceKeys,
  validateQuestion,
  safeExamImage,
} from "./exam-model";
import { Explanation } from "./Explanation";
export function QuestionEditor({
  exam,
  existing,
  close,
}: {
  exam: ExamSet;
  existing?: ExamQuestion;
  close: () => void;
}) {
  const { t } = useLocale(),
    { service, refresh } = useExams(),
    errorText = useExamError();
  const [stem, setStem] = useState(existing?.stem.en || ""),
    [arabic, setArabic] = useState(
      existing?.stem.ar === existing?.stem.en ? "" : existing?.stem.ar || "",
    ),
    [choices, setChoices] = useState(() =>
      Object.fromEntries(
        choiceKeys.map((key) => [
          key,
          existing?.choices.find((c) => c.key === key)?.text.en || "",
        ]),
      ),
    ),
    [wrong, setWrong] = useState(() =>
      Object.fromEntries(
        choiceKeys.map((key) => [
          key,
          existing?.choices.find((c) => c.key === key)?.explanation?.en || "",
        ]),
      ),
    );
  const [correct, setCorrect] = useState<ChoiceKey>(existing?.correct || "a"),
    [chapter, setChapter] = useState(existing?.chapter.en || "General"),
    [lecture, setLecture] = useState(existing?.lecture?.en || ""),
    [doctor, setDoctor] = useState(existing?.doctor || ""),
    [explanation, setExplanation] = useState(existing?.explanation?.en || ""),
    [images, setImages] = useState(existing?.explanationImages || {}),
    [questionImage, setQuestionImage] = useState(
      existing?.images?.[0]?.url || "",
    );
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const [arabicChoices, setArabicChoices] = useState(() =>
    Object.fromEntries(
      choiceKeys.map((key) => {
        const c = existing?.choices.find((c) => c.key === key);
        return [key, c?.text.ar !== c?.text.en ? c?.text.ar || "" : ""];
      }),
    ),
  );
  const [arabicExplanation, setArabicExplanation] = useState(
      existing?.explanation?.ar !== existing?.explanation?.en
        ? existing?.explanation?.ar || ""
        : "",
    ),
    [deleteConfirm, setDeleteConfirm] = useState(false);
  async function remove() {
    if (!existing) return;
    setPending(true);
    setError("");
    try {
      await service.admin.deleteQuestion(exam.id, existing.id, exam.version);
      await refresh();
      close();
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  async function upload(file: File, slot: 0 | 1 | 2 | 3) {
    setPending(true);
    setError("");
    try {
      const url = await service.admin.uploadImage(file);
      slot === 0
        ? setQuestionImage(url)
        : setImages((current) => ({ ...current, [slot]: url }));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPending(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const question: ExamQuestion = {
      ...existing,
      id: existing?.id || crypto.randomUUID(),
      courseId: exam.courseId,
      stem: { en: stem.trim(), ar: arabic.trim() || stem.trim() },
      choices: choiceKeys
        .filter((key) => choices[key]?.trim())
        .map((key) => ({
          key,
          text: {
            en: choices[key].trim(),
            ar: arabicChoices[key]?.trim() || choices[key].trim(),
          },
          ...(wrong[key]?.trim()
            ? { explanation: bilingual(wrong[key].trim()) }
            : {}),
        })),
      correct,
      chapter: bilingual(chapter.trim() || "General"),
      lecture: lecture.trim() ? bilingual(lecture.trim()) : undefined,
      doctor: doctor.trim() || undefined,
      explanation: explanation.trim()
        ? {
            en: explanation.trim(),
            ar: arabicExplanation.trim() || explanation.trim(),
          }
        : undefined,
      images: questionImage.trim()
        ? [
            {
              url: questionImage.trim(),
              alt: bilingual("Question illustration"),
            },
          ]
        : [],
      explanationImages: images,
      version: existing?.version || "new",
    };
    question.images = [
      ...(question.images || []),
      ...(existing?.images?.slice(1) || []),
    ];
    try {
      validateQuestion(question);
      if (
        [questionImage, ...Object.values(images)].some(
          (url) => url && !safeExamImage(url),
        )
      )
        throw new Error("image");
    } catch {
      setError(
        t({
          en: "Add the question, at least two choices, one valid correct answer and valid image URLs.",
          ar: "أضف السؤال وخيارين على الأقل وإجابة صحيحة وروابط صور صالحة.",
        }),
      );
      return;
    }
    setPending(true);
    try {
      await service.admin.saveQuestions(exam.id, [question], exam.version);
      await refresh();
      close();
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  return (
    <Modal
      open
      onClose={() => !pending && close()}
      title={t(
        existing
          ? { en: "Edit question", ar: "تعديل السؤال" }
          : { en: "Add a question", ar: "إضافة سؤال" },
      )}
      description={t(exam.title)}
      className="exam-question-editor"
      initialFocus="#exam-edit-stem"
    >
      <form className="exam-form" onSubmit={save}>
        <label>
          <span>{t({ en: "Question text", ar: "نص السؤال" })}</span>
          <textarea
            id="exam-edit-stem"
            value={stem}
            onChange={(e) => setStem(e.target.value)}
            rows={4}
            maxLength={10000}
            required
          />
        </label>
        <details>
          <summary>
            {t({
              en: "Arabic wording (optional)",
              ar: "صياغة عربية (اختياري)",
            })}
          </summary>
          <textarea
            value={arabic}
            onChange={(e) => setArabic(e.target.value)}
            rows={3}
            maxLength={10000}
            aria-label={t({
              en: "Arabic question text",
              ar: "نص السؤال بالعربية",
            })}
            dir="auto"
          />
        </details>
        <div className="exam-editor-choices">
          {choiceKeys.map((key) => (
            <label key={key}>
              <span>
                {t({ en: "Choice", ar: "الخيار" })} {key.toUpperCase()}
                {key === "e"
                  ? ` · ${t({ en: "Optional", ar: "اختياري" })}`
                  : ""}
              </span>
              <input
                value={choices[key]}
                maxLength={3000}
                onChange={(e) =>
                  setChoices((current) => ({
                    ...current,
                    [key]: e.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>
        <details>
          <summary>
            {t({
              en: "Arabic choices (optional)",
              ar: "خيارات بالعربية (اختياري)",
            })}
          </summary>
          {choiceKeys
            .filter((key) => choices[key]?.trim())
            .map((key) => (
              <label key={key}>
                <span>{key.toUpperCase()}</span>
                <input
                  value={arabicChoices[key]}
                  dir="auto"
                  maxLength={3000}
                  onChange={(e) =>
                    setArabicChoices((values) => ({
                      ...values,
                      [key]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
        </details>
        <div className="exam-form-pair">
          <label>
            <span>{t({ en: "Correct choice", ar: "الخيار الصحيح" })}</span>
            <select
              value={correct}
              onChange={(e) => setCorrect(e.target.value as ChoiceKey)}
            >
              {choiceKeys
                .filter((key) => choices[key]?.trim() || key === correct)
                .map((key) => (
                  <option key={key} value={key}>
                    {key.toUpperCase()}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>{t({ en: "Chapter", ar: "الفصل" })}</span>
            <input
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              maxLength={100}
            />
          </label>
          <label>
            <span>{t({ en: "Lecture", ar: "المحاضرة" })}</span>
            <input
              value={lecture}
              onChange={(e) => setLecture(e.target.value)}
              maxLength={100}
            />
          </label>
          <label>
            <span>{t({ en: "Doctor", ar: "المحاضر" })}</span>
            <input
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              maxLength={100}
            />
          </label>
        </div>
        <label>
          <span>{t({ en: "Explanation", ar: "الشرح" })}</span>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={6}
            maxLength={30000}
          />
        </label>
        <small>
          {t({
            en: "Formatting: **bold**, ==highlight==, !!callout!!, ~~green~~, ::blue::, [TABLE]…[/TABLE], [Image Slot 1].",
            ar: "تنسيق: **عريض**، ==تمييز==، !!تنبيه!!، ~~أخضر~~، ::أزرق::، [TABLE]…[/TABLE]، [Image Slot 1].",
          })}
        </small>
        <details>
          <summary>
            {t({
              en: "Arabic explanation (optional)",
              ar: "شرح بالعربية (اختياري)",
            })}
          </summary>
          <textarea
            value={arabicExplanation}
            onChange={(e) => setArabicExplanation(e.target.value)}
            rows={5}
            maxLength={30000}
            dir="auto"
          />
        </details>
        <details>
          <summary>
            {t({ en: "Preview the explanation", ar: "معاينة الشرح" })}
          </summary>
          <Explanation content={explanation} images={images} />
        </details>
        <details>
          <summary>
            {t({ en: "Explain incorrect choices", ar: "شرح الخيارات الخاطئة" })}
          </summary>
          {choiceKeys
            .filter((key) => key !== correct && choices[key]?.trim())
            .map((key) => (
              <label key={key}>
                <span>{key.toUpperCase()}</span>
                <textarea
                  rows={2}
                  value={wrong[key]}
                  maxLength={3000}
                  onChange={(e) =>
                    setWrong((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
        </details>
        <details>
          <summary>
            {t({
              en: "Question and explanation images",
              ar: "صور السؤال والشرح",
            })}
          </summary>
          <p className="exam-field-hint">
            {t({
              en: "Upload PNG, JPEG, WebP or GIF up to 512KiB, or use a secure image URL.",
              ar: "ارفع PNG أو JPEG أو WebP أو GIF حتى 512KiB أو استخدم رابط صورة آمناً.",
            })}
          </p>
          {([0, 1, 2, 3] as const).map((slot) => (
            <label key={slot}>
              <span>
                {t(
                  slot === 0
                    ? { en: "Question image", ar: "صورة السؤال" }
                    : {
                        en: `Explanation slot ${slot}`,
                        ar: `صورة الشرح ${slot}`,
                      },
                )}
              </span>
              <input
                aria-label={t({
                  en: `Image URL ${slot}`,
                  ar: `رابط الصورة ${slot}`,
                })}
                value={slot === 0 ? questionImage : images[slot] || ""}
                onChange={(e) =>
                  slot === 0
                    ? setQuestionImage(e.target.value)
                    : setImages((current) => ({
                        ...current,
                        [slot]: e.target.value,
                      }))
                }
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={pending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file, slot);
                  e.target.value = "";
                }}
              />
            </label>
          ))}
        </details>
        {error && (
          <p className="exam-error" role="alert">
            {error}
          </p>
        )}
        {deleteConfirm && (
          <div className="exam-delete-confirm" role="alert">
            <p>
              {t({
                en: "Delete this question from the set? Finished attempts keep their saved question snapshot.",
                ar: "حذف السؤال من المجموعة؟ تحتفظ المحاولات المكتملة بنسخة السؤال المحفوظة.",
              })}
            </p>
            <div className="exam-dialog-actions">
              <button
                type="button"
                className="button button-secondary"
                disabled={pending}
                onClick={() => setDeleteConfirm(false)}
              >
                {t({ en: "Keep question", ar: "الاحتفاظ بالسؤال" })}
              </button>
              <button
                type="button"
                className="button button-primary"
                disabled={pending}
                onClick={() => void remove()}
              >
                {t({ en: "Confirm deletion", ar: "تأكيد الحذف" })}
              </button>
            </div>
          </div>
        )}
        <footer>
          {existing && !deleteConfirm && (
            <button
              type="button"
              className="text-link"
              disabled={pending}
              onClick={() => setDeleteConfirm(true)}
            >
              {t({ en: "Delete question", ar: "حذف السؤال" })}
            </button>
          )}
          <button
            type="button"
            className="button button-secondary"
            disabled={pending}
            onClick={close}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={pending || deleteConfirm}
          >
            {t(
              pending
                ? { en: "Saving…", ar: "جارٍ الحفظ…" }
                : { en: "Save question", ar: "حفظ السؤال" },
            )}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
