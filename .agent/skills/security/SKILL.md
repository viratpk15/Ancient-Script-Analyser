---
name: security
description: Security rules for Ancient Scripts AI — file upload safety, input validation, secrets, and deployment hardening.
---

# Security — Ancient Scripts AI

## Purpose

Defines the security rules for the Ancient Scripts AI platform, with particular focus on file upload safety. A research tool that accepts arbitrary file uploads from the internet requires careful input handling.

## When to Use

- When modifying file upload handling in `main.py` or `ImageUpload.tsx`.
- When adding new endpoints that accept user input.
- When configuring CORS or deployment settings.
- When adding environment variables or secrets.

## Current Security State

| Security Area | Status | Notes |
| :--- | :--- | :--- |
| File upload validation (type) | ⚠️ Weak | `accept="image/*"` in browser only; backend uses `cv2.imdecode` which will silently return `None` for non-images |
| File upload size limit | ❌ Missing | No maximum file size is enforced |
| CORS | ⚠️ Development | `allow_origins=["*"]` — must be restricted for production |
| MIME type validation | ❌ Missing | Content-Type header is not verified in the backend |
| Path traversal prevention | ✅ Not applicable | Files are read into memory as bytes; no filesystem paths from user input |
| Secret management | ✅ No secrets | No API keys or passwords in current codebase |
| Dependency vulnerabilities | ⚠️ Unmonitored | No automated dependency scanning configured |
| Malicious file execution | ✅ Not applicable | Uploaded files are never executed; only decoded by OpenCV |
| SQL injection | ✅ Not applicable | No SQL database in current implementation |

## File Upload Rules

1. **Never trust the Content-Type header.** A malicious user can send `Content-Type: image/png` with a non-image payload. Always verify that `cv2.imdecode()` returns a valid non-None numpy array.
2. **Enforce a maximum file size.** Add a size check before calling `imdecode`. Recommended limit: 20 MB for research use.
3. **Never execute uploaded files.** OpenCV `imdecode` decodes pixel data only. This is safe. Do not shell-execute, import, or `eval` any user-provided content.
4. **Never store uploaded files to disk without sanitising the filename.** The current implementation reads entirely to memory, which is the safest approach.
5. **Never use the original filename from the upload** as a filesystem path. If file persistence is added in future phases, generate a UUID-based filename.

## Recommended File Size Validation (to add to `main.py`)

```python
MAX_FILE_SIZE_MB = 20
if file is not None:
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 20 MB.")
```

## CORS

Current: `allow_origins=["*"]` — acceptable for localhost development only.

For production: set `allow_origins=["https://your-frontend-domain.com"]`.

Never use `allow_origins=["*"]` with `allow_credentials=True` — this is a security misconfiguration.

## Secrets and Environment Variables

- There are currently no secrets in this project.
- If a database password, API key, or model service token is added in future phases, it **must** be stored in an environment variable, never in source code.
- Use a `.env` file with `python-dotenv`, and add `.env` to `.gitignore`.
- Never commit `.env` files to git.

## Dependency Security

- Run `pip audit` periodically to check for known vulnerabilities in Python dependencies.
- Consider adding a `pip-audit` or `safety` check to the CI pipeline when one is set up.
- Pin dependency versions in `requirements.txt` for production (`fastapi==0.135.1`).

## Do Not

- Do not shell-execute user-provided filenames.
- Do not store uploaded files without UUID-based names.
- Do not hard-code passwords, tokens, or API keys.
- Do not use `allow_origins=["*"]` in production.
- Do not disable HTTPS in production.
- Do not return Python tracebacks in API responses.

## Definition of Done

- File uploads are validated for size before processing.
- `cv2.imdecode()` return value is always checked for `None`.
- No secrets are in source code.
- CORS is restricted to the known frontend origin in production environments.
