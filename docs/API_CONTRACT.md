# StudyForge Frontend ↔ Backend API Contract

The frontend and backend are separate repositories. This file describes the stable boundary. Keep it synchronized with the backend repository's contract.

## Base conventions
- JSON REST API.
- Base path: `/api/v1`.
- Authenticated requests use `Authorization: Bearer <Firebase ID token>`.
- IDs are opaque strings.
- Dates are ISO-8601 strings.
- Errors return a stable machine-readable code plus human-readable message.

## Minimum resources
- `GET /health`
- `GET /dashboard`
- `GET /learning-paths`
- `POST /learning-paths`
- `GET /learning-paths/:pathId`
- `PATCH /learning-paths/:pathId`
- `POST /learning-paths/:pathId/modules`
- `POST /modules/:moduleId/topics`
- `PATCH /topics/:topicId`
- `GET /topics/:topicId/notes`
- `PUT /topics/:topicId/notes`
- `GET /topics/:topicId/practice`
- `POST /topics/:topicId/practice`
- `PATCH /practice/:practiceId`

Frontend agents must not invent server-only fields without updating this contract.
