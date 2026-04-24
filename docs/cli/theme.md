# CLI: theme

> **GUI equivalent:** See [guide/themes.md](../guide/themes.md)

## Commands

```bash
# List themes
pnpm slidt theme list

# Get a theme
pnpm slidt theme get <id>

# Create a theme
pnpm slidt theme create --name "My Theme" --tokens '{"--st-bg":"#fff","--st-ink":"#000"}' [--prompt "Agent guidelines..."]

# Update a theme
pnpm slidt theme patch <id> [--name "..."] [--tokens '...'] [--prompt "..."]

# Validate a theme JSON file
pnpm slidt theme validate <file.json>

# Delete a theme
pnpm slidt theme delete <id>
```

## Theme JSON format

```json
{
  "name": "My Theme",
  "tokens": {
    "--st-bg": "#ffffff",
    "--st-ink": "#000000"
  },
  "systemPrompt": "Professional tone. Danish-first. No HTML in content fields."
}
```

## Validate output

`theme validate` checks:
- `name` is a non-empty string
- All token keys start with `--`
- All token values are strings
- `systemPrompt` is a string (if present)

See also: [Theme Tokens Reference](../reference/theme-tokens.md)
