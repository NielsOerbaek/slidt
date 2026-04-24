# slidt — Claude instructions

## Before every commit, check:

1. **Translation keys** — any new user-visible string needs an entry in `src/lib/i18n/messages.ts` with both `da` and `en` values. Never hardcode UI text.

2. **Mobile styling** — any new UI component needs a `@media (max-width: 768px)` pass. Check that it looks reasonable on narrow viewports.

3. **Docs** — if the change adds or changes user-facing functionality (commands, settings, agent tools, API endpoints), update the relevant page under `src/routes/docs/`.
