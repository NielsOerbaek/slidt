/**
 * Skill markdown template served at GET /api/skill.
 * {{BASE_URL}} is replaced at serve-time with the server's actual origin.
 */
export const SKILL_TEMPLATE = `---
name: slidt
description: Use when creating, editing, uploading, previewing, tweaking, or exporting slidt slide decks via HTTP API or CLI. Applies when working from any folder, converting content (markdown, JSON, outlines) into presentations, or automating deck workflows programmatically.
---

# slidt — Slide Deck Agent Skill

## Overview

slidt is a SvelteKit presentation platform with a full REST API and CLI. Agents access it using API key Bearer auth from any directory. Every operation is idempotent-safe: read first, then mutate.

**Base URL:** set via env \`SLIDT_URL\` (e.g. \`{{BASE_URL}}\`) or \`--url\` flag.
**Auth:** \`Authorization: Bearer slidt_<hex>\` — set via env \`SLIDT_API_KEY\` or \`--api-key\` flag.

---

## Install this skill

From any directory where \`SLIDT_URL\` points to this server:

\`\`\`bash
# Install to ~/.claude/skills/slidt/SKILL.md (default)
SLIDT_URL={{BASE_URL}} pnpm slidt skill install

# Custom output path
SLIDT_URL={{BASE_URL}} pnpm slidt skill install --out /path/to/SKILL.md
\`\`\`

---

## Setup

\`\`\`bash
export SLIDT_API_KEY="slidt_your_key_here"
export SLIDT_URL="{{BASE_URL}}"

# Verify connectivity
pnpm slidt health
# OR
curl -s $SLIDT_URL/healthz | jq .
\`\`\`

To create an API key: log in to slidt → Settings → API Keys → New Key (copy immediately, stored as hash).

---

## Core Concepts

| Concept | What it is |
|---|---|
| **Deck** | A presentation: title, language, ordered slides, optional theme |
| **Slide** | A slide instance: \`typeName\` + \`data\` (field values) |
| **Slide type / Template** | HTML+CSS template + field schema. 20 built-in: \`cover\`, \`bullet-list\`, \`two-column\`, \`three-column\`, \`quote\`, \`stat-grid\`, \`timeline\`, \`dot-flow\`, \`quote-pair\`, \`card-grid\`, \`numbered-list\`, \`column-list\`, \`callout-content\`, \`divider\`, \`team-cards\`, \`comparison\`, \`qa-list\`, \`agenda\`, \`closing\`, \`appendix-list\` |
| **Theme** | CSS custom property tokens (\`--sl-*\`). Built-in: \`antal-theta-default\`, \`minimal\`, \`os-og-data-default\` |
| **Agent** | SSE streaming AI that edits the deck via tool calls |

---

## Quick Reference: API Endpoints

### Decks
\`\`\`
GET    /api/decks                    → list all decks
POST   /api/decks                    → create {title, lang?}
GET    /api/decks/:id                → get deck
PATCH  /api/decks/:id                → update {title?, lang?, themeId?, slideOrder?}
DELETE /api/decks/:id                → delete
POST   /api/decks/:id/duplicate      → deep copy
GET    /api/decks/:id/export         → download PDF
GET    /api/decks/:id/present        → presentation HTML
\`\`\`

### Slides
\`\`\`
GET    /api/decks/:id/slides          → list slides (ordered)
POST   /api/decks/:id/slides          → create {typeId, data?}
GET    /api/decks/:id/slides/:sid     → get slide
PATCH  /api/decks/:id/slides/:sid     → update {data?, typeId?, orderIndex?}
DELETE /api/decks/:id/slides/:sid     → delete
\`\`\`

### Templates & Themes
\`\`\`
GET    /api/decks/:id/slide-types     → list available types for deck
GET    /api/templates                 → list all global templates
GET    /api/themes                    → list all themes
GET    /api/themes/:id                → get theme (inspect tokens)
\`\`\`

### Assets
\`\`\`
POST   /api/assets                   → upload file (multipart: deckId, kind, file)
GET    /api/assets/:id               → download
\`\`\`

### Agent (SSE)
\`\`\`
POST   /api/decks/:id/agent          → stream agent {message}
GET    /api/decks/:id/agent          → get message history
\`\`\`

### History
\`\`\`
GET    /api/decks/:id/history        → edit log (?limit, ?before)
POST   /api/decks/:id/history/:eid/revert → undo a change
\`\`\`

### Skill
\`\`\`
GET    /api/skill                    → download this skill (no auth required)
\`\`\`

---

## CLI Quick Reference

\`\`\`bash
# Decks
pnpm slidt deck list
pnpm slidt deck create --title "Title" --lang en
pnpm slidt deck get <id>
pnpm slidt deck patch <id> --title "New" --theme-id <themeId>
pnpm slidt deck delete <id>
pnpm slidt deck duplicate <id>

# Slides
pnpm slidt slide list <deckId>
pnpm slidt slide add <deckId> --type <typeId> --data '{"title":"Hello"}'
pnpm slidt slide patch <deckId> <slideId> --data '{"title":"Updated"}'
pnpm slidt slide delete <deckId> <slideId>
pnpm slidt slide reorder <deckId> --order <id1,id2,...>

# Templates & Themes
pnpm slidt template list
pnpm slidt theme list
pnpm slidt theme get <id>

# Agent
pnpm slidt agent chat <deckId> --message "Add a closing slide"
pnpm slidt agent chat <deckId> --message "..." --no-stream   # wait for done

# Export
pnpm slidt export pdf <deckId> --out deck.pdf

# Keys
pnpm slidt key list
pnpm slidt key create --name "my-agent"

# Skill
pnpm slidt skill install              # → ~/.claude/skills/slidt/SKILL.md
pnpm slidt skill install --out /path  # custom path (no API key needed)
\`\`\`

---

## Slide Type Field Schemas

Each slide type accepts specific field names. Pass these in \`data\` when creating or patching slides.

| Type | Required fields | Optional fields |
|---|---|---|
| \`cover\` | \`title\` | \`eyebrow\`, \`titleAlt\`, \`kicker\` |
| \`bullet-list\` | \`bullets\` (list) | \`eyebrow\`, \`title\` |
| \`two-column\` | \`left.heading\`, \`left.body\`, \`right.heading\`, \`right.body\` | \`eyebrow\`, \`title\` |
| \`three-column\` | \`columns\` (list of \`{heading, body}\`) | \`eyebrow\`, \`title\` |
| \`quote\` | \`quote\` | \`attribution\` |
| \`stat-grid\` | \`stats\` (list of \`{value, label}\`) | \`eyebrow\`, \`title\`, \`stats[].description\` |
| \`timeline\` | \`events\` (list of \`{year, title}\`) | \`eyebrow\`, \`title\`, \`events[].body\` |
| \`dot-flow\` | \`steps\` (list of \`{title}\`) | \`eyebrow\`, \`title\`, \`steps[].caption\` |
| \`quote-pair\` | \`left.quote\`, \`right.quote\` | \`eyebrow\`, \`left.attribution\`, \`right.attribution\` |
| \`card-grid\` | \`cards\` (list of \`{num, title, body}\`) | \`eyebrow\`, \`title\` |
| \`numbered-list\` | \`items\` (list of \`{title, body}\`) | \`eyebrow\`, \`title\` |
| \`column-list\` | \`columns\` (list of \`{heading, items[]}\`) | \`eyebrow\`, \`title\` |
| \`callout-content\` | \`title\`, \`paragraphs\` (list), \`callout\` | \`eyebrow\` |
| \`comparison\` | \`title\`, \`sideA.{label,head,body[]}\`, \`sideB.{label,head,body[]}\`, \`question\` | \`eyebrow\` |
| \`divider\` | \`bigMark\`, \`title\` | \`subtitle\` |
| \`team-cards\` | \`source\`, \`cards\` (list of \`{title, sub, body}\`) | \`eyebrow\`, \`title\` |
| \`qa-list\` | \`items\` (list of \`{letter, text}\`) | \`eyebrow\`, \`title\` |
| \`agenda\` | \`title\`, \`items\` (list) | — |
| \`closing\` | \`title\` | \`subtitle\` |
| \`appendix-list\` | \`items\` (list of \`{mark, title, subtitle}\`) | \`eyebrow\`, \`title\` |

**Rule:** \`richtext\` fields support \`**bold**\`, \`*italic*\`, and \`\\n\` newlines — no HTML tags.

---

## Workflow: Create a Deck from a Folder

When converting files (markdown, outlines, notes) from any directory into a slidt deck:

\`\`\`bash
# 1. Create the deck
DECK=$(curl -s -X POST $SLIDT_URL/api/decks \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My Presentation","lang":"en"}' | jq -r .id)

# 2. Fetch available slide types (get typeId for each)
TYPES=$(curl -s "$SLIDT_URL/api/decks/$DECK/slide-types" \\
  -H "Authorization: Bearer $SLIDT_API_KEY")

# Get typeId by name, e.g. cover type:
COVER_ID=$(echo $TYPES | jq -r '.[] | select(.name=="cover") | .id')
BULLET_ID=$(echo $TYPES | jq -r '.[] | select(.name=="bullet-list") | .id')

# 3. Add slides
curl -s -X POST "$SLIDT_URL/api/decks/$DECK/slides" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"typeId\\":\\"$COVER_ID\\",\\"data\\":{\\"title\\":\\"My Deck\\",\\"kicker\\":\\"A subtitle\\"}}"

# 4. Apply a theme
THEME_ID=$(curl -s "$SLIDT_URL/api/themes" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" | jq -r '.[] | select(.name=="minimal") | .id')

curl -s -X PATCH "$SLIDT_URL/api/decks/$DECK" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"themeId\\":\\"$THEME_ID\\"}"
\`\`\`

**For bulk content from files:** read each file → map to slide type → POST one slide per section. Use \`bullet-list\` for lists, \`quote\` for pull quotes, \`two-column\` for comparisons, \`cover\` for title page, \`closing\` for end slide.

---

## Workflow: Use the AI Agent

The agent edits the deck autonomously via tool calls (list_slides, patch_slide, add_slide, etc.).

\`\`\`bash
# Stream mode (default) — shows tool calls as they happen
pnpm slidt agent chat $DECK_ID \\
  --message "Create a 6-slide deck about our product launch. Start with a cover, add 3 bullet-list slides with key points, a stat-grid with 3 metrics, and a closing slide."

# Non-streaming — wait for completion
pnpm slidt agent chat $DECK_ID \\
  --message "Rewrite all slide titles to be shorter and punchier" \\
  --no-stream

# Via API (for programmatic use)
curl -s -X POST "$SLIDT_URL/api/decks/$DECK_ID/agent" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Add an agenda slide after the cover"}' \\
  --no-buffer | while IFS= read -r line; do
    echo "$line" | jq -r 'if .type == "text" then .delta elif .type == "done" then "\\n[done]" else empty end' 2>/dev/null
  done
\`\`\`

The agent has access to: \`list_slides\`, \`get_slide\`, \`patch_slide\`, \`add_slide\`, \`delete_slide\`, \`reorder_slides\`, \`list_slide_types\`, \`get_deck\`, \`patch_deck\`, \`list_themes\`, \`set_theme\`, \`list_assets\`.

---

## Workflow: Upload Images

\`\`\`bash
# Upload an image asset (multipart needs a matching Origin header — CSRF guard)
ASSET=$(curl -s -X POST "$SLIDT_URL/api/assets" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  -H "Origin: $SLIDT_URL" \\
  -F "deckId=$DECK_ID" \\
  -F "kind=image" \\
  -F "file=@/path/to/image.png")

ASSET_ID=$(echo $ASSET | jq -r '.id')

# Reference the asset in slide data. The image field controls how the picture
# fills its frame: fit = cover | contain | fill, zoom 1-4, posX/posY 0-100.
curl -s -X PATCH "$SLIDT_URL/api/decks/$DECK_ID/slides/$SLIDE_ID" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"data\\":{\\"image\\":{\\"id\\":\\"$ASSET_ID\\",\\"fit\\":\\"cover\\",\\"zoom\\":1,\\"posX\\":50,\\"posY\\":50,\\"rotate\\":0}}}"

# A bare id string also works and renders with defaults (fit cover, centered):
#   -d "{\\"data\\":{\\"image\\":\\"$ASSET_ID\\"}}"
\`\`\`

---

## Workflow: Export

\`\`\`bash
# Download as PDF
pnpm slidt export pdf $DECK_ID --out presentation.pdf

# OR via API
curl -s "$SLIDT_URL/api/decks/$DECK_ID/export" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  -o presentation.pdf

# Get presentation HTML (for browser preview or embedding)
curl -s "$SLIDT_URL/api/decks/$DECK_ID/present" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" \\
  > presentation.html
\`\`\`

---

## Workflow: Revert a Change

\`\`\`bash
# List recent edits
curl -s "$SLIDT_URL/api/decks/$DECK_ID/history?limit=10" \\
  -H "Authorization: Bearer $SLIDT_API_KEY" | jq '.edits[] | {id, kind, summary, at}'

# Revert a specific edit
curl -s -X POST "$SLIDT_URL/api/decks/$DECK_ID/history/$EDIT_ID/revert" \\
  -H "Authorization: Bearer $SLIDT_API_KEY"
\`\`\`

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Hardcoding \`typeId\` — IDs differ per environment | Always fetch from \`/api/decks/:id/slide-types\` and resolve by \`name\` |
| Sending HTML in content fields | Use \`**bold**\`, \`*italic*\` — no tags. Server strips HTML. |
| Expecting PDF immediately on large decks | PDF render is synchronous but slow — poll or increase timeout (30s+) |
| Creating slides without \`typeId\` | \`typeId\` is required; \`data\` defaults to empty if omitted |
| Using \`type_name\` instead of \`typeId\` when creating slides | POST to \`/slides\` requires \`typeId\` (UUID), not \`typeName\` (string) |
| Overwriting full \`data\` object on PATCH | PATCH \`data\` is a full replacement — include ALL field values, not just changed ones |
| Forgetting slide reorder after add | New slides append to end; reorder with PATCH \`/api/decks/:id\` \`slideOrder\` array |

---

## Access Control

- **owner**: full access — delete, collaborators, share, history
- **editor**: create/patch/delete slides, patch deck metadata, history
- **viewer**: read-only — GET deck/slides/history
- API keys inherit the key owner's permissions on each deck

---

## Environment Variables

\`\`\`bash
SLIDT_API_KEY="slidt_..."      # Required — Bearer token
SLIDT_URL="{{BASE_URL}}"       # Required — server URL
\`\`\`

Set both before any CLI or API call. Both can be overridden per-call with \`--api-key\` / \`--url\` flags.
`;
