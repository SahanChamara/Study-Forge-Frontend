# /frontend-phase <number>

Execute only the requested frontend phase.

1. Read `docs/FRONTEND_PHASE_PLAN.md`, `docs/PRODUCT_SPEC.md`, `docs/API_CONTRACT.md`, `.agents/state/PHASE_STATUS.md`, and `.agents/state/DECISIONS.md`.
2. Restate the phase acceptance criteria as a short implementation checklist.
3. Use mock mode unless the requested phase explicitly concerns backend integration.
4. Implement the smallest coherent vertical UX slice.
5. Run lint/typecheck/tests/build when available.
6. Have @qa inspect loading, empty, success, validation, error, mobile, desktop, keyboard, and accessibility states.
7. Update phase status and decisions.
8. Stop at the phase boundary. Do not start the next phase automatically.
