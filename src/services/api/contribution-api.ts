import { type ApiClient, type ApiInput } from "./client";
import { engagementCommand } from "./engagement-contracts";
import { validateCommunityInput } from "./community-contracts";
import {
  validateContributionResponse,
  requireContributionVersion,
} from "./contribution-contracts";
import { assertOwner } from "./mapping";
export function createHttpContributionApi(api: ApiClient) {
  const command = engagementCommand(api);
  return {
    get_api_v1_contributions_types: async (
      input: ApiInput<"get_api_v1_contributions_types">,
    ) => {
      validateCommunityInput("get_api_v1_contributions_types", input);
      return validateContributionResponse(
        "get_api_v1_contributions_types",
        await api.call("get_api_v1_contributions_types", input),
      );
    },
    get_api_v1_admin_contributions_types: async (
      input: ApiInput<"get_api_v1_admin_contributions_types">,
    ) => {
      validateCommunityInput("get_api_v1_admin_contributions_types", input);
      return validateContributionResponse(
        "get_api_v1_admin_contributions_types",
        await api.call("get_api_v1_admin_contributions_types", input),
      );
    },
    post_api_v1_admin_contributions_types: async (
      input: ApiInput<"post_api_v1_admin_contributions_types">,
    ) => {
      validateCommunityInput("post_api_v1_admin_contributions_types", input);
      return command(
        "post_api_v1_admin_contributions_types",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_types",
            await api.call("post_api_v1_admin_contributions_types", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    put_api_v1_admin_contributions_types_by_id: async (
      input: ApiInput<"put_api_v1_admin_contributions_types_by_id">,
    ) => {
      validateCommunityInput(
        "put_api_v1_admin_contributions_types_by_id",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "put_api_v1_admin_contributions_types_by_id",
        input,
        async (key) =>
          validateContributionResponse(
            "put_api_v1_admin_contributions_types_by_id",
            await api.call("put_api_v1_admin_contributions_types_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_contributions_my: async (
      input: ApiInput<"get_api_v1_contributions_my">,
    ) => {
      validateCommunityInput("get_api_v1_contributions_my", input);
      return validateContributionResponse(
        "get_api_v1_contributions_my",
        await api.call("get_api_v1_contributions_my", input),
      );
    },
    get_api_v1_contributions_my_by_id: async (
      input: ApiInput<"get_api_v1_contributions_my_by_id">,
    ) => {
      validateCommunityInput("get_api_v1_contributions_my_by_id", input);
      return validateContributionResponse(
        "get_api_v1_contributions_my_by_id",
        await api.call("get_api_v1_contributions_my_by_id", input),
      );
    },
    post_api_v1_contributions: async (
      input: ApiInput<"post_api_v1_contributions">,
    ) => {
      validateCommunityInput("post_api_v1_contributions", input);
      return command("post_api_v1_contributions", input, async (key) =>
        validateContributionResponse(
          "post_api_v1_contributions",
          await api.call("post_api_v1_contributions", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_contributions_by_id_draft: async (
      input: ApiInput<"put_api_v1_contributions_by_id_draft">,
    ) => {
      validateCommunityInput("put_api_v1_contributions_by_id_draft", input);
      requireContributionVersion(input.body.version);
      return command(
        "put_api_v1_contributions_by_id_draft",
        input,
        async (key) =>
          validateContributionResponse(
            "put_api_v1_contributions_by_id_draft",
            await api.call("put_api_v1_contributions_by_id_draft", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_contributions_by_id_draft_assets: async (
      input: ApiInput<"post_api_v1_contributions_by_id_draft_assets">,
    ) => {
      validateCommunityInput(
        "post_api_v1_contributions_by_id_draft_assets",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_contributions_by_id_draft_assets",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_contributions_by_id_draft_assets",
            await api.call("post_api_v1_contributions_by_id_draft_assets", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    delete_api_v1_contributions_by_id_draft_assets_by_linkId: async (
      input: ApiInput<"delete_api_v1_contributions_by_id_draft_assets_by_linkId">,
    ) => {
      validateCommunityInput(
        "delete_api_v1_contributions_by_id_draft_assets_by_linkId",
        input,
      );
      requireContributionVersion(input.query?.version);
      return command(
        "delete_api_v1_contributions_by_id_draft_assets_by_linkId",
        input,
        async (key) =>
          validateContributionResponse(
            "delete_api_v1_contributions_by_id_draft_assets_by_linkId",
            await api.call(
              "delete_api_v1_contributions_by_id_draft_assets_by_linkId",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_contributions_by_id_draft_links: async (
      input: ApiInput<"post_api_v1_contributions_by_id_draft_links">,
    ) => {
      validateCommunityInput(
        "post_api_v1_contributions_by_id_draft_links",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_contributions_by_id_draft_links",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_contributions_by_id_draft_links",
            await api.call("post_api_v1_contributions_by_id_draft_links", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    delete_api_v1_contributions_by_id_draft_links_by_linkId: async (
      input: ApiInput<"delete_api_v1_contributions_by_id_draft_links_by_linkId">,
    ) => {
      validateCommunityInput(
        "delete_api_v1_contributions_by_id_draft_links_by_linkId",
        input,
      );
      requireContributionVersion(input.query?.version);
      return command(
        "delete_api_v1_contributions_by_id_draft_links_by_linkId",
        input,
        async (key) =>
          validateContributionResponse(
            "delete_api_v1_contributions_by_id_draft_links_by_linkId",
            await api.call(
              "delete_api_v1_contributions_by_id_draft_links_by_linkId",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_contributions_by_id_submit: async (
      input: ApiInput<"post_api_v1_contributions_by_id_submit">,
    ) => {
      validateCommunityInput("post_api_v1_contributions_by_id_submit", input);
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_contributions_by_id_submit",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_contributions_by_id_submit",
            await api.call("post_api_v1_contributions_by_id_submit", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_contributions_by_id_withdraw: async (
      input: ApiInput<"post_api_v1_contributions_by_id_withdraw">,
    ) => {
      validateCommunityInput("post_api_v1_contributions_by_id_withdraw", input);
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_contributions_by_id_withdraw",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_contributions_by_id_withdraw",
            await api.call("post_api_v1_contributions_by_id_withdraw", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_contributions_by_id_delete_draft: async (
      input: ApiInput<"post_api_v1_contributions_by_id_delete_draft">,
    ) => {
      validateCommunityInput(
        "post_api_v1_contributions_by_id_delete_draft",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_contributions_by_id_delete_draft",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_contributions_by_id_delete_draft",
            await api.call("post_api_v1_contributions_by_id_delete_draft", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_contributions_by_id_restore_draft: async (
      input: ApiInput<"post_api_v1_contributions_by_id_restore_draft">,
    ) => {
      validateCommunityInput(
        "post_api_v1_contributions_by_id_restore_draft",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_contributions_by_id_restore_draft",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_contributions_by_id_restore_draft",
            await api.call("post_api_v1_contributions_by_id_restore_draft", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_contributions_by_id_revisions: async (
      input: ApiInput<"get_api_v1_contributions_by_id_revisions">,
    ) => {
      validateCommunityInput("get_api_v1_contributions_by_id_revisions", input);
      return validateContributionResponse(
        "get_api_v1_contributions_by_id_revisions",
        await api.call("get_api_v1_contributions_by_id_revisions", input),
      );
    },
    get_api_v1_admin_contributions_by_id_revisions: async (
      input: ApiInput<"get_api_v1_admin_contributions_by_id_revisions">,
    ) => {
      validateCommunityInput(
        "get_api_v1_admin_contributions_by_id_revisions",
        input,
      );
      return validateContributionResponse(
        "get_api_v1_admin_contributions_by_id_revisions",
        await api.call("get_api_v1_admin_contributions_by_id_revisions", input),
      );
    },
    get_api_v1_contributions_by_id_reviews: async (
      input: ApiInput<"get_api_v1_contributions_by_id_reviews">,
    ) => {
      validateCommunityInput("get_api_v1_contributions_by_id_reviews", input);
      return validateContributionResponse(
        "get_api_v1_contributions_by_id_reviews",
        await api.call("get_api_v1_contributions_by_id_reviews", input),
      );
    },
    get_api_v1_admin_contributions_by_id_reviews: async (
      input: ApiInput<"get_api_v1_admin_contributions_by_id_reviews">,
    ) => {
      validateCommunityInput(
        "get_api_v1_admin_contributions_by_id_reviews",
        input,
      );
      return validateContributionResponse(
        "get_api_v1_admin_contributions_by_id_reviews",
        await api.call("get_api_v1_admin_contributions_by_id_reviews", input),
      );
    },
    get_api_v1_admin_contributions: async (
      input: ApiInput<"get_api_v1_admin_contributions">,
    ) => {
      validateCommunityInput("get_api_v1_admin_contributions", input);
      return validateContributionResponse(
        "get_api_v1_admin_contributions",
        await api.call("get_api_v1_admin_contributions", input),
      );
    },
    get_api_v1_admin_contributions_by_id: async (
      input: ApiInput<"get_api_v1_admin_contributions_by_id">,
    ) => {
      validateCommunityInput("get_api_v1_admin_contributions_by_id", input);
      return validateContributionResponse(
        "get_api_v1_admin_contributions_by_id",
        await api.call("get_api_v1_admin_contributions_by_id", input),
      );
    },
    post_api_v1_admin_contributions_by_id_claim: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_claim">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_claim",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_claim",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_claim",
            await api.call("post_api_v1_admin_contributions_by_id_claim", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_assign: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_assign">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_assign",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_assign",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_assign",
            await api.call("post_api_v1_admin_contributions_by_id_assign", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_request_changes: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_request_changes">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_request_changes",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_request_changes",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_request_changes",
            await api.call(
              "post_api_v1_admin_contributions_by_id_request_changes",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_approve: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_approve">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_approve",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_approve",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_approve",
            await api.call("post_api_v1_admin_contributions_by_id_approve", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_reject: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_reject">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_reject",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_reject",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_reject",
            await api.call("post_api_v1_admin_contributions_by_id_reject", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_publish: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_publish">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_publish",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_publish",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_publish",
            await api.call("post_api_v1_admin_contributions_by_id_publish", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_unpublish: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_unpublish">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_unpublish",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_unpublish",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_unpublish",
            await api.call("post_api_v1_admin_contributions_by_id_unpublish", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_restart: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_restart">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_restart",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_restart",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_restart",
            await api.call("post_api_v1_admin_contributions_by_id_restart", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_contributions_by_id_reclassify: async (
      input: ApiInput<"post_api_v1_admin_contributions_by_id_reclassify">,
    ) => {
      validateCommunityInput(
        "post_api_v1_admin_contributions_by_id_reclassify",
        input,
      );
      requireContributionVersion(input.body.version);
      return command(
        "post_api_v1_admin_contributions_by_id_reclassify",
        input,
        async (key) =>
          validateContributionResponse(
            "post_api_v1_admin_contributions_by_id_reclassify",
            await api.call("post_api_v1_admin_contributions_by_id_reclassify", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_academic_contributions_by_id: async (
      input: ApiInput<"get_api_v1_academic_contributions_by_id">,
    ) => {
      validateCommunityInput("get_api_v1_academic_contributions_by_id", input);
      return validateContributionResponse(
        "get_api_v1_academic_contributions_by_id",
        await api.call("get_api_v1_academic_contributions_by_id", input),
      );
    },
    get_api_v1_academic_contributions: async (
      input: ApiInput<"get_api_v1_academic_contributions">,
    ) => {
      validateCommunityInput("get_api_v1_academic_contributions", input);
      return validateContributionResponse(
        "get_api_v1_academic_contributions",
        await api.call("get_api_v1_academic_contributions", input),
      );
    },
  };
}
export type ContributionApi = ReturnType<typeof createHttpContributionApi>;
export function bindContributionSession(
  api: ApiClient,
  service: ContributionApi,
) {
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
