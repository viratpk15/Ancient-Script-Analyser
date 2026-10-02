---
name: image-upload
description: Image upload handling guide for Ancient Scripts AI — frontend file selection, drag-and-drop, and backend image decoding.
---

# Image Upload — Ancient Scripts AI

## Purpose

Documents the complete image upload flow from user file selection to backend image decoding. Guides future agents modifying upload behaviour, validation, or file type support.

## When to Use

- When modifying the `ImageUpload` component.
- When adding file type or size validation.
- When debugging upload failures.
- When adding URL-based image input.

## Upload Flow

```
User selects file (file picker or drag-and-drop)
    ↓
ImageUpload component fires onSelectImage(file: File)
    ↓
App.tsx: handleImageSelect(file)
    ├── Creates blob URL: URL.createObjectURL(file)
    ├── Sets imagePreviewUrl → image appears in preview panel
    ├── Creates Image() object to read natural dimensions async
    ├── Sets imageMeta (name, sizeKb, dimensions)
    └── Resets analysisStage to 0 and result to null

User clicks "Start Epigraphic Analysis"
    ↓
App.tsx: startAnalysis()
    ├── Creates FormData → appends file as 'file' field
    ├── Fires fetch('POST http://localhost:8000/analyze', FormData)
    └── Backend receives multipart form, decodes with cv2.imdecode
```

## Frontend Component: `ImageUpload.tsx`

- Renders a drag-and-drop zone with a hidden `<input type="file">`.
- `accept="image/*"` allows all image MIME types.
- On change or drop: calls `onSelectImage(file)` with the first file.
- Does not perform size or type validation (improvement needed).
- Shows hover state via CSS when dragging over the zone.

**Props:**
```typescript
interface ImageUploadProps {
  onSelectImage: (file: File) => void;
}
```

## Backend Decoding: `main.py`

```python
contents = await file.read()
nparr = np.frombuffer(contents, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

if img is None:
    raise HTTPException(status_code=400, detail="Failed to decode image raster")
```

OpenCV `imdecode` supports: JPEG, PNG, BMP, TIFF, WebP, and many others. It ignores the Content-Type header and decodes by inspecting the file magic bytes.

## URL-Based Input

The backend also accepts a `url` form field (alternative to file upload):

```python
elif url is not None:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        nparr = np.asarray(bytearray(response.read()), dtype="uint8")
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
```

The frontend currently only uses file upload (no URL input UI). URL input is backend-only for now.

## Validation Gaps (to fix)

| Validation | Current State | Recommended Fix |
| :--- | :--- | :--- |
| File size limit | ❌ Missing | Reject files > 20 MB in `main.py` before `imdecode` |
| MIME type check | ⚠️ Browser only | Check Content-Type header in `main.py` |
| Multiple files | ✅ Handled | Only first file processed |
| Empty file | ✅ Handled | `cv2.imdecode` returns `None`, triggers 400 |
| Non-image file | ✅ Handled | `cv2.imdecode` returns `None`, triggers 400 |
| Corrupted image | ✅ Handled | `cv2.imdecode` returns `None`, triggers 400 |

## Adding File Size Validation

In `main.py`, before the `nparr = np.frombuffer(...)` line:

```python
MAX_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB
if len(contents) > MAX_SIZE_BYTES:
    raise HTTPException(status_code=413, detail="File too large. Maximum 20 MB allowed.")
```

## Rules

- Never store the original filename as a filesystem path (the current implementation doesn't — uploads stay in memory).
- Never execute uploaded files.
- Always check that `cv2.imdecode()` returns a non-None value before calling `process_image()`.
- If URL input is added to the frontend, sanitise the URL and validate that it points to an image (not an arbitrary network resource).
- When adding file type display to the UI, use `file.type` (MIME string from browser) for informational purposes only; never trust it for security validation.

## Definition of Done

- File upload works for JPEG, PNG, and TIFF.
- Files over 20 MB return HTTP 413.
- Non-image files return HTTP 400 with "Failed to decode image raster".
- The image preview appears immediately after selection without page reload.
- File metadata (name, size, dimensions) is displayed in the left panel.
