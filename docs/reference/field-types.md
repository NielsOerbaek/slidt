# Field Types Reference

Slide fields have a `type` that determines the JSON data shape stored in `slide.data`.

## `text`

A plain string.

```json
{ "title": "My Slide Title" }
```

**Never put HTML in text fields.** Plain text only.

## `richtext`

A longer plain text (paragraphs, no markup).

```json
{ "body": "First paragraph.\n\nSecond paragraph." }
```

## `list`

An array of strings.

```json
{ "bullets": ["Point one", "Point two", "Point three"] }
```

In templates: `{{#each bullets}}<li>{{this}}</li>{{/each}}`

## `group`

An object with named sub-fields.

```json
{ "stat": { "label": "Revenue", "value": 1234567 } }
```

In templates: `{{#with stat}}{{label}}: {{fmt value "0,0"}}{{/with}}`

## Field definition schema

```json
{
  "key": "title",
  "type": "text",
  "label": "Slide Title"
}
```

See also: [Handlebars Reference](handlebars.md) · [Slide Types Reference](slide-types.md)
