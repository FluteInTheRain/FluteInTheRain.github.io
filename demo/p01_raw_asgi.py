"""Post 1: the ASGI contract with no framework at all.

    cd demo
    uv run --python 3.13 --with 'uvicorn[standard]' uvicorn p01_raw_asgi:app --port 4331
    curl -i http://127.0.0.1:4331/cases/42?x=1
"""


async def app(scope, receive, send):
    if scope["type"] != "http":
        return  # lifespan etc.: this toy app only speaks HTTP
    print("scope keys:", sorted(scope))
    body = f"{scope['method']} {scope['path']}".encode()
    await send(
        {
            "type": "http.response.start",
            "status": 200,
            "headers": [(b"content-type", b"text/plain")],
        }
    )
    await send({"type": "http.response.body", "body": body})
