# CLI: slide

> **GUI equivalent:** See [guide/slides.md](../guide/slides.md)

## Commands

```bash
# List slides in a deck
pnpm slidt slide list <deckId>

# Get a slide
pnpm slidt slide get <deckId> <slideId>

# Add a slide
pnpm slidt slide add <deckId> --type <typeId> [--data '{"title":"Hello"}']

# Update a slide
pnpm slidt slide patch <deckId> <slideId> --data '{"title":"Updated"}'

# Delete a slide
pnpm slidt slide delete <deckId> <slideId>

# Reorder slides
pnpm slidt slide reorder <deckId> --order <id1,id2,id3,...>
```

## Notes

- `--data` is a JSON object merged into existing slide data (PATCH semantics)
- `--type` must be a valid slide type ID — use `pnpm slidt template list` or the built-in type names
- **Never put HTML in data fields** — use plain text only

See also: [Slide Types Reference](../reference/slide-types.md) · [Field Types Reference](../reference/field-types.md)
