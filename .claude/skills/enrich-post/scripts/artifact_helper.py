#!/usr/bin/env python3
"""
Fetch authentic engineering artifacts for blog posts:
  - Hacker News practitioner discussions (hn-search)
  - Real open-source code snippets & permalinks from GitHub (github-snippet)
  - Clean webpage title/description/domain metadata for LinkCard (link-meta)

Dependencies: Python 3 standard library only.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import urllib.parse
import urllib.request
from html.parser import HTMLParser

USER_AGENT = "PortfolioBlogEnricher/1.0 (https://fluteintherain.github.io)"


def http_get_text(url: str, accept: str = "text/html,application/json;q=0.9,*/*;q=0.8") -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": accept,
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        return resp.read().decode(charset, errors="replace")


def clean_hn_html(raw: str) -> str:
    if not raw:
        return ""
    text = re.sub(r"<p>", "\n\n", raw, flags=re.IGNORECASE)
    text = re.sub(r"<pre><code>", "\n```\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</code></pre>", "\n```\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def cmd_hn_search(args: argparse.Namespace) -> None:
    params = urllib.parse.urlencode(
        {
            "query": args.query,
            "tags": args.tags,
            "hitsPerPage": str(args.limit),
        }
    )
    url = f"https://hn.algolia.com/api/v1/search?{params}"
    data = json.loads(http_get_text(url, accept="application/json"))

    results = []
    for hit in data.get("hits", []):
        oid = hit.get("objectID")
        if not oid:
            continue
        raw_text = hit.get("comment_text") or hit.get("story_text") or hit.get("title") or ""
        results.append(
            {
                "id": oid,
                "author": hit.get("author", ""),
                "storyTitle": hit.get("story_title") or hit.get("title") or "",
                "url": f"https://news.ycombinator.com/item?id={oid}",
                "createdAt": hit.get("created_at", ""),
                "points": hit.get("points"),
                "text": clean_hn_html(raw_text),
            }
        )

    print(json.dumps({"query": args.query, "tags": args.tags, "results": results}, indent=2, ensure_ascii=False))


def cmd_github_snippet(args: argparse.Namespace) -> None:
    repo = args.repo.strip("/")
    path = args.path.lstrip("/")
    ref = args.ref

    sha = ref
    try:
        commit_url = f"https://api.github.com/repos/{repo}/commits/{urllib.parse.quote(ref)}"
        commit_data = json.loads(http_get_text(commit_url, accept="application/vnd.github+json"))
        if isinstance(commit_data, dict) and commit_data.get("sha"):
            sha = commit_data["sha"]
    except Exception:
        # Fall back to provided ref if GitHub API is rate-limited
        sha = ref

    raw_url = f"https://raw.githubusercontent.com/{repo}/{urllib.parse.quote(sha)}/{path}"
    content = http_get_text(raw_url, accept="text/plain")
    all_lines = content.splitlines()

    start = max(1, args.start_line)
    end = min(len(all_lines), args.end_line)
    if start > end:
        raise ValueError(f"Invalid line range {start}..{end} for {path} ({len(all_lines)} lines)")

    snippet = "\n".join(all_lines[start - 1 : end])
    line_tag = f"L{start}-L{end}" if end != start else f"L{start}"
    permalink = f"https://github.com/{repo}/blob/{sha}/{path}#{line_tag}"

    print(
        json.dumps(
            {
                "repo": repo,
                "path": path,
                "ref": sha,
                "lines": line_tag,
                "url": permalink,
                "snippet": snippet,
            },
            indent=2,
            ensure_ascii=False,
        )
    )


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.title_parts: list[str] = []
        self.meta: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        t = tag.lower()
        if t == "title":
            self.in_title = True
        elif t == "meta":
            attr_map = {k.lower(): (v or "") for k, v in attrs}
            key = (attr_map.get("property") or attr_map.get("name") or "").lower().strip()
            val = attr_map.get("content", "").strip()
            if key and val and key not in self.meta:
                self.meta[key] = val

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)


def cmd_link_meta(args: argparse.Namespace) -> None:
    raw_html = http_get_text(args.url)
    parser = MetaParser()
    parser.feed(raw_html)

    page_title = html.unescape("".join(parser.title_parts)).strip()
    og_title = html.unescape(parser.meta.get("og:title") or parser.meta.get("twitter:title") or "").strip()
    desc = html.unescape(
        parser.meta.get("og:description")
        or parser.meta.get("description")
        or parser.meta.get("twitter:description")
        or ""
    ).strip()

    domain = urllib.parse.urlparse(args.url).hostname or args.url
    domain = re.sub(r"^www\.", "", domain)

    print(
        json.dumps(
            {
                "url": args.url,
                "domain": domain,
                "title": og_title or page_title,
                "pageTitle": page_title,
                "description": re.sub(r"\s+", " ", desc),
            },
            indent=2,
            ensure_ascii=False,
        )
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch authentic HN quotes, GitHub permalinks, and link metadata.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_hn = sub.add_parser("hn-search", help="Search Hacker News discussions via Algolia.")
    p_hn.add_argument("query", help="Search query")
    p_hn.add_argument("--tags", choices=["comment", "story"], default="comment")
    p_hn.add_argument("--limit", type=int, default=5)
    p_hn.set_defaults(func=cmd_hn_search)

    p_gh = sub.add_parser("github-snippet", help="Fetch exact lines and a commit permalink from GitHub.")
    p_gh.add_argument("repo", help="owner/repo")
    p_gh.add_argument("path", help="File path inside repo")
    p_gh.add_argument("--start-line", type=int, required=True)
    p_gh.add_argument("--end-line", type=int, required=True)
    p_gh.add_argument("--ref", default="HEAD", help="Branch, tag, or commit SHA (default: HEAD)")
    p_gh.set_defaults(func=cmd_github_snippet)

    p_link = sub.add_parser("link-meta", help="Extract title, description, and domain for LinkCard.")
    p_link.add_argument("url", help="Target URL")
    p_link.set_defaults(func=cmd_link_meta)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
