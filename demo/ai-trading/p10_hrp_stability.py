# Worked case: 12 assets, half a year of returns. Is the tree stable, and what does HRP do with it?
# Run: uv run --with numpy --with scipy python demo/ai-trading/p10_hrp_stability.py
# Assumption (simulated, seeded): 12 assets in 3 groups of 4, daily volatility 0.8% / 1.4% / 2.0%
# for groups A / B / C, one market factor and one factor per group.
import numpy as np
from scipy.cluster.hierarchy import linkage, leaves_list, fcluster
from scipy.spatial.distance import squareform

rng = np.random.default_rng(1010)
group = np.repeat([0, 1, 2], 4)
vol = np.array([0.008, 0.014, 0.020])[group]


def simulate(T):
    z = 0.5 * rng.standard_normal((T, 1)) + 0.6 * rng.standard_normal((T, 3))[:, group]
    return (z + rng.standard_normal((T, 12))) / np.sqrt(0.25 + 0.36 + 1) * vol


def tree(r, method="ward"):
    d = np.sqrt(0.5 * (1 - np.corrcoef(r.T)))
    np.fill_diagonal(d, 0)
    return linkage(squareform(d, checks=False), method)


def block_var(cov, idx):
    """Variance of a block held with inverse-variance weights."""
    c = cov[np.ix_(idx, idx)]
    ivp = 1 / np.diag(c)
    ivp /= ivp.sum()
    return ivp @ c @ ivp


def hrp_weights(r):
    cov = np.cov(r.T)
    w = np.ones(12)
    blocks = [list(leaves_list(tree(r)))]      # leaf order puts similar assets side by side
    while blocks:
        nxt = []
        for b in blocks:
            if len(b) < 2:
                continue
            left, right = b[: len(b) // 2], b[len(b) // 2:]
            v_l, v_r = block_var(cov, left), block_var(cov, right)
            a = 1 - v_l / (v_l + v_r)          # the calmer half gets the larger share
            w[left] *= a
            w[right] *= 1 - a
            nxt += [left, right]
        blocks = nxt
    return w / w.sum()


train = simulate(120)
labels = lambda r: fcluster(tree(r), 3, "maxclust")


def pairs_kept(a, b):
    """Share of the 66 asset pairs that both halves treat the same way (together or apart)."""
    iu = np.triu_indices(len(a), 1)
    return ((a[:, None] == a[None, :])[iu] == (b[:, None] == b[None, :])[iu]).mean()


print("check 1, do the two halves of the history give the same 3 groups?")
for days in (120, 24):
    h = days // 2
    print(f"  {days:>3} days ({h}+{h}): {pairs_kept(labels(train[:h]), labels(train[h:days])):.0%} of pairs agree")

w = hrp_weights(train)
iv = (1 / train.var(0)) / (1 / train.var(0)).sum()
print("check 2, weights by group (A calm, B medium, C wild)")
for name, ww in (("equal 1/N", np.full(12, 1 / 12)), ("inverse-var", iv), ("HRP", w)):
    print(f"  {name:12s}", " ".join(f"{ww[group == g].sum():5.1%}" for g in range(3)))

test = simulate(2000)
print("check 3, daily volatility on 2,000 fresh days")
for name, ww in (("equal 1/N", np.full(12, 1 / 12)), ("inverse-var", iv), ("HRP", w)):
    print(f"  {name:12s} {np.std(test @ ww):.3%}")
