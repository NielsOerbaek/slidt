# slidt — todo

Status keys: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` needs design · `[!]` blocked

## In flight

(nothing right now — see "Up next")

## Up next

- [ ] **(6) Agent panel: show "working…" while a tool call is running.** Show the tool name (e.g. "inspect_slide_type…") so silent multi-second pauses feel alive.
- [ ] **(4) Slide list: option to show 16:9 thumbnails instead of text rows.** Toggle goes in the new "more" menu (depends on (3)). Lazy-render with IntersectionObserver so a 50-slide deck doesn't spawn 50 iframes upfront.
- [ ] (8) Add agent panel to the template editor view, so you can get help tweaking a single agent. This might need new tools or new guidance?

## Design first, then build

- [?] **(2) Persistent edit history + time-travel + branch-from-point-in-time.** Sketched approach (needs sign-off):
  - Schema: `slide_edits { id, deckId, slideId, userId, at, kind, before jsonb, after jsonb }`. Every autosave + delete + add + reorder writes a row.
  - Coalesce same-field consecutive edits within ~5s into one row to keep volume sane; prune rows older than 90 days unless tagged.
  - Changelog UI behind "more" menu (or own page): timeline grouped by session, click to preview, "branch from here" → new deck, "revert to here" → rewrite current.
  - Hydrate the in-memory undo stack from recent edits on deck load so Cmd-Z works across sessions.

## Done (recent)

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
