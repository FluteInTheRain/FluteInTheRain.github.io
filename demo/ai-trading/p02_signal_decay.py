# Post 02 (Signals): a thin momentum signal measured by holding week.
# Everything is simulated from the assumptions stated in the post; no network, no data files.
# Run: uv run --with numpy python demo/ai-trading/p02_signal_decay.py
import numpy as np

rng = np.random.default_rng(7)
N, T = 60, 520                      # 60 stocks, 10 years of weekly returns
# Assumed true link between this week's move and the move h weeks later (in volatility units)
b = np.array([0.006, 0.016, 0.019, 0.020, 0.017, 0.013, 0.007, 0.001, -0.006, -0.011, -0.014, -0.016])

z = rng.standard_normal((N, T + 12))
for t in range(12, T + 12):
    for h in range(1, 13):
        z[:, t] += b[h - 1] * z[:, t - h]
sigma = np.exp(rng.normal(np.log(0.04), 0.5, size=(N, 1)))   # weekly vol from ~2% to ~9%
ret = (sigma * z)[:, 12:]           # raw weekly returns, shape (N, T)

# Volatility-normalise: divide each return by the stock's own trailing volatility
vol = np.full((N, T), np.nan)
for t in range(27, T):
    vol[:, t] = ret[:, :t].std(axis=1)
norm = ret / vol

print("week   corr    t-stat   share of variance")
for h in range(1, 13):
    x, y = norm[:, :-h], norm[:, h:]
    ok = ~np.isnan(x) & ~np.isnan(y)
    r = np.corrcoef(x[ok], y[ok])[0, 1]
    t_stat = r * np.sqrt((ok.sum() - 2) / (1 - r * r))
    print(f"{h:>4}  {r:+.4f}  {t_stat:+6.1f}   {r * r:7.4%}")
