# Post 19 (reinforcement learning), worked case: does the agent learn an edge, or only its sample?
# Run: uv run --with numpy python demo/ai-trading/p19_edge_or_noise.py
import numpy as np

COST = 0.0005   # 0.05% per unit of position change
N_DAYS = 500
N_FRESH = 100
POS = (-1, 0, 1)  # short, flat, long

def make_path(seed, rho):
    # daily returns, sd about 1%; rho is day-to-day persistence (0 = pure noise)
    eps = np.random.default_rng(seed).normal(0, 0.01, N_DAYS + 1)
    r = np.zeros(N_DAYS + 1)
    for t in range(1, N_DAYS + 1):
        r[t] = rho * r[t - 1] + eps[t]
    return r[1:]

def state(r, t, p):
    # signs of the last two returns (4 patterns) x current position index (3)
    return (int(r[t - 1] > 0) * 2 + int(r[t - 2] > 0)) * 3 + p

def step_reward(r, t, p, a):
    return POS[a] * r[t] - COST * abs(POS[a] - POS[p])

def train(r, seed, passes=300, alpha=0.02, gamma=0.5, eps=0.3):
    rng, q = np.random.default_rng(seed), np.zeros((12, 3))
    for _ in range(passes):
        p = 1
        for t in range(2, len(r) - 1):
            s = state(r, t, p)
            a = int(rng.integers(3)) if rng.random() < eps else int(q[s].argmax())
            q[s, a] += alpha * (step_reward(r, t, p, a) + gamma * q[state(r, t + 1, a)].max() - q[s, a])
            p = a
    return q

def run(q, r):
    p, total, trades = 1, 0.0, 0
    for t in range(2, len(r)):
        a = int(q[state(r, t, p)].argmax())
        total += step_reward(r, t, p, a)
        trades += a != p
        p = a
    return total, trades

for rho in (0.0, 0.3):
    q = train(make_path(7, rho), seed=7)
    gain, trades = run(q, make_path(7, rho))
    fresh = [run(q, make_path(1000 + i, rho))[0] for i in range(N_FRESH)]
    print(f"rho={rho}: train {gain*100:+.1f}% ({trades} trades) | fresh mean {np.mean(fresh)*100:+.1f}%, "
          f"profitable {sum(f > 0 for f in fresh)}/{N_FRESH}")
