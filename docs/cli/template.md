# CLI: template

> **GUI equivalent:** Managed via agent or deck editor

## Commands

```bash
# List templates (global + deck-scoped)
pnpm slidt template list [--deck <deckId>]

# Get a template
pnpm slidt template get <id>

# Create a deck-scoped template
pnpm slidt template create <deckId> --file <template.json>

# Update a template
pnpm slidt template patch <id> --file <template.json>

# Validate a template JSON file (no network call)
pnpm slidt template validate <file.json>

# Delete a template
pnpm slidt template delete <id>
```

## Template JSON format

```json
{
  "name": "my-custom-slide",
  "label": "My Custom Slide",
  "fields": [
    { "key": "title", "type": "text", "label": "Title" },
    { "key": "body", "type": "richtext", "label": "Body" }
  ],
  "htmlTemplate": "<div class='slide'>{{title}}</div>",
  "css": ".slide { background: var(--st-bg); }"
}
```

## Validate output

`template validate` checks:
- Required fields: `name`, `label`, `fields`, `htmlTemplate`, `css`
- Each field has `key`, `type`, `label`
- No forbidden CSS patterns (`javascript:`, `expression(`, `@import`)
- Only allowed Handlebars helpers used

See also: [Field Types Reference](../reference/field-types.md) · [Handlebars Reference](../reference/handlebars.md)
