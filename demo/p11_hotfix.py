"""The same app with the profiler's finding fixed: dedupe through a dict.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with pyinstrument uvicorn p11_hotfix:app --port 4362
"""

import p11_hotspot

p11_hotspot.dedupe = lambda items: list(dict.fromkeys(items))  # one pass, O(n)
app = p11_hotspot.app
