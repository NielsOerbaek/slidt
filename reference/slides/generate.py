#!/usr/bin/env python3
"""
Generate the ANTAL/Theta slide deck (index.html) from slides.json.

Usage:
    python generate.py                  # reads ./slides.json, writes ./index.html
    python generate.py path/to.json     # writes index.html next to the JSON

Then render to PDF:
    chromium --headless --disable-gpu --no-sandbox \\
        --print-to-pdf=out.pdf --no-pdf-header-footer \\
        --virtual-time-budget=10000 --hide-scrollbars \\
        "file://$(pwd)/index.html"

Inline markup inside text fields:
    **bold**   -> <strong>bold</strong>
    *accent*   -> <em>accent</em>   (rendered as brand accent colour, not italic)
    \\n        -> <br/>

Slide types (see slides.json for examples):
    title, agenda, content, principles, values, reserve, purposes,
    section, ownership, friction, discussion, closing
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path


# =============================================================================
# Inline-markup formatter
# =============================================================================

_BOLD_RE = re.compile(r"\*\*(.+?)\*\*", re.DOTALL)
_EM_RE = re.compile(r"(?<!\*)\*([^*\n]+?)\*(?!\*)")


def fmt(text):
    """HTML-escape, then convert **bold**, *em*, and \\n."""
    if not text:
        return ""
    out = html.escape(text)
    out = _BOLD_RE.sub(r"<strong>\1</strong>", out)
    out = _EM_RE.sub(r"<em>\1</em>", out)
    return out.replace("\n", "<br/>")


# =============================================================================
# Shared markup
# =============================================================================

CORNER = (
    '<div class="corner-logo" role="img" aria-label="Os &amp; Data">'
    '<svg viewBox="0 0 690.82 503.07" aria-hidden="true">'
    '<use href="#ood-type-vertical"/>'
    '</svg>'
    '</div>'
)

# Inlined once per page; each corner-logo references it via <use>.
SYMBOL_DEFS = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ood-type-vertical" viewBox="0 0 690.82 503.07">
    <path d="M75.5,222.41h17.69c21.62,0,62.61-61.77,62.61-92.37v-16.85c0-31.16-38.75-92.93-62.61-92.93h-17.69c-21.62,0-62.61,61.77-62.61,92.93v16.85c0,30.6,40.99,92.37,62.61,92.37ZM39.57,109.82c0-16,20.21-53.06,35.38-53.06h18.25c15.16,0,35.94,37.06,35.94,53.06v23.87c0,14.88-20.78,52.22-35.94,52.22h-18.25c-15.16,0-35.38-36.78-35.38-52.22v-23.87Z"/>
    <path d="M266.14,185.91h-26.11c-8.42,0-25.83-4.77-29.48-19.65h-28.64c4.21,29.48,43.8,56.15,62.33,56.15h22.46c17.13,0,57-31.16,57-50.82v-12.63c0-13.48-19.09-39.03-35.09-42.68l-56.43-13.2c-4.77-1.12-15.16-15.16-15.16-17.97v-8.42c0-9.55,19.09-19.93,26.67-19.93h17.13c9.26,0,23.58,7.58,27.8,19.65h27.79c-3.65-25.55-36.22-56.15-57.84-56.15h-16c-16.85,0-55.87,33.69-55.87,53.91v12.63c0,12.35,17.13,37.9,33.69,41.83l55.03,12.63c5.33,1.12,17.41,12.07,17.41,17.69v8.42c0,9.55-19.09,18.53-26.67,18.53Z"/>
    <path d="M84.63,286.28H28.76v196.53h55.87c36.78,0,77.77-63.17,77.77-88.16v-19.65c0-25.55-40.99-88.72-77.77-88.72ZM134.32,394.09c0,14.88-24.99,53.62-55.59,53.62h-23.87v-126.34h23.87c30.6,0,55.59,38.46,55.59,54.47v18.25Z"/>
    <path d="M242.29,286.28l-54.19,196.53h26.67l14.88-54.47h63.45l14.88,54.47h26.67l-54.19-196.53h-38.18ZM238.64,394.65l16.29-59.52h12.91l16.29,59.52h-45.48Z"/>
    <polygon points="360.04 321.37 416.2 321.37 416.2 482.81 441.47 482.81 441.47 321.37 497.62 321.37 497.62 286.28 360.04 286.28 360.04 321.37"/>
    <path d="M578.19,286.28l-54.19,196.53h26.67l14.88-54.47h63.45l14.88,54.47h26.67l-54.19-196.53h-38.18ZM574.54,394.65l16.29-59.52h12.91l16.29,59.52h-45.48Z"/>
    <path d="M673.67,166.8c1.79-1.63,1.92-4.4.3-6.2l-11.54-12.87c-1.62-1.81-4.4-1.97-6.21-.36l-15.28,12.34c-1.73,1.53-4.36,1.47-6.01-.15l-35.36-34.52c-1.83-1.78-1.77-4.74.13-6.44l26.79-24.1c1.92-1.73,3.02-4.19,3.04-6.77l.02-36.25c0-1.89-.77-3.69-2.14-4.99-5.54-5.28-17.63-18.56-22.8-23.03-3.84-3.32-3.95-3.18-9.03-3.18h-29.13c-.34,0-.68.03-1.01.11-3.47.85-4.84,2.57-7.45,5.28-8.46,8.79-9.88,9.9-20.58,20.83-.82.82-1.89,1.96-2.8,2.94-1.2,1.29-1.86,2.99-1.86,4.75v28.93c0,4.11,1.41,7.5,4.08,10.63,4.86,5.7,15.99,16.7,23.12,23.92,1.77,1.8,1.68,4.71-.21,6.39-6.73,5.99-21.65,19.33-27.91,25.34-3.48,3.35-5.78,7.74-5.78,12.59,0,14.21,0,10.68,0,25.93,0,.21.01.43.04.64.51,3.93,1.5,7.45,4.3,10.31q8.66,8.84,18.83,18.8c.28.27.76.7,1.07.94,3.58,2.65,7.56,3.57,12.05,3.57,12.66,0,27.92-.01,41.29-.01.21,0,.54-.01.75-.03,3.84-.33,7.61-1.02,10.9-3.11.17-.11.33-.22.48-.35l18.59-15.22c1.75-1.44,4.31-1.31,5.92.29l14.75,14.71c.12.11.23.22.36.32,1.56,1.25,4.38,2.87,6.37,3.31.27.06.55.08.83.08h7.32c2.44,0,4.42-1.98,4.42-4.42v-18.75s-9.09-9.4-16.98-17.51c-.02-.5,8.67-7.66,16.34-14.68ZM559.39,77.22v-9.96c0-2.48.97-4.86,2.72-6.62,3.27-3.3,8.66-8.7,12.02-11.76,1.15-1.05,1.8-1.32,3.41-1.32h11.33c1.68,0,2.53.89,3.71,1.95,1.99,1.78,5.63,5.48,7.31,7.52.11.13.23.28.36.44.62.78.97,1.75.97,2.74l.1,17.79c.01,2.39-.92,4.69-2.62,6.38-4.53,4.53-10.79,12.69-15.64,16.94-1.76,1.54-4.4,1.44-6.04-.22l-15.62-18.82c-1.29-1.37-2.01-3.18-2.01-5.06ZM617.12,182.11c-4.14,3.94-8.6,7.54-12.86,11.35-.26.23-.55.44-.86.6-.6.32-1.25.49-1.93.52-13.54.49-21.23.43-34.76.07-1.02-.03-2.01-.39-2.78-1.07,0,0-.01-.01-.02-.02-4.16-3.72-8.87-8.09-8.87-9.65,0-2.44-.58-11.12-.48-16.35.02-1.2.54-2.33,1.43-3.14,4.22-3.86,14.28-15.74,20.31-21.21,1.74-1.58,4.42-1.52,6.09.14l35.51,38.39c-.31.02-.57.17-.79.38Z"/>
  </symbol>
</svg>"""

DANDELION_MARKS = {
    "dandelion-green":  "assets/ood-mark-green.svg",
    "dandelion-violet": "assets/ood-mark-violet.svg",
    "dandelion-white":  "assets/ood-mark.svg",
}


# =============================================================================
# Slide templates
# =============================================================================

def _title_html(s):
    """Render an h2 only if title is present."""
    title = s.get("title")
    return f'<h2>{fmt(title)}</h2>' if title else ''


def tmpl_title(s):
    mark = DANDELION_MARKS.get(s.get("mark", "dandelion-violet"),
                               DANDELION_MARKS["dandelion-violet"])
    return f"""<section class="slide title-slide">
  <div class="title-col">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    <h1>
      {fmt(s["title"])}<br/>
      <span class="alt">{fmt(s.get("titleAlt", ""))}</span>
    </h1>
    <p class="kicker">{fmt(s.get("kicker"))}</p>
  </div>
  <div class="dandelion">
    <img src="{mark}" alt="" />
  </div>
  {CORNER}
</section>"""


def tmpl_agenda(s):
    items = "\n      ".join(f"<li>{fmt(i)}</li>" for i in s["items"])
    return f"""<section class="slide agenda">
  <div style="width:100%;">
    <h1>{fmt(s["title"])}</h1>
    <ol>
      {items}
    </ol>
  </div>
  {CORNER}
</section>"""


def tmpl_content(s):
    bullets = "\n      ".join(f"<li>{fmt(b)}</li>" for b in s["bullets"])
    return f"""<section class="slide">
  <div class="content">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    {_title_html(s)}
    <ul>
      {bullets}
    </ul>
  </div>
  {CORNER}
</section>"""


def tmpl_principles(s):
    items = "\n      ".join(
        f'<li><span><span class="p-title">{fmt(i["title"])}</span> {fmt(i["body"])}</span></li>'
        for i in s["items"]
    )
    return f"""<section class="slide">
  <div class="content">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    {_title_html(s)}
    <ol class="principle-list">
      {items}
    </ol>
  </div>
  {CORNER}
</section>"""


def tmpl_values(s):
    cols = []
    for c in s["columns"]:
        lis = "\n          ".join(f"<li>{fmt(i)}</li>" for i in c["items"])
        cols.append(
            f"""<div class="v-col">
        <h3>{fmt(c["heading"])}</h3>
        <ul>
          {lis}
        </ul>
      </div>"""
        )
    cols_html = "\n      ".join(cols)
    return f"""<section class="slide">
  <div class="content">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    {_title_html(s)}
    <div class="values-grid">
      {cols_html}
    </div>
  </div>
  {CORNER}
</section>"""


def tmpl_reserve(s):
    paragraphs = "\n    ".join(f"<p>{fmt(p)}</p>" for p in s["paragraphs"])
    return f"""<section class="slide reserve">
  <div class="left">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    <h2>{fmt(s["title"])}</h2>
  </div>
  <div class="right">
    {paragraphs}
    <p class="callout">{fmt(s["callout"])}</p>
  </div>
  {CORNER}
</section>"""


def tmpl_purposes(s):
    cards = "\n      ".join(
        f"""<div class="p-card">
        <div class="p-num">{fmt(c["num"])}</div>
        <div class="p-title">{fmt(c["title"])}</div>
        <div class="p-desc">{fmt(c["body"])}</div>
      </div>"""
        for c in s["cards"]
    )
    return f"""<section class="slide four-purposes">
  <div class="content">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    {_title_html(s)}
    <div class="content-inner">
      {cards}
    </div>
  </div>
  {CORNER}
</section>"""


def tmpl_section(s):
    return f"""<section class="slide section-divider">
  <div class="num-col">
    <div class="big-num">{fmt(s["bigMark"])}</div>
  </div>
  <div class="title-col">
    <div>
      <h2>{fmt(s["title"])}</h2>
      <span class="subtitle">{fmt(s.get("subtitle"))}</span>
    </div>
  </div>
</section>"""


def tmpl_ownership(s):
    cards = "\n    ".join(
        f"""<div class="oc">
      <div class="oc-title">{fmt(c["title"])}</div>
      <div class="oc-sub">{fmt(c["sub"])}</div>
      <div class="oc-body">{fmt(c["body"])}</div>
    </div>"""
        for c in s["cards"]
    )
    return f"""<section class="slide ownership-model">
  <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
  {_title_html(s)}
  <div class="source">{fmt(s["source"])}</div>
  <div class="three-col">
    {cards}
  </div>
  {CORNER}
</section>"""


def tmpl_friction(s):
    def side(data, cls):
        body = "\n        ".join(f"<p>{fmt(p)}</p>" for p in data["body"])
        return f"""<div class="{cls}">
      <div class="side-label">{fmt(data["label"])}</div>
      <div class="side-head">{fmt(data["head"])}</div>
      <div class="side-body">
        {body}
      </div>
    </div>"""

    return f"""<section class="slide friction">
  <div class="top">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    <h2>{fmt(s["title"])}</h2>
  </div>
  <div class="compare">
    {side(s["sideA"], "side-a")}
    {side(s["sideB"], "side-b")}
  </div>
  <div class="question">
    <div class="q-label">?</div>
    <div class="q-text">{fmt(s["question"])}</div>
  </div>
</section>"""


def tmpl_discussion(s):
    # NOTE: wrap text in <span> — CSS Grid treats direct text nodes + <em>
    # as separate grid items, which breaks the layout. The span groups them.
    items = "\n    ".join(
        f'<li data-q="{fmt(i["letter"])}"><span>{fmt(i["text"])}</span></li>'
        for i in s["items"]
    )
    return f"""<section class="slide discussion">
  <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
  {_title_html(s)}
  <ol class="q-list">
    {items}
  </ol>
  {CORNER}
</section>"""


def tmpl_closing(s):
    return f"""<section class="slide closing">
  <h1>{fmt(s["title"])}</h1>
  <p>{fmt(s.get("subtitle", ""))}</p>
</section>"""


def tmpl_appendix_list(s):
    rows = []
    for item in s["items"]:
        rows.append(
            f"""<li>
        <div class="app-mark">{fmt(item.get("mark", "§"))}</div>
        <div class="app-text">
          <div class="app-title">{fmt(item.get("title", ""))}</div>
          <div class="app-sub">{fmt(item.get("subtitle", ""))}</div>
        </div>
      </li>"""
        )
    items = "\n      ".join(rows)
    return f"""<section class="slide appendix-list">
  <div class="content">
    <div class="eyebrow">{fmt(s.get("eyebrow"))}</div>
    {_title_html(s)}
    <ul class="app-list">
      {items}
    </ul>
  </div>
  {CORNER}
</section>"""


TEMPLATES = {
    "title":          tmpl_title,
    "agenda":         tmpl_agenda,
    "content":        tmpl_content,
    "principles":     tmpl_principles,
    "values":         tmpl_values,
    "reserve":        tmpl_reserve,
    "purposes":       tmpl_purposes,
    "section":        tmpl_section,
    "ownership":      tmpl_ownership,
    "friction":       tmpl_friction,
    "discussion":     tmpl_discussion,
    "closing":        tmpl_closing,
    "appendix-list":  tmpl_appendix_list,
}


# =============================================================================
# Page wrapper
# =============================================================================

PAGE = """<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8" />
  <title>{title}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

{symbol_defs}

{body}

</body>
</html>
"""


def expand_appendix(data):
    """Append a single appendix-list slide summarizing all appendix entries."""
    slides = list(data.get("slides", []))
    appendix = data.get("appendix", [])
    if appendix:
        slides.append({
            "type": "appendix-list",
            "eyebrow": data.get("appendixEyebrow", "Bilag"),
            "title": data.get("appendixTitle", "Tilhørende materiale"),
            "items": appendix,
        })
    return slides


def render(data):
    slides = expand_appendix(data)
    total = len(slides)
    parts = []
    for idx, s in enumerate(slides, start=1):
        html_slide = TEMPLATES[s["type"]](s)
        # Inject page counter right before the closing </section>.
        page_num = f'<div class="page-num">{idx:02d} / {total:02d}</div>'
        html_slide = html_slide.rsplit("</section>", 1)
        html_slide = f"{html_slide[0]}{page_num}\n</section>{html_slide[1]}"
        parts.append(html_slide)
    body = "\n\n".join(parts)
    return PAGE.format(
        lang=html.escape(data.get("lang", "da")),
        title=html.escape(data.get("title", "Slides")),
        symbol_defs=SYMBOL_DEFS,
        body=body,
    )


def main(argv):
    json_path = Path(argv[1]) if len(argv) > 1 else Path(__file__).with_name("slides.json")
    out_path = json_path.with_name("index.html")
    data = json.loads(json_path.read_text(encoding="utf-8"))
    out_path.write_text(render(data), encoding="utf-8")

    # Write the appendix file list so build.sh can stitch the PDFs on the end.
    # Paths in the JSON are resolved relative to the JSON file itself.
    appendix_list = json_path.with_name("appendix-files.txt")
    appendix_paths = [app["path"] for app in data.get("appendix", [])]
    if appendix_paths:
        resolved = []
        for p in appendix_paths:
            abs_path = (json_path.parent / p).resolve()
            resolved.append(str(abs_path))
        appendix_list.write_text("\n".join(resolved) + "\n", encoding="utf-8")
    elif appendix_list.exists():
        appendix_list.unlink()

    n_slides = len(data.get("slides", []))
    n_app = len(appendix_paths)
    extra = " + 1 appendix list + {} attached PDF(s)".format(n_app) if n_app else ""
    print(f"Wrote {out_path} ({n_slides} slides{extra})")


if __name__ == "__main__":
    main(sys.argv)
