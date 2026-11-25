"""Check that every python / yaml / dockerfile block in the post is a verbatim
slice of a committed demo file.

usage: python p12_check_blocks.py   (from the demo/ folder)
"""

import pathlib
import re
import sys

POST = pathlib.Path("../src/content/blog/backend-production-deploy.mdx")
SOURCES = [*pathlib.Path(".").glob("p12_*.py"), *pathlib.Path("p12").rglob("*")]
SOURCES = [p for p in SOURCES if p.is_file() and p.name != "uv.lock"]

corpus = {p: p.read_text() for p in SOURCES}
blocks = re.findall(r"^```(python|yaml|dockerfile)\n(.*?)\n```$", POST.read_text(), re.S | re.M)
bad = 0
for lang, body in blocks:
    home = next((p for p, text in corpus.items() if body in text), None)
    print(f"{'ok ' if home else 'BAD'} {lang:10} {len(body.splitlines()):3} lines  {home or body.splitlines()[0]}")
    bad += home is None
print(f"{len(blocks)} blocks, {bad} not found in a demo file")
sys.exit(1 if bad else 0)
