# Image Upload & Editing — Design Spec

**Date:** 2026-05-21
**Status:** Approved

---

## Problem

The `image` field type exists in the slide data model and asset upload API is in place, but the editor renders image fields as a plain text input. There is no upload UI, no preview, and no way to crop, scale, or rotate an image. Slide templates that could use images are absent.

---

## Goals

1. Replace the text input for `image` fields with a proper upload + preview UI
2. Add non-destructive crop / scale / rotate via a modal editor (Cropper.js)
3. Store transform metadata alongside the asset ID so edits can be re-opened and changed
4. Add a Handlebars `{{img}}` helper that renders the image with transforms applied via CSS
5. Add three new image-focused slide templates: `image-full`, `image-side`, `image-grid`

---

## Library Choice: Cropper.js

**Selected:** `cropperjs` (vanilla JS, MIT, ~28 KB gzipped, 13k+ GitHub stars)

- Framework-agnostic — works cleanly in Svelte via `onMount` / action
- Handles crop region, zoom, and rotation natively
- Used only in the editor; the rendered slide uses only CSS — no runtime dependency
- Rejected alternatives: `svelte-easy-crop` (less mature), Pintura (commercial), Fabric.js (overkill)

---

## Data Model

### Image field value — extended format

The `image` field currently accepts a plain string (asset ID). We extend it to accept an object while keeping backward compatibility:

```ts
type ImageFieldValue =
  | string   // legacy: bare asset ID, no transforms
  | {
      id: string;          // asset ID
      cropX: number;       // % of original width (0–100), left edge of crop
      cropY: number;       // % of original height (0–100), top edge of crop
      cropW: number;       // % of original width for crop region width
      cropH: number;       // % of original height for crop region height
      rotate: number;      // degrees, multiples of 90 accepted; free rotation supported
      scale: number;       // zoom factor ≥ 1.0 (1.0 = no zoom beyond crop fit)
    }
```

Storing as percentage keeps values device/resolution-independent. Existing slides with bare string values continue to render without transforms.

### No DB schema change needed

`data` is `jsonb` — the richer object is stored as-is.

---

## Handlebars Helper: `{{img field wrapperClass}}`

New helper registered in `src/renderer/handlebars.ts`:

```handlebars
{{img heroImage "slide-image"}}
```

Renders:

```html
<div class="slide-image img-wrap" style="--img-url: url('/api/assets/UUID'); --crop-x: 25%; --crop-y: 10%; --crop-w: 75%; --crop-h: 80%; --rotate: 15deg;">
  <img src="/api/assets/UUID" alt="" style="transform: rotate(15deg) scale(...);" loading="lazy" />
</div>
```

The wrapper div uses CSS custom properties to drive `object-position` / `clip-path` / `transform` on the inner `img`. This avoids injecting long inline style strings into the template source and makes the CSS easy to override per theme.

A base `.img-wrap` ruleset is added to the global slide renderer CSS (not scoped to any type):

```css
.img-wrap {
  position: relative;
  overflow: hidden;
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: calc(var(--crop-x, 0%) * -1) calc(var(--crop-y, 0%) * -1);
  transform: rotate(var(--rotate, 0deg)) scale(var(--scale, 1));
  transform-origin: center center;
}
```

When the field value is a bare string, defaults apply (no transforms).

---

## Editor UI

### ImageFieldEditor.svelte (new component)

Replaces the `<input type="text">` inside `FieldEditor.svelte` for fields with `type === 'image'`.

**States:**
1. **Empty** — dashed placeholder with "Upload image" button and drag-drop zone
2. **Image loaded** — thumbnail preview (16:9, object-fit cover), "Replace" and "Edit" buttons, "Remove" (×) icon
3. **Uploading** — spinner overlay on thumbnail, progress disabled (streaming not needed)
4. **Editor open** — full-screen modal with Cropper.js canvas

**Upload flow:**
1. User clicks "Upload" or drops a file → validates MIME (image/\*) and size (max 20 MB)
2. `POST /api/assets` with `multipart/form-data` → returns `{ id }`
3. Field value updated to `{ id, cropX: 0, cropY: 0, cropW: 100, cropH: 100, rotate: 0, scale: 1 }`

**Edit flow:**
1. User clicks "Edit" → modal opens
2. `<img>` element (full asset URL) mounted in modal, Cropper.js initialized on `onMount`
3. Toolbar: Crop free / Crop 16:9 / Crop 4:3 / Crop 1:1 | Rotate −90° / +90° | Zoom in/out | Reset | Done
4. "Done" reads Cropper.js `getData()` → converts pixel crop to percentages → updates field value object
5. Modal closes; thumbnail re-renders with updated transforms

**No server-side image processing.** Cropper.js is used purely to capture crop/rotate/scale intent. The actual pixel manipulation never happens — CSS applies the transforms at render time. This keeps the architecture simple and edits always reversible.

### FieldEditor.svelte change

```svelte
{:else if field.type === 'image'}
  <ImageFieldEditor bind:value={fieldValue} deckId={deckId} />
```

---

## New Slide Templates

### `image-full`

Full-bleed image with optional headline and caption overlaid at the bottom.

**Fields:** `image` (required), `headline` (text, optional), `caption` (text, optional), `overlay` (bool, default true — darkens image for text legibility)

**Layout:** Image fills 100% of slide. Text sits in a bottom bar with semi-transparent background when `overlay` is true.

---

### `image-side`

50/50 split: image on left, text block on right (or reversed via a `flip` bool).

**Fields:** `image` (required), `title` (richtext), `body` (richtext), `flip` (bool, default false)

**Layout:** CSS grid `grid-template-columns: 1fr 1fr`. On mobile: stacks vertically (image on top).

---

### `image-grid`

2×2 grid of images with optional per-image captions.

**Fields:** `images` (list, max 4 items, each: `image` + `caption` text)

**Layout:** CSS grid `grid-template-columns: 1fr 1fr`, `grid-template-rows: 1fr 1fr`. Fills slide area. 1–4 images: layout adapts (1 = full, 2 = top row only, 3 = asymmetric, 4 = full grid). On mobile: single column.

---

## i18n

All user-visible strings added to `src/lib/i18n/messages.ts` with `da` and `en` values:

- `imageUpload.uploadButton` — "Upload image" / "Upload billede"
- `imageUpload.replaceButton` — "Replace" / "Erstat"
- `imageUpload.editButton` — "Edit" / "Rediger"
- `imageUpload.removeButton` — "Remove" / "Fjern"
- `imageUpload.dragDrop` — "or drag and drop" / "eller træk og slip"
- `imageUpload.uploading` — "Uploading…" / "Uploader…"
- `imageUpload.invalidType` — "Please select an image file" / "Vælg en billedfil"
- `imageUpload.tooLarge` — "File must be under 20 MB" / "Filen skal være under 20 MB"
- `imageEditor.title` — "Edit image" / "Rediger billede"
- `imageEditor.crop16x9` — "16:9" / "16:9"
- `imageEditor.crop4x3` — "4:3" / "4:3"
- `imageEditor.crop1x1` — "Square" / "Kvadrat"
- `imageEditor.cropFree` — "Free" / "Fri"
- `imageEditor.rotateCCW` — "Rotate left" / "Roter venstre"
- `imageEditor.rotateCW` — "Rotate right" / "Roter højre"
- `imageEditor.reset` — "Reset" / "Nulstil"
- `imageEditor.done` — "Done" / "Færdig"

---

## Mobile

- `ImageFieldEditor`: thumbnail + buttons stack vertically on narrow viewports; drag-drop zone hidden, upload button full-width
- Image editor modal: full-screen on mobile; toolbar scrolls horizontally if needed
- New slide templates all include `@media (max-width: 768px)` rules (image-side stacks, image-grid single-column)

---

## Files Changed / Created

| Path | Action |
|------|--------|
| `package.json` | add `cropperjs` |
| `src/renderer/handlebars.ts` | add `img` helper |
| `src/renderer/renderer.ts` | add `.img-wrap` base CSS |
| `src/lib/i18n/messages.ts` | add image upload/editor strings |
| `src/lib/components/ImageFieldEditor.svelte` | new component |
| `src/routes/decks/[id]/FieldEditor.svelte` | wire in ImageFieldEditor |
| `src/slide-types/image-full.ts` | new slide type |
| `src/slide-types/image-side.ts` | new slide type |
| `src/slide-types/image-grid.ts` | new slide type |
| `scripts/seed.ts` | register the 3 new slide types |
| `src/routes/docs/slides.md` (or equivalent) | document image field + new types |

---

## Out of Scope

- Server-side image resizing / optimization (future)
- AI-powered background removal (future)
- Image galleries / asset browser (future)
- Animated GIFs in slides (not prevented, just not a focus)
