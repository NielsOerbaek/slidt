# Slide Types Reference

Built-in slide types are available across all decks. Deck-scoped types (custom templates) are created per deck.

## Built-in types

To see the full list of available slide types, use:
```bash
pnpm slidt template list
```

Or in the GUI, click **+** in the slide list to browse types.

Common built-in types include:
- **title** — Title + subtitle slide
- **content** — Headline + body text
- **bullets** — Headline + bullet list
- **two-column** — Two-column layout
- **image** — Full-bleed or framed image
- **quote** — Pull quote with attribution
- **stats** — Key metrics display
- **chart** — Chart placeholder
- **closing** — Closing / thank-you slide

## Custom templates

Create deck-scoped templates via the agent ("Create a custom slide type for...") or via CLI:

```bash
pnpm slidt template create <deckId> --file my-template.json
```

See also: [CLI: template](../cli/template.md) · [Field Types Reference](field-types.md) · [Handlebars Reference](handlebars.md)
