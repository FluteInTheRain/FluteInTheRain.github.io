# Post 09 worked case: why did stock B rank above stock A?
# Run: uv run --with numpy python demo/ai-trading/p09_shapley_pair.py
# Self-contained, no network. The scoring model and the two stocks are assumptions.
from itertools import permutations
import numpy as np

names = ["momentum", "value", "volatility"]

def score(x):
    mom, val, vol = x
    return 0.5 * mom + 0.3 * val - 0.4 * vol + 0.4 * mom * val

def shapley(f, x, base):
    """Exact Shapley values: average marginal gain over every order of arrival."""
    n = len(x)
    phi = np.zeros(n)
    orders = list(permutations(range(n)))
    for order in orders:
        cur = np.array(base, dtype=float)
        prev = f(cur)
        for i in order:
            cur[i] = x[i]
            now = f(cur)
            phi[i] += now - prev
            prev = now
    return phi / len(orders)

A = np.array([1.0, 0.0, 0.5])    # strong momentum, no value edge, medium volatility
B = np.array([0.6, 1.2, 0.3])    # milder momentum, cheap, calm
market = np.zeros(3)             # "average stock" = 0 on every feature

print(f"score A = {score(A):.3f}   score B = {score(B):.3f}   gap = {score(B) - score(A):.3f}")
for label, base in [("vs market average", market), ("vs stock A", A)]:
    phi = shapley(score, B, base)
    gap = score(B) - score(base)
    print(f"\nB {label}: gap to explain = {gap:.3f}")
    for n, p in zip(names, phi):
        print(f"  {n:<11}{p:+.3f}")
    print(f"  sum        {phi.sum():+.3f}")
