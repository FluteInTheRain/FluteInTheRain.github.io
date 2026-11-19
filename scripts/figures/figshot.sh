#!/bin/bash
# Screenshot blog figure components in light EN, light VI and dark VI with one command.
#
#   scripts/figures/figshot.sh <port> <out-dir> <Component> [Component ...]
#
# Run from the repo root (or a worktree root) while `npx astro dev --port <port>` is running
# there. Each component is rendered inside the site Layout (real CSS tokens, fonts, charset),
# twice (with `lang="en"` and `lang="vi"`), and the site's data-lang CSS shows the copy that
# matches ?lang=, so components with or without a lang prop both come out right. Writes <out-dir>/figs-light-en.png, figs-light-vi.png, figs-dark-vi.png and
# removes its temporary pages afterwards, even on failure.
#
# Why: agents used to hand-build temp pages and Chrome commands for every check, which cost
# dozens of tool calls per post. Read the PNGs; do not estimate text width from character counts.
set -euo pipefail
[ $# -ge 3 ] || { echo "usage: $0 <port> <out-dir> <Component> [Component ...]" >&2; exit 2; }
PORT=$1; OUT=$2; shift 2
ROOT=$(pwd)
[ -f "$ROOT/astro.config.mjs" ] || { echo "run from the repo root" >&2; exit 2; }
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
HEIGHT="${FIGSHOT_HEIGHT:-1600}"
PAGE_DIR="$ROOT/src/pages/tmp-figshot"; SHOT_DIR="$ROOT/public/tmp-figshot"
PROFILE=$(mktemp -d)
cleanup() { rm -rf "$PAGE_DIR" "$SHOT_DIR" "$PROFILE"; }
trap cleanup EXIT
mkdir -p "$PAGE_DIR" "$SHOT_DIR" "$OUT"

for c in "$@"; do
  [ -f "$ROOT/src/components/mdx/$c.astro" ] || { echo "no such component: src/components/mdx/$c.astro" >&2; exit 2; }
done

{
  echo "---"
  echo "import Layout from '../../layouts/Layout.astro';"
  for c in "$@"; do echo "import $c from '../../components/mdx/$c.astro';"; done
  echo "---"
  echo '<Layout title="figshot" description="figshot"><main style="max-width:960px;margin:12px auto;padding:0 12px">'
  # dev pages are prerendered, so ?lang= cannot reach a prop: render both and let the site's
  # data-lang-en / data-lang-vi CSS show the right one.
  for c in "$@"; do echo "<div data-lang-en><$c lang=\"en\" /></div><div data-lang-vi><$c lang=\"vi\" /></div>"; done
  echo '</main></Layout>'
} > "$PAGE_DIR/index.astro"

cat > "$SHOT_DIR/dark.html" <<HTML
<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">
<iframe src="/tmp-figshot/?lang=vi" width="1000" height="$HEIGHT" style="border:0;display:block"
  onload="this.contentDocument.documentElement.setAttribute('data-theme','dark')"></iframe>
</body></html>
HTML

BASE="http://localhost:$PORT"
# wait for the dev server to pick up the new page
for _ in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/tmp-figshot/" || true)
  [ "$code" = 200 ] && break; sleep 0.5
done
[ "${code:-}" = 200 ] || { echo "temp page did not load (HTTP ${code:-none}); is astro dev running on $PORT here?" >&2; exit 1; }

shoot() { "$CHROME" --headless=new --disable-gpu --user-data-dir="$PROFILE" --hide-scrollbars \
  --window-size=1000,"$HEIGHT" --virtual-time-budget=6000 --screenshot="$1" "$2" >/dev/null 2>&1; }
shoot "$OUT/figs-light-en.png" "$BASE/tmp-figshot/?lang=en"
shoot "$OUT/figs-light-vi.png" "$BASE/tmp-figshot/?lang=vi"
shoot "$OUT/figs-dark-vi.png"  "$BASE/tmp-figshot/dark.html"
ls "$OUT"/figs-*.png
