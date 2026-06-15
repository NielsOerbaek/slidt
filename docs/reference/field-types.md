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

## `image`

References an uploaded asset and controls how it fills its frame.

```json
{
  "image": {
    "id": "asset-uuid",
    "fit": "cover",
    "zoom": 1,
    "posX": 50,
    "posY": 50,
    "rotate": 0
  }
}
```

- `fit` — `cover` (fill frame, crop overflow), `contain` (whole image visible, letterboxed), or `fill` (stretch to frame). Default `cover`.
- `zoom` — scale multiplier, `1`–`4`. Default `1`.
- `posX` / `posY` — `object-position` in percent, `0`–`100`. Default `50` (centered).
- `rotate` — degrees.

A bare string (`"image": "asset-uuid"`) is accepted and rendered with the defaults above.

**Legacy crop model.** Older images store a crop window (`{ id, cropX, cropY, cropW, cropH, rotate }`) and keep rendering unchanged. Editing such an image in the UI upgrades it to the fit model.

## Field definition schema

```json
{
  "key": "title",
  "type": "text",
  "label": "Slide Title"
}
```

See also: [Handlebars Reference](handlebars.md) · [Slide Types Reference](slide-types.md)
