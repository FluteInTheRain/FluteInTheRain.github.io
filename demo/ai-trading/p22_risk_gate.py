# Post 22 worked case: a risk gate between an agent and the broker.
# Run: uv run --python 3.13 python demo/ai-trading/p22_risk_gate.py
# Assumptions (all stated in the post): reference price 60,000 VND,
# HOSE band +-7%, lot 100 shares, an agent that repeats one buy order (fixed list, no randomness).

# --- gate (this part is quoted in the post) ---
LIMITS = dict(band=0.07, lot=100, max_order=50_000_000, max_pos=100_000_000, max_day_loss=10_000_000)

def gate(order, state, ref):
    """Return (ok, reason). Reject by default; every check is plain code."""
    qty, px = order["qty"], order["price"]
    if state["halted"]:
        return False, "halted"
    if state["day_pnl"] <= -LIMITS["max_day_loss"]:
        state["halted"] = True          # the stop: only a person clears it
        return False, "daily loss stop"
    if qty % LIMITS["lot"] != 0 or qty <= 0:
        return False, "lot size"
    if abs(px / ref - 1) > LIMITS["band"]:
        return False, "outside price band"
    if qty * px > LIMITS["max_order"]:
        return False, "order too large"
    if state["pos_value"] + qty * px > LIMITS["max_pos"]:
        return False, "position limit"
    return True, "ok"

# --- scenario ---
ref = 60_000
state = dict(halted=False, pos_value=0, day_pnl=0)
# The agent repeats a buy; a few of its orders are malformed.
qtys = [700, 150, 500, 2000, 500, 700, 300, 300, 300, 300]
orders = [dict(qty=q, price=ref) for q in qtys]
orders[2]["price"] = int(ref * 1.10)             # 10% above reference

passed = 0
for i, o in enumerate(orders):
    ok, why = gate(o, state, ref)
    if ok:
        state["pos_value"] += o["qty"] * o["price"]
        passed += 1
        state["day_pnl"] -= 4_000_000            # Say each fill loses 4M VND (price falls)
    print(f"{i:2d} qty={o['qty']:5d} px={o['price']:6d} -> {'PASS' if ok else 'REJECT'} ({why})")
print("sent:", passed, "position VND:", state["pos_value"], "day pnl VND:", state["day_pnl"])
