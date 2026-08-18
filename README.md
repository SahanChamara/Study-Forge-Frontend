# StudyForge Frontend Agentic

Independent React + TypeScript frontend for StudyForge. It is intentionally developed before the backend and must remain runnable in mock mode.

## Development approach

1. Open this folder as its own Antigravity workspace.
2. Read `AGENTS.md`, `.agents/agents.md`, and `docs/FRONTEND_PHASE_PLAN.md`.
3. Begin with `/frontend-phase 0`, then continue one approved phase at a time.
4. Keep `VITE_DATA_MODE=mock` until Phase 6.
5. Do not add NestJS or Firebase Admin code to this repository.

## Local start

```bash
npm install
cp .env.example .env
npm run dev
```

## Integration boundary

`docs/API_CONTRACT.md` defines what the future backend must expose. Components should depend on `src/services/studyforge.ts`; the selected adapter can be mock or remote.
