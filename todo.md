# slidt — todo

Status keys: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` needs design · `[!]` blocked

## In flight

(nothing right now — see "Up next")

## Up next

- [ ] **Template agent issues** — needs investigation:
  - Cannot close the overlay (likely z-index / pointer-events conflict with the template editor's full-bleed form wrapper).
  - Agent history disappears after refresh: drawer never fetches DB-stored message history on mount; UI starts empty even though server has the context. Fix: a `GET /api/decks/[id]/agent/history` endpoint and call on drawer open.
  - Should not save by default — agent edits should land in a "draft" channel until the user accepts them.
  - Undo wanted in the agent flow too — every agent tool call already returns `undoPatch`; surface a per-turn undo stack.
  - "Said it looked fine after emptying the slide": LLM behavior; consider a post-patch guardrail that warns when required fields go empty.

## Design first, then build

(nothing here right now — (2) edit-history v1 shipped without branching/cross-session undo)

## Done (recent)

- [x] (2) Persistent edit history v1 — slide_edits table, /api/decks/:id/history list, /history/:editId/revert; History drawer behind editor "more" menu, grouped by day with Revert per row
- [x] (8) Agent panel on the template editor (deck-scoped templates only — opens the existing drawer pointed at the parent deck)
- [x] (4) Slide list thumbnail mode (toggle in editor "more" menu, persisted in localStorage, IntersectionObserver-based lazy rendering)
- [x] Template editor full-bleed + name/slug top bar above both columns
- [x] (6) Agent panel surfaces "WORKING · &lt;tool_name&gt;…" while a tool call is in flight
- [x] Changelog at /docs/changelog — auto-generated from git log at build time, grouped by day, features as headline entries with fixes collapsed
- [x] API: `GET /api/issues` (admin) + `GET/PATCH/DELETE /api/issues/:id` so future agent reports can be triaged without psql
- [x] API: `GET /api/decks/:id/slide-types` returns global + deck-scoped types in one shot (id and name)
- [x] Agent panel: model badge in the header showing host (LOCAL/API) + model name; click to open settings
- [x] Settings: API metered note only shown when API model is selected
- [x] Nav: clicking the username (BRUGER/…) navigates to /settings
- [x] (1) Settings prefs auto-save on change (toggle/select); explicit save still works as fallback
- [x] (3) Editor action bar: `PRESENT | EXPORT | SHARE | more ▾ | AGENT`; theme picker + delete deck moved into "more"
- [x] (5) AI model selector grouped into Local (Ollama) / API; metered note added
- [x] (7) Agent slideType tools tolerate either UUID id or slug `name` (covers add_slide / patch_slide_type / delete_slide_type / inspect_slide_type)
- [x] Hover preview on slide-list rows
- [x] Cmd-Z / Ctrl-Z undo for delete / add / reorder / theme
- [x] Form column compaction (number into label, × into group box)
- [x] Unsaved-changes navigation guard on settings / themes / templates
- [x] Drop iframe `allow-scripts` (sandbox warning fix)
- [x] Inline-edit list-item fields
- [x] Deck-scoped templates view + admin promote-to-global
- [x] / 404 fix (redirect to /decks)
