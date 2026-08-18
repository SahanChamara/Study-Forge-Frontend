# Frontend Decisions

- Frontend and backend are separate repositories.
- Frontend is designed and completed first.
- Mock data mode is the default until integration phase.
- Components depend on service interfaces, never directly on backend implementation.
- API contract is the cross-repository source of truth.
- Phase 0 established agent personas, Information Architecture, screen inventory, L-N-P-V-R user flow framework, CSS design token architecture, expanded domain types in `src/types.ts`, and abstract service layer contract `src/services/api.ts`.
- Phase 1 built the responsive App Shell with mobile navigation drawer, top-bar dynamic breadcrumbs, a complete reusable UI primitive library in `src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Skeleton`, `EmptyState`, `Alert`, `Spinner`), multi-tabbed auth experience with one-click demo access, and separated context hooks to satisfy React Fast Refresh.
- Phase 2 built the command-center Dashboard with learner streak tracking, active topic resume card, 6 key progress metric counters, curriculum mastery progress bars, L-N-P-V-R guide, the searchable Learning Paths directory with level filter chips and creation modal, and the Path Detail view featuring module hierarchy cards, interactive topic status/mastery selectors, and module/topic creation dialogs.
