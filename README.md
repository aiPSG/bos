# bos

A small design app: one **format** (the stage) with a **margin box**, a **rectangle** and a
**logo circle** on it. Every value can be set two ways — numerically in the side panel, or by
dragging on the canvas.

**Live:** https://aipsg.github.io/bos/

## The model

Positions are not free coordinates. A shape's place on the format comes from three things:

1. **Margins** — the box both shapes are aligned inside. Set per side (linked or not), or
   derived from the logo: `margin = factor × logo width + buffer`, or `× logo height`, the usual
   clear-space rule with a constant of your own on top. Dragging a guide in a logo mode solves for
   the factor with the buffer taken off first, so the buffer stays what you set it to.
2. **Position in format** — which of the nine points of the margin box the shape goes to.
3. **Anchor point** — which of the nine points *of the shape* lands on it.

With both set to the same corner the shape sits flush inside the margin; decoupling them lets a
shape hang off an edge or centre on a corner. The anchor follows the position while the two are
in step, so it only decouples once you set it by hand.

Dragging a shape therefore snaps it to the nearest of the nine positions (the cells appear while
you drag), and dragging the dashed guides changes the margins — or the factor, when margins come
from the logo. **The guides are locked out of the box**, so a stray drag on the canvas cannot move
them; *Lock the guides* in the Margins panel releases them. **Guides** in the toolbar takes every
guide and grid off the canvas at once — margin guides, both baseline grids and the columns — and
puts them back, so a design can be looked at without them.

The dashed guides that mark the margin box pick their own colour: the app works out the luminance
of what sits behind them — the stage colour, with the average colour of a background image blended
over it by its opacity — and takes whichever of black or white contrasts more. The crossover is the
luminance where the two are equal, so the guides never wash out on a pale format or disappear on a
dark one. **Guide colour** in the Margins section switches that to a colour you pick instead.

**Columns** — the box between the left and right margins is divided into a number of columns with a
gutter between them, drawn on the canvas in the guide colour. Set the column count and the gutter;
the panel reports the column width that falls out of them ("12 columns of 62 px with a 16 px gutter
fill the 920 px between the left and right margins"). The grid can be hidden without losing the
numbers.

## What you can set

**Format** — width and height, or a preset (square, 4:5, 9:16, 16:9, A5, A4); background colour;
**round all values to whole numbers**, which applies to every number in the app, typed or dragged.

**Background image** — upload a file, paste a URL, or generate one (below). Fit as cover, contain,
stretch or tile, with an opacity slider.

**Rectangle** — it rides the baseline grid: its top edge sits on a grid line and its height runs a
whole number of rows, on grid 1 or grid 2 as you choose. The height field keeps what you typed and
the panel reports what it runs as. Then: position, anchor, height, and a **width** that works one of
four ways — *set by hand*, *fill between the margins*
(`width = format width − left margin − right margin`), *fill the format* edge to edge, or *fit the
text*, where the box takes the width of its longest line plus the side padding and grows and shrinks
as you type. The **height** has the first three of those. Filling wins over everything else on that
axis: a filled height is not snapped to the grid and a format-filling width is not snapped to the
columns, because both already end on an edge of their own. In any mode but *set by hand* the field
shows the computed value.

It also **snaps to the columns**: the left edge sits on a column line, and the right edge on one
too — either the right edge of a column, or a gutter further on at the left side of the next one, so
a box can end flush with a column or with the gap before the following one. Typed, dragged or
resized by a handle, it lands on the grid.
And whatever the mode, **the box is never narrower than its text**: the longest line plus the side
padding on both sides is its floor, so the copy never spills out of it. When even the whole column
grid is too narrow for a line, the text wins and the box grows past it.

**Corners** — a **shape** dropdown in three families. *Rounded* is everything `border-radius` can
make (sharp, rounded, squircle, pill, ellipse, four arches, leaf, teardrop, egg, blob, wave,
single/paired corners), with the full CSS surface editable underneath it: 1–4 values, `px` or `%`,
per-corner units, and independent horizontal/vertical radii for elliptical corners. The
`border-radius` field takes any valid shorthand — e.g. `12px 40% 0 8px / 20px 10% 5px 8px` — and the
handles follow it.

*Cut corners* are the ones a radius cannot make: **bevel** (a straight cut), **notch** (a square
step) and **scoop** (an inverted round, curving into the box). They read the same four corner
values, so each corner can be cut differently, and the round handles still drag them.

*Outlines* reshape the whole box: octagon, hexagon either way up, pentagon, diamond, triangle, star,
arrows left and right, chevron, notched banner, parallelogram, trapezoid either way up, cross,
speech bubble, and a punched ticket. They take their one size from the top-left corner value. Cut
and outline shapes are drawn with `clip-path` — polygons, or a path where the edge curves — and the
CSS output carries whichever the shape uses.

**Logo** — upload your own artwork (PNG, JPG, SVG, WebP) or keep the circle placeholder. **The
height defines the logo and the width follows the artwork's own proportions**; an SVG with nothing
but a `viewBox` is measured from that. The height is given in `px` or, by default, as **a percentage
of the format's longest side**, so the logo holds its scale whichever way the format turns — 10% is
135 on a 1350-tall portrait and 192 on a 1920-wide landscape. It can also be **measured in columns**:
one, one and a half or two columns wide (or any number you type), gutters included, with the height
following the artwork — and when the margins are themselves derived from the logo, the two are
solved together in one step rather than chasing each other. Resize handles keep the ratio and
write back in whatever unit is set. Its size is what the margin rule multiplies, so a percentage
logo gives margins that scale with the format too.

**Typography** — the type scale has four roles: **headline, subline, paragraph and small print**.

*Paragraph is the anchor*: its size is a percentage of the format (1.5% of the format height by
default; the basis can be the height, the longest side or the width). Every other role is a
**multiple of the paragraph size** — 2.618, 1.618 and 0.5 out of the box — and the panel shows what
each resolves to in pixels.

*Size relations* fills those multiples from a design ratio: the golden and silver ratios, root two,
three and five, Euler's number, pi, and the musical intervals from a minor second to the octave.
Picking one sets headline to `ratio²`, subline to `ratio` and small print to `1 / ratio`. **Typing
over any multiple is always allowed** — the moment you do, the system reads *Custom* and your value
stands.

Each role also carries its own **HTML tag** (h1–h6, p, div), weight, letter spacing (in `em`), case
and colour, so the hierarchy is real markup, not just sizes.

**Baseline grid** — there are two grids. **Grid 1 divides the format minus the top and bottom
margins into whole rows, so it always fits exactly**, and that row height *is* the paragraph line
height. **Grid 2** halves it. Change the format or the margins and the grid re-fits itself, taking
the paragraph leading with it.

Set the row count directly, or type a paragraph line height and the nearest whole row count that
still fits is used — the panel reports both ("grid 1 divides the 1190 px between the top and bottom
margins into 39 rows of 30.51 px, so it fits exactly"). Paragraph can also be cut loose from the
grid: set it to *Free* and the line height you type is used as it is, while grid 1 keeps its rows.
Both grids draw on the canvas in the guide colour, down the margin box; show both, either, or
neither.

Every role other than paragraph is **aligned to grid 1 or grid 2**: its line height snaps so the
line box is a whole number of that grid's rows, with the arithmetic reported ("line height 1.05
snaps to 1.205 so the line box is 3 × grid 1 = 91.5 px"). A line box is never snapped shorter than
the type itself. Any role can be set to *Free* to use a typed line height as it is.

Whole line boxes are not enough on their own: a baseline sits *inside* its line box, offset by the
half-leading plus the font's ascender, so it would still land between the lines. Each block is
therefore measured after layout — a zero-sized inline probe reports where the browser actually put
the first baseline — and moved so that baseline lands on the row it was given. It works with any
font, including one you upload. Every following line comes along, because line boxes are whole grid
rows.

**Text blocks** — four blocks, **each positioned individually**. A block sits on a **row of its
own**, counted from the top *or the bottom* edge of the rectangle, on grid 1 or grid 2 — type the
row number or drag the block up and down on the canvas, where it lands on whole rows. Counting from
the rectangle means **the text travels with it**: move the box and the blocks keep their rows, and
each block **holds its distance to the edge it is anchored to** as the box is made taller or
shorter — headings riding the top, small print riding the bottom. The origin is pulled onto the
block's own grid first, so a block on grid 1 always lands on a grid 1 line even when the rectangle
sits on a half row. Switching a block between the grids keeps it where it is and
renumbers the row. Each block also has its own text, its own role and its own alignment
(left / centre / right); the side padding sets the column they all run in. In a box that **fills the
format**, side-aligned text can *hang on the format margins* instead of that padding — left-aligned
text starts on the left margin, right-aligned text ends on the right one, centred text keeps the
padding — so type stays on the margin even when the box bleeds to the format edge. **Lines break where you
type a line break** — nothing wraps on its own, so a long line makes the box wider (in *fit the
text*) rather than the box making the line break. The box stays visible while any block has text,
even with the rectangle itself switched off, so text can sit straight on the format.

**Format previews** — a rail of live thumbnails, one per format. Every one renders the *actual*
design — background, margins, rectangle, corners, logo, type — at that format's dimensions, and
updates as you work, so you can watch a change land across all of them at once. Click one to make it
the format in the main window. A format that matches no preset shows up as a *Custom* tile at the
top. Toggle the rail with **Formats** in the toolbar.

**Canvas** — wheel or trackpad to pan, ⌘/Ctrl + wheel to zoom at the cursor, Space or middle-drag
to pan, plus −/+/1:1/Fit. Square handles resize, round handles set the corner radius, Shift
constrains, arrow keys step through the alignment cells. Clicking empty canvas **deselects**, and
hiding the guides hides the handles with them. **⌘/Ctrl + Z undoes** and ⌘/Ctrl + Shift + Z redoes,
from the keyboard or the two toolbar buttons; a burst of changes — a drag, a run of keystrokes —
settles into one step.

**Text on the canvas** — click a block to pick it up, **double-click to type straight into it** (the
panel follows every keystroke, and Escape leaves), drag its **side handles** to draw the field in
from either edge, or its round grip to **size that role** on the spot. A field drawn in wraps its
lines inside itself; one that fills the padding column keeps to the line breaks you typed. Both
insets are numbers in the panel too, with the resulting field width beside them. Live CSS **and markup** output with copy buttons; the
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

## The panel

Seven groups, in the order the design comes together: **Format** (with background image inside it),
**Logo**, **Margins** (with the column grid), **Rectangle** (with corners), **Typography**,
**Text blocks**, **CSS**.

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
