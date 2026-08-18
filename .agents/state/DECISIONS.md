# Frontend Decisions

- Frontend and backend are separate repositories.
- Frontend is designed and completed first.
- Mock data mode is the default until integration phase.
- Components depend on service interfaces, never directly on backend implementation.
- API contract is the cross-repository source of truth.
