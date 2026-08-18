# API Contract
Base `/api/v1`; all except `GET /health` require `Authorization: Bearer <Firebase ID token>`.

- `GET /health`
- `GET|POST /learning-paths`
- `GET|DELETE /learning-paths/:pathId`
- `POST /learning-paths/:pathId/modules`
- `POST /learning-paths/:pathId/topics`
- `PATCH /learning-paths/:pathId/topics/:topicId`
- `POST /learning-paths/:pathId/seed/linux-devops`
- `GET|POST /notes`
- `PATCH|DELETE /notes/:noteId`
- `GET|POST /practice`
- `PATCH|DELETE /practice/:taskId`
- `GET /dashboard`
