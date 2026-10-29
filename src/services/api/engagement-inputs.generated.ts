// Generated from the pinned P08 input schemas.
export const engagementRoutes = {
  get_api_v1_opportunities: {
    method: "GET",
    path: "/api/v1/opportunities",
    body: null,
    idempotent: false,
    summary: "List opportunities",
  },
  get_api_v1_opportunities_saved: {
    method: "GET",
    path: "/api/v1/opportunities/saved",
    body: null,
    idempotent: false,
    summary: "List my saved opportunities",
  },
  get_api_v1_opportunities_by_id: {
    method: "GET",
    path: "/api/v1/opportunities/{id}",
    body: null,
    idempotent: false,
    summary: "Get opportunity",
  },
  post_api_v1_opportunities_by_id_save: {
    method: "POST",
    path: "/api/v1/opportunities/{id}/save",
    body: null,
    idempotent: true,
    summary: "Save opportunity",
  },
  delete_api_v1_opportunities_by_id_save: {
    method: "DELETE",
    path: "/api/v1/opportunities/{id}/save",
    body: null,
    idempotent: true,
    summary: "Unsave opportunity",
  },
  put_api_v1_opportunities_by_id_reminder_preference: {
    method: "PUT",
    path: "/api/v1/opportunities/{id}/reminder-preference",
    body: {
      $ref: "#/components/schemas/ReminderPreferenceRequest",
    },
    idempotent: true,
    summary: "Update reminder preference for opportunity",
  },
  get_api_v1_admin_opportunities: {
    method: "GET",
    path: "/api/v1/admin/opportunities",
    body: null,
    idempotent: false,
    summary: "List opportunities",
  },
  post_api_v1_admin_opportunities: {
    method: "POST",
    path: "/api/v1/admin/opportunities",
    body: {
      $ref: "#/components/schemas/OpportunityRequest",
    },
    idempotent: true,
    summary: "Create opportunity",
  },
  get_api_v1_admin_opportunities_by_id: {
    method: "GET",
    path: "/api/v1/admin/opportunities/{id}",
    body: null,
    idempotent: false,
    summary: "Get opportunity",
  },
  put_api_v1_admin_opportunities_by_id: {
    method: "PUT",
    path: "/api/v1/admin/opportunities/{id}",
    body: {
      $ref: "#/components/schemas/OpportunityRequest",
    },
    idempotent: true,
    summary: "Update opportunity",
  },
  post_api_v1_admin_opportunities_by_id_publish: {
    method: "POST",
    path: "/api/v1/admin/opportunities/{id}/publish",
    body: {
      $ref: "#/components/schemas/EngagementAction",
    },
    idempotent: true,
    summary: "Publish opportunity",
  },
  post_api_v1_admin_opportunities_by_id_close: {
    method: "POST",
    path: "/api/v1/admin/opportunities/{id}/close",
    body: {
      $ref: "#/components/schemas/EngagementAction",
    },
    idempotent: true,
    summary: "Close opportunity",
  },
  post_api_v1_admin_opportunities_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/opportunities/{id}/archive",
    body: {
      $ref: "#/components/schemas/EngagementAction",
    },
    idempotent: true,
    summary: "Archive opportunity",
  },
  get_api_v1_events: {
    method: "GET",
    path: "/api/v1/events",
    body: null,
    idempotent: false,
    summary: "List events",
  },
  get_api_v1_events_by_slug: {
    method: "GET",
    path: "/api/v1/events/{slug}",
    body: null,
    idempotent: false,
    summary: "Get event",
  },
  get_api_v1_admin_events: {
    method: "GET",
    path: "/api/v1/admin/events",
    body: null,
    idempotent: false,
    summary: "List events",
  },
  post_api_v1_admin_events: {
    method: "POST",
    path: "/api/v1/admin/events",
    body: {
      $ref: "#/components/schemas/EventDefinition",
    },
    idempotent: true,
    summary: "Create event",
  },
  get_api_v1_admin_events_by_id: {
    method: "GET",
    path: "/api/v1/admin/events/{id}",
    body: null,
    idempotent: false,
    summary: "Get event",
  },
  put_api_v1_admin_events_by_id: {
    method: "PUT",
    path: "/api/v1/admin/events/{id}",
    body: {
      $ref: "#/components/schemas/EventDefinition",
    },
    idempotent: true,
    summary: "Update event",
  },
  post_api_v1_admin_events_by_id_publish: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/publish",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Publish event",
  },
  post_api_v1_admin_events_by_id_cancel: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/cancel",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Cancel event",
  },
  post_api_v1_admin_events_by_id_complete: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/complete",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Complete event",
  },
  post_api_v1_admin_events_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/archive",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Archive event",
  },
  post_api_v1_events_by_id_register: {
    method: "POST",
    path: "/api/v1/events/{id}/register",
    body: {
      $ref: "#/components/schemas/EventRegistrationRequest",
    },
    idempotent: true,
    summary: "Register for event",
  },
  get_api_v1_events_by_id_registration_my: {
    method: "GET",
    path: "/api/v1/events/{id}/registration/my",
    body: null,
    idempotent: false,
    summary: "Get my event registration",
  },
  post_api_v1_events_by_id_registration_confirm_promotion: {
    method: "POST",
    path: "/api/v1/events/{id}/registration/confirm-promotion",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Confirm my event waiting-list offer",
  },
  delete_api_v1_events_by_id_registration: {
    method: "DELETE",
    path: "/api/v1/events/{id}/registration",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Cancel my event registration",
  },
  get_api_v1_events_registrations_my: {
    method: "GET",
    path: "/api/v1/events/registrations/my",
    body: null,
    idempotent: false,
    summary: "List my registrations for event",
  },
  get_api_v1_events_by_id_attendance_qr_my: {
    method: "GET",
    path: "/api/v1/events/{id}/attendance-qr/my",
    body: null,
    idempotent: false,
    summary: "Get my attendance QR code",
  },
  post_api_v1_events_by_id_attendance_qr_regenerate: {
    method: "POST",
    path: "/api/v1/events/{id}/attendance-qr/regenerate",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Regenerate attendance QR code for event",
  },
  post_api_v1_admin_events_by_id_registrations: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/registrations",
    body: {
      $ref: "#/components/schemas/EventManualRegistrationRequest",
    },
    idempotent: true,
    summary: "Create registration for event",
  },
  get_api_v1_admin_events_by_id_registrations: {
    method: "GET",
    path: "/api/v1/admin/events/{id}/registrations",
    body: null,
    idempotent: false,
    summary: "List registrations for event",
  },
  get_api_v1_admin_events_by_id_registrations_by_registrationId_answers: {
    method: "GET",
    path: "/api/v1/admin/events/{id}/registrations/{registrationId}/answers",
    body: null,
    idempotent: false,
    summary: "List answers for event registration",
  },
  get_api_v1_admin_events_by_id_waitlist: {
    method: "GET",
    path: "/api/v1/admin/events/{id}/waitlist",
    body: null,
    idempotent: false,
    summary: "List waitlist for event",
  },
  post_api_v1_admin_events_by_id_waitlist_promote_next: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/waitlist/promote-next",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Offer the next available event seat",
  },
  post_api_v1_admin_events_by_id_waitlist_by_entryId_override_promote: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/waitlist/{entryId}/override-promote",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Offer an event seat outside waiting-list order",
  },
  post_api_v1_attendance_scan: {
    method: "POST",
    path: "/api/v1/attendance/scan",
    body: {
      $ref: "#/components/schemas/EventScanRequest",
    },
    idempotent: true,
    summary: "Scan an attendance QR code",
  },
  get_api_v1_admin_events_by_id_attendance: {
    method: "GET",
    path: "/api/v1/admin/events/{id}/attendance",
    body: null,
    idempotent: false,
    summary: "List attendance for event",
  },
  post_api_v1_admin_events_by_id_attendance_manual: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/attendance/manual",
    body: {
      $ref: "#/components/schemas/EventAttendanceRequest",
    },
    idempotent: true,
    summary: "Record event attendance manually",
  },
  put_api_v1_admin_attendance_by_recordId_correct: {
    method: "PUT",
    path: "/api/v1/admin/attendance/{recordId}/correct",
    body: {
      $ref: "#/components/schemas/EventAttendanceRequest",
    },
    idempotent: true,
    summary: "Correct attendance",
  },
  get_api_v1_admin_certificate_templates: {
    method: "GET",
    path: "/api/v1/admin/certificate-templates",
    body: null,
    idempotent: false,
    summary: "List certificate templates",
  },
  post_api_v1_admin_certificate_templates: {
    method: "POST",
    path: "/api/v1/admin/certificate-templates",
    body: {
      $ref: "#/components/schemas/EventTemplateRequest",
    },
    idempotent: true,
    summary: "Create certificate template",
  },
  put_api_v1_admin_certificate_templates_by_id: {
    method: "PUT",
    path: "/api/v1/admin/certificate-templates/{id}",
    body: {
      $ref: "#/components/schemas/EventTemplateRequest",
    },
    idempotent: true,
    summary: "Update certificate template",
  },
  get_api_v1_certificates_my: {
    method: "GET",
    path: "/api/v1/certificates/my",
    body: null,
    idempotent: false,
    summary: "List my certificates",
  },
  get_api_v1_certificates_my_by_id: {
    method: "GET",
    path: "/api/v1/certificates/my/{id}",
    body: null,
    idempotent: false,
    summary: "Get my certificate",
  },
  get_api_v1_certificates_verify_by_code: {
    method: "GET",
    path: "/api/v1/certificates/verify/{code}",
    body: null,
    idempotent: false,
    summary: "Verify a certificate",
  },
  post_api_v1_admin_events_by_id_certificates_issue: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/certificates/issue",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Issue certificates for event",
  },
  get_api_v1_admin_events_by_id_certificates: {
    method: "GET",
    path: "/api/v1/admin/events/{id}/certificates",
    body: null,
    idempotent: false,
    summary: "List certificates for event",
  },
  post_api_v1_admin_certificates_by_id_revoke: {
    method: "POST",
    path: "/api/v1/admin/certificates/{id}/revoke",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Revoke certificate",
  },
  post_api_v1_admin_certificates_by_id_reissue: {
    method: "POST",
    path: "/api/v1/admin/certificates/{id}/reissue",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Reissue certificate",
  },
  get_api_v1_volunteer_hours_my: {
    method: "GET",
    path: "/api/v1/volunteer-hours/my",
    body: null,
    idempotent: false,
    summary: "List my volunteer hours",
  },
  get_api_v1_volunteer_hours_by_id: {
    method: "GET",
    path: "/api/v1/volunteer-hours/{id}",
    body: null,
    idempotent: false,
    summary: "Get volunteer hours",
  },
  post_api_v1_volunteer_hours: {
    method: "POST",
    path: "/api/v1/volunteer-hours",
    body: {
      $ref: "#/components/schemas/VolunteerRequest",
    },
    idempotent: true,
    summary: "Create volunteer hours",
  },
  put_api_v1_volunteer_hours_by_id_draft: {
    method: "PUT",
    path: "/api/v1/volunteer-hours/{id}/draft",
    body: {
      $ref: "#/components/schemas/VolunteerRequest",
    },
    idempotent: true,
    summary: "Update draft for volunteer hours",
  },
  post_api_v1_volunteer_hours_by_id_submit: {
    method: "POST",
    path: "/api/v1/volunteer-hours/{id}/submit",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Submit volunteer hours",
  },
  post_api_v1_volunteer_hours_by_id_cancel: {
    method: "POST",
    path: "/api/v1/volunteer-hours/{id}/cancel",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Cancel volunteer hours",
  },
  get_api_v1_admin_volunteer_hours: {
    method: "GET",
    path: "/api/v1/admin/volunteer-hours",
    body: null,
    idempotent: false,
    summary: "List volunteer hours",
  },
  post_api_v1_admin_volunteer_hours: {
    method: "POST",
    path: "/api/v1/admin/volunteer-hours",
    body: {
      $ref: "#/components/schemas/AdminVolunteerRequest",
    },
    idempotent: true,
    summary: "Create volunteer hours",
  },
  post_api_v1_admin_volunteer_hours_by_id_approve: {
    method: "POST",
    path: "/api/v1/admin/volunteer-hours/{id}/approve",
    body: {
      $ref: "#/components/schemas/VolunteerDecision",
    },
    idempotent: true,
    summary: "Approve volunteer hours",
  },
  post_api_v1_admin_volunteer_hours_by_id_reject: {
    method: "POST",
    path: "/api/v1/admin/volunteer-hours/{id}/reject",
    body: {
      $ref: "#/components/schemas/VolunteerDecision",
    },
    idempotent: true,
    summary: "Reject volunteer hours",
  },
  post_api_v1_admin_volunteer_hours_by_id_correct: {
    method: "POST",
    path: "/api/v1/admin/volunteer-hours/{id}/correct",
    body: {
      $ref: "#/components/schemas/VolunteerDecision",
    },
    idempotent: true,
    summary: "Correct volunteer hours",
  },
  get_api_v1_events_by_id_evaluation_form: {
    method: "GET",
    path: "/api/v1/events/{id}/evaluation-form",
    body: null,
    idempotent: false,
    summary: "Get evaluation form for event",
  },
  post_api_v1_events_by_id_evaluations: {
    method: "POST",
    path: "/api/v1/events/{id}/evaluations",
    body: {
      $ref: "#/components/schemas/EventEvaluationRequest",
    },
    idempotent: true,
    summary: "Create evaluation for event",
  },
  get_api_v1_admin_events_by_id_reports_by_report: {
    method: "GET",
    path: "/api/v1/admin/events/{id}/reports/{report}",
    body: null,
    idempotent: false,
    summary: "Get a selected event report",
  },
  post_api_v1_admin_events_by_id_reports_export: {
    method: "POST",
    path: "/api/v1/admin/events/{id}/reports/export",
    body: {
      $ref: "#/components/schemas/EventExportRequest",
    },
    idempotent: true,
    summary: "Export reports for event",
  },
  get_api_v1_admin_event_exports_by_id: {
    method: "GET",
    path: "/api/v1/admin/event-exports/{id}",
    body: null,
    idempotent: false,
    summary: "Get event export",
  },
  get_api_v1_admin_event_jobs: {
    method: "GET",
    path: "/api/v1/admin/event-jobs",
    body: null,
    idempotent: false,
    summary: "List event jobs",
  },
  post_api_v1_admin_event_jobs_by_id_retry: {
    method: "POST",
    path: "/api/v1/admin/event-jobs/{id}/retry",
    body: {
      $ref: "#/components/schemas/EventAction",
    },
    idempotent: true,
    summary: "Retry event job",
  },
} as const;
export const engagementInputSchemas: Record<string, unknown> = {
  ReminderPreferenceRequest: {
    type: "object",
    properties: {
      remindersEnabled: {
        type: "boolean",
      },
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  OpportunityRequest: {
    type: "object",
    properties: {
      titleAr: {
        type: "string",
      },
      sourceUrl: {
        type: "string",
      },
      type: {
        type: "string",
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      summaryAr: {
        type: "string",
        nullable: true,
      },
      summaryEn: {
        type: "string",
        nullable: true,
      },
      contentAr: {
        type: "string",
        nullable: true,
      },
      contentEn: {
        type: "string",
        nullable: true,
      },
      sourceName: {
        type: "string",
        nullable: true,
      },
      applicationUrl: {
        type: "string",
        nullable: true,
      },
      opensAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      deadlineAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      timezoneId: {
        type: "string",
      },
      isFeatured: {
        type: "boolean",
      },
      audiences: {
        type: "array",
        items: {
          $ref: "#/components/schemas/OpportunityAudienceRequest",
        },
        nullable: true,
      },
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      presentation: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/OpportunityPresentation",
          },
        ],
        nullable: true,
      },
      eligibleStudyYears: {
        type: "array",
        items: {
          type: "integer",
          format: "int32",
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  OpportunityAudienceRequest: {
    type: "object",
    properties: {
      audienceMode: {
        type: "string",
      },
      batchId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      academicYearId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      teamId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  OpportunityPresentation: {
    type: "object",
    properties: {
      field: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      location: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      mode: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      eligibility: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      tags: {
        type: "array",
        items: {
          $ref: "#/components/schemas/LocalizedText",
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  LocalizedText: {
    type: "object",
    properties: {
      ar: {
        type: "string",
        nullable: true,
      },
      en: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EngagementAction: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      revisionId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      reason: {
        type: "string",
        nullable: true,
      },
      reviewerId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      status: {
        type: "string",
        nullable: true,
      },
      feedback: {
        type: "string",
        nullable: true,
      },
      internalNotes: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EventDefinition: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      slug: {
        type: "string",
      },
      titleAr: {
        type: "string",
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      summaryAr: {
        type: "string",
        nullable: true,
      },
      summaryEn: {
        type: "string",
        nullable: true,
      },
      descriptionAr: {
        type: "string",
        nullable: true,
      },
      descriptionEn: {
        type: "string",
        nullable: true,
      },
      teamId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      activityId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      conferenceId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      startsAt: {
        type: "string",
        format: "date-time",
      },
      endsAt: {
        type: "string",
        format: "date-time",
      },
      timezoneId: {
        type: "string",
      },
      locationMode: {
        type: "string",
      },
      locationNameAr: {
        type: "string",
        nullable: true,
      },
      locationNameEn: {
        type: "string",
        nullable: true,
      },
      locationInstructionsAr: {
        type: "string",
        nullable: true,
      },
      locationInstructionsEn: {
        type: "string",
        nullable: true,
      },
      publicOnlineUrl: {
        type: "string",
        nullable: true,
      },
      registrationOpensAt: {
        type: "string",
        format: "date-time",
      },
      registrationClosesAt: {
        type: "string",
        format: "date-time",
      },
      cancellationDeadlineAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      capacity: {
        type: "integer",
        format: "int32",
        nullable: true,
      },
      waitlistEnabled: {
        type: "boolean",
      },
      promotionConfirmationHours: {
        type: "integer",
        format: "int32",
      },
      attendanceMode: {
        type: "string",
      },
      checkinOpensAt: {
        type: "string",
        format: "date-time",
      },
      checkinClosesAt: {
        type: "string",
        format: "date-time",
      },
      checkoutOpensAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      checkoutClosesAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      certificateEnabled: {
        type: "boolean",
      },
      certificateRule: {
        type: "string",
      },
      minimumDurationPercentage: {
        type: "number",
        format: "double",
        nullable: true,
      },
      certificateTemplateId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      autoIssueCertificates: {
        type: "boolean",
      },
      evaluationEnabled: {
        type: "boolean",
      },
      volunteerHoursEnabled: {
        type: "boolean",
      },
      defaultVolunteerHours: {
        type: "number",
        format: "double",
        nullable: true,
      },
      audiences: {
        type: "array",
        items: {
          $ref: "#/components/schemas/EventAudienceRequest",
        },
      },
      registrationQuestions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/DynamicQuestionRequest",
        },
      },
      evaluationQuestions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/DynamicQuestionRequest",
        },
      },
      assets: {
        type: "array",
        items: {
          $ref: "#/components/schemas/EventAssetRequest",
        },
      },
    },
    additionalProperties: false,
  },
  EventAudienceRequest: {
    type: "object",
    properties: {
      audienceMode: {
        type: "string",
      },
      batchId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      academicYearId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      teamId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      gender: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  DynamicQuestionRequest: {
    type: "object",
    properties: {
      textAr: {
        type: "string",
      },
      type: {
        type: "string",
      },
      textEn: {
        type: "string",
        nullable: true,
      },
      required: {
        type: "boolean",
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
      options: {
        type: "array",
        items: {
          type: "string",
        },
        nullable: true,
      },
      active: {
        type: "boolean",
      },
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EventAssetRequest: {
    type: "object",
    properties: {
      assetId: {
        type: "string",
        format: "uuid",
      },
      role: {
        type: "string",
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
    },
    additionalProperties: false,
  },
  EventAction: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      reason: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EventRegistrationRequest: {
    type: "object",
    properties: {
      answers: {
        type: "array",
        items: {
          $ref: "#/components/schemas/DynamicAnswer",
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  DynamicAnswer: {
    type: "object",
    properties: {
      questionId: {
        type: "string",
        format: "uuid",
      },
      value: {
        description:
          "Domain JSON serialized as its JSON value. Content/block validation is applied by the owning domain.",
      },
    },
    additionalProperties: false,
  },
  EventManualRegistrationRequest: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        format: "uuid",
      },
      reason: {
        type: "string",
      },
      answers: {
        type: "array",
        items: {
          $ref: "#/components/schemas/DynamicAnswer",
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EventScanRequest: {
    type: "object",
    properties: {
      eventId: {
        type: "string",
        format: "uuid",
      },
      token: {
        type: "string",
      },
      operation: {
        type: "string",
      },
    },
    additionalProperties: false,
  },
  EventAttendanceRequest: {
    type: "object",
    properties: {
      registrationId: {
        type: "string",
        format: "uuid",
      },
      reason: {
        type: "string",
      },
      checkinAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      checkoutAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      eligibleOverride: {
        type: "boolean",
      },
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EventTemplateRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      titleAr: {
        type: "string",
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      layout: {
        $ref: "#/components/schemas/CertificateLayout",
      },
      backgroundAssetId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      status: {
        type: "string",
      },
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  CertificateLayout: {
    type: "object",
    properties: {
      accentColor: {
        type: "string",
      },
      subtitleAr: {
        type: "string",
        nullable: true,
      },
      footerAr: {
        type: "string",
        nullable: true,
      },
      placeholders: {
        type: "array",
        items: {
          type: "string",
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  VolunteerRequest: {
    type: "object",
    properties: {
      hours: {
        type: "number",
        format: "double",
      },
      activityDescription: {
        type: "string",
      },
      serviceDate: {
        type: "string",
        format: "date",
      },
      evidenceAssetIds: {
        type: "array",
        items: {
          type: "string",
          format: "uuid",
        },
        nullable: true,
      },
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  AdminVolunteerRequest: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        format: "uuid",
      },
      hours: {
        type: "number",
        format: "double",
      },
      activityDescription: {
        type: "string",
      },
      serviceDate: {
        type: "string",
        format: "date",
      },
      reason: {
        type: "string",
      },
      eventId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      evidenceAssetIds: {
        type: "array",
        items: {
          type: "string",
          format: "uuid",
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  VolunteerDecision: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      reason: {
        type: "string",
      },
      approvedHours: {
        type: "number",
        format: "double",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EventEvaluationRequest: {
    type: "object",
    properties: {
      answers: {
        type: "array",
        items: {
          $ref: "#/components/schemas/DynamicAnswer",
        },
      },
    },
    additionalProperties: false,
  },
  EventExportRequest: {
    type: "object",
    properties: {
      report: {
        type: "string",
      },
      format: {
        type: "string",
      },
    },
    additionalProperties: false,
  },
};
