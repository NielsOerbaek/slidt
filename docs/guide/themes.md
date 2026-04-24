# Themes

> **CLI equivalent:** See [cli/theme.md](../cli/theme.md)

## What is a theme?

A theme is a collection of CSS custom properties (design tokens) that control colors across all slides. It also carries an **agent system prompt** that sets tone, language, and content conventions for the AI agent when this theme is active.

## Applying a theme

In the deck editor, use the Theme dropdown. Changes take effect immediately in the preview.

## Editing a theme

Go to **Themes** in the nav → click a theme → edit tokens with the color pickers or text inputs. Add or edit the **Agent System Prompt** textarea to customize agent behavior for this theme.

## Agent system prompt

This text is prepended to every agent interaction when the theme is active. Use it to:
- Set tone (formal, warm, concise)
- Enforce language rules (always Danish, no HTML in fields)
- Define content conventions (preferred terminology, forbidden phrases)

Example prompt for `antal-theta-default`:
> Professional yet warm. Danish-first content. No HTML in content fields. Use the brand palette deliberately.

## Creating a theme

Click **New** on the Themes page, then edit tokens and the system prompt.

See also: [Theme Tokens Reference](../reference/theme-tokens.md)
