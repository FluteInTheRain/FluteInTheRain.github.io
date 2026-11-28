# Post 11 (Graphs): do communities recover sectors, and what does a "best Sharpe per community"
# rule earn on a market where no stock has any edge?
# Run: uv run --with numpy --with networkx python demo/ai-trading/p11_community_noise.py
import numpy as np
import networkx as nx

N, SECTORS = 30, 5
sector = np.repeat(np.arange(SECTORS), N // SECTORS)
same = sector[:, None] == sector[None, :]

def market(T, seed):                          # zero-mean returns in % per day, sector structure
    rng = np.random.default_rng(seed)
    f = 0.4 * rng.standard_normal((T, 1)) + 0.6 * rng.standard_normal((T, SECTORS))[:, sector]
    return (f + rng.standard_normal((T, N))) * 0.7

def communities(window):
    rho = np.corrcoef(window.T)
    g = nx.Graph()
    g.add_nodes_from(range(N))
    iu = np.triu_indices(N, 1)
    cut = np.sort(rho[iu])[-3 * (N - 2)]      # keep the strongest 3(N-2) = 84 links
    g.add_weighted_edges_from((i, j, rho[i, j]) for i, j in zip(*iu) if rho[i, j] >= cut)
    return nx.community.louvain_communities(g, weight="weight", seed=0)

def sector_pairs_together(comms):             # share of same-sector pairs put in one community
    label = np.empty(N, int)
    for k, c in enumerate(comms):
        label[list(c)] = k
    t = same & (label[:, None] == label[None, :]) & ~np.eye(N, dtype=bool)
    return t.sum() / (same.sum() - N)

for days in (60, 250, 1000):
    got = [sector_pairs_together(communities(market(days, s))) for s in range(100)]
    print(f"{days:>4} days: median share of same-sector pairs together {np.median(got):.2f}")

def sharpe(r): return r.mean() / r.std() * np.sqrt(252) if r.std() else 0.0
def max_dd(r):
    c = np.cumsum(r) / 100                    # additive curve, enough for a comparison
    return (c - np.maximum.accumulate(c)).min()

def rule_returns(r, hold=60, look=300):
    out = []
    for t in range(look, len(r) - hold + 1, hold):
        past = r[t - look:t]
        picks = [max(c, key=lambda i: sharpe(past[:, i])) for c in communities(past)]
        out.append(r[t:t + hold, picks].mean(axis=1))
    return np.concatenate(out)

res = []
for seed in range(200):
    r = market(1200, seed)
    rule = rule_returns(r)
    res.append((sharpe(rule), max_dd(rule), sharpe(r[300:].mean(axis=1)), max_dd(r[300:].mean(axis=1)), seed))
res = np.array(res)
print("200 seeds, no edge anywhere. Annualised Sharpe of the community rule vs equal weight of all 30:")
for name, k in (("median", 50), ("90th pct", 90), ("best", 100)):
    print(f"  {name:<9} rule {np.percentile(res[:, 0], k):5.2f}   equal weight {np.percentile(res[:, 2], k):5.2f}")
print(f"median max drawdown: rule {np.median(res[:, 1]):.1%}, equal weight {np.median(res[:, 3]):.1%}")
print(f"seeds where the rule's Sharpe is above 0.5: {(res[:, 0] > 0.5).sum()} of 200")
