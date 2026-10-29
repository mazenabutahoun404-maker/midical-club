export const operationsRoutes: Record<
  string,
  {
    method: string;
    path: string;
    body: unknown;
    response: unknown;
    status: number;
    parameters: any[];
    permission: string | null;
    summary: string;
    description: string;
  }
> = {
  get_api_v1_admin_content_health: {
    method: "GET",
    path: "/api/v1/admin/content-health",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_content_health_200",
    },
    status: 200,
    parameters: [
      {
        name: "Page",
        in: "query",
        description:
          "Filter or option: page. Its schema shows the accepted type and any declared constraints.",
        schema: {
          maximum: 2147483647,
          minimum: 1,
          type: "integer",
          format: "int32",
        },
      },
      {
        name: "PageSize",
        in: "query",
        description:
          "Filter or option: page size. Its schema shows the accepted type and any declared constraints.",
        schema: { maximum: 100, minimum: 1, type: "integer", format: "int32" },
      },
      {
        name: "Search",
        in: "query",
        description:
          "Filter or option: search. Its schema shows the accepted type and any declared constraints.",
        schema: { maxLength: 100, type: "string" },
      },
      {
        name: "Sort",
        in: "query",
        description:
          "Filter or option: sort. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "From",
        in: "query",
        description:
          "Filter or option: from. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date-time" },
      },
      {
        name: "To",
        in: "query",
        description:
          "Filter or option: to. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date-time" },
      },
      {
        name: "Action",
        in: "query",
        description:
          "Filter or option: action. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "ActorId",
        in: "query",
        description:
          "Filter or option: actor id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "EntityType",
        in: "query",
        description:
          "Filter or option: entity type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "EntityId",
        in: "query",
        description:
          "Filter or option: entity id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "kind",
        in: "query",
        description:
          "Filter or option: kind. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
    ],
    permission: null,
    summary: "Read factual content health diagnostics",
    description:
      "Requires analytics.content.view and each underlying content permission. Paginated diagnostics use stored editorial facts. Unknown asset authority metadata is explicitly unknown with null score; this is not a publication gate or medical quality judgment.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_analytics_range: {
    method: "GET",
    path: "/api/v1/admin/analytics/range",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_analytics_range_200",
    },
    status: 200,
    parameters: [
      {
        name: "range",
        in: "query",
        description:
          "Filter or option: range. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", default: "30d" },
      },
      {
        name: "through",
        in: "query",
        description:
          "Filter or option: through. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date" },
      },
    ],
    permission: null,
    summary: "Read observed analytics range",
    description:
      "Completed UTC days for 7d, 30d or 90d. Requires global overview, content and search analytics permissions. Returns live aggregates from recorded events and conservative cohort suppression; no mock scaling. Null is unavailable. Library save history starts with this release.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_overview: {
    method: "GET",
    path: "/api/v1/admin/overview",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_overview_200",
    },
    status: 200,
    parameters: [],
    permission: null,
    summary: "Read administrative editorial overview",
    description:
      "Global overview authorization plus each domain read permission. Returns six live operational counters with explicit definitions. Unauthorized counters are null. Draft updates do not refresh the age of published content.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_analytics_by_module: {
    method: "GET",
    path: "/api/v1/admin/analytics/{module}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_analytics_by_module_200",
    },
    status: 200,
    parameters: [
      {
        name: "date",
        in: "query",
        description:
          "Filter or option: date. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date" },
      },
      {
        name: "teamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "module",
        in: "path",
        description:
          "Supported values only. Existing concrete URLs, payloads and authorization rules are unchanged. Unknown values do not match this route. Allowed values: `overview`, `content`, `academic`, `search`, `contributions`, `events`, `store`, `mentorship`, `teams`.",
        required: true,
        schema: {
          enum: [
            "overview",
            "content",
            "academic",
            "search",
            "contributions",
            "events",
            "store",
            "mentorship",
            "teams",
          ],
          type: "string",
        },
        example: "overview",
      },
    ],
    permission: null,
    summary: "Get analytics for a selected module",
    description:
      "Get analytics for a selected module.\n\nRequires a bearer access token.\n\nChoose `module` from `overview`, `content`, `academic`, `search`, `contributions`, `events`, `store`, `mentorship`, `teams`. Unknown values do not match this route.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_reports_exports: {
    method: "POST",
    path: "/api/v1/admin/reports/exports",
    body: { $ref: "#/components/schemas/ExportInput" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_reports_exports_200",
    },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "analytics.reports.export",
    summary: "Request a private analytics report export",
    description:
      "Request a private analytics report export.\n\nRequires a bearer access token. The service checks `analytics.reports.export`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_reports_exports_by_id: {
    method: "GET",
    path: "/api/v1/admin/reports/exports/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_reports_exports_by_id_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    permission: "analytics.reports.export",
    summary: "Get analytics report export status",
    description:
      "Get analytics report export status.\n\nRequires a bearer access token. The service checks `analytics.reports.export`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_analytics_events: {
    method: "POST",
    path: "/api/v1/analytics/events",
    body: { $ref: "#/components/schemas/EventInput" },
    response: null,
    status: 204,
    parameters: [],
    permission: null,
    summary: "Record an analytics event",
    description:
      "Record an analytics event.\n\nNo bearer token is required by this endpoint.",
  },
  get_api_v1_admin_audit_logs: {
    method: "GET",
    path: "/api/v1/admin/audit-logs",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_audit_logs_200",
    },
    status: 200,
    parameters: [
      {
        name: "Page",
        in: "query",
        description:
          "Filter or option: page. Its schema shows the accepted type and any declared constraints.",
        schema: {
          maximum: 2147483647,
          minimum: 1,
          type: "integer",
          format: "int32",
        },
      },
      {
        name: "PageSize",
        in: "query",
        description:
          "Filter or option: page size. Its schema shows the accepted type and any declared constraints.",
        schema: { maximum: 100, minimum: 1, type: "integer", format: "int32" },
      },
      {
        name: "Search",
        in: "query",
        description:
          "Filter or option: search. Its schema shows the accepted type and any declared constraints.",
        schema: { maxLength: 100, type: "string" },
      },
      {
        name: "Sort",
        in: "query",
        description:
          "Filter or option: sort. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "From",
        in: "query",
        description:
          "Filter or option: from. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date-time" },
      },
      {
        name: "To",
        in: "query",
        description:
          "Filter or option: to. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date-time" },
      },
      {
        name: "Action",
        in: "query",
        description:
          "Filter or option: action. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "ActorId",
        in: "query",
        description:
          "Filter or option: actor id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "EntityType",
        in: "query",
        description:
          "Filter or option: entity type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "EntityId",
        in: "query",
        description:
          "Filter or option: entity id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
    ],
    permission: "audit.read",
    summary: "List audit logs",
    description:
      "List audit logs.\n\nRequires a bearer access token. The service checks `audit.read`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_audit_logs_exports: {
    method: "POST",
    path: "/api/v1/admin/audit-logs/exports",
    body: { $ref: "#/components/schemas/ExportRequest" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_audit_logs_exports_202",
    },
    status: 202,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "audit.export",
    summary: "Create export for audit log",
    description:
      "Create export for audit log.\n\nRequires a bearer access token. The service checks `audit.export`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_audit_logs_exports_by_exportId: {
    method: "GET",
    path: "/api/v1/admin/audit-logs/exports/{exportId}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_audit_logs_exports_by_exportId_200",
    },
    status: 200,
    parameters: [
      {
        name: "exportId",
        in: "path",
        description: "Identifies the export id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    permission: "audit.export",
    summary: "Get export for audit log",
    description:
      "Get export for audit log.\n\nRequires a bearer access token. The service checks `audit.export`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_audit_logs_exports_by_exportId_download: {
    method: "GET",
    path: "/api/v1/admin/audit-logs/exports/{exportId}/download",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_audit_logs_exports_by_exportId_download_200",
    },
    status: 200,
    parameters: [
      {
        name: "exportId",
        in: "path",
        description: "Identifies the export id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    permission: null,
    summary: "Download export for audit log",
    description:
      "Download export for audit log.\n\nRequires a bearer access token.\n\nResponse contract: AuditService.Download returns a file stream, with content type selected by stored CSV, XLSX or PDF export format.",
  },
  get_api_v1_admin_security_alerts: {
    method: "GET",
    path: "/api/v1/admin/security-alerts",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_security_alerts_200",
    },
    status: 200,
    parameters: [
      {
        name: "Page",
        in: "query",
        description:
          "Filter or option: page. Its schema shows the accepted type and any declared constraints.",
        schema: {
          maximum: 2147483647,
          minimum: 1,
          type: "integer",
          format: "int32",
        },
      },
      {
        name: "PageSize",
        in: "query",
        description:
          "Filter or option: page size. Its schema shows the accepted type and any declared constraints.",
        schema: { maximum: 100, minimum: 1, type: "integer", format: "int32" },
      },
      {
        name: "Search",
        in: "query",
        description:
          "Filter or option: search. Its schema shows the accepted type and any declared constraints.",
        schema: { maxLength: 100, type: "string" },
      },
      {
        name: "Sort",
        in: "query",
        description:
          "Filter or option: sort. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "From",
        in: "query",
        description:
          "Filter or option: from. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date-time" },
      },
      {
        name: "To",
        in: "query",
        description:
          "Filter or option: to. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date-time" },
      },
      {
        name: "Action",
        in: "query",
        description:
          "Filter or option: action. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "ActorId",
        in: "query",
        description:
          "Filter or option: actor id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "EntityType",
        in: "query",
        description:
          "Filter or option: entity type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "EntityId",
        in: "query",
        description:
          "Filter or option: entity id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
    ],
    permission: null,
    summary: "List security alerts",
    description:
      "List security alerts.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  patch_api_v1_admin_security_alerts_by_id_read: {
    method: "PATCH",
    path: "/api/v1/admin/security-alerts/{id}/read",
    body: null,
    response: null,
    status: 204,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Mark as read: security alert",
    description:
      "Mark as read: security alert.\n\nRequires a bearer access token.",
  },
  get_api_v1_admin_governance_versions: {
    method: "GET",
    path: "/api/v1/admin/governance/versions",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_governance_versions_200",
    },
    status: 200,
    parameters: [
      {
        name: "page",
        in: "query",
        description: "One-based page number.",
        schema: { type: "integer", format: "int32", default: 1 },
      },
    ],
    permission: "governance_versions.view",
    summary: "List versions for governance",
    description:
      "List versions for governance.\n\nRequires a bearer access token. The service checks `governance_versions.view`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_governance_versions_by_id: {
    method: "GET",
    path: "/api/v1/admin/governance/versions/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_governance_versions_by_id_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    permission: "governance_versions.view",
    summary: "Get version for governance",
    description:
      "Get version for governance.\n\nRequires a bearer access token. The service checks `governance_versions.view`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_governance_versions_by_id_compare: {
    method: "GET",
    path: "/api/v1/admin/governance/versions/{id}/compare",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_governance_versions_by_id_compare_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    permission: "governance_versions.compare",
    summary: "Compare versions of governance",
    description:
      "Compare versions of governance.\n\nRequires a bearer access token. The service checks `governance_versions.compare`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_governance_versions_by_id_restore_preview: {
    method: "POST",
    path: "/api/v1/admin/governance/versions/{id}/restore/preview",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_governance_versions_by_id_restore_preview_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Preview restoration of a governance version",
    description:
      "Preview restoration of a governance version.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_governance_versions_by_id_restore: {
    method: "POST",
    path: "/api/v1/admin/governance/versions/{id}/restore",
    body: { $ref: "#/components/schemas/GovernanceRestoreInput" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_governance_versions_by_id_restore_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Restore version for governance",
    description:
      "Restore version for governance.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_governance_overview: {
    method: "GET",
    path: "/api/v1/admin/governance/overview",
    body: null,
    response: { $ref: "#/components/schemas/GovernanceOverviewResponse" },
    status: 200,
    parameters: [],
    permission: null,
    summary: "Get governance overview",
    description:
      "Requires roles.read; counts active users, protected founders, roles and pending high-risk access requests.",
  },
  get_api_v1_admin_governance_access_requests: {
    method: "GET",
    path: "/api/v1/admin/governance/access-requests",
    body: null,
    response: { $ref: "#/components/schemas/GovernanceRequestPageResponse" },
    status: 200,
    parameters: [
      {
        name: "page",
        in: "query",
        description: "One-based page number.",
        schema: { type: "integer", format: "int32", default: 1 },
      },
      {
        name: "pageSize",
        in: "query",
        description:
          "Number of records requested per page; the server enforces this endpoint's paging limits.",
        schema: { type: "integer", format: "int32", default: 20 },
      },
      {
        name: "status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
    ],
    permission: null,
    summary: "List access requests",
    description:
      "Requires roles.assign; supports page, pageSize and status filters.",
  },
  post_api_v1_admin_governance_access_requests: {
    method: "POST",
    path: "/api/v1/admin/governance/access-requests",
    body: { $ref: "#/components/schemas/GovernanceAccessRequestInput" },
    response: { $ref: "#/components/schemas/GovernanceRequestDetailResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Required unique key per actor and command. An identical retry returns the original result after current authorization; a changed request returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Request role change",
    description:
      "Requires users.read, a current target version, a reason and Idempotency-Key. Requests cannot target the requester or a protected founder.",
  },
  post_api_v1_admin_governance_access_requests_by_id_decisions: {
    method: "POST",
    path: "/api/v1/admin/governance/access-requests/{id}/decisions",
    body: { $ref: "#/components/schemas/GovernanceAccessDecisionInput" },
    response: { $ref: "#/components/schemas/GovernanceRequestDetailResponse" },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Required unique key per actor and command. An identical retry returns the original result after current authorization; a changed request returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Decide access request",
    description:
      "Requires roles.assign, a current request version and Idempotency-Key. Two distinct approvers separate from requester and target are required before role assignment.",
  },
  get_api_v1_admin_system_settings: {
    method: "GET",
    path: "/api/v1/admin/system-settings",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_system_settings_200",
    },
    status: 200,
    parameters: [],
    permission: null,
    summary: "List system settings",
    description:
      "List system settings.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  put_api_v1_admin_system_settings_by_key: {
    method: "PUT",
    path: "/api/v1/admin/system-settings/{key}",
    body: { $ref: "#/components/schemas/SettingInput" },
    response: {
      $ref: "#/components/schemas/Response_put_api_v1_admin_system_settings_by_key_200",
    },
    status: 200,
    parameters: [
      {
        name: "key",
        in: "path",
        description: "Identifies the key in this route.",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Update system settings",
    description:
      "Update system settings.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_health_details: {
    method: "GET",
    path: "/api/v1/admin/health/details",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_health_details_200",
    },
    status: 200,
    parameters: [],
    permission: null,
    summary: "Get operational health details",
    description:
      "Get operational health details.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_operations_backups: {
    method: "GET",
    path: "/api/v1/admin/operations/backups",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_operations_backups_200",
    },
    status: 200,
    parameters: [],
    permission: null,
    summary: "List recorded database backups",
    description:
      "List recorded database backups.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_operations_restore_verifications: {
    method: "GET",
    path: "/api/v1/admin/operations/restore-verifications",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_operations_restore_verifications_200",
    },
    status: 200,
    parameters: [
      {
        name: "page",
        in: "query",
        description: "One-based page number.",
        schema: { type: "integer", format: "int32", default: 1 },
      },
    ],
    permission: null,
    summary: "List restore verification records",
    description:
      "List restore verification records.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_operations_restore_verifications: {
    method: "POST",
    path: "/api/v1/admin/operations/restore-verifications",
    body: { $ref: "#/components/schemas/RestoreCheckInput" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_operations_restore_verifications_200",
    },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Record a restore verification request",
    description:
      "Record a restore verification request.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_search_synonyms: {
    method: "GET",
    path: "/api/v1/admin/search/synonyms",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_search_synonyms_200",
    },
    status: 200,
    parameters: [
      {
        name: "page",
        in: "query",
        description: "One-based page number.",
        schema: { type: "integer", format: "int32", default: 1 },
      },
    ],
    permission: null,
    summary: "List synonyms for search",
    description:
      "List synonyms for search.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_search_synonyms: {
    method: "POST",
    path: "/api/v1/admin/search/synonyms",
    body: { $ref: "#/components/schemas/SynonymInput" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_search_synonyms_200",
    },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "search.synonyms.manage",
    summary: "Create synonym for search",
    description:
      "Create synonym for search.\n\nRequires a bearer access token. The service checks `search.synonyms.manage`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  put_api_v1_admin_search_synonyms_by_id: {
    method: "PUT",
    path: "/api/v1/admin/search/synonyms/{id}",
    body: { $ref: "#/components/schemas/SynonymInput" },
    response: {
      $ref: "#/components/schemas/Response_put_api_v1_admin_search_synonyms_by_id_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "search.synonyms.manage",
    summary: "Update synonym for search",
    description:
      "Update synonym for search.\n\nRequires a bearer access token. The service checks `search.synonyms.manage`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_search_synonyms_by_id_activate: {
    method: "POST",
    path: "/api/v1/admin/search/synonyms/{id}/activate",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_search_synonyms_by_id_activate_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "search.synonyms.manage",
    summary: "Activate synonym for search",
    description:
      "Activate synonym for search.\n\nRequires a bearer access token. The service checks `search.synonyms.manage`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_search_synonyms_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/search/synonyms/{id}/archive",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_search_synonyms_by_id_archive_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "search.synonyms.manage",
    summary: "Archive synonym for search",
    description:
      "Archive synonym for search.\n\nRequires a bearer access token. The service checks `search.synonyms.manage`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_search_abbreviations: {
    method: "GET",
    path: "/api/v1/admin/search/abbreviations",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_search_abbreviations_200",
    },
    status: 200,
    parameters: [
      {
        name: "page",
        in: "query",
        description: "One-based page number.",
        schema: { type: "integer", format: "int32", default: 1 },
      },
    ],
    permission: null,
    summary: "List abbreviations for search",
    description:
      "List abbreviations for search.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_search_abbreviations: {
    method: "POST",
    path: "/api/v1/admin/search/abbreviations",
    body: { $ref: "#/components/schemas/AbbreviationInput" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_search_abbreviations_200",
    },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "search.abbreviations.manage",
    summary: "Create abbreviation for search",
    description:
      "Create abbreviation for search.\n\nRequires a bearer access token. The service checks `search.abbreviations.manage`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  put_api_v1_admin_search_abbreviations_by_id: {
    method: "PUT",
    path: "/api/v1/admin/search/abbreviations/{id}",
    body: { $ref: "#/components/schemas/AbbreviationInput" },
    response: {
      $ref: "#/components/schemas/Response_put_api_v1_admin_search_abbreviations_by_id_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "search.abbreviations.manage",
    summary: "Update abbreviation for search",
    description:
      "Update abbreviation for search.\n\nRequires a bearer access token. The service checks `search.abbreviations.manage`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_search_query_approvals: {
    method: "POST",
    path: "/api/v1/admin/search/query-approvals",
    body: { $ref: "#/components/schemas/QueryApprovalInput" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_search_query_approvals_200",
    },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Create query approval for search",
    description:
      "Create query approval for search.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_search_top_queries: {
    method: "GET",
    path: "/api/v1/admin/search/top-queries",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_search_top_queries_200",
    },
    status: 200,
    parameters: [
      {
        name: "date",
        in: "query",
        description:
          "Filter or option: date. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date" },
      },
    ],
    permission: "search.analytics.view",
    summary: "List top queries for search",
    description:
      "List top queries for search.\n\nRequires a bearer access token. The service checks `search.analytics.view`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_search_zero_results: {
    method: "GET",
    path: "/api/v1/admin/search/zero-results",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_search_zero_results_200",
    },
    status: 200,
    parameters: [
      {
        name: "date",
        in: "query",
        description:
          "Filter or option: date. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "date" },
      },
    ],
    permission: "search.analytics.view",
    summary: "List search queries with no results",
    description:
      "List search queries with no results.\n\nRequires a bearer access token. The service checks `search.analytics.view`, with resource and team scope applied where relevant.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_search_reindex: {
    method: "POST",
    path: "/api/v1/admin/search/reindex",
    body: { $ref: "#/components/schemas/ReindexInput" },
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_search_reindex_200",
    },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Start a search reindex job",
    description:
      "Start a search reindex job.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_search_reindex_by_id_resume: {
    method: "POST",
    path: "/api/v1/admin/search/reindex/{id}/resume",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_post_api_v1_admin_search_reindex_by_id_resume_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "A unique operation key. Repeating a completed key returns 409 idempotency_already_completed without repeating the mutation or persisting secret responses.",
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Resume a search reindex job",
    description:
      "Resume a search reindex job.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_search_reindex_by_id: {
    method: "GET",
    path: "/api/v1/admin/search/reindex/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_search_reindex_by_id_200",
    },
    status: 200,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Identifies the id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    permission: null,
    summary: "Get search reindex job status",
    description:
      "Get search reindex job status.\n\nRequires a bearer access token.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
};
export const operationsSchemas: Record<string, unknown> = {
  Response_get_api_v1_admin_content_health_200: {
    required: [
      "mode",
      "generatedAt",
      "score",
      "records",
      "page",
      "pageSize",
      "total",
      "counts",
      "definitions",
    ],
    type: "object",
    properties: {
      mode: { type: "string" },
      generatedAt: { type: "string", format: "date-time" },
      score: { type: "number", nullable: true },
      records: {
        type: "array",
        items: {
          required: [
            "id",
            "sourceId",
            "kind",
            "title",
            "updatedAt",
            "score",
            "severity",
            "issues",
            "unknownChecks",
            "href",
          ],
          type: "object",
          properties: {
            id: { type: "string" },
            sourceId: { type: "string", format: "uuid" },
            kind: { type: "string" },
            title: {
              required: ["ar", "en"],
              type: "object",
              properties: {
                ar: { type: "string", nullable: true },
                en: { type: "string", nullable: true },
              },
              additionalProperties: false,
            },
            updatedAt: { type: "string", format: "date-time" },
            score: { type: "integer", nullable: true },
            severity: { type: "string" },
            issues: { type: "array", items: { type: "string" } },
            unknownChecks: { type: "array", items: { type: "string" } },
            href: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      total: { type: "integer" },
      counts: {
        required: ["critical", "attention", "healthy", "unknown"],
        type: "object",
        properties: {
          critical: { type: "integer" },
          attention: { type: "integer" },
          healthy: { type: "integer" },
          unknown: { type: "integer" },
        },
        additionalProperties: false,
      },
      definitions: {
        required: [
          "scope",
          "stale",
          "missingFile",
          "translation",
          "rights",
          "unknown",
          "weights",
        ],
        type: "object",
        properties: {
          scope: { type: "string" },
          stale: { type: "string" },
          missingFile: { type: "string" },
          translation: { type: "string" },
          rights: { type: "string" },
          unknown: { type: "string" },
          weights: {
            type: "object",
            additionalProperties: { type: "integer" },
          },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_analytics_range_200: {
    required: [
      "mode",
      "generatedAt",
      "range",
      "from",
      "through",
      "timezone",
      "minimumCohort",
      "points",
      "totals",
      "topContent",
      "courseDemand",
      "funnel",
      "definitions",
    ],
    type: "object",
    properties: {
      mode: { type: "string" },
      generatedAt: { type: "string", format: "date-time" },
      range: { type: "string" },
      from: { type: "string", format: "date" },
      through: { type: "string", format: "date" },
      timezone: { type: "string" },
      minimumCohort: { type: "integer" },
      points: {
        type: "array",
        items: {
          required: [
            "date",
            "activeStudents",
            "resourceOpens",
            "searches",
            "saves",
          ],
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            activeStudents: { type: "integer", nullable: true },
            resourceOpens: { type: "integer", nullable: true },
            searches: { type: "integer", nullable: true },
            saves: { type: "integer", nullable: true },
          },
          additionalProperties: false,
        },
      },
      totals: {
        required: [
          "activeStudents",
          "resourceOpens",
          "searches",
          "saves",
          "saveRate",
        ],
        type: "object",
        properties: {
          activeStudents: { type: "number", nullable: true },
          resourceOpens: { type: "integer", nullable: true },
          searches: { type: "integer", nullable: true },
          saves: { type: "integer", nullable: true },
          saveRate: { type: "number", nullable: true },
        },
        additionalProperties: false,
      },
      topContent: {
        type: "array",
        items: {
          required: ["resourceType", "resourceId", "value", "secondary"],
          type: "object",
          properties: {
            resourceType: { type: "string", nullable: true },
            resourceId: { type: "string", format: "uuid", nullable: true },
            value: { type: "integer" },
            secondary: { type: "integer" },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
      courseDemand: {
        type: "array",
        items: {
          required: ["resourceType", "resourceId", "value", "secondary"],
          type: "object",
          properties: {
            resourceType: { type: "string", nullable: true },
            resourceId: { type: "string", format: "uuid", nullable: true },
            value: { type: "integer" },
            secondary: { type: "integer" },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
      funnel: {
        type: "array",
        items: {
          required: ["id", "value"],
          type: "object",
          properties: {
            id: { type: "string" },
            value: { type: "integer", nullable: true },
          },
          additionalProperties: false,
        },
      },
      definitions: {
        required: [
          "activeStudents",
          "resourceOpens",
          "searches",
          "saves",
          "breakdown",
          "funnel",
          "suppression",
        ],
        type: "object",
        properties: {
          activeStudents: { type: "string" },
          resourceOpens: { type: "string" },
          searches: { type: "string" },
          saves: { type: "string" },
          breakdown: { type: "string" },
          funnel: { type: "string" },
          suppression: { type: "string" },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_overview_200: {
    required: [
      "generatedAt",
      "pendingReviews",
      "approvedWaiting",
      "publishedThisWeek",
      "staleContent",
      "openRecruitmentRoles",
      "upcomingEvents",
      "definitions",
    ],
    type: "object",
    properties: {
      generatedAt: { type: "string", format: "date-time" },
      pendingReviews: { type: "integer", nullable: true },
      approvedWaiting: { type: "integer", nullable: true },
      publishedThisWeek: { type: "integer", nullable: true },
      staleContent: { type: "integer", nullable: true },
      openRecruitmentRoles: { type: "integer", nullable: true },
      upcomingEvents: { type: "integer", nullable: true },
      definitions: {
        required: [
          "pendingReviews",
          "approvedWaiting",
          "publishedThisWeek",
          "staleContent",
          "openRecruitmentRoles",
          "upcomingEvents",
          "unavailable",
        ],
        type: "object",
        properties: {
          pendingReviews: { type: "string" },
          approvedWaiting: { type: "string" },
          publishedThisWeek: { type: "string" },
          staleContent: { type: "string" },
          openRecruitmentRoles: { type: "string" },
          upcomingEvents: { type: "string" },
          unavailable: { type: "string" },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_analytics_by_module_200: {
    required: [
      "date",
      "timezone",
      "module",
      "teamId",
      "minimumCohort",
      "dau",
      "wau",
      "mau",
      "metrics",
      "domainMetrics",
      "suppression",
    ],
    type: "object",
    properties: {
      date: { type: "string", format: "date" },
      timezone: { type: "string" },
      module: { type: "string" },
      teamId: { type: "string", format: "uuid", nullable: true },
      minimumCohort: { type: "integer" },
      dau: { type: "integer", nullable: true },
      wau: { type: "integer", nullable: true },
      mau: { type: "integer", nullable: true },
      metrics: {
        type: "array",
        items: {
          required: ["module", "metricName", "metricValue"],
          type: "object",
          properties: {
            module: { type: "string" },
            metricName: { type: "string" },
            metricValue: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
      domainMetrics: {
        type: "array",
        items: {
          required: ["metric", "value", "unit", "basis"],
          type: "object",
          properties: {
            metric: { type: "string" },
            value: { type: "number", nullable: true },
            unit: { type: "string" },
            basis: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      suppression: { type: "string" },
    },
    additionalProperties: false,
  },
  ExportInput: {
    type: "object",
    properties: {
      reportType: { type: "string" },
      date: { type: "string", format: "date" },
      teamId: { type: "string", format: "uuid", nullable: true },
      format: { type: "string" },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_reports_exports_200: {
    required: ["id", "status", "expiresAt"],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      status: { type: "string" },
      expiresAt: { type: "string", format: "date-time" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_reports_exports_by_id_200: {
    required: ["id", "status", "format", "expiresAt", "downloadUrl"],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      status: { type: "string" },
      format: { type: "string" },
      expiresAt: { type: "string", format: "date-time" },
      downloadUrl: { type: "string", nullable: true },
    },
    additionalProperties: false,
  },
  EventInput: {
    type: "object",
    properties: {
      eventName: { type: "string" },
      resourceType: { type: "string" },
      resourceId: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_audit_logs_200: {
    required: [
      "items",
      "page",
      "pageSize",
      "total",
      "totalItems",
      "totalPages",
    ],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "actorUserId",
            "actorNameSnapshot",
            "actorRolesSnapshot",
            "permissionUsed",
            "action",
            "entityType",
            "entityId",
            "result",
            "occurredAt",
            "ipAddress",
            "userAgent",
            "traceId",
            "beforeJson",
            "afterJson",
            "metadataJson",
            "id",
            "createdAt",
            "updatedAt",
            "version",
          ],
          type: "object",
          properties: {
            actorUserId: { type: "string", format: "uuid", nullable: true },
            actorNameSnapshot: { type: "string" },
            actorRolesSnapshot: { type: "array", items: { type: "string" } },
            permissionUsed: { type: "string", nullable: true },
            action: { type: "string" },
            entityType: { type: "string" },
            entityId: { type: "string" },
            result: { type: "string" },
            occurredAt: { type: "string", format: "date-time" },
            ipAddress: { type: "string" },
            userAgent: { type: "string" },
            traceId: { type: "string" },
            beforeJson: { type: "string" },
            afterJson: { type: "string" },
            metadataJson: { type: "string" },
            id: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            version: { type: "string", format: "uuid" },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      total: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  ExportRequest: {
    type: "object",
    properties: {
      format: { type: "string" },
      from: { type: "string", format: "date-time", nullable: true },
      to: { type: "string", format: "date-time", nullable: true },
      action: { type: "string", nullable: true },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_audit_logs_exports_202: {
    required: ["exportId", "status"],
    type: "object",
    properties: {
      exportId: { type: "string", format: "uuid" },
      status: { type: "string" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_audit_logs_exports_by_exportId_200: {
    required: ["id", "status", "format", "expiresAt", "downloadUrl"],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      status: { type: "string" },
      format: { type: "string" },
      expiresAt: { type: "string", format: "date-time", nullable: true },
      downloadUrl: { type: "string", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_audit_logs_exports_by_exportId_download_200: {
    type: "string",
    format: "binary",
  },
  Response_get_api_v1_admin_security_alerts_200: {
    required: [
      "items",
      "page",
      "pageSize",
      "total",
      "totalItems",
      "totalPages",
    ],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "type",
            "severity",
            "message",
            "metadataJson",
            "readAt",
            "readBy",
            "id",
            "createdAt",
            "updatedAt",
            "version",
          ],
          type: "object",
          properties: {
            type: { type: "string" },
            severity: { type: "string" },
            message: { type: "string" },
            metadataJson: { type: "string" },
            readAt: { type: "string", format: "date-time", nullable: true },
            readBy: { type: "string", format: "uuid", nullable: true },
            id: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            version: { type: "string", format: "uuid" },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      total: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_governance_versions_200: {
    type: "array",
    items: {
      required: [
        "versionNumber",
        "snapshotSchemaVersion",
        "snapshotHash",
        "reason",
        "createdBy",
        "restoredFromVersionId",
        "id",
        "createdAt",
        "updatedAt",
        "version",
      ],
      type: "object",
      properties: {
        versionNumber: { type: "integer" },
        snapshotSchemaVersion: { type: "integer" },
        snapshotHash: { type: "string" },
        reason: { type: "string" },
        createdBy: { type: "string", format: "uuid", nullable: true },
        restoredFromVersionId: {
          type: "string",
          format: "uuid",
          nullable: true,
        },
        id: { type: "string", format: "uuid" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        version: { type: "string", format: "uuid" },
      },
      additionalProperties: false,
    },
  },
  Response_get_api_v1_admin_governance_versions_by_id_200: {
    type: "array",
    items: {
      required: ["type", "key", "json"],
      type: "object",
      properties: {
        type: { type: "string" },
        key: { type: "string" },
        json: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  Response_get_api_v1_admin_governance_versions_by_id_compare_200: {
    required: ["removed", "added"],
    type: "object",
    properties: {
      removed: {
        type: "array",
        items: {
          required: ["type", "key", "json"],
          type: "object",
          properties: {
            type: { type: "string" },
            key: { type: "string" },
            json: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      added: {
        type: "array",
        items: {
          required: ["type", "key", "json"],
          type: "object",
          properties: {
            type: { type: "string" },
            key: { type: "string" },
            json: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_governance_versions_by_id_restore_preview_200: {
    required: ["confirmationToken", "expiresInSeconds", "changes", "policy"],
    type: "object",
    properties: {
      confirmationToken: { type: "string" },
      expiresInSeconds: { type: "integer" },
      changes: {
        required: ["remove", "add"],
        type: "object",
        properties: { remove: { type: "integer" }, add: { type: "integer" } },
        additionalProperties: false,
      },
      policy: { type: "string" },
    },
    additionalProperties: false,
  },
  GovernanceRestoreInput: {
    type: "object",
    properties: {
      reason: { type: "string" },
      confirmationToken: { type: "string" },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_governance_versions_by_id_restore_200: {
    required: ["id", "versionNumber"],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      versionNumber: { type: "integer" },
    },
    additionalProperties: false,
  },
  GovernanceOverviewResponse: {
    type: "object",
    properties: {
      protectedFounders: { type: "integer", format: "int32" },
      activeUsers: { type: "integer", format: "int32" },
      roles: { type: "integer", format: "int32" },
      pendingRequests: { type: "integer", format: "int32" },
      highRiskRequests: { type: "integer", format: "int32" },
      generatedAt: { type: "string", format: "date-time" },
    },
    additionalProperties: false,
  },
  GovernanceRequestPageResponse: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          $ref: "#/components/schemas/GovernanceRequestSummaryResponse",
        },
      },
      page: { type: "integer", format: "int32" },
      pageSize: { type: "integer", format: "int32" },
      totalItems: { type: "integer", format: "int32" },
      totalPages: { type: "integer", format: "int32" },
    },
    additionalProperties: false,
  },
  GovernanceRequestSummaryResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      targetUserId: { type: "string", format: "uuid" },
      requestedById: { type: "string", format: "uuid" },
      addRoleIds: { type: "array", items: { type: "string", format: "uuid" } },
      removeRoleIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
      },
      reason: { type: "string" },
      status: { type: "string" },
      approvalsRequired: { type: "integer", format: "int32" },
      createdAt: { type: "string", format: "date-time" },
      resolvedAt: { type: "string", format: "date-time", nullable: true },
    },
    additionalProperties: false,
  },
  GovernanceAccessRequestInput: {
    type: "object",
    properties: {
      targetUserId: { type: "string", format: "uuid" },
      targetVersion: { type: "string", format: "uuid" },
      addRoleIds: { type: "array", items: { type: "string", format: "uuid" } },
      removeRoleIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
      },
      reason: { type: "string" },
    },
    additionalProperties: false,
  },
  GovernanceRequestDetailResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      targetUserId: { type: "string", format: "uuid" },
      requestedById: { type: "string", format: "uuid" },
      addRoleIds: { type: "array", items: { type: "string", format: "uuid" } },
      removeRoleIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
      },
      reason: { type: "string" },
      status: { type: "string" },
      approvalsRequired: { type: "integer", format: "int32" },
      createdAt: { type: "string", format: "date-time" },
      resolvedAt: { type: "string", format: "date-time", nullable: true },
      decisions: {
        type: "array",
        items: { $ref: "#/components/schemas/GovernanceDecisionResponse" },
      },
    },
    additionalProperties: false,
  },
  GovernanceDecisionResponse: {
    type: "object",
    properties: {
      actorUserId: { type: "string", format: "uuid" },
      decision: { type: "string" },
      note: { type: "string", nullable: true },
      decidedAt: { type: "string", format: "date-time" },
    },
    additionalProperties: false,
  },
  GovernanceAccessDecisionInput: {
    type: "object",
    properties: {
      version: { type: "string", format: "uuid" },
      decision: { type: "string" },
      note: { type: "string", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_system_settings_200: {
    required: ["definitions", "values"],
    type: "object",
    properties: {
      definitions: {
        type: "array",
        items: {
          required: ["key", "min", "max", "defaultValue"],
          type: "object",
          properties: {
            key: { type: "string" },
            min: { type: "integer" },
            max: { type: "integer" },
            defaultValue: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
      values: {
        type: "array",
        items: {
          required: [
            "settingKey",
            "category",
            "valueJson",
            "valueType",
            "updatedBy",
            "id",
            "createdAt",
            "updatedAt",
            "version",
          ],
          type: "object",
          properties: {
            settingKey: { type: "string" },
            category: { type: "string" },
            valueJson: { type: "string" },
            valueType: { type: "string" },
            updatedBy: { type: "string", format: "uuid" },
            id: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            version: { type: "string", format: "uuid" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  SettingInput: {
    type: "object",
    properties: {
      value: {
        description:
          "Domain JSON serialized as its JSON value. Content/block validation is applied by the owning domain.",
      },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_put_api_v1_admin_system_settings_by_key_200: {
    required: [
      "settingKey",
      "category",
      "valueJson",
      "valueType",
      "updatedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      settingKey: { type: "string" },
      category: { type: "string" },
      valueJson: { type: "string" },
      valueType: { type: "string" },
      updatedBy: { type: "string", format: "uuid" },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_health_details_200: {
    required: ["database", "pendingMigrations", "heartbeats", "outboxBacklog"],
    type: "object",
    properties: {
      database: { type: "boolean" },
      pendingMigrations: { type: "integer" },
      heartbeats: {
        type: "array",
        items: {
          required: [
            "name",
            "lastSuccessAt",
            "id",
            "createdAt",
            "updatedAt",
            "version",
          ],
          type: "object",
          properties: {
            name: { type: "string" },
            lastSuccessAt: { type: "string", format: "date-time" },
            id: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            version: { type: "string", format: "uuid" },
          },
          additionalProperties: false,
        },
      },
      outboxBacklog: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_operations_backups_200: {
    required: ["scheduler", "evidence"],
    type: "object",
    properties: {
      scheduler: { type: "string" },
      evidence: {
        type: "array",
        items: {
          required: [
            "name",
            "lastSuccessAt",
            "id",
            "createdAt",
            "updatedAt",
            "version",
          ],
          type: "object",
          properties: {
            name: { type: "string" },
            lastSuccessAt: { type: "string", format: "date-time" },
            id: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            version: { type: "string", format: "uuid" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_operations_restore_verifications_200: {
    type: "array",
    items: {
      required: [
        "backupIdentifier",
        "status",
        "requestedBy",
        "completedAt",
        "databaseRestoreDurationSeconds",
        "checksJson",
        "failedChecksJson",
        "id",
        "createdAt",
        "updatedAt",
        "version",
      ],
      type: "object",
      properties: {
        backupIdentifier: { type: "string" },
        status: { type: "string" },
        requestedBy: { type: "string", format: "uuid" },
        completedAt: { type: "string", format: "date-time", nullable: true },
        databaseRestoreDurationSeconds: { type: "number", nullable: true },
        checksJson: { type: "string" },
        failedChecksJson: { type: "string" },
        id: { type: "string", format: "uuid" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        version: { type: "string", format: "uuid" },
      },
      additionalProperties: false,
    },
  },
  RestoreCheckInput: {
    type: "object",
    properties: { backupIdentifier: { type: "string" } },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_operations_restore_verifications_200: {
    required: ["id", "status", "executor"],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      status: { type: "string" },
      executor: { type: "string" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_search_synonyms_200: {
    type: "array",
    items: {
      required: ["group", "terms"],
      type: "object",
      properties: {
        group: {
          required: [
            "canonicalTerm",
            "language",
            "scope",
            "subjectCatalogItemId",
            "resourceType",
            "status",
            "createdBy",
            "approvedBy",
            "id",
            "createdAt",
            "updatedAt",
            "version",
          ],
          type: "object",
          properties: {
            canonicalTerm: { type: "string" },
            language: { type: "string" },
            scope: { type: "string" },
            subjectCatalogItemId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            resourceType: { type: "string", nullable: true },
            status: { type: "string" },
            createdBy: { type: "string", format: "uuid" },
            approvedBy: { type: "string", format: "uuid", nullable: true },
            id: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            version: { type: "string", format: "uuid" },
          },
          additionalProperties: false,
        },
        terms: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
  },
  SynonymInput: {
    type: "object",
    properties: {
      canonicalTerm: { type: "string" },
      terms: { type: "array", items: { type: "string" } },
      language: { type: "string" },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      resourceType: { type: "string", nullable: true },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_search_synonyms_200: {
    required: [
      "canonicalTerm",
      "language",
      "scope",
      "subjectCatalogItemId",
      "resourceType",
      "status",
      "createdBy",
      "approvedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      canonicalTerm: { type: "string" },
      language: { type: "string" },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      resourceType: { type: "string", nullable: true },
      status: { type: "string" },
      createdBy: { type: "string", format: "uuid" },
      approvedBy: { type: "string", format: "uuid", nullable: true },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_put_api_v1_admin_search_synonyms_by_id_200: {
    required: [
      "canonicalTerm",
      "language",
      "scope",
      "subjectCatalogItemId",
      "resourceType",
      "status",
      "createdBy",
      "approvedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      canonicalTerm: { type: "string" },
      language: { type: "string" },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      resourceType: { type: "string", nullable: true },
      status: { type: "string" },
      createdBy: { type: "string", format: "uuid" },
      approvedBy: { type: "string", format: "uuid", nullable: true },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_search_synonyms_by_id_activate_200: {
    required: [
      "canonicalTerm",
      "language",
      "scope",
      "subjectCatalogItemId",
      "resourceType",
      "status",
      "createdBy",
      "approvedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      canonicalTerm: { type: "string" },
      language: { type: "string" },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      resourceType: { type: "string", nullable: true },
      status: { type: "string" },
      createdBy: { type: "string", format: "uuid" },
      approvedBy: { type: "string", format: "uuid", nullable: true },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_search_synonyms_by_id_archive_200: {
    required: [
      "canonicalTerm",
      "language",
      "scope",
      "subjectCatalogItemId",
      "resourceType",
      "status",
      "createdBy",
      "approvedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      canonicalTerm: { type: "string" },
      language: { type: "string" },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      resourceType: { type: "string", nullable: true },
      status: { type: "string" },
      createdBy: { type: "string", format: "uuid" },
      approvedBy: { type: "string", format: "uuid", nullable: true },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_search_abbreviations_200: {
    type: "array",
    items: {
      required: [
        "abbreviation",
        "normalizedTerm",
        "expandedTermAr",
        "expandedTermEn",
        "scope",
        "subjectCatalogItemId",
        "status",
        "createdBy",
        "approvedBy",
        "id",
        "createdAt",
        "updatedAt",
        "version",
      ],
      type: "object",
      properties: {
        abbreviation: { type: "string" },
        normalizedTerm: { type: "string" },
        expandedTermAr: { type: "string", nullable: true },
        expandedTermEn: { type: "string", nullable: true },
        scope: { type: "string" },
        subjectCatalogItemId: {
          type: "string",
          format: "uuid",
          nullable: true,
        },
        status: { type: "string" },
        createdBy: { type: "string", format: "uuid" },
        approvedBy: { type: "string", format: "uuid", nullable: true },
        id: { type: "string", format: "uuid" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        version: { type: "string", format: "uuid" },
      },
      additionalProperties: false,
    },
  },
  AbbreviationInput: {
    type: "object",
    properties: {
      abbreviation: { type: "string" },
      expandedTermAr: { type: "string", nullable: true },
      expandedTermEn: { type: "string", nullable: true },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      status: { type: "string" },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_search_abbreviations_200: {
    required: [
      "abbreviation",
      "normalizedTerm",
      "expandedTermAr",
      "expandedTermEn",
      "scope",
      "subjectCatalogItemId",
      "status",
      "createdBy",
      "approvedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      abbreviation: { type: "string" },
      normalizedTerm: { type: "string" },
      expandedTermAr: { type: "string", nullable: true },
      expandedTermEn: { type: "string", nullable: true },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      status: { type: "string" },
      createdBy: { type: "string", format: "uuid" },
      approvedBy: { type: "string", format: "uuid", nullable: true },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_put_api_v1_admin_search_abbreviations_by_id_200: {
    required: [
      "abbreviation",
      "normalizedTerm",
      "expandedTermAr",
      "expandedTermEn",
      "scope",
      "subjectCatalogItemId",
      "status",
      "createdBy",
      "approvedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      abbreviation: { type: "string" },
      normalizedTerm: { type: "string" },
      expandedTermAr: { type: "string", nullable: true },
      expandedTermEn: { type: "string", nullable: true },
      scope: { type: "string" },
      subjectCatalogItemId: { type: "string", format: "uuid", nullable: true },
      status: { type: "string" },
      createdBy: { type: "string", format: "uuid" },
      approvedBy: { type: "string", format: "uuid", nullable: true },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  QueryApprovalInput: {
    type: "object",
    properties: { query: { type: "string" }, approved: { type: "boolean" } },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_search_query_approvals_200: {
    required: [
      "normalizedQuery",
      "approved",
      "reviewedBy",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      normalizedQuery: { type: "string" },
      approved: { type: "boolean" },
      reviewedBy: { type: "string", format: "uuid" },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_search_top_queries_200: {
    type: "array",
    items: {
      required: ["query", "count"],
      type: "object",
      properties: {
        query: { type: "string", nullable: true },
        count: { type: "integer" },
      },
      additionalProperties: false,
    },
  },
  Response_get_api_v1_admin_search_zero_results_200: {
    type: "array",
    items: {
      required: ["query", "count"],
      type: "object",
      properties: {
        query: { type: "string", nullable: true },
        count: { type: "integer" },
      },
      additionalProperties: false,
    },
  },
  ReindexInput: {
    type: "object",
    properties: {
      scopeType: { type: "string" },
      resourceType: { type: "string", nullable: true },
      resourceId: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_search_reindex_200: {
    required: ["id", "status"],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      status: { type: "string" },
    },
    additionalProperties: false,
  },
  Response_post_api_v1_admin_search_reindex_by_id_resume_200: {
    required: ["id", "status", "processedCount"],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      status: { type: "string" },
      processedCount: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_search_reindex_by_id_200: {
    required: [
      "scopeType",
      "resourceType",
      "resourceId",
      "status",
      "requestedBy",
      "sourceIndex",
      "cursor",
      "processedCount",
      "failedCount",
      "errorSummary",
      "startedAt",
      "completedAt",
      "id",
      "createdAt",
      "updatedAt",
      "version",
    ],
    type: "object",
    properties: {
      scopeType: { type: "string" },
      resourceType: { type: "string", nullable: true },
      resourceId: { type: "string", format: "uuid", nullable: true },
      status: { type: "string" },
      requestedBy: { type: "string", format: "uuid" },
      sourceIndex: { type: "integer" },
      cursor: { type: "string", format: "uuid", nullable: true },
      processedCount: { type: "integer" },
      failedCount: { type: "integer" },
      errorSummary: { type: "string", nullable: true },
      startedAt: { type: "string", format: "date-time", nullable: true },
      completedAt: { type: "string", format: "date-time", nullable: true },
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
    nullable: true,
  },
};
