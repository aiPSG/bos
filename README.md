# bos

A small design app: one **format** (the stage) with a **margin box**, a **rectangle** and a
**logo circle** on it. Every value can be set two ways — numerically in the side panel, or by
dragging on the canvas.

**Live:** https://aipsg.github.io/bos/

## The model

Positions are not free coordinates. A shape's place on the format comes from three things:

1. **Margins** — the box both shapes are aligned inside. Set per side (linked or not), or
   derived from the logo: `margin = factor × logo diameter`, the usual clear-space rule.
2. **Position in format** — which of the nine points of the margin box the shape goes to.
3. **Anchor point** — which of the nine points *of the shape* lands on it.

With both set to the same corner the shape sits flush inside the margin; decoupling them lets a
shape hang off an edge or centre on a corner. The anchor follows the position while the two are
in step, so it only decouples once you set it by hand.

Dragging a shape therefore snaps it to the nearest of the nine positions (the cells appear while
you drag), and dragging the dashed guides changes the margins — or the factor, when margins come
from the logo.

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

**Logo** — a circle placeholder: diameter, position, anchor, fill. Its width can drive the margins.

**Canvas** — wheel or trackpad to pan, ⌘/Ctrl + wheel to zoom at the cursor, Space or middle-drag
to pan, plus −/+/1:1/Fit. Square handles resize, round handles set the corner radius, Shift
constrains, arrow keys step through the alignment cells. Live CSS output with a copy button; the
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
js/app.js       state, geometry, corners, rendering, interactions, image generation
```
