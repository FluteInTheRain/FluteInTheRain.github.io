# Sizing a gross-position cap for a runaway order loop.
# Run: python3 demo/ai-trading/p13_kill_switch.py   (standard library only, no extra packages)
# Assumptions (stated in the post, not from a real account):
#   capital 2,000 million VND; a bug sends one 5 million VND buy every 0.5 s;
#   the worst move we plan for is the HOSE daily limit, -7% from the reference price.
CAPITAL = 2_000e6   # VND
ORDER = 5e6         # VND per runaway order
DT = 0.5            # seconds between orders
LIMIT_MOVE = 0.07   # HOSE +/-7% band

def gross_at_stop(cap, check_every, stop_lag):
    """Orders go out every DT. A check runs every `check_every` seconds; the first one that
    sees gross >= cap trips the switch, which takes effect `stop_lag` seconds later."""
    t, gross, trip_at = 0.0, 0.0, None
    while trip_at is None or t < trip_at:
        gross += ORDER
        t += DT
        if trip_at is None and t % check_every == 0 and gross >= cap:
            trip_at = t + stop_lag
    return gross

budget = 0.01 * CAPITAL                       # we accept losing 1% of capital
print(f"loss budget {budget/1e6:.0f}m  ->  largest gross that survives a "
      f"{LIMIT_MOVE:.0%} drop: {budget/LIMIT_MOVE/1e6:.0f}m\n")
print(f"{'cap (m)':>8} {'check every':>12} {'lag':>5} {'gross at stop (m)':>18} {'loss at -7% (m)':>16}")
for cap in (100e6, 200e6, 500e6):
    for check_every, lag in ((0.5, 1.0), (10.0, 5.0), (60.0, 30.0)):
        g = gross_at_stop(cap, check_every, lag)
        print(f"{cap/1e6:>8.0f} {check_every:>11.1f}s {lag:>4.0f}s {g/1e6:>18.0f} {g*LIMIT_MOVE/1e6:>16.1f}")
