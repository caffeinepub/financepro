# Specification

## Summary
**Goal:** Wire the React frontend to the Motoko `backend/main.mo` canister using the generated actor interface, and make authenticated initialization (including access-control setup) reliable and non-blocking for normal users.

**Planned changes:**
- Update frontend backend-call wiring to use the generated canister interface for all UI-invoked methods (initialization, profile/goal/investment CRUD, linking, analytics, dashboard) and align TypeScript types/signatures with `main.mo`.
- Ensure the authenticated flow creates an identity-bound actor and calls `ensureInitialized()` after Internet Identity login and before enabling React Query requests/mutations that require `#user` permissions.
- Standardize access-control secret handling so missing/empty `caffeineAdminToken` never blocks actor creation/initialization, and invalid tokens fail non-fatally (without breaking normal user usage).
- Use the existing ConnectionErrorState + Retry to re-attempt actor creation/initialization when initialization fails.

**User-visible outcome:** After logging in with Internet Identity, the app reliably loads the authenticated dashboard/goals/investments/analytics without method/type errors or unauthorized traps, and initialization failures show a retryable connection error instead of blocking normal usage.
