#!/bin/bash
# One-line health check for a blog post and the components it changed.
#
#   scripts/figures/post-check.sh <slug> <base-ref> <port>
#
# Run from the repo root with `npx astro dev --port <port>` running there. Prints one line:
#   framing=<n> hex=<n> http=<code> overlay=<n> badIslands=<n>
# and exits non-zero if any check fails.
#   framing     book/chapter framing left in the post ("chapter 4", "the book says", ...); want 0
#   hex         hard-coded hex colours ADDED since <base-ref> in src/components (use CSS tokens); want 0
#   http        status of /blog/<slug>/ on the dev server; want 200
#   overlay     Vite error overlay present in the page; want 0
#   badIslands  astro-island component/renderer URLs that do not return 200; want 0
set -uo pipefail
[ $# -eq 3 ] || { echo "usage: $0 <slug> <base-ref> <port>" >&2; exit 2; }
SLUG=$1; BASE=$2; PORT=$3
F="src/content/blog/$SLUG.mdx"
[ -f "$F" ] || { echo "no such post: $F" >&2; exit 2; }

framing=$(grep -v '^  - {' "$F" | grep -ciE 'chapter [0-9]|chương [0-9]|the book|cuốn sách|của sách|kleppmann (says|argues|calls|writes|notes)|ddia (chapter|chương)' || true)
hex=$(git diff "$BASE" -- src/components | grep '^+' | grep -v '^+++' | sed 's#//.*##' \
  | grep -oE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' | wc -l | tr -d ' ')
untracked_hex=$(git ls-files -o --exclude-standard src/components | xargs -I{} sed 's#//.*##' {} 2>/dev/null \
  | grep -oE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' | wc -l | tr -d ' ')
hex=$((hex + untracked_hex))

TMP=$(mktemp); trap 'rm -f "$TMP"' EXIT
http=$(curl -s -o "$TMP" -w '%{http_code}' --max-time 180 "http://localhost:$PORT/blog/$SLUG/" || echo 000)
overlay=$(grep -ci 'vite-error-overlay' "$TMP" || true)
bad=0
for u in $(grep -oE '(component-url|renderer-url)="[^"]*"' "$TMP" | sed -E 's/.*="([^"]*)"/\1/' | sort -u); do
  c=$(curl -g -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$u")
  [ "$c" = 200 ] || bad=$((bad + 1))
done

echo "framing=$framing hex=$hex http=$http overlay=$overlay badIslands=$bad"
[ "$framing" = 0 ] && [ "$hex" = 0 ] && [ "$http" = 200 ] && [ "$overlay" = 0 ] && [ "$bad" = 0 ]
