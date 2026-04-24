# slidt Documentation

**slidt** is an AI-assisted presentation platform for Os & Data.

## For humans (GUI)

| Section | Contents |
|---|---|
| [Getting Started](guide/getting-started.md) | First login, create deck, first agent prompt |
| [Decks](guide/decks.md) | Create, duplicate, share, collaborate, export |
| [Slides](guide/slides.md) | Slide types, editing fields, reordering |
| [Themes](guide/themes.md) | Color tokens, agent system prompt, applying themes |
| [Agent](guide/agent.md) | Chat, undo history, cross-session memory, tips |
| [Admin](guide/admin.md) | User management, API keys |

## For agents & CLI users

| Section | Contents |
|---|---|
| [CLI Setup](cli/README.md) | Authentication, base URL, global flags |
| [deck](cli/deck.md) | Deck CRUD, duplicate, collaborators |
| [slide](cli/slide.md) | Slide CRUD, reorder |
| [theme](cli/theme.md) | Theme CRUD, validate, system prompt |
| [template](cli/template.md) | Template CRUD, validate |
| [agent](cli/agent.md) | Chat, streaming modes (--json/--quiet/--no-stream) |
| [key](cli/key.md) | API key management |
| [export](cli/export.md) | PDF export |

## Reference

| Section | Contents |
|---|---|
| [Slide Types](reference/slide-types.md) | Built-in types with field tables |
| [Field Types](reference/field-types.md) | text, richtext, list, group — data shapes |
| [Handlebars](reference/handlebars.md) | Allowed helpers, patterns, anti-patterns |
| [Theme Tokens](reference/theme-tokens.md) | CSS variable naming, antal-theta-default palette |
| [SSE Events](reference/sse-events.md) | All streaming event types with JSON schemas |
| [Collaborator Roles](reference/collaborators.md) | owner/editor/viewer permission matrix |
