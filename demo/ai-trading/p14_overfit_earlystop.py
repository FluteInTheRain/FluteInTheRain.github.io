# uv run --with numpy python demo/ai-trading/p14_overfit_earlystop.py
# Post 14 worked case: a tiny MLP with 513 weights meets 60 rows.
import numpy as np

def make(n, rng):
    x = rng.uniform(-1, 1, (n, 6))                   # x[:,0] carries signal, x[:,1:] is noise
    y = 0.5 * np.sin(2.5 * x[:, 0]) + rng.normal(0, 0.5, n)
    return x, y

class MLP:
    def __init__(self, h, rng):
        self.w1 = rng.normal(0, 0.5, (6, h)); self.b1 = np.zeros(h)
        self.w2 = rng.normal(0, 0.5, h);      self.b2 = 0.0
        self.p = [self.w1, self.b1, self.w2]
        self.m = [np.zeros_like(a) for a in self.p] + [0.0]
        self.v = [np.zeros_like(a) for a in self.p] + [0.0]
        self.t = 0
    def n_weights(self):
        return self.w1.size + self.b1.size + self.w2.size + 1
    def predict(self, x):
        return np.tanh(x @ self.w1 + self.b1) @ self.w2 + self.b2
    def step(self, x, y, lr=0.01):                    # one full-batch Adam step on squared error
        a = np.tanh(x @ self.w1 + self.b1); e = (a @ self.w2 + self.b2 - y) * 2 / len(y)
        da = np.outer(e, self.w2) * (1 - a ** 2)
        g = [x.T @ da, da.sum(0), a.T @ e, e.sum()]
        self.t += 1
        for i, gi in enumerate(g):
            self.m[i] = 0.9 * self.m[i] + 0.1 * gi
            self.v[i] = 0.999 * self.v[i] + 0.001 * gi ** 2
            upd = lr * (self.m[i] / (1 - 0.9 ** self.t)) / (np.sqrt(self.v[i] / (1 - 0.999 ** self.t)) + 1e-8)
            if i < 3: self.p[i] -= upd
            else: self.b2 -= upd

def mse(a, b): return float(np.mean((a - b) ** 2))

def run(n_rows, hidden, seed=14, epochs=3000):
    rng = np.random.default_rng(seed)
    xtr, ytr = make(n_rows, rng); xva, yva = make(n_rows // 5 + 20, rng); xte, yte = make(1000, rng)
    net = MLP(hidden, rng)
    best = (1e9, 0, None, 0.0)
    for ep in range(1, epochs + 1):
        net.step(xtr, ytr)
        v = mse(net.predict(xva), yva)
        if v < best[0]:
            best = (v, ep, [p.copy() for p in net.p], net.b2)
    last = mse(net.predict(xte), yte)
    train = mse(net.predict(xtr), ytr)
    net.w1, net.b1, net.w2 = best[2]; net.b2 = best[3]
    stop = mse(net.predict(xte), yte)
    print(f"{n_rows:4d} rows, {hidden:2d} units, {net.n_weights():3d} weights | "
          f"train {train:.4f} | unseen at epoch {epochs}: {last:.3f} | "
          f"early stop (epoch {best[1]}): {stop:.3f} | always 0: {mse(0, yte):.3f}")

run(60, 64)
run(600, 8)
