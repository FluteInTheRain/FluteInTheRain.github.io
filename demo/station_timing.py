"""Time each station of one HTTPS request, with raw sockets.

Post 1 of the backend series walks a request through DNS, TCP, TLS and HTTP
before the server's app runs. This script pays each station separately, so
the costs in the post can be checked by hand:

    cd demo
    uv run --python 3.13 station_timing.py
"""

import socket
import ssl
import time

HOST = "fastapi.tiangolo.com"


def ms(since: float) -> float:
    return (time.perf_counter() - since) * 1000


# Station 1: DNS — a name becomes an address.
t = time.perf_counter()
addr = socket.getaddrinfo(HOST, 443, proto=socket.IPPROTO_TCP)[0][4][0]
print(f"DNS   {ms(t):7.1f} ms   {HOST} -> {addr}")

# Station 2: TCP — the three-way handshake opens the pipe.
t = time.perf_counter()
sock = socket.create_connection((HOST, 443))
print(f"TCP   {ms(t):7.1f} ms   connected to {addr}:443")

# Station 3: TLS — keys agreed, certificate checked.
t = time.perf_counter()
tls = ssl.create_default_context().wrap_socket(sock, server_hostname=HOST)
print(f"TLS   {ms(t):7.1f} ms   {tls.version()}")

# Station 4 + 5: HTTP is the letter inside the pipe; the first bytes back
# are one more round trip. This is the only station your profiler ever sees.
t = time.perf_counter()
tls.sendall(
    b"GET / HTTP/1.1\r\n"
    + f"Host: {HOST}\r\n".encode()
    + b"User-Agent: station-timing\r\n"
    + b"Accept: */*\r\n"
    + b"Connection: close\r\n\r\n"
)
status = tls.recv(256).split(b"\r\n")[0].decode()
print(f"HTTP  {ms(t):7.1f} ms   {status}")
tls.close()
