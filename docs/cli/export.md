# CLI: export

> **GUI equivalent:** "Export PDF" button in the deck editor top bar

## Commands

```bash
# Export a deck as PDF
pnpm slidt export pdf <deckId> [--out deck.pdf]
```

## Notes

- Default output filename: `<deckId>.pdf`
- PDF is rendered at 1920x1080 per slide using headless Chrome
- Requires the slidt server to be running (Playwright renders via the server)
