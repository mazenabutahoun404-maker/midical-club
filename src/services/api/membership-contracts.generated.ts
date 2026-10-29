export const membershipRoutes: Record<
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
  get_api_v1_mentorship_areas: {
    method: "GET",
    path: "/api/v1/mentorship/areas",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentorship_areas_200",
    },
    status: 200,
    parameters: [],
    permission: null,
    summary: "List areas for mentorship",
    description:
      "List areas for mentorship.\n\nNo bearer token is required by this endpoint. Access rule: Anonymous.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_mentorship_areas: {
    method: "GET",
    path: "/api/v1/admin/mentorship/areas",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_mentorship_areas_200",
    },
    status: 200,
    parameters: [],
    permission: "mentorship.areas.manage",
    summary: "List areas for mentorship",
    description:
      "List areas for mentorship.\n\nRequires a bearer access token. Access rule: mentorship.areas.manage.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_mentorship_areas: {
    method: "POST",
    path: "/api/v1/admin/mentorship/areas",
    body: { $ref: "#/components/schemas/EngagementCategoryRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.areas.manage",
    summary: "Create area for mentorship",
    description:
      "Create area for mentorship.\n\nRequires a bearer access token. Access rule: mentorship.areas.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  put_api_v1_admin_mentorship_areas_by_id: {
    method: "PUT",
    path: "/api/v1/admin/mentorship/areas/{id}",
    body: { $ref: "#/components/schemas/EngagementCategoryRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.areas.manage",
    summary: "Update area for mentorship",
    description:
      "Update area for mentorship.\n\nRequires a bearer access token. Access rule: mentorship.areas.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_mentors: {
    method: "GET",
    path: "/api/v1/mentors",
    body: null,
    response: { $ref: "#/components/schemas/Response_get_api_v1_mentors_200" },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List mentors",
    description:
      "List mentors.\n\nNo bearer token is required by this endpoint. Access rule: Anonymous; published only.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_mentors_by_id: {
    method: "GET",
    path: "/api/v1/mentors/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentors_by_id_200",
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
    summary: "Get mentor",
    description:
      "Get mentor.\n\nNo bearer token is required by this endpoint. Access rule: Anonymous; published only.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_mentor_profile: {
    method: "POST",
    path: "/api/v1/mentor/profile",
    body: { $ref: "#/components/schemas/MentorRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Create profile for mentor",
    description:
      "Create profile for mentor.\n\nRequires a bearer access token. Access rule: Eligible account; pending approval.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  put_api_v1_mentor_profile_by_id: {
    method: "PUT",
    path: "/api/v1/mentor/profile/{id}",
    body: { $ref: "#/components/schemas/MentorRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Update profile for mentor",
    description:
      "Update profile for mentor.\n\nRequires a bearer access token. Access rule: Owner; resubmits for approval.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_admin_mentors: {
    method: "GET",
    path: "/api/v1/admin/mentors",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_mentors_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    permission: "mentorship.view_admin",
    summary: "List mentors",
    description:
      "List mentors.\n\nRequires a bearer access token. Access rule: mentorship.view_admin.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_mentors: {
    method: "POST",
    path: "/api/v1/admin/mentors",
    body: { $ref: "#/components/schemas/MentorRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.mentors.approve",
    summary: "Create mentor",
    description:
      "Create mentor.\n\nRequires a bearer access token. Access rule: mentorship.mentors.approve.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_admin_mentors_by_id: {
    method: "GET",
    path: "/api/v1/admin/mentors/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_mentors_by_id_200",
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
    permission: "mentorship.view_admin",
    summary: "Get mentor",
    description:
      "Get mentor.\n\nRequires a bearer access token. Access rule: mentorship.view_admin.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  put_api_v1_admin_mentors_by_id: {
    method: "PUT",
    path: "/api/v1/admin/mentors/{id}",
    body: { $ref: "#/components/schemas/MentorRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.mentors.approve",
    summary: "Update mentor",
    description:
      "Update mentor.\n\nRequires a bearer access token. Access rule: mentorship.mentors.approve.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_mentors_by_id_approve: {
    method: "POST",
    path: "/api/v1/admin/mentors/{id}/approve",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.mentors.approve",
    summary: "Approve mentor",
    description:
      "Approve mentor.\n\nRequires a bearer access token. Access rule: mentorship.mentors.approve.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_mentors_by_id_pause: {
    method: "POST",
    path: "/api/v1/admin/mentors/{id}/pause",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.mentors.pause",
    summary: "Pause mentor",
    description:
      "Pause mentor.\n\nRequires a bearer access token. Access rule: mentorship.mentors.pause.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_mentors_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/mentors/{id}/archive",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.mentors.pause",
    summary: "Archive mentor",
    description:
      "Archive mentor.\n\nRequires a bearer access token. Access rule: mentorship.mentors.pause.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_mentors_by_id_availability: {
    method: "GET",
    path: "/api/v1/mentors/{id}/availability",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentors_by_id_availability_200",
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
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List available mentor time slots",
    description:
      "List available mentor time slots.\n\nNo bearer token is required by this endpoint. Access rule: Anonymous; no meeting details.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_mentor_by_id_questions: {
    method: "POST",
    path: "/api/v1/mentor/{id}/questions",
    body: { $ref: "#/components/schemas/DynamicQuestionRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Create question for mentor",
    description:
      "Create question for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  put_api_v1_mentor_by_id_questions_by_questionId: {
    method: "PUT",
    path: "/api/v1/mentor/{id}/questions/{questionId}",
    body: { $ref: "#/components/schemas/DynamicQuestionRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
        name: "questionId",
        in: "path",
        description: "Identifies the question id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Update question for mentor",
    description:
      "Update question for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_mentorship_questions: {
    method: "POST",
    path: "/api/v1/admin/mentorship/questions",
    body: { $ref: "#/components/schemas/DynamicQuestionRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.sessions.manage",
    summary: "Create question for mentorship",
    description:
      "Create question for mentorship.\n\nRequires a bearer access token. Access rule: mentorship.sessions.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_mentorship_public_qa: {
    method: "GET",
    path: "/api/v1/mentorship/public-qa",
    body: null,
    response: {
      $ref: "#/components/schemas/PublicQuestionResponseStageFourPageResponse",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List public mentor answers",
    description:
      "Lists independently reviewed and published bilingual mentorship answers.",
  },
  get_api_v1_admin_mentorship_public_qa: {
    method: "GET",
    path: "/api/v1/admin/mentorship/public-qa",
    body: null,
    response: {
      $ref: "#/components/schemas/PublicQuestionResponseStageFourPageResponse",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    permission: "mentorship.sessions.manage",
    summary: "List mentor answer drafts",
    description:
      "Requires mentorship.sessions.manage; optional status filter includes unpublished answers.",
  },
  post_api_v1_admin_mentorship_public_qa: {
    method: "POST",
    path: "/api/v1/admin/mentorship/public-qa",
    body: { $ref: "#/components/schemas/PublicMentorshipQuestionRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.sessions.manage",
    summary: "Create mentor answer draft",
    description:
      "Requires mentorship.sessions.manage and Idempotency-Key. The referenced mentor must be published.",
  },
  put_api_v1_admin_mentorship_public_qa_by_id: {
    method: "PUT",
    path: "/api/v1/admin/mentorship/public-qa/{id}",
    body: { $ref: "#/components/schemas/PublicMentorshipQuestionRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.sessions.manage",
    summary: "Update mentor answer draft",
    description:
      "Requires mentorship.sessions.manage, a current version and Idempotency-Key. Published answers cannot be edited.",
  },
  post_api_v1_admin_mentorship_public_qa_by_id_publish: {
    method: "POST",
    path: "/api/v1/admin/mentorship/public-qa/{id}/publish",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.mentors.approve",
    summary: "Publish mentor answer",
    description:
      "Requires mentorship.mentors.approve, a current version and an independent reviewer.",
  },
  post_api_v1_admin_mentorship_public_qa_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/mentorship/public-qa/{id}/archive",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "mentorship.mentors.approve",
    summary: "Archive mentor answer",
    description:
      "Requires mentorship.mentors.approve, a current version and a reason.",
  },
  post_api_v1_mentor_availability: {
    method: "POST",
    path: "/api/v1/mentor/availability",
    body: { $ref: "#/components/schemas/MentorSlotRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Create a mentor time slot",
    description:
      "Create a mentor time slot.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  put_api_v1_mentor_availability_by_id: {
    method: "PUT",
    path: "/api/v1/mentor/availability/{id}",
    body: { $ref: "#/components/schemas/MentorSlotRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Update a mentor time slot",
    description:
      "Update a mentor time slot.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_mentorship_requests: {
    method: "POST",
    path: "/api/v1/mentorship/requests",
    body: { $ref: "#/components/schemas/MentorshipRequestInput" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Create request for mentorship",
    description:
      "Create request for mentorship.\n\nRequires a bearer access token. Access rule: Verified student; self request forbidden.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_mentorship_requests_my: {
    method: "GET",
    path: "/api/v1/mentorship/requests/my",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentorship_requests_my_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List my requests for mentorship",
    description:
      "List my requests for mentorship.\n\nRequires a bearer access token. Access rule: Owner.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_mentorship_sessions_my: {
    method: "GET",
    path: "/api/v1/mentorship/sessions/my",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentorship_sessions_my_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List my sessions for mentorship",
    description:
      "List my sessions for mentorship.\n\nRequires a bearer access token. Access rule: Participant; secrets for accepted participants only.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_mentorship_group_sessions: {
    method: "GET",
    path: "/api/v1/mentorship/group-sessions",
    body: null,
    response: {
      $ref: "#/components/schemas/GroupSessionResponseStageFourPageResponse",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List group sessions",
    description:
      "Lists published future group slots with capacity and bilingual presentation; meeting secrets are omitted.",
  },
  get_api_v1_mentorship_group_sessions_my: {
    method: "GET",
    path: "/api/v1/mentorship/group-sessions/my",
    body: null,
    response: {
      $ref: "#/components/schemas/GroupRegistrationResponseStageFourPageResponse",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List my group registrations",
    description:
      "Returns owned group registrations and current participation status.",
  },
  post_api_v1_mentorship_group_sessions_by_slotId_register: {
    method: "POST",
    path: "/api/v1/mentorship/group-sessions/{slotId}/register",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/GroupRegistrationActionResponse" },
    status: 200,
    parameters: [
      {
        name: "slotId",
        in: "path",
        description: "Identifies the slot id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Register for group session",
    description:
      "Requires a verified student, current slot version and Idempotency-Key. Capacity and eligibility are checked under a row lock.",
  },
  post_api_v1_mentorship_group_sessions_by_slotId_cancel: {
    method: "POST",
    path: "/api/v1/mentorship/group-sessions/{slotId}/cancel",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/GroupCancellationResponse" },
    status: 200,
    parameters: [
      {
        name: "slotId",
        in: "path",
        description: "Identifies the slot id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Cancel group registration",
    description:
      "Cancels the owned direct group registration using its current version and a unique Idempotency-Key.",
  },
  get_api_v1_mentor_requests: {
    method: "GET",
    path: "/api/v1/mentor/requests",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentor_requests_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List requests for mentor",
    description:
      "List requests for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_mentor_sessions: {
    method: "GET",
    path: "/api/v1/mentor/sessions",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentor_sessions_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List sessions for mentor",
    description:
      "List sessions for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_mentor_requests_by_id_accept: {
    method: "POST",
    path: "/api/v1/mentor/requests/{id}/accept",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Accept request for mentor",
    description:
      "Accept request for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage; slot row locked.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_mentor_requests_by_id_reject: {
    method: "POST",
    path: "/api/v1/mentor/requests/{id}/reject",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Reject request for mentor",
    description:
      "Reject request for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage; slot row locked.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_mentorship_requests_by_id_withdraw: {
    method: "POST",
    path: "/api/v1/mentorship/requests/{id}/withdraw",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Withdraw request for mentorship",
    description:
      "Withdraw request for mentorship.\n\nRequires a bearer access token. Access rule: Owner.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_mentorship_sessions_by_id_cancel: {
    method: "POST",
    path: "/api/v1/mentorship/sessions/{id}/cancel",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Cancel session for mentorship",
    description:
      "Cancel session for mentorship.\n\nRequires a bearer access token. Access rule: Confirmed participant, mentor or authorized administrator.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_mentor_sessions_by_id_complete: {
    method: "POST",
    path: "/api/v1/mentor/sessions/{id}/complete",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Complete session for mentor",
    description:
      "Complete session for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner or mentorship.sessions.manage.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_mentorship_sessions_by_id_feedback: {
    method: "POST",
    path: "/api/v1/mentorship/sessions/{id}/feedback",
    body: { $ref: "#/components/schemas/FeedbackRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Create feedback for mentorship session",
    description:
      "Create feedback for mentorship session.\n\nRequires a bearer access token. Access rule: Completed-session participant; private feedback.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_mentor_by_id_feedback: {
    method: "GET",
    path: "/api/v1/mentor/{id}/feedback",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_mentor_by_id_feedback_200",
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
    summary: "List feedback for mentor",
    description:
      "List feedback for mentor.\n\nRequires a bearer access token. Access rule: Mentor owner; aggregate and consented comments.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_mentors_by_id_feedback: {
    method: "GET",
    path: "/api/v1/admin/mentors/{id}/feedback",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_mentors_by_id_feedback_200",
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
    permission: "mentorship.reports.view",
    summary: "List feedback for mentor",
    description:
      "List feedback for mentor.\n\nRequires a bearer access token. Access rule: mentorship.reports.view.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_team_recruitment_openings: {
    method: "GET",
    path: "/api/v1/team-recruitment/openings",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_team_recruitment_openings_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List openings for team recruitment",
    description:
      "List openings for team recruitment.\n\nRequires a bearer access token. Access rule: Verified account.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_team_recruitment_openings_by_id: {
    method: "GET",
    path: "/api/v1/team-recruitment/openings/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_team_recruitment_openings_by_id_200",
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
    summary: "Get opening for team recruitment",
    description:
      "Get opening for team recruitment.\n\nRequires a bearer access token. Access rule: Verified account; currently open.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_team_recruitment_openings_by_id_apply: {
    method: "POST",
    path: "/api/v1/team-recruitment/openings/{id}/apply",
    body: { $ref: "#/components/schemas/ApplicationRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Apply for a team opening",
    description:
      "Apply for a team opening.\n\nRequires a bearer access token. Access rule: Verified student; one active request.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.\n\nCreates an application for an open recruitment opportunity; acceptance does not grant roles or administrative permissions.",
  },
  post_api_v1_team_applications_drafts: {
    method: "POST",
    path: "/api/v1/team-applications/drafts",
    body: { $ref: "#/components/schemas/RecruitmentApplicationDraftRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Create application draft",
    description:
      "Persists a private student draft for an eligible open recruitment position. Supply Idempotency-Key.",
  },
  put_api_v1_team_applications_drafts_by_id: {
    method: "PUT",
    path: "/api/v1/team-applications/drafts/{id}",
    body: { $ref: "#/components/schemas/RecruitmentApplicationDraftRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Update application draft",
    description:
      "Updates the owned private draft using its current version and Idempotency-Key.",
  },
  post_api_v1_team_applications_drafts_by_id_submit: {
    method: "POST",
    path: "/api/v1/team-applications/drafts/{id}/submit",
    body: { $ref: "#/components/schemas/RecruitmentDraftSubmissionRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Submit application draft",
    description:
      "Rechecks position eligibility, consent, required text, active questions and answers before sealing submission. Supply the draft version and Idempotency-Key.",
  },
  get_api_v1_team_applications_my: {
    method: "GET",
    path: "/api/v1/team-applications/my",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_team_applications_my_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List my team applications",
    description:
      "List my team applications.\n\nRequires a bearer access token. Access rule: Owner.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_team_applications_my_by_id: {
    method: "GET",
    path: "/api/v1/team-applications/my/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_team_applications_my_by_id_200",
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
    summary: "Get my team application",
    description:
      "Get my team application.\n\nRequires a bearer access token. Access rule: Owner; internal notes omitted.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_team_applications_my_by_id_withdraw: {
    method: "POST",
    path: "/api/v1/team-applications/my/{id}/withdraw",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Withdraw my team application",
    description:
      "Withdraw my team application.\n\nRequires a bearer access token. Access rule: Owner.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle: {
    method: "POST",
    path: "/api/v1/team-applications/my/{id}/onboarding-tasks/{taskId}/toggle",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/OnboardingClaimResponse" },
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
        name: "taskId",
        in: "path",
        description: "Identifies the task id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Toggle onboarding task claim",
    description:
      "The accepted applicant claims or unclaims a pending task; an administrator separately verifies completion. Requires the task version and Idempotency-Key.",
  },
  get_api_v1_admin_teams_by_teamId_recruitment_openings: {
    method: "GET",
    path: "/api/v1/admin/teams/{teamId}/recruitment/openings",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_teams_by_teamId_recruitment_openings_200",
    },
    status: 200,
    parameters: [
      {
        name: "teamId",
        in: "path",
        description: "Identifies the team id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    permission: "recruitment.openings.manage",
    summary: "List openings for team recruitment",
    description:
      "List openings for team recruitment.\n\nRequires a bearer access token. Access rule: recruitment.openings.manage scoped to team.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_teams_by_teamId_recruitment_openings: {
    method: "POST",
    path: "/api/v1/admin/teams/{teamId}/recruitment/openings",
    body: { $ref: "#/components/schemas/RecruitmentOpeningRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "teamId",
        in: "path",
        description: "Identifies the team id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.openings.manage",
    summary: "Create opening for team recruitment",
    description:
      "Create opening for team recruitment.\n\nRequires a bearer access token. Access rule: recruitment.openings.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_admin_recruitment_openings_by_id: {
    method: "GET",
    path: "/api/v1/admin/recruitment/openings/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_recruitment_openings_by_id_200",
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
    permission: "recruitment.openings.manage",
    summary: "Get opening for recruitment",
    description:
      "Get opening for recruitment.\n\nRequires a bearer access token. Access rule: recruitment.openings.manage scoped to team.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  put_api_v1_admin_recruitment_openings_by_id: {
    method: "PUT",
    path: "/api/v1/admin/recruitment/openings/{id}",
    body: { $ref: "#/components/schemas/RecruitmentOpeningRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.openings.manage",
    summary: "Update opening for recruitment",
    description:
      "Update opening for recruitment.\n\nRequires a bearer access token. Access rule: recruitment.openings.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_recruitment_openings_by_id_open: {
    method: "POST",
    path: "/api/v1/admin/recruitment/openings/{id}/open",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.openings.manage",
    summary: "Open a recruitment opportunity for applications",
    description:
      "Open a recruitment opportunity for applications.\n\nRequires a bearer access token. Access rule: recruitment.openings.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_recruitment_openings_by_id_close: {
    method: "POST",
    path: "/api/v1/admin/recruitment/openings/{id}/close",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.openings.manage",
    summary: "Close opening for recruitment",
    description:
      "Close opening for recruitment.\n\nRequires a bearer access token. Access rule: recruitment.openings.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_recruitment_openings_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/recruitment/openings/{id}/archive",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.openings.manage",
    summary: "Archive opening for recruitment",
    description:
      "Archive opening for recruitment.\n\nRequires a bearer access token. Access rule: recruitment.openings.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_admin_recruitment_openings_by_id_applications: {
    method: "GET",
    path: "/api/v1/admin/recruitment/openings/{id}/applications",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_recruitment_openings_by_id_applications_200",
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
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    permission: "recruitment.applications.view",
    summary: "List applications for recruitment opening",
    description:
      "List applications for recruitment opening.\n\nRequires a bearer access token. Access rule: recruitment.applications.view scoped to team.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_team_applications_by_id: {
    method: "GET",
    path: "/api/v1/admin/team-applications/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_team_applications_by_id_200",
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
    permission: "recruitment.applications.view",
    summary: "Get team application",
    description:
      "Get team application.\n\nRequires a bearer access token. Access rule: recruitment.applications.view scoped to team.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_team_applications_by_id_transition: {
    method: "POST",
    path: "/api/v1/admin/team-applications/{id}/transition",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Change the review stage of team application",
    description:
      "Change the review stage of team application.\n\nRequires a bearer access token.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_team_applications_by_id_interviews: {
    method: "POST",
    path: "/api/v1/admin/team-applications/{id}/interviews",
    body: { $ref: "#/components/schemas/InterviewRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.interviews.manage",
    summary: "Create interview for team application",
    description:
      "Create interview for team application.\n\nRequires a bearer access token. Access rule: recruitment.interviews.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  put_api_v1_admin_application_interviews_by_id: {
    method: "PUT",
    path: "/api/v1/admin/application-interviews/{id}",
    body: { $ref: "#/components/schemas/InterviewRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.interviews.manage",
    summary: "Update application interview",
    description:
      "Update application interview.\n\nRequires a bearer access token. Access rule: recruitment.interviews.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_member_profiles: {
    method: "GET",
    path: "/api/v1/member-profiles",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_member_profiles_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List member profiles",
    description:
      "List member profiles.\n\nNo bearer token is required by this endpoint. Access rule: Anonymous; active public consent only.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_member_profiles_my: {
    method: "GET",
    path: "/api/v1/member-profiles/my",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_member_profiles_my_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "List my member profiles",
    description:
      "List my member profiles.\n\nRequires a bearer access token. Access rule: Owner.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_member_profiles_my_by_id: {
    method: "GET",
    path: "/api/v1/member-profiles/my/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_member_profiles_my_by_id_200",
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
    summary: "Get my member profile",
    description:
      "Get my member profile.\n\nRequires a bearer access token. Access rule: Owner.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_member_profiles_by_id: {
    method: "GET",
    path: "/api/v1/member-profiles/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_member_profiles_by_id_200",
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
    summary: "Get member profile",
    description:
      "Get member profile.\n\nNo bearer token is required by this endpoint. Access rule: Anonymous; active public consent only.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  put_api_v1_member_profiles_my_public_visibility: {
    method: "PUT",
    path: "/api/v1/member-profiles/my/public-visibility",
    body: { $ref: "#/components/schemas/MemberConsentRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: null,
    summary: "Update my public visibility for member profile",
    description:
      "Update my public visibility for member profile.\n\nRequires a bearer access token. Access rule: Owner; explicit consent.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_admin_teams_by_teamId_members_profiles: {
    method: "GET",
    path: "/api/v1/admin/teams/{teamId}/members/profiles",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_teams_by_teamId_members_profiles_200",
    },
    status: 200,
    parameters: [
      {
        name: "teamId",
        in: "path",
        description: "Identifies the team id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    permission: "member_profiles.view_admin",
    summary: "List profiles for team member",
    description:
      "List profiles for team member.\n\nRequires a bearer access token. Access rule: member_profiles.view_admin scoped to team.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_admin_member_profiles_by_id: {
    method: "GET",
    path: "/api/v1/admin/member-profiles/{id}",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_member_profiles_by_id_200",
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
    permission: "member_profiles.view_admin",
    summary: "Get member profile",
    description:
      "Get member profile.\n\nRequires a bearer access token. Access rule: member_profiles.view_admin scoped to team.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  put_api_v1_admin_member_profiles_by_id: {
    method: "PUT",
    path: "/api/v1/admin/member-profiles/{id}",
    body: { $ref: "#/components/schemas/MemberProfileRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "member_profiles.manage",
    summary: "Update member profile",
    description:
      "Update member profile.\n\nRequires a bearer access token. Access rule: member_profiles.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_member_profiles_by_id_positions: {
    method: "POST",
    path: "/api/v1/admin/member-profiles/{id}/positions",
    body: { $ref: "#/components/schemas/MemberPositionRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "member_profiles.positions.manage",
    summary: "Create position for member profile",
    description:
      "Create position for member profile.\n\nRequires a bearer access token. Access rule: member_profiles.positions.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete: {
    method: "POST",
    path: "/api/v1/admin/member-profiles/{id}/onboarding/{taskId}/complete",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
        name: "taskId",
        in: "path",
        description: "Identifies the task id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.onboarding.manage",
    summary: "Complete a member onboarding task",
    description:
      "Complete a member onboarding task.\n\nRequires a bearer access token. Access rule: recruitment.onboarding.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive: {
    method: "POST",
    path: "/api/v1/admin/member-profiles/{id}/onboarding/{taskId}/waive",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
        name: "taskId",
        in: "path",
        description: "Identifies the task id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.onboarding.manage",
    summary: "Waive a member onboarding task",
    description:
      "Waive a member onboarding task.\n\nRequires a bearer access token. Access rule: recruitment.onboarding.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  post_api_v1_admin_member_profiles_by_id_activate: {
    method: "POST",
    path: "/api/v1/admin/member-profiles/{id}/activate",
    body: { $ref: "#/components/schemas/EngagementAction" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.onboarding.manage",
    summary: "Activate member profile",
    description:
      "Activate member profile.\n\nRequires a bearer access token. Access rule: recruitment.onboarding.manage scoped to team; never grants permissions.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_admin_teams_by_teamId_onboarding_templates: {
    method: "GET",
    path: "/api/v1/admin/teams/{teamId}/onboarding-templates",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_admin_teams_by_teamId_onboarding_templates_200",
    },
    status: 200,
    parameters: [
      {
        name: "teamId",
        in: "path",
        description: "Identifies the team id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    permission: "recruitment.onboarding.manage",
    summary: "List onboarding templates for team",
    description:
      "List onboarding templates for team.\n\nRequires a bearer access token. Access rule: recruitment.onboarding.manage scoped to team.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  post_api_v1_admin_teams_by_teamId_onboarding_templates: {
    method: "POST",
    path: "/api/v1/admin/teams/{teamId}/onboarding-templates",
    body: { $ref: "#/components/schemas/OnboardingTemplateRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "teamId",
        in: "path",
        description: "Identifies the team id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.onboarding.manage",
    summary: "Create onboarding template for team",
    description:
      "Create onboarding template for team.\n\nRequires a bearer access token. Access rule: recruitment.onboarding.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id: {
    method: "PUT",
    path: "/api/v1/admin/teams/{teamId}/onboarding-templates/{id}",
    body: { $ref: "#/components/schemas/OnboardingTemplateRequest" },
    response: { $ref: "#/components/schemas/EntityVersionResponse" },
    status: 200,
    parameters: [
      {
        name: "teamId",
        in: "path",
        description: "Identifies the team id in this route.",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
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
          "Unique per actor/command; reuse exactly for retry. Changed payload with same key returns 409.",
        required: true,
        schema: { maxLength: 128, type: "string" },
      },
    ],
    permission: "recruitment.onboarding.manage",
    summary: "Update onboarding template for team",
    description:
      "Update onboarding template for team.\n\nRequires a bearer access token. Access rule: recruitment.onboarding.manage scoped to team.\n\nSupply `Idempotency-Key` for this command; follow its header description for retry behavior.",
  },
  get_api_v1_engagement_search: {
    method: "GET",
    path: "/api/v1/engagement/search",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_engagement_search_200",
    },
    status: 200,
    parameters: [
      {
        name: "Status",
        in: "query",
        description:
          "Filter or option: status. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "TypeId",
        in: "query",
        description:
          "Filter or option: type id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Type",
        in: "query",
        description:
          "Filter or option: type. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
      {
        name: "SubjectId",
        in: "query",
        description:
          "Filter or option: subject id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "OfferingId",
        in: "query",
        description:
          "Filter or option: offering id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "BatchId",
        in: "query",
        description:
          "Filter or option: batch id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AcademicYearId",
        in: "query",
        description:
          "Filter or option: academic year id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "ReviewerId",
        in: "query",
        description:
          "Filter or option: reviewer id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "AuthorId",
        in: "query",
        description:
          "Filter or option: author id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Overdue",
        in: "query",
        description:
          "Filter or option: overdue. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "boolean" },
      },
      {
        name: "AreaId",
        in: "query",
        description:
          "Filter or option: area id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "TeamId",
        in: "query",
        description:
          "Filter or option: team id. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "Q",
        in: "query",
        description:
          "Filter or option: q. Its schema shows the accepted type and any declared constraints.",
        schema: { type: "string" },
      },
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
    summary: "Search contributions, opportunities and mentors",
    description:
      "Search contributions, opportunities and mentors.\n\nRequires a bearer access token. Access rule: Visibility rechecked for each resource.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
  get_api_v1_engagement_dashboard: {
    method: "GET",
    path: "/api/v1/engagement/dashboard",
    body: null,
    response: {
      $ref: "#/components/schemas/Response_get_api_v1_engagement_dashboard_200",
    },
    status: 200,
    parameters: [],
    permission: null,
    summary: "Get my engagement dashboard",
    description:
      "Get my engagement dashboard.\n\nRequires a bearer access token. Access rule: Owner, verified account.\n\nResponse contract: Exact serialized projection traced through the controller and service return expressions; runtime JSON is unchanged.",
  },
};
export const membershipSchemas: Record<string, unknown> = {
  Response_get_api_v1_mentorship_areas_200: {
    anyOf: [
      {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "nameAr",
            "nameEn",
            "slug",
            "status",
            "displayOrder",
            "descriptionAr",
            "descriptionEn",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            nameAr: { type: "string" },
            nameEn: { type: "string", nullable: true },
            slug: { type: "string" },
            status: { type: "string" },
            displayOrder: { type: "integer" },
            descriptionAr: { type: "string", nullable: true },
            descriptionEn: { type: "string", nullable: true },
          },
          additionalProperties: false,
        },
      },
      {
        type: "array",
        items: {
          required: ["id", "version", "nameAr", "nameEn", "slug", "status"],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            nameAr: { type: "string" },
            nameEn: { type: "string", nullable: true },
            slug: { type: "string" },
            status: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    ],
  },
  Response_get_api_v1_admin_mentorship_areas_200: {
    anyOf: [
      {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "nameAr",
            "nameEn",
            "slug",
            "status",
            "displayOrder",
            "descriptionAr",
            "descriptionEn",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            nameAr: { type: "string" },
            nameEn: { type: "string", nullable: true },
            slug: { type: "string" },
            status: { type: "string" },
            displayOrder: { type: "integer" },
            descriptionAr: { type: "string", nullable: true },
            descriptionEn: { type: "string", nullable: true },
          },
          additionalProperties: false,
        },
      },
      {
        type: "array",
        items: {
          required: ["id", "version", "nameAr", "nameEn", "slug", "status"],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            nameAr: { type: "string" },
            nameEn: { type: "string", nullable: true },
            slug: { type: "string" },
            status: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    ],
  },
  EngagementCategoryRequest: {
    type: "object",
    properties: {
      nameAr: { type: "string" },
      slug: { type: "string" },
      nameEn: { type: "string", nullable: true },
      descriptionAr: { type: "string", nullable: true },
      descriptionEn: { type: "string", nullable: true },
      displayOrder: { type: "integer", format: "int32" },
      status: { type: "string" },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  EntityVersionResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentors_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "displayNameSnapshot",
            "batchSnapshot",
            "specialtyAr",
            "specialtyEn",
            "workplaceAr",
            "workplaceEn",
            "bioAr",
            "bioEn",
            "supportsIndividual",
            "supportsGroup",
            "supportsOnline",
            "supportsInPerson",
            "status",
            "defaultCapacity",
            "presentationJson",
            "activeMentees",
            "areas",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            displayNameSnapshot: { type: "string" },
            batchSnapshot: { type: "string", nullable: true },
            specialtyAr: { type: "string", nullable: true },
            specialtyEn: { type: "string", nullable: true },
            workplaceAr: { type: "string", nullable: true },
            workplaceEn: { type: "string", nullable: true },
            bioAr: { type: "string" },
            bioEn: { type: "string", nullable: true },
            supportsIndividual: { type: "boolean" },
            supportsGroup: { type: "boolean" },
            supportsOnline: { type: "boolean" },
            supportsInPerson: { type: "boolean" },
            status: { type: "string" },
            defaultCapacity: { type: "integer" },
            presentationJson: { type: "string" },
            activeMentees: { type: "integer" },
            areas: { type: "array", items: { type: "string", format: "uuid" } },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentors_by_id_200: {
    required: [
      "id",
      "version",
      "displayNameSnapshot",
      "batchSnapshot",
      "specialtyAr",
      "specialtyEn",
      "workplaceAr",
      "workplaceEn",
      "bioAr",
      "bioEn",
      "supportsIndividual",
      "supportsGroup",
      "supportsOnline",
      "supportsInPerson",
      "status",
      "defaultCapacity",
      "presentationJson",
      "activeMentees",
      "areas",
      "questions",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      displayNameSnapshot: { type: "string" },
      batchSnapshot: { type: "string", nullable: true },
      specialtyAr: { type: "string", nullable: true },
      specialtyEn: { type: "string", nullable: true },
      workplaceAr: { type: "string", nullable: true },
      workplaceEn: { type: "string", nullable: true },
      bioAr: { type: "string" },
      bioEn: { type: "string", nullable: true },
      supportsIndividual: { type: "boolean" },
      supportsGroup: { type: "boolean" },
      supportsOnline: { type: "boolean" },
      supportsInPerson: { type: "boolean" },
      status: { type: "string" },
      defaultCapacity: { type: "integer" },
      presentationJson: { type: "string" },
      activeMentees: { type: "integer" },
      areas: { type: "array", items: { type: "string", format: "uuid" } },
      questions: {
        type: "array",
        items: {
          required: [
            "id",
            "textAr",
            "textEn",
            "type",
            "required",
            "optionsJson",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            textAr: { type: "string" },
            textEn: { type: "string", nullable: true },
            type: { type: "string" },
            required: { type: "boolean" },
            optionsJson: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  MentorRequest: {
    type: "object",
    properties: {
      bioAr: { type: "string" },
      userId: { type: "string", format: "uuid", nullable: true },
      alumniProfileId: { type: "string", format: "uuid", nullable: true },
      bioEn: { type: "string", nullable: true },
      specialtyAr: { type: "string", nullable: true },
      specialtyEn: { type: "string", nullable: true },
      workplaceAr: { type: "string", nullable: true },
      workplaceEn: { type: "string", nullable: true },
      supportsIndividual: { type: "boolean" },
      supportsGroup: { type: "boolean" },
      supportsOnline: { type: "boolean" },
      supportsInPerson: { type: "boolean" },
      defaultCapacity: { type: "integer", format: "int32" },
      areaIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
        nullable: true,
      },
      version: { type: "string", format: "uuid", nullable: true },
      presentation: {
        type: "object",
        allOf: [{ $ref: "#/components/schemas/MentorPresentation" }],
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  MentorPresentation: {
    type: "object",
    properties: {
      title: {
        type: "object",
        allOf: [{ $ref: "#/components/schemas/LocalizedText" }],
        nullable: true,
      },
      languages: {
        type: "array",
        items: { $ref: "#/components/schemas/LocalizedText" },
        nullable: true,
      },
      graduationYear: { type: "integer", format: "int32", nullable: true },
      availability: {
        type: "object",
        allOf: [{ $ref: "#/components/schemas/LocalizedText" }],
        nullable: true,
      },
      featured: { type: "boolean" },
    },
    additionalProperties: false,
  },
  LocalizedText: {
    type: "object",
    properties: {
      ar: { type: "string", nullable: true },
      en: { type: "string", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_mentors_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "displayNameSnapshot",
            "batchSnapshot",
            "specialtyAr",
            "specialtyEn",
            "workplaceAr",
            "workplaceEn",
            "bioAr",
            "bioEn",
            "supportsIndividual",
            "supportsGroup",
            "supportsOnline",
            "supportsInPerson",
            "status",
            "defaultCapacity",
            "presentationJson",
            "activeMentees",
            "areas",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            displayNameSnapshot: { type: "string" },
            batchSnapshot: { type: "string", nullable: true },
            specialtyAr: { type: "string", nullable: true },
            specialtyEn: { type: "string", nullable: true },
            workplaceAr: { type: "string", nullable: true },
            workplaceEn: { type: "string", nullable: true },
            bioAr: { type: "string" },
            bioEn: { type: "string", nullable: true },
            supportsIndividual: { type: "boolean" },
            supportsGroup: { type: "boolean" },
            supportsOnline: { type: "boolean" },
            supportsInPerson: { type: "boolean" },
            status: { type: "string" },
            defaultCapacity: { type: "integer" },
            presentationJson: { type: "string" },
            activeMentees: { type: "integer" },
            areas: { type: "array", items: { type: "string", format: "uuid" } },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_mentors_by_id_200: {
    required: [
      "id",
      "version",
      "displayNameSnapshot",
      "batchSnapshot",
      "specialtyAr",
      "specialtyEn",
      "workplaceAr",
      "workplaceEn",
      "bioAr",
      "bioEn",
      "supportsIndividual",
      "supportsGroup",
      "supportsOnline",
      "supportsInPerson",
      "status",
      "defaultCapacity",
      "presentationJson",
      "activeMentees",
      "areas",
      "questions",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      displayNameSnapshot: { type: "string" },
      batchSnapshot: { type: "string", nullable: true },
      specialtyAr: { type: "string", nullable: true },
      specialtyEn: { type: "string", nullable: true },
      workplaceAr: { type: "string", nullable: true },
      workplaceEn: { type: "string", nullable: true },
      bioAr: { type: "string" },
      bioEn: { type: "string", nullable: true },
      supportsIndividual: { type: "boolean" },
      supportsGroup: { type: "boolean" },
      supportsOnline: { type: "boolean" },
      supportsInPerson: { type: "boolean" },
      status: { type: "string" },
      defaultCapacity: { type: "integer" },
      presentationJson: { type: "string" },
      activeMentees: { type: "integer" },
      areas: { type: "array", items: { type: "string", format: "uuid" } },
      questions: {
        type: "array",
        items: {
          required: [
            "id",
            "textAr",
            "textEn",
            "type",
            "required",
            "optionsJson",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            textAr: { type: "string" },
            textEn: { type: "string", nullable: true },
            type: { type: "string" },
            required: { type: "boolean" },
            optionsJson: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  EngagementAction: {
    type: "object",
    properties: {
      version: { type: "string", format: "uuid", nullable: true },
      revisionId: { type: "string", format: "uuid", nullable: true },
      reason: { type: "string", nullable: true },
      reviewerId: { type: "string", format: "uuid", nullable: true },
      status: { type: "string", nullable: true },
      feedback: { type: "string", nullable: true },
      internalNotes: { type: "string", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentors_by_id_availability_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "startsAt",
            "endsAt",
            "mode",
            "sessionType",
            "capacity",
            "available",
            "status",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            startsAt: { type: "string", format: "date-time" },
            endsAt: { type: "string", format: "date-time" },
            mode: { type: "string" },
            sessionType: { type: "string" },
            capacity: { type: "integer" },
            available: { type: "integer" },
            status: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  DynamicQuestionRequest: {
    type: "object",
    properties: {
      textAr: { type: "string" },
      type: { type: "string" },
      textEn: { type: "string", nullable: true },
      required: { type: "boolean" },
      displayOrder: { type: "integer", format: "int32" },
      options: { type: "array", items: { type: "string" }, nullable: true },
      active: { type: "boolean" },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  PublicQuestionResponseStageFourPageResponse: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/PublicQuestionResponse" },
      },
      page: { type: "integer", format: "int32" },
      pageSize: { type: "integer", format: "int32" },
      totalItems: { type: "integer", format: "int32" },
      totalPages: { type: "integer", format: "int32" },
    },
    additionalProperties: false,
  },
  PublicQuestionResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      category: { type: "string" },
      questionAr: { type: "string" },
      questionEn: { type: "string", nullable: true },
      answerAr: { type: "string" },
      answerEn: { type: "string", nullable: true },
      mentorProfileId: { type: "string", format: "uuid" },
      answererNameSnapshot: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      publishedAt: { type: "string", format: "date-time", nullable: true },
      status: { type: "string" },
    },
    additionalProperties: false,
  },
  PublicMentorshipQuestionRequest: {
    type: "object",
    properties: {
      category: { type: "string" },
      questionAr: { type: "string" },
      answerAr: { type: "string" },
      mentorProfileId: { type: "string", format: "uuid" },
      questionEn: { type: "string", nullable: true },
      answerEn: { type: "string", nullable: true },
      tags: { type: "array", items: { type: "string" }, nullable: true },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  MentorSlotRequest: {
    type: "object",
    properties: {
      mentorProfileId: { type: "string", format: "uuid" },
      startsAt: { type: "string", format: "date-time" },
      endsAt: { type: "string", format: "date-time" },
      capacity: { type: "integer", format: "int32" },
      mode: { type: "string" },
      sessionType: { type: "string" },
      meetingUrl: { type: "string", nullable: true },
      locationInstructions: { type: "string", nullable: true },
      overlapOverrideReason: { type: "string", nullable: true },
      version: { type: "string", format: "uuid", nullable: true },
      titleAr: { type: "string", nullable: true },
      titleEn: { type: "string", nullable: true },
      topicAr: { type: "string", nullable: true },
      topicEn: { type: "string", nullable: true },
      summaryAr: { type: "string", nullable: true },
      summaryEn: { type: "string", nullable: true },
      audienceAr: { type: "string", nullable: true },
      audienceEn: { type: "string", nullable: true },
      locationLabelAr: { type: "string", nullable: true },
      locationLabelEn: { type: "string", nullable: true },
    },
    additionalProperties: false,
  },
  MentorshipRequestInput: {
    type: "object",
    properties: {
      slotId: { type: "string", format: "uuid" },
      studentMessage: { type: "string", nullable: true },
      answers: {
        type: "array",
        items: { $ref: "#/components/schemas/DynamicAnswer" },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  DynamicAnswer: {
    type: "object",
    properties: {
      questionId: { type: "string", format: "uuid" },
      value: {
        description:
          "Domain JSON serialized as its JSON value. Content/block validation is applied by the owning domain.",
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentorship_requests_my_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "slotId",
            "mentorProfileId",
            "status",
            "studentMessage",
            "decisionReason",
            "submittedAt",
            "decidedAt",
            "sessionId",
            "answers",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            slotId: { type: "string", format: "uuid" },
            mentorProfileId: { type: "string", format: "uuid" },
            status: { type: "string" },
            studentMessage: { type: "string", nullable: true },
            decisionReason: { type: "string", nullable: true },
            submittedAt: { type: "string", format: "date-time" },
            decidedAt: { type: "string", format: "date-time", nullable: true },
            sessionId: { type: "string", format: "uuid", nullable: true },
            answers: {
              type: "array",
              items: {
                required: ["questionId", "questionSnapshotJson", "answerJson"],
                type: "object",
                properties: {
                  questionId: { type: "string", format: "uuid" },
                  questionSnapshotJson: { type: "string" },
                  answerJson: { type: "string" },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentorship_sessions_my_200: {
    required: ["items", "totalItems", "page", "pageSize", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "slotId",
            "mentorProfileId",
            "status",
            "sessionType",
            "mode",
            "startsAt",
            "endsAt",
            "meetingUrl",
            "locationInstructions",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            slotId: { type: "string", format: "uuid" },
            mentorProfileId: { type: "string", format: "uuid" },
            status: { type: "string" },
            sessionType: { type: "string" },
            mode: { type: "string" },
            startsAt: { type: "string", format: "date-time" },
            endsAt: { type: "string", format: "date-time" },
            meetingUrl: { type: "string", nullable: true },
            locationInstructions: { type: "string", nullable: true },
          },
          additionalProperties: false,
        },
      },
      totalItems: { type: "integer" },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  GroupSessionResponseStageFourPageResponse: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/GroupSessionResponse" },
      },
      page: { type: "integer", format: "int32" },
      pageSize: { type: "integer", format: "int32" },
      totalItems: { type: "integer", format: "int32" },
      totalPages: { type: "integer", format: "int32" },
    },
    additionalProperties: false,
  },
  GroupSessionResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      mentorId: { type: "string", format: "uuid" },
      mentorName: { type: "string" },
      titleAr: { type: "string", nullable: true },
      titleEn: { type: "string", nullable: true },
      topicAr: { type: "string", nullable: true },
      topicEn: { type: "string", nullable: true },
      summaryAr: { type: "string", nullable: true },
      summaryEn: { type: "string", nullable: true },
      audienceAr: { type: "string", nullable: true },
      audienceEn: { type: "string", nullable: true },
      locationLabelAr: { type: "string", nullable: true },
      locationLabelEn: { type: "string", nullable: true },
      startsAt: { type: "string", format: "date-time" },
      endsAt: { type: "string", format: "date-time" },
      mode: { type: "string" },
      capacity: { type: "integer", format: "int32" },
      status: { type: "string" },
      registeredCount: { type: "integer", format: "int32" },
    },
    additionalProperties: false,
  },
  GroupRegistrationResponseStageFourPageResponse: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/GroupRegistrationResponse" },
      },
      page: { type: "integer", format: "int32" },
      pageSize: { type: "integer", format: "int32" },
      totalItems: { type: "integer", format: "int32" },
      totalPages: { type: "integer", format: "int32" },
    },
    additionalProperties: false,
  },
  GroupRegistrationResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      sessionId: { type: "string", format: "uuid" },
      mentorshipSessionId: { type: "string", format: "uuid" },
      mentorProfileId: { type: "string", format: "uuid" },
      startsAt: { type: "string", format: "date-time" },
      endsAt: { type: "string", format: "date-time" },
      status: { type: "string" },
      participantStatus: { type: "string" },
      registeredAt: { type: "string", format: "date-time" },
      cancelledAt: { type: "string", format: "date-time", nullable: true },
    },
    additionalProperties: false,
  },
  GroupRegistrationActionResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      sessionId: { type: "string", format: "uuid" },
      mentorshipSessionId: { type: "string", format: "uuid" },
      studentUserId: { type: "string", format: "uuid" },
      registeredAt: { type: "string", format: "date-time" },
      participantStatus: { type: "string" },
    },
    additionalProperties: false,
  },
  GroupCancellationResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      sessionId: { type: "string", format: "uuid" },
      mentorshipSessionId: { type: "string", format: "uuid" },
      studentUserId: { type: "string", format: "uuid" },
      registeredAt: { type: "string", format: "date-time" },
      participantStatus: { type: "string" },
      cancelledAt: { type: "string", format: "date-time" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentor_requests_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "slotId",
            "mentorProfileId",
            "status",
            "studentMessage",
            "decisionReason",
            "submittedAt",
            "decidedAt",
            "sessionId",
            "answers",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            slotId: { type: "string", format: "uuid" },
            mentorProfileId: { type: "string", format: "uuid" },
            status: { type: "string" },
            studentMessage: { type: "string", nullable: true },
            decisionReason: { type: "string", nullable: true },
            submittedAt: { type: "string", format: "date-time" },
            decidedAt: { type: "string", format: "date-time", nullable: true },
            sessionId: { type: "string", format: "uuid", nullable: true },
            answers: {
              type: "array",
              items: {
                required: ["questionId", "questionSnapshotJson", "answerJson"],
                type: "object",
                properties: {
                  questionId: { type: "string", format: "uuid" },
                  questionSnapshotJson: { type: "string" },
                  answerJson: { type: "string" },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentor_sessions_200: {
    required: ["items", "totalItems", "page", "pageSize", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "slotId",
            "mentorProfileId",
            "status",
            "sessionType",
            "mode",
            "startsAt",
            "endsAt",
            "meetingUrl",
            "locationInstructions",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            slotId: { type: "string", format: "uuid" },
            mentorProfileId: { type: "string", format: "uuid" },
            status: { type: "string" },
            sessionType: { type: "string" },
            mode: { type: "string" },
            startsAt: { type: "string", format: "date-time" },
            endsAt: { type: "string", format: "date-time" },
            meetingUrl: { type: "string", nullable: true },
            locationInstructions: { type: "string", nullable: true },
          },
          additionalProperties: false,
        },
      },
      totalItems: { type: "integer" },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  FeedbackRequest: {
    type: "object",
    properties: {
      rating: { type: "integer", format: "int32" },
      comment: { type: "string", nullable: true },
      isVisibleToMentor: { type: "boolean" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_mentor_by_id_feedback_200: {
    required: ["count", "averageRating", "comments"],
    type: "object",
    properties: {
      count: { type: "integer" },
      averageRating: { type: "number", nullable: true },
      comments: {
        type: "array",
        items: {
          required: ["comment", "createdAt", "sessionId"],
          type: "object",
          properties: {
            comment: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            sessionId: { type: "string", format: "uuid", nullable: true },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_mentors_by_id_feedback_200: {
    required: ["count", "averageRating", "comments"],
    type: "object",
    properties: {
      count: { type: "integer" },
      averageRating: { type: "number", nullable: true },
      comments: {
        type: "array",
        items: {
          required: ["comment", "createdAt", "sessionId"],
          type: "object",
          properties: {
            comment: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            sessionId: { type: "string", format: "uuid", nullable: true },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_team_recruitment_openings_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "teamId",
            "titleAr",
            "titleEn",
            "descriptionAr",
            "descriptionEn",
            "opensAt",
            "closesAt",
            "status",
            "presentationJson",
            "applicationCount",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            titleAr: { type: "string" },
            titleEn: { type: "string", nullable: true },
            descriptionAr: { type: "string" },
            descriptionEn: { type: "string", nullable: true },
            opensAt: { type: "string", format: "date-time" },
            closesAt: { type: "string", format: "date-time" },
            status: { type: "string" },
            presentationJson: { type: "string" },
            applicationCount: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_team_recruitment_openings_by_id_200: {
    required: [
      "id",
      "version",
      "teamId",
      "titleAr",
      "titleEn",
      "descriptionAr",
      "descriptionEn",
      "opensAt",
      "closesAt",
      "status",
      "presentation",
      "applicationCount",
      "questions",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      teamId: { type: "string", format: "uuid" },
      titleAr: { type: "string" },
      titleEn: { type: "string", nullable: true },
      descriptionAr: { type: "string" },
      descriptionEn: { type: "string", nullable: true },
      opensAt: { type: "string", format: "date-time" },
      closesAt: { type: "string", format: "date-time" },
      status: { type: "string" },
      presentation: {
        required: [
          "responsibilities",
          "requirements",
          "skills",
          "studyYears",
          "commitmentHoursPerWeek",
          "openings",
        ],
        type: "object",
        properties: {
          responsibilities: {
            type: "array",
            items: {
              required: ["ar", "en"],
              type: "object",
              properties: {
                ar: { type: "string", nullable: true },
                en: { type: "string", nullable: true },
              },
              additionalProperties: false,
            },
            nullable: true,
          },
          requirements: {
            type: "array",
            items: {
              required: ["ar", "en"],
              type: "object",
              properties: {
                ar: { type: "string", nullable: true },
                en: { type: "string", nullable: true },
              },
              additionalProperties: false,
            },
            nullable: true,
          },
          skills: {
            type: "array",
            items: {
              required: ["ar", "en"],
              type: "object",
              properties: {
                ar: { type: "string", nullable: true },
                en: { type: "string", nullable: true },
              },
              additionalProperties: false,
            },
            nullable: true,
          },
          studyYears: {
            type: "array",
            items: { type: "integer" },
            nullable: true,
          },
          commitmentHoursPerWeek: { type: "number", nullable: true },
          openings: { type: "integer", nullable: true },
        },
        additionalProperties: false,
      },
      applicationCount: { type: "integer" },
      questions: {
        type: "array",
        items: {
          required: [
            "id",
            "textAr",
            "textEn",
            "questionType",
            "optionsJson",
            "isRequired",
            "displayOrder",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            textAr: { type: "string" },
            textEn: { type: "string", nullable: true },
            questionType: { type: "string" },
            optionsJson: { type: "string" },
            isRequired: { type: "boolean" },
            displayOrder: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  ApplicationRequest: {
    type: "object",
    properties: {
      answers: {
        type: "array",
        items: { $ref: "#/components/schemas/DynamicAnswer" },
      },
    },
    additionalProperties: false,
  },
  RecruitmentApplicationDraftRequest: {
    type: "object",
    properties: {
      openingId: { type: "string", format: "uuid" },
      motivation: { type: "string" },
      experience: { type: "string" },
      availability: { type: "string" },
      consentConfirmed: { type: "boolean" },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  RecruitmentDraftSubmissionRequest: {
    type: "object",
    properties: {
      version: { type: "string", format: "uuid" },
      answers: {
        type: "array",
        items: { $ref: "#/components/schemas/DynamicAnswer" },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_team_applications_my_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "openingId",
            "teamId",
            "status",
            "submittedAt",
            "acceptedAt",
            "rejectedAt",
            "withdrawnAt",
            "createdMemberProfileId",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            openingId: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            status: { type: "string" },
            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            acceptedAt: { type: "string", format: "date-time", nullable: true },
            rejectedAt: { type: "string", format: "date-time", nullable: true },
            withdrawnAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdMemberProfileId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_team_applications_my_by_id_200: {
    required: [
      "id",
      "version",
      "openingId",
      "teamId",
      "status",
      "submittedAt",
      "motivation",
      "experience",
      "availability",
      "consentConfirmed",
      "createdMemberProfileId",
      "onboardingTasks",
      "answers",
      "history",
      "interviews",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      openingId: { type: "string", format: "uuid" },
      teamId: { type: "string", format: "uuid" },
      status: { type: "string" },
      submittedAt: { type: "string", format: "date-time", nullable: true },
      motivation: { type: "string", nullable: true },
      experience: { type: "string", nullable: true },
      availability: { type: "string", nullable: true },
      consentConfirmed: { type: "boolean" },
      createdMemberProfileId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      onboardingTasks: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "titleSnapshot",
            "descriptionSnapshot",
            "isRequired",
            "status",
            "completedAt",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            titleSnapshot: { type: "string" },
            descriptionSnapshot: { type: "string", nullable: true },
            isRequired: { type: "boolean" },
            status: { type: "string" },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
      answers: {
        type: "array",
        items: {
          required: ["questionId", "questionSnapshot", "answerJson"],
          type: "object",
          properties: {
            questionId: { type: "string", format: "uuid" },
            questionSnapshot: { type: "string" },
            answerJson: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      history: {
        type: "array",
        items: {
          required: [
            "fromStatus",
            "toStatus",
            "reason",
            "internalNote",
            "occurredAt",
          ],
          type: "object",
          properties: {
            fromStatus: { type: "string", nullable: true },
            toStatus: { type: "string" },
            reason: { type: "string", nullable: true },
            internalNote: { type: "string", nullable: true },
            occurredAt: { type: "string", format: "date-time" },
          },
          additionalProperties: false,
        },
      },
      interviews: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "scheduledAt",
            "durationMinutes",
            "mode",
            "status",
            "meetingUrl",
            "locationInstructions",
            "internalNotes",
            "score",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            scheduledAt: { type: "string", format: "date-time" },
            durationMinutes: { type: "integer" },
            mode: { type: "string" },
            status: { type: "string" },
            meetingUrl: { type: "string", nullable: true },
            locationInstructions: { type: "string", nullable: true },
            internalNotes: { type: "string", nullable: true },
            score: { type: "integer", nullable: true },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  OnboardingClaimResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      status: { type: "string" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_teams_by_teamId_recruitment_openings_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "teamId",
            "titleAr",
            "titleEn",
            "descriptionAr",
            "descriptionEn",
            "opensAt",
            "closesAt",
            "status",
            "presentationJson",
            "applicationCount",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            titleAr: { type: "string" },
            titleEn: { type: "string", nullable: true },
            descriptionAr: { type: "string" },
            descriptionEn: { type: "string", nullable: true },
            opensAt: { type: "string", format: "date-time" },
            closesAt: { type: "string", format: "date-time" },
            status: { type: "string" },
            presentationJson: { type: "string" },
            applicationCount: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  RecruitmentOpeningRequest: {
    type: "object",
    properties: {
      titleAr: { type: "string" },
      descriptionAr: { type: "string" },
      opensAt: { type: "string", format: "date-time" },
      closesAt: { type: "string", format: "date-time" },
      titleEn: { type: "string", nullable: true },
      descriptionEn: { type: "string", nullable: true },
      questions: {
        type: "array",
        items: { $ref: "#/components/schemas/DynamicQuestionRequest" },
        nullable: true,
      },
      version: { type: "string", format: "uuid", nullable: true },
      presentation: {
        type: "object",
        allOf: [{ $ref: "#/components/schemas/RecruitmentPresentation" }],
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  RecruitmentPresentation: {
    type: "object",
    properties: {
      responsibilities: {
        type: "array",
        items: { $ref: "#/components/schemas/LocalizedText" },
        nullable: true,
      },
      requirements: {
        type: "array",
        items: { $ref: "#/components/schemas/LocalizedText" },
        nullable: true,
      },
      skills: {
        type: "array",
        items: { $ref: "#/components/schemas/LocalizedText" },
        nullable: true,
      },
      studyYears: {
        type: "array",
        items: { type: "integer", format: "int32" },
        nullable: true,
      },
      commitmentHoursPerWeek: {
        type: "number",
        format: "double",
        nullable: true,
      },
      openings: { type: "integer", format: "int32", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_recruitment_openings_by_id_200: {
    required: [
      "id",
      "version",
      "teamId",
      "titleAr",
      "titleEn",
      "descriptionAr",
      "descriptionEn",
      "opensAt",
      "closesAt",
      "status",
      "presentation",
      "applicationCount",
      "questions",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      teamId: { type: "string", format: "uuid" },
      titleAr: { type: "string" },
      titleEn: { type: "string", nullable: true },
      descriptionAr: { type: "string" },
      descriptionEn: { type: "string", nullable: true },
      opensAt: { type: "string", format: "date-time" },
      closesAt: { type: "string", format: "date-time" },
      status: { type: "string" },
      presentation: {
        required: [
          "responsibilities",
          "requirements",
          "skills",
          "studyYears",
          "commitmentHoursPerWeek",
          "openings",
        ],
        type: "object",
        properties: {
          responsibilities: {
            type: "array",
            items: {
              required: ["ar", "en"],
              type: "object",
              properties: {
                ar: { type: "string", nullable: true },
                en: { type: "string", nullable: true },
              },
              additionalProperties: false,
            },
            nullable: true,
          },
          requirements: {
            type: "array",
            items: {
              required: ["ar", "en"],
              type: "object",
              properties: {
                ar: { type: "string", nullable: true },
                en: { type: "string", nullable: true },
              },
              additionalProperties: false,
            },
            nullable: true,
          },
          skills: {
            type: "array",
            items: {
              required: ["ar", "en"],
              type: "object",
              properties: {
                ar: { type: "string", nullable: true },
                en: { type: "string", nullable: true },
              },
              additionalProperties: false,
            },
            nullable: true,
          },
          studyYears: {
            type: "array",
            items: { type: "integer" },
            nullable: true,
          },
          commitmentHoursPerWeek: { type: "number", nullable: true },
          openings: { type: "integer", nullable: true },
        },
        additionalProperties: false,
      },
      applicationCount: { type: "integer" },
      questions: {
        type: "array",
        items: {
          required: [
            "id",
            "textAr",
            "textEn",
            "questionType",
            "optionsJson",
            "isRequired",
            "displayOrder",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            textAr: { type: "string" },
            textEn: { type: "string", nullable: true },
            questionType: { type: "string" },
            optionsJson: { type: "string" },
            isRequired: { type: "boolean" },
            displayOrder: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_recruitment_openings_by_id_applications_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "openingId",
            "teamId",
            "status",
            "submittedAt",
            "acceptedAt",
            "rejectedAt",
            "withdrawnAt",
            "createdMemberProfileId",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            openingId: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            status: { type: "string" },
            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            acceptedAt: { type: "string", format: "date-time", nullable: true },
            rejectedAt: { type: "string", format: "date-time", nullable: true },
            withdrawnAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdMemberProfileId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_team_applications_by_id_200: {
    required: [
      "id",
      "version",
      "openingId",
      "teamId",
      "status",
      "submittedAt",
      "motivation",
      "experience",
      "availability",
      "consentConfirmed",
      "createdMemberProfileId",
      "onboardingTasks",
      "answers",
      "history",
      "interviews",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      openingId: { type: "string", format: "uuid" },
      teamId: { type: "string", format: "uuid" },
      status: { type: "string" },
      submittedAt: { type: "string", format: "date-time", nullable: true },
      motivation: { type: "string", nullable: true },
      experience: { type: "string", nullable: true },
      availability: { type: "string", nullable: true },
      consentConfirmed: { type: "boolean" },
      createdMemberProfileId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      onboardingTasks: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "titleSnapshot",
            "descriptionSnapshot",
            "isRequired",
            "status",
            "completedAt",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            titleSnapshot: { type: "string" },
            descriptionSnapshot: { type: "string", nullable: true },
            isRequired: { type: "boolean" },
            status: { type: "string" },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
      answers: {
        type: "array",
        items: {
          required: ["questionId", "questionSnapshot", "answerJson"],
          type: "object",
          properties: {
            questionId: { type: "string", format: "uuid" },
            questionSnapshot: { type: "string" },
            answerJson: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      history: {
        type: "array",
        items: {
          required: [
            "fromStatus",
            "toStatus",
            "reason",
            "internalNote",
            "occurredAt",
          ],
          type: "object",
          properties: {
            fromStatus: { type: "string", nullable: true },
            toStatus: { type: "string" },
            reason: { type: "string", nullable: true },
            internalNote: { type: "string", nullable: true },
            occurredAt: { type: "string", format: "date-time" },
          },
          additionalProperties: false,
        },
      },
      interviews: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "scheduledAt",
            "durationMinutes",
            "mode",
            "status",
            "meetingUrl",
            "locationInstructions",
            "internalNotes",
            "score",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            scheduledAt: { type: "string", format: "date-time" },
            durationMinutes: { type: "integer" },
            mode: { type: "string" },
            status: { type: "string" },
            meetingUrl: { type: "string", nullable: true },
            locationInstructions: { type: "string", nullable: true },
            internalNotes: { type: "string", nullable: true },
            score: { type: "integer", nullable: true },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  InterviewRequest: {
    type: "object",
    properties: {
      scheduledAt: { type: "string", format: "date-time" },
      interviewerUserId: { type: "string", format: "uuid" },
      durationMinutes: { type: "integer", format: "int32" },
      mode: { type: "string" },
      meetingUrl: { type: "string", nullable: true },
      locationInstructions: { type: "string", nullable: true },
      status: { type: "string" },
      internalNotes: { type: "string", nullable: true },
      score: { type: "integer", format: "int32", nullable: true },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_member_profiles_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "teamId",
            "displayNameSnapshot",
            "bioAr",
            "bioEn",
            "photoAssetId",
            "joinedAt",
            "status",
            "publicVisibility",
            "positions",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            displayNameSnapshot: { type: "string" },
            bioAr: { type: "string", nullable: true },
            bioEn: { type: "string", nullable: true },
            photoAssetId: { type: "string", format: "uuid", nullable: true },
            joinedAt: { type: "string", format: "date-time" },
            status: { type: "string" },
            publicVisibility: { type: "string" },
            positions: {
              type: "array",
              items: {
                required: ["titleAr", "titleEn", "startsOn", "endsOn"],
                type: "object",
                properties: {
                  titleAr: { type: "string" },
                  titleEn: { type: "string", nullable: true },
                  startsOn: { type: "string", format: "date" },
                  endsOn: { type: "string", format: "date", nullable: true },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_member_profiles_my_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "teamId",
            "displayNameSnapshot",
            "bioAr",
            "bioEn",
            "photoAssetId",
            "joinedAt",
            "status",
            "publicVisibility",
            "positions",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            displayNameSnapshot: { type: "string" },
            bioAr: { type: "string", nullable: true },
            bioEn: { type: "string", nullable: true },
            photoAssetId: { type: "string", format: "uuid", nullable: true },
            joinedAt: { type: "string", format: "date-time" },
            status: { type: "string" },
            publicVisibility: { type: "string" },
            positions: {
              type: "array",
              items: {
                required: ["titleAr", "titleEn", "startsOn", "endsOn"],
                type: "object",
                properties: {
                  titleAr: { type: "string" },
                  titleEn: { type: "string", nullable: true },
                  startsOn: { type: "string", format: "date" },
                  endsOn: { type: "string", format: "date", nullable: true },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_member_profiles_my_by_id_200: {
    required: [
      "id",
      "version",
      "teamId",
      "displayNameSnapshot",
      "bioAr",
      "bioEn",
      "photoAssetId",
      "joinedAt",
      "status",
      "publicVisibility",
      "positions",
      "tasks",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      teamId: { type: "string", format: "uuid" },
      displayNameSnapshot: { type: "string" },
      bioAr: { type: "string", nullable: true },
      bioEn: { type: "string", nullable: true },
      photoAssetId: { type: "string", format: "uuid", nullable: true },
      joinedAt: { type: "string", format: "date-time" },
      status: { type: "string" },
      publicVisibility: { type: "string" },
      positions: {
        type: "array",
        items: {
          required: [
            "id",
            "titleAr",
            "titleEn",
            "startsOn",
            "endsOn",
            "displayOrder",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titleAr: { type: "string" },
            titleEn: { type: "string", nullable: true },
            startsOn: { type: "string", format: "date" },
            endsOn: { type: "string", format: "date", nullable: true },
            displayOrder: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
      tasks: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "titleSnapshot",
            "descriptionSnapshot",
            "isRequired",
            "status",
            "completedAt",
            "waiverReason",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            titleSnapshot: { type: "string" },
            descriptionSnapshot: { type: "string", nullable: true },
            isRequired: { type: "boolean" },
            status: { type: "string" },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            waiverReason: { type: "string", nullable: true },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_member_profiles_by_id_200: {
    required: [
      "id",
      "version",
      "teamId",
      "displayNameSnapshot",
      "bioAr",
      "bioEn",
      "photoAssetId",
      "joinedAt",
      "status",
      "publicVisibility",
      "positions",
      "tasks",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      teamId: { type: "string", format: "uuid" },
      displayNameSnapshot: { type: "string" },
      bioAr: { type: "string", nullable: true },
      bioEn: { type: "string", nullable: true },
      photoAssetId: { type: "string", format: "uuid", nullable: true },
      joinedAt: { type: "string", format: "date-time" },
      status: { type: "string" },
      publicVisibility: { type: "string" },
      positions: {
        type: "array",
        items: {
          required: [
            "id",
            "titleAr",
            "titleEn",
            "startsOn",
            "endsOn",
            "displayOrder",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titleAr: { type: "string" },
            titleEn: { type: "string", nullable: true },
            startsOn: { type: "string", format: "date" },
            endsOn: { type: "string", format: "date", nullable: true },
            displayOrder: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
      tasks: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "titleSnapshot",
            "descriptionSnapshot",
            "isRequired",
            "status",
            "completedAt",
            "waiverReason",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            titleSnapshot: { type: "string" },
            descriptionSnapshot: { type: "string", nullable: true },
            isRequired: { type: "boolean" },
            status: { type: "string" },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            waiverReason: { type: "string", nullable: true },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  MemberConsentRequest: {
    type: "object",
    properties: {
      memberProfileId: { type: "string", format: "uuid" },
      publicVisibility: { type: "boolean" },
      consent: { type: "boolean" },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_teams_by_teamId_members_profiles_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "teamId",
            "displayNameSnapshot",
            "bioAr",
            "bioEn",
            "photoAssetId",
            "joinedAt",
            "status",
            "publicVisibility",
            "positions",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            displayNameSnapshot: { type: "string" },
            bioAr: { type: "string", nullable: true },
            bioEn: { type: "string", nullable: true },
            photoAssetId: { type: "string", format: "uuid", nullable: true },
            joinedAt: { type: "string", format: "date-time" },
            status: { type: "string" },
            publicVisibility: { type: "string" },
            positions: {
              type: "array",
              items: {
                required: ["titleAr", "titleEn", "startsOn", "endsOn"],
                type: "object",
                properties: {
                  titleAr: { type: "string" },
                  titleEn: { type: "string", nullable: true },
                  startsOn: { type: "string", format: "date" },
                  endsOn: { type: "string", format: "date", nullable: true },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_member_profiles_by_id_200: {
    required: [
      "id",
      "version",
      "teamId",
      "displayNameSnapshot",
      "bioAr",
      "bioEn",
      "photoAssetId",
      "joinedAt",
      "status",
      "publicVisibility",
      "positions",
      "tasks",
    ],
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      version: { type: "string", format: "uuid" },
      teamId: { type: "string", format: "uuid" },
      displayNameSnapshot: { type: "string" },
      bioAr: { type: "string", nullable: true },
      bioEn: { type: "string", nullable: true },
      photoAssetId: { type: "string", format: "uuid", nullable: true },
      joinedAt: { type: "string", format: "date-time" },
      status: { type: "string" },
      publicVisibility: { type: "string" },
      positions: {
        type: "array",
        items: {
          required: [
            "id",
            "titleAr",
            "titleEn",
            "startsOn",
            "endsOn",
            "displayOrder",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titleAr: { type: "string" },
            titleEn: { type: "string", nullable: true },
            startsOn: { type: "string", format: "date" },
            endsOn: { type: "string", format: "date", nullable: true },
            displayOrder: { type: "integer" },
          },
          additionalProperties: false,
        },
      },
      tasks: {
        type: "array",
        items: {
          required: [
            "id",
            "version",
            "titleSnapshot",
            "descriptionSnapshot",
            "isRequired",
            "status",
            "completedAt",
            "waiverReason",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            version: { type: "string", format: "uuid" },
            titleSnapshot: { type: "string" },
            descriptionSnapshot: { type: "string", nullable: true },
            isRequired: { type: "boolean" },
            status: { type: "string" },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            waiverReason: { type: "string", nullable: true },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  MemberProfileRequest: {
    type: "object",
    properties: {
      bioAr: { type: "string", nullable: true },
      bioEn: { type: "string", nullable: true },
      photoAssetId: { type: "string", format: "uuid", nullable: true },
      status: { type: "string", nullable: true },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  MemberPositionRequest: {
    type: "object",
    properties: {
      titleAr: { type: "string" },
      startsOn: { type: "string", format: "date" },
      titleEn: { type: "string", nullable: true },
      endsOn: { type: "string", format: "date", nullable: true },
      displayOrder: { type: "integer", format: "int32" },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_admin_teams_by_teamId_onboarding_templates_200: {
    type: "array",
    items: {
      required: [
        "id",
        "version",
        "titleAr",
        "titleEn",
        "descriptionAr",
        "descriptionEn",
        "isRequired",
        "displayOrder",
        "status",
      ],
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        version: { type: "string", format: "uuid" },
        titleAr: { type: "string" },
        titleEn: { type: "string", nullable: true },
        descriptionAr: { type: "string", nullable: true },
        descriptionEn: { type: "string", nullable: true },
        isRequired: { type: "boolean" },
        displayOrder: { type: "integer" },
        status: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  OnboardingTemplateRequest: {
    type: "object",
    properties: {
      titleAr: { type: "string" },
      titleEn: { type: "string", nullable: true },
      descriptionAr: { type: "string", nullable: true },
      descriptionEn: { type: "string", nullable: true },
      isRequired: { type: "boolean" },
      displayOrder: { type: "integer", format: "int32" },
      status: { type: "string" },
      version: { type: "string", format: "uuid", nullable: true },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_engagement_search_200: {
    required: ["items", "page", "pageSize", "totalItems", "totalPages"],
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          required: ["resourceType", "resourceId", "revisionId", "title"],
          type: "object",
          properties: {
            resourceType: { type: "string" },
            resourceId: { type: "string", format: "uuid" },
            revisionId: { type: "string", format: "uuid", nullable: true },
            title: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalItems: { type: "integer" },
      totalPages: { type: "integer" },
    },
    additionalProperties: false,
  },
  Response_get_api_v1_engagement_dashboard_200: {
    required: [
      "contributions",
      "savedOpportunities",
      "sessions",
      "teamApplications",
    ],
    type: "object",
    properties: {
      contributions: {
        type: "array",
        items: {
          required: [
            "id",
            "status",
            "publishedRevisionId",
            "latestSubmittedRevisionId",
          ],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            status: { type: "string" },
            publishedRevisionId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            latestSubmittedRevisionId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
          },
          additionalProperties: false,
        },
      },
      savedOpportunities: {
        type: "array",
        items: {
          required: ["id", "titleAr", "deadlineAt", "remindersEnabled"],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titleAr: { type: "string" },
            deadlineAt: { type: "string", format: "date-time", nullable: true },
            remindersEnabled: { type: "boolean" },
          },
          additionalProperties: false,
        },
      },
      sessions: {
        type: "array",
        items: {
          required: ["id", "startsAt", "endsAt", "mode", "status"],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            startsAt: { type: "string", format: "date-time" },
            endsAt: { type: "string", format: "date-time" },
            mode: { type: "string" },
            status: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      teamApplications: {
        type: "array",
        items: {
          required: ["id", "teamId", "status", "createdMemberProfileId"],
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            teamId: { type: "string", format: "uuid" },
            status: { type: "string" },
            createdMemberProfileId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
};
