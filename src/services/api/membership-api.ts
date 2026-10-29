import { type ApiClient, type ApiInput } from "./client";
import { engagementCommand } from "./engagement-contracts";
import {
  prepareMembershipInput,
  validateMembershipResponse,
} from "./membership-contracts";
import { assertOwner } from "./mapping";
export function createHttpMembershipApi(api: ApiClient) {
  const command = engagementCommand(api);
  return {
    get_api_v1_mentorship_areas: async (
      input: ApiInput<"get_api_v1_mentorship_areas">,
    ) => {
      prepareMembershipInput("get_api_v1_mentorship_areas", input);
      return validateMembershipResponse(
        "get_api_v1_mentorship_areas",
        await api.call("get_api_v1_mentorship_areas", input),
      );
    },
    get_api_v1_admin_mentorship_areas: async (
      input: ApiInput<"get_api_v1_admin_mentorship_areas">,
    ) => {
      prepareMembershipInput("get_api_v1_admin_mentorship_areas", input);
      return validateMembershipResponse(
        "get_api_v1_admin_mentorship_areas",
        await api.call("get_api_v1_admin_mentorship_areas", input),
      );
    },
    post_api_v1_admin_mentorship_areas: async (
      input: ApiInput<"post_api_v1_admin_mentorship_areas">,
    ) => {
      prepareMembershipInput("post_api_v1_admin_mentorship_areas", input);
      return command("post_api_v1_admin_mentorship_areas", input, async (key) =>
        validateMembershipResponse(
          "post_api_v1_admin_mentorship_areas",
          await api.call("post_api_v1_admin_mentorship_areas", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_admin_mentorship_areas_by_id: async (
      input: ApiInput<"put_api_v1_admin_mentorship_areas_by_id">,
    ) => {
      prepareMembershipInput("put_api_v1_admin_mentorship_areas_by_id", input);
      return command(
        "put_api_v1_admin_mentorship_areas_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_admin_mentorship_areas_by_id",
            await api.call("put_api_v1_admin_mentorship_areas_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_mentors: async (input: ApiInput<"get_api_v1_mentors">) => {
      prepareMembershipInput("get_api_v1_mentors", input);
      return validateMembershipResponse(
        "get_api_v1_mentors",
        await api.call("get_api_v1_mentors", input),
      );
    },
    get_api_v1_mentors_by_id: async (
      input: ApiInput<"get_api_v1_mentors_by_id">,
    ) => {
      prepareMembershipInput("get_api_v1_mentors_by_id", input);
      return validateMembershipResponse(
        "get_api_v1_mentors_by_id",
        await api.call("get_api_v1_mentors_by_id", input),
      );
    },
    post_api_v1_mentor_profile: async (
      input: ApiInput<"post_api_v1_mentor_profile">,
    ) => {
      prepareMembershipInput("post_api_v1_mentor_profile", input);
      return command("post_api_v1_mentor_profile", input, async (key) =>
        validateMembershipResponse(
          "post_api_v1_mentor_profile",
          await api.call("post_api_v1_mentor_profile", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_mentor_profile_by_id: async (
      input: ApiInput<"put_api_v1_mentor_profile_by_id">,
    ) => {
      prepareMembershipInput("put_api_v1_mentor_profile_by_id", input);
      return command("put_api_v1_mentor_profile_by_id", input, async (key) =>
        validateMembershipResponse(
          "put_api_v1_mentor_profile_by_id",
          await api.call("put_api_v1_mentor_profile_by_id", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    get_api_v1_admin_mentors: async (
      input: ApiInput<"get_api_v1_admin_mentors">,
    ) => {
      prepareMembershipInput("get_api_v1_admin_mentors", input);
      return validateMembershipResponse(
        "get_api_v1_admin_mentors",
        await api.call("get_api_v1_admin_mentors", input),
      );
    },
    post_api_v1_admin_mentors: async (
      input: ApiInput<"post_api_v1_admin_mentors">,
    ) => {
      prepareMembershipInput("post_api_v1_admin_mentors", input);
      return command("post_api_v1_admin_mentors", input, async (key) =>
        validateMembershipResponse(
          "post_api_v1_admin_mentors",
          await api.call("post_api_v1_admin_mentors", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    get_api_v1_admin_mentors_by_id: async (
      input: ApiInput<"get_api_v1_admin_mentors_by_id">,
    ) => {
      prepareMembershipInput("get_api_v1_admin_mentors_by_id", input);
      return validateMembershipResponse(
        "get_api_v1_admin_mentors_by_id",
        await api.call("get_api_v1_admin_mentors_by_id", input),
      );
    },
    put_api_v1_admin_mentors_by_id: async (
      input: ApiInput<"put_api_v1_admin_mentors_by_id">,
    ) => {
      prepareMembershipInput("put_api_v1_admin_mentors_by_id", input);
      return command("put_api_v1_admin_mentors_by_id", input, async (key) =>
        validateMembershipResponse(
          "put_api_v1_admin_mentors_by_id",
          await api.call("put_api_v1_admin_mentors_by_id", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    post_api_v1_admin_mentors_by_id_approve: async (
      input: ApiInput<"post_api_v1_admin_mentors_by_id_approve">,
    ) => {
      prepareMembershipInput("post_api_v1_admin_mentors_by_id_approve", input);
      return command(
        "post_api_v1_admin_mentors_by_id_approve",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_mentors_by_id_approve",
            await api.call("post_api_v1_admin_mentors_by_id_approve", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_mentors_by_id_pause: async (
      input: ApiInput<"post_api_v1_admin_mentors_by_id_pause">,
    ) => {
      prepareMembershipInput("post_api_v1_admin_mentors_by_id_pause", input);
      return command(
        "post_api_v1_admin_mentors_by_id_pause",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_mentors_by_id_pause",
            await api.call("post_api_v1_admin_mentors_by_id_pause", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_mentors_by_id_archive: async (
      input: ApiInput<"post_api_v1_admin_mentors_by_id_archive">,
    ) => {
      prepareMembershipInput("post_api_v1_admin_mentors_by_id_archive", input);
      return command(
        "post_api_v1_admin_mentors_by_id_archive",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_mentors_by_id_archive",
            await api.call("post_api_v1_admin_mentors_by_id_archive", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_mentors_by_id_availability: async (
      input: ApiInput<"get_api_v1_mentors_by_id_availability">,
    ) => {
      prepareMembershipInput("get_api_v1_mentors_by_id_availability", input);
      return validateMembershipResponse(
        "get_api_v1_mentors_by_id_availability",
        await api.call("get_api_v1_mentors_by_id_availability", input),
      );
    },
    post_api_v1_mentor_by_id_questions: async (
      input: ApiInput<"post_api_v1_mentor_by_id_questions">,
    ) => {
      prepareMembershipInput("post_api_v1_mentor_by_id_questions", input);
      return command("post_api_v1_mentor_by_id_questions", input, async (key) =>
        validateMembershipResponse(
          "post_api_v1_mentor_by_id_questions",
          await api.call("post_api_v1_mentor_by_id_questions", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_mentor_by_id_questions_by_questionId: async (
      input: ApiInput<"put_api_v1_mentor_by_id_questions_by_questionId">,
    ) => {
      prepareMembershipInput(
        "put_api_v1_mentor_by_id_questions_by_questionId",
        input,
      );
      return command(
        "put_api_v1_mentor_by_id_questions_by_questionId",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_mentor_by_id_questions_by_questionId",
            await api.call("put_api_v1_mentor_by_id_questions_by_questionId", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_mentorship_questions: async (
      input: ApiInput<"post_api_v1_admin_mentorship_questions">,
    ) => {
      prepareMembershipInput("post_api_v1_admin_mentorship_questions", input);
      return command(
        "post_api_v1_admin_mentorship_questions",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_mentorship_questions",
            await api.call("post_api_v1_admin_mentorship_questions", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_mentorship_public_qa: async (
      input: ApiInput<"get_api_v1_mentorship_public_qa">,
    ) => {
      prepareMembershipInput("get_api_v1_mentorship_public_qa", input);
      return validateMembershipResponse(
        "get_api_v1_mentorship_public_qa",
        await api.call("get_api_v1_mentorship_public_qa", input),
      );
    },
    get_api_v1_admin_mentorship_public_qa: async (
      input: ApiInput<"get_api_v1_admin_mentorship_public_qa">,
    ) => {
      prepareMembershipInput("get_api_v1_admin_mentorship_public_qa", input);
      return validateMembershipResponse(
        "get_api_v1_admin_mentorship_public_qa",
        await api.call("get_api_v1_admin_mentorship_public_qa", input),
      );
    },
    post_api_v1_admin_mentorship_public_qa: async (
      input: ApiInput<"post_api_v1_admin_mentorship_public_qa">,
    ) => {
      prepareMembershipInput("post_api_v1_admin_mentorship_public_qa", input);
      return command(
        "post_api_v1_admin_mentorship_public_qa",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_mentorship_public_qa",
            await api.call("post_api_v1_admin_mentorship_public_qa", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    put_api_v1_admin_mentorship_public_qa_by_id: async (
      input: ApiInput<"put_api_v1_admin_mentorship_public_qa_by_id">,
    ) => {
      prepareMembershipInput(
        "put_api_v1_admin_mentorship_public_qa_by_id",
        input,
      );
      return command(
        "put_api_v1_admin_mentorship_public_qa_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_admin_mentorship_public_qa_by_id",
            await api.call("put_api_v1_admin_mentorship_public_qa_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_mentorship_public_qa_by_id_publish: async (
      input: ApiInput<"post_api_v1_admin_mentorship_public_qa_by_id_publish">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_mentorship_public_qa_by_id_publish",
        input,
      );
      return command(
        "post_api_v1_admin_mentorship_public_qa_by_id_publish",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_mentorship_public_qa_by_id_publish",
            await api.call(
              "post_api_v1_admin_mentorship_public_qa_by_id_publish",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_mentorship_public_qa_by_id_archive: async (
      input: ApiInput<"post_api_v1_admin_mentorship_public_qa_by_id_archive">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_mentorship_public_qa_by_id_archive",
        input,
      );
      return command(
        "post_api_v1_admin_mentorship_public_qa_by_id_archive",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_mentorship_public_qa_by_id_archive",
            await api.call(
              "post_api_v1_admin_mentorship_public_qa_by_id_archive",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_mentor_availability: async (
      input: ApiInput<"post_api_v1_mentor_availability">,
    ) => {
      prepareMembershipInput("post_api_v1_mentor_availability", input);
      return command("post_api_v1_mentor_availability", input, async (key) =>
        validateMembershipResponse(
          "post_api_v1_mentor_availability",
          await api.call("post_api_v1_mentor_availability", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_mentor_availability_by_id: async (
      input: ApiInput<"put_api_v1_mentor_availability_by_id">,
    ) => {
      prepareMembershipInput("put_api_v1_mentor_availability_by_id", input);
      return command(
        "put_api_v1_mentor_availability_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_mentor_availability_by_id",
            await api.call("put_api_v1_mentor_availability_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_mentorship_requests: async (
      input: ApiInput<"post_api_v1_mentorship_requests">,
    ) => {
      prepareMembershipInput("post_api_v1_mentorship_requests", input);
      return command("post_api_v1_mentorship_requests", input, async (key) =>
        validateMembershipResponse(
          "post_api_v1_mentorship_requests",
          await api.call("post_api_v1_mentorship_requests", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    get_api_v1_mentorship_requests_my: async (
      input: ApiInput<"get_api_v1_mentorship_requests_my">,
    ) => {
      prepareMembershipInput("get_api_v1_mentorship_requests_my", input);
      return validateMembershipResponse(
        "get_api_v1_mentorship_requests_my",
        await api.call("get_api_v1_mentorship_requests_my", input),
      );
    },
    get_api_v1_mentorship_sessions_my: async (
      input: ApiInput<"get_api_v1_mentorship_sessions_my">,
    ) => {
      prepareMembershipInput("get_api_v1_mentorship_sessions_my", input);
      return validateMembershipResponse(
        "get_api_v1_mentorship_sessions_my",
        await api.call("get_api_v1_mentorship_sessions_my", input),
      );
    },
    get_api_v1_mentorship_group_sessions: async (
      input: ApiInput<"get_api_v1_mentorship_group_sessions">,
    ) => {
      prepareMembershipInput("get_api_v1_mentorship_group_sessions", input);
      return validateMembershipResponse(
        "get_api_v1_mentorship_group_sessions",
        await api.call("get_api_v1_mentorship_group_sessions", input),
      );
    },
    get_api_v1_mentorship_group_sessions_my: async (
      input: ApiInput<"get_api_v1_mentorship_group_sessions_my">,
    ) => {
      prepareMembershipInput("get_api_v1_mentorship_group_sessions_my", input);
      return validateMembershipResponse(
        "get_api_v1_mentorship_group_sessions_my",
        await api.call("get_api_v1_mentorship_group_sessions_my", input),
      );
    },
    post_api_v1_mentorship_group_sessions_by_slotId_register: async (
      input: ApiInput<"post_api_v1_mentorship_group_sessions_by_slotId_register">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_mentorship_group_sessions_by_slotId_register",
        input,
      );
      return command(
        "post_api_v1_mentorship_group_sessions_by_slotId_register",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentorship_group_sessions_by_slotId_register",
            await api.call(
              "post_api_v1_mentorship_group_sessions_by_slotId_register",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_mentorship_group_sessions_by_slotId_cancel: async (
      input: ApiInput<"post_api_v1_mentorship_group_sessions_by_slotId_cancel">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_mentorship_group_sessions_by_slotId_cancel",
        input,
      );
      return command(
        "post_api_v1_mentorship_group_sessions_by_slotId_cancel",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentorship_group_sessions_by_slotId_cancel",
            await api.call(
              "post_api_v1_mentorship_group_sessions_by_slotId_cancel",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_mentor_requests: async (
      input: ApiInput<"get_api_v1_mentor_requests">,
    ) => {
      prepareMembershipInput("get_api_v1_mentor_requests", input);
      return validateMembershipResponse(
        "get_api_v1_mentor_requests",
        await api.call("get_api_v1_mentor_requests", input),
      );
    },
    get_api_v1_mentor_sessions: async (
      input: ApiInput<"get_api_v1_mentor_sessions">,
    ) => {
      prepareMembershipInput("get_api_v1_mentor_sessions", input);
      return validateMembershipResponse(
        "get_api_v1_mentor_sessions",
        await api.call("get_api_v1_mentor_sessions", input),
      );
    },
    post_api_v1_mentor_requests_by_id_accept: async (
      input: ApiInput<"post_api_v1_mentor_requests_by_id_accept">,
    ) => {
      prepareMembershipInput("post_api_v1_mentor_requests_by_id_accept", input);
      return command(
        "post_api_v1_mentor_requests_by_id_accept",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentor_requests_by_id_accept",
            await api.call("post_api_v1_mentor_requests_by_id_accept", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_mentor_requests_by_id_reject: async (
      input: ApiInput<"post_api_v1_mentor_requests_by_id_reject">,
    ) => {
      prepareMembershipInput("post_api_v1_mentor_requests_by_id_reject", input);
      return command(
        "post_api_v1_mentor_requests_by_id_reject",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentor_requests_by_id_reject",
            await api.call("post_api_v1_mentor_requests_by_id_reject", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_mentorship_requests_by_id_withdraw: async (
      input: ApiInput<"post_api_v1_mentorship_requests_by_id_withdraw">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_mentorship_requests_by_id_withdraw",
        input,
      );
      return command(
        "post_api_v1_mentorship_requests_by_id_withdraw",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentorship_requests_by_id_withdraw",
            await api.call("post_api_v1_mentorship_requests_by_id_withdraw", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_mentorship_sessions_by_id_cancel: async (
      input: ApiInput<"post_api_v1_mentorship_sessions_by_id_cancel">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_mentorship_sessions_by_id_cancel",
        input,
      );
      return command(
        "post_api_v1_mentorship_sessions_by_id_cancel",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentorship_sessions_by_id_cancel",
            await api.call("post_api_v1_mentorship_sessions_by_id_cancel", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_mentor_sessions_by_id_complete: async (
      input: ApiInput<"post_api_v1_mentor_sessions_by_id_complete">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_mentor_sessions_by_id_complete",
        input,
      );
      return command(
        "post_api_v1_mentor_sessions_by_id_complete",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentor_sessions_by_id_complete",
            await api.call("post_api_v1_mentor_sessions_by_id_complete", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_mentorship_sessions_by_id_feedback: async (
      input: ApiInput<"post_api_v1_mentorship_sessions_by_id_feedback">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_mentorship_sessions_by_id_feedback",
        input,
      );
      return command(
        "post_api_v1_mentorship_sessions_by_id_feedback",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_mentorship_sessions_by_id_feedback",
            await api.call("post_api_v1_mentorship_sessions_by_id_feedback", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_mentor_by_id_feedback: async (
      input: ApiInput<"get_api_v1_mentor_by_id_feedback">,
    ) => {
      prepareMembershipInput("get_api_v1_mentor_by_id_feedback", input);
      return validateMembershipResponse(
        "get_api_v1_mentor_by_id_feedback",
        await api.call("get_api_v1_mentor_by_id_feedback", input),
      );
    },
    get_api_v1_admin_mentors_by_id_feedback: async (
      input: ApiInput<"get_api_v1_admin_mentors_by_id_feedback">,
    ) => {
      prepareMembershipInput("get_api_v1_admin_mentors_by_id_feedback", input);
      return validateMembershipResponse(
        "get_api_v1_admin_mentors_by_id_feedback",
        await api.call("get_api_v1_admin_mentors_by_id_feedback", input),
      );
    },
    get_api_v1_team_recruitment_openings: async (
      input: ApiInput<"get_api_v1_team_recruitment_openings">,
    ) => {
      prepareMembershipInput("get_api_v1_team_recruitment_openings", input);
      return validateMembershipResponse(
        "get_api_v1_team_recruitment_openings",
        await api.call("get_api_v1_team_recruitment_openings", input),
      );
    },
    get_api_v1_team_recruitment_openings_by_id: async (
      input: ApiInput<"get_api_v1_team_recruitment_openings_by_id">,
    ) => {
      prepareMembershipInput(
        "get_api_v1_team_recruitment_openings_by_id",
        input,
      );
      return validateMembershipResponse(
        "get_api_v1_team_recruitment_openings_by_id",
        await api.call("get_api_v1_team_recruitment_openings_by_id", input),
      );
    },
    post_api_v1_team_recruitment_openings_by_id_apply: async (
      input: ApiInput<"post_api_v1_team_recruitment_openings_by_id_apply">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_team_recruitment_openings_by_id_apply",
        input,
      );
      return command(
        "post_api_v1_team_recruitment_openings_by_id_apply",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_team_recruitment_openings_by_id_apply",
            await api.call(
              "post_api_v1_team_recruitment_openings_by_id_apply",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_team_applications_drafts: async (
      input: ApiInput<"post_api_v1_team_applications_drafts">,
    ) => {
      prepareMembershipInput("post_api_v1_team_applications_drafts", input);
      return command(
        "post_api_v1_team_applications_drafts",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_team_applications_drafts",
            await api.call("post_api_v1_team_applications_drafts", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    put_api_v1_team_applications_drafts_by_id: async (
      input: ApiInput<"put_api_v1_team_applications_drafts_by_id">,
    ) => {
      prepareMembershipInput(
        "put_api_v1_team_applications_drafts_by_id",
        input,
      );
      return command(
        "put_api_v1_team_applications_drafts_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_team_applications_drafts_by_id",
            await api.call("put_api_v1_team_applications_drafts_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_team_applications_drafts_by_id_submit: async (
      input: ApiInput<"post_api_v1_team_applications_drafts_by_id_submit">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_team_applications_drafts_by_id_submit",
        input,
      );
      return command(
        "post_api_v1_team_applications_drafts_by_id_submit",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_team_applications_drafts_by_id_submit",
            await api.call(
              "post_api_v1_team_applications_drafts_by_id_submit",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_team_applications_my: async (
      input: ApiInput<"get_api_v1_team_applications_my">,
    ) => {
      prepareMembershipInput("get_api_v1_team_applications_my", input);
      return validateMembershipResponse(
        "get_api_v1_team_applications_my",
        await api.call("get_api_v1_team_applications_my", input),
      );
    },
    get_api_v1_team_applications_my_by_id: async (
      input: ApiInput<"get_api_v1_team_applications_my_by_id">,
    ) => {
      prepareMembershipInput("get_api_v1_team_applications_my_by_id", input);
      return validateMembershipResponse(
        "get_api_v1_team_applications_my_by_id",
        await api.call("get_api_v1_team_applications_my_by_id", input),
      );
    },
    post_api_v1_team_applications_my_by_id_withdraw: async (
      input: ApiInput<"post_api_v1_team_applications_my_by_id_withdraw">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_team_applications_my_by_id_withdraw",
        input,
      );
      return command(
        "post_api_v1_team_applications_my_by_id_withdraw",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_team_applications_my_by_id_withdraw",
            await api.call("post_api_v1_team_applications_my_by_id_withdraw", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle:
      async (
        input: ApiInput<"post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle">,
      ) => {
        prepareMembershipInput(
          "post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle",
          input,
        );
        return command(
          "post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle",
          input,
          async (key) =>
            validateMembershipResponse(
              "post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle",
              await api.call(
                "post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle",
                { ...input, idempotencyKey: key },
              ),
            ),
        );
      },
    get_api_v1_admin_teams_by_teamId_recruitment_openings: async (
      input: ApiInput<"get_api_v1_admin_teams_by_teamId_recruitment_openings">,
    ) => {
      prepareMembershipInput(
        "get_api_v1_admin_teams_by_teamId_recruitment_openings",
        input,
      );
      return validateMembershipResponse(
        "get_api_v1_admin_teams_by_teamId_recruitment_openings",
        await api.call(
          "get_api_v1_admin_teams_by_teamId_recruitment_openings",
          input,
        ),
      );
    },
    post_api_v1_admin_teams_by_teamId_recruitment_openings: async (
      input: ApiInput<"post_api_v1_admin_teams_by_teamId_recruitment_openings">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_teams_by_teamId_recruitment_openings",
        input,
      );
      return command(
        "post_api_v1_admin_teams_by_teamId_recruitment_openings",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_teams_by_teamId_recruitment_openings",
            await api.call(
              "post_api_v1_admin_teams_by_teamId_recruitment_openings",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_admin_recruitment_openings_by_id: async (
      input: ApiInput<"get_api_v1_admin_recruitment_openings_by_id">,
    ) => {
      prepareMembershipInput(
        "get_api_v1_admin_recruitment_openings_by_id",
        input,
      );
      return validateMembershipResponse(
        "get_api_v1_admin_recruitment_openings_by_id",
        await api.call("get_api_v1_admin_recruitment_openings_by_id", input),
      );
    },
    put_api_v1_admin_recruitment_openings_by_id: async (
      input: ApiInput<"put_api_v1_admin_recruitment_openings_by_id">,
    ) => {
      prepareMembershipInput(
        "put_api_v1_admin_recruitment_openings_by_id",
        input,
      );
      return command(
        "put_api_v1_admin_recruitment_openings_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_admin_recruitment_openings_by_id",
            await api.call("put_api_v1_admin_recruitment_openings_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_recruitment_openings_by_id_open: async (
      input: ApiInput<"post_api_v1_admin_recruitment_openings_by_id_open">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_recruitment_openings_by_id_open",
        input,
      );
      return command(
        "post_api_v1_admin_recruitment_openings_by_id_open",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_recruitment_openings_by_id_open",
            await api.call(
              "post_api_v1_admin_recruitment_openings_by_id_open",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_recruitment_openings_by_id_close: async (
      input: ApiInput<"post_api_v1_admin_recruitment_openings_by_id_close">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_recruitment_openings_by_id_close",
        input,
      );
      return command(
        "post_api_v1_admin_recruitment_openings_by_id_close",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_recruitment_openings_by_id_close",
            await api.call(
              "post_api_v1_admin_recruitment_openings_by_id_close",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_recruitment_openings_by_id_archive: async (
      input: ApiInput<"post_api_v1_admin_recruitment_openings_by_id_archive">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_recruitment_openings_by_id_archive",
        input,
      );
      return command(
        "post_api_v1_admin_recruitment_openings_by_id_archive",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_recruitment_openings_by_id_archive",
            await api.call(
              "post_api_v1_admin_recruitment_openings_by_id_archive",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_admin_recruitment_openings_by_id_applications: async (
      input: ApiInput<"get_api_v1_admin_recruitment_openings_by_id_applications">,
    ) => {
      prepareMembershipInput(
        "get_api_v1_admin_recruitment_openings_by_id_applications",
        input,
      );
      return validateMembershipResponse(
        "get_api_v1_admin_recruitment_openings_by_id_applications",
        await api.call(
          "get_api_v1_admin_recruitment_openings_by_id_applications",
          input,
        ),
      );
    },
    get_api_v1_admin_team_applications_by_id: async (
      input: ApiInput<"get_api_v1_admin_team_applications_by_id">,
    ) => {
      prepareMembershipInput("get_api_v1_admin_team_applications_by_id", input);
      return validateMembershipResponse(
        "get_api_v1_admin_team_applications_by_id",
        await api.call("get_api_v1_admin_team_applications_by_id", input),
      );
    },
    post_api_v1_admin_team_applications_by_id_transition: async (
      input: ApiInput<"post_api_v1_admin_team_applications_by_id_transition">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_team_applications_by_id_transition",
        input,
      );
      return command(
        "post_api_v1_admin_team_applications_by_id_transition",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_team_applications_by_id_transition",
            await api.call(
              "post_api_v1_admin_team_applications_by_id_transition",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_team_applications_by_id_interviews: async (
      input: ApiInput<"post_api_v1_admin_team_applications_by_id_interviews">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_team_applications_by_id_interviews",
        input,
      );
      return command(
        "post_api_v1_admin_team_applications_by_id_interviews",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_team_applications_by_id_interviews",
            await api.call(
              "post_api_v1_admin_team_applications_by_id_interviews",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    put_api_v1_admin_application_interviews_by_id: async (
      input: ApiInput<"put_api_v1_admin_application_interviews_by_id">,
    ) => {
      prepareMembershipInput(
        "put_api_v1_admin_application_interviews_by_id",
        input,
      );
      return command(
        "put_api_v1_admin_application_interviews_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_admin_application_interviews_by_id",
            await api.call("put_api_v1_admin_application_interviews_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_member_profiles: async (
      input: ApiInput<"get_api_v1_member_profiles">,
    ) => {
      prepareMembershipInput("get_api_v1_member_profiles", input);
      return validateMembershipResponse(
        "get_api_v1_member_profiles",
        await api.call("get_api_v1_member_profiles", input),
      );
    },
    get_api_v1_member_profiles_my: async (
      input: ApiInput<"get_api_v1_member_profiles_my">,
    ) => {
      prepareMembershipInput("get_api_v1_member_profiles_my", input);
      return validateMembershipResponse(
        "get_api_v1_member_profiles_my",
        await api.call("get_api_v1_member_profiles_my", input),
      );
    },
    get_api_v1_member_profiles_my_by_id: async (
      input: ApiInput<"get_api_v1_member_profiles_my_by_id">,
    ) => {
      prepareMembershipInput("get_api_v1_member_profiles_my_by_id", input);
      return validateMembershipResponse(
        "get_api_v1_member_profiles_my_by_id",
        await api.call("get_api_v1_member_profiles_my_by_id", input),
      );
    },
    get_api_v1_member_profiles_by_id: async (
      input: ApiInput<"get_api_v1_member_profiles_by_id">,
    ) => {
      prepareMembershipInput("get_api_v1_member_profiles_by_id", input);
      return validateMembershipResponse(
        "get_api_v1_member_profiles_by_id",
        await api.call("get_api_v1_member_profiles_by_id", input),
      );
    },
    put_api_v1_member_profiles_my_public_visibility: async (
      input: ApiInput<"put_api_v1_member_profiles_my_public_visibility">,
    ) => {
      prepareMembershipInput(
        "put_api_v1_member_profiles_my_public_visibility",
        input,
      );
      return command(
        "put_api_v1_member_profiles_my_public_visibility",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_member_profiles_my_public_visibility",
            await api.call("put_api_v1_member_profiles_my_public_visibility", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_teams_by_teamId_members_profiles: async (
      input: ApiInput<"get_api_v1_admin_teams_by_teamId_members_profiles">,
    ) => {
      prepareMembershipInput(
        "get_api_v1_admin_teams_by_teamId_members_profiles",
        input,
      );
      return validateMembershipResponse(
        "get_api_v1_admin_teams_by_teamId_members_profiles",
        await api.call(
          "get_api_v1_admin_teams_by_teamId_members_profiles",
          input,
        ),
      );
    },
    get_api_v1_admin_member_profiles_by_id: async (
      input: ApiInput<"get_api_v1_admin_member_profiles_by_id">,
    ) => {
      prepareMembershipInput("get_api_v1_admin_member_profiles_by_id", input);
      return validateMembershipResponse(
        "get_api_v1_admin_member_profiles_by_id",
        await api.call("get_api_v1_admin_member_profiles_by_id", input),
      );
    },
    put_api_v1_admin_member_profiles_by_id: async (
      input: ApiInput<"put_api_v1_admin_member_profiles_by_id">,
    ) => {
      prepareMembershipInput("put_api_v1_admin_member_profiles_by_id", input);
      return command(
        "put_api_v1_admin_member_profiles_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_admin_member_profiles_by_id",
            await api.call("put_api_v1_admin_member_profiles_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_member_profiles_by_id_positions: async (
      input: ApiInput<"post_api_v1_admin_member_profiles_by_id_positions">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_member_profiles_by_id_positions",
        input,
      );
      return command(
        "post_api_v1_admin_member_profiles_by_id_positions",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_member_profiles_by_id_positions",
            await api.call(
              "post_api_v1_admin_member_profiles_by_id_positions",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete:
      async (
        input: ApiInput<"post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete">,
      ) => {
        prepareMembershipInput(
          "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete",
          input,
        );
        return command(
          "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete",
          input,
          async (key) =>
            validateMembershipResponse(
              "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete",
              await api.call(
                "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete",
                { ...input, idempotencyKey: key },
              ),
            ),
        );
      },
    post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive: async (
      input: ApiInput<"post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive",
        input,
      );
      return command(
        "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive",
            await api.call(
              "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_member_profiles_by_id_activate: async (
      input: ApiInput<"post_api_v1_admin_member_profiles_by_id_activate">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_member_profiles_by_id_activate",
        input,
      );
      return command(
        "post_api_v1_admin_member_profiles_by_id_activate",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_member_profiles_by_id_activate",
            await api.call("post_api_v1_admin_member_profiles_by_id_activate", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_teams_by_teamId_onboarding_templates: async (
      input: ApiInput<"get_api_v1_admin_teams_by_teamId_onboarding_templates">,
    ) => {
      prepareMembershipInput(
        "get_api_v1_admin_teams_by_teamId_onboarding_templates",
        input,
      );
      return validateMembershipResponse(
        "get_api_v1_admin_teams_by_teamId_onboarding_templates",
        await api.call(
          "get_api_v1_admin_teams_by_teamId_onboarding_templates",
          input,
        ),
      );
    },
    post_api_v1_admin_teams_by_teamId_onboarding_templates: async (
      input: ApiInput<"post_api_v1_admin_teams_by_teamId_onboarding_templates">,
    ) => {
      prepareMembershipInput(
        "post_api_v1_admin_teams_by_teamId_onboarding_templates",
        input,
      );
      return command(
        "post_api_v1_admin_teams_by_teamId_onboarding_templates",
        input,
        async (key) =>
          validateMembershipResponse(
            "post_api_v1_admin_teams_by_teamId_onboarding_templates",
            await api.call(
              "post_api_v1_admin_teams_by_teamId_onboarding_templates",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id: async (
      input: ApiInput<"put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id">,
    ) => {
      prepareMembershipInput(
        "put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id",
        input,
      );
      return command(
        "put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id",
        input,
        async (key) =>
          validateMembershipResponse(
            "put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id",
            await api.call(
              "put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_engagement_search: async (
      input: ApiInput<"get_api_v1_engagement_search">,
    ) => {
      prepareMembershipInput("get_api_v1_engagement_search", input);
      return validateMembershipResponse(
        "get_api_v1_engagement_search",
        await api.call("get_api_v1_engagement_search", input),
      );
    },
    get_api_v1_engagement_dashboard: async (
      input: ApiInput<"get_api_v1_engagement_dashboard">,
    ) => {
      prepareMembershipInput("get_api_v1_engagement_dashboard", input);
      return validateMembershipResponse(
        "get_api_v1_engagement_dashboard",
        await api.call("get_api_v1_engagement_dashboard", input),
      );
    },
  };
}
export type MembershipApi = ReturnType<typeof createHttpMembershipApi>;
export function bindMembershipSession(api: ApiClient, service: MembershipApi) {
  const owner = api.session.get()?.sessionId;
  return new Proxy(service, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return typeof value === "function"
        ? (...args: unknown[]) => {
            assertOwner(api, owner);
            return value(...args);
          }
        : value;
    },
  });
}
