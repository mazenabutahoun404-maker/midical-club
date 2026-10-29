import type { MembershipApi } from "../../services/api/membership-api";
import {
  membershipRoutes,
  membershipSchemas,
} from "../../services/api/membership-contracts.generated";
import {
  membershipVersion,
  membershipUuid,
} from "../../services/api/membership-contracts";
import { ApiError } from "../../services/api/client";
import { record, string, array, safeUrl } from "../../services/api/mapping";
export type MembershipOperation = keyof MembershipApi;
export function membershipRequest(
  api: MembershipApi,
  id: MembershipOperation,
  input: unknown,
): Promise<unknown> {
  return (api[id] as (input: unknown) => Promise<unknown>)(input);
}
export function parsed(value: unknown) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    throw new ApiError(
      "The saved JSON is invalid. Review it before editing.",
      422,
      "INVALID_SAVED_JSON",
    );
  }
}
export function bodyDraft(id: MembershipOperation, row: unknown) {
  let schema = record(membershipRoutes[id].body);
  if (schema.$ref)
    schema = record(membershipSchemas[string(schema.$ref).split("/").pop()!]);
  const v = record(row);
  return Object.fromEntries(
    Object.keys(record(schema.properties))
      .filter((k) => Object.hasOwn(v, k))
      .map((k) => [k, v[k]]),
  );
}
export function mentorDraft(row: unknown) {
  const r = record(row);
  return {
    ...bodyDraft("put_api_v1_mentor_profile_by_id", r),
    areaIds: r.areas,
    presentation: parsed(r.presentationJson),
  };
}
export function openingDraft(row: unknown) {
  const r = record(row);
  return {
    ...bodyDraft("put_api_v1_admin_recruitment_openings_by_id", r),
    questions: array(r.questions).map((value) => {
      const q = record(value);
      return {
        textAr: q.textAr,
        textEn: q.textEn,
        type: q.questionType,
        required: q.isRequired,
        options: parsed(q.optionsJson),
        displayOrder: q.displayOrder,
        active: undefined,
      };
    }),
  };
}
export function taskAction(task: unknown) {
  const r = record(task);
  membershipVersion(r.version);
  return { version: r.version };
}
export function safeMeeting(value: unknown) {
  const url = safeUrl(value);
  if (!url) return null;
  const u = new URL(url);
  return u.protocol === "https:" && !u.username && !u.password ? url : null;
}
export function slotDraft(value: unknown, mentorId: string) {
  const row = record(value);
  membershipVersion(row.version);
  return {
    mentorProfileId: mentorId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    capacity: row.capacity,
    mode: row.mode,
    sessionType: row.sessionType,
    version: row.version,
  };
}
export type Question = Record<string, unknown>;
export function questionOptions(q: Question) {
  const value = q.optionsJson === undefined ? q.options : parsed(q.optionsJson);
  if (value == null) return [];
  if (!Array.isArray(value) || !value.every((x) => typeof x === "string"))
    throw new ApiError(
      "The saved question options are invalid.",
      502,
      "INVALID_QUESTION_OPTIONS",
    );
  return value as string[];
}
export function answersPayload(
  questions: Question[],
  values: Record<string, unknown>,
) {
  const out: { questionId: string; value: unknown }[] = [];
  for (const q of questions) {
    const id = string(q.id),
      value = values[id],
      required = q.required === true || q.isRequired === true;
    if (!membershipUuid.test(id))
      throw new ApiError(
        "The question has no valid identifier.",
        502,
        "INVALID_QUESTION",
      );
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && !value.length)
    ) {
      if (required)
        throw new ApiError(
          "Answer every required question.",
          422,
          "ANSWER_REQUIRED",
        );
      continue;
    }
    const options = questionOptions(q);
    if (
      options.length &&
      (Array.isArray(value)
        ? value.some((v) => !options.includes(String(v)))
        : !options.includes(String(value)))
    )
      throw new ApiError(
        "Choose an available question option.",
        422,
        "ANSWER_OPTION",
      );
    out.push({ questionId: id, value });
  }
  return out;
}
export function visibleCandidateHistory(value: unknown) {
  return array(value).map((v) => {
    const r = record(v);
    return {
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      reason: r.reason,
      occurredAt: r.occurredAt,
    };
  });
}
export function visibleCandidateInterviews(value: unknown) {
  return array(value).map((v) => {
    const r = record(v);
    return {
      id: r.id,
      scheduledAt: r.scheduledAt,
      durationMinutes: r.durationMinutes,
      mode: r.mode,
      status: r.status,
      meetingUrl: r.meetingUrl,
      locationInstructions: r.locationInstructions,
    };
  });
}
