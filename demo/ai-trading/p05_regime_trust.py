# Post 05 (regime): decide whether to trust a 2-state fit.
# Run: uv run --with numpy python demo/ai-trading/p05_regime_trust.py
import numpy as np

rng = np.random.default_rng(5)
N = 1500

def sim_regimes(n):
    # Assumption: calm 0.7% a day, turbulent 2.0% a day, sticky switching.
    stay = {0: 0.98, 1: 0.95}
    s, out = 0, np.empty(n)
    for t in range(n):
        if rng.random() > stay[s]:
            s = 1 - s
        out[t] = rng.normal(0, [0.007, 0.020][s])
    return out

def sim_fat_tails(n, target_std):
    # Assumption: no regimes at all, just independent Student-t(3) days.
    x = rng.standard_t(3, n)
    return x / x.std() * target_std

def fit_hmm(r, iters=200):
    """Baum-Welch for a 2-state, zero-mean Gaussian HMM."""
    sig = np.array([r.std() * 0.6, r.std() * 1.6])
    A = np.array([[0.9, 0.1], [0.1, 0.9]])
    pi = np.array([0.5, 0.5])
    for _ in range(iters):
        B = np.exp(-0.5 * (r[:, None] / sig) ** 2) / sig
        a = np.zeros((len(r), 2)); c = np.zeros(len(r))
        a[0] = pi * B[0]; c[0] = a[0].sum(); a[0] /= c[0]
        for t in range(1, len(r)):
            a[t] = (a[t - 1] @ A) * B[t]; c[t] = a[t].sum(); a[t] /= c[t]
        b = np.ones((len(r), 2))
        for t in range(len(r) - 2, -1, -1):
            b[t] = A @ (B[t + 1] * b[t + 1]) / c[t + 1]
        g = a * b
        xi = a[:-1, :, None] * A[None] * (B[1:] * b[1:])[:, None, :] / c[1:, None, None]
        A = xi.sum(0) / xi.sum(0).sum(1, keepdims=True)
        sig = np.sqrt((g * r[:, None] ** 2).sum(0) / g.sum(0))
        pi = g[0]
    order = np.argsort(sig)  # state 0 = calm, state 1 = turbulent
    return sig[order], A[np.ix_(order, order)], pi[order]

def filtered_turbulent(r, sig, A, pi):
    """P(turbulent today | returns up to and including today)."""
    p, out = pi, np.empty(len(r))
    for t, x in enumerate(r):
        prior = p @ A if t else pi
        post = prior * np.exp(-0.5 * (x / sig) ** 2) / sig
        p = post / post.sum()
        out[t] = p[1]
    return out

def max_drawdown(daily):
    w = np.cumprod(1 + daily)
    return (w / np.maximum.accumulate(w) - 1).min()

def walk_forward(r):
    train, test = r[: N // 2], r[N // 2 :]
    sig, A, pi = fit_hmm(train)                    # fit on the past only
    p = filtered_turbulent(test, sig, A, pi)       # then freeze and filter
    hold = np.r_[1.0, p[:-1] <= 0.5]               # one-day lag: yesterday's p
    return sig, A, test, p, hold

def report(name, r):
    sig, A, test, p, hold = walk_forward(r)
    rule = test * hold
    days = 1 / (1 - np.diag(A))
    print(f"{name}: sigma calm/turb {sig[0]:.2%}/{sig[1]:.2%} | "
          f"stay {A[0,0]:.3f}/{A[1,1]:.3f} -> {days[0]:.0f}/{days[1]:.0f} days")
    print(f"   test: hold fall {max_drawdown(test):.1%}, rule fall {max_drawdown(rule):.1%}, "
          f"cash {1 - hold.mean():.0%}, flips {(np.diff((p > 0.5).astype(int)) != 0).sum()}")

regimes = sim_regimes(N)
report("A regimes  ", regimes)
report("B fat tails", sim_fat_tails(N, regimes.std()))

def rule_helps(r):
    _, _, test, _, hold = walk_forward(r)
    return max_drawdown(test * hold) > max_drawdown(test)

wins = sum(rule_helps(sim_regimes(N)) for _ in range(20))
print(f"A, 20 new seeds: rule's worst fall smaller than hold's in {wins} of 20")
