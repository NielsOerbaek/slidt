# CLI: deck

> **GUI equivalent:** See [guide/decks.md](../guide/decks.md)

## Commands

```bash
# List all decks
pnpm slidt deck list

# Get a deck
pnpm slidt deck get <id>

# Create a deck
pnpm slidt deck create --title "My Deck" [--lang da]

# Update a deck
pnpm slidt deck patch <id> [--title "New Title"] [--lang en] [--theme <themeId>]

# Delete a deck
pnpm slidt deck delete <id>

# Deep-copy a deck (slides, theme, deck-scoped templates)
pnpm slidt deck duplicate <id>

# Collaborator management (owner only)
pnpm slidt deck collaborator list <deckId>
pnpm slidt deck collaborator add <deckId> --email colleague@example.com [--role editor|viewer]
pnpm slidt deck collaborator remove <deckId> --email colleague@example.com
```

## Notes

- `duplicate` creates "Copy of <title>" with all slides and deck-scoped templates. Agent history is not copied.
- Collaborators must be registered slidt users.
- Default collaborator role is `editor`.

See also: [Collaborator Roles](../reference/collaborators.md)
