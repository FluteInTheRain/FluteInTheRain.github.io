"""Read ConsoleSpanExporter output and print one trace as a table.

    python p10_spans.py clue.out lab.out             # the last trace, as a table
    python p10_spans.py --raw "GET /analyze/{case_id}" clue.out lab.out

The table hides the ASGI "http send/receive" spans: they are real, just noise.
"""

import json
import sys
from datetime import datetime


def spans_in(path: str) -> list[dict]:
    lines, found, buf = open(path).read().splitlines(), [], None
    for line in lines:
        if line == "{":
            buf = [line]
        elif buf is not None:
            buf.append(line)
            if line == "}":
                found.append(json.loads("\n".join(buf)))
                buf = None
    return found


def ms(span: dict) -> float:
    start = datetime.fromisoformat(span["start_time"])
    end = datetime.fromisoformat(span["end_time"])
    return (end - start).total_seconds() * 1000


args = sys.argv[1:]
raw = args.pop(1) if args[0] == "--raw" else None
args = [a for a in args if a != "--raw"]
spans = [s for path in args for s in spans_in(path)]
trace_id = max(spans, key=lambda s: s["start_time"])["context"]["trace_id"]
mine = sorted(
    (s for s in spans if s["context"]["trace_id"] == trace_id),
    key=lambda s: s["start_time"],
)
if raw:
    print(json.dumps(next(s for s in mine if s["name"] == raw), indent=2))
    sys.exit()
print(f"trace_id {trace_id}")
t0 = datetime.fromisoformat(mine[0]["start_time"])
print(f"{'span_id':<20}{'parent_id':<20}{'at ms':>8}{'ms':>9}  service / name")
for s in mine:
    if s["name"].endswith(("http send", "http receive")):
        continue
    parent = s["parent_id"] or "-"
    service = s["resource"]["attributes"]["service.name"]
    at = (datetime.fromisoformat(s["start_time"]) - t0).total_seconds() * 1000
    print(f"{s['context']['span_id']:<20}{parent:<20}{at:>8.2f}{ms(s):>9.2f}  {service} / {s['name']}")
