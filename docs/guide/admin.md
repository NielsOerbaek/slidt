# Admin

> **Requires:** `isAdmin` flag on your account

## User management

Navigate to **Admin** in the nav (only visible to admins).

Actions:
- **Create user** — enter name, email, password; optionally make them admin
- **Toggle admin** — promote or demote any user
- **Reset password** — set a new password (invalidates all sessions)
- **Delete user** — permanently removes the user and all their data

## API keys

Any logged-in user can manage their own API keys at **Keys** in the nav (or `/settings`).

- **Create** — give the key a name; the token is shown once (copy it)
- **Revoke** — permanently delete a key; any agent using it loses access

Keys use Bearer token auth: `Authorization: Bearer slidt_<hex>`

See also: [CLI Setup](../cli/README.md)
