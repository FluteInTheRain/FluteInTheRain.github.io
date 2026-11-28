# Post 12 (Backtest): hunt the missing shift(1) in an inherited backtest.
# Run: uv run --with numpy --with pandas python demo/ai-trading/p12_missing_shift.py
# Data: 1,260 days (5 years) of seeded random daily returns, 1% daily sd, no edge.
import numpy as np
import pandas as pd

rng = np.random.default_rng(12)
ret = pd.Series(rng.normal(0.0, 0.01, 1260))
price = 100 * (1 + ret).cumprod()

def sharpe(r):
    return r.mean() / r.std() * np.sqrt(252)

# The inherited signal: long when the 20-day return is positive, else flat.
signal = (price > price.shift(20)).astype(float)

# Inherited code: the position decided at the close of day t earns the return of day t.
inherited = signal * ret
# Fixed: the decision at the close of day t earns the return of day t+1.
fixed = signal.shift(1) * ret

# Cost check: 0.1% per side, charged on every change of position.
cost = 0.001 * signal.shift(1).diff().abs().fillna(0)

print(f"inherited Sharpe:       {sharpe(inherited.dropna()):.2f}")
print(f"with shift(1):          {sharpe(fixed.dropna()):.2f}")
print(f"shift(1) and 0.1% fees: {sharpe((fixed - cost).dropna()):.2f}")
print(f"position changes:       {int(signal.diff().abs().sum())}")

# Same check on 1,000 fresh noise series: the average Sharpe of the fixed version.
fixed_sharpes = []
for seed in range(1000):
    r = pd.Series(np.random.default_rng(1000 + seed).normal(0.0, 0.01, 1260))
    p = 100 * (1 + r).cumprod()
    s = (p > p.shift(20)).astype(float)
    fixed_sharpes.append(sharpe((s.shift(1) * r).dropna()))
print(f"mean Sharpe of the fixed version over 1,000 noise draws: {np.mean(fixed_sharpes):.2f}")
