# bos

A small design app: one **format** (the stage) with a **margin box**, a **rectangle** and a
**logo circle** on it. Every value can be set two ways — numerically in the side panel, or by
dragging on the canvas.

**Live:** https://aipsg.github.io/bos/

## The model

Positions are not free coordinates. A shape's place on the format comes from three things:

1. **Margins** — the box both shapes are aligned inside. Set per side (linked or not), or
   derived from the logo: `margin = factor × logo width` or `× logo height`, the usual clear-space
   rule.
2. **Position in format** — which of the nine points of the margin box the shape goes to.
3. **Anchor point** — which of the nine points *of the shape* lands on it.

With both set to the same corner the shape sits flush inside the margin; decoupling them lets a
shape hang off an edge or centre on a corner. The anchor follows the position while the two are
in step, so it only decouples once you set it by hand.

Dragging a shape therefore snaps it to the nearest of the nine positions (the cells appear while
you drag), and dragging the dashed guides changes the margins — or the factor, when margins come
from the logo.

The dashed guides that mark the margin box pick their own colour: the app works out the luminance
of what sits behind them — the stage colour, with the average colour of a background image blended
over it by its opacity — and takes whichever of black or white contrasts more. The crossover is the
luminance where the two are equal, so the guides never wash out on a pale format or disappear on a
dark one. **Guide colour** in the Margins section switches that to a colour you pick instead.

## What you can set

**Format** — width and height, or a preset (square, 4:5, 9:16, 16:9, A5, A4); background colour;
**round all values to whole numbers**, which applies to every number in the app, typed or dragged.

**Background image** — upload a file, paste a URL, or generate one (below). Fit as cover, contain,
stretch or tile, with an opacity slider.

**Rectangle** — position, anchor, width and height, or **fill the width between the margins**
(`width = format width − left margin − right margin`). While that is on, the width field shows the
computed value and the margins drive the width.

**Corners** — a **corner style** dropdown covering the shapes `border-radius` can make (sharp,
rounded, squircle, pill, ellipse, four arches, leaf, teardrop, egg, blob, wave, single/paired
corners). Underneath it the full CSS surface is editable: 1–4 values, `px` or `%`, per-corner
units, and independent horizontal/vertical radii for elliptical corners. The `border-radius` field
takes any valid shorthand — e.g. `12px 40% 0 8px / 20px 10% 5px 8px` — and the handles follow it.

**Logo** — upload your own artwork (PNG, JPG, SVG, WebP) or keep the circle placeholder. **The
height defines the logo and the width follows the artwork's own proportions**; an SVG with nothing
but a `viewBox` is measured from that. The height is given in `px` or, by default, as **a percentage
of the format's longest side**, so the logo holds its scale whichever way the format turns — 10% is
135 on a 1350-tall portrait and 192 on a 1920-wide landscape. Resize handles keep the ratio and
write back in whatever unit is set. Its size is what the margin rule multiplies, so a percentage
logo gives margins that scale with the format too.

**Typography** — a style per HTML hierarchy: H1–H6, paragraph and small. Each keeps its own size,
weight, line height, letter spacing, case and **colour**. **Size is a percentage of the format's
longest side** — the panel shows the pixels it resolves to — and letter spacing is in `em`, so the
whole type scale travels with the format instead of being re-typed for each one.

The family can be a system stack, **a Google font**, or **a font file you upload** (`.woff2`,
`.woff`, `.ttf`, `.otf` — registered with the `FontFace` API and kept in this browser). The Google
picker types-ahead over a list of 124 popular families bundled with the app; paste a free
[Google Fonts API key](https://developers.google.com/fonts/docs/developer_api) under *List every
Google font* to replace that with the complete live catalogue, cached in your browser afterwards.
Google's stylesheet is requested with the usual weights and falls back to the family's own default
if it does not publish them.

**Text blocks** — three blocks fill the rectangle. Each has its own text, its own hierarchy and its
own alignment (left / centre / right). The stack as a whole sits at the top, middle or bottom of the
box, with padding and a gap you set. The box stays visible while any block has text, even with the
rectangle itself switched off, so text can sit straight on the format.

**Format previews** — a rail of live thumbnails, one per format. Every one renders the *actual*
design — background, margins, rectangle, corners, logo, type — at that format's dimensions, and
updates as you work, so you can watch a change land across all of them at once. Click one to make it
the format in the main window. A format that matches no preset shows up as a *Custom* tile at the
top. Toggle the rail with **Formats** in the toolbar.

**Canvas** — wheel or trackpad to pan, ⌘/Ctrl + wheel to zoom at the cursor, Space or middle-drag
to pan, plus −/+/1:1/Fit. Square handles resize, round handles set the corner radius, Shift
constrains, arrow keys step through the alignment cells. Live CSS **and markup** output with copy buttons; the
state is kept in `localStorage` and **Reset** restores the defaults.

## Generating a background with ComfyUI on RunPod

The panel posts your ComfyUI workflow to a RunPod serverless endpoint, polls the job and puts the
returned image behind the design. Fill in the endpoint ID (or a full URL), your API key, and the
workflow in **ComfyUI API format**. These placeholders are substituted before sending:

| Placeholder | Becomes |
| --- | --- |
| `{{prompt}}`, `{{negative}}` | the prompt fields, inserted as JSON strings — write them *without* surrounding quotes |
| `{{seed}}` | the seed field |
| `{{width}}`, `{{height}}` | the format size |

The request is `POST {endpoint}/run` with `{"input": {"workflow": …}}` and a
`Authorization: Bearer …` header, then `GET {endpoint}/status/{id}` every two seconds until the job
completes. The image is pulled out of the response wherever it is — a data URI, an image URL, or
base64 under `images` / `data` / `message` — and **Raw response** shows exactly what came back if a
worker returns something this doesn't recognise.

Two things to know, since this is a static page with no server of its own:

- **Your key stays in your browser.** It is kept in `localStorage` only if you tick *Remember key
  in this browser*, and it goes straight from your browser to RunPod — never to this site, and
  never into the repository. Anyone with access to that browser profile can read it, so don't use
  a shared machine.
- **The endpoint has to allow cross-origin requests.** The browser will block the call otherwise;
  the panel says so when that happens. If your endpoint doesn't send CORS headers, put a small
  proxy (a Cloudflare Worker, say) in front of it and paste the proxy's URL as the endpoint —
  which also keeps the key off the browser entirely.

## Running it

No build step, no dependencies — plain HTML, CSS and JavaScript.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to
`main`, and can be run by hand from the Actions tab. It needs **Settings → Pages → Source: GitHub
Actions** selected once.

## Layout

```
index.html      markup and the panel controls
css/styles.css  UI and canvas styling
js/app.js       state, geometry, corners, type, rendering, interactions, image generation
```

One routine, `paintInto(host, w, h, scale)`, draws the whole design into any element at any format.
The main stage and every preview tile call it, so a preview can never drift from what you are
editing. The geometry helpers read the format from the state, so `withFormat()` swaps it for the
duration of a paint and puts it back.
