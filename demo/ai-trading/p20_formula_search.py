# Random formula search on a market of pure noise, with a held-out split.
# Run: uv run --with numpy --with scipy python demo/ai-trading/p20_formula_search.py
import numpy as np
from scipy.stats import norm

rng = np.random.default_rng(20)
T, SEARCH = 1400, 650  # 650 days to search, 750 days held back

# A market with no pattern: next-day return is independent of everything before it.
ret = rng.normal(0, 0.01, T)
close = 100 * np.exp(np.cumsum(ret))
open_ = np.r_[100.0, close[:-1]] * np.exp(rng.normal(0, 0.004, T))
high = np.maximum(open_, close) * (1 + np.abs(rng.normal(0, 0.004, T)))
low = np.minimum(open_, close) * (1 - np.abs(rng.normal(0, 0.004, T)))
data = {"open": open_, "high": high, "low": low, "close": close,
        "ret": np.r_[0, ret[1:]]}

def delta(x, d):
    return np.r_[np.zeros(d), x[d:] - x[:-d]]

def mean(x, d):
    c = np.cumsum(np.r_[0, x])
    out = (c[d:] - c[:-d]) / d
    return np.r_[np.full(d - 1, out[0]), out]

UNARY = [lambda x: np.sign(x), lambda x: -x,
         *[lambda x, d=d: delta(x, d) for d in (1, 2, 5, 10)],
         *[lambda x, d=d: mean(x, d) for d in (3, 5, 10, 20)]]
BINARY = [lambda a, b: a + b, lambda a, b: a - b, lambda a, b: a * b,
          lambda a, b: a / (np.abs(b) + 1e-3)]

def random_tree(depth):
    """Returns a function of the data dict, built from random operators."""
    if depth == 0 or rng.random() < 0.25:
        name = list(data)[rng.integers(len(data))]
        return lambda d, n=name: d[n]
    if rng.random() < 0.5:
        f, sub = UNARY[rng.integers(len(UNARY))], random_tree(depth - 1)
        return lambda d: f(sub(d))
    f = BINARY[rng.integers(len(BINARY))]
    l, r = random_tree(depth - 1), random_tree(depth - 1)
    return lambda d: f(l(d), r(d))

def sharpe(sig, lo, hi):
    sig = sig - mean(sig, 20)  # long when the signal is above its 20-day average
    pos = np.sign(sig[lo - 1:hi - 1])  # trade tomorrow on today's signal
    pnl = pos * ret[lo:hi]
    return 0.0 if pnl.std() == 0 else pnl.mean() / pnl.std() * np.sqrt(252)

N = 2000
scores = []
for i in range(N):
    sig = random_tree(3)(data)
    scores.append((sharpe(sig, 1, SEARCH), sharpe(sig, SEARCH, T)))
scores = np.array(scores)
best = scores[:, 0].argmax()

sd = np.sqrt(252 / SEARCH)  # std error of one zero-skill Sharpe
g = 0.5772
exp_max = sd * ((1 - g) * norm.ppf(1 - 1 / N) + g * norm.ppf(1 - 1 / (N * np.e)))
print(f"formulas tried            : {N}")
print(f"best in search window     : {scores[best, 0]:.2f}")
print(f"same formula, held-out    : {scores[best, 1]:.2f}")
print(f"mean of all, search/held  : {scores[:, 0].mean():.2f} / {scores[:, 1].mean():.2f}")
print(f"expected best of {N} (iid): {exp_max:.2f}")
print(f"formulas above 1.0 in search: {(scores[:, 0] > 1).sum()}, of those above 1.0 held-out: {((scores[:, 0] > 1) & (scores[:, 1] > 1)).sum()}")
