"""Build distributable copies of the Entertainment Radar site.

Reads index.html + data.js and writes to dist/:
  Entertainment-Radar-standalone.html  — full document with the dataset
      inlined; email it or open it anywhere with a double-click.
  entertainment-radar-artifact.html    — the same page stripped of the
      <html>/<head>/<body> wrapper and of the site's own theme toggle,
      ready to publish as a claude.ai Artifact (the artifact host
      supplies the document wrapper and its own theme switcher).

Usage: python3 build_artifact.py
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"

WRAPPER_LINES = [
    "<!doctype html>\n",
    '<html lang="en">\n',
    "<head>\n",
    '<meta charset="utf-8">\n',
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n',
    "</head>\n",
    "<body>\n",
    "</body>\n",
    "</html>\n",
]
THEME_BUTTON = '    <button class="theme-btn" id="theme-toggle" type="button">Theme</button>\n'


def build() -> None:
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    data = (ROOT / "data.js").read_text(encoding="utf-8")

    tag = '<script src="data.js"></script>'
    assert tag in src, "index.html no longer references data.js"
    inlined = src.replace(tag, "<script>\n" + data + "</script>", 1)

    DIST.mkdir(exist_ok=True)
    (DIST / "Entertainment-Radar-standalone.html").write_text(inlined, encoding="utf-8")

    artifact = inlined
    for line in WRAPPER_LINES:
        assert line in artifact, f"wrapper line missing: {line!r}"
        artifact = artifact.replace(line, "", 1)
    assert THEME_BUTTON in artifact, "theme toggle button not found"
    artifact = artifact.replace(THEME_BUTTON, "", 1)
    # drop the theme-toggle script block (from its comment to the blank line
    # after the listener) — the artifact viewer provides its own toggle
    artifact, n = re.subn(
        r"[ \t]*// -+ theme -+\n(?:.*\n)*?  \}\);\n\n",
        "",
        artifact,
        count=1,
    )
    assert n == 1, "theme JS block not found"

    (DIST / "entertainment-radar-artifact.html").write_text(artifact, encoding="utf-8")
    print("built dist/Entertainment-Radar-standalone.html and dist/entertainment-radar-artifact.html")


if __name__ == "__main__":
    build()
