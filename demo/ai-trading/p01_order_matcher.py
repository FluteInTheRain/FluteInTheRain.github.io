# Trace one limit order through a HOSE-style book: price first, then arrival time.
# Run: uv run demo/ai-trading/p01_order_matcher.py   (standard library only, Python 3.10+)
# The book is an assumption ("Say a stock closed at 24,500"), not real market data.
from dataclasses import dataclass

TICK, LOT = 50, 100          # HOSE: 50 VND price step in this range, 100-share lots


@dataclass
class Order:
    who: str
    price: int
    qty: int


def match_buy(buy, asks):
    """Fill a buy limit against asks ordered by (price, arrival). Returns fills."""
    fills = []
    for ask in asks:
        if buy.qty == 0 or ask.price > buy.price:
            break                          # never pay above your own limit
        take = min(buy.qty, ask.qty)
        fills.append((ask.who, ask.price, take))
        buy.qty -= take
        ask.qty -= take
    asks[:] = [a for a in asks if a.qty > 0]
    return fills


# Say the book holds these resting orders, listed in arrival order.
bids = [Order("A", 24_500, 300), Order("B", 24_500, 200), Order("C", 24_450, 500)]
asks = [Order("X", 24_600, 150), Order("W", 24_550, 200),
        Order("Y", 24_600, 250), Order("Z", 24_650, 800)]
asks.sort(key=lambda o: o.price)          # stable: arrival order kept within a price

mine = Order("me", 24_600, 800)
assert mine.price % TICK == 0 and mine.qty % LOT == 0

fills = match_buy(mine, asks)
for who, px, q in fills:
    print(f"filled {q:>4} @ {px:,} against {who}")
filled = sum(q for _, _, q in fills)
vwap = sum(px * q for _, px, q in fills) / filled
print(f"filled {filled} of 800, average price {vwap:,.1f}")
print(f"left over {mine.qty} rests as a bid at {mine.price:,}")
print("best bid", max(mine.price, bids[0].price), "| best ask", asks[0].price)
