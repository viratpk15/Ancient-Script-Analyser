---
name: dependencies
description: Dependency management for Ancient Scripts AI — Python packages, Node packages, and upgrade rules.
---

# Dependencies — Ancient Scripts AI

## Purpose

Documents all dependencies, their roles, approved versions, and the rules for adding or upgrading packages. Prevents dependency bloat and security vulnerabilities.

## When to Use

- When adding a new Python or Node.js dependency.
- When upgrading an existing package.
- When the project fails to install or start due to dependency issues.

## Python Backend Dependencies

File: `backend/requirements.txt`

| Package | Role | Notes |
| :--- | :--- | :--- |
| `fastapi` | Web framework + automatic API documentation | FastAPI requires an ASGI server (uvicorn) |
| `uvicorn` | ASGI server for FastAPI | Development: `--reload`. Production: remove `--reload`, add `--workers N` |
| `python-multipart` | Multipart form data parsing | Required for file uploads via `UploadFile` |
| `opencv-python-headless` | Computer vision | Headless variant for server environments (no GUI). Do NOT use `opencv-python` on servers |
| `pydantic` | Data validation and settings | FastAPI depends on it; also used for future request/response models |
| `numpy` | Numerical arrays | Required by OpenCV for image data |

**Currently unpinned** — all packages install latest. For production, pin versions.

### Adding a Python Dependency

1. Test locally: `pip install <package>`.
2. Confirm it does not conflict with existing packages: `pip check`.
3. Add to `requirements.txt`.
4. Update this skill with the new entry.
5. Test that `pip install -r requirements.txt` from scratch still works.

### Rules for Python Dependencies

- Use `opencv-python-headless`, NOT `opencv-python` on servers (GUI bindings are unneeded and cause issues in headless environments).
- Do not add heavy dependencies (PyTorch, TensorFlow) without documenting the GPU/CPU inference strategy and performance impact.
- If adding ML framework dependencies, add a separate `requirements-ml.txt` and note it is optional.
- Do not use packages that require compiled extensions on Windows unless confirmed compatible.

## Node.js Frontend Dependencies

File: `frontend/package.json`

### Production Dependencies
| Package | Role |
| :--- | :--- |
| `react` | UI framework |
| `react-dom` | React DOM rendering |

### Development Dependencies
| Package | Role |
| :--- | :--- |
| `@vitejs/plugin-react` | Vite plugin for React fast refresh |
| `vite` | Build tool and dev server |
| `typescript` | TypeScript language |
| `@types/react` | TypeScript types for React |
| `@types/react-dom` | TypeScript types for ReactDOM |
| `oxlint` | Fast JavaScript/TypeScript linter |

### Adding a Node.js Dependency

1. Run `npm install <package>` for runtime dependencies.
2. Run `npm install --save-dev <package>` for dev-only dependencies.
3. Confirm it does not break the TypeScript build: `npm run build`.
4. Update this skill with the new entry.

### Rules for Node.js Dependencies

- No CSS frameworks (Tailwind, Bootstrap, MUI). Use vanilla CSS.
- No heavy UI component libraries. Build custom components.
- No client-side markdown rendering libraries (current implementation uses `<pre>` — sufficient for prototype).
- No jQuery.
- Do not add runtime dependencies that duplicate existing native browser or React capabilities.
- Do not upgrade major versions of React or Vite without testing the full application.

## Upgrade Policy

- Patch versions (x.y.Z): upgrade freely.
- Minor versions (x.Y.z): test after upgrade, especially for OpenCV and FastAPI.
- Major versions (X.y.z): review breaking changes, test fully, update documentation.
- Security vulnerabilities: upgrade immediately regardless of version policy.

## Definition of Done

- `pip install -r requirements.txt` completes without errors.
- `npm install` completes without errors.
- `npm run build` produces no TypeScript errors.
- Backend starts: `python -m uvicorn main:app --reload`.
- No packages with known critical CVEs.
