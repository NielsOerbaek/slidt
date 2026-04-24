# CLI: key

> **GUI equivalent:** `/settings` page → API Keys

## Commands

```bash
# List your API keys
pnpm slidt key list

# Create a new API key (token shown once — copy it)
pnpm slidt key create --name "my-agent"

# Revoke a key
pnpm slidt key revoke <id>
```

## Notes

- The token is only shown once at creation time. Store it securely (e.g. in an environment variable).
- Revoking a key immediately invalidates it — any agent using it will get 401 errors.
- Keys are scoped to the creating user's permissions.

## Usage

```bash
export SLIDT_API_KEY=slidt_<token>
pnpm slidt deck list
```
