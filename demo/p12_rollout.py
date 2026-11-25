"""Roll out a new release while a load loop runs, then print what callers saw.

usage: python p12_rollout.py <deploy-yaml> <new-release> [requests-per-second]

Safety: kubectl runs only against the kind cluster. KUBECONFIG must point at a
file you made for it, and the current context must be kind-p12.
"""

import asyncio
import os
import subprocess
import sys
import time

from p12_load import report, run_load

URL = "http://127.0.0.1:18080/work"
HERE = os.path.dirname(os.path.abspath(__file__))


def kubectl(*args: str) -> str:
    done = subprocess.run(["kubectl", *args], capture_output=True, text=True, check=True)
    return done.stdout.strip()


async def main(manifest: str, release: str, rps: int) -> None:
    if not os.environ.get("KUBECONFIG"):
        sys.exit("refusing to run: set KUBECONFIG to the kind cluster's file")
    context = kubectl("config", "current-context")
    if context != "kind-p12":
        sys.exit(f"refusing to run: context is {context!r}, expected 'kind-p12'")

    kubectl("apply", "-f", f"{HERE}/p12/k8s/config.yaml", "-f", f"{HERE}/p12/k8s/service.yaml")
    kubectl("apply", "-f", f"{HERE}/p12/k8s/{manifest}")
    kubectl("rollout", "status", "deployment/clue-api", "--timeout=120s")
    time.sleep(8)  # let every pod finish warming up before the baseline

    stop = asyncio.Event()
    load = asyncio.create_task(run_load(URL, rps, stop))
    await asyncio.sleep(3)
    print(f"rolling out {release} with {manifest}")
    await asyncio.to_thread(kubectl, "set", "env", "deployment/clue-api", f"CLUE_RELEASE={release}")
    await asyncio.to_thread(kubectl, "rollout", "status", "deployment/clue-api", "--timeout=120s")
    await asyncio.sleep(10)  # keep counting while old pods finish terminating
    stop.set()
    report(await load)


if __name__ == "__main__":
    rps = int(sys.argv[3]) if len(sys.argv) > 3 else 20
    asyncio.run(main(sys.argv[1], sys.argv[2], rps))
