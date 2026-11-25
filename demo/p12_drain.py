"""What happens to one in-flight request when the container is told to stop?

usage: python p12_drain.py stop|kill|shell|exec

stop  : docker stop  (SIGTERM, then SIGKILL after 5 s)  against the real image
kill  : docker kill  (SIGKILL straight away)
shell : entrypoint `sh -c "... && uvicorn ..."` -> sh is PID 1 and swallows SIGTERM
exec  : same, but `exec uvicorn ...`             -> uvicorn is PID 1
"""

import subprocess
import sys
import threading
import time

import httpx

IMAGE = "clue-api:p12"
NAME = "p12-drain"
PORT = 18155
START = "echo migrating && {exec}uvicorn p12_app:app --host 0.0.0.0 --port 8000"


def docker(*args: str) -> str:
    return subprocess.run(["docker", *args], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout.strip()


def main(mode: str) -> None:
    docker("rm", "-f", NAME)
    cmd = ["run", "-d", "--name", NAME, "-p", f"127.0.0.1:{PORT}:8000",
           "-e", "CLUE_DATABASE_URL=sqlite:///demo.db", "-e", "CLUE_SLOW_MS=2000"]
    if mode in ("shell", "exec"):
        cmd += ["--entrypoint", "sh", IMAGE, "-c", START.format(exec="exec " if mode == "exec" else "")]
    else:
        cmd += [IMAGE]
    docker(*cmd)
    while True:
        try:
            if httpx.get(f"http://127.0.0.1:{PORT}/readyz").status_code == 200:
                break
        except httpx.HTTPError:
            time.sleep(0.2)

    result = {}

    def slow_request() -> None:
        started = time.monotonic()
        try:
            r = httpx.get(f"http://127.0.0.1:{PORT}/slow", timeout=15)
            result["request"] = f"HTTP {r.status_code} after {time.monotonic() - started:.1f}s"
        except httpx.HTTPError as exc:
            result["request"] = f"{type(exc).__name__} after {time.monotonic() - started:.1f}s"

    t = threading.Thread(target=slow_request)
    t.start()
    time.sleep(0.5)  # the request is now in flight

    began = time.monotonic()
    if mode == "kill":
        docker("kill", NAME)
    else:
        docker("stop", "-t", "5", NAME)
    took = time.monotonic() - began
    t.join()
    code = docker("inspect", NAME, "--format", "{{.State.ExitCode}}")
    print(f"{mode}: in-flight request -> {result['request']}")
    print(f"{mode}: container stopped in {took:.1f}s, exit code {code}")
    for line in docker("logs", NAME).splitlines():
        print("   ", line)
    docker("rm", "-f", NAME)


if __name__ == "__main__":
    main(sys.argv[1])
