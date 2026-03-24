# Hosted Mode

Use this when the user has an access code and URL for a hosted Kaksh deployment and wants to skip local setup.

## Access Code Setup

1. Read `accessCode` from skill config (`~/.openclaw/openclaw.json` → `skills.entries.kakshai.config.accessCode`).
2. If found, use it directly. Do not ask the user to paste the code into chat.
3. If not found, tell the user to add their access code and URL to the config file:
   ```
   Edit ~/.openclaw/openclaw.json and set skills.entries.kakshai.config.accessCode to your access code (starts with sk-) and skills.entries.kakshai.config.url to your hosted Kaksh base URL.
   ```
   Wait for the user to confirm before continuing. Do not ask them to paste the code in chat.
4. Verify connectivity: `GET {url}/api/health` with `Authorization: Bearer <access-code>`
   - On success: confirm connection and proceed to generation.
   - On failure (401): access code is invalid, ask the user to check or regenerate it and update the config file.
   - On failure (network): suggest checking network or trying local mode.

## Generating a Classroom

Follow the same generation flow as [generate-flow.md](generate-flow.md) with these differences:

- **Base URL**: use `skills.entries.kakshai.config.url`
- **Authorization**: Include header `Authorization: Bearer <access-code>` on all API requests
- **Classroom URL**: `{url}/classroom/{id}`

### Feature Detection in Hosted Mode

Before generating, query `GET {url}/api/health` (with auth header) to check `capabilities`. Automatically include optional feature flags (`enableWebSearch`, `enableImageGeneration`, etc.) based on what the server supports. Do not send new fields if the server does not return `capabilities` (older version). This ensures forward compatibility — the hosted instance may update on a different schedule than the local codebase.

## Quota

- 10 generations per day, independent of web UI quota
- If generation returns 403 with `Daily quota exhausted`, inform the user of the daily limit and that it resets at midnight.

## Error Handling

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| 401 | Invalid access code | Ask user to check or regenerate the code and update their config |
| 403 | Quota exhausted | Inform daily limit (10), suggest trying tomorrow |
| 500 | Server error | Suggest retrying later or switching to local mode |
