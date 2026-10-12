# Study together: frontend and backend handoff

V0.13.29 keeps the existing quiet-room API contract and route names. “Study together” is the clearer UI label. This is a quiet co-study room with real membership, goals, recent presence, and a shared focus/break deadline. It is not a video or chat service.

## Student experience

1. Name a room, state your goal, and choose seats plus focus/break durations.
2. Invite classmates with the room code. In API mode, Copy invite produces a join-page link.
3. Each joined student sees the other actual members and their goals. Empty seats are clearly distinguished from people; no fabricated peers.
4. The host starts the session. All clients read the same deadline. The service advances focus to break, then completes the session.
5. Only the host can start, move to break, or finish. Host departure requires confirmation because it ends the session for everyone. A member can simply leave.
6. The screen exposes loading, failed refresh, and failed presence states. Copying an invite and completed actions produce short feedback; reduced-motion remains supported.

## Existing integration boundary

Use `connectStudyHub(existingServices, options)` from `connect-study-hub.ts`. Preserve the other backend adapters. Map paths to the real backend through the existing HTTP adapter configuration; do not replace the approximately 600 APIs or guess their schemas.

| Operation | Existing adapter path | Frontend behavior |
|---|---|---|
| Room list | `GET /me/quiet-rooms` | Account-owned lobby; refresh after actions, every 30 seconds while a room is selected |
| Selected room | `GET /quiet-rooms/{id}` | Poll every 5 seconds while visible; retry control on failure |
| Create | `POST /quiet-rooms` | Validated name, goal, capacity and durations; reset successful draft |
| Join | `POST /quiet-rooms/join` | Invite code + personal goal; capacity errors remain visible |
| Presence | `PUT /quiet-rooms/{id}/presence` | Heartbeat every 30 seconds while visible; no overlapping heartbeats; stops on unmount or finished session |
| Leave | `DELETE /quiet-rooms/{id}/members/me` | Membership removal; host exit closes the room |
| Timer | `POST /quiet-rooms/{id}/timer` | Host-only, optimistic version/If-Match boundary; refresh after conflict |

The exact request/response schemas are already in `medclub-study-additions.openapi.json`. `QuietRoom` carries the host, capacity, phase, endsAt, member goals and lastSeenAt. A failed presence request must not appear as a successful connection.

## Backend acceptance before production

- Enforce authenticated membership for reads/presence, host authority for timer changes, capacity atomically, invite expiry, and optimistic versions server-side.
- Use server deadlines, UTC timestamps, and automatic focus → break → finished reconciliation. Client countdowns are presentation only. A 5-second polling interval implies a short delay for new members and phase changes; it is not a realtime socket connection.
- Verify two actual accounts on two devices joining the same room, seeing goals/presence, sharing the timer, recovering after disconnection, and seeing host termination. Check rate limits at the expected concurrency.
- The current local preview supports accounts in one browser only. The API adapter exists, but no real backend URL/OpenAPI contract was supplied for this pass. Cross-device behavior is therefore unverified and must not be claimed as deployed.

No new endpoint was added in this UI pass. The 5-second selected-room query now uses the existing `getRoom` boundary instead of relying solely on the room list. Future chat, voice/video, moderation, or room discovery would require a separate agreed contract.
