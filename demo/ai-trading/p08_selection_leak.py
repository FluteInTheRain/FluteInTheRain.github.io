# Run: uv run --with numpy --with scipy --with scikit-learn demo/ai-trading/p08_selection_leak.py
# Pure noise: no feature carries any information about returns. Where does a "skill" come from?
import numpy as np
from scipy.stats import spearmanr
from sklearn.linear_model import Ridge

T, N, F = 60, 100, 300                      # months, stocks, candidate features

def make(seed):
    global X, y
    rng = np.random.default_rng(seed)
    X = rng.standard_normal((T, N, F))      # features: noise
    y = rng.standard_normal((T, N))         # next-month return: noise

def pick(months, k=10):
    """Rank the k features with the highest |mean monthly rank IC| over `months`."""
    ic = np.array([[spearmanr(X[t, :, j], y[t])[0] for j in range(F)] for t in months])
    return np.argsort(-np.abs(ic.mean(0)))[:k]

def mean_ic(cols, train, test):
    m = Ridge(alpha=100).fit(X[train][:, :, cols].reshape(-1, len(cols)), y[train].ravel())
    ics = [spearmanr(m.predict(X[t][:, cols]), y[t])[0] for t in test]
    return np.mean(ics)

train, test = np.arange(0, 40), np.arange(40, 60)

def run(seed):
    make(seed)
    leaky = pick(np.arange(T))              # LEAK: features chosen using all 60 months
    clean = pick(train)                     # features chosen using the training months only
    return mean_ic(leaky, train, test), mean_ic(clean, train, test)

a, b = run(8)
print(f"features chosen on all months : test IC = {a:+.3f}")
print(f"features chosen on train only : test IC = {b:+.3f}")

# 20 fresh noise panels, to see that seed 8 is not a fluke
res = np.array([run(s) for s in range(100, 120)])
print(f"20 more panels, mean test IC  : all-months {res[:,0].mean():+.3f}, train-only {res[:,1].mean():+.3f}")
