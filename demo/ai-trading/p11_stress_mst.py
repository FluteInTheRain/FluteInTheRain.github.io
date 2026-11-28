# Post 11 (Graphs), worked case: spot a stress regime from a correlation network.
# Run: uv run --with numpy --with scipy python demo/ai-trading/p11_stress_mst.py
import numpy as np
from scipy.sparse.csgraph import minimum_spanning_tree

N, SECTORS, T, WIN = 20, 4, 900, 60
SHOCK = range(600, 660)                       # days with a market-wide shock
sector = np.repeat(np.arange(SECTORS), N // SECTORS)

def simulate(w_stress, seed=11):
    rng = np.random.default_rng(seed)
    w = np.full(T, 0.4)                       # market-factor weight: 0.4 in calm days
    w[list(SHOCK)] = w_stress
    market = rng.standard_normal(T)
    sect = rng.standard_normal((T, SECTORS))
    return w[:, None] * market[:, None] + 0.6 * sect[:, sector] + rng.standard_normal((T, N))

def tree_length(window):
    rho = np.corrcoef(window.T)
    dist = np.sqrt(2 * (1 - rho))
    return minimum_spanning_tree(dist).sum() / (N - 1), rho[np.triu_indices(N, 1)].mean()

def run(w_stress):
    r = simulate(w_stress)
    ends = np.arange(WIN, T + 1)              # window = days [end - 60, end)
    length, rho = map(np.array, zip(*(tree_length(r[e - WIN:e]) for e in ends)))
    base = ends <= 500                        # calibrate on the first 500 days only
    z = (length - length[base].mean()) / length[base].std()
    flag = z < -3                             # a tree much shorter than usual
    hit = (ends >= 601) & (ends <= 719)       # windows that overlap the shock
    free = ((ends > 500) & (ends <= 540)) | (ends > 780)
    first = ends[flag & (ends > 600)]
    print(f"shock weight {w_stress}: tree/link {length[base].mean():.3f} calm -> "
          f"{length[(ends > 640) & (ends <= 660)].mean():.3f} in shock; "
          f"mean rho {rho[base].mean():.2f} -> {rho[(ends > 640) & (ends <= 660)].mean():.2f}")
    print(f"  flagged {flag[hit].sum()} of {hit.sum()} shock windows, "
          f"{flag[free].sum()} of {free.sum()} shock-free windows, "
          f"first flag {first[0] - 600 if first.size else 'never'} days in")

for w_stress in (1.2, 0.8):
    run(w_stress)
