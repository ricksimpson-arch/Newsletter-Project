# Franchise assets

This directory holds **licensed** franchise artwork. It ships empty (every
franchise's `heroImage` / `logoImage` / `thumbnailImage` is `null`), and the UI
renders an original abstract placeholder until real art is added.

**Never commit artwork here without a license that covers this internal tool.**
No copyrighted game artwork, logos, or screenshots may be bundled with the app.

## Filename conventions

Use the franchise `slug` (see `src/data/franchises/*.ts`) plus the asset role:

```
public/franchise-assets/<slug>-hero.webp    # wide header art, ~1600×600
public/franchise-assets/<slug>-logo.svg    # franchise logotype, transparent bg
public/franchise-assets/<slug>-thumb.webp  # square thumbnail, ~400×400
```

Examples:

```
public/franchise-assets/helldivers-2-hero.webp
public/franchise-assets/ghost-of-tsushima-logo.svg
public/franchise-assets/astro-bot-thumb.webp
```

## Wiring an asset up

1. Drop the file here using the convention above.
2. In the franchise's seed record, set the matching field, e.g.
   `heroImage: "/franchise-assets/helldivers-2-hero.webp"`.
3. Record the license/source in the seed's `licensingNotes` or an internal
   rights log, and re-run `npm test` (the schema accepts either `null` or a
   path string).

Prefer WebP for raster art and SVG for logotypes. Keep hero files under
~300 KB.
