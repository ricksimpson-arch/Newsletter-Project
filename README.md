# Entertainment Radar

Entertainment-sector business intelligence for ecommerce teams: which movies and
TV shows in the next 12 months are worth building merchandise programs around,
who owns the consumer-product rights, and a daily email brief that keeps staff
on top of the release calendar.

## What's inside

| File | Purpose |
|---|---|
| `index.html` | The web app — six tabs: **This Month** (July 2026 spotlight), **Deep Dive** (highest-potential title), **12-Month Calendar** (releases + producers + rights holders, CSV export), **Ecommerce Rankings** (5-dimension scored board, CSV export), **Relevance Signals** (modeled 12-month search-trend curve, momentum chip, passion gauge, and ideal-product pick per title), **Daily Email Feed** (live preview + setup) |
| `data.js` | The dataset — every tracked title with release info, producers, consumer-product rights holder, keywords, 1–10 scores, a `baseInterest` year-round search baseline, and an `idealProduct` recommendation. Edit this file to update the app; the dashboard, spreadsheets, and email all read from it. |
| `daily_digest.py` | Builds the daily brief from `data.js` and emails it to subscribers (`--preview` / `--send`) |
| `newsletter.py` | Subscriber management (JSON-backed) and SMTP sending primitives |
| `build_artifact.py` | Writes `dist/`: a single-file standalone copy of the site (email-able, double-click to open) and an artifact-ready copy for claude.ai publishing |

## Weekly refresh

The dataset is refreshed weekly by a scheduled Claude routine: each Monday it
checks release schedules and trend news, updates `data.js` (and the Deep Dive
if the top title changes), verifies the build, pushes to this branch, and
republishes the hosted launcher page at the same URL. `meta.generated` in
`data.js` always shows the date of the last refresh.

## Launching the website

The site is fully self-contained static files — any of these works:

- **Just open it:** double-click `index.html` (works from `file://`, no server needed).
- **Local server:** `python3 -m http.server 8000` then visit `http://localhost:8000`.
- **Website launcher / static host:** drag the project folder into Netlify Drop,
  Vercel, GitHub Pages, or any static-site host. No build step, no dependencies.

## The scoring model

Each title is scored 1–10 on five dimensions, weighted into a 0–100 composite:

| Dimension | Weight | Meaning |
|---|---|---|
| Scale | 30% | Size of the US fandom |
| Reachability | 25% | Ownable search keywords on ecommerce sites & Amazon |
| Merchability | 20% | How well the content translates into desirable product |
| Passion | 15% | Fan propensity to buy, wear, collect, gift |
| Competition (whitespace) | 10% | 10 = wide-open market, 1 = saturated shelf |

## The daily email

```bash
# preview today's issue (nothing is sent)
python3 daily_digest.py --preview

# subscribe a staff member
python3 -c "from newsletter import Newsletter; Newsletter('Entertainment Radar').subscribe('teammate@yourcompany.com', name='Sam')"

# send for real
export SMTP_HOST=smtp.yourcompany.com SMTP_PORT=587
export SMTP_USER=radar@yourcompany.com SMTP_PASS=... DIGEST_FROM=radar@yourcompany.com
python3 daily_digest.py --send

# automate: weekdays at 7:00 AM (crontab -e)
0 7 * * 1-5 cd /path/to/Newsletter-Project && python3 daily_digest.py --send
```

## Caveats

Scores are analyst estimates compiled 2026-07-11 from public release schedules and
trade reporting — a planning aid, not a licensing database. Release dates shift;
always verify merchandising rights with the listed rights holder before committing
inventory. The Deep Dive tab's editorial analysis is written for the current top
title (`spiderman-brand-new-day`); if the data changes the crown, update the
`editorial` block in `index.html` to match.
