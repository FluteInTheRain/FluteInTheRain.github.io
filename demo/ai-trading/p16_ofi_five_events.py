# Post 16 (ai-trading-order-flow): OFI from a 5-event book, Cont-Kukanov-Stoikov rule.
# Run: uv run python demo/ai-trading/p16_ofi_five_events.py   (standard library only)
# The book is an assumed one; prices are in dong on a 50-dong step.

# Best quote after each event: (bid_price, bid_size, ask_price, ask_size)
book = [
    (40700,  800, 40800,  600),  # start
    (40700, 1200, 40800,  600),  # 1 limit buy +400 at the bid
    (40700, 1200, 40800,  200),  # 2 market buy takes 400 from the ask
    (40700,  500, 40800,  200),  # 3 700 shares cancelled at the bid
    (40700,  500, 40850,  900),  # 4 last 200 at 40,800 bought, ask steps up
    (40750,  300, 40850,  900),  # 5 new buyer improves the bid
]

def ofi_event(prev, cur):
    pb0, qb0, pa0, qa0 = prev
    pb1, qb1, pa1, qa1 = cur
    e = 0
    e += qb1 if pb1 >= pb0 else 0   # bid at same/higher price: its new size counts
    e -= qb0 if pb1 <= pb0 else 0   # bid at same/lower price: its old size leaves
    e -= qa1 if pa1 <= pa0 else 0   # ask at same/lower price: its new size is supply
    e += qa0 if pa1 >= pa0 else 0   # ask at same/higher price: its old size leaves
    return e

flows = [ofi_event(a, b) for a, b in zip(book, book[1:])]
mid = [(b[0] + b[2]) / 2 for b in book]
print("event OFI :", flows)
print("OFI total :", sum(flows))
print("mid       :", mid[0], "->", mid[-1], "change", mid[-1] - mid[0])
qi = [(b[1] - b[3]) / (b[1] + b[3]) for b in book]
print("queue imbalance start/end: %.2f / %.2f" % (qi[0], qi[-1]))
