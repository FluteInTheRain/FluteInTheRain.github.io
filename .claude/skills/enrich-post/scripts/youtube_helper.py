#!/usr/bin/env python3
"""
YouTube search, timestamped transcript reader, and short clip cutter for blog posts.

Dependencies: Python 3 stdlib, yt-dlp, ffmpeg.

Subcommands:
  search "<query>" [--limit 5]
  transcript <video_id_or_url> [--lang en,vi] [--query "<keyword>"]
  clip <video_id_or_url> --start <sec|MM:SS> --end <sec|MM:SS> --out <path.mp4>
"""

from __future__ import annotations

import argparse
import glob
import json
import re
import subprocess
import sys
import tempfile
import urllib.parse
from pathlib import Path


def extract_video_id(value: str) -> str:
    value = value.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", value):
        return value
    parsed = urllib.parse.urlparse(value)
    if parsed.hostname in ("youtu.be", "www.youtu.be"):
        vid = parsed.path.lstrip("/").split("/")[0]
        if vid:
            return vid
    qs = urllib.parse.parse_qs(parsed.query)
    if "v" in qs and qs["v"]:
        return qs["v"][0]
    m = re.search(r"/(?:embed|shorts|live)/([A-Za-z0-9_-]{11})", parsed.path)
    if m:
        return m.group(1)
    raise ValueError(f"Could not extract YouTube video ID from: {value}")


def normalize_url(video_id_or_url: str) -> tuple[str, str]:
    vid = extract_video_id(video_id_or_url)
    return vid, f"https://www.youtube.com/watch?v={vid}"


def parse_timestamp(val: str) -> int:
    val = str(val).strip()
    if re.fullmatch(r"\d+(\.\d+)?", val):
        return int(float(val))
    parts = val.split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(float(parts[1]))
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(float(parts[2]))
    raise ValueError(f"Invalid timestamp format (use seconds or MM:SS): {val}")


def fmt_time(sec: int) -> str:
    m, s = divmod(max(0, int(sec)), 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def run_cmd(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True)


def cmd_search(args: argparse.Namespace) -> None:
    proc = run_cmd(
        [
            "yt-dlp",
            f"ytsearch{args.limit}:{args.query}",
            "--dump-json",
            "--flat-playlist",
            "--no-warnings",
        ]
    )
    if proc.returncode != 0 and not proc.stdout.strip():
        print(json.dumps({"error": proc.stderr.strip() or "yt-dlp search failed"}))
        sys.exit(1)

    results = []
    for line in proc.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        vid = item.get("id")
        if not vid:
            continue
        results.append(
            {
                "id": vid,
                "title": item.get("title", ""),
                "url": item.get("webpage_url") or item.get("url") or f"https://www.youtube.com/watch?v={vid}",
                "channel": item.get("channel") or item.get("uploader") or "",
                "duration": item.get("duration"),
                "viewCount": item.get("view_count"),
            }
        )

    print(json.dumps({"query": args.query, "results": results[: args.limit]}, indent=2, ensure_ascii=False))


def parse_json3_subtitles(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    raw_lines: list[tuple[float, str]] = []
    for ev in data.get("events", []):
        segs = ev.get("segs")
        if not segs:
            continue
        text = "".join(s.get("utf8", "") for s in segs)
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            continue
        start_sec = (ev.get("tStartMs") or 0) / 1000.0
        raw_lines.append((start_sec, text))
    return coalesce_lines(raw_lines)


def parse_vtt_subtitles(path: Path) -> list[dict]:
    content = path.read_text(encoding="utf-8")
    raw_lines: list[tuple[float, str]] = []
    ts_re = re.compile(r"(\d{1,2}:)?(\d{2}):(\d{2})[.,](\d{3})\s*-->")
    cur_start: float | None = None
    buf: list[str] = []

    def flush():
        nonlocal cur_start, buf
        if cur_start is not None and buf:
            text = re.sub(r"<[^>]+>", "", " ".join(buf))
            text = re.sub(r"\s+", " ", text).strip()
            if text and (not raw_lines or raw_lines[-1][1] != text):
                raw_lines.append((cur_start, text))
        cur_start = None
        buf = []

    for line in content.splitlines():
        m = ts_re.search(line)
        if m:
            flush()
            h = int(m.group(1)[:-1]) if m.group(1) else 0
            cur_start = h * 3600 + int(m.group(2)) * 60 + int(m.group(3)) + int(m.group(4)) / 1000.0
        elif not line.strip():
            flush()
        elif cur_start is not None and not line.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")):
            buf.append(line.strip())
    flush()
    return coalesce_lines(raw_lines)


def coalesce_lines(raw_lines: list[tuple[float, str]], window_sec: float = 8.0) -> list[dict]:
    """Group short caption fragments into ~5-10s readable segments."""
    segments: list[dict] = []
    group_start: float | None = None
    group_texts: list[str] = []

    for start, text in raw_lines:
        if group_start is None:
            group_start = start
            group_texts = [text]
            continue

        # Avoid duplicate consecutive auto-caption lines
        if group_texts and text == group_texts[-1]:
            continue

        if (start - group_start) >= window_sec or (
            group_texts and group_texts[-1].endswith((".", "?", "!")) and (start - group_start) >= 4.0
        ):
            segments.append(
                {
                    "start": int(group_start),
                    "time": fmt_time(int(group_start)),
                    "text": " ".join(group_texts),
                }
            )
            group_start = start
            group_texts = [text]
        else:
            group_texts.append(text)

    if group_start is not None and group_texts:
        segments.append(
            {
                "start": int(group_start),
                "time": fmt_time(int(group_start)),
                "text": " ".join(group_texts),
            }
        )
    return segments


def cmd_transcript(args: argparse.Namespace) -> None:
    vid, url = normalize_url(args.video)

    meta_proc = run_cmd(["yt-dlp", "--dump-single-json", "--skip-download", "--no-warnings", url])
    if meta_proc.returncode != 0:
        print(json.dumps({"error": meta_proc.stderr.strip() or "Failed to fetch video metadata"}))
        sys.exit(1)

    meta = json.loads(meta_proc.stdout)
    chapters = [
        {
            "start": int(ch.get("start_time", 0)),
            "end": int(ch.get("end_time", 0)),
            "time": fmt_time(int(ch.get("start_time", 0))),
            "title": ch.get("title", ""),
        }
        for ch in (meta.get("chapters") or [])
    ]

    segments: list[dict] = []
    with tempfile.TemporaryDirectory() as tmpdir:
        out_tpl = str(Path(tmpdir) / "sub")
        sub_proc = run_cmd(
            [
                "yt-dlp",
                "--write-sub",
                "--write-auto-sub",
                "--sub-lang",
                args.lang,
                "--sub-format",
                "json3/vtt",
                "--skip-download",
                "-o",
                out_tpl,
                "--no-warnings",
                url,
            ]
        )
        json3_files = sorted(glob.glob(f"{tmpdir}/*.json3"))
        vtt_files = sorted(glob.glob(f"{tmpdir}/*.vtt"))
        if json3_files:
            segments = parse_json3_subtitles(Path(json3_files[0]))
        elif vtt_files:
            segments = parse_vtt_subtitles(Path(vtt_files[0]))
        elif sub_proc.returncode != 0:
            # Return metadata & chapters even if subtitles are disabled on the video
            segments = []

    if args.query and segments:
        words = [w.lower() for w in re.split(r"\s+", args.query.strip()) if w]
        matched_indices: set[int] = set()
        for idx, seg in enumerate(segments):
            low = seg["text"].lower()
            if args.query.lower() in low or any(w in low for w in words):
                for ctx in range(max(0, idx - 1), min(len(segments), idx + 2)):
                    matched_indices.add(ctx)
        segments = [segments[i] for i in sorted(matched_indices)]

    payload = {
        "id": vid,
        "title": meta.get("title", ""),
        "channel": meta.get("channel") or meta.get("uploader") or "",
        "duration": meta.get("duration"),
        "url": url,
        "chapters": chapters,
        "segmentCount": len(segments),
        "segments": segments[:120],
    }
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def cmd_clip(args: argparse.Namespace) -> None:
    vid, url = normalize_url(args.video)
    start_sec = parse_timestamp(args.start)
    end_sec = parse_timestamp(args.end)
    duration = end_sec - start_sec

    if duration <= 0:
        raise ValueError(f"--end ({end_sec}s) must be greater than --start ({start_sec}s)")
    if duration > 25 and not args.force:
        raise ValueError(
            f"Clip duration is {duration}s (> 25s). Keep self-hosted clips <= 25s (or pass --force), "
            "and use <YouTube start={...} end={...} /> for longer segments."
        )

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    poster_path = out_path.with_name(f"{out_path.stem}-poster.jpg")

    with tempfile.TemporaryDirectory() as tmpdir:
        raw_tpl = str(Path(tmpdir) / "raw.%(ext)s")
        dl_proc = run_cmd(
            [
                "yt-dlp",
                "--download-sections",
                f"*{start_sec}-{end_sec}",
                "--force-keyframes-at-cuts",
                "-f",
                "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
                "-o",
                raw_tpl,
                "--no-warnings",
                url,
            ]
        )
        raw_files = sorted(glob.glob(f"{tmpdir}/raw.*"))
        if dl_proc.returncode != 0 or not raw_files:
            raise RuntimeError(f"yt-dlp clip download failed: {dl_proc.stderr.strip()}")

        raw_file = raw_files[0]
        ff_proc = run_cmd(
            [
                "ffmpeg",
                "-y",
                "-v",
                "error",
                "-i",
                raw_file,
                "-an",
                "-vcodec",
                "libx264",
                "-crf",
                "26",
                "-preset",
                "fast",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                "-vf",
                f"scale='min({args.max_width},iw)':-2,fps={args.fps}",
                str(out_path),
            ]
        )
        if ff_proc.returncode != 0 or not out_path.exists():
            raise RuntimeError(f"ffmpeg transcode failed: {ff_proc.stderr.strip()}")

        # Guarantee lightweight output (< 2MB) for GitHub Pages static repo
        if out_path.stat().st_size > 2_000_000:
            retry_proc = run_cmd(
                [
                    "ffmpeg",
                    "-y",
                    "-v",
                    "error",
                    "-i",
                    raw_file,
                    "-an",
                    "-vcodec",
                    "libx264",
                    "-crf",
                    "31",
                    "-preset",
                    "fast",
                    "-pix_fmt",
                    "yuv420p",
                    "-movflags",
                    "+faststart",
                    "-vf",
                    "scale='min(720,iw)':-2,fps=20",
                    str(out_path),
                ]
            )
            if retry_proc.returncode != 0:
                raise RuntimeError(f"ffmpeg compression retry failed: {retry_proc.stderr.strip()}")

        poster_proc = run_cmd(
            [
                "ffmpeg",
                "-y",
                "-v",
                "error",
                "-i",
                str(out_path),
                "-frames:v",
                "1",
                "-q:v",
                "4",
                str(poster_path),
            ]
        )
        if poster_proc.returncode != 0:
            raise RuntimeError(f"ffmpeg poster extraction failed: {poster_proc.stderr.strip()}")

    print(
        json.dumps(
            {
                "videoPath": str(out_path),
                "posterPath": str(poster_path),
                "sizeBytes": out_path.stat().st_size,
                "durationSec": duration,
                "sourceUrl": f"{url}&t={start_sec}s",
            },
            indent=2,
        )
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Search YouTube talks, read transcripts, and clip short demos.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_search = sub.add_parser("search", help="Search YouTube videos.")
    p_search.add_argument("query", help="Search query")
    p_search.add_argument("--limit", type=int, default=5)
    p_search.set_defaults(func=cmd_search)

    p_tr = sub.add_parser("transcript", help="Fetch timestamped transcript and chapters.")
    p_tr.add_argument("video", help="YouTube video ID or URL")
    p_tr.add_argument("--lang", default="en,vi", help="Comma-separated subtitle languages")
    p_tr.add_argument("--query", help="Optional keyword filter")
    p_tr.set_defaults(func=cmd_transcript)

    p_clip = sub.add_parser("clip", help="Cut a short muted MP4 clip + poster frame for <Video autoplay loop />.")
    p_clip.add_argument("video", help="YouTube video ID or URL")
    p_clip.add_argument("--start", required=True, help="Start time (seconds or MM:SS)")
    p_clip.add_argument("--end", required=True, help="End time (seconds or MM:SS)")
    p_clip.add_argument("--out", required=True, help="Output MP4 path (e.g. public/assets/blog/<slug>/<name>.mp4)")
    p_clip.add_argument("--max-width", type=int, default=960)
    p_clip.add_argument("--fps", type=int, default=24)
    p_clip.add_argument("--force", action="store_true", help="Allow clips longer than 25 seconds")
    p_clip.set_defaults(func=cmd_clip)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
