# One message-passing step by hand on a 5-stock graph (post 18, ai-trading-gnn).
# Run: uv run --with numpy python demo/ai-trading/p18_gcn_step.py
# The returns and the edges are assumptions made for the walk-through, not market data.
import numpy as np

names = ["HPG", "HSG", "NKG", "VCB", "BID"]
edges = [(0, 1), (0, 2), (1, 2), (3, 4), (2, 3)]   # steel triangle, two banks, NKG-VCB bridge
x = np.array([1.0, 1.4, 2.2, -0.4, -1.0])          # yesterday's return, in %

n = len(names)
A = np.zeros((n, n))
for i, j in edges:
    A[i, j] = A[j, i] = 1.0

A_hat = A + np.eye(n)                      # every stock keeps a self-loop
deg = A_hat.sum(axis=1)                    # neighbours + itself
S = A_hat / np.sqrt(np.outer(deg, deg))    # D^-1/2 (A+I) D^-1/2, the Kipf-Welling form
mean = A_hat / deg[:, None]                # plain row average, for comparison

def show(label, v):
    order = [names[k] for k in np.argsort(-v)]
    print(f"{label:<10}", np.round(v, 2), "->", " > ".join(order))

show("raw", x)
show("mean", mean @ x)
show("gcn x1", S @ x)

h = x.copy()
for layer in range(1, 5):
    h = S @ h
    print(f"layer {layer}: spread (max-min) = {h.max() - h.min():.2f}")
