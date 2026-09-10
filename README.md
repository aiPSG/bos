# bos

A small design app: one **format** (the stage) with a **margin box**, a **solid** and a
**logo circle** on it. Every value can be set two ways — numerically in the side panel, or by
dragging on the canvas.

**Every number is a slider and a field.** Sweep the slider to find a value, type in the field when
you know it, and step it with the ↑ / ↓ arrow keys once the field has the focus — each press moves
one step of that value, whatever its step happens to be. There are no spinner buttons: the slider
took their place. The slider sweeps the part of the range worth sweeping — a margin as far as half
the format, a radius as far as half the box, a column count to 48 — while the field stays as open as
it ever was, and where a value is being computed rather than set (a width that fills the margins, a
position a filled box does not use) both go quiet together.

**The stage starts empty.** The solid and the five text roles wait in a **tray** above the
canvas; drag one onto the format and it lands where you point, snapping to the grid and the columns
as it goes. Let go outside the format and nothing is placed; a plain click drops it at the place it
last had. A **text role can be pulled out as often as you like** — each drag makes a block of its
own, with its own copy, position and field — and the **✕** on a block, or on the solid, takes it
off again and puts it back in the tray (⌫ does the same for whatever is selected). Undo brings it
back. The design is kept between sessions, so a reload picks up where you left off; **Reset** in the
toolbar clears the stage back to empty.

**Live:** https://aipsg.github.io/bos/

## The five stages

The work runs in stages, and the tabs across the top are those stages in order:

| | Stage | What it is |
| --- | --- | --- |
| 1 | **Set design system** | The format, the logo, the margins and columns, the solid, the type scale and both baseline grids, and the text that sits on them. This is the app below. |
| 2 | **Create colour scheme** | A scheme worked out the way colour is worked out — from one colour and a relationship — and put on the type and the solids. |
| 3 | **Generate background** | One ground for the system to sit on, made rather than found — from a generated image, a pattern, or a gradient. Patterns and gradients are built; images are not yet. |
| 4 | **Design formats** | The formats the work runs in, one of them the master, each other one saying what it takes from it. |
| 5 | **Dummies** | The finished formats shown in place — a phone, a poster site, a spread. |

The first four are built. *Dummies* carries an **under construction** placeholder that names what
will live there, as does the *Image* tab inside *Generate background*. The tab you were last on is
remembered.

## The colour scheme

**Create colour scheme** builds a palette the way colour is usually worked out: **one colour and a
relationship between hues**. Pick the colour it starts from, then the relationship —
**monochromatic**, **analogous**, **complementary**, **split complementary**, **triadic**,
**tetradic**, or **tints and shades** — and set how many swatches you want (3 to 12). The first pass
is the hues themselves; each pass after it steps the lightness, so a six-swatch complementary scheme
is the two hues, then a lighter pair, then a darker pair. Analogous and split complementary also take
a **spread**, the angle between neighbours.

Underneath, every place a colour can go: the **page background**, each of the five **type roles**,
and every **solid and frame** on the page. Click a swatch on a row to put it there, or open the
picker at the left of the row for a colour of your own. Type rows carry their **WCAG contrast ratio
against the page**, so a scheme can be judged as it is built.

Beside it, **the formats the work runs in** — the ones added in *Design formats*, each painted at
its own values — so a scheme can be seen landing on all of them at once rather than one at a time.

## Generating a background

**Generate background** has three tabs of its own — *Image*, *Pattern*, *Gradient* — with a live
view of the format beside them, showing the design over whatever is being made — with its own
zoom: −, +, 1:1, Fit, ⌘/Ctrl + wheel, and a plain wheel to scroll when it is bigger than the view.

**The colours come from the colour scheme.** Every colour a module starts from is a colour of the
scheme rather than one of its own, so a background made in stage 3 is already in the palette built
in stage 2 — and it follows that palette as it changes. Under each colour field the scheme is
offered as a row of swatches: one click puts that colour in the field, and from then on that one
colour is yours and stops following. The frames on the stage are offered the same, since they run
the same modules.

A pattern or a gradient is a **module**: a name, a few fields, and a routine that draws it as SVG at
the size of the format. Each is shown as a card that draws its own preview, so the pickers are the
patterns themselves. Five of each to start with, and adding another is adding an entry to a list —
nothing else in the app needs to know what the modules are.

| Patterns | | Gradients | |
| --- | --- | --- | --- |
| **Grid** | lines on the baseline rows and down the columns | **Linear** | one colour to another along an angle, with a movable midpoint |
| **Dots** | a lattice, staggered or square | **Radial** | a light from a point, falling off to the far colour |
| **Stripes** | bands at any angle | **Angular sweep** | a sweep around a point, drawn as a fan of sectors |
| **Checker** | two colours, any cell size | **Mesh** | three soft lights over a ground |
| **Rings** | circles out from a point | **Bands** | the same fade, stepped into hard edges |

**The grid module is linked to the design's own grids.** Its rows come from baseline grid 1 or grid
2, its columns from the format columns or the solid's — or from a spacing of your own — so
changing the row count or the number of columns redraws the background with them. Dots and Checker
can take their spacing from a baseline grid the same way.

A grid stops at the margins, which would leave a band of nothing round a background made from one,
so the same rhythm is **carried out to the edges of the format** — at the grid's own phase, so the
lines that fall inside the margin box are still exactly the design's. Untick *Carry the rhythm past
the margins* to have it stop where the grid does.

What is made **is** the background: it is drawn at the size of each format and made again for every
one, so a linked pattern fits each of them rather than being scaled to fit, and it covers the format
exactly. Switching one on clears any fit, scale or offset left over from an image that was there
before, so it never arrives part-covered. Fit, opacity, scale and
position stay in Format → Background image and apply to it, and *Remove* gives the background back
to whatever image was there before.

## The formats, and the master

**Design formats** is the list of formats the work runs in. Add them from a catalogue grouped the
way the work is: **Print** (DIN A4, A3, A2 and A1 at 300 dpi, and a business card), **Social media**,
**Web banners**, **Digital OOH**, **Motion** (4K UHD and 2K / Full HD, alongside the lower third,
intro and outro cards) and **Book**. Each is a tile painted at its own values; clicking one takes
you to the design system with that format open.

**One format is the master.** Every other one says, with a tick each, what it takes from it:

| Typography | Page setup |
| --- | --- |
| **Font** | **Baseline grid** |
| **Font sizes** — the paragraph size, its basis, the ratio system and every multiple | **Margins** — the page's, the columns, and every solid's own |
| | **Logo** |

A ticked group is **shared**: set it on any format that links it and the master takes the change, so
every other format on that link follows. An unticked group is that format's alone — untick *Margins*
on a banner and it keeps its own while its type still comes from the master. The tile grid and the
preview rail both paint each format at its own resolved values, so the differences are visible
without switching between them.

## The model

A shape's place on the format is measured, not free-floating. It comes from:

1. **Margins** — the box the shapes are placed inside. Set per side (linked or not), or
   derived from the logo: `margin = factor × logo width + buffer`, or `× logo height`, the usual
   clear-space rule with a constant of your own on top. The factor gives every side the same base;
   **each side then adds a buffer of its own**, so the four can differ while sharing the rule — the
   four fields hold those buffers and their labels report what each side comes to. Switching the
   source to the logo **unlinks the sides**, since that is the point of having four; link them again
   and they move together. Dragging a guide moves that side's buffer and leaves the factor alone.
2. **Where it sits** — for a **solid**, anywhere: a point across and down, measured from the top left
   corner of the format to the solid's anchor point. For the **logo**, one of the nine points of the
   margin box.
3. **Anchor point** — which of the nine points *of the shape* lands on that place.

**A solid goes where you put it.** Drag it and it follows the pointer; the two fields beside the
anchor grid say where it is and put it somewhere exact; the arrow keys step it by a column and a
row. It still lands on the design: the top edge is pulled onto the baseline grid and the left edge
onto a column line, so free placement never means off the grid. The position is held as a share of
the margin box rather than in pixels, so a solid keeps its place across formats of every size, and
follows the margins when they move.

It may run off the format as far as you like — that is what bleed is — but **a strip of it always
stays on the format**, so there is something left to take hold of. A box set to fill the width, the
height or the format is placed by that instead, and the field for that side is closed.

The logo keeps the nine cells: with its position and anchor on the same corner it sits flush inside
the margin, and decoupling them lets it hang off an edge or centre on a corner. **The anchor is
yours alone** — for the logo and for a solid alike, moving a shape never changes it, so what you set
in the anchor grid is what it keeps. A solid pulled out of the tray simply lands centred under the
pointer.

Dragging the logo therefore snaps it to the nearest of the nine positions, measured with the anchor
it already has (the cells appear while you drag), and dragging the dashed guides changes the margins — or the factor, when margins come
from the logo. **The guides are locked out of the box**, so a stray drag on the canvas cannot move
them; *Lock the guides* in the Margins panel releases them. **Guides** in the toolbar takes every
guide and grid off the canvas at once — margin guides, both baseline grids and the columns — and
puts them back, so a design can be looked at without them.

The dashed guides that mark the margin box pick their own colour: the app works out the luminance
of what sits behind them — the stage colour, with the average colour of a background image blended
over it by its opacity — and takes whichever of black or white contrasts more. The crossover is the
luminance where the two are equal, so the guides never wash out on a pale format or disappear on a
dark one. **Guide colour** in the Margins section switches that to a colour you pick instead.

**Page setup** — the margins and all three grids live in one panel section, since they are the same
kind of thing: the margins, the
**baseline grid** (where grid 1 comes from, its row count and what is drawn), the **format columns**,
and the **solid's columns**. Each can be hidden without losing its numbers, and **Guides** in
the toolbar takes the lot off at once.

The **format columns** divide the box between the left and right margins into a number of columns
with a gutter between them, drawn in the guide colour. Set the count and the gutter; the panel
reports the column width that falls out of them ("12 columns of 62 px with a 16 px gutter fill the
920 px between the left and right margins").

The **solid's columns** do the same across the box, on a count and gutter of their own, and they
have **margins of their own inside the box** — top, right, bottom and left — so the grid can be held
off the edges of the box the way the format columns are held off the edges of the page. They move
and re-divide with the box, and they are what *the box's own columns* means for a text block.

## What you can set

**Format** — width and height, or a **template** for the job in hand, with its aspect ratio beside
every name: social posts, stories and link cards; the IAB display banners (leaderboard, medium
solid, skyscraper, half page, mobile); digital billboards from 16:9 to 32:9 and 4K; motion
graphics cards (lower third, intro, outro, vertical cut-down); and book work — cover, and inside
pages for text, for image, and for image and text. A template sets the format *and the scaffolding
that suits it* — margins, columns and the number of baseline rows — and leaves the elements in the
tray. Then: background colour, and **round all values to whole numbers**, which applies to every
number in the app, typed or dragged.

**Background image** — upload a file, paste a URL, generate one (below), or make a pattern or a
gradient in the *Generate background* stage. Fit as cover, contain,
stretch or tile, with an opacity slider. The fit is a starting point, not the last word: **scale the
image from 10% to 500% of it and move it about**, by the sliders and number fields or by holding
⌥/Alt and dragging it on the canvas. The panel reports the size and position it runs at on this
format, *Reset* puts it back to the plain fit, and the CSS output carries the resulting
`background-size` and `background-position` in pixels.

**Solids and frames** — **as many as you like on a page**: every drag out of the tray makes another,
each with its own size, alignment, fill, corners and column grid. A **frame** is a solid whose fill
is a picture rather than a colour, so it is resized, snapped, aligned and masked by exactly the same
machinery — *What fills it* in the panel switches any box between the two.

| Fills it | What that means |
| --- | --- |
| **A colour** | the solid as it always was |
| **An image** | uploaded or from a URL |
| **A pattern** | any of the five pattern modules, drawn at the size of the box |
| **A gradient** | any of the five gradient modules, the same |

Inside the frame the picture has a **fit** (cover, contain, stretch, tile), a **scale** from 10% to
500% over it, and an offset — set by the fields, or by holding **⌥/Alt and dragging the box** on the
canvas, which pushes the picture about inside it and looks under any text lying over it. **The
corner shape is the mask**: bevel, notch, scoop and all seventeen outlines cut the picture the same
way they cut a fill, and the exported CSS carries the `clip-path` with the `background-size` and
`background-position` the picture ends up at. Click one on the canvas to work on it; the
panel, the frame and its ✕ all follow whichever is picked, and a new one starts as a copy of the
settings the last one had. *Draw its fill* switches the fill off without taking the box away. Once on the stage it rides the baseline grid: its top edge sits on a grid line and its height runs a
whole number of rows, on grid 1 or grid 2 as you choose. The height field keeps what you typed and
the panel reports what it runs as. Then: position, anchor, height, and a **width** that works one of
four ways — *set by hand*, *fill between the margins*
(`width = format width − left margin − right margin`), *fill the format* edge to edge, or *fit the
text*, where the box takes the width of its longest line plus the side padding and grows and shrinks
as you type. The **height** has the first three of those. Filling wins over everything else on that
axis: a filled height is not snapped to the grid and a format-filling width is not snapped to the
columns, because both already end on an edge of their own. In any mode but *set by hand* the field
shows the computed value.

**A handle always resizes.** Dragging one is a direct instruction, so if that side is being computed
— filling the margins, filling the format, fitting the text — the drag takes it over, switches that
side to *set by hand* and carries on from the size that is on screen. The box is also snapped to the
columns and to the baseline rows and held above the width of its text, so what it runs at is rarely
the number that was asked for; **what the box runs at is what the fields say**, because a resize
writes back the size it settled on and the next drag starts from the edge that is actually there. If
a drag still seems to do nothing, the box is being held — by the column line it is on, by the row its
height runs to, or by its text — and the two hints under the fields say which.

It also **snaps to the columns**: the left edge sits on a column line, and the right edge on one
too — either the right edge of a column, or a gutter further on at the left side of the next one, so
a box can end flush with a column or with the gap before the following one. Typed, dragged or
resized by a handle, it lands on the grid.
Text wraps inside the box rather than pushing it wider, so **the box is free to be any width the
columns allow** — narrow it and the copy simply takes more lines. *Fit the text* still measures the
line as it would be if it did not wrap, so that mode gives the box the width its longest line asks
for.

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
CSS output carries whichever the shape uses. The fill is a **layer of its own inside the box**, so
the shape clips the fill and nothing else: type that runs past the edge of the box, or sits above or
below it, is never cut off by the corner treatment.

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

**Typography** — the type scale has five roles: **display, headline, subline, paragraph and small
print**. Display is the biggest of them, one ratio step past the headline (4.236 × paragraph out of
the box, against the headline's 2.618).

*Paragraph is the anchor*, set by a **slider and a field on the same value** — drag it or type it —
and measured one of four ways:

| Measured as | What the number means |
| --- | --- |
| **the longest side** (the default) | a percentage, 0.1% to 4% — 1% of a 1350 px side is 13.5 px |
| **the format height** | the same percentage, of the height |
| **the format width** | the same percentage, of the width |
| **px, set by hand** | a size in pixels, the same in every format |

A percentage scales the whole type scale with the format; a hand-set size holds still. It starts at
**1%**, and the slider covers the range in hundredths. Every other role is a
**multiple of the paragraph size** — 2.618, 1.618 and 0.5 out of the box — and the panel shows what
each resolves to in pixels.

*Size relations* fills those multiples from a design ratio: the golden and silver ratios, root two,
three and five, Euler's number, pi, and the musical intervals from a minor second to the octave.
Picking one sets display to `ratio³`, headline to `ratio²`, subline to `ratio` and small print to
`1 / ratio`. **Typing
over any multiple is always allowed** — the moment you do, the system reads *Custom* and your value
stands.

Each role also carries its own **HTML tag** (h1–h6, p, div), weight, letter spacing (in `em`), case
and colour, so the hierarchy is real markup, not just sizes.

**And its own family.** The family at the top of the Typography group is the design's — what every
role runs in unless it says otherwise — and each role has a **Family** of its own in *Style*, set to
*Same as the design* until you change it. So the hierarchy can be **different faces, not only
different weights of one**: a display serif over a grotesque headline over a neutral text face, with
the small print in a mono. Add the families you want to the list first (the system stacks are always
there; *Google Fonts* adds any family from the catalogue, and a font file can be uploaded), then
assign them per role. Every family in use is loaded, named on the typography slide, `@import`-ed in
the CSS output and carried in the token file — and a format that links *Font* to the master follows
the whole pairing, not just the one family.

**Baseline grid** (in *Page setup*, with the margins and the two column grids) — there are two grids, and
you choose which way round they are built.

*Whole rows that fill the content height* (the default): **grid 1 divides the format minus the top
and bottom margins into whole rows, so it always fits exactly**, and that row height *is* the
paragraph line height. Change the format or the margins and the grid re-fits itself, taking the
paragraph leading with it.

*The paragraph line height*: the type leads the grid instead. **Grid 1 is the paragraph line box** —
size × line height — so the row is whatever you set in Style, and as many whole rows fit the content
height as happen to fit; the panel reports the count and what is left over at the foot. The margins
then change how many rows there are, not how tall they are.

Either way **grid 2 is half of grid 1**, and everything else snaps to them as before.

In the fitting mode, set the row count directly, or type a paragraph line height and the nearest
whole row count that still fits is used — the panel reports both ("grid 1 divides the 1190 px between the top and bottom
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

**Text blocks** — as many as you drag out of the tray, each **positioned individually**. There is no
text-block section in the left panel: **a block is set where it sits**. Click one on the canvas and
an inspector opens beside it — outside the format when the canvas has room for it there, so the
design is never covered — carrying that block's role, its copy, its blind text, its field, its row
and grid, and its alignment. The two settings every block shares (the side padding, and hanging
side-aligned text on the format margins) fold out of *Every block* at the foot of it.

**Drag the inspector by its title bar** to park it anywhere on the canvas; it stays where it is put,
whichever block you pick next, and is held inside the canvas whatever the window does. Its **✕ only
shuts the panel** — the block stays on the stage, and picking a block opens it again. The red ✕ on
the block itself is the one that takes the block off. Hiding the guides hides the inspector with the
rest of the selection UI.

**A text block is pinned to the page, not to a box.** Its row is counted from the top or the bottom
margin, and **nothing a solid does moves it** — move a box, resize it, take it off the stage, and
every block stays on the row it was given. What a block takes from the solid it sits inside is the
box's *padding*, and only while its *Cols* is set to follow the box; set it to the format columns
and the box has no say at all. Anywhere else — above a box, below it, or with none on the stage — a
block **lines up on the columns**, its edges landing on column lines.

**Which column grid** a block lines up on is its own to set, in *Cols*: *follow the box* is the rule
just described — the box padding while it is inside the solid, the format columns everywhere
else — while *the format columns* and *the box's own columns* hold whichever you name, wherever the
block sits. A block on the box's columns follows the box as that is resized or moved, even from
above or below it; one on the format columns never does. Switching between them carries the block's
edges across, so it lands on the nearest lines of the new grid rather than jumping to the margin.

Such a block can also be **dragged sideways**: its left edge lands on a column line of its own grid
and the field keeps the width it had, giving way only at the last line. Both insets stay typeable in
the panel.

Each block chooses **which lines it may sit on**: *grid 1* the full rows, *grid 2* the half lines
between them, or *both grids* any line at all. Paragraph starts on grid 1 and every other role on
both, and dragging a block steps in whichever of those it is set to.  A block sits on a **row of its
own** — type the row number or drag the block on the canvas, where it lands on whole rows of its
grid. Counting from
the solid means **the text travels with it**: move the box and the blocks keep their rows, and
each block **holds its distance to the edge it is anchored to** as the box is made taller or
shorter — headings riding the top, small print riding the bottom. The origin is pulled onto the
block's own grid first, so a block on grid 1 always lands on a grid 1 line even when the solid
sits on a half row. Switching a block between the grids keeps it where it is and
renumbers the row. Each block also has its own text, its own role and its own alignment
(left / centre / right); the side padding sets the column they all run in. A block can also be
filled with **blind text** — a slider from one word to a hundred and twenty sets how much, the count
is shown beside it, and *Fill* puts it back after you have typed over it. Latin, broken into
sentences, so the shapes of the words carry the type rather than the meaning. It is also **what a
block arrives carrying**: no hard line breaks in it, and as long a line as makes sense at that
role's size. In a box that **fills the
format**, side-aligned text can *hang on the format margins* instead of that padding — left-aligned
text starts on the left margin, right-aligned text ends on the right one, centred text keeps the
padding — so type stays on the margin even when the box bleeds to the format edge.

**Lines break where you type a line break, and again at the right edge of the area the block runs
in**: the format width less the right margin when the block is not in a solid, and the solid's width
less the side padding when it is. Draw the field in with the side handles and it breaks there
instead. The box stays visible while any block has text,
even with the solid itself switched off, so text can sit straight on the format.

**Format previews** — a rail of live thumbnails, one per format. Every one renders the *actual*
design — background, margins, solid, corners, logo, type — at that format's dimensions, and
updates as you work, so you can watch a change land across all of them at once. Click one to make it
the format in the main window. A format that matches no preset shows up as a *Custom* tile at the
top. Toggle the rail with **Formats** in the toolbar.

A solid leaves the stage the way a text block does: the red **✕** at its top right corner, or ⌫
while it is selected, takes that one off. Undo brings it back.

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
insets are numbers in the panel too, with the resulting field width beside them. The
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

## Export

**Typography slide** and **Colour slide**, at the top of the Export section, each lay the design's
system out on one **16:9 page** the way a brand manual would, and print to PDF at 1920 × 1080 with
no margins.

The typography slide carries the family and its alphabet and a specimen of every role in blind text
— scaled to fill the page, and named with the family, the weight and case, the tag, the size in
pixels and where it comes from (the paragraph percentage and its basis, or the multiple of paragraph
it runs at), its line height and how many grid rows that is, its tracking, its colour and which grid
it snaps to. Beside them, a column on how the scale is built: the paragraph size and basis, the
ratio system, the multiples, both grids and the leading rule.

The colour slide carries every colour the design uses — one card per colour, listing everything it
is used for, with **HEX, RGB, HSL and CMYK** — and a contrast table: each role against the format
background and against the solid fill, with the WCAG 2 ratio and whether it passes AA at that
size. The CMYK is a plain conversion with no colour profile behind it: a starting point for print,
not the separation a printer will make.

Below them, the live **CSS and markup** output with copy buttons, and the design as **design
tokens**.

### Design tokens

**Copy tokens** / **Save tokens.json** writes the system as a
[W3C / DTCG](https://tr.designtokens.org/format/) token file. What maps, maps: colours as `color`,
the multiples as `number`, each of the five roles as a `typography` composite, margins, gutters,
baseline rows, columns and radii as `dimension`.

The format holds values, not rules — there is no arithmetic in it and no notion of a format — so the
export says the same thing three ways:

1. **The relationships, in rem off the paragraph size.** The scale already *is* one anchor and its
   multiples, so `1rem` is the anchor: paragraph `1rem`, display `4.236rem`, and every margin,
   row, column and radius in rem too. That part is format-independent.
2. **The anchor, resolved per format, in px.** `format.<name>.anchor` — 13.5px on a 1350 side,
   35.08px on A4, 38.4px on 4K — alongside that format's width, height, margins and row height, and
   which groups it links to the master. Print has no viewport to work them out from, so this is what
   a print pipeline reads.
3. **The rules, under `$extensions`** — where the spec puts what it does not model: the margin
   source and its factor, where the baseline grid comes from, the paragraph basis and percentage,
   both column grids, every solid and block, the background module and its parameters, the colour
   scheme, the font pairing. A generic tool reads `$value` and gets a working system; bos reading
   its own extensions gets the design back.

**The anchor can set itself.** Under the tokens, the same system as **CSS custom properties** with
the anchor computed rather than written down — so a format of any size resolves the whole thing with
nothing regenerated:

| | |
| --- | --- |
| **One format per document** | `:root { font-size: calc(1 * 1vmax) }` — `vmax` is 1% of the viewport's longest side, which is the paragraph rule exactly. Sizes in `rem`. |
| **Several formats on one page** | `.format { container-type: size; --u: calc(1 * 1cqmax) }` and each size is `calc(var(--u) * <its scale>)`. |

Two things make the second form necessary rather than decorative, both measured in a browser rather
than assumed: **`rem` is root-relative**, so an anchor set on a format box does not move it, and **a
container cannot query itself**, so the box hands `--u` to its descendants instead of taking a font
size. On a 1080 × 1350 box that yields 13.5px, on 3840 × 2160 it yields 38.4px — the same numbers
the token file resolves.

## Ask Claude

The system can be **asked for three things**, and **each question sits where its subject is** rather
than in a panel of its own:

| Ask | Where it is |
| --- | --- |
| **A colour scheme** | *Create colour scheme*, under the scheme it would replace |
| **The fonts** | *Typography*, under the roles it would set |
| **A layout for this format** | *Layout*, in the design system's own panel |

Each is the same box — a brief, a button, the answer, Apply or Discard — and the **key, the model
and the endpoint are one setting shared between them**, folded into *Key and connection* at the foot
of each box, so whichever question you are looking at can be set up without going anywhere else.
Type what the design is for and press the button.

What comes back is **the app's own settings** — the controls a designer would have set by hand, not
pixels. A scheme comes back as *one colour, a relationship, a swatch count and where each swatch
goes*, so the harmony maths and the contrast readouts still hold. A layout comes back as *blocks on
rows of a named grid, with real copy*, so it cannot land off the grid or the columns. A pairing comes
back as *a family and a weight for each of the five roles*, every name copied out of the catalogue
the app can load and checked against it before anything is applied — so the answer can be one face,
two, or five. Each answer is shown as JSON with what it cost, and nothing changes until you
press **Apply** — after which **⌘/Ctrl + Z** takes the whole thing back in one step.

The design system travels with the question **as the token file above**, so the answer is in terms of
this system — this format, these margins, this grid, this many columns — rather than a generic one.

Model, and endpoint: **Claude Opus 5** by default, with Sonnet 5 and Haiku 4.5 in the list — set in
any of the three boxes, the same for all. A request is a few thousand tokens in and a few hundred
out — a cent or three at Opus prices, and the box reports the exact count and cost of each one.

### The key

**The key is never in this repository and never in this browser's storage.** It is read from a text
file holding nothing but the key:

- **Choose key.txt…** opens a file picker. In Chromium the *file* is remembered — not its contents —
  so later visits are one click to let the page read it again. Elsewhere it is that session only.
- **Use the key.txt beside the app** appears when the page is served locally, and reads a `key.txt`
  sitting next to `index.html`. Once you have said it is there it is read on every load. `key.txt`
  is in `.gitignore`, and the app only looks for it on `localhost` — the deployed copy never asks
  for a file that would have to be committed to exist.
- **Forget** drops the key and the remembered file.

The key is held for the life of the page, sent to nothing but the endpoint, and never written
anywhere. Keep **a key just for bos** with a **spend limit** on it, so it can be revoked on its own.

**Or hold no key at all:** put a proxy of your own in **Endpoint** — a Worker that keeps the key
server-side — and the browser never sees one. That is also the answer if the API refuses a call
made straight from a page: the request carries the header that asks for direct browser access, and
if that is turned down for your account, a proxy sidesteps it. GitHub Pages serves the app either
way; the proxy is a separate 30-line deploy that Pages knows nothing about.

## The panel

Six groups, in the order the design comes together: **Format** (with background image inside it),
**Logo**, **Page setup** (the margins, the baseline grid and both column grids), **Typography**,
**Layout** (asking Claude for one), **Export** (the slides, then CSS, then the tokens). Neither text
blocks nor solids are among them — both are set on the canvas, beside the thing they belong to, and a solid's panel
carries everything the group used to: where it sits and its anchor, width and height, snapping,
fill, what fills it, and its corners.

## Layout

```
index.html                markup and the panel controls
css/styles.css            UI and canvas styling
js/app.js                 state, geometry, corners, type, rendering, interactions, image generation
img/under-construction.svg  the placeholder the unbuilt stages carry
```

One routine, `paintInto(host, w, h, scale)`, draws the whole design into any element at any format.
The main stage and every preview tile call it, so a preview can never drift from what you are
editing. The geometry helpers read the format from the state, so `withFormat()` swaps it for the
duration of a paint and puts it back.
