#!/usr/bin/env python3
"""
Real-world image & screenshot helper for blog posts.

Run via:
  uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py <subcommand> [options]

Subcommands:
  extract <url>                      Extract meaningful figures/images from a web article
  search "<query>"                   Search Wikimedia Commons or web images
  download <image_url> --out <path>  Download an image (with browser fallback & SVG->PNG support)
  screenshot <url> --out <path>      Capture a live screenshot of a webpage or CSS selector
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/130.0.0.0 Safari/537.36"
)


def cmd_extract(args: argparse.Namespace) -> None:
    url = args.url
    min_w = args.min_width
    min_h = args.min_height

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=USER_AGENT,
            viewport={"width": 1280, "height": 900},
        )
        page = context.new_page()
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(1500)
            # Scroll down progressively to trigger lazy-loaded images
            page.evaluate(
                """async () => {
                    const step = 600;
                    const maxScroll = Math.min(document.body.scrollHeight, 12000);
                    for (let y = 0; y < maxScroll; y += step) {
                        window.scrollTo(0, y);
                        await new Promise(r => setTimeout(r, 120));
                    }
                    window.scrollTo(0, 0);
                }"""
            )
            page.wait_for_timeout(800)

            data = page.evaluate(
                """({ minW, minH }) => {
                    const root = document.querySelector('article, main, [role="main"]') || document.body;
                    const imgs = Array.from(root.querySelectorAll('img'));
                    const seen = new Set();
                    const results = [];

                    const ignorePatterns = /avatar|profile|logo|icon|badge|sponsor|author|pixel|tracker|emoji|gravatar|headshot/i;

                    for (const img of imgs) {
                        const rawSrc = img.currentSrc || img.src || img.getAttribute('data-src') || '';
                        if (!rawSrc || rawSrc.startsWith('data:')) continue;
                        let absSrc = rawSrc;
                        try {
                            absSrc = new URL(rawSrc, document.baseURI).href;
                        } catch {}
                        if (seen.has(absSrc)) continue;

                        const rect = img.getBoundingClientRect();
                        const w = Math.max(img.naturalWidth || 0, Math.round(rect.width) || 0);
                        const h = Math.max(img.naturalHeight || 0, Math.round(rect.height) || 0);
                        if (w < minW || h < minH) continue;

                        const alt = (img.alt || '').trim();
                        const cls = (img.className || '') + ' ' + (img.id || '');
                        if (ignorePatterns.test(absSrc) || ignorePatterns.test(cls) || /^photo of /i.test(alt)) continue;

                        const fig = img.closest('figure');
                        const caption = fig && fig.querySelector('figcaption')
                            ? fig.querySelector('figcaption').innerText.trim()
                            : '';

                        // Nearest preceding heading for context
                        let heading = '';
                        let el = img;
                        while (el && el !== root) {
                            let prev = el.previousElementSibling;
                            while (prev) {
                                if (/^H[1-4]$/.test(prev.tagName)) {
                                    heading = prev.innerText.trim();
                                    break;
                                }
                                const nestedH = prev.querySelector && prev.querySelector('h1, h2, h3, h4');
                                if (nestedH) {
                                    heading = nestedH.innerText.trim();
                                    break;
                                }
                                prev = prev.previousElementSibling;
                            }
                            if (heading) break;
                            el = el.parentElement;
                        }

                        seen.add(absSrc);
                        results.push({
                            index: results.length + 1,
                            src: absSrc,
                            alt,
                            caption,
                            sectionHeading: heading,
                            width: w,
                            height: h,
                        });
                    }
                    return {
                        pageTitle: document.title.trim(),
                        pageUrl: location.href,
                        images: results,
                    };
                }""",
                {"minW": min_w, "minH": min_h},
            )
            print(json.dumps(data, indent=2, ensure_ascii=False))
        finally:
            browser.close()


def search_wikimedia(query: str, limit: int) -> list[dict]:
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap|drawing {query}",
        "gsrnamespace": "6",  # File namespace
        "gsrlimit": str(min(limit * 2, 25)),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime",
        "iiurlwidth": "1200",
        "format": "json",
    }
    api_url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(
        api_url,
        headers={"User-Agent": "PortfolioBlogEnricher/1.0 (https://fluteintherain.github.io)"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    pages = payload.get("query", {}).get("pages", {})
    results = []
    for page in pages.values():
        iinfo = (page.get("imageinfo") or [{}])[0]
        mime = iinfo.get("mime", "")
        if not any(t in mime for t in ("png", "jpeg", "webp", "svg")):
            continue
        ext = iinfo.get("extmetadata", {})
        clean = lambda k: re.sub(r"<[^>]+>", "", ext.get(k, {}).get("value", "")).strip()
        img_url = iinfo.get("thumburl") or iinfo.get("url")
        if not img_url:
            continue
        results.append(
            {
                "title": page.get("title", "").replace("File:", ""),
                "imageUrl": img_url,
                "originalUrl": iinfo.get("url"),
                "pageUrl": iinfo.get("descriptionurl"),
                "description": clean("ImageDescription")[:240],
                "author": clean("Artist")[:120],
                "license": clean("LicenseShortName"),
                "width": iinfo.get("thumbwidth") or iinfo.get("width"),
                "height": iinfo.get("thumbheight") or iinfo.get("height"),
                "sourceTitle": "Wikimedia Commons",
            }
        )
        if len(results) >= limit:
            break
    return results


def search_web_images(query: str, limit: int) -> list[dict]:
    search_url = "https://www.bing.com/images/search?q=" + urllib.parse.quote(query)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=USER_AGENT,
            viewport={"width": 1280, "height": 900},
        )
        page = context.new_page()
        try:
            page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
            page.wait_for_timeout(1500)
            raw_items = page.evaluate(
                """(limit) => {
                    return Array.from(document.querySelectorAll('a.iusc')).slice(0, limit * 2).map(a => {
                        try {
                            const m = JSON.parse(a.getAttribute('m') || '{}');
                            const clean = (s) => (s || '').replace(/[\\uE000\\uE001]/g, '').trim();
                            let domain = '';
                            try { domain = new URL(m.purl).hostname.replace(/^www\\./, ''); } catch {}
                            return {
                                title: clean(m.t || m.desc),
                                imageUrl: m.murl || '',
                                thumbnailUrl: m.turl || '',
                                pageUrl: m.purl || '',
                                sourceTitle: clean(m.t) ? `${clean(m.t)} (${domain})` : domain,
                            };
                        } catch {
                            return null;
                        }
                    }).filter(x => x && x.imageUrl && x.pageUrl);
                }""",
                limit,
            )
            return raw_items[:limit]
        finally:
            browser.close()


def cmd_search(args: argparse.Namespace) -> None:
    if args.source == "wikimedia":
        results = search_wikimedia(args.query, args.limit)
    else:
        results = search_web_images(args.query, args.limit)
        if not results:
            results = search_wikimedia(args.query, args.limit)
    print(json.dumps({"query": args.query, "source": args.source, "results": results}, indent=2, ensure_ascii=False))


def cmd_download(args: argparse.Namespace) -> None:
    image_url = args.image_url
    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    headers = {"User-Agent": USER_AGENT, "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"}
    if args.referer:
        headers["Referer"] = args.referer

    raw_bytes = None
    content_type = ""
    try:
        req = urllib.request.Request(image_url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw_bytes = resp.read()
            content_type = resp.headers.get("Content-Type", "").lower()
    except Exception:
        # Fallback to Playwright browser request when blocked by Cloudflare / anti-hotlink
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(user_agent=USER_AGENT)
            page = context.new_page()
            try:
                if args.referer:
                    try:
                        page.goto(args.referer, wait_until="domcontentloaded", timeout=15000)
                    except Exception:
                        pass
                resp = page.request.get(image_url, timeout=20000)
                if not resp.ok:
                    raise RuntimeError(f"Failed to download {image_url}: HTTP {resp.status}")
                raw_bytes = resp.body()
                content_type = resp.headers.get("content-type", "").lower()
            finally:
                browser.close()

    is_svg = "svg" in content_type or image_url.lower().split("?")[0].endswith(".svg") or (
        raw_bytes and raw_bytes.lstrip()[:100].startswith((b"<svg", b"<?xml"))
    )

    if is_svg and out_path.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg"):
        # Render SVG crisply via Playwright into the target raster format
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1200, "height": 800}, device_scale_factor=2)
            svg_text = raw_bytes.decode("utf-8", errors="replace")
            html = f"""<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff;display:inline-block;">{svg_text}</body></html>"""
            page.set_content(html, wait_until="networkidle")
            body_el = page.locator("body")
            body_el.screenshot(path=str(out_path))
            browser.close()
    else:
        tmp_path = out_path.with_suffix(out_path.suffix + ".tmp")
        tmp_path.write_bytes(raw_bytes)
        # Convert or normalize via ffmpeg if extension differs from actual encoding
        if shutil_which("ffmpeg") and out_path.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg"):
            res = subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-v",
                    "error",
                    "-i",
                    str(tmp_path),
                    "-vf",
                    "scale='min(1600,iw)':-1",
                    str(out_path),
                ],
                capture_output=True,
                text=True,
            )
            if res.returncode == 0 and out_path.exists():
                tmp_path.unlink(missing_ok=True)
            else:
                tmp_path.replace(out_path)
        else:
            tmp_path.replace(out_path)

    print(
        json.dumps(
            {
                "path": str(out_path),
                "sizeBytes": out_path.stat().st_size,
                "sourceUrl": image_url,
            },
            indent=2,
        )
    )


def shutil_which(cmd: str) -> str | None:
    for p in os.environ.get("PATH", "").split(os.pathsep):
        cand = Path(p) / cmd
        if cand.is_file() and os.access(cand, os.X_OK):
            return str(cand)
    return None


def cmd_screenshot(args: argparse.Namespace) -> None:
    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=USER_AGENT,
            viewport={"width": args.width, "height": args.height},
            device_scale_factor=2,
            color_scheme=args.theme,
        )
        page = context.new_page()
        try:
            page.goto(args.url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(1500)
            # Hide common cookie / newsletter overlays
            extra_css = """
                [id*="cookie" i], [class*="cookie" i],
                [id*="consent" i], [class*="consent" i],
                [id*="gdpr" i], [class*="gdpr" i],
                [aria-label*="cookie" i] {
                    display: none !important;
                }
            """
            if args.selector and "svg" in args.selector.lower():
                extra_css += """
                svg {
                    padding: 18px;
                    background: #ffffff;
                    overflow: visible !important;
                }
                """
            page.add_style_tag(content=extra_css)
            if args.selector:
                locator = page.locator(args.selector).first
                locator.scroll_into_view_if_needed(timeout=10000)
                page.wait_for_timeout(400)
                locator.screenshot(path=str(out_path))
            else:
                page.screenshot(path=str(out_path), full_page=args.full_page)

            print(
                json.dumps(
                    {
                        "path": str(out_path),
                        "sizeBytes": out_path.stat().st_size,
                        "pageTitle": page.title().strip(),
                        "pageUrl": page.url,
                        "selector": args.selector,
                    },
                    indent=2,
                    ensure_ascii=False,
                )
            )
        finally:
            browser.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch or screenshot real-world images for blog posts.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_ext = sub.add_parser("extract", help="Extract candidate figures/images from an article URL.")
    p_ext.add_argument("url", help="Article or documentation URL")
    p_ext.add_argument("--min-width", type=int, default=280)
    p_ext.add_argument("--min-height", type=int, default=140)
    p_ext.set_defaults(func=cmd_extract)

    p_search = sub.add_parser("search", help="Search Wikimedia Commons or web images.")
    p_search.add_argument("query", help="Search keywords")
    p_search.add_argument("--source", choices=["web", "wikimedia"], default="web")
    p_search.add_argument("--limit", type=int, default=8)
    p_search.set_defaults(func=cmd_search)

    p_dl = sub.add_parser("download", help="Download an image to disk (with SVG/Playwright fallback).")
    p_dl.add_argument("image_url", help="Direct image URL")
    p_dl.add_argument("--out", required=True, help="Output file path (.png, .webp, .jpg)")
    p_dl.add_argument("--referer", help="Optional referer page URL")
    p_dl.set_defaults(func=cmd_download)

    p_shot = sub.add_parser("screenshot", help="Take a high-DPI screenshot of a webpage or CSS selector.")
    p_shot.add_argument("url", help="Target webpage URL")
    p_shot.add_argument("--out", required=True, help="Output PNG path")
    p_shot.add_argument("--selector", help="Optional CSS selector to screenshot a specific element")
    p_shot.add_argument("--width", type=int, default=1280)
    p_shot.add_argument("--height", type=int, default=800)
    p_shot.add_argument("--theme", choices=["light", "dark"], default="light")
    p_shot.add_argument("--full-page", action="store_true")
    p_shot.set_defaults(func=cmd_screenshot)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
