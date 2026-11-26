# Tsang Chiu Wang — Portfolio

A static portfolio for the **Digital Media Technology** programme, portfolio year **2026**.

The work archive is titled **Art Technology with AI** and is deliberately **empty**: no works
are listed until real ones are supplied. Everything that was drafted earlier as sample
content has been removed, so the site now shows only the structure that will hold the work.

Discipline and year appear on the home label, in the footer of every page, on the About
details and on Contact.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home — name, statement, link to the archive (the only page at the top level) |
| `pages/works.html` | Archive 01 — **Art Technology with AI** |
| `pages/archive-interactive-media.html` | Archive 02 — **Interactive Media Design** (open, no entries yet) |
| `pages/archive-3d-model.html` | Archive 03 — **3D Model** (open, no entries yet) |
| `pages/work-01-symmetry.html` | Archive 01 / work 01 — Symmetry — Geometric Drawing (2026, interactive, runs live) |
| `pages/work-02-growth.html` | Archive 02 / work 01 — Growth (2026, interactive installation, TouchDesigner) |
| `pages/about.html` | About — intro, discipline, education, interests, skills, software, location, contact |
| `pages/contact.html` | Contact |

Every page carries the same header and footer. The footer keeps the contact details
required by the brief: telephone `55308832` (`tel:+85255308832`) and email
`tsangchiuwang10@gmail.com` (`mailto:`).

## Adding a work

Works are data, not hand-written HTML. Archives are declared in `const ARCHIVES` in
`_build/site.mjs`; each one has a `title`, a `gloss`, a `lede` and a `works` array.

1. Add the work object to the archive's `works` array — `num`, `href`, `title`, `gloss`,
   `year`, `type`, `intro`, `preview` (a path under `assets/img/`).
2. Put the preview image in `assets/img/`.
3. Run `node _build/site.mjs`. The archive row and the work page are both generated.

An archive with an empty `works` array renders its “No entries” state, so a folder can
exist before the work does — archive 02 (Interactive Media Design) is in that state now.

### Running an HTML work inside the page

An entry can carry `embed: "works/<file>.html"`. When it does, the archive page renders a
responsive frame under the list and the work runs inside the page, with **Reload** and
**Open full page** controls (`<iframe>` sized 16:9, borderless, lazily loaded). While no
entry has `embed`, the frame stays out of the layout.

Work 01 uses this: `works/symmetry/TsangChiuwang.html` is the drawing instrument itself,
running live in the work page. Its only outside dependency (the Tailwind browser build) is
vendored next to it as `works/symmetry/tailwind.js`, and the Google Fonts link was removed,
so the piece runs from disk without a network connection — Chinese UI text falls back to
the system CJK font.

`works/slot-01.html` is a small standalone placeholder showing the expected format for a
new embedded piece (one file, no external dependencies, keyboard and reduced-motion
handling).

## Viewing it

The site is fully static. Because fonts load from disk, open it through a local server
rather than `file://`:

```
node _build/serve.mjs 8757      # http://127.0.0.1:8757/index.html
```

## Structure

```
index.html               Home — the only page at the top level
pages/                   works.html, archive-interactive-media.html, work-01-symmetry.html,
                         work-02-growth.html, about.html, contact.html
assets/css/style.css     design system, layout, responsive rules
assets/js/site.js        header state, reveals, home canvas, hover previews, embed reload
assets/fonts/            Inter (variable) + IBM Plex Mono 400/500, self-hosted
assets/img/              work images, about-notes.jpg, og-cover.jpg, favicon.svg
works/                   work HTML that runs inside the page (works/symmetry/…)
assets/video/            H.264 clips used by work pages (growth-hero.mp4, growth-system.mp4)
_build/                  generators and the local server (not needed to view the site)
```

Every page except the home page sits in `pages/`, so its links to assets use `../assets/…`
and links between pages stay flat (`works.html`). The generator handles this with a `BASE`
prefix that is set per page — add a page to the `pages` array and nothing else changes.

An earlier build with three sample projects is preserved outside this folder as
`tsang-chiu-wang-portfolio-with-sample-works.zip`. Its plates and video loops live in
`_build/art.py` and `_build/video.py` if they are ever wanted again.

If an image is missing, `assets/js/site.js` swaps it for a labelled placeholder that keeps
the slot's aspect ratio, so a layout still reads while assets are being added.

## Rebuilding

```
node _build/site.mjs        # writes the HTML pages from _build/site.mjs
python _build/art.py        # optional: procedural greyscale plates
```
