# Theme Tokens Reference

Themes define CSS custom properties that control the visual appearance of all slides.

## Naming convention

All tokens must start with `--st-` (Swiss-terminal prefix).

## Core tokens (antal-theta-default)

| Token | Default | Usage |
|---|---|---|
| `--st-bg` | `#f5f0e8` | Main background |
| `--st-bg-deep` | `#ede8e0` | Deeper background layer |
| `--st-ink` | `#1a1a1a` | Primary text |
| `--st-ink-dim` | `#6b6b6b` | Secondary/muted text |
| `--st-cobalt` | `#003087` | Brand accent (headlines, highlights) |
| `--st-yellow` | `#f5c400` | Warning, highlights |
| `--st-red` | `#c0392b` | Error, danger |
| `--st-rule-thin` | `1px solid #c8c0b8` | Thin borders |
| `--st-rule-thick` | `2px solid #1a1a1a` | Thick borders |
| `--st-font-mono` | `'IBM Plex Mono', monospace` | Monospace font |
| `--st-font-sans` | `'IBM Plex Sans', sans-serif` | Sans-serif font |

## Adding custom tokens

In theme JSON or the Themes UI, add any `--st-*` key with a string value:

```json
{
  "tokens": {
    "--st-brand": "#ff6600",
    "--st-brand-light": "#ffcc99"
  }
}
```

Then reference in your slide template CSS:
```css
.slide { border-color: var(--st-brand); }
```

See also: [CLI: theme](../cli/theme.md) · [Guide: Themes](../guide/themes.md)
