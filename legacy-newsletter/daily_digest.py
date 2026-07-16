"""Daily trend brief for the ecommerce team.

Builds the Entertainment Radar daily email from the same dataset that
powers index.html (data.js) and sends it to every active subscriber in
subscribers.json (managed by newsletter.py).

Usage:
    python3 daily_digest.py --preview     # print today's issue, send nothing
    python3 daily_digest.py --send        # email all active subscribers

Sending requires SMTP settings in the environment:
    SMTP_HOST   (required)         SMTP_PORT  (default 587)
    SMTP_USER / SMTP_PASS          (optional; STARTTLS login when both set)
    DIGEST_FROM (default radar@example.com)

Schedule it with cron, e.g. weekdays at 7:00 AM:
    0 7 * * 1-5 cd /path/to/Newsletter-Project && python3 daily_digest.py --send
"""

from __future__ import annotations

import html
import json
import os
import re
import smtplib
import sys
from datetime import date, timedelta
from email.message import EmailMessage
from pathlib import Path

from newsletter import Newsletter

DATA_FILE = Path(__file__).parent / "data.js"
DIM_KEYS = ["scale", "reachability", "merchability", "passion", "competition"]


def load_data() -> dict:
    """data.js is `const ENTERTAINMENT_DATA = <json>;` plus an exports line."""
    text = DATA_FILE.read_text(encoding="utf-8")
    match = re.search(r"=\s*(\{.*\})\s*;", text, re.DOTALL)
    if not match:
        raise SystemExit(f"Could not parse {DATA_FILE}")
    return json.loads(match.group(1))


def composite(title: dict, weights: dict) -> float:
    return round(sum(title["scores"][k] * weights[k] for k in DIM_KEYS) * 10, 1)


def parse_date(value: str) -> date:
    year, month, day = (int(p) for p in value.split("-"))
    return date(year, month, day)


def status_for(title: dict, today: date) -> str:
    release = parse_date(title["releaseDate"])
    days = (release - today).days
    episodes = title.get("episodes")
    if episodes:
        start = parse_date(episodes["start"])
        end = start + timedelta(days=(episodes["count"] - 1) * episodes["cadenceDays"])
        if start <= today <= end:
            return "Airing now"
        if days > 0:
            return f"Premieres in {days} days"
        return "Season complete"
    if days > 0 and not title["dateConfirmed"]:
        return title["releaseWindow"]
    if days > 0:
        verb = "Premieres" if title["type"] == "TV" else "Opens"
        return f"{verb} in {days} day{'' if days == 1 else 's'}"
    if days >= -45 and title["type"] == "Movie":
        return "In theaters"
    return "Released"


def build_sections(data: dict, today: date) -> list[tuple[str, list[tuple[str, str]]]]:
    weights = data["weights"]
    titles = data["titles"]
    ranked = sorted(titles, key=lambda t: composite(t, weights), reverse=True)

    def days_until(t):
        return (parse_date(t["releaseDate"]) - today).days

    live = [t for t in titles if status_for(t, today) in ("In theaters", "Airing now")]
    soon = sorted((t for t in titles if 0 < days_until(t) <= 30), key=days_until)
    horizon = sorted((t for t in titles if 30 < days_until(t) <= 120), key=days_until)

    def live_line(t):
        extra = ""
        episodes = t.get("episodes")
        if episodes:
            start = parse_date(episodes["start"])
            ep = (today - start).days // episodes["cadenceDays"] + 2
            if 2 <= ep <= episodes["count"]:
                extra = f" Episode {ep} of {episodes['count']} airs {episodes['night']}."
        return (f"{t['title']} ({t['type']}, {t['platform']}) — "
                f"{status_for(t, today)}.{extra}", t["notes"])

    return [
        ("Live now — demand is spiking", [live_line(t) for t in live]),
        ("Opening within 30 days — launch window",
         [(f"{t['title']} — {status_for(t, today)} ({t['releaseWindow']}).",
           f"Composite {composite(t, weights)}. {t['notes']}") for t in soon]),
        ("90-day horizon — prep inventory now",
         [(f"{t['title']} — {t['releaseWindow']}.",
           f"Composite {composite(t, weights)}. Rights: {t['rightsHolder']}") for t in horizon]),
        ("Opportunity board — top 5 composite",
         [(f"#{i} {t['title']} — {composite(t, weights)}", t["releaseWindow"])
          for i, t in enumerate(ranked[:5], start=1)]),
    ]


def render_text(sections, today: date, disclaimer: str) -> str:
    lines = [f"ENTERTAINMENT RADAR — DAILY BRIEF · {today.strftime('%A, %B %-d, %Y')}", ""]
    for heading, items in sections:
        lines += [heading.upper(), "-" * len(heading)]
        if not items:
            lines.append("  Nothing in this window today.")
        for head, detail in items:
            lines.append(f"  • {head}")
            lines.append(f"      {detail}")
        lines.append("")
    lines += [disclaimer, ""]
    return "\n".join(lines)


def render_html(sections, today: date, disclaimer: str) -> str:
    parts = [
        '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;'
        'max-width:640px;margin:0 auto;color:#0b0b0b">',
        f'<h2 style="font-size:17px">Entertainment Radar — Daily Brief · '
        f"{today.strftime('%A, %B %-d, %Y')}</h2>",
    ]
    for heading, items in sections:
        parts.append(
            f'<h3 style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;'
            f'color:#898781;margin:18px 0 6px">{html.escape(heading)}</h3>'
        )
        if not items:
            parts.append('<p style="color:#898781;font-size:13px">Nothing in this window today.</p>')
        for head, detail in items:
            parts.append(
                f'<p style="margin:0 0 10px;font-size:14px">{html.escape(head)}<br>'
                f'<span style="color:#52514e;font-size:12.5px">{html.escape(detail)}</span></p>'
            )
    parts.append(f'<p style="color:#898781;font-size:11.5px;margin-top:20px">{html.escape(disclaimer)}</p></div>')
    return "".join(parts)


def send_digest(sections, today: date, disclaimer: str) -> int:
    host = os.environ.get("SMTP_HOST")
    if not host:
        raise SystemExit("SMTP_HOST is not set — run with --preview, or export SMTP_* first.")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user, password = os.environ.get("SMTP_USER"), os.environ.get("SMTP_PASS")
    sender = os.environ.get("DIGEST_FROM", "radar@example.com")

    recipients = Newsletter("Entertainment Radar").active_subscribers
    if not recipients:
        print("No active subscribers in subscribers.json — nothing sent.")
        return 0

    text = render_text(sections, today, disclaimer)
    body_html = render_html(sections, today, disclaimer)
    sent = 0
    with smtplib.SMTP(host, port) as smtp:
        if user and password:
            smtp.starttls()
            smtp.login(user, password)
        for sub in recipients:
            msg = EmailMessage()
            msg["Subject"] = f"Entertainment Radar — Daily Brief · {today.strftime('%b %-d, %Y')}"
            msg["From"] = sender
            msg["To"] = sub.email
            msg.set_content(text)
            msg.add_alternative(body_html, subtype="html")
            smtp.send_message(msg)
            sent += 1
    print(f"Sent to {sent} subscriber(s).")
    return sent


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "--preview"
    data = load_data()
    today = date.today()
    sections = build_sections(data, today)
    disclaimer = data["meta"]["disclaimer"]
    if mode == "--send":
        send_digest(sections, today, disclaimer)
    else:
        print(render_text(sections, today, disclaimer))


if __name__ == "__main__":
    main()
