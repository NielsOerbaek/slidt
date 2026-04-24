# Collaborator Roles

Decks support three access levels:

| Role | Who has it | GET deck | Edit slides | Use agent | Export | Manage collabs | Delete deck |
|---|---|---|---|---|---|---|---|
| `owner` | Deck creator | yes | yes | yes | yes | yes | yes |
| `editor` | Invited collaborator | yes | yes | yes | yes | no | no |
| `viewer` | Invited collaborator | yes | no | no | yes | no | no |

## API behavior

- `GET /api/decks/:id` — viewer+
- `PATCH /api/decks/:id` — editor+
- `DELETE /api/decks/:id` — owner only
- `GET /api/decks/:id/slides` — viewer+
- `POST /api/decks/:id/slides` — editor+
- `PATCH /api/decks/:id/slides/:slideId` — editor+
- `DELETE /api/decks/:id/slides/:slideId` — editor+
- `POST /api/decks/:id/agent` — editor+
- `GET /api/decks/:id/collaborators` — owner only
- `POST /api/decks/:id/collaborators` — owner only
- `PATCH /api/decks/:id/collaborators` — owner only
- `DELETE /api/decks/:id/collaborators` — owner only

## Adding collaborators

Collaborators must be registered slidt users. Invite by email:

```bash
pnpm slidt deck collaborator add <deckId> --email colleague@example.com --role editor
```

Or via the GUI: deck editor → Share panel → Collaborators section.

See also: [CLI: deck](../cli/deck.md) · [Guide: Decks](../guide/decks.md)
