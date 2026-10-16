import type { ExamQuestion } from "../../types/exams";
import type { Text } from "../../types/content";
const pair = (en: string, ar: string): Text => ({ en, ar });
/** Deliberately nonclinical interface fixtures; real academic content comes from the future adapter. */
export function previewQuestions(courseId: string): ExamQuestion[] {
  const examples = [
    {
      stem: pair(
        "Which action keeps a question ready for another visit?",
        "أي إجراء يحتفظ بالسؤال للعودة إليه لاحقاً؟",
      ),
      choices: [
        pair("Bookmark the question", "حفظ السؤال"),
        pair("Finish the session", "إنهاء الجلسة"),
        pair("Close the tab", "إغلاق الصفحة"),
        pair("Clear the answer", "مسح الإجابة"),
      ],
      correct: "a",
      explanation: pair(
        "**Bookmark** saves a question to your exam notebook. A **flag** marks it for another look in the current attempt.\n\n!!This is an interface example, not academic examination content.!!",
        "**الحفظ** يضيف السؤال إلى دفتر امتحاناتك. **العلامة** تشير إلى سؤال تريد العودة إليه في المحاولة الحالية.\n\n!!هذا مثال للواجهة وليس محتوى امتحان أكاديمياً.!!",
      ),
      chapter: pair("Getting started", "البداية"),
    },
    {
      stem: pair(
        "Where can you see why a practice answer is correct?",
        "أين يمكنك معرفة سبب صحة إجابة التدريب؟",
      ),
      choices: [
        pair("In the timer", "في المؤقت"),
        pair("In the explanation", "في الشرح"),
        pair("In the language menu", "في قائمة اللغة"),
        pair("In the navigation controls", "في أدوات التنقل"),
      ],
      correct: "b",
      explanation: pair(
        "The explanation area keeps the reasoning with the question. Rich text, tables and image slots are supported.\n\n- Read the explanation.\n- Revisit the questions you missed.",
        "توضح منطقة الشرح سبب الإجابة. تدعم النص المنسق والجداول والصور.\n\n- اقرأ الشرح.\n- عد إلى الأسئلة التي أخطأت فيها.",
      ),
      chapter: pair("Reviewing", "المراجعة"),
    },
    {
      stem: pair(
        "Which action lets you continue this session later?",
        "أي إجراء يتيح متابعة هذه الجلسة لاحقاً؟",
      ),
      choices: [
        pair("Start another session", "بدء جلسة أخرى"),
        pair("Clear all bookmarks", "مسح المحفوظات"),
        pair("Save and exit", "الحفظ والخروج"),
        pair("Change the theme", "تغيير المظهر"),
      ],
      correct: "c",
      explanation: pair(
        "Use **Save and exit**. Your saved position, answers and flags belong to this attempt. The preview stores them on this device.",
        "استخدم **الحفظ والخروج**. تبقى الصفحة والإجابات والعلامات مرتبطة بالمحاولة. تحفظ المعاينة البيانات على هذا الجهاز.",
      ),
      chapter: pair("Getting started", "البداية"),
    },
    {
      stem: pair(
        "Which review filter focuses on unanswered questions?",
        "أي مرشح للمراجعة يركز على الأسئلة التي لم تُجب عنها؟",
      ),
      choices: [
        pair("Correct", "الصحيحة"),
        pair("Bookmarked", "المحفوظة"),
        pair("Incorrect", "الخاطئة"),
        pair("Skipped", "المتروكة"),
      ],
      correct: "d",
      explanation: pair(
        "The **Skipped** filter finds unanswered questions. You can review all questions or just the answers you want to revisit.\n\n[TABLE]\n| State | Meaning |\n| Correct | Answer matches the key |\n| Skipped | No answer chosen |\n[/TABLE]",
        "مرشح **المتروكة** يعرض الأسئلة دون إجابة. يمكنك مراجعة كل الأسئلة أو التركيز على فئة محددة.\n\n[TABLE]\n| الحالة | المعنى |\n| صحيحة | الإجابة توافق المفتاح |\n| متروكة | لم تُحدد إجابة |\n[/TABLE]",
      ),
      chapter: pair("Reviewing", "المراجعة"),
    },
  ];
  return examples.map((q, i) => ({
    id: `preview-${courseId}-q${i + 1}`,
    courseId,
    stem: q.stem,
    choices: q.choices.map((text, index) => ({
      key: ["a", "b", "c", "d"][index] as "a" | "b" | "c" | "d",
      text,
    })),
    correct: q.correct as "a" | "b" | "c" | "d",
    explanation: q.explanation,
    chapter: q.chapter,
    lecture: pair("Interface tour", "جولة في الواجهة"),
    version: "preview-1",
  }));
}
