# Handlebars Reference

Slide templates use a sandboxed subset of Handlebars helpers.

## Allowed helpers

| Helper | Usage | Example |
|---|---|---|
| `{{field}}` | Output a field value | `{{title}}` |
| `{{fmt field "format"}}` | Format a number | `{{fmt value "0,0"}}` |
| `{{eq a b}}` | Equality check | `{{#if (eq status "active")}}` |
| `{{default field "fallback"}}` | Default value | `{{default name "Unnamed"}}` |
| `{{#each list}}` | Iterate array | `{{#each items}}{{this}}{{/each}}` |
| `{{#if cond}}` | Conditional | `{{#if title}}...{{/if}}` |
| `{{#unless cond}}` | Negative conditional | `{{#unless empty}}...{{/unless}}` |
| `{{#with obj}}` | Scope change | `{{#with author}}{{name}}{{/with}}` |

## Field patterns

```handlebars
{{! Text field }}
<h1>{{title}}</h1>

{{! List field }}
<ul>
  {{#each bullets}}<li>{{this}}</li>{{/each}}
</ul>

{{! Group field }}
{{#with stats}}
  <span>{{label}}: {{fmt value "0,0"}}</span>
{{/with}}

{{! Conditional }}
{{#if subtitle}}<p>{{subtitle}}</p>{{/if}}
```

## Anti-patterns

- **Never use HTML in content fields** — templates handle markup
- **No JavaScript in templates** — `javascript:` is forbidden
- **No `@import` in CSS** — forbidden
- **No `expression()` in CSS** — forbidden

See also: [Field Types Reference](field-types.md) · [Slide Types Reference](slide-types.md)
