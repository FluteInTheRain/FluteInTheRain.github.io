"""Write the OpenAPI snapshot that tests_p09/test_contract.py compares against.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' python p09_snapshot.py
"""

import json
from pathlib import Path

from layered_app import app

target = Path(__file__).parent / "tests_p09" / "openapi.snapshot.json"
target.write_text(json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n")
print(f"wrote {target.name}: {len(app.openapi()['paths'])} paths")
