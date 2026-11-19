#!/usr/bin/env python3
"""How visual is a bilingual blog post? Measures the English text only (VI mirrors it).

    python3 scripts/figures/visual-audit.py src/content/blog/<slug>.mdx

Prints words, visuals, words per visual, the longest run of prose paragraphs with no visual,
and the sections where that run exceeds 5 paragraphs or that have 3+ paragraphs and no visual.
Bullet lists, numbered lists, quotes and <Concepts>/<Callout> blocks are not counted as prose,
so a glossary or a list of cases does not show up as a "wall of text".

Targets used for the DDIA series: about 1 visual per 150-200 words, no run over 5 paragraphs,
and no section without a picture.
"""
import re
import sys

VISUAL = re.compile(r'^\s*<(?!/|En\b|Vi\b|Concepts\b|Callout\b|details\b|summary\b|p\b|br\b)[A-Z][A-Za-z]*')
SKIP_BLOCK = re.compile(r'<(Concepts|Callout)\b.*?</\1>', re.S)
LIST_OR_QUOTE = re.compile(r'^\s*([-*>]|\d+\.)\s')


def audit(path):
    text = open(path, encoding='utf-8').read()
    body = text.split('---', 2)[2]
    en = re.sub(r'<Vi>.*?</Vi>', '', body, flags=re.S)
    en = SKIP_BLOCK.sub('<Callout />', en)
    visuals = run = longest = 0
    in_code = prev_table = False
    section = '(intro)'
    sections, long_runs = {}, set()
    for line in en.split('\n'):
        if line.startswith('```'):
            in_code = not in_code
            if in_code:
                visuals += 1
                run = 0
                sections.setdefault(section, [0, 0])[1] += 1
            continue
        if in_code:
            continue
        heading = re.match(r'^#{2,3} (.*)', line)
        if heading:
            section = heading.group(1).strip()
            sections.setdefault(section, [0, 0])
            run = 0
            continue
        is_table = line.strip().startswith('|')
        if VISUAL.match(line) or (is_table and not prev_table):
            visuals += 1
            run = 0
            sections.setdefault(section, [0, 0])[1] += 1
        prev_table = is_table
        if is_table or VISUAL.match(line):
            continue
        if len(line.split()) > 12 and not LIST_OR_QUOTE.match(line) and not line.lstrip().startswith(('<', 'import')):
            run += 1
            longest = max(longest, run)
            sections.setdefault(section, [0, 0])[0] += 1
            if run > 5:
                long_runs.add(section)
    words = len(re.sub(r'<[^>]+>', '', en).split())
    bare = [s for s, (paras, vis) in sections.items()
            if paras >= 3 and vis == 0 and not re.search(r'Review|takeaway|References', s)]
    print(f'words={words} visuals={visuals} words/visual={words // max(visuals, 1)} longestRun={longest}')
    if long_runs:
        print('  runs over 5 paragraphs:', ' | '.join(sorted(long_runs)))
    if bare:
        print('  sections with no visual:', ' | '.join(bare))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    audit(sys.argv[1])
