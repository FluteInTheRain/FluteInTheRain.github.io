# Post 15 worked case: window length and memory.
# Run: uv run --with numpy python demo/ai-trading/p15_window_memory.py
# Self-contained, seeded, no network.
import numpy as np

rng = np.random.default_rng(15)

# Say daily returns carry a real effect at lag 40: r[t] = 0.3 * r[t-40] + noise (1% daily)
n = 3000
r = rng.normal(0, 0.01, n)
for t in range(40, n):
    r[t] += 0.3 * r[t - 40]

def windows(x, w):
    # sample t uses x[t-w : t] as input and x[t] as the answer
    X = np.stack([x[i:i + w] for i in range(len(x) - w)])
    return X, x[w:]

def oos_r2(w):
    X, y = windows(r, w)
    cut = int(0.7 * len(y))                      # split by time, no shuffle
    A = np.c_[np.ones(cut), X[:cut]]
    beta = np.linalg.lstsq(A, y[:cut], rcond=None)[0]
    pred = np.c_[np.ones(len(y) - cut), X[cut:]] @ beta
    yt = y[cut:]
    return 1 - ((yt - pred) ** 2).sum() / (yt ** 2).sum(), len(y)

print("window  examples  share of days reused  out-of-sample R2 vs zero")
for w in (20, 60, 120):
    r2, m = oos_r2(w)
    print(f"{w:>6}  {m:>8}  {1 - 1 / w:>19.0%}  {r2:>24.4f}")

print("\nshare of day 1 left after n steps, memory factor f per step")
print("   n   f=0.90   f=0.97   f=0.99")
for k in (10, 20, 50, 100):
    print(f"{k:>4}  " + "  ".join(f"{f ** k:>7.1%}" for f in (0.90, 0.97, 0.99)))
