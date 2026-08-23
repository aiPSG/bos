# bos

A minimal design app: one **stage** (the format) with one **rectangle** on it.
Every value can be set two ways — numerically in the side panel, or by dragging a
handle on the rectangle itself.

**Live:** https://aipsg.github.io/bos/

## What you can do

**Format**
- Set the stage width and height freely, or pick a preset (square, 4:5, 9:16, 16:9, A5, A4).
- Set the stage background colour.

**Alignment**
- Anchor the rectangle left or right, and top or bottom, with the 2 × 2 anchor picker.
- Switching the anchor keeps the rectangle exactly where it is; only the reference
  borders change, so the distances are re-measured from the new edges.

**Distance to format**
- The two distance values are the gap between the rectangle and the format borders
  it is anchored to (left/right and top/bottom).

**Size**
- Set width and height numerically, or drag any of the eight resize handles.
- **Full format width** stretches the rectangle across the whole format minus the
  distance on both sides (`width = format width − distance × 2`). While it is on,
  the width field shows the computed value and the left/right handles adjust the
  distance symmetrically.

**Corners**
- Every corner style CSS supports: 1–4 corner values, each in `px` or `%`,
  independent horizontal and vertical radii (elliptical corners), and per-corner units.
- **Link all corners** edits all four at once; **Elliptical** exposes the vertical radii.
- Drag the round handle inside a corner to round it — horizontally for the
  horizontal radius, vertically for the vertical one.
- The `border-radius` field is editable: type any valid CSS shorthand
  (e.g. `12px 40% 0 8px / 20px 10% 5px 8px`) and the handles and inputs follow it.

**Canvas**
- Zoom in/out or fit to the viewport; the stage is always rendered to scale while
  the handles stay at a constant screen size.
- Drag the rectangle to move it, hold <kbd>Shift</kbd> to constrain to one axis,
  hold <kbd>Shift</kbd> on a corner handle to keep the aspect ratio.
- Arrow keys nudge by 1 unit, <kbd>Shift</kbd> + arrows by 10.
- The generated CSS is shown live and can be copied.
- The last state is kept in `localStorage`; **Reset** restores the defaults.

## Running it

No build step, no dependencies — it is plain HTML, CSS and JavaScript.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every
push to `main`, and can also be run manually from the Actions tab. It needs
**Settings → Pages → Source: GitHub Actions** to be selected once.

## Layout

```
index.html      markup and the panel controls
css/styles.css  UI and canvas styling
js/app.js       state, geometry, rendering, drag interactions
```
