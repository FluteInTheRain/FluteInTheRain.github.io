# Worked case for the post "Portfolio" (ai-trading-portfolio): min-variance weights from 60 months of data.
# Run: uv run --with numpy==2.3.5 --with scikit-learn==1.8.0 python demo/ai-trading/p07_minvar_shrinkage.py
# Everything is simulated from a stated assumption (one-factor world, 30 stocks); no network, no real data.
import numpy as np
from sklearn.covariance import LedoitWolf

rng = np.random.default_rng(7)
N, T, TRIALS = 30, 60, 300

# Assumed truth: monthly vol 6% to 12%, market loading 0.5 to 1.3, so pairwise correlation is around 0.3 to 0.5
beta = rng.uniform(0.5, 1.3, N)
idio = rng.uniform(0.04, 0.09, N)
mkt = 0.045
true_cov = mkt**2 * np.outer(beta, beta) + np.diag(idio**2)

def draw(t):
    f = rng.normal(0, mkt, (t, 1))
    return f * beta + rng.normal(0, 1, (t, N)) * idio

def min_var(cov):
    w = np.linalg.solve(cov, np.ones(N))
    return w / w.sum()

def true_vol(w):
    return float(np.sqrt(w @ true_cov @ w) * np.sqrt(12))

equal = np.full(N, 1 / N)
rows = {"equal weight": [], "sample min-var": [], "shrunk min-var": []}
first = None
for k in range(TRIALS):
    x = draw(T)
    w_s = min_var(np.cov(x, rowvar=False))
    lw = LedoitWolf().fit(x)
    w_l = min_var(lw.covariance_)
    if k == 0:
        first = (w_s, lw.shrinkage_)
    rows["equal weight"].append(true_vol(equal))
    rows["sample min-var"].append(true_vol(w_s))
    rows["shrunk min-var"].append(true_vol(w_l))

best = true_vol(min_var(true_cov))
print(f"{N} stocks, {T} months of data, {TRIALS} histories")
print(f"best possible vol (knows the true covariance): {best:.1%}")
for name, v in rows.items():
    print(f"{name:15s} realised vol {np.mean(v):.1%}")
w_s, shrink = first
print(f"history 1: Ledoit-Wolf shrinkage = {shrink:.2f}")
print(f"history 1: sample weights run from {w_s.min():+.1%} to {w_s.max():+.1%}; {int((w_s < 0).sum())} of {N} are short")
