# Post 4 (Statistics), worked case: a t-statistic of 2.3 found after 40 tries.
# Run: uv run --with numpy --with scipy python demo/ai-trading/p04_best_of_n.py
import numpy as np
from scipy import stats

N_TRIES, YEARS, DAYS = 40, 5, 252
rng = np.random.default_rng(7)

def tstat(r):
    # t-statistic of the mean daily return, one value per strategy (row)
    return r.mean(axis=1) / (r.std(axis=1, ddof=1) / np.sqrt(r.shape[1]))

# 1. The claim: t = 2.3, taken at face value
t_claim = 2.3
p_one = 2 * stats.norm.sf(t_claim)
print(f"claim t={t_claim}: one-test p = {p_one:.3f}")

# 2. Count the tries: Bonferroni bar and adjusted p for 40 tries
bar = stats.norm.isf(0.05 / N_TRIES / 2)
print(f"{N_TRIES} tries: Bonferroni bar t = {bar:.2f}, adjusted p = {min(1, N_TRIES * p_one):.2f}")

# 3. Replay the search on pure noise: 40 strategies, 5 years each, zero edge
runs = 2000
best = np.empty(runs)
for i in range(runs):
    noise = rng.normal(0, 0.01, size=(N_TRIES, YEARS * DAYS))
    best[i] = tstat(noise).max()
print(f"best t of {N_TRIES} noise strategies: median {np.median(best):.2f}, "
      f"share >= {t_claim}: {(best >= t_claim).mean():.0%}")

# 4. Fresh data: pick the winner on 5 years, test it on 2 new years
fresh = []
for i in range(runs):
    old = rng.normal(0, 0.01, size=(N_TRIES, YEARS * DAYS))
    new = rng.normal(0, 0.01, size=(N_TRIES, 2 * DAYS))
    w = tstat(old).argmax()
    fresh.append(tstat(new[w:w + 1])[0])
print(f"winner on fresh 2 years: mean t = {np.mean(fresh):.2f}")
