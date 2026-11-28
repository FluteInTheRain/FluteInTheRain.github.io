# Dictionary sentiment: a general word list vs a finance list vs finance + negation.
# Run: uv run --with numpy python demo/ai-trading/p17_sentiment_negation.py
# Word lists are small hand-made toys written for this post; labels are the author's reading.
import re

GENERAL_NEG = {"liability", "tax", "cost", "risk", "loss", "default", "layoffs", "delay", "crisis", "debt"}
FINANCE_NEG = {"loss", "default", "layoffs", "delay", "crisis", "impairment", "litigation", "downgrade"}
FINANCE_POS = {"profit", "beat", "growth", "upgrade", "record", "wins"}
NEGATORS = {"no", "not", "without", "never", "avoids", "avoid"}

def tokens(text):
    return re.findall(r"[a-z]+", text.lower())

def score(text, neg_words, negation=False, window=3):
    toks, s = tokens(text), 0
    for i, w in enumerate(toks):
        sign = -1 if w in neg_words else (1 if w in FINANCE_POS else 0)
        if sign and negation and any(t in NEGATORS for t in toks[max(0, i - window):i]):
            sign = -sign
        s += sign
    return s

# (headline, label by a human reader: +1 good news, -1 bad news, 0 neutral)
HEADLINES = [
    ("Bank settles tax liability, record profit expected", 1),
    ("Steelmaker cuts cost of debt, avoids default", 1),
    ("Retailer posts loss as store delay drags growth", -1),
    ("Airline faces litigation, downgrade follows", -1),
    ("Builder reports no layoffs and no delay on site", 1),
    ("Fund discloses debt covenant and tax schedule", 0),
]

def sign(x):
    return (x > 0) - (x < 0)

scorers = {
    "general list": lambda t: score(t, GENERAL_NEG),
    "finance list": lambda t: score(t, FINANCE_NEG),
    "finance + negation": lambda t: score(t, FINANCE_NEG, negation=True),
}
print(f"{'headline':50s} {'truth':>5s} " + " ".join(f"{k:>18s}" for k in scorers))
hits = {k: 0 for k in scorers}
for text, truth in HEADLINES:
    row = []
    for k, f in scorers.items():
        s = f(text)
        hits[k] += sign(s) == truth
        row.append(f"{s:+18d}")
    print(f"{text:50s} {truth:+5d} " + " ".join(row))
print("sign correct: " + ", ".join(f"{k} {v}/{len(HEADLINES)}" for k, v in hits.items()))
