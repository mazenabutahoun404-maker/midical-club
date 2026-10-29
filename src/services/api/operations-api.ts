import { type ApiClient, type ApiInput } from "./client";
import { engagementCommand } from "./engagement-contracts";
import {
  prepareOperationsInput,
  validateOperationsResponse,
} from "./operations-contracts";
import { assertOwner } from "./mapping";
export function createHttpOperationsApi(api: ApiClient) {
  const command = engagementCommand(api);
  return {
    get_api_v1_admin_content_health: async (
      input: ApiInput<"get_api_v1_admin_content_health">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_content_health", input);
      return validateOperationsResponse(
        "get_api_v1_admin_content_health",
        await api.call("get_api_v1_admin_content_health", input),
      );
    },
    get_api_v1_admin_analytics_range: async (
      input: ApiInput<"get_api_v1_admin_analytics_range">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_analytics_range", input);
      return validateOperationsResponse(
        "get_api_v1_admin_analytics_range",
        await api.call("get_api_v1_admin_analytics_range", input),
      );
    },
    get_api_v1_admin_overview: async (
      input: ApiInput<"get_api_v1_admin_overview">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_overview", input);
      return validateOperationsResponse(
        "get_api_v1_admin_overview",
        await api.call("get_api_v1_admin_overview", input),
      );
    },
    get_api_v1_admin_analytics_by_module: async (
      input: ApiInput<"get_api_v1_admin_analytics_by_module">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_analytics_by_module", input);
      return validateOperationsResponse(
        "get_api_v1_admin_analytics_by_module",
        await api.call("get_api_v1_admin_analytics_by_module", input),
      );
    },
    post_api_v1_admin_reports_exports: async (
      input: ApiInput<"post_api_v1_admin_reports_exports">,
    ) => {
      prepareOperationsInput("post_api_v1_admin_reports_exports", input);
      return command("post_api_v1_admin_reports_exports", input, async (key) =>
        validateOperationsResponse(
          "post_api_v1_admin_reports_exports",
          await api.call("post_api_v1_admin_reports_exports", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    get_api_v1_admin_reports_exports_by_id: async (
      input: ApiInput<"get_api_v1_admin_reports_exports_by_id">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_reports_exports_by_id", input);
      return validateOperationsResponse(
        "get_api_v1_admin_reports_exports_by_id",
        await api.call("get_api_v1_admin_reports_exports_by_id", input),
      );
    },
    post_api_v1_analytics_events: async (
      input: ApiInput<"post_api_v1_analytics_events">,
    ) => {
      prepareOperationsInput("post_api_v1_analytics_events", input);
      return validateOperationsResponse(
        "post_api_v1_analytics_events",
        await api.call("post_api_v1_analytics_events", input),
      );
    },
    get_api_v1_admin_audit_logs: async (
      input: ApiInput<"get_api_v1_admin_audit_logs">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_audit_logs", input);
      return validateOperationsResponse(
        "get_api_v1_admin_audit_logs",
        await api.call("get_api_v1_admin_audit_logs", input),
      );
    },
    post_api_v1_admin_audit_logs_exports: async (
      input: ApiInput<"post_api_v1_admin_audit_logs_exports">,
    ) => {
      prepareOperationsInput("post_api_v1_admin_audit_logs_exports", input);
      return command(
        "post_api_v1_admin_audit_logs_exports",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_audit_logs_exports",
            await api.call("post_api_v1_admin_audit_logs_exports", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_audit_logs_exports_by_exportId: async (
      input: ApiInput<"get_api_v1_admin_audit_logs_exports_by_exportId">,
    ) => {
      prepareOperationsInput(
        "get_api_v1_admin_audit_logs_exports_by_exportId",
        input,
      );
      return validateOperationsResponse(
        "get_api_v1_admin_audit_logs_exports_by_exportId",
        await api.call(
          "get_api_v1_admin_audit_logs_exports_by_exportId",
          input,
        ),
      );
    },
    get_api_v1_admin_audit_logs_exports_by_exportId_download: async (
      input: ApiInput<"get_api_v1_admin_audit_logs_exports_by_exportId_download">,
    ) => {
      prepareOperationsInput(
        "get_api_v1_admin_audit_logs_exports_by_exportId_download",
        input,
      );
      return validateOperationsResponse(
        "get_api_v1_admin_audit_logs_exports_by_exportId_download",
        await api.call(
          "get_api_v1_admin_audit_logs_exports_by_exportId_download",
          input,
        ),
      );
    },
    get_api_v1_admin_security_alerts: async (
      input: ApiInput<"get_api_v1_admin_security_alerts">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_security_alerts", input);
      return validateOperationsResponse(
        "get_api_v1_admin_security_alerts",
        await api.call("get_api_v1_admin_security_alerts", input),
      );
    },
    patch_api_v1_admin_security_alerts_by_id_read: async (
      input: ApiInput<"patch_api_v1_admin_security_alerts_by_id_read">,
    ) => {
      prepareOperationsInput(
        "patch_api_v1_admin_security_alerts_by_id_read",
        input,
      );
      return command(
        "patch_api_v1_admin_security_alerts_by_id_read",
        input,
        async (key) =>
          validateOperationsResponse(
            "patch_api_v1_admin_security_alerts_by_id_read",
            await api.call("patch_api_v1_admin_security_alerts_by_id_read", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_governance_versions: async (
      input: ApiInput<"get_api_v1_admin_governance_versions">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_governance_versions", input);
      return validateOperationsResponse(
        "get_api_v1_admin_governance_versions",
        await api.call("get_api_v1_admin_governance_versions", input),
      );
    },
    get_api_v1_admin_governance_versions_by_id: async (
      input: ApiInput<"get_api_v1_admin_governance_versions_by_id">,
    ) => {
      prepareOperationsInput(
        "get_api_v1_admin_governance_versions_by_id",
        input,
      );
      return validateOperationsResponse(
        "get_api_v1_admin_governance_versions_by_id",
        await api.call("get_api_v1_admin_governance_versions_by_id", input),
      );
    },
    get_api_v1_admin_governance_versions_by_id_compare: async (
      input: ApiInput<"get_api_v1_admin_governance_versions_by_id_compare">,
    ) => {
      prepareOperationsInput(
        "get_api_v1_admin_governance_versions_by_id_compare",
        input,
      );
      return validateOperationsResponse(
        "get_api_v1_admin_governance_versions_by_id_compare",
        await api.call(
          "get_api_v1_admin_governance_versions_by_id_compare",
          input,
        ),
      );
    },
    post_api_v1_admin_governance_versions_by_id_restore_preview: async (
      input: ApiInput<"post_api_v1_admin_governance_versions_by_id_restore_preview">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_governance_versions_by_id_restore_preview",
        input,
      );
      return command(
        "post_api_v1_admin_governance_versions_by_id_restore_preview",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_governance_versions_by_id_restore_preview",
            await api.call(
              "post_api_v1_admin_governance_versions_by_id_restore_preview",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_admin_governance_versions_by_id_restore: async (
      input: ApiInput<"post_api_v1_admin_governance_versions_by_id_restore">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_governance_versions_by_id_restore",
        input,
      );
      return command(
        "post_api_v1_admin_governance_versions_by_id_restore",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_governance_versions_by_id_restore",
            await api.call(
              "post_api_v1_admin_governance_versions_by_id_restore",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_admin_governance_overview: async (
      input: ApiInput<"get_api_v1_admin_governance_overview">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_governance_overview", input);
      return validateOperationsResponse(
        "get_api_v1_admin_governance_overview",
        await api.call("get_api_v1_admin_governance_overview", input),
      );
    },
    get_api_v1_admin_governance_access_requests: async (
      input: ApiInput<"get_api_v1_admin_governance_access_requests">,
    ) => {
      prepareOperationsInput(
        "get_api_v1_admin_governance_access_requests",
        input,
      );
      return validateOperationsResponse(
        "get_api_v1_admin_governance_access_requests",
        await api.call("get_api_v1_admin_governance_access_requests", input),
      );
    },
    post_api_v1_admin_governance_access_requests: async (
      input: ApiInput<"post_api_v1_admin_governance_access_requests">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_governance_access_requests",
        input,
      );
      return command(
        "post_api_v1_admin_governance_access_requests",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_governance_access_requests",
            await api.call("post_api_v1_admin_governance_access_requests", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_governance_access_requests_by_id_decisions: async (
      input: ApiInput<"post_api_v1_admin_governance_access_requests_by_id_decisions">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_governance_access_requests_by_id_decisions",
        input,
      );
      return command(
        "post_api_v1_admin_governance_access_requests_by_id_decisions",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_governance_access_requests_by_id_decisions",
            await api.call(
              "post_api_v1_admin_governance_access_requests_by_id_decisions",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_admin_system_settings: async (
      input: ApiInput<"get_api_v1_admin_system_settings">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_system_settings", input);
      return validateOperationsResponse(
        "get_api_v1_admin_system_settings",
        await api.call("get_api_v1_admin_system_settings", input),
      );
    },
    put_api_v1_admin_system_settings_by_key: async (
      input: ApiInput<"put_api_v1_admin_system_settings_by_key">,
    ) => {
      prepareOperationsInput("put_api_v1_admin_system_settings_by_key", input);
      return command(
        "put_api_v1_admin_system_settings_by_key",
        input,
        async (key) =>
          validateOperationsResponse(
            "put_api_v1_admin_system_settings_by_key",
            await api.call("put_api_v1_admin_system_settings_by_key", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_health_details: async (
      input: ApiInput<"get_api_v1_admin_health_details">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_health_details", input);
      return validateOperationsResponse(
        "get_api_v1_admin_health_details",
        await api.call("get_api_v1_admin_health_details", input),
      );
    },
    get_api_v1_admin_operations_backups: async (
      input: ApiInput<"get_api_v1_admin_operations_backups">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_operations_backups", input);
      return validateOperationsResponse(
        "get_api_v1_admin_operations_backups",
        await api.call("get_api_v1_admin_operations_backups", input),
      );
    },
    get_api_v1_admin_operations_restore_verifications: async (
      input: ApiInput<"get_api_v1_admin_operations_restore_verifications">,
    ) => {
      prepareOperationsInput(
        "get_api_v1_admin_operations_restore_verifications",
        input,
      );
      return validateOperationsResponse(
        "get_api_v1_admin_operations_restore_verifications",
        await api.call(
          "get_api_v1_admin_operations_restore_verifications",
          input,
        ),
      );
    },
    post_api_v1_admin_operations_restore_verifications: async (
      input: ApiInput<"post_api_v1_admin_operations_restore_verifications">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_operations_restore_verifications",
        input,
      );
      return command(
        "post_api_v1_admin_operations_restore_verifications",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_operations_restore_verifications",
            await api.call(
              "post_api_v1_admin_operations_restore_verifications",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_admin_search_synonyms: async (
      input: ApiInput<"get_api_v1_admin_search_synonyms">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_search_synonyms", input);
      return validateOperationsResponse(
        "get_api_v1_admin_search_synonyms",
        await api.call("get_api_v1_admin_search_synonyms", input),
      );
    },
    post_api_v1_admin_search_synonyms: async (
      input: ApiInput<"post_api_v1_admin_search_synonyms">,
    ) => {
      prepareOperationsInput("post_api_v1_admin_search_synonyms", input);
      return command("post_api_v1_admin_search_synonyms", input, async (key) =>
        validateOperationsResponse(
          "post_api_v1_admin_search_synonyms",
          await api.call("post_api_v1_admin_search_synonyms", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_admin_search_synonyms_by_id: async (
      input: ApiInput<"put_api_v1_admin_search_synonyms_by_id">,
    ) => {
      prepareOperationsInput("put_api_v1_admin_search_synonyms_by_id", input);
      return command(
        "put_api_v1_admin_search_synonyms_by_id",
        input,
        async (key) =>
          validateOperationsResponse(
            "put_api_v1_admin_search_synonyms_by_id",
            await api.call("put_api_v1_admin_search_synonyms_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_search_synonyms_by_id_activate: async (
      input: ApiInput<"post_api_v1_admin_search_synonyms_by_id_activate">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_search_synonyms_by_id_activate",
        input,
      );
      return command(
        "post_api_v1_admin_search_synonyms_by_id_activate",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_search_synonyms_by_id_activate",
            await api.call("post_api_v1_admin_search_synonyms_by_id_activate", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_search_synonyms_by_id_archive: async (
      input: ApiInput<"post_api_v1_admin_search_synonyms_by_id_archive">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_search_synonyms_by_id_archive",
        input,
      );
      return command(
        "post_api_v1_admin_search_synonyms_by_id_archive",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_search_synonyms_by_id_archive",
            await api.call("post_api_v1_admin_search_synonyms_by_id_archive", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_search_abbreviations: async (
      input: ApiInput<"get_api_v1_admin_search_abbreviations">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_search_abbreviations", input);
      return validateOperationsResponse(
        "get_api_v1_admin_search_abbreviations",
        await api.call("get_api_v1_admin_search_abbreviations", input),
      );
    },
    post_api_v1_admin_search_abbreviations: async (
      input: ApiInput<"post_api_v1_admin_search_abbreviations">,
    ) => {
      prepareOperationsInput("post_api_v1_admin_search_abbreviations", input);
      return command(
        "post_api_v1_admin_search_abbreviations",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_search_abbreviations",
            await api.call("post_api_v1_admin_search_abbreviations", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    put_api_v1_admin_search_abbreviations_by_id: async (
      input: ApiInput<"put_api_v1_admin_search_abbreviations_by_id">,
    ) => {
      prepareOperationsInput(
        "put_api_v1_admin_search_abbreviations_by_id",
        input,
      );
      return command(
        "put_api_v1_admin_search_abbreviations_by_id",
        input,
        async (key) =>
          validateOperationsResponse(
            "put_api_v1_admin_search_abbreviations_by_id",
            await api.call("put_api_v1_admin_search_abbreviations_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_admin_search_query_approvals: async (
      input: ApiInput<"post_api_v1_admin_search_query_approvals">,
    ) => {
      prepareOperationsInput("post_api_v1_admin_search_query_approvals", input);
      return command(
        "post_api_v1_admin_search_query_approvals",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_search_query_approvals",
            await api.call("post_api_v1_admin_search_query_approvals", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_search_top_queries: async (
      input: ApiInput<"get_api_v1_admin_search_top_queries">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_search_top_queries", input);
      return validateOperationsResponse(
        "get_api_v1_admin_search_top_queries",
        await api.call("get_api_v1_admin_search_top_queries", input),
      );
    },
    get_api_v1_admin_search_zero_results: async (
      input: ApiInput<"get_api_v1_admin_search_zero_results">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_search_zero_results", input);
      return validateOperationsResponse(
        "get_api_v1_admin_search_zero_results",
        await api.call("get_api_v1_admin_search_zero_results", input),
      );
    },
    post_api_v1_admin_search_reindex: async (
      input: ApiInput<"post_api_v1_admin_search_reindex">,
    ) => {
      prepareOperationsInput("post_api_v1_admin_search_reindex", input);
      return command("post_api_v1_admin_search_reindex", input, async (key) =>
        validateOperationsResponse(
          "post_api_v1_admin_search_reindex",
          await api.call("post_api_v1_admin_search_reindex", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    post_api_v1_admin_search_reindex_by_id_resume: async (
      input: ApiInput<"post_api_v1_admin_search_reindex_by_id_resume">,
    ) => {
      prepareOperationsInput(
        "post_api_v1_admin_search_reindex_by_id_resume",
        input,
      );
      return command(
        "post_api_v1_admin_search_reindex_by_id_resume",
        input,
        async (key) =>
          validateOperationsResponse(
            "post_api_v1_admin_search_reindex_by_id_resume",
            await api.call("post_api_v1_admin_search_reindex_by_id_resume", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_admin_search_reindex_by_id: async (
      input: ApiInput<"get_api_v1_admin_search_reindex_by_id">,
    ) => {
      prepareOperationsInput("get_api_v1_admin_search_reindex_by_id", input);
      return validateOperationsResponse(
        "get_api_v1_admin_search_reindex_by_id",
        await api.call("get_api_v1_admin_search_reindex_by_id", input),
      );
    },
  };
}
export type OperationsApi = ReturnType<typeof createHttpOperationsApi>;
export function bindOperationsSession(api: ApiClient, service: OperationsApi) {
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
