# Can a correlation tree recover 7 sectors among 100 stocks, and how much history does it need?
# Run: uv run --with numpy --with scipy --with scikit-learn python demo/ai-trading/p10_recovery.py
# Everything is simulated from the assumptions below; no network, seeded.
import numpy as np
from sklearn.metrics import adjusted_rand_score
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import squareform
from math import comb

N, K = 100, 7
sector = np.arange(N) % K              # 100 stocks, 7 sectors of 14 or 15 names
rng = np.random.default_rng(10)


def simulate(T):
    market = rng.standard_normal((T, 1))
    sect = rng.standard_normal((T, K))[:, sector]
    noise = rng.standard_normal((T, N))
    return 0.5 * market + 0.6 * sect + noise    # same-sector corr ~0.38, cross-sector ~0.16


def cluster(returns, method):
    d = np.sqrt(0.5 * (1 - np.corrcoef(returns.T)))
    np.fill_diagonal(d, 0)
    return fcluster(linkage(squareform(d, checks=False), method), K, "maxclust")


print(f"pairs among {N} stocks: {comb(N, 2):,}")
print("adjusted Rand index vs the true sectors (1 = exact, 0 = chance; mean of 100 runs, cut at 7 groups)")
print(f"{'days':>5} {'single':>8} {'average':>8} {'ward':>8}")
for T in (20, 60, 250, 1000):
    scores = {m: [] for m in ("single", "average", "ward")}
    for _ in range(100):
        r = simulate(T)
        for m in scores:
            scores[m].append(adjusted_rand_score(sector, cluster(r, m)))
    print(f"{T:>5} " + " ".join(f"{np.mean(v):8.3f}" for v in scores.values()))
