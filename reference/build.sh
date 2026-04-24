#!/usr/bin/env bash
# Build ANTAL-Theta-slides.pdf from slides/slides.json.
#
# Usage:
#   ./build.sh                       # regenerate HTML + PDF
#   ./build.sh path/to/custom.json   # use a different JSON source

set -euo pipefail

# Resolve script dir so the script works from any CWD.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLIDES_DIR="$HERE/slides"
JSON_PATH="${1:-$SLIDES_DIR/slides.json}"
HTML_PATH="$SLIDES_DIR/index.html"
PDF_PATH="$HERE/ANTAL-Theta-slides.pdf"

# Pick a Chromium binary. Order matters: prefer snap-free paths first.
CHROMIUM_BIN=""
for candidate in chromium chromium-browser google-chrome; do
  if command -v "$candidate" >/dev/null 2>&1; then
    CHROMIUM_BIN="$candidate"
    break
  fi
done
if [[ -z "$CHROMIUM_BIN" ]]; then
  echo "error: no chromium/chrome binary found on PATH" >&2
  exit 1
fi

# 1. Generate HTML from JSON.
echo "→ generating HTML from $(basename "$JSON_PATH")"
python3 "$SLIDES_DIR/generate.py" "$JSON_PATH"

# 2. Render HTML to PDF. virtual-time-budget gives the page time to lay out
#    fonts before printing; without it, first render sometimes misses glyphs.
echo "→ rendering PDF via $CHROMIUM_BIN"
"$CHROMIUM_BIN" \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --no-pdf-header-footer \
  --hide-scrollbars \
  --virtual-time-budget=10000 \
  --print-to-pdf="$PDF_PATH" \
  "file://$HTML_PATH" 2>&1 | grep -v '^$' || true

# 3. Stitch appendix PDFs on the end, if any. The generator writes absolute
#    paths to appendix-files.txt (one per line), in the order they should appear.
APPENDIX_LIST="$SLIDES_DIR/appendix-files.txt"
if [[ -s "$APPENDIX_LIST" ]]; then
  if ! command -v pdfunite >/dev/null 2>&1; then
    echo "warning: pdfunite not found; appendix PDFs NOT stitched" >&2
  else
    APPENDIX_FILES=()
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      if [[ ! -f "$line" ]]; then
        echo "warning: appendix file missing: $line" >&2
        continue
      fi
      APPENDIX_FILES+=("$line")
    done < "$APPENDIX_LIST"

    if [[ ${#APPENDIX_FILES[@]} -gt 0 ]]; then
      echo "→ stitching ${#APPENDIX_FILES[@]} appendix PDF(s) via pdfunite"
      TMP_PDF="$PDF_PATH.tmp"
      pdfunite "$PDF_PATH" "${APPENDIX_FILES[@]}" "$TMP_PDF"
      mv "$TMP_PDF" "$PDF_PATH"
    fi
  fi
fi

echo "→ wrote $PDF_PATH ($(du -h "$PDF_PATH" | cut -f1))"
