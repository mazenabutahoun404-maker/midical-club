# Recruitment feature

V0.9 implements public role discovery, position detail, explicit draft/submission, personal tracking, interviews, onboarding, team membership and volunteer hours.

Data flow:

`pages → useContent hooks → MedClubServices.recruitment → local preview adapter`

The feature also contributes public position records to global search, interview entries to the calendar and application updates to notifications.

Important: `ClubMembershipProfile` is organizational data only. It must never be used as an authorization source. Production permissions belong to a separately enforced capability system.
