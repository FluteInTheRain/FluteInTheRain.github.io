# Where to put one check in a six-step research agent.
# Run: uv run --with numpy python demo/ai-trading/p21_where_to_check.py
# Assumptions (all stated in the post, none measured): per-step success rates below;
# a check catches 80% of wrong steps, never flags a right one, and allows one retry.
import numpy as np

steps = [
    ("search filings",      0.97),
    ("pick the right page", 0.90),
    ("extract the number",  0.93),
    ("compute the ratio",   0.995),  # done by a tool, not by the model
    ("compare with last year", 0.92),
    ("draft the summary",   0.96),
]
CATCH = 0.80

def with_check(s, catch=CATCH):
    # first try right, or wrong but caught and the retry is right
    return s + (1 - s) * catch * s

base = np.prod([s for _, s in steps])
print(f"no check: {base:.3f}")
for i, (name, s) in enumerate(steps):
    p = np.prod([with_check(t) if j == i else t for j, (_, t) in enumerate(steps)])
    print(f"check on '{name}': {p:.3f}  (+{p - base:.3f})")
print(f"check on all six: {np.prod([with_check(s) for _, s in steps]):.3f}")

# Monte Carlo cross-check of the best single placement
rng = np.random.default_rng(21)
n = 200_000
ok = np.ones(n, bool)
for j, (_, s) in enumerate(steps):
    good = rng.random(n) < s
    if j == 1:
        retry = (rng.random(n) < CATCH) & (rng.random(n) < s)
        good = good | retry
    ok &= good
print(f"simulated, check on 'pick the right page': {ok.mean():.3f}")
