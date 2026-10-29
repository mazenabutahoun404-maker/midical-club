import { ApiError } from "../../services/api/client";
import { engagementInputSchemas } from "../../services/api/engagement-inputs.generated";
import { record, string } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
export const localizedField = (value: unknown, key: string, locale: string) => {
  const v = record(value);
  return string(
    v[key + (locale === "ar" ? "Ar" : "En")] ||
      v[key + "Ar"] ||
      v[key + "En"] ||
      v[key],
  );
};
export const engagementRows = (value: unknown) =>
  Array.isArray(value) ? value.map(record) : [];
export function parsedObject(value: unknown) {
  try {
    return record(typeof value === "string" ? JSON.parse(value) : value);
  } catch {
    return {};
  }
}
export function eventDraft(detail: unknown) {
  const v = record(detail),
    draft = parsedObject(v.draft),
    properties = record(
      record(engagementInputSchemas.EventDefinition).properties,
    );
  if (!Object.keys(draft).length)
    throw new ApiError(
      "The API did not return a complete editable draft. Load and review the full EventDefinition before saving.",
      422,
      "DRAFT_UNAVAILABLE",
    );
  for (const key of Object.keys(draft))
    if (!Object.hasOwn(properties, key))
      throw new ApiError(
        "This draft has an unrecognized structure. Review its complete EventDefinition instead of discarding fields.",
        422,
        "DRAFT_SHAPE_UNSUPPORTED",
      );
  for (const key of [
    "audiences",
    "registrationQuestions",
    "evaluationQuestions",
    "assets",
  ])
    if (!Array.isArray(draft[key]))
      throw new ApiError(
        "The complete draft lists were not returned. Do not overwrite them with empty lists.",
        422,
        "DRAFT_INCOMPLETE",
      );
  return structuredClone(draft);
}
export function opportunityDraft(value: unknown) {
  const v = record(value),
    props = record(
      record(engagementInputSchemas.OpportunityRequest).properties,
    ),
    out = Object.fromEntries(
      Object.entries(v).filter(([key]) => Object.hasOwn(props, key)),
    );
  if (!Array.isArray(v.audiences))
    throw new ApiError(
      "Review the complete saved audience before editing.",
      422,
      "DRAFT_INCOMPLETE",
    );
  try {
    const presentation =
      v.presentationJson == null
        ? null
        : typeof v.presentationJson === "string"
          ? JSON.parse(v.presentationJson)
          : v.presentationJson;
    if (
      presentation !== null &&
      (typeof presentation !== "object" || Array.isArray(presentation))
    )
      throw new Error();
    out.presentation = presentation;
  } catch {
    throw new ApiError(
      "The saved presentation is invalid. Review it before replacing the complete opportunity draft.",
      422,
      "DRAFT_INCOMPLETE",
    );
  }
  return out;
}
export function questionKind(value: unknown) {
  return string(value).replace(/[ _-]/g, "").toLowerCase();
}
export function questionOptions(question: Record<string, unknown>) {
  if (question.optionsJson == null || question.optionsJson === "") return [];
  let options: unknown;
  try {
    options = JSON.parse(string(question.optionsJson));
  } catch {
    throw new ApiError(
      "Question options are invalid. Reload this form.",
      502,
      "INVALID_QUESTION",
    );
  }
  if (!Array.isArray(options) || options.some((x) => typeof x !== "string"))
    throw new ApiError(
      "Question options have an unsupported shape. Reload this form.",
      502,
      "INVALID_QUESTION",
    );
  return options as string[];
}
export function dynamicAnswers(
  questions: Record<string, unknown>[],
  draft: Record<string, unknown>,
): Schemas["DynamicAnswer"][] {
  const known = new Set(questions.map((q) => string(q.id)));
  for (const key of Object.keys(draft))
    if (!known.has(key))
      throw new ApiError(
        "The question list changed. Reopen the form.",
        409,
        "QUESTION_CHANGED",
      );
  return questions.flatMap((q) => {
    const key = string(q.id),
      value = draft[key],
      empty =
        value == null ||
        value === "" ||
        (Array.isArray(value) && !value.length);
    if (empty) {
      if (q.isRequired)
        throw new ApiError(
          "Answer the required questions.",
          422,
          "ANSWER_REQUIRED",
        );
      return [];
    }
    const kind = questionKind(q.questionType),
      options = questionOptions(q);
    if (
      ["number", "rating", "integer", "scale"].includes(kind) &&
      (typeof value !== "number" || !Number.isFinite(value))
    )
      throw new ApiError(
        "Enter a valid numeric answer.",
        422,
        "ANSWER_INVALID",
      );
    if (options.length) {
      const selections = Array.isArray(value) ? value : [value];
      if (selections.some((x) => !options.includes(String(x))))
        throw new ApiError(
          "Choose an available answer.",
          422,
          "ANSWER_INVALID",
        );
    }
    return [{ questionId: key, value }];
  });
}
/** Waiting-list entries and seat offers are not confirmed attendance passes. */
export function canShowAttendancePass(value: unknown) {
  const v = record(value),
    status = string(v.status).toLowerCase();
  return (
    !!v.id &&
    ![
      "cancelled",
      "canceled",
      "expired",
      "rejected",
      "waitlisted",
      "waiting",
      "offered",
      "promotionoffered",
      "pendingconfirmation",
    ].includes(status) &&
    (v.confirmedAt != null ||
      ["confirmed", "registered", "attended"].includes(status))
  );
}
