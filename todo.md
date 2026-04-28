# slidt — todo

Status keys: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` needs design · `[!]` blocked

## In flight

(nothing right now — see "Up next")

## In flight

(nothing right now — see "Up next")

## Up next

(empty — next is the design conversation for (2))

## Design first, then build

- [?] **(2) Persistent edit history + time-travel + branch-from-point-in-time.** Sketched approach (needs sign-off):
  - Schema: `slide_edits { id, deckId, slideId, userId, at, kind, before jsonb, after jsonb }`. Every autosave + delete + add + reorder writes a row.
  - Coalesce same-field consecutive edits within ~5s into one row to keep volume sane; prune rows older than 90 days unless tagged.
  - Changelog UI behind "more" menu (or own page): timeline grouped by session, click to preview, "branch from here" → new deck, "revert to here" → rewrite current.
  - Hydrate the in-memory undo stack from recent edits on deck load so Cmd-Z works across sessions.

## Done (recent)

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
