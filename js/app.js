/* bos — a small design app.
   A stage with a margin box, an alignable rectangle and a logo circle.
   Every value can be set numerically in the panel or by dragging on the canvas. */
(function () {
  "use strict";

  var CORNERS = ["tl", "tr", "br", "bl"];
  var CORNER_LABELS = { tl: "Top left", tr: "Top right", br: "Bottom right", bl: "Bottom left" };
  var H_KEYS = ["left", "center", "right"];
  var V_KEYS = ["top", "middle", "bottom"];
  var SIDES = ["top", "right", "bottom", "left"];
  var STORAGE_KEY = "bos.design.v19";

  /* Templates for the jobs this gets used for. Each carries a format and the
     scaffolding that suits it — margins, columns and the number of baseline rows —
     so picking one sets up the page, not the contents. */
  var FORMATS = [
    { id: "ig-square", group: "Social", name: "Instagram post", w: 1080, h: 1080,
      margin: 80, cols: 6, gutter: 24, rows: 30 },
    { id: "ig-portrait", group: "Social", name: "Instagram portrait", w: 1080, h: 1350,
      margin: 80, cols: 6, gutter: 24, rows: 39 },
    { id: "story", group: "Social", name: "Story / Reel", w: 1080, h: 1920,
      margin: 90, cols: 6, gutter: 24, rows: 48 },
    { id: "link-card", group: "Social", name: "Link card", w: 1200, h: 628,
      margin: 56, cols: 6, gutter: 20, rows: 16 },
    { id: "x-post", group: "Social", name: "X post", w: 1600, h: 900,
      margin: 72, cols: 8, gutter: 24, rows: 22 },
    { id: "yt-thumb", group: "Social", name: "YouTube thumbnail", w: 1280, h: 720,
      margin: 56, cols: 6, gutter: 20, rows: 16 },

    { id: "leaderboard", group: "Display banners", name: "Leaderboard", w: 728, h: 90,
      margin: 10, cols: 6, gutter: 8, rows: 4 },
    { id: "billboard-ad", group: "Display banners", name: "Billboard banner", w: 970, h: 250,
      margin: 20, cols: 6, gutter: 12, rows: 8 },
    { id: "mrec", group: "Display banners", name: "Medium rectangle", w: 300, h: 250,
      margin: 16, cols: 4, gutter: 8, rows: 9 },
    { id: "half-page", group: "Display banners", name: "Half page", w: 300, h: 600,
      margin: 16, cols: 4, gutter: 8, rows: 22 },
    { id: "skyscraper", group: "Display banners", name: "Wide skyscraper", w: 160, h: 600,
      margin: 12, cols: 2, gutter: 8, rows: 24 },
    { id: "mobile-banner", group: "Display banners", name: "Mobile banner", w: 320, h: 50,
      margin: 8, cols: 4, gutter: 8, rows: 3 },

    { id: "dooh-landscape", group: "Digital billboards", name: "Screen — landscape", w: 1920, h: 1080,
      margin: 96, cols: 8, gutter: 32, rows: 24 },
    { id: "dooh-portrait", group: "Digital billboards", name: "Screen — portrait", w: 1080, h: 1920,
      margin: 80, cols: 6, gutter: 24, rows: 46 },
    { id: "dooh-ultrawide", group: "Digital billboards", name: "Screen — ultra-wide", w: 2880, h: 810,
      margin: 80, cols: 12, gutter: 32, rows: 14 },
    { id: "dooh-4k", group: "Digital billboards", name: "Screen — 4K", w: 3840, h: 2160,
      margin: 180, cols: 12, gutter: 48, rows: 30 },

    { id: "lower-third", group: "Motion graphics", name: "Lower third", w: 1920, h: 1080,
      margin: 120, cols: 12, gutter: 24, rows: 18 },
    { id: "intro", group: "Motion graphics", name: "Intro card", w: 1920, h: 1080,
      margin: 160, cols: 6, gutter: 32, rows: 16 },
    { id: "outro", group: "Motion graphics", name: "Outro card", w: 1920, h: 1080,
      margin: 160, cols: 6, gutter: 32, rows: 20 },
    { id: "motion-vertical", group: "Motion graphics", name: "Vertical cut-down", w: 1080, h: 1920,
      margin: 96, cols: 6, gutter: 24, rows: 44 },

    { id: "book-cover", group: "Book", name: "Cover — A5", w: 1240, h: 1754,
      margin: 100, cols: 6, gutter: 24, rows: 36 },
    { id: "book-text", group: "Book", name: "Inside page — text", w: 1240, h: 1754,
      margin: 140, cols: 1, gutter: 0, rows: 40 },
    { id: "book-image", group: "Book", name: "Inside page — image", w: 1240, h: 1754,
      margin: 70, cols: 2, gutter: 24, rows: 34 },
    { id: "book-imagetext", group: "Book", name: "Inside page — image and text", w: 1240, h: 1754,
      margin: 120, cols: 2, gutter: 40, rows: 38 },
    { id: "a4-print", group: "Book", name: "A4 · 300 dpi", w: 2480, h: 3508,
      margin: 240, cols: 6, gutter: 48, rows: 46 },
    { id: "a5-print", group: "Book", name: "A5 · 150 dpi", w: 1240, h: 1754,
      margin: 120, cols: 6, gutter: 24, rows: 39 }
  ];

  // the aspect of a format, as a ratio when it is a tidy one and a decimal when it is not
  function ratioLabel(w, h) {
    var a = Math.round(w), b = Math.round(h), x = a, y = b, t;
    while (y) { t = y; y = x % y; x = t; }
    var rw = a / x, rh = b / x;
    if (rw <= 32 && rh <= 32) return rw + ":" + rh;
    return w >= h ? round(w / h, 2) + ":1" : "1:" + round(h / w, 2);
  }

  // a curated set that ships with the app; the full catalogue needs a Google Fonts API key
  var GOOGLE_FONTS = [
    "Abril Fatface", "Alegreya", "Alegreya Sans", "Anton", "Archivo", "Archivo Black", "Arimo",
    "Arvo", "Asap", "Assistant", "Barlow", "Barlow Condensed", "Bebas Neue", "Bitter",
    "Bree Serif", "Cabin", "Cairo", "Cardo", "Catamaran", "Caveat", "Chivo", "Cinzel",
    "Comfortaa", "Cormorant Garamond", "Courgette", "Crimson Pro", "Crimson Text",
    "Dancing Script", "DM Sans", "DM Serif Display", "Domine", "Dosis", "EB Garamond",
    "Epilogue", "Exo 2", "Figtree", "Fira Sans", "Fira Code", "Fjalla One", "Frank Ruhl Libre",
    "Fraunces", "Great Vibes", "Heebo", "Hind", "IBM Plex Mono", "IBM Plex Sans",
    "IBM Plex Serif", "Inconsolata", "Indie Flower", "Inter", "JetBrains Mono", "Josefin Sans",
    "Jost", "Kanit", "Karla", "Lato", "Lexend", "Libre Baskerville", "Libre Franklin",
    "Literata", "Lobster", "Lora", "Manrope", "Marcellus", "Merriweather", "Montserrat",
    "Mukta", "Mulish", "Newsreader", "Noto Sans", "Noto Serif", "Nunito", "Nunito Sans",
    "Old Standard TT", "Onest", "Open Sans", "Orbitron", "Oswald", "Outfit", "Overpass",
    "Oxygen", "Pacifico", "Permanent Marker", "Playfair Display", "Plus Jakarta Sans",
    "Poppins", "Prata", "Prompt", "PT Sans", "PT Serif", "Public Sans", "Quicksand", "Raleway",
    "Rajdhani", "Recursive", "Red Hat Display", "Righteous", "Roboto", "Roboto Condensed",
    "Roboto Mono", "Roboto Slab", "Rubik", "Sarabun", "Sora", "Source Code Pro",
    "Source Sans 3", "Source Serif 4", "Space Grotesk", "Space Mono", "Spectral", "Staatliches",
    "Syne", "Teko", "Tinos", "Titillium Web", "Ubuntu", "Ubuntu Mono", "Unbounded", "Urbanist",
    "Varela Round", "Vollkorn", "Work Sans", "Yanone Kaffeesatz", "Zilla Slab"
  ];
  var GF_CACHE_KEY = "bos.gfonts";
  var GF_KEY_STORAGE = "bos.gfonts.key";

  // the type scale is four roles; paragraph is the anchor and the rest are multiples of it
  var ROLES = ["display", "headline", "subline", "paragraph", "smallprint"];
  var ROLE_SEEDS = {
    display: "A display line",
    headline: "Headline goes\nhere",
    subline: "A subline carrying\nthe second thought",
    paragraph: "A supporting line of copy\nthat explains the headline.",
    smallprint: "Small print: terms and credits."
  };
  var ROLE_ROWS = { display: 2, headline: 2, subline: 5, paragraph: 8, smallprint: 1 };
  var ROLE_NAMES = {
    display: "Display", headline: "Headline", subline: "Subline",
    paragraph: "Paragraph", smallprint: "Small print"
  };
  var TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div"];
  var BASES = [
    { id: "height", name: "format height" },
    { id: "long", name: "longest side" },
    { id: "width", name: "format width" }
  ];

  // ratios designers reach for; picking one fills the multipliers in, and every one
  // of them can still be typed over by hand
  var SCALES = [
    { id: "minor2", name: "Minor second — 1.067", r: 1.067 },
    { id: "major2", name: "Major second — 1.125", r: 1.125 },
    { id: "minor3", name: "Minor third — 1.2", r: 1.2 },
    { id: "major3", name: "Major third — 1.25", r: 1.25 },
    { id: "fourth", name: "Perfect fourth — 1.333", r: 4 / 3 },
    { id: "sqrt2", name: "Root two — 1.414", r: Math.SQRT2 },
    { id: "fifth", name: "Perfect fifth — 1.5", r: 1.5 },
    { id: "golden", name: "Golden ratio — 1.618", r: (1 + Math.sqrt(5)) / 2 },
    { id: "sqrt3", name: "Root three — 1.732", r: Math.sqrt(3) },
    { id: "octave", name: "Octave — 2", r: 2 },
    { id: "sqrt5", name: "Root five — 2.236", r: Math.sqrt(5) },
    { id: "silver", name: "Silver ratio — 2.414", r: 1 + Math.SQRT2 },
    { id: "e", name: "Euler's number — 2.718", r: Math.E },
    { id: "pi", name: "Pi — 3.142", r: Math.PI }
  ];
  var SNAPS = [
    { id: "full", name: "Grid 1" },
    { id: "half", name: "Grid 2" },
    { id: "free", name: "Free — as typed" }
  ];
  var FAMILIES = [
    { id: "sans", name: "Sans — system", stack: 'ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif' },
    { id: "serif", name: "Serif", stack: 'ui-serif,Georgia,"Times New Roman",serif' },
    { id: "mono", name: "Monospace", stack: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' },
    { id: "condensed", name: "Condensed", stack: '"Arial Narrow","Helvetica Neue Condensed",Impact,sans-serif' }
  ];
  var KEY_STORAGE = "bos.comfy.key";
  var MIN_SIZE = 1;

  /* Every corner shape border-radius can make, as ready-made values. */
  var CORNER_PRESETS = [
    { id: "sharp", name: "Sharp", value: "0" },
    { id: "r-s", name: "Rounded — small", value: "8px" },
    { id: "r-m", name: "Rounded — medium", value: "24px" },
    { id: "r-l", name: "Rounded — large", value: "56px" },
    { id: "squircle", name: "Squircle — 25%", value: "25%" },
    { id: "pill", name: "Pill / stadium", value: "9999px" },
    { id: "ellipse", name: "Ellipse", value: "50%" },
    { id: "arch-top", name: "Arch — top", value: "50% 50% 0 0 / 100% 100% 0 0" },
    { id: "arch-bottom", name: "Arch — bottom", value: "0 0 50% 50% / 0 0 100% 100%" },
    { id: "arch-left", name: "Arch — left", value: "50% 0 0 50% / 50% 0 0 50%" },
    { id: "arch-right", name: "Arch — right", value: "0 50% 50% 0 / 0 50% 50% 0" },
    { id: "leaf", name: "Leaf", value: "0 40% 0 40%" },
    { id: "leaf-alt", name: "Leaf — mirrored", value: "40% 0 40% 0" },
    { id: "teardrop", name: "Teardrop", value: "50% 50% 50% 0" },
    { id: "egg", name: "Egg", value: "50% 50% 50% 50% / 60% 60% 40% 40%" },
    { id: "blob", name: "Blob", value: "60% 40% 30% 70% / 60% 30% 70% 40%" },
    { id: "wave", name: "Wave", value: "40% 60% 60% 40% / 70% 30% 70% 30%" },
    { id: "notch", name: "One corner only", value: "48px 0 0 0" },
    { id: "diagonal", name: "Two corners — diagonal", value: "48px 0 48px 0" },
    { id: "top-only", name: "Two corners — top", value: "48px 48px 0 0" }
  ];

  /* Shapes border-radius cannot make, cut with clip-path. The four corner values
     drive them: a "cut corner" style uses all four as the legs of the cut, an
     outline shape uses the top-left pair as its one size. */
  function pts(list) {
    return "polygon(" + list.map(function (p) {
      return round(p[0], 2) + "px " + round(p[1], 2) + "px";
    }).join(", ") + ")";
  }
  function arcPath(steps) { return 'path("' + steps.join(" ") + '")'; }
  function at(x, y) { return round(x, 2) + " " + round(y, 2); }
  // a concave quarter turn, or a straight line when the corner has no size
  function scoopTo(r, x, y) {
    return (r.x > 0 && r.y > 0 ? "A " + round(r.x, 2) + " " + round(r.y, 2) + " 0 0 0 " : "L ") + at(x, y);
  }

  var SHAPES = [
    { id: "radius", group: "Rounded", name: "Rounded — border-radius" },

    { id: "bevel", group: "Cut corners", name: "Bevel — straight cut", corner: true,
      fn: function (w, h, c) {
        return pts([[c.tl.x, 0], [w - c.tr.x, 0], [w, c.tr.y], [w, h - c.br.y],
                    [w - c.br.x, h], [c.bl.x, h], [0, h - c.bl.y], [0, c.tl.y]]);
      } },
    { id: "notch", group: "Cut corners", name: "Notch — square step", corner: true,
      fn: function (w, h, c) {
        return pts([[c.tl.x, c.tl.y], [c.tl.x, 0], [w - c.tr.x, 0], [w - c.tr.x, c.tr.y],
                    [w, c.tr.y], [w, h - c.br.y], [w - c.br.x, h - c.br.y], [w - c.br.x, h],
                    [c.bl.x, h], [c.bl.x, h - c.bl.y], [0, h - c.bl.y], [0, c.tl.y]]);
      } },
    { id: "scoop", group: "Cut corners", name: "Scoop — inverted round", corner: true,
      fn: function (w, h, c) {
        return arcPath(["M " + at(c.tl.x, 0), "L " + at(w - c.tr.x, 0), scoopTo(c.tr, w, c.tr.y),
          "L " + at(w, h - c.br.y), scoopTo(c.br, w - c.br.x, h), "L " + at(c.bl.x, h),
          scoopTo(c.bl, 0, h - c.bl.y), "L " + at(0, c.tl.y), scoopTo(c.tl, c.tl.x, 0), "Z"]);
      } },

    { id: "octagon", group: "Outlines", name: "Octagon",
      fn: function (w, h, k, ky) {
        return pts([[k, 0], [w - k, 0], [w, ky], [w, h - ky], [w - k, h], [k, h], [0, h - ky], [0, ky]]);
      } },
    { id: "hexagon", group: "Outlines", name: "Hexagon — points left and right",
      fn: function (w, h, k) { return pts([[k, 0], [w - k, 0], [w, h / 2], [w - k, h], [k, h], [0, h / 2]]); } },
    { id: "hexagon-v", group: "Outlines", name: "Hexagon — points top and bottom",
      fn: function (w, h, k, ky) { return pts([[w / 2, 0], [w, ky], [w, h - ky], [w / 2, h], [0, h - ky], [0, ky]]); } },
    { id: "pentagon", group: "Outlines", name: "Pentagon",
      fn: function (w, h) { return pts([[w / 2, 0], [w, h * .38], [w * .82, h], [w * .18, h], [0, h * .38]]); } },
    { id: "diamond", group: "Outlines", name: "Diamond",
      fn: function (w, h) { return pts([[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]]); } },
    { id: "triangle", group: "Outlines", name: "Triangle",
      fn: function (w, h) { return pts([[w / 2, 0], [w, h], [0, h]]); } },
    { id: "star", group: "Outlines", name: "Star — five points",
      fn: function (w, h) {
        return pts([[.5, 0], [.61, .35], [.98, .35], [.68, .57], [.79, .91],
                    [.5, .7], [.21, .91], [.32, .57], [.02, .35], [.39, .35]]
          .map(function (p) { return [p[0] * w, p[1] * h]; }));
      } },
    { id: "arrow-right", group: "Outlines", name: "Arrow — right",
      fn: function (w, h, k) { return pts([[0, 0], [w - k, 0], [w, h / 2], [w - k, h], [0, h]]); } },
    { id: "arrow-left", group: "Outlines", name: "Arrow — left",
      fn: function (w, h, k) { return pts([[k, 0], [w, 0], [w, h], [k, h], [0, h / 2]]); } },
    { id: "chevron", group: "Outlines", name: "Chevron — right",
      fn: function (w, h, k) { return pts([[0, 0], [w - k, 0], [w, h / 2], [w - k, h], [0, h], [k, h / 2]]); } },
    { id: "banner", group: "Outlines", name: "Banner — notched end",
      fn: function (w, h, k) { return pts([[0, 0], [w, 0], [w - k, h / 2], [w, h], [0, h]]); } },
    { id: "parallelogram", group: "Outlines", name: "Parallelogram",
      fn: function (w, h, k) { return pts([[k, 0], [w, 0], [w - k, h], [0, h]]); } },
    { id: "trapezoid", group: "Outlines", name: "Trapezoid",
      fn: function (w, h, k) { return pts([[k, 0], [w - k, 0], [w, h], [0, h]]); } },
    { id: "trapezoid-down", group: "Outlines", name: "Trapezoid — inverted",
      fn: function (w, h, k) { return pts([[0, 0], [w, 0], [w - k, h], [k, h]]); } },
    { id: "cross", group: "Outlines", name: "Cross",
      fn: function (w, h, k, ky) {
        return pts([[k, 0], [w - k, 0], [w - k, ky], [w, ky], [w, h - ky], [w - k, h - ky],
                    [w - k, h], [k, h], [k, h - ky], [0, h - ky], [0, ky], [k, ky]]);
      } },
    { id: "bubble", group: "Outlines", name: "Speech bubble",
      fn: function (w, h, k, ky) {
        return pts([[0, 0], [w, 0], [w, h - ky], [k * 2, h - ky], [k, h], [k, h - ky], [0, h - ky]]);
      } },
    { id: "ticket", group: "Outlines", name: "Ticket — punched sides",
      fn: function (w, h, k) {
        var r = { x: k, y: k };
        return arcPath(["M 0 0", "L " + at(w, 0), "L " + at(w, h / 2 - k),
          scoopTo(r, w, h / 2 + k), "L " + at(w, h), "L " + at(0, h), "L " + at(0, h / 2 + k),
          scoopTo(r, 0, h / 2 - k), "Z"]);
      } }
  ];

  function shapeDef(id) {
    return SHAPES.filter(function (x) { return x.id === (id || state.rect.shape); })[0] || SHAPES[0];
  }

  var DEFAULT_WORKFLOW =
    '{\n  "3": {\n    "class_type": "KSampler",\n    "inputs": { "seed": {{seed}}, "steps": 25, "cfg": 7,\n' +
    '      "sampler_name": "euler", "scheduler": "normal", "denoise": 1,\n' +
    '      "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0] }\n  },\n' +
    '  "4": { "class_type": "CheckpointLoaderSimple", "inputs": { "ckpt_name": "sd_xl_base_1.0.safetensors" } },\n' +
    '  "5": { "class_type": "EmptyLatentImage", "inputs": { "width": {{width}}, "height": {{height}}, "batch_size": 1 } },\n' +
    '  "6": { "class_type": "CLIPTextEncode", "inputs": { "text": {{prompt}}, "clip": ["4", 1] } },\n' +
    '  "7": { "class_type": "CLIPTextEncode", "inputs": { "text": {{negative}}, "clip": ["4", 1] } },\n' +
    '  "8": { "class_type": "VAEDecode", "inputs": { "samples": ["3", 0], "vae": ["4", 2] } },\n' +
    '  "9": { "class_type": "SaveImage", "inputs": { "filename_prefix": "bos", "images": ["8", 0] } }\n}';

  /* ------------------------------------------------------------------ state */

  function defaults() {
    return {
      v: 19,
      stage: { w: 1080, h: 1350, bg: "#111318", preset: "ig-portrait" },
      bg: { src: "", fit: "cover", opacity: 100 },
      comfy: { endpoint: "", workflow: DEFAULT_WORKFLOW, prompt: "", negative: "", seed: 12345, remember: false },
      // in a logo mode every margin is factor × the logo size, plus a buffer of its own
      // on each side — so the four can differ while sharing the same base
      margin: { mode: "manual", factor: 1, linked: true, locked: true,
        top: 80, right: 80, bottom: 80, left: 80,
        buf: { top: 0, right: 0, bottom: 0, left: 0 } },
      round: true,
      rect: {
        // wmode / hmode: a set size, filling between the margins, filling the whole
        // format edge to edge, or (width only) fitting around the text
        // placed: dragged onto the stage from the tray. visible: drawn with its fill
        placed: false, visible: true, w: 520, h: 360, wmode: "fixed", hmode: "fixed", grid: 2, cols: true,
        align: { h: "left", v: "bottom" }, anchor: { h: "left", v: "bottom" },
        fill: "#4f7cff", shape: "radius", linked: true, elliptical: false,
        corners: {
          tl: { x: 32, ux: "px", y: 32, uy: "px" }, tr: { x: 32, ux: "px", y: 32, uy: "px" },
          br: { x: 32, ux: "px", y: 32, uy: "px" }, bl: { x: 32, ux: "px", y: 32, uy: "px" }
        }
      },
      logo: {
        visible: true,
        // the height drives everything: px, or a share of the format's LONGEST SIDE
        h: { v: 10, u: "%" },
        src: "", aspect: 1,
        align: { h: "left", v: "top" }, anchor: { h: "left", v: "top" },
        fill: "#e6e9ef"
      },
      type: {
        family: "sans",
        basis: "height",        // what the paragraph percentage measures against
        paragraph: 1.5,         // percent of that basis — the anchor of the whole scale
        system: "custom",       // which ratio filled the multipliers in, if any
        rows: 39,               // how many rows grid 1 divides the content height into
        // where grid 1 comes from: "fit" divides the content height into whole rows,
        // "leading" takes the paragraph line height and lets the rows fall where they may
        gridFrom: "fit",
        grid: "both",           // baseline grid on the canvas: off | full | half | both
        // every role is a multiple of the paragraph size; line heights snap to the
        // baseline grid unless a role is set free
        roles: {
          // display is the biggest of them: the golden ratio one step past the headline
          display:    { mult: 4.236, tag: "h1", snap: "full", weight: 700, lh: 1, ls: -0.03, transform: "none", color: "#ffffff" },
          headline:   { mult: 2.618, tag: "h2", snap: "full", weight: 700, lh: 1.05, ls: -0.02, transform: "none", color: "#ffffff" },
          subline:    { mult: 1.618, tag: "h3", snap: "half", weight: 600, lh: 1.2, ls: -0.01, transform: "none", color: "#ffffff" },
          paragraph:  { mult: 1, tag: "p", snap: "fit", weight: 400, lh: 1.5, ls: 0, transform: "none", color: "#ffffff" },
          smallprint: { mult: 0.5, tag: "p", snap: "half", weight: 400, lh: 1.4, ls: 0.02, transform: "none", color: "#ffffff" }
        },
        google: [], uploads: [],
        editing: "headline"
      },
      text: {
        padding: 48,
        // in a box that fills the format, left- and right-aligned text can take the
        // format's own margin on that side instead of the box padding
        marginPad: true,
        // blocks are pulled out of the tray, one per drag and as many as you like.
        // each sits on a row of its own, counted from the top or the bottom edge of
        // the rectangle, so the text travels with the box as it is resized
        blocks: []
      },
      guides: { mode: "auto", color: "#ff2d55" },
      cols: { n: 6, gutter: 24, show: true },
      view: { zoom: null, pan: { x: 0, y: 0 }, panned: false },
      showRail: true,
      showGuides: true,          // one switch for every guide and grid on the canvas
      sel: "rect",
      selBlock: -1               // which text block carries the field handles
    };
  }

  var state = load() || defaults();
  var comfyKey = "";
  try { comfyKey = localStorage.getItem(KEY_STORAGE) || ""; } catch (e) {}

  // uploads are data: URIs and can be large, so give up the heaviest parts first
  // rather than lose the whole design to a full quota
  function save() {
    var copy;
    try { copy = JSON.parse(JSON.stringify(state)); } catch (e) { return; }
    if (/^data:/.test(copy.bg.src)) copy.bg.src = "";     // generated art is never worth the quota
    copy.view = { zoom: null, pan: { x: 0, y: 0 }, panned: false };

    var attempts = [
      function () { return copy; },
      function () { copy.type.uploads = []; return copy; },
      function () { copy.logo.src = ""; copy.logo.aspect = 1; return copy; }
    ];
    for (var i = 0; i < attempts.length; i++) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts[i]()));
        return;
      } catch (e) { /* quota — drop the next heaviest thing and retry */ }
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw), d = defaults();
      if (s.v !== d.v) return null;
      ["stage", "bg", "comfy", "margin", "logo", "view", "text", "guides", "cols"].forEach(function (k) {
        s[k] = Object.assign(d[k], s[k]);
      });
      s.type = Object.assign(d.type, s.type);
      s.type.roles = Object.assign(d.type.roles, s.type.roles);
      if (!Array.isArray(s.text.blocks)) s.text.blocks = [];
      s.text.blocks = s.text.blocks.filter(function (b) { return b && ROLES.indexOf(b.role) >= 0; });
      s.text.blocks.forEach(function (b) {
        if (b.grid !== 1 && b.grid !== 2 && b.grid !== "both") b.grid = "both";
        if (b.from !== "bottom") b.from = "top";
        if (!isFinite(b.padL)) b.padL = 0;
        if (!isFinite(b.padR)) b.padR = 0;
      });
      s.rect = Object.assign(d.rect, s.rect);
      s.rect.corners = Object.assign(d.rect.corners, s.rect.corners);
      if (!s.margin.buf || typeof s.margin.buf !== "object") s.margin.buf = { top: 0, right: 0, bottom: 0, left: 0 };
      SIDES.forEach(function (side) { if (!isFinite(s.margin.buf[side])) s.margin.buf[side] = 0; });
      if (!s.logo.h || typeof s.logo.h !== "object" || !isFinite(s.logo.h.v)) s.logo.h = { v: 10, u: "%" };
      if (!isFinite(s.logo.aspect) || s.logo.aspect <= 0) s.logo.aspect = 1;
      return Object.assign(d, s);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------ utils */

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function round(v, dp) { var f = Math.pow(10, dp || 0); return Math.round(v * f) / f; }
  function num(v, fallback) { var n = parseFloat(v); return isFinite(n) ? n : fallback; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // the one place the "round all values" switch is applied
  function snap(v) { return state.round ? Math.round(v) : round(v, 1); }
  function fmt(v) { return state.round ? Math.round(v) : round(v, 2); }

  function fh(k) { return k === "left" ? 0 : k === "center" ? .5 : 1; }
  function fv(k) { return k === "top" ? 0 : k === "middle" ? .5 : 1; }

  /* ------------------------------------------------- guide contrast colour */

  function hexRgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (!/^[0-9a-f]{6}$/i.test(h)) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }

  function luminance(c) {
    var f = function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }

  // average colour of a background image, once it has been read; null while pending
  var imageColours = {};
  function imageColour(src) {
    if (Object.prototype.hasOwnProperty.call(imageColours, src)) return imageColours[src];
    imageColours[src] = null;
    var img = new Image();
    if (!/^data:/.test(src)) img.crossOrigin = "anonymous";
    img.onload = function () {
      try {
        var n = 24, cv = document.createElement("canvas");
        cv.width = n; cv.height = n;
        var ctx = cv.getContext("2d");
        ctx.drawImage(img, 0, 0, n, n);
        var d = ctx.getImageData(0, 0, n, n).data, r = 0, g = 0, b = 0, count = 0;
        for (var i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 8) continue;                 // ignore transparent pixels
          r += d[i]; g += d[i + 1]; b += d[i + 2]; count++;
        }
        if (count) {
          imageColours[src] = { r: r / count, g: g / count, b: b / count };
          render();
        }
      } catch (e) {
        // a cross-origin image taints the canvas and cannot be read — stay with the stage colour
      }
    };
    img.src = src;
    return null;
  }

  // what the guides actually sit on: the stage colour, with any image blended over it
  function backdropColour() {
    var base = hexRgb(state.stage.bg), bg = state.bg;
    if (!bg.src) return base;
    var over = imageColour(bg.src) || { r: 128, g: 128, b: 128 };   // assume mid grey until it is read
    var a = clamp(bg.opacity / 100, 0, 1);
    return {
      r: base.r * (1 - a) + over.r * a,
      g: base.g * (1 - a) + over.g * a,
      b: base.b * (1 - a) + over.b * a
    };
  }

  // white and black swap over at this luminance — the point where both contrast equally
  var CONTRAST_PIVOT = Math.sqrt(1.05 * 0.05) - 0.05;

  function guideColour() {
    if (state.guides.mode === "manual") return state.guides.color;
    return luminance(backdropColour()) > CONTRAST_PIVOT ? "#101318" : "#ffffff";
  }

  /* --------------------------------------------------------------- geometry */

  // percentages throughout the app are a share of the format's longest side,
  // so a design keeps its proportions whichever way the format turns
  function longSide() { return Math.max(state.stage.w, state.stage.h); }

  function lenPx(len) {
    return len.u === "%" ? len.v / 100 * longSide() : len.v;
  }

  // the logo is defined by its height; the width follows the artwork's aspect ratio.
  // sized in columns it is the other way round: the width spans the columns and the
  // height follows, so the artwork keeps its proportions either way
  function logoSize() {
    var lg = state.logo, h;
    if (lg.h.u === "col") {
      var w = Math.max(MIN_SIZE, colSpan(lg.h.v));
      return { w: w, h: Math.max(MIN_SIZE, w / (lg.aspect || 1)) };
    }
    h = Math.max(MIN_SIZE, lenPx(lg.h));
    return { w: Math.max(MIN_SIZE, h * (lg.aspect || 1)), h: h };
  }

  function setLogoHeightPx(px) {
    var len = state.logo.h;
    if (len.u === "col") {                       // dragging writes back in columns too
      len.v = Math.max(0.1, round(colsAcross(px * (state.logo.aspect || 1)), 2));
      return;
    }
    var v = len.u === "%" ? px / Math.max(1, longSide()) * 100 : px;
    len.v = Math.max(state.round ? 1 : 0.1, snap(v));
  }

  function setLogoUnit(u) {
    var len = state.logo.h, sz = logoSize(), px = sz.h;
    len.u = u;
    len.v = u === "col" ? Math.max(0.1, round(colsAcross(sz.w), 2))
      : Math.max(state.round ? 1 : 0.1, snap(u === "%" ? px / Math.max(1, longSide()) * 100 : px));
  }

  function buf(side) {
    var b = state.margin.buf;
    return b && isFinite(b[side]) ? b[side] : 0;
  }

  // what the logo rule gives every side before its own buffer is added
  function marginBase() {
    var m = state.margin;
    if (m.mode === "manual") return 0;
    // a logo sized in columns is measured from the columns, which are measured from
    // these margins — so the two are solved together rather than chasing each other
    if (state.logo.h.u === "col") return baseFromColumnLogo();
    return m.factor * (m.mode === "logoH" ? logoSize().h : logoSize().w);
  }

  function margins() {
    var m = state.margin;
    if (m.mode === "manual") return { top: m.top, right: m.right, bottom: m.bottom, left: m.left };
    var base = marginBase(), out = {};
    SIDES.forEach(function (side) { out[side] = Math.max(0, snap(base + buf(side))); });
    return out;
  }

  // base = factor x logo, where the logo spans n of the columns that the margins —
  // base plus the left and right buffers — leave room for. One equation, one unknown.
  function baseFromColumnLogo() {
    var m = state.margin, W = state.stage.w;
    var k = Math.max(1, Math.round(state.cols.n)), g = Math.max(0, state.cols.gutter);
    var n = Math.max(0.1, state.logo.h.v);
    var fe = m.factor / (m.mode === "logoH" ? (state.logo.aspect || 1) : 1);
    var A = fe * n / k;
    var v = (A * (W - buf("left") - buf("right") - (k - 1) * g) + fe * (n - 1) * g) / (1 + 2 * A);
    return clamp(v, 0, W / 2 - MIN_SIZE);
  }

  // the box the shapes are aligned inside: the format inset by the margins
  function content() {
    var m = margins(), s = state.stage;
    return {
      x: m.left, y: m.top,
      w: Math.max(MIN_SIZE, s.w - m.left - m.right),
      h: Math.max(MIN_SIZE, s.h - m.top - m.bottom)
    };
  }

  // the row height of grid 1 or grid 2
  function gridUnit(which) {
    return which === 1 ? baseline() : baseline() / 2;
  }

  // the box the text stack is painted into: the rectangle when there is one, the
  // margin box when there is not
  function textFrame() {
    return state.rect.placed ? box("rect") : content();
  }

  // which lines a block may sit on: grid 1 is the full rows, grid 2 the half lines
  // between them, and "both" every line of either grid
  function blockUnit(b) { return b.grid === "both" ? baseline() / 2 : baseline(); }
  function blockShift(b) { return b.grid === 2 ? baseline() / 2 : 0; }
  function gridLabel(g) { return g === "both" ? "both grids" : "grid " + g; }

  // rows are counted from the margin box, not from the rectangle, so a block only
  // moves when the page moves. What rides along with the rectangle is decided by
  // where a block sits (see carryBlocks), not by the coordinates it is stored in
  function rowOrigin(b) {
    var c = content(), u = blockUnit(b), shift = blockShift(b);
    var edge = b.from === "bottom" ? c.y + c.h : c.y;
    return snapUnit(edge, u) + (b.from === "bottom" ? -shift : shift);
  }

  // y of a block's row, counted from the top or the bottom margin
  function rowY(b) {
    var u = blockUnit(b);
    return rowOrigin(b) + (b.from === "bottom" ? -b.row * u : b.row * u);
  }

  // the row a y position falls on, the other way round
  function rowAt(y, b) {
    var d = y - rowOrigin(b);
    return Math.round((b.from === "bottom" ? -d : d) / blockUnit(b));
  }

  // the nearest line of a grid of that step, measured from the top margin
  function snapUnit(y, unit) {
    var top = margins().top;
    return top + Math.round((y - top) / unit) * unit;
  }

  // the nearest grid line to a y position, for the rectangle's own grid
  function snapY(y, which) { return snapUnit(y, gridUnit(which)); }

  function sizeOf(name) {
    if (name === "logo") return logoSize();
    var c = content(), u = gridUnit(state.rect.grid), r = state.rect, st = state.stage;
    var w = r.wmode === "format" ? st.w : r.wmode === "full" ? c.w
      : r.wmode === "fit" ? minRectW() : r.w;
    // the text sets the floor: it is never narrower than its longest line and the padding
    w = Math.max(MIN_SIZE, w, minRectW());
    // a filled width already ends on an edge of its own, so only a set one is snapped
    if (r.cols && (r.wmode === "fixed" || r.wmode === "fit")) w = snapCols(w);

    // a filled height runs to the margin or the format edge; otherwise it stands a
    // whole number of rows tall
    var h = r.hmode === "format" ? st.h : r.hmode === "full" ? c.h
      : Math.max(u, Math.round(r.h / u) * u);
    return { w: w, h: Math.max(MIN_SIZE, h) };
  }

  // anchor point of the shape lands on the aligned point of the content box
  // the widest line of text, measured on the main stage and reused by every preview
  var textW = 0;

  function box(name) {
    var el = state[name], c = content(), s = sizeOf(name);
    var y = c.y + c.h * fv(el.align.v) - s.h * fv(el.anchor.v);
    var x = c.x + c.w * fh(el.align.h) - s.w * fh(el.anchor.h);
    // and its top edge sits on a grid line, its left edge on a column line
    if (name === "rect") {
      if (state.rect.hmode === "format") y = 0;
      else if (state.rect.hmode === "full") y = c.y;
      else y = snapY(y, state.rect.grid);
      if (state.rect.wmode === "format") x = 0;
      else if (state.rect.cols) x = c.x + Math.round((x - c.x) / colStep()) * colStep();
    }
    return { x: x, y: y, w: s.w, h: s.h };
  }

  // clicking or dragging a shape to a new position also moves its anchor,
  // as long as the two were still in step — set the anchor by hand to decouple them
  function setAlign(name, h, v) {
    var el = state[name];
    var mh = el.anchor.h === el.align.h, mv = el.anchor.v === el.align.v;
    el.align = { h: h, v: v };
    if (mh) el.anchor.h = h;
    if (mv) el.anchor.v = v;
  }

  // the content box divided into columns with a gutter between them
  function colWidth() {
    var c = state.cols, w = content().w;
    return Math.max(1, (w - Math.max(0, c.n - 1) * c.gutter) / Math.max(1, c.n));
  }
  function colCount() { return Math.max(1, Math.round(state.cols.n)); }
  function colStep() { return colWidth() + Math.max(0, state.cols.gutter); }
  // a span of n columns, gutters included — n need not be whole: 1.5 columns is a
  // column, a gutter and half a column
  function colSpan(k) {
    var n = Math.max(0, k);
    return n <= 0 ? 0 : n * colWidth() + (n - 1) * Math.max(0, state.cols.gutter);
  }

  // how many columns a width spans, the inverse of colSpan
  function colsAcross(w) {
    var g = Math.max(0, state.cols.gutter);
    return Math.max(0.1, (w + g) / (colWidth() + g));
  }

  // the width the text needs: its longest line plus the padding on both sides
  function minRectW() {
    return textVisible() ? Math.max(MIN_SIZE, textW + state.text.padding * 2) : MIN_SIZE;
  }

  // every width whose right edge lands on a column line: the right edge of a column,
  // or — a gutter further on — the left edge of the next one
  function colWidths() {
    var n = colCount(), g = Math.max(0, state.cols.gutter), out = [], k;
    for (k = 1; k <= n; k++) {
      out.push(colSpan(k));
      if (k < n) out.push(colSpan(k) + g);
    }
    return out;
  }

  // the nearest of those — never one too narrow for the text
  function snapCols(w) {
    var min = minRectW();
    var wide = colWidths().filter(function (v) { return v >= min - 0.01; });
    if (!wide.length) return w;               // wider than the whole grid: the text wins
    return wide.reduce(function (best, v) {
      return Math.abs(v - w) < Math.abs(best - w) - 0.001 ? v : best;
    }, wide[0]);
  }

  /* ---------------------------------------------------------- corner radius */

  function cornerDim(axis) { var s = sizeOf("rect"); return axis === "x" ? s.w : s.h; }

  function cornerPx(name, axis) {
    var c = state.rect.corners[name];
    var v = axis === "x" ? c.x : c.y, u = axis === "x" ? c.ux : c.uy;
    return u === "%" ? v / 100 * cornerDim(axis) : v;
  }

  function setCornerPx(name, axis, px) {
    var c = state.rect.corners[name];
    var u = axis === "x" ? c.ux : c.uy, dim = cornerDim(axis);
    var v = Math.max(0, snap(u === "%" ? (dim ? px / dim * 100 : 0) : px));
    if (axis === "x") c.x = v; else c.y = v;
    if (!state.rect.elliptical) {
      if (axis === "x") { c.y = c.x; c.uy = c.ux; } else { c.x = c.y; c.ux = c.uy; }
    }
  }

  function eachCorner(name, fn) { (state.rect.linked ? CORNERS : [name]).forEach(fn); }

  function radiusCSS(pxScale) {
    var s = pxScale || 1, cs = state.rect.corners;
    var one = function (v, u) { return (u === "%" ? round(v, 2) : round(v * s, 2)) + u; };
    var hx = CORNERS.map(function (n) { return one(cs[n].x, cs[n].ux); });
    var vy = CORNERS.map(function (n) { return one(cs[n].y, cs[n].uy); });
    var same = function (a) { return a.every(function (v) { return v === a[0]; }); };
    var side = function (a) { return same(a) ? a[0] : a.join(" "); };
    return same(hx) && same(vy) && hx[0] === vy[0] ? hx[0] : side(hx) + " / " + side(vy);
  }

  // the corner sizes in rendered pixels, never past the middle of the box
  function cutSizes(w, h, pxScale) {
    var out = {};
    CORNERS.forEach(function (n) {
      out[n] = {
        x: clamp(cornerPx(n, "x") * pxScale, 0, w / 2),
        y: clamp(cornerPx(n, "y") * pxScale, 0, h / 2)
      };
    });
    return out;
  }

  // the clip-path for the chosen shape, built at the size it is drawn
  function clipCSS(pxScale) {
    var def = shapeDef();
    if (!def.fn) return "none";
    var sz = sizeOf("rect"), s = pxScale || 1, w = sz.w * s, h = sz.h * s;
    if (w <= 0 || h <= 0) return "none";
    if (def.corner) return def.fn(w, h, cutSizes(w, h, s));
    var c = cutSizes(w, h, s);
    return def.fn(w, h, c.tl.x, c.tl.y);
  }

  function parseRadius(text) {
    var halves = String(text).trim().toLowerCase().split("/");
    if (halves.length > 2) return null;
    var part = function (p) {
      var tokens = p.trim().split(/\s+/).filter(Boolean);
      if (!tokens.length || tokens.length > 4) return null;
      var out = tokens.map(function (t) {
        var m = /^(\d*\.?\d+)(px|%)?$/.exec(t);
        return m ? { v: parseFloat(m[1]), u: m[2] || "px" } : null;
      });
      if (out.some(function (o) { return !o; })) return null;
      if (out.length === 1) out = [out[0], out[0], out[0], out[0]];
      else if (out.length === 2) out = [out[0], out[1], out[0], out[1]];
      else if (out.length === 3) out = [out[0], out[1], out[2], out[1]];
      return out;
    };
    var h = part(halves[0]);
    if (!h) return null;
    var v = halves.length === 2 ? part(halves[1]) : h;
    if (!v) return null;
    var elliptical = false, corners = {};
    CORNERS.forEach(function (n, i) {
      corners[n] = { x: h[i].v, ux: h[i].u, y: v[i].v, uy: v[i].u };
      if (h[i].v !== v[i].v || h[i].u !== v[i].u) elliptical = true;
    });
    return { corners: corners, elliptical: elliptical };
  }

  // which preset, if any, the current corners match
  function matchedPreset() {
    var now = radiusCSS(1);
    var hit = CORNER_PRESETS.filter(function (p) {
      var parsed = parseRadius(p.value);
      if (!parsed) return false;
      var before = state.rect.corners;
      state.rect.corners = parsed.corners;
      var as = radiusCSS(1);
      state.rect.corners = before;
      return as === now;
    })[0];
    return hit ? hit.id : "";
  }

  /* --------------------------------------------------------------- the view */

  var els = {};
  function cacheEls() {
    els.viewport = $("#viewport"); els.stage = $("#stage"); els.frame = $("#frame");
    els.guides = $("#guides"); els.cells = $("#cells"); els.cssOut = $("#css-out");
    els.blockFrame = $("#block-frame");
    els.overlay = $("#overlay"); els.railList = $("#rail-list"); els.baseline = $("#baseline");
    els.columns = $("#columns");
    els.readout = $("#readout"); els.zoomValue = $("#zoom-value"); els.shorthand = $("#radius-shorthand");
  }

  function viewSize() {
    return { w: els.viewport.clientWidth, h: els.viewport.clientHeight };
  }

  function fitScale() {
    var v = viewSize(), pad = 80;
    return Math.min((Math.max(80, v.w - pad)) / state.stage.w, (Math.max(80, v.h - pad)) / state.stage.h);
  }

  function scale() { return state.view.zoom || fitScale(); }

  function centerPan(s) {
    var v = viewSize();
    return { x: (v.w - state.stage.w * s) / 2, y: (v.h - state.stage.h * s) / 2 };
  }

  function pan() {
    return state.view.panned ? state.view.pan : centerPan(scale());
  }

  function setZoom(z, focus) {
    var old = scale(), p = pan();
    var next = z ? clamp(z, .02, 16) : null;
    if (!next) { state.view.zoom = null; state.view.panned = false; render(); return; }
    var s = clamp(next, .02, 16);
    if (focus) {
      state.view.pan = { x: focus.x - (focus.x - p.x) * (s / old), y: focus.y - (focus.y - p.y) * (s / old) };
      state.view.panned = true;
    }
    state.view.zoom = s;
    render();
  }

  // pointer position in stage units
  function toStage(ev) {
    var r = els.stage.getBoundingClientRect(), s = scale();
    return { x: (ev.clientX - r.left) / s, y: (ev.clientY - r.top) / s };
  }

  /* -------------------------------------------------------------- rendering */

  // run fn as if the format were fw x fh — every geometry helper reads state.stage,
  // so this is what lets one paint routine serve the main stage and every preview
  function withFormat(fw, fh, fn) {
    var w = state.stage.w, h = state.stage.h;
    state.stage.w = fw; state.stage.h = fh;
    try { return fn(); } finally { state.stage.w = w; state.stage.h = h; }
  }

  function shapeStyle(name, s) {
    var b = box(name);
    return { left: b.x * s + "px", top: b.y * s + "px", width: b.w * s + "px", height: b.h * s + "px" };
  }

  function child(host, key, tag, className) {
    var el = host["_" + key];
    if (!el || el.parentNode !== host) {
      el = document.createElement(tag || "div");
      el.className = className || "";
      host.appendChild(el);
      host["_" + key] = el;
    }
    return el;
  }

  var FALLBACK = 'ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';

  function familyStack() {
    var id = state.type.family || "sans";
    if (id.indexOf("g:") === 0 || id.indexOf("u:") === 0) {
      return '"' + id.slice(2).replace(/"/g, "") + '",' + FALLBACK;
    }
    var f = FAMILIES.filter(function (x) { return x.id === id; })[0];
    return (f || FAMILIES[0]).stack;
  }

  function familyLabel() {
    var id = state.type.family || "sans";
    if (id.indexOf("g:") === 0) return id.slice(2) + " (Google)";
    if (id.indexOf("u:") === 0) return id.slice(2) + " (uploaded)";
    var f = FAMILIES.filter(function (x) { return x.id === id; })[0];
    return (f || FAMILIES[0]).name;
  }

  // Google fonts arrive as a stylesheet; ask for the usual weights and fall back
  // to the family's default if it does not publish them
  var googleLinks = {};
  function loadGoogleFont(name) {
    if (googleLinks[name]) return;
    var href = function (withWeights) {
      return "https://fonts.googleapis.com/css2?family=" +
        encodeURIComponent(name).replace(/%20/g, "+") +
        (withWeights ? ":ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,400" : "") +
        "&display=swap";
    };
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href(true);
    link.onerror = function () {
      var plain = document.createElement("link");
      plain.rel = "stylesheet";
      plain.href = href(false);
      document.head.appendChild(plain);
    };
    document.head.appendChild(link);
    googleLinks[name] = link;
  }

  function registerUpload(u) {
    if (!window.FontFace || !u || !u.src) return;
    try {
      var face = new FontFace(u.name, 'url("' + u.src + '")');
      face.load().then(function (f) { document.fonts.add(f); render(); }, function () {});
    } catch (e) {}
  }

  /* ------------------------------------------------ the type scale and grid */

  function typeBasis() {
    var b = state.type.basis;
    return b === "long" ? longSide() : b === "width" ? state.stage.w : state.stage.h;
  }

  // the anchor: paragraph size in format pixels
  function paraPx() {
    return Math.max(1, state.type.paragraph / 100 * typeBasis());
  }

  function rolePx(role) {
    return Math.max(1, paraPx() * (state.type.roles[role].mult || 1));
  }

  // the height the grid has to fill: the format minus the top and bottom margins
  function contentH() {
    var m = margins();
    return Math.max(1, state.stage.h - m.top - m.bottom);
  }

  function fromLeading() { return state.type.gridFrom === "leading"; }

  // the paragraph line box, which is what grid 1 measures in the leading mode
  function leadingPx() {
    return Math.max(1, paraPx() * clamp(state.type.roles.paragraph.lh, 0.5, 6));
  }

  // how many rows grid 1 is divided into when it fits the content height
  function fitRows() {
    return clamp(Math.round(state.type.rows), 1, 400);
  }

  // grid 1 is one row; grid 2 halves it
  function baseline() {
    return fromLeading() ? leadingPx() : contentH() / fitRows();
  }

  // whole rows of grid 1 in the content box — every one of them in the fit mode, and
  // as many as happen to fit when the leading sets the row
  function gridRows() {
    return fromLeading()
      ? Math.max(1, Math.floor(contentH() / leadingPx() + 1e-6))
      : fitRows();
  }

  // what is left over at the foot of the content box when the leading sets the grid
  function gridRest() {
    return fromLeading() ? contentH() - gridRows() * leadingPx() : 0;
  }

  // the row height is the paragraph line height by default; set it free to type your
  // own, and in the leading mode the typed one is the row
  function paraLh() {
    var p = state.type.roles.paragraph;
    if (fromLeading()) return p.lh;
    return p.snap === "free" ? p.lh : baseline() / paraPx();
  }

  function setRows(rows) {
    state.type.rows = clamp(Math.round(rows), 1, 400);
  }

  function roleUnit(role) {
    return state.type.roles[role].snap === "half" ? baseline() / 2 : baseline();
  }

  // how many grid rows a role's line box occupies
  function roleSteps(role) {
    var r = state.type.roles[role];
    if (role === "paragraph" || r.snap === "free") return null;
    var unit = roleUnit(role), size = rolePx(role);
    // never round down into a line box shorter than the type itself
    return Math.max(1, Math.ceil(size / unit), Math.round(size * r.lh / unit));
  }

  // a role's line height, snapped so its line box is a whole number of grid rows
  function roleLh(role) {
    var r = state.type.roles[role];
    if (role === "paragraph") return paraLh();
    if (r.snap === "free") return r.lh;
    return roleSteps(role) * roleUnit(role) / rolePx(role);
  }

  function applyScale(id) {
    var sys = SCALES.filter(function (x) { return x.id === id; })[0];
    if (!sys) return;
    var r = state.type.roles;
    r.display.mult = round(sys.r * sys.r * sys.r, 3);
    r.headline.mult = round(sys.r * sys.r, 3);
    r.subline.mult = round(sys.r, 3);
    r.paragraph.mult = 1;
    r.smallprint.mult = round(1 / sys.r, 3);
    state.type.system = id;
  }

  // is any text on the stage at all
  function textVisible() {
    return state.text.blocks.some(function (b) { return b.text.trim(); });
  }

  // where a role's baseline sits inside its own box, in format units. measured on the
  // main stage (see placeBlocks) and reused everywhere, since it scales with the type
  var blOffset = {};
  function baselineInBox(role) {
    if (blOffset[role] > 0) return blOffset[role];
    var size = rolePx(role);
    return (size * roleLh(role) - size) / 2 + size * 0.8;      // close enough for one frame
  }

  // the text block being typed into on the canvas, or -1
  var editing = -1, pressedBlock = -1;

  function startEditing(i) {
    if (editing === i) return;
    editing = i;
    render();
    requestAnimationFrame(function () {
      var el = els.stage.querySelector('.tb[data-i="' + i + '"]');
      if (!el) return;
      el.focus();
      var sel = window.getSelection();
      if (sel && el.lastChild) {
        var r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
      }
    });
  }

  function stopEditing() {
    if (editing < 0) return;
    var el = els.stage.querySelector('.tb[data-i="' + editing + '"]');
    if (el) el.blur();
    editing = -1;
    var stack = liveStack();
    if (stack) stack.dataset.sig = "";        // rebuild, which restores the baseline probe
    render();
  }

  // a block belongs to the rectangle only while it sits inside it: that is what makes
  // it travel with the box and take the box padding. Everywhere else — above it, below
  // it, or with no rectangle at all — a block lines up on the columns
  function blockInside(b) {
    if (!state.rect.placed) return false;
    var r = box("rect"), y = rowY(b);
    return y >= r.y - 0.5 && y <= r.y + r.h + 0.5;
  }

  function blockOutside(b) { return !blockInside(b); }

  // the nearest column line — either edge of any column — to an offset measured from
  // the left margin
  function colLine(off) {
    var n = colCount(), step = colStep(), w = colWidth(), cw = content().w;
    var best = 0, bd = Infinity, k, cands = [cw];
    for (k = 0; k < n; k++) cands.push(k * step, k * step + w);
    cands.forEach(function (v) {
      var d = Math.abs(v - off);
      if (d < bd) { bd = d; best = v; }
    });
    return clamp(best, 0, cw);
  }

  // what a block insets from the sides of the stack it is painted in
  function blockInsets(b) {
    var t = state.text, sp = sidePad(b.align);
    if (!blockOutside(b)) return { l: sp.l + (b.padL || 0), r: sp.r + (b.padR || 0) };
    var c = content(), f = textFrame();
    var stackL = f.x + t.padding, stackR = f.x + f.w - t.padding;
    var left = c.x + colLine(b.padL || 0);
    var right = c.x + colLine(c.w - (b.padR || 0));
    if (right - left < colWidth()) right = Math.min(c.x + c.w, left + colWidth());
    return { l: left - stackL, r: stackR - right };
  }

  // in a box that fills the format, text aligned to a side can hang on the format's own
  // margin instead of the box padding — the padding still holds the other side
  function sidePad(align) {
    var t = state.text, m = margins();
    if (!t.marginPad || state.rect.wmode !== "format") return { l: 0, r: 0 };
    return {
      l: align === "left" ? m.left - t.padding : 0,
      r: align === "right" ? m.right - t.padding : 0
    };
  }

  function paintText(rectEl, s) {
    var t = state.text;
    var blocks = t.blocks.filter(function (b) { return b.text.trim(); });
    var stack = child(rectEl, "text", "div", "text-stack");
    if (!blocks.length) { stack.hidden = true; return; }
    stack.hidden = false;

    var sig = blocks.map(function (b) {
      return b.role + "\u0000" + state.type.roles[b.role].tag + "\u0000" + b.text;
    }).join("\u0001");
    // rebuilding the stack would take the caret with it, so the block being typed
    // into keeps its own node — the DOM already holds what was typed
    var typing = editing >= 0 && rectEl.parentNode === els.stage;
    if (typing) stack.dataset.sig = sig;
    if (stack.dataset.sig !== sig) {
      stack.dataset.sig = sig;
      stack.innerHTML = "";
      blocks.forEach(function (b) {
        var el = document.createElement(state.type.roles[b.role].tag || "p");
        el.className = "tb " + b.role;
        el.textContent = b.text;
        // a zero-sized inline-block aligns to the baseline of the line it sits in,
        // which makes the first baseline directly measurable
        var probe = document.createElement("span");
        probe.className = "bl-probe";
        el.insertBefore(probe, el.firstChild);
        el._probe = probe;
        stack.appendChild(el);
      });
    }
    Object.assign(stack.style, { inset: t.padding * s + "px", fontFamily: familyStack() });

    var origin = textFrame().y + t.padding;                    // top of the stack, in format units
    Array.prototype.forEach.call(stack.children, function (el, i) {
      var b = blocks[i], st = state.type.roles[b.role], ins = blockInsets(b);
      el.dataset.i = t.blocks.indexOf(b);
      Object.assign(el.style, {
        top: (rowY(b) - baselineInBox(b.role) - origin) * s + "px",
        marginLeft: ins.l * s + "px",
        marginRight: ins.r * s + "px",
        // a field drawn in by hand wraps inside itself; one that fills the column
        // keeps to the line breaks that were typed
        whiteSpace: (b.padL || b.padR) ? "pre-wrap" : "pre",
        fontSize: rolePx(b.role) * s + "px",
        fontWeight: st.weight,
        lineHeight: roleLh(b.role),
        letterSpacing: st.ls + "em",
        textTransform: st.transform,
        color: st.color,
        textAlign: b.align
      });
      var edit = rectEl.parentNode === els.stage && editing === +el.dataset.i;
      if (edit !== (el.getAttribute("contenteditable") === "true")) {
        if (edit) el.setAttribute("contenteditable", "true");
        else el.removeAttribute("contenteditable");
      }
      el.classList.toggle("editing", edit);
      el.classList.toggle("picked", rectEl.parentNode === els.stage && state.selBlock === +el.dataset.i);
    });
  }

  // pull each block so its first baseline lands exactly on the row it was given, and
  // remember how far the baseline sits inside the box so the next paint starts there
  function placeBlocks(stack, s) {
    if (!stack || stack.hidden) return;
    var blocks = state.text.blocks.filter(function (b) { return b.text.trim(); });
    var kids = Array.prototype.slice.call(stack.children);
    if (kids.length !== blocks.length) return;

    var stageTop = els.stage.getBoundingClientRect().top;
    var widest = 0;
    var reads = kids.map(function (el, i) {
      var probe = el._probe || el.querySelector(".bl-probe");
      if (!probe) return null;
      var r = el.getBoundingClientRect();
      // a range around the text reports the widest line, whatever the box is doing
      try {
        var range = document.createRange();
        range.selectNodeContents(el);
        widest = Math.max(widest, range.getBoundingClientRect().width / s);
      } catch (e) {}
      return {
        top: parseFloat(el.style.top) || 0,
        boxTop: r.top - stageTop,
        baseline: probe.getBoundingClientRect().bottom - stageTop,
        target: rowY(blocks[i]) * s
      };
    });
    if (widest > 0 && Math.abs(widest - textW) > 0.5) {
      // the box is never narrower than its text, so a new measurement can resize it.
      // nothing wraps, so the measurement does not depend on the box: this settles at once
      textW = widest;
      render();
    } else if (widest > 0) textW = widest;
    reads.forEach(function (r, i) {
      if (!r) return;
      blOffset[blocks[i].role] = (r.baseline - r.boxTop) / s;
      kids[i].style.top = r.top + (r.target - r.baseline) + "px";
    });
  }

  // draw the whole design into host at format fw x fh, scaled by s
  function paintInto(host, fw, fh, s) {
    withFormat(fw, fh, function () {
      host.style.width = fw * s + "px";
      host.style.height = fh * s + "px";
      host.style.background = state.stage.bg;

      var image = child(host, "image", "div", "stage-image");
      var bg = state.bg;
      if (bg.src) {
        Object.assign(image.style, {
          display: "block",
          backgroundImage: 'url("' + bg.src.replace(/"/g, '\\"') + '")',
          backgroundSize: bg.fit === "stretch" ? "100% 100%" : bg.fit === "tile" ? "auto" : bg.fit,
          backgroundRepeat: bg.fit === "tile" ? "repeat" : "no-repeat",
          backgroundPosition: "center",
          opacity: bg.opacity / 100
        });
      } else { image.style.display = "none"; }

      var rectEl = child(host, "rect", "div", "shape rect");
      rectEl.dataset.el = "rect";
      rectEl.hidden = !state.rect.placed;
      if (state.rect.placed) {
        var shaped = state.rect.shape !== "radius";
        Object.assign(rectEl.style, shapeStyle("rect", s), {
          background: state.rect.visible ? state.rect.fill : "transparent",
          borderRadius: shaped ? "0" : radiusCSS(s),
          clipPath: shaped ? clipCSS(s) : "none"
        });
      }

      // without a rectangle the text runs in the margin box instead, in a layer of its own
      var free = child(host, "free", "div", "text-free");
      free.hidden = state.rect.placed || !textVisible();
      if (!free.hidden) {
        var c = content();
        Object.assign(free.style, {
          left: c.x * s + "px", top: c.y * s + "px",
          width: c.w * s + "px", height: c.h * s + "px"
        });
      }
      var textHost = state.rect.placed ? rectEl : free;
      var idle = state.rect.placed ? free : rectEl;
      if (idle._text) { idle.removeChild(idle._text); idle._text = null; }   // one stack at a time
      if (!textHost.hidden) paintText(textHost, s);

      var logoEl = child(host, "logo", "div", "shape logo");
      logoEl.dataset.el = "logo";
      logoEl.hidden = !state.logo.visible;
      if (state.logo.visible) {
        var lg = state.logo;
        logoEl.classList.toggle("has-image", !!lg.src);
        Object.assign(logoEl.style, shapeStyle("logo", s));
        if (lg.src) {
          logoEl.style.background = 'center / contain no-repeat url("' + lg.src.replace(/"/g, '\\"') + '")';
        } else {
          logoEl.style.background = lg.fill;
        }
      }
    });
  }

  // the text stack in play: inside the rectangle, or in the free layer
  function liveStack() {
    var r = els.stage._rect, f = els.stage._free;
    return (r && r._text) || (f && f._text) || null;
  }

  function renderStage() {
    carryBlocks();
    document.body.classList.toggle("rail-open", !!state.showRail);
    var s = scale(), p = pan(), st = state.stage;
    paintInto(els.stage, st.w, st.h, s);
    Object.assign(els.stage.style, { left: p.x + "px", top: p.y + "px" });
    Object.assign(els.overlay.style, {
      width: st.w * s + "px", height: st.h * s + "px", left: p.x + "px", top: p.y + "px"
    });

    var show = state.showGuides !== false;
    els.guides.hidden = !show;
    els.guides.style.setProperty("--guide", guideColour());
    var m = margins();
    els.guides.querySelector("[data-side=top]").style.top = m.top * s + "px";
    els.guides.querySelector("[data-side=bottom]").style.top = (st.h - m.bottom) * s + "px";
    els.guides.querySelector("[data-side=left]").style.left = m.left * s + "px";
    els.guides.querySelector("[data-side=right]").style.left = (st.w - m.right) * s + "px";

    renderBaseline(s);
    renderColumns(s);
    placeBlocks(liveStack(), s);
    renderFrame(s);
    renderBlockFrame();
    renderRail();
    renderTray();
    els.zoomValue.textContent = Math.round(s * 100) + "%";
    renderReadout();
  }

  // the baseline grid: paragraph line boxes, drawn down the margin box from its top edge
  function renderBaseline(s) {
    var mode = state.showGuides === false ? "off" : state.type.grid;
    var unit = baseline() * s, m = margins();
    var c = hexRgb(guideColour());
    var rgba = function (a) {
      return "rgba(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + "," + a + ")";
    };
    var line = function (step, alpha) {
      return "repeating-linear-gradient(to bottom," + rgba(alpha) + " 0 1px,transparent 1px " + step + "px)";
    };
    var both = mode === "both";
    var layers = [];
    // below a few pixels a step reads as hatching rather than a grid, so it drops out
    if ((mode === "full" || both) && unit >= 4) layers.push(line(unit, 0.24));
    if ((mode === "half" || both) && unit / 2 >= 5) layers.push(line(unit / 2, both ? 0.1 : 0.22));

    els.baseline.hidden = mode === "off" || !layers.length;
    if (els.baseline.hidden) return;
    Object.assign(els.baseline.style, {
      top: m.top * s + "px",
      left: m.left * s + "px",
      right: m.right * s + "px",
      height: contentH() * s + "px",
      backgroundImage: layers.join(",")
    });
  }

  // the column grid, drawn across the content box
  function renderColumns(s) {
    var c = state.cols, m = margins();
    els.columns.hidden = !c.show || c.n < 1 || state.showGuides === false;
    if (els.columns.hidden) return;
    var col = colWidth() * s, gut = c.gutter * s;
    var rgb = hexRgb(guideColour());
    var tint = "rgba(" + Math.round(rgb.r) + "," + Math.round(rgb.g) + "," + Math.round(rgb.b) + ",0.09)";
    Object.assign(els.columns.style, {
      left: m.left * s + "px",
      top: m.top * s + "px",
      width: content().w * s + "px",
      height: contentH() * s + "px",
      backgroundImage: col >= 1
        ? "repeating-linear-gradient(to right," + tint + " 0 " + col + "px,transparent " +
          col + "px " + (col + gut) + "px)"
        : "none"
    });
  }

  /* ------------------------------------------------ the format preview rail */

  var TILE = { w: 116, h: 132 };

  // templates share formats, so the rail shows each size once
  function railFormats() {
    var seen = {}, list = [];
    FORMATS.forEach(function (f) {
      var key = f.w + "x" + f.h;
      if (seen[key]) return;
      seen[key] = true;
      list.push({ id: key, name: f.name, w: f.w, h: f.h });
    });
    var id = fmt(state.stage.w) + "x" + fmt(state.stage.h);
    if (!seen[id]) list.unshift({ id: id, name: "Custom", w: state.stage.w, h: state.stage.h, custom: true });
    return list;
  }

  function renderRail() {
    var host = els.railList;
    if (!host || !state.showRail) return;

    var list = railFormats();
    var sig = list.map(function (f) { return f.id; }).join(",");
    if (host.dataset.sig !== sig) {
      host.dataset.sig = sig;
      host.innerHTML = list.map(function (f) {
        return '<button type="button" class="tile" data-w="' + f.w + '" data-h="' + f.h + '">' +
          '<span class="tile-box"><span class="tile-stage"></span></span>' +
          '<span class="tile-name">' + esc(f.name) + "</span>" +
          '<span class="tile-size">' + fmt(f.w) + " × " + fmt(f.h) + "</span></button>";
      }).join("");
    }
    var active = fmt(state.stage.w) + "x" + fmt(state.stage.h);
    Array.prototype.forEach.call(host.children, function (btn, i) {
      var f = list[i];
      btn.setAttribute("aria-pressed", f.id === active ? "true" : "false");
      var s = Math.min(TILE.w / f.w, TILE.h / f.h);
      paintInto(btn.querySelector(".tile-stage"), f.w, f.h, s);
    });
  }

  function frameHandles(name) {
    var sizes = name === "logo" ? ["nw", "ne", "se", "sw"]
      : ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    var html = sizes.map(function (d) { return '<span class="handle size" data-dir="' + d + '"></span>'; }).join("");
    if (name === "rect") {
      html += CORNERS.map(function (c) {
        return '<span class="handle radius" data-corner="' + c + '" title="Drag to round this corner"></span>';
      }).join("");
    }
    return html;
  }

  var frameFor = null;
  function renderFrame(s) {
    var name = state.sel;
    // the handles are part of the furniture: hiding the guides hides them too
    var on = name === "rect" ? state.rect.placed : name && state[name] && state[name].visible;
    var shown = on && state.showGuides !== false;
    els.frame.hidden = !shown;
    if (!shown) { frameFor = null; return; }
    var key = name;
    if (frameFor !== key) { els.frame.innerHTML = frameHandles(name); frameFor = key; }

    var b = box(name);
    Object.assign(els.frame.style, shapeStyle(name, s));
    els.frame.classList.toggle("full-width", name === "rect" && state.rect.wmode !== "fixed");
    els.frame.classList.toggle("round", name === "logo" && !state.logo.src);

    var pos = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
    $$("#frame .handle.size").forEach(function (el) {
      var p = pos[el.dataset.dir];
      el.style.left = b.w * s * p[0] + "px";
      el.style.top = b.h * s * p[1] + "px";
    });
    $$("#frame .handle.radius").forEach(function (el) {
      var n = el.dataset.corner;
      var rx = clamp(cornerPx(n, "x") * s, 14, Math.max(14, b.w * s / 2));
      var ry = clamp(cornerPx(n, "y") * s, 14, Math.max(14, b.h * s / 2));
      el.style.left = (n === "tl" || n === "bl" ? rx : b.w * s - rx) + "px";
      el.style.top = (n === "tl" || n === "tr" ? ry : b.h * s - ry) + "px";
    });
  }

  // the field around the selected block, measured straight off the element
  function renderBlockFrame() {
    var i = state.selBlock, el = i >= 0 && els.stage.querySelector('.tb[data-i="' + i + '"]');
    var shown = !!el && state.showGuides !== false;
    els.blockFrame.hidden = !shown;
    if (!shown) return;
    var r = el.getBoundingClientRect(), st = els.stage.getBoundingClientRect();
    Object.assign(els.blockFrame.style, {
      left: r.left - st.left + "px", top: r.top - st.top + "px",
      width: r.width + "px", height: r.height + "px"
    });
    var size = els.blockFrame.querySelector(".bhandle.size");
    size.style.left = r.width + "px";
    size.style.top = r.height + "px";
    els.blockFrame.querySelector('[data-bdir="w"]').style.left = "0px";
    els.blockFrame.querySelector('[data-bdir="e"]').style.left = r.width + "px";
    var kill = els.blockFrame.querySelector(".bhandle.kill");
    kill.style.left = r.width + "px";
    kill.style.top = "0px";
  }

  function renderCells(name) {
    var s = scale(), c = content(), sz = sizeOf(name), el = state[name];
    els.cells.innerHTML = V_KEYS.map(function (v) {
      return H_KEYS.map(function (h) {
        var x = c.x + c.w * fh(h) - sz.w * fh(el.anchor.h) + sz.w / 2;
        var y = c.y + c.h * fv(v) - sz.h * fv(el.anchor.v) + sz.h / 2;
        var on = el.align.h === h && el.align.v === v;
        return '<span class="cell' + (on ? " on" : "") + '" style="left:' + x * s + "px;top:" + y * s + 'px"></span>';
      }).join("");
    }).join("");
  }

  // everything that has not been pulled onto the stage yet
  function renderTray() {
    var items = [];
    if (!state.rect.placed) items.push({ id: "rect", kind: "shape", name: "Rectangle" });
    ROLES.forEach(function (r) {
      items.push({ id: "role:" + r, kind: "text", name: ROLE_NAMES[r] });   // as many as you like
    });
    var html = items.map(function (it) {
      return '<button type="button" class="chip" data-place="' + it.id + '" data-kind="' + it.kind +
        '" title="Drag onto the stage, or click to drop it in place">' + esc(it.name) + "</button>";
    }).join("");
    $("#tray-items").innerHTML = html || '<span class="tray-empty">Everything is on the stage.</span>';
    $("#tray-hint").textContent = "Drag one onto the stage — it snaps to the grid as it lands. " +
      "Let go outside the format to leave it here. A text block can be pulled out as often as you like; " +
      "the ✕ on a block takes it off again.";
  }

  function renderReadout() {
    var m = margins(), parts = [
      "Format " + fmt(state.stage.w) + " × " + fmt(state.stage.h),
      "Margins " + fmt(m.top) + " / " + fmt(m.right) + " / " + fmt(m.bottom) + " / " + fmt(m.left) +
        (state.margin.mode !== "manual" ? " (logo " + (state.margin.mode === "logoH" ? "height" : "width") +
          " × " + state.margin.factor + ")" : "")
    ];
    if (state.rect.placed) {
      var b = box("rect");
      parts.push("Rectangle " + fmt(b.w) + " × " + fmt(b.h) + " — " + state.rect.align.v + " " + state.rect.align.h);
    }
    var onStage = state.text.blocks.length;
    if (onStage) parts.push(onStage + (onStage === 1 ? " text block" : " text blocks"));
    if (state.logo.visible) {
      var lg = state.logo, lb = box("logo");
      parts.push("Logo " + fmt(lb.w) + " × " + fmt(lb.h) +
        (lg.h.u === "%" ? " (h " + round(lg.h.v, 2) + "% of long side)" : "") +
        " — " + lg.align.v + " " + lg.align.h);
    }
    els.readout.textContent = parts.join("   ·   ");
  }

  /* ------------------------------------------------------------ CSS output */

  function positionCSS(name, indent) {
    var el = state[name], b = box(name), m = margins(), out = [], tx = null, ty = null;
    var full = name === "rect" && state.rect.wmode === "full";

    // the rectangle lands on the baseline grid and on a column line, so its edges are
    // written out as they are measured rather than as margins that would round elsewhere
    if (name === "rect") {
      if (state.rect.wmode === "format") { out.push("left: 0"); out.push("right: 0"); }
      else if (full) {
        out.push("left: " + fmt(m.left) + "px");
        out.push("right: " + fmt(m.right) + "px");
      } else {
        out.push("left: " + fmt(b.x) + "px");
        out.push("width: " + fmt(b.w) + "px");
      }
      if (state.rect.hmode === "format") { out.push("top: 0"); out.push("bottom: 0"); }
      else if (state.rect.hmode === "full") {
        out.push("top: " + fmt(m.top) + "px");
        out.push("bottom: " + fmt(m.bottom) + "px");
      } else {
        out.push("top: " + fmt(b.y) + "px");
        out.push("height: " + fmt(b.h) + "px");
      }
      return out.map(function (l) { return indent + l + ";"; }).join("\n");
    }

    if (el.align.h === "left" && el.anchor.h === "left") out.push("left: " + fmt(m.left) + "px");
    else if (el.align.h === "right" && el.anchor.h === "right") out.push("right: " + fmt(m.right) + "px");
    else if (el.align.h === "center" && el.anchor.h === "center") { out.push("left: 50%"); tx = "-50%"; }
    else out.push("left: " + fmt(b.x) + "px");

    if (el.align.v === "top" && el.anchor.v === "top") out.push("top: " + fmt(m.top) + "px");
    else if (el.align.v === "bottom" && el.anchor.v === "bottom") out.push("bottom: " + fmt(m.bottom) + "px");
    else if (el.align.v === "middle" && el.anchor.v === "middle") { out.push("top: 50%"); ty = "-50%"; }
    else out.push("top: " + fmt(b.y) + "px");

    out.push("width: " + fmt(b.w) + "px");
    out.push("height: " + fmt(b.h) + "px");
    if (tx || ty) out.push("transform: translate(" + (tx || "0") + ", " + (ty || "0") + ")");
    return out.map(function (l) { return indent + l + ";"; }).join("\n");
  }

  function renderCSS() {
    var st = state.stage, bg = state.bg, m = margins(), lines = [];
    lines.push(".stage {");
    lines.push("  position: relative;");
    lines.push("  width: " + fmt(st.w) + "px;");
    lines.push("  height: " + fmt(st.h) + "px;");
    lines.push("  background: " + st.bg + ";");
    if (bg.src) {
      lines.push("  background-image: url(\"" + (/^data:/.test(bg.src) ? "…generated image…" : bg.src) + "\");");
      lines.push("  background-size: " + (bg.fit === "stretch" ? "100% 100%" : bg.fit === "tile" ? "auto" : bg.fit) + ";");
      lines.push("  background-position: center;");
      if (bg.fit !== "tile") lines.push("  background-repeat: no-repeat;");
    }
    lines.push("  overflow: hidden;");
    lines.push("  /* margins " + fmt(m.top) + " " + fmt(m.right) + " " + fmt(m.bottom) + " " + fmt(m.left) +
      (state.margin.mode !== "manual"
        ? " — logo " + (state.margin.mode === "logoH" ? "height" : "width") + " × " + state.margin.factor
        : "") + " */");
    lines.push("}");
    if (state.rect.placed) {
      lines.push("");
      lines.push(".rectangle {");
      lines.push("  position: absolute;");
      lines.push(positionCSS("rect", "  "));
      if (state.rect.shape === "radius") {
        lines.push("  border-radius: " + radiusCSS(1) + ";");
      } else {
        lines.push("  clip-path: " + clipCSS(1) + ";");
        lines.push("  /* " + shapeDef().name + ", cut at this size — the points are in px */");
      }
      lines.push("  background: " + state.rect.fill + ";");
      lines.push("}");
    }
    if (state.logo.visible) {
      lines.push("");
      lines.push(".logo {");
      lines.push("  position: absolute;");
      lines.push(positionCSS("logo", "  "));
      var lg = state.logo;
      if (lg.src) {
        lines.push("  background: center / contain no-repeat url(\"" +
          (/^data:/.test(lg.src) ? "…your logo file…" : lg.src) + "\");");
      } else {
        lines.push("  border-radius: 50%;");
        lines.push("  background: " + lg.fill + ";");
      }
      if (lg.h.u === "%") {
        lines.push("  /* height " + round(lg.h.v, 2) + "% of the " + fmt(longSide()) +
          "px long side; width follows the " + round(lg.aspect, 3) + ":1 artwork */");
      }
      lines.push("}");
    }
    var t = state.text, used = t.blocks.filter(function (b) { return b.text.trim(); });
    if (used.length) {
      lines.push("");
      if (state.type.family.indexOf("g:") === 0) {
        var gname = state.type.family.slice(2);
        lines.push("@import url(\"https://fonts.googleapis.com/css2?family=" +
          gname.replace(/ /g, "+") + ":ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,400&display=swap\");");
      } else if (state.type.family.indexOf("u:") === 0) {
        lines.push("/* @font-face for \"" + state.type.family.slice(2) + "\" — ship the uploaded file yourself */");
      }
      var TX = state.rect.placed ? ".rectangle .text" : ".stage .text";
      lines.push(TX + " {");
      lines.push("  position: absolute;");
      // inside the rectangle the padding is the whole inset; on the stage the margins
      // carry it, since the text is running in the margin box
      lines.push("  inset: " + (state.rect.placed
        ? fmt(t.padding) + "px"
        : SIDES.map(function (side) { return fmt(m[side] + t.padding); }).join("px ") + "px") + ";");
      lines.push("  font-family: " + familyStack() + ";");
      lines.push("}");
      lines.push("");
      lines.push(TX + " > * { position: absolute; left: 0; right: 0; margin: 0; white-space: pre; }");
      var origin = textFrame().y + t.padding;
      used.forEach(function (b, i) {
        var sp = blockInsets(b);
        lines.push(TX + " > :nth-child(" + (i + 1) + ") { top: " +
          round(rowY(b) - baselineInBox(b.role) - origin, 2) + "px;" +
          (round(sp.l, 2) ? " margin-left: " + round(sp.l, 2) + "px;" : "") +
          (round(sp.r, 2) ? " margin-right: " + round(sp.r, 2) + "px;" : "") + " }" +
          (blockOutside(b) ? "  /* on the columns, outside the box */" : "") +
          "  /* baseline on row " + b.row + " of " + gridLabel(b.grid) +
          ", counted from the " + (b.from === "bottom" ? "bottom" : "top") + " margin */");
      });
      lines.push("/* grid 1: " + round(baseline(), 3) + "px a row — " + (fromLeading()
        ? "the paragraph line box, " + gridRows() + " whole rows in the " + round(contentH(), 2) +
          "px content height with " + round(gridRest(), 2) + "px over"
        : gridRows() + " rows filling the " + round(contentH(), 2) + "px content height") +
        "; grid 2 halves it at " + round(baseline() / 2, 3) + "px */");

      var roles = [];
      used.forEach(function (b) { if (roles.indexOf(b.role) < 0) roles.push(b.role); });
      ROLES.filter(function (r) { return roles.indexOf(r) >= 0; }).forEach(function (r) {
        var st = state.type.roles[r], size = rolePx(r), lh = roleLh(r), steps = roleSteps(r);
        lines.push("");
        lines.push(TX + " ." + r + " {");
        lines.push("  font-size: " + round(size, 2) + "px;" +
          (r === "paragraph"
            ? "  /* " + round(state.type.paragraph, 3) + "% of the " + basisLabel() + " */"
            : "  /* " + round(st.mult, 3) + " × paragraph */"));
        lines.push("  line-height: " + round(lh, 4) + ";" +
          (r === "paragraph"
            ? "  /* one row of grid 1 = " + round(size * lh, 3) + "px */"
            : steps ? "  /* " + round(size * lh, 2) + "px = " + steps + " × grid " +
              (st.snap === "half" ? "2" : "1") + " */" : ""));
        lines.push("  font-weight: " + st.weight + ";");
        lines.push("  letter-spacing: " + round(st.ls, 3) + "em;");
        if (st.transform !== "none") lines.push("  text-transform: " + st.transform + ";");
        lines.push("  color: " + st.color + ";");
        lines.push("}");
      });

      var aligns = [];
      used.forEach(function (b) { if (aligns.indexOf(b.align) < 0) aligns.push(b.align); });
      lines.push("");
      aligns.forEach(function (a) {
        lines.push(TX + " .align-" + a + " { text-align: " + a + "; }");
      });
    }
    els.cssOut.textContent = lines.join("\n");
    renderMarkup(used);
  }

  function basisLabel() {
    var b = BASES.filter(function (x) { return x.id === state.type.basis; })[0];
    return (b || BASES[0]).name + " (" + fmt(typeBasis()) + "px)";
  }

  function renderMarkup(used) {
    var out = ['<div class="stage">'];
    var inner = [], pad = state.rect.placed ? "    " : "  ";
    var text = [];
    if (used.length) {
      text.push(pad + '<div class="text">');
      used.forEach(function (b) {
        var tag = state.type.roles[b.role].tag || "p";
        text.push(pad + '  <' + tag + ' class="' + b.role + " align-" + b.align + '">' +
          esc(b.text) + "</" + tag + ">");
      });
      text.push(pad + "</div>");
    }
    if (state.rect.placed) {
      inner.push('  <div class="rectangle">');
      inner = inner.concat(text);
      inner.push("  </div>");
    } else {
      inner = inner.concat(text);       // text on its own runs in the margin box
    }
    if (state.logo.visible) inner.push('  <div class="logo"></div>');
    $("#markup-out").textContent = out.concat(inner, ["</div>"]).join("\n");
  }

  var shorthandTyping = false;
  var pending = null;
  function render() {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      pending = null;
      syncPanel();
      renderStage();
      renderCSS();
      save();
      recordHistory();
    });
  }

  /* ------------------------------------------------------------------ undo */

  // a burst of changes — a drag, a run of keystrokes — settles into one step
  var past = [], future = [], histTimer = null, lastSnap = null, restoring = false;
  var HISTORY_MAX = 80, HISTORY_QUIET = 400;

  function snapshot() {
    try { return JSON.stringify(state); } catch (e) { return null; }
  }

  function recordHistory() {
    if (restoring) return;
    clearTimeout(histTimer);
    histTimer = setTimeout(function () {
      var now = snapshot();
      if (!now || now === lastSnap) return;
      if (lastSnap !== null) {
        past.push(lastSnap);
        if (past.length > HISTORY_MAX) past.shift();
        future.length = 0;
      }
      lastSnap = now;
      syncHistoryButtons();
    }, HISTORY_QUIET);
  }

  // fold a change that has not settled yet into the stack, so undo never skips it
  function settleHistory() {
    clearTimeout(histTimer);
    var now = snapshot();
    if (now && lastSnap !== null && now !== lastSnap) {
      past.push(now === lastSnap ? now : lastSnap);
      if (past.length > HISTORY_MAX) past.shift();
      lastSnap = now;
      future.length = 0;
    }
    return now;
  }

  function restore(json) {
    restoring = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    state = JSON.parse(json);
    lastSnap = json;
    buildFamilySelect();
    buildTextBlocks();
    blOffset = {};
    frameFor = null;
    lastBox = null;              // an undone move must not drag the text along with it
    render();
    requestAnimationFrame(function () { restoring = false; syncHistoryButtons(); });
  }

  function undo() {
    var now = settleHistory();
    if (!past.length) return;
    if (now) future.push(now);
    restore(past.pop());
  }

  function redo() {
    if (!future.length) return;
    var now = snapshot();
    if (now) past.push(now);
    restore(future.pop());
  }

  function syncHistoryButtons() {
    var u = $("#undo"), r = $("#redo");
    if (u) u.disabled = !past.length;
    if (r) r.disabled = !future.length;
  }

  /* ------------------------------------------------------------- the panel */

  function buildCornerRows() {
    $("#corners").innerHTML = CORNERS.map(function (n) {
      return '<div class="corner-row" data-corner="' + n + '">' +
        "<span>" + CORNER_LABELS[n] + "</span>" +
        '<input type="number" min="0" step="1" data-radius="' + n + '" data-axis="x">' +
        '<select data-unit="' + n + '" data-axis="x"><option>px</option><option>%</option></select>' +
        '<input type="number" min="0" step="1" class="axis-y" data-radius="' + n + '" data-axis="y">' +
        '<select class="axis-y" data-unit="' + n + '" data-axis="y"><option>px</option><option>%</option></select>' +
        "</div>";
    }).join("");
  }

  function buildShapeSelect() {
    var groups = [];
    SHAPES.forEach(function (sh) { if (groups.indexOf(sh.group) < 0) groups.push(sh.group); });
    $("#corner-shape").innerHTML = groups.map(function (g) {
      return '<optgroup label="' + esc(g) + '">' +
        SHAPES.filter(function (sh) { return sh.group === g; }).map(function (sh) {
          return '<option value="' + sh.id + '">' + esc(sh.name) + "</option>";
        }).join("") + "</optgroup>";
    }).join("");
  }

  function buildPresetSelect() {
    $("#corner-preset").innerHTML = '<option value="">Custom…</option>' +
      CORNER_PRESETS.map(function (p) {
        return '<option value="' + p.id + '">' + esc(p.name) + "</option>";
      }).join("");
  }

  function buildFormatSelect() {
    var groups = [];
    FORMATS.forEach(function (f) { if (groups.indexOf(f.group) < 0) groups.push(f.group); });
    $("#stage-preset").innerHTML = '<option value="">Custom…</option>' +
      groups.map(function (g) {
        return '<optgroup label="' + esc(g) + '">' +
          FORMATS.filter(function (f) { return f.group === g; }).map(function (f) {
            return '<option value="' + f.id + '">' + esc(f.name) + " — " + f.w + " × " + f.h +
              " · " + ratioLabel(f.w, f.h) + "</option>";
          }).join("") + "</optgroup>";
      }).join("");
  }

  function formatById(id) {
    return FORMATS.filter(function (f) { return f.id === id; })[0] || null;
  }

  // a template sets the format and the scaffolding that suits it; the elements stay
  // in the tray, so nothing that was already drawn is thrown away
  function applyFormat(f) {
    state.stage.w = f.w; state.stage.h = f.h; state.stage.preset = f.id;
    if (isFinite(f.margin)) {
      state.margin.mode = "manual";
      SIDES.forEach(function (side) { state.margin[side] = f.margin; });
    }
    if (isFinite(f.cols)) state.cols.n = f.cols;
    if (isFinite(f.gutter)) state.cols.gutter = f.gutter;
    if (isFinite(f.rows)) setRows(f.rows);
  }

  function buildFamilySelect() {
    var opt = function (v, label) { return '<option value="' + esc(v) + '">' + esc(label) + "</option>"; };
    var html = "<optgroup label=\"System\">" +
      FAMILIES.map(function (f) { return opt(f.id, f.name); }).join("") + "</optgroup>";
    if (state.type.google.length) {
      html += "<optgroup label=\"Google\">" +
        state.type.google.map(function (n) { return opt("g:" + n, n); }).join("") + "</optgroup>";
    }
    if (state.type.uploads.length) {
      html += "<optgroup label=\"Uploaded\">" +
        state.type.uploads.map(function (u) { return opt("u:" + u.name, u.name); }).join("") + "</optgroup>";
    }
    $("#type-family").innerHTML = html;
  }

  function gfList() {
    try {
      var raw = localStorage.getItem(GF_CACHE_KEY);
      var all = raw ? JSON.parse(raw) : null;
      if (Array.isArray(all) && all.length) return all;
    } catch (e) {}
    return GOOGLE_FONTS;
  }

  function buildGoogleList() {
    var all = gfList();
    $("#gf-list").innerHTML = all.map(function (n) {
      return '<option value="' + esc(n) + '"></option>';
    }).join("");
    $("#gf-count").textContent = all.length + " families listed" +
      (all === GOOGLE_FONTS || all.length === GOOGLE_FONTS.length ? " — the set bundled with the app." : " — loaded from Google.");
  }

  function buildTypeSelects() {
    buildFamilySelect();
    buildGoogleList();
    $("#type-level").innerHTML = ROLES.map(function (r) {
      return '<option value="' + r + '">' + esc(ROLE_NAMES[r]) + "</option>";
    }).join("");
    $("#type-basis").innerHTML = BASES.map(function (b) {
      return '<option value="' + b.id + '">' + esc(b.name) + "</option>";
    }).join("");
    $("#type-tag").innerHTML = TAGS.map(function (t) {
      return '<option value="' + t + '">&lt;' + t + "&gt;</option>";
    }).join("");
    $("#type-snap").innerHTML = SNAPS.map(function (x) {
      return '<option value="' + x.id + '">' + esc(x.name) + "</option>";
    }).join("");
    $("#type-system").innerHTML = '<option value="custom">Custom — set by hand</option>' +
      SCALES.map(function (x) { return '<option value="' + x.id + '">' + esc(x.name) + "</option>"; }).join("");
    $("#type-scale").innerHTML = ROLES.map(function (r) {
      return '<div class="scale-row' + (r === "paragraph" ? " anchor" : "") + '" data-role="' + r + '">' +
        "<span>" + esc(ROLE_NAMES[r]) + "</span>" +
        (r === "paragraph"
          ? '<span class="px anchor-note">anchor × 1</span>'
          : '<input type="number" min="0.01" step="0.01" data-mult="' + r + '">') +
        '<span class="px" data-px="' + r + '"></span></div>';
    }).join("");
  }

  function buildTextBlocks() {
    if (!state.text.blocks.length) {
      $("#text-blocks").innerHTML =
        '<p class="hint">No text on the stage yet — drag a block out of the tray above the canvas. ' +
        "Pull one out as often as you like; each is its own block.</p>";
      return;
    }
    $("#text-blocks").innerHTML = state.text.blocks.map(function (b, i) {
      return '<div class="block" data-i="' + i + '">' +
        '<div class="block-head">' +
          '<span class="block-n">Block ' + (i + 1) + "</span>" +
          '<select data-block="role" class="level">' +
            ROLES.map(function (r) { return '<option value="' + r + '">' + esc(ROLE_NAMES[r]) + "</option>"; }).join("") +
          "</select>" +
          '<button type="button" class="x" data-block="remove" title="Take this block off the stage">✕</button>' +
        "</div>" +
        '<textarea data-block="text" rows="2" spellcheck="false"></textarea>' +
        '<div class="block-row">' +
          "<span>Field</span>" +
          '<input type="number" min="0" step="1" data-block="padL" title="Inset from the left">' +
          '<input type="number" min="0" step="1" data-block="padR" title="Inset from the right">' +
          '<span class="px" data-fieldw="' + i + '"></span>' +
        "</div>" +
        '<div class="block-row">' +
          "<span>Row</span>" +
          '<input type="number" step="1" data-block="row">' +
          '<select data-block="grid"><option value="1">Grid 1</option>' +
            '<option value="2">Grid 2</option><option value="both">Both grids</option></select>' +
          '<select data-block="from"><option value="top">from the top</option>' +
            '<option value="bottom">from the bottom</option></select>' +
        "</div>" +
        '<div class="seg" data-block="align">' +
          ["left", "center", "right"].map(function (a) {
            return '<button type="button" data-align="' + a + '">' + a[0].toUpperCase() + a.slice(1) + "</button>";
          }).join("") +
        "</div>" +
      "</div>";
    }).join("");
  }

  function buildGrid(id, name, kind) {
    $(id).innerHTML = V_KEYS.map(function (v) {
      return H_KEYS.map(function (h) {
        return '<button type="button" data-el="' + name + '" data-kind="' + kind + '" data-h="' + h + '" data-v="' + v +
          '" title="' + v + " " + h + '" aria-label="' + v + " " + h + '"></button>';
      }).join("");
    }).join("");
  }

  function setValue(el, value) {
    if (el && document.activeElement !== el && el.value !== String(value)) el.value = value;
  }

  function syncGrid(id, el) {
    $$(id + " button").forEach(function (b) {
      var on = b.dataset.kind === "align"
        ? (b.dataset.h === el.align.h && b.dataset.v === el.align.v)
        : (b.dataset.h === el.anchor.h && b.dataset.v === el.anchor.v);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function syncPanel() {
    var st = state.stage, m = state.margin, r = state.rect, lg = state.logo;

    setValue($("#stage-w"), fmt(st.w));
    setValue($("#stage-h"), fmt(st.h));
    $("#stage-bg").value = st.bg;
    var preset = $("#stage-preset");
    preset.value = st.preset || "";
    if (preset.selectedIndex < 0) preset.selectedIndex = 0;
    $("#stage-ratio").textContent = ratioLabel(st.w, st.h) +
      (st.preset && formatById(st.preset) ? " · " + formatById(st.preset).group.toLowerCase() : " · custom");
    $("#round-values").checked = state.round;

    setValue($("#bg-url"), /^data:/.test(state.bg.src) ? "" : state.bg.src);
    $("#bg-url").placeholder = /^data:/.test(state.bg.src) ? "— uploaded / generated image —" : "https://…";
    $("#bg-fit").value = state.bg.fit;
    setValue($("#bg-opacity"), state.bg.opacity);
    $("#bg-opacity-val").textContent = state.bg.opacity + "%";

    setValue($("#cf-endpoint"), state.comfy.endpoint);
    setValue($("#cf-key"), comfyKey);
    setValue($("#cf-workflow"), state.comfy.workflow);
    setValue($("#cf-prompt"), state.comfy.prompt);
    setValue($("#cf-negative"), state.comfy.negative);
    setValue($("#cf-seed"), state.comfy.seed);
    $("#cf-remember").checked = state.comfy.remember;

    $("#margin-mode").value = m.mode;
    $("#margin-factor-field").hidden = m.mode === "manual";
    setValue($("#margin-factor"), m.factor);
    $("#margin-linked").checked = m.linked;
    var mm = margins(), derived = m.mode !== "manual";
    var SIDE_NAMES = { top: "Top", right: "Right", bottom: "Bottom", left: "Left" };
    SIDES.forEach(function (s) {
      // set by hand the fields are the margins themselves; derived they are the
      // buffer each side adds to the shared base
      setValue($("#margin-" + s), fmt(derived ? buf(s) : mm[s]));
      $("#margin-" + s).disabled = false;
      $('[data-mlabel="' + s + '"]').textContent =
        SIDE_NAMES[s] + (derived ? " + " + fmt(mm[s]) : "");
    });
    var gm = state.guides.mode, gc = guideColour();
    $("#guide-mode").value = gm;
    $("#guide-color").value = gm === "manual" ? state.guides.color : gc;
    $("#guide-color").disabled = gm === "auto";
    $("#guide-hint").textContent = gm === "auto"
      ? "Following the background: " + gc.toUpperCase() + " on " +
        (state.bg.src ? "the background image" : state.stage.bg.toUpperCase()) + "."
      : "Fixed at " + state.guides.color.toUpperCase() + ".";

    $("#margin-hint").textContent = m.mode === "manual"
      ? "The margins define the box both shapes are aligned inside."
      : "Every side starts from " + m.factor + " × the logo " +
        (m.mode === "logoH" ? "height" : "width") + " = " + round(marginBase(), 2) +
        ", and each field above adds its own buffer to that: " +
        SIDES.map(function (s) { return fmt(mm[s]); }).join(" / ") +
        " top, right, bottom, left. Dragging a guide moves that side's buffer.";

    $("#rect-placed").checked = r.placed;
    $("#rect-visible").checked = r.visible;
    $("#rect-placed-hint").textContent = r.placed
      ? "Text inside the box takes its padding and travels with it; anything above or below it " +
        "keeps to the columns and stays where it is."
      : "Not on the stage — drag it out of the tray above the canvas. Text runs on the columns " +
        "in the margin box without it.";
    syncGrid("#rect-align", r); syncGrid("#rect-anchor", r);
    $("#rect-grid").value = String(r.grid);
    var rb = box("rect");
    $("#rect-grid-hint").textContent = r.hmode !== "fixed"
      ? "Height " + round(rb.h, 2) + " — filling " +
        (r.hmode === "format" ? "the format from edge to edge" : "the space between the top and bottom margins") +
        ", so it is not snapped to the grid."
      : "Height " + fmt(r.h) + " runs as " + round(rb.h, 2) + " — " +
        Math.round(rb.h / gridUnit(r.grid)) + " rows of grid " + r.grid + " — and the top edge sits on row " +
        round((rb.y - margins().top) / gridUnit(r.grid), 2) + ".";
    $("#margin-locked").checked = !!state.margin.locked;
    $("#rect-wmode").value = r.wmode;
    $("#rect-hmode").value = r.hmode;
    $("#rect-h").disabled = r.hmode !== "fixed";
    $("#rect-w").disabled = r.wmode !== "fixed";
    setValue($("#rect-w"), fmt(sizeOf("rect").w));
    $("#rect-cols").checked = !!r.cols;
    var rw = sizeOf("rect").w, floor = minRectW();
    var spans = clamp(Math.round((rw + state.cols.gutter) / colStep()), 1, colCount());
    var snapped = r.cols && (r.wmode === "fixed" || r.wmode === "fit");
    $("#rect-width-hint").textContent =
      (r.wmode === "format" ? "Width " + round(rw, 2) + " — the whole format, edge to edge. "
        : !snapped ? "Width " + round(rw, 2) + ". "
        : Math.abs(colSpan(spans) - rw) < 0.02
          ? "Width " + round(rw, 2) + " — " + spans + " of the " + colCount() +
            " columns — and both edges sit on a column line. "
          : Math.abs(colSpan(spans) + state.cols.gutter - rw) < 0.02
            ? "Width " + round(rw, 2) + " — " + spans + " of the " + colCount() +
              " columns and a gutter, so the right edge sits on the left side of the next column. "
            : "Width " + round(rw, 2) + ", wider than all " + colCount() +
              " columns together, because the text needs it. ") +
      (textVisible()
        ? "It never goes below " + round(floor, 2) + ": the longest line of text (" +
          round(textW, 2) + ") plus the padding on both sides."
        : "");
    setValue($("#rect-h"), fmt(r.h));
    $("#rect-fill").value = r.fill;

    var shape = shapeDef();
    $("#corner-shape").value = shape.id;
    var rounded = shape.id === "radius";
    $("#corner-preset-field").hidden = !rounded;
    $("#shorthand-field").hidden = !rounded;
    $("#shorthand-hint").hidden = !rounded;
    $("#corner-shape-hint").textContent = rounded
      ? "Every shape border-radius can make. Below it the corners are editable one by one."
      : shape.corner
        ? shape.name + ": the four corner values below are the legs of each cut, so the corners can differ."
        : shape.name + ": the top-left corner values set the size of the shape — " +
          round(cornerPx("tl", "x"), 2) + " across, " + round(cornerPx("tl", "y"), 2) + " down.";
    $("#corner-preset").value = matchedPreset();
    $("#corners-linked").checked = r.linked;
    $("#corners-elliptical").checked = r.elliptical;
    document.body.classList.toggle("elliptical", r.elliptical);
    CORNERS.forEach(function (n) {
      var c = r.corners[n];
      setValue($('[data-radius="' + n + '"][data-axis="x"]'), fmt(c.x));
      setValue($('[data-radius="' + n + '"][data-axis="y"]'), fmt(c.y));
      $('[data-unit="' + n + '"][data-axis="x"]').value = c.ux;
      $('[data-unit="' + n + '"][data-axis="y"]').value = c.uy;
    });
    if (!(shorthandTyping && document.activeElement === els.shorthand)) {
      els.shorthand.value = radiusCSS(1);
    }
    shorthandTyping = false;
    els.shorthand.classList.remove("invalid");

    $("#logo-visible").checked = lg.visible;
    syncGrid("#logo-align", lg); syncGrid("#logo-anchor", lg);
    setValue($("#logo-h"), round(lg.h.v, 2));
    $("#logo-hu").value = lg.h.u;
    $("#logo-fill").value = lg.fill;
    $("#logo-fill-field").hidden = !!lg.src;
    var ls = logoSize();
    $("#logo-cols").hidden = lg.h.u !== "col";
    Array.prototype.forEach.call($("#logo-cols").children, function (btn) {
      btn.setAttribute("aria-pressed",
        Math.abs(+btn.dataset.cols - lg.h.v) < 0.005 ? "true" : "false");
    });
    $("#logo-size-hint").textContent = (lg.src ? "Artwork " : "Circle ") +
      fmt(ls.w) + " × " + fmt(ls.h) +
      (lg.h.u === "col"
        ? " — " + round(lg.h.v, 2) + " of the " + colCount() + " columns (" + round(colWidth(), 2) +
          " each), with the height following the " + round(lg.aspect, 3) + ":1 artwork."
        : " — long side of this format is " + fmt(longSide()) +
          (lg.src ? ", artwork ratio " + round(lg.aspect, 3) + ":1" : "") + ".");

    var ty = state.type, st2 = ty.roles[ty.editing];
    $("#type-family").value = ty.family;
    if ($("#type-family").selectedIndex < 0) $("#type-family").selectedIndex = 0;

    setValue($("#type-para"), round(ty.paragraph, 3));
    $("#type-basis").value = ty.basis;
    $("#type-para-px").textContent = "= " + Math.round(paraPx()) + " px";
    $("#type-system").value = ty.system;
    ROLES.forEach(function (r) {
      var input = $('[data-mult="' + r + '"]');
      if (input) setValue(input, round(ty.roles[r].mult, 3));
      $('[data-px="' + r + '"]').textContent = Math.round(rolePx(r)) + " px";
    });
    var basisName = BASES.filter(function (b) { return b.id === ty.basis; })[0].name;
    $("#type-scale-hint").textContent = "Paragraph is " + round(ty.paragraph, 3) + "% of the " + basisName +
      " (" + fmt(typeBasis()) + ") = " + Math.round(paraPx()) + " px. Every other role is a multiple of it — " +
      "pick a ratio above or type any multiple.";

    $("#type-grid").value = ty.grid;
    $("#type-grid-from").value = ty.gridFrom || "fit";
    setValue($("#type-rows"), gridRows());
    $("#type-rows").disabled = fromLeading();
    $("#type-rowpx").value = round(baseline(), 2) + " px";
    $("#type-grid-hint").textContent = fromLeading()
      ? "Grid 1 is the paragraph line box — " + round(paraPx(), 1) + " px × " + round(paraLh(), 3) +
        " = " + round(baseline(), 2) + " px — set in Style below. " + gridRows() +
        " whole rows fit the " + round(contentH(), 1) + " px between the top and bottom margins, with " +
        round(gridRest(), 2) + " px left at the foot. Grid 2 halves it at " + round(baseline() / 2, 2) + " px."
      : "Grid 1 divides the " + round(contentH(), 1) +
        " px between the top and bottom margins into " + gridRows() + " rows of " + round(baseline(), 2) +
        " px, so it fits exactly. That row is the paragraph line height — " + round(paraPx(), 1) + " px × " +
        round(paraLh(), 3) + ". Grid 2 halves it at " + round(baseline() / 2, 2) + " px.";

    $("#type-level").value = ty.editing;
    $("#type-tag").value = st2.tag;
    $("#type-weight").value = String(st2.weight);
    setValue($("#type-lh"), round(ty.editing === "paragraph" ? paraLh() : st2.lh, 3));
    $("#type-snap").innerHTML = (ty.editing === "paragraph"
      ? (fromLeading()
        ? [{ id: "free", name: "Sets grid 1" }]
        : [{ id: "fit", name: "Fit grid 1" }, { id: "free", name: "Free — as typed" }])
      : SNAPS).map(function (x) {
        return '<option value="' + x.id + '">' + esc(x.name) + "</option>";
      }).join("");
    $("#type-snap").value = st2.snap;
    if ($("#type-snap").selectedIndex < 0) $("#type-snap").selectedIndex = 0;
    setValue($("#type-ls"), st2.ls);
    $("#type-transform").value = st2.transform;
    $("#type-color").value = st2.color;
    var eff = roleLh(ty.editing), steps = roleSteps(ty.editing);
    $("#type-lh-px").textContent = "= " + round(rolePx(ty.editing) * eff, 1) + " px";
    $("#type-style-hint").textContent = ty.editing === "paragraph"
      ? (fromLeading()
        ? "This line height sets grid 1: " + round(paraPx(), 1) + " px × " + round(st2.lh, 3) + " = " +
          round(baseline(), 2) + " px a row, and grid 2 is half of that. " + gridRows() +
          " rows fit the content height, leaving " + round(gridRest(), 2) + " px at the foot."
        : st2.snap === "free"
        ? "Free: the paragraph line height is " + round(st2.lh, 3) + " as typed. Grid 1 keeps its " +
          gridRows() + " rows of " + round(baseline(), 2) + " px."
        : "Paragraph rides grid 1: " + gridRows() + " rows fill the content height exactly, so its line " +
          "height is " + round(paraLh(), 4) + ". Type another and the nearest whole row count that still fits is used.")
      : steps
        ? "Line height " + round(st2.lh, 2) + " snaps to " + round(eff, 3) + " so the line box is " +
          steps + " × grid " + (st2.snap === "half" ? "2" : "1") + " = " +
          round(rolePx(ty.editing) * eff, 1) + " px."
        : "Free: the typed line height is used as it is, off both grids.";

    setValue($("#text-padding"), fmt(state.text.padding));
    $("#text-margin-pad").checked = !!state.text.marginPad;
    var spL = sidePad("left"), spR = sidePad("right");
    $("#text-pad-hint").textContent = !state.text.marginPad
      ? "Every block runs in a column " + fmt(state.text.padding) + " from both sides of the box."
      : state.rect.wmode !== "format"
        ? "It applies once the width is set to fill the format — the box is then wider than the " +
          "margins, and side-aligned text would otherwise start inside them."
        : "Left-aligned text starts on the left margin (" + fmt(mm.left) + ", " +
          (spL.l >= 0 ? fmt(spL.l) + " past" : fmt(-spL.l) + " short of") + " the padding); " +
          "right-aligned text ends on the right margin (" + fmt(mm.right) + "). " +
          "Centred text keeps the padding.";
    $("#text-rows-hint").textContent = "Blocks start off the stage: drag one out of the tray above the " +
      "canvas, as often as you like. Rows are counted from the top or the bottom margin. A block on " +
      "grid 1 sits on the full rows (" + round(baseline(), 2) + " px), on grid 2 on the half lines " +
      "between them, and on both grids on any line at all (" + round(baseline() / 2, 2) + " px apart). " +
      "Outside the rectangle a block can be dragged sideways too and lands on the column lines; " +
      "inside it takes the box padding and travels with the box.";

    setValue($("#col-n"), state.cols.n);
    setValue($("#col-gutter"), fmt(state.cols.gutter));
    $("#col-show").checked = state.cols.show;
    $("#col-hint").textContent = state.cols.n + " columns of " + round(colWidth(), 2) +
      " px with a " + fmt(state.cols.gutter) + " px gutter fill the " + round(content().w, 2) +
      " px between the left and right margins.";
    if ($("#text-blocks").querySelectorAll(".block").length !== state.text.blocks.length) buildTextBlocks();
    Array.prototype.forEach.call($("#text-blocks").querySelectorAll(".block"), function (row, i) {
      var b = state.text.blocks[i];

      row.querySelector('[data-block="role"]').value = b.role;
      setValue(row.querySelector('[data-block="text"]'), b.text);
      setValue(row.querySelector('[data-block="row"]'), b.row);
      row.querySelector('[data-block="grid"]').value = String(b.grid);
      row.querySelector('[data-block="from"]').value = b.from === "bottom" ? "bottom" : "top";
      setValue(row.querySelector('[data-block="padL"]'), fmt(b.padL || 0));
      setValue(row.querySelector('[data-block="padR"]'), fmt(b.padR || 0));
      var fw = textFrame().w - state.text.padding * 2 - (b.padL || 0) - (b.padR || 0);
      row.querySelector("[data-fieldw]").textContent = fmt(Math.max(0, fw)) + " wide";
      Array.prototype.forEach.call(row.querySelectorAll("[data-align]"), function (btn) {
        btn.setAttribute("aria-pressed", btn.dataset.align === b.align ? "true" : "false");
      });
    });

    document.body.classList.toggle("guides-locked", !!state.margin.locked);
    var ov = state.showGuides !== false;
    document.body.classList.toggle("overlays-on", ov);
    $("#overlay-toggle").setAttribute("aria-pressed", ov ? "true" : "false");
    $("#overlay-toggle").title = ov ? "Hide every guide and grid" : "Show the guides and grids again";
    document.body.classList.toggle("sel-rect", state.sel === "rect");
    document.body.classList.toggle("sel-logo", state.sel === "logo");
  }

  function onInput(sel, fn) {
    $(sel).addEventListener("input", function (e) { fn(e.target); render(); });
  }
  function onChange(sel, fn) {
    $(sel).addEventListener("change", function (e) { fn(e.target); render(); });
  }
  function numInput(sel, fn, min) {
    onInput(sel, function (el) {
      if (el.value === "") return;
      var v = num(el.value, null);
      if (v === null) return;
      fn(min === undefined ? v : Math.max(min, v));
    });
  }

  function bindPanel() {
    numInput("#stage-w", function (v) { state.stage.w = snap(v); state.stage.preset = ""; }, 1);
    numInput("#stage-h", function (v) { state.stage.h = snap(v); state.stage.preset = ""; }, 1);
    onInput("#stage-bg", function (el) { state.stage.bg = el.value; });
    onChange("#stage-preset", function (el) {
      var f = formatById(el.value);
      if (f) applyFormat(f);
    });
    onChange("#round-values", function (el) {
      state.round = el.checked;
      if (state.round) roundEverything();
    });

    onInput("#bg-url", function (el) { state.bg.src = el.value.trim(); });
    onChange("#bg-fit", function (el) { state.bg.fit = el.value; });
    onInput("#bg-opacity", function (el) { state.bg.opacity = num(el.value, 100); });
    $("#bg-clear").addEventListener("click", function () { state.bg.src = ""; render(); });
    $("#bg-upload-btn").addEventListener("click", function () { $("#bg-file").click(); });
    $("#bg-file").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { state.bg.src = String(reader.result); render(); };
      reader.readAsDataURL(file);
      e.target.value = "";
    });

    onInput("#cf-endpoint", function (el) { state.comfy.endpoint = el.value.trim(); });
    onInput("#cf-workflow", function (el) { state.comfy.workflow = el.value; });
    onInput("#cf-prompt", function (el) { state.comfy.prompt = el.value; });
    onInput("#cf-negative", function (el) { state.comfy.negative = el.value; });
    numInput("#cf-seed", function (v) { state.comfy.seed = Math.round(v); });
    $("#cf-key").addEventListener("input", function (e) { comfyKey = e.target.value.trim(); storeKey(); });
    onChange("#cf-remember", function (el) { state.comfy.remember = el.checked; storeKey(); });
    $("#cf-forget").addEventListener("click", function () {
      comfyKey = ""; state.comfy.remember = false;
      try { localStorage.removeItem(KEY_STORAGE); } catch (e) {}
      $("#cf-key").value = "";
      render();
    });
    $("#cf-random").addEventListener("click", function () {
      state.comfy.seed = Math.floor(Math.random() * 4294967295);
      render();
    });
    $("#cf-generate").addEventListener("click", generate);

    onChange("#guide-mode", function (el) {
      if (el.value === "manual") state.guides.color = guideColour();   // start from what is on screen
      state.guides.mode = el.value;
    });
    onInput("#guide-color", function (el) {
      state.guides.color = el.value;
      state.guides.mode = "manual";
    });

    onChange("#margin-mode", function (el) {
      var m = state.margin;
      if (el.value === "manual" && m.mode !== "manual") {
        var mm = margins();                              // keep what the logo rule produced
        SIDES.forEach(function (s) { m[s] = mm[s]; });
      } else if (el.value !== "manual" && m.mode === "manual") {
        m.linked = false;                                // the four sides start out free
      }
      m.mode = el.value;
    });
    numInput("#margin-factor", function (v) { state.margin.factor = round(v, 3); }, 0);
    onChange("#margin-linked", function (el) {
      var m = state.margin;
      m.linked = el.checked;
      if (!el.checked) return;
      if (m.mode === "manual") setMargin("top", m.top); else setBuffer("top", buf("top"));
    });
    SIDES.forEach(function (side) {
      numInput("#margin-" + side, function (v) {
        if (state.margin.mode === "manual") setMargin(side, Math.max(0, snap(v)));
        else setBuffer(side, snap(v));
      });
    });

    onChange("#rect-placed", function (el) {
      state.rect.placed = el.checked;
      if (el.checked) state.sel = "rect"; else if (state.sel === "rect") state.sel = "";
    });
    onChange("#rect-visible", function (el) { state.rect.visible = el.checked; if (el.checked) state.sel = "rect"; });
    onChange("#rect-wmode", function (el) {
      if (el.value === "fixed") state.rect.w = round(sizeOf("rect").w, 1);   // start from what is on screen
      state.rect.wmode = el.value;
    });
    numInput("#rect-w", function (v) { state.rect.w = snap(v); }, MIN_SIZE);
    numInput("#rect-h", function (v) { state.rect.h = snap(v); }, MIN_SIZE);
    onInput("#rect-fill", function (el) { state.rect.fill = el.value; });

    onChange("#logo-visible", function (el) { state.logo.visible = el.checked; if (el.checked) state.sel = "logo"; });
    numInput("#logo-h", function (v) { state.logo.h.v = Math.max(0.01, round(v, 2)); }, 0);
    onChange("#logo-hu", function (el) { setLogoUnit(el.value); });
    $("#logo-cols").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cols]");
      if (!btn) return;
      state.logo.h = { v: +btn.dataset.cols, u: "col" };
      render();
    });
    $("#logo-upload-btn").addEventListener("click", function () { $("#logo-file").click(); });
    $("#logo-file").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (file) loadLogoFile(file);
    });
    $("#logo-clear").addEventListener("click", function () {
      state.logo.src = ""; state.logo.aspect = 1;
      render();
    });
    onInput("#logo-fill", function (el) { state.logo.fill = el.value; });

    ["#rect-align", "#rect-anchor", "#logo-align", "#logo-anchor"].forEach(function (id) {
      $(id).addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.kind === "align") setAlign(b.dataset.el, b.dataset.h, b.dataset.v);
        else state[b.dataset.el].anchor = { h: b.dataset.h, v: b.dataset.v };
        state.sel = b.dataset.el;
        render();
      });
    });

    onChange("#corner-shape", function (el) {
      state.rect.shape = el.value;
    });
    onChange("#rect-cols", function (el) { state.rect.cols = el.checked; });
    onChange("#rect-hmode", function (el) {
      if (el.value === "fixed") state.rect.h = round(sizeOf("rect").h, 1);   // start from what is on screen
      state.rect.hmode = el.value;
    });
    onChange("#margin-locked", function (el) { state.margin.locked = el.checked; });
    onChange("#text-margin-pad", function (el) { state.text.marginPad = el.checked; });
    onChange("#corner-preset", function (el) {
      var p = CORNER_PRESETS.filter(function (x) { return x.id === el.value; })[0];
      if (!p) return;
      var parsed = parseRadius(p.value);
      state.rect.corners = parsed.corners;
      state.rect.elliptical = parsed.elliptical;
      state.rect.linked = true;
    });
    onChange("#corners-linked", function (el) {
      state.rect.linked = el.checked;
      if (el.checked) CORNERS.forEach(function (n) { state.rect.corners[n] = Object.assign({}, state.rect.corners.tl); });
    });
    onChange("#corners-elliptical", function (el) {
      state.rect.elliptical = el.checked;
      if (!el.checked) CORNERS.forEach(function (n) {
        var c = state.rect.corners[n]; c.y = c.x; c.uy = c.ux;
      });
    });
    $("#corners").addEventListener("input", function (e) {
      var el = e.target;
      if (!el.dataset.radius || el.value === "") return;
      var axis = el.dataset.axis, v = Math.max(0, snap(num(el.value, 0)));
      eachCorner(el.dataset.radius, function (n) {
        var c = state.rect.corners[n];
        if (axis === "x") { c.x = v; if (!state.rect.elliptical) c.y = v; }
        else { c.y = v; if (!state.rect.elliptical) c.x = v; }
      });
      render();
    });
    $("#corners").addEventListener("change", function (e) {
      var el = e.target;
      if (!el.dataset.unit) return;
      var axis = el.dataset.axis, u = el.value;
      eachCorner(el.dataset.unit, function (n) {
        var c = state.rect.corners[n], px = cornerPx(n, axis), dim = cornerDim(axis);
        var v = Math.max(0, snap(u === "%" ? (dim ? px / dim * 100 : 0) : px));
        if (axis === "x") { c.ux = u; c.x = v; if (!state.rect.elliptical) { c.uy = u; c.y = v; } }
        else { c.uy = u; c.y = v; if (!state.rect.elliptical) { c.ux = u; c.x = v; } }
      });
      render();
    });
    els.shorthand.addEventListener("input", function (e) {
      var parsed = parseRadius(e.target.value);
      if (!parsed) { e.target.classList.add("invalid"); return; }
      shorthandTyping = true;
      state.rect.corners = parsed.corners;
      if (parsed.elliptical) state.rect.elliptical = true;
      render();
    });

    var copier = function (btnSel, srcSel, label) {
      $(btnSel).addEventListener("click", function (e) {
        var btn = e.target, text = $(srcSel).textContent;
        var done = function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = label; }, 1200);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
        else done();
      });
    };
    copier("#copy-css", "#css-out", "Copy CSS");
    copier("#copy-markup", "#markup-out", "Copy markup");
    $("#reset").addEventListener("click", function () {
      state = defaults();
      frameFor = null;
      render();
    });

    onChange("#type-family", function (el) {
      state.type.family = el.value;
      if (el.value.indexOf("g:") === 0) loadGoogleFont(el.value.slice(2));
    });
    $("#gf-add").addEventListener("click", function () {
      var name = $("#gf-input").value.trim();
      if (!name) return fontStatus("Type a family name first — the list suggests as you type.", "err");
      if (state.type.google.indexOf(name) < 0) state.type.google.push(name);
      loadGoogleFont(name);
      state.type.family = "g:" + name;
      $("#gf-input").value = "";
      buildFamilySelect();
      fontStatus("Using " + name + " from Google Fonts.", "ok");
      render();
    });
    $("#font-upload-btn").addEventListener("click", function () { $("#font-file").click(); });
    $("#font-file").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (file) loadFontFile(file);
    });
    $("#gf-key").addEventListener("input", function (e) {
      gfKey = e.target.value.trim();
      try { gfKey ? localStorage.setItem(GF_KEY_STORAGE, gfKey) : localStorage.removeItem(GF_KEY_STORAGE); } catch (err) {}
    });
    $("#gf-forget").addEventListener("click", function () {
      gfKey = ""; $("#gf-key").value = "";
      try { localStorage.removeItem(GF_KEY_STORAGE); localStorage.removeItem(GF_CACHE_KEY); } catch (err) {}
      buildGoogleList();
      gfStatus("Key and cached catalogue cleared.", "");
    });
    $("#gf-load").addEventListener("click", loadGoogleCatalogue);
    onChange("#type-level", function (el) { state.type.editing = el.value; });
    var styleOf = function () { return state.type.roles[state.type.editing]; };
    numInput("#type-para", function (v) { state.type.paragraph = Math.max(0.05, round(v, 3)); });
    onChange("#type-basis", function (el) { state.type.basis = el.value; });
    onChange("#type-system", function (el) {
      if (el.value === "custom") { state.type.system = "custom"; return; }
      applyScale(el.value);
    });
    $("#type-scale").addEventListener("input", function (e) {
      var role = e.target.dataset.mult;
      if (!role || e.target.value === "") return;
      var v = num(e.target.value, null);
      if (v === null) return;
      state.type.roles[role].mult = Math.max(0.01, round(v, 3));
      state.type.system = "custom";                 // typing a value leaves the ratio behind
      render();
    });
    onChange("#type-grid", function (el) { state.type.grid = el.value; });
    onChange("#type-grid-from", function (el) {
      var ty = state.type;
      if (el.value === "leading" && !fromLeading()) {
        ty.roles.paragraph.lh = round(baseline() / paraPx(), 4);   // start from the grid on screen
        ty.roles.paragraph.snap = "free";
      } else if (el.value === "fit" && fromLeading()) {
        setRows(contentH() / leadingPx());                         // keep the row as close as it can be
        ty.roles.paragraph.snap = "fit";
      }
      ty.gridFrom = el.value;
    });
    numInput("#col-n", function (v) { state.cols.n = clamp(Math.round(v), 1, 48); }, 1);
    numInput("#col-gutter", function (v) { state.cols.gutter = Math.max(0, snap(v)); }, 0);
    onChange("#col-show", function (el) { state.cols.show = el.checked; });
    numInput("#type-rows", function (v) { setRows(v); }, 1);
    onChange("#type-tag", function (el) { styleOf().tag = el.value; });
    onChange("#type-snap", function (el) { styleOf().snap = el.value; });
    onChange("#type-weight", function (el) { styleOf().weight = +el.value; });
    numInput("#type-lh", function (v) {
      var p = state.type.roles.paragraph;
      // in the fit mode a typed paragraph leading picks the row count that comes
      // closest to it; in the leading mode it simply is the row
      if (state.type.editing === "paragraph" && !fromLeading() && p.snap !== "free") {
        setRows(contentH() / (paraPx() * Math.max(0.5, v)));
      } else styleOf().lh = round(v, 3);
    }, .5);
    numInput("#type-ls", function (v) { styleOf().ls = round(v, 3); });
    onChange("#type-transform", function (el) { styleOf().transform = el.value; });
    onInput("#type-color", function (el) { styleOf().color = el.value; });

    numInput("#text-padding", function (v) { state.text.padding = snap(v); }, 0);
    onChange("#rect-grid", function (el) { state.rect.grid = +el.value; });
    $("#text-blocks").addEventListener("input", function (e) {
      var row = e.target.closest(".block");
      if (!row) return;
      var b = state.text.blocks[+row.dataset.i], what = e.target.dataset.block;
      if (what === "text") b.text = e.target.value;
      else if (what === "row" && e.target.value !== "") b.row = Math.round(num(e.target.value, b.row));
      else if ((what === "padL" || what === "padR") && e.target.value !== "") {
        b[what] = Math.max(0, snap(num(e.target.value, b[what] || 0)));
      }
      else return;
      render();
    });
    $("#text-blocks").addEventListener("change", function (e) {
      var row = e.target.closest(".block");
      if (!row) return;
      var b = state.text.blocks[+row.dataset.i], what = e.target.dataset.block;
      if (what === "role") b.role = e.target.value;
      else if (what === "grid" || what === "from") {
        var y = rowY(b);                                   // keep it where it is
        if (what === "grid") b.grid = e.target.value === "both" ? "both" : +e.target.value;
        else b.from = e.target.value;
        b.row = rowAt(y, b);
      } else return;
      render();
    });
    $("#text-blocks").addEventListener("click", function (e) {
      var gone = e.target.closest('[data-block="remove"]');
      if (gone) { removeBlock(+gone.closest(".block").dataset.i); render(); return; }
      var btn = e.target.closest("[data-align]");
      if (!btn) return;
      state.text.blocks[+btn.closest(".block").dataset.i].align = btn.dataset.align;
      render();
    });

    $("#tray-items").addEventListener("pointerdown", function (e) {
      var chip = e.target.closest("[data-place]");
      if (!chip || e.button !== 0) return;
      startPlace(e, chip.dataset.place);
      render();
    });
    $("#sheet-type").addEventListener("click", function () { openSheet("type"); });
    $("#sheet-colour").addEventListener("click", function () { openSheet("colour"); });
    $("#sheet-print").addEventListener("click", function () { window.print(); });
    $("#sheet-close").addEventListener("click", function () { $("#sheet-wrap").hidden = true; });
    window.addEventListener("resize", fitSheet);
    $("#undo").addEventListener("click", undo);
    $("#redo").addEventListener("click", redo);
    $("#rail-toggle").addEventListener("click", function () {
      state.showRail = !state.showRail;
      render();
    });
    // one switch for every guide and grid on the canvas
    $("#overlay-toggle").addEventListener("click", function () {
      state.showGuides = state.showGuides === false;
      render();
    });
    $("#rail-list").addEventListener("click", function (e) {
      var tile = e.target.closest(".tile");
      if (!tile) return;
      state.stage.w = +tile.dataset.w;
      state.stage.h = +tile.dataset.h;
      render();
    });

    $("#zoom-in").addEventListener("click", function () { setZoom(scale() * 1.25, viewCenter()); });
    $("#zoom-out").addEventListener("click", function () { setZoom(scale() / 1.25, viewCenter()); });
    $("#zoom-100").addEventListener("click", function () { setZoom(1, viewCenter()); });
    $("#zoom-fit").addEventListener("click", function () { setZoom(null); });
    $("#zoom-value").addEventListener("click", function () { setZoom(null); });
    window.addEventListener("resize", function () { render(); });
  }

  function viewCenter() {
    var r = els.viewport.getBoundingClientRect();
    return { x: r.width / 2, y: r.height / 2 };
  }

  function setBuffer(side, v) {
    var m = state.margin;
    if (m.linked) SIDES.forEach(function (s) { m.buf[s] = v; });
    else m.buf[side] = v;
  }

  function setMargin(side, v) {
    var m = state.margin, max = (side === "left" || side === "right" ? state.stage.w : state.stage.h) - MIN_SIZE;
    v = clamp(v, 0, max);
    if (m.linked) SIDES.forEach(function (s) { m[s] = v; });
    else m[side] = v;
  }

  function storeKey() {
    try {
      if (state.comfy.remember && comfyKey) localStorage.setItem(KEY_STORAGE, comfyKey);
      else localStorage.removeItem(KEY_STORAGE);
    } catch (e) {}
  }

  function roundEverything() {
    var r = state.rect;
    state.stage.w = Math.round(state.stage.w); state.stage.h = Math.round(state.stage.h);
    SIDES.forEach(function (s) { state.margin[s] = Math.round(state.margin[s]); });
    r.w = Math.round(r.w); r.h = Math.round(r.h);
    state.logo.h.v = Math.max(state.logo.h.u === "%" ? 0.1 : 1, round(state.logo.h.v, 1));
    CORNERS.forEach(function (n) {
      var c = r.corners[n]; c.x = Math.round(c.x); c.y = Math.round(c.y);
    });
    state.text.padding = Math.round(state.text.padding);
    state.type.paragraph = Math.max(0.05, round(state.type.paragraph, 3));
    ROLES.forEach(function (r) {
      var t = state.type.roles[r];
      t.mult = Math.max(0.01, round(t.mult, 3));
    });
  }

  /* ------------------------------------------------------------ canvas drag */

  function drag(e, onMove, onEnd) {
    e.preventDefault();
    var target = els.viewport;
    try { target.setPointerCapture(e.pointerId); } catch (err) {}
    function move(ev) { onMove(ev); render(); }
    function up(ev) {
      try { target.releasePointerCapture(ev.pointerId); } catch (err) {}
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      if (onEnd) onEnd();
      render();
    }
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  }

  var spaceDown = false;

  function startPan(e) {
    var p0 = pan(), c0 = { x: e.clientX, y: e.clientY };
    document.body.classList.add("panning");
    drag(e, function (ev) {
      state.view.zoom = scale();
      state.view.pan = { x: p0.x + (ev.clientX - c0.x), y: p0.y + (ev.clientY - c0.y) };
      state.view.panned = true;
    }, function () { document.body.classList.remove("panning"); });
  }

  // dragging a shape picks the alignment cell nearest the pointer
  function startShapeDrag(e, name) {
    if (!name || !state[name]) return;
    if (name === "rect" ? !state.rect.placed : !state[name].visible) return;
    var el = state[name], b0 = box(name), start = toStage(e);
    var mh = el.anchor.h === el.align.h, mv = el.anchor.v === el.align.v;
    els.cells.hidden = false;
    renderCells(name);
    drag(e, function (ev) {
      var p = toStage(ev);
      var cx = b0.x + (p.x - start.x) + b0.w / 2;
      var cy = b0.y + (p.y - start.y) + b0.h / 2;
      var c = content(), sz = sizeOf(name);
      // score each cell with the anchor the shape would have once it lands there
      var best = function (keys, f, cPos, cLen, size, mirrored, anchor, target) {
        return keys.map(function (k) {
          var af = f(mirrored ? k : anchor);
          return { k: k, d: Math.abs(cPos + cLen * f(k) - size * af + size / 2 - target) };
        }).sort(function (a, b) { return a.d - b.d; })[0].k;
      };
      setAlign(name,
        best(H_KEYS, fh, c.x, c.w, sz.w, mh, el.anchor.h, cx),
        best(V_KEYS, fv, c.y, c.h, sz.h, mv, el.anchor.v, cy));
      renderCells(name);
    }, function () { els.cells.hidden = true; });
  }

  // a fresh block of a role, seeded with that role's placeholder copy
  function newBlock(role) {
    // paragraph keeps to the full rows; everything else may sit on any line
    var grid = role === "paragraph" ? 1 : "both";
    var rows = ROLE_ROWS[role] || 2;              // counted in full rows either way
    return {
      role: role, align: "left", row: grid === "both" ? rows * 2 : rows, grid: grid,
      from: role === "smallprint" ? "bottom" : "top",
      padL: 0, padR: 0, text: ROLE_SEEDS[role] || ""
    };
  }

  function removeBlock(i) {
    if (i < 0 || i >= state.text.blocks.length) return;
    state.text.blocks.splice(i, 1);
    if (state.selBlock === i) state.selBlock = -1;
    else if (state.selBlock > i) state.selBlock--;
    if (editing === i) editing = -1;
    else if (editing > i) editing--;
    buildTextBlocks();
    var stack = liveStack();
    if (stack) stack.dataset.sig = "";
  }

  // where the rectangle sat last time round, as an offset inside the margin box
  var lastBox = null, placing = false;

  // move the rectangle, or resize it, and the text inside it comes along; anything
  // outside stays where it is. Measured against the margin box, so changing the
  // format or the margins moves the page rather than the box within it
  function carryBlocks() {
    var c = content();
    var now = null;
    if (state.rect.placed) {
      var b = box("rect");
      now = { top: b.y - c.y, bot: b.y + b.h - c.y };
    }
    // a rectangle being pulled out of the tray sweeps across the format on its way in;
    // it should not collect the text it passes over
    if (placing) { lastBox = now; return; }
    if (lastBox && now) {
      var dTop = now.top - lastBox.top, dBot = now.bot - lastBox.bot;
      if (dTop || dBot) {
        state.text.blocks.forEach(function (bl) {
          var y = rowY(bl) - c.y;
          if (y < lastBox.top - 0.5 || y > lastBox.bot + 0.5) return;   // it was not in the box
          var d = bl.from === "bottom" ? dBot : dTop;                   // it follows its own edge
          if (d) bl.row = rowAt(rowY(bl) + d, bl);
        });
      }
    }
    lastBox = now;
  }

  // pull an element out of the tray: it lands where the pointer is, snapping as it
  // goes, and goes back to the tray if it is let go outside the format
  function startPlace(e, id) {
    var isRect = id === "rect", role = isRect ? null : id.split(":")[1];
    var b, i = -1;
    if (isRect) {
      if (state.rect.placed) return;
      b = state.rect;
      b.placed = true;
      state.sel = "rect";
    } else {
      if (ROLES.indexOf(role) < 0) return;
      b = newBlock(role);
      state.text.blocks.push(b);
      i = state.text.blocks.length - 1;
      state.sel = "rect";
      state.selBlock = i;
      buildTextBlocks();
    }
    var landed = false, moved = false;
    placing = true;
    var move = function (ev) {
      var p = toStage(ev), st = state.stage;
      moved = true;
      landed = p.x >= 0 && p.y >= 0 && p.x <= st.w && p.y <= st.h;
      if (isRect) {
        var sz = sizeOf("rect"), c = content();
        setAlign("rect",
          nearestKey(H_KEYS, fh, c.x, c.w, sz.w, state.rect.anchor.h, p.x),
          nearestKey(V_KEYS, fv, c.y, c.h, sz.h, state.rect.anchor.v, p.y));
        renderCells("rect");
      } else {
        b.row = rowAt(p.y, b);
      }
    };
    if (isRect) { els.cells.hidden = false; renderCells("rect"); }
    drag(e, move, function () {
      placing = false;
      els.cells.hidden = true;
      // a plain click drops it where it last sat; a drag that ends off the format
      // puts it back in the tray
      if (moved && !landed) {
        if (isRect) b.placed = false;
        else removeBlock(i);
      }
    });
  }

  // the alignment cell whose landing point is nearest a position
  function nearestKey(keys, f, cPos, cLen, size, anchor, target) {
    return keys.map(function (k) {
      return { k: k, d: Math.abs(cPos + cLen * f(k) - size * f(anchor) + size / 2 - target) };
    }).sort(function (a, b) { return a.d - b.d; })[0].k;
  }

  // drag a text block up and down; it lands on whole rows of its own grid
  function startTextDrag(e, index) {
    var b = state.text.blocks[index];
    if (!b) return;
    var start = toStage(e), row0 = b.row;
    // a block that is not in the rectangle can be moved sideways as well, landing on
    // the column lines; the field keeps the width it had
    var free = !blockInside(b), cw = content().w;
    var l0 = colLine(b.padL || 0), w0 = Math.max(colWidth(), colLine(cw - (b.padR || 0)) - l0);
    drag(e, function (ev) {
      var p = toStage(ev);
      var steps = Math.round((p.y - start.y) / blockUnit(b));
      b.row = row0 + (b.from === "bottom" ? -steps : steps);   // rows count upward from the bottom
      if (!free) return;
      // the left edge lands on a column line; the field keeps its width while there is
      // room for it and gives way at the right margin
      var l = clamp(colLine(l0 + p.x - start.x), 0, Math.max(0, cw - colWidth()));
      var r = Math.max(l + colWidth(), Math.min(cw, l + w0));
      b.padL = snap(l);
      b.padR = snap(Math.max(0, cw - r));
    });
  }

  // drag a field edge in or out; a field narrower than the column wraps its lines
  function startFieldResize(e, index, dir) {
    var b = state.text.blocks[index];
    if (!b) return;
    var start = toStage(e), l0 = b.padL || 0, r0 = b.padR || 0;
    var room = Math.max(MIN_SIZE, textFrame().w - state.text.padding * 2);
    drag(e, function (ev) {
      var dx = toStage(ev).x - start.x;
      if (dir === "w") b.padL = clamp(snap(l0 + dx), 0, room - (b.padR || 0) - MIN_SIZE);
      else b.padR = clamp(snap(r0 - dx), 0, room - (b.padL || 0) - MIN_SIZE);
    });
  }

  // drag the grip to size the role this block carries
  function startTypeScale(e, index) {
    var b = state.text.blocks[index];
    if (!b) return;
    var ty = state.type, role = b.role;
    var start = toStage(e), from = role === "paragraph" ? ty.paragraph : ty.roles[role].mult;
    var px0 = rolePx(role);
    drag(e, function (ev) {
      var dy = toStage(ev).y - start.y;
      var k = clamp(1 + dy / Math.max(40, px0 * 4), 0.05, 20);
      if (role === "paragraph") ty.paragraph = clamp(round(from * k, 3), 0.05, 100);
      else {
        ty.roles[role].mult = clamp(round(from * k, 3), 0.01, 50);
        ty.system = "custom";
      }
      ty.editing = role;
    });
  }

  function startResize(e, dir) {
    var name = state.sel, el = state[name];
    var sx = dir.indexOf("w") > -1 ? -1 : dir.indexOf("e") > -1 ? 1 : 0;
    var sy = dir.indexOf("n") > -1 ? -1 : dir.indexOf("s") > -1 ? 1 : 0;
    var start = toStage(e), s0 = sizeOf(name), ratio = s0.w / s0.h;
    // a centre-anchored shape grows in both directions, so it needs twice the delta to track the pointer
    var kx = el.anchor.h === "center" ? 2 : 1, ky = el.anchor.v === "middle" ? 2 : 1;

    drag(e, function (ev) {
      var p = toStage(ev);
      var dx = (p.x - start.x) * sx * kx, dy = (p.y - start.y) * sy * ky;
      if (name === "logo") {
        var a = state.logo.aspect || 1;
        var dh = sx && sy ? (dy + dx / a) / 2 : sy ? dy : dx / a;
        setLogoHeightPx(s0.h + dh);
        return;
      }
      var w = sx ? Math.max(MIN_SIZE, s0.w + dx) : s0.w;
      var h = sy ? Math.max(MIN_SIZE, s0.h + dy) : s0.h;
      if (ev.shiftKey && sx && sy) h = w / ratio;
      if (sx && state.rect.wmode === "fixed") state.rect.w = snap(w);
      if (sy && state.rect.hmode === "fixed") state.rect.h = Math.max(MIN_SIZE, snap(h));
    });
  }

  function startRadius(e, name) {
    var dirX = (name === "tl" || name === "bl") ? 1 : -1;
    var dirY = (name === "tl" || name === "tr") ? 1 : -1;
    var b = box("rect"), start = toStage(e);
    var r0 = { x: cornerPx(name, "x"), y: cornerPx(name, "y") };
    drag(e, function (ev) {
      var p = toStage(ev);
      var rx = r0.x + (p.x - start.x) * dirX;
      var ry = r0.y + (p.y - start.y) * dirY;
      if (!state.rect.elliptical || ev.shiftKey) rx = ry = (rx + ry) / 2;
      rx = clamp(rx, 0, b.w / 2);
      ry = clamp(ry, 0, b.h / 2);
      eachCorner(name, function (n) {
        setCornerPx(n, "x", rx);
        setCornerPx(n, "y", state.rect.elliptical ? ry : rx);
      });
    });
  }

  function startGuide(e, side) {
    if (state.margin.locked) return;          // unlock them in the Margins panel to drag
    drag(e, function (ev) {
      var p = toStage(ev), st = state.stage;
      var v = side === "left" ? p.x : side === "right" ? st.w - p.x
        : side === "top" ? p.y : st.h - p.y;
      v = Math.max(0, snap(v));
      // in a logo mode the base is shared by all four sides, so a guide moves the
      // buffer on its own side rather than dragging the other three with it
      if (state.margin.mode !== "manual") setBuffer(side, snap(v - marginBase()));
      else setMargin(side, v);
    });
  }

  function bindCanvas() {
    // the drag captures the pointer, so the double click arrives on the viewport —
    // the block that was pressed is remembered instead of read off the event
    els.viewport.addEventListener("dblclick", function (e) {
      if (pressedBlock < 0) return;
      e.preventDefault();
      state.selBlock = pressedBlock;
      startEditing(pressedBlock);
    });

    // typing on the canvas writes straight back to the block
    els.stage.addEventListener("input", function (e) {
      var tb = e.target.closest && e.target.closest(".tb");
      if (!tb || tb.dataset.i === undefined || editing !== +tb.dataset.i) return;
      var b = state.text.blocks[+tb.dataset.i];
      if (!b) return;
      b.text = (tb.innerText || "").replace(/\u00a0/g, " ").replace(/\n$/, "");
      render();
    });
    els.stage.addEventListener("keydown", function (e) {
      if (editing < 0) return;
      if (e.key === "Escape") { e.preventDefault(); stopEditing(); }
    });
    els.stage.addEventListener("focusout", function (e) {
      if (editing >= 0 && e.target.classList.contains("tb")) stopEditing();
    });

    els.viewport.addEventListener("pointerdown", function (e) {
      if (e.button === 1 || spaceDown) return startPan(e);
      if (e.button !== 0) return;
      var t = e.target;
      if (t.classList.contains("guide")) return startGuide(e, t.dataset.side);
      if (t.classList.contains("handle")) {
        els.frame.focus();
        return t.classList.contains("radius") ? startRadius(e, t.dataset.corner) : startResize(e, t.dataset.dir);
      }
      if (t.classList.contains("bhandle")) {
        if (t.dataset.bdir === "kill") {                 // the ✕ takes the block off the stage
          e.preventDefault();
          if (editing >= 0) stopEditing();
          removeBlock(state.selBlock);
          render();
          return;
        }
        return t.dataset.bdir === "size"
          ? startTypeScale(e, state.selBlock)
          : startFieldResize(e, state.selBlock, t.dataset.bdir);
      }
      var tb = t.closest && t.closest(".tb");
      pressedBlock = tb && tb.dataset.i !== undefined ? +tb.dataset.i : -1;
      if (tb && tb.dataset.i !== undefined) {
        var i = +tb.dataset.i;
        if (editing === i) return;                 // typing: let the caret land
        if (editing >= 0) stopEditing();
        state.sel = "rect";
        state.selBlock = i;
        els.frame.focus();
        render();
        return startTextDrag(e, i);
      }
      if (editing >= 0) stopEditing();
      if (state.selBlock >= 0) state.selBlock = -1;
      var shape = t.closest && t.closest(".shape");
      if (shape) {
        state.sel = shape.dataset.el;
        els.frame.focus();
        render();
        return startShapeDrag(e, state.sel);
      }
      if (t === els.frame && state.sel) { els.frame.focus(); return startShapeDrag(e, state.sel); }
      // a click on nothing in particular clears the selection
      if (state.sel) { state.sel = ""; render(); }
      startPan(e);
    });

    els.viewport.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = els.viewport.getBoundingClientRect();
      var focus = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (e.ctrlKey || e.metaKey) {
        setZoom(scale() * Math.pow(0.9985, e.deltaY), focus);
      } else {
        var p = pan();
        state.view.zoom = scale();
        state.view.pan = { x: p.x - e.deltaX, y: p.y - e.deltaY };
        state.view.panned = true;
        render();
      }
    }, { passive: false });

    window.addEventListener("keydown", function (e) {
      var t = e.target;
      if (e.key === "Escape" && !$("#sheet-wrap").hidden) { $("#sheet-wrap").hidden = true; return; }
      // undo works wherever you are, including inside a field
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z" || e.key === "y")) {
        e.preventDefault();
        if (e.key === "y" || e.shiftKey) redo(); else undo();
        return;
      }
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.code === "Space") { spaceDown = true; document.body.classList.add("can-pan"); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && state.selBlock >= 0) {
        e.preventDefault();
        removeBlock(state.selBlock);
        render();
        return;
      }
      var map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      var d = map[e.key];
      if (!d) return;
      var el = state[state.sel];
      if (!el) return;
      e.preventDefault();
      var hi = clamp(H_KEYS.indexOf(el.align.h) + d[0], 0, 2);
      var vi = clamp(V_KEYS.indexOf(el.align.v) + d[1], 0, 2);
      setAlign(state.sel, H_KEYS[hi], V_KEYS[vi]);
      render();
    });
    window.addEventListener("keyup", function (e) {
      if (e.code === "Space") { spaceDown = false; document.body.classList.remove("can-pan"); }
    });
  }

  /* ------------------------------------------------ style guide sheets (PDF) */

  function contrastRatio(a, b) {
    var la = luminance(hexRgb(a)), lb = luminance(hexRgb(b));
    var hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  function rgbLabel(hex) {
    var c = hexRgb(hex);
    return "rgb(" + Math.round(c.r) + " " + Math.round(c.g) + " " + Math.round(c.b) + ")";
  }

  function formatName() {
    var f = formatById(state.stage.preset);
    return (f ? f.name : "Custom") + " · " + fmt(state.stage.w) + " × " + fmt(state.stage.h) +
      " · " + ratioLabel(state.stage.w, state.stage.h);
  }

  function sheetFoot(kind) {
    return '<div class="foot"><span>' + esc(kind) + " — " + esc(familyLabel()) + "</span><span>" +
      esc(formatName()) + "</span></div>";
  }

  // the type scale, its rules and a specimen of every role — a page of a brand manual
  function typeSheet() {
    var ty = state.type, sys = SCALES.filter(function (x) { return x.id === ty.system; })[0];
    // the specimens are scaled to fill the space the sheet has for them, whatever
    // size the type runs at on this format
    var stack = ROLES.reduce(function (sum, r) { return sum + rolePx(r) * roleLh(r); }, 0);
    var k = clamp(300 / Math.max(1, stack), 0.05, 2.5);
    var rows = ROLES.map(function (r) {
      var st = ty.roles[r], px = rolePx(r), lh = roleLh(r), steps = roleSteps(r);
      var snapName = (SNAPS.filter(function (x) { return x.id === st.snap; })[0] || {}).name || st.snap;
      return '<div class="spec">' +
        '<div class="spec-head"><span class="spec-name">' + esc(ROLE_NAMES[r]) + "</span>" +
        '<span class="spec-meta">&lt;' + esc(st.tag) + "&gt; · " + round(px, 2) + " px · " +
        (r === "paragraph" ? "anchor" : round(st.mult, 3) + " × paragraph") +
        " · line height " + round(lh, 4) + " (" + round(px * lh, 2) + " px" +
        (steps ? ", " + steps + " × grid " + (st.snap === "half" ? "2" : "1") : "") + ")" +
        " · " + st.weight + " · " + round(st.ls, 3) + "em" +
        (st.transform !== "none" ? " · " + st.transform : "") + " · " + st.color.toUpperCase() +
        " · " + esc(snapName) + "</span></div>" +
        '<div class="spec-line" style="font-family:' + esc(familyStack()) + ";font-size:" + round(px * k, 2) +
        "px;line-height:" + round(lh, 4) + ";font-weight:" + st.weight + ";letter-spacing:" +
        round(st.ls, 3) + "em;text-transform:" + st.transform + ';color:#14171c">' +
        esc(ROLE_SEEDS[r].split("\n")[0]) + "</div></div>";
    }).join("");

    return '<h1>Typography</h1><p class="lede">' + esc(familyLabel()) +
      ". The scale is anchored on the paragraph size and every other role is a multiple of it, " +
      "so the whole hierarchy travels between formats as one." +
      (Math.abs(k - 1) > 0.02
        ? " Specimens are shown at " + Math.round(k * 100) + "% of their size on this format."
        : " Specimens are at size.") +
      '</p><div class="alphabet" style="font-family:' + esc(familyStack()) +
      ';font-size:34px;line-height:1.3;letter-spacing:-.01em;margin-top:22px;color:#14171c">' +
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 &amp; @ ? ! — “ ”" +
      '</div><div class="rule"></div><div class="cols"><div><h2>The scale</h2>' + rows + "</div>" +
      '<div><h2>How it is built</h2><dl>' +
      "<dt>Paragraph</dt><dd>" + round(ty.paragraph, 3) + "% of " + esc(basisLabel()) + " = " +
      round(paraPx(), 2) + " px</dd>" +
      "<dt>Ratio</dt><dd>" + esc(sys ? sys.name : "Custom — set by hand") + "</dd>" +
      "<dt>Multiples</dt><dd>" + ROLES.map(function (r) {
        return r === "paragraph" ? "1" : round(ty.roles[r].mult, 3);
      }).join(" / ") + "</dd>" +
      "<dt>Grid 1</dt><dd>" + round(baseline(), 3) + " px a row — " + (fromLeading()
        ? "the paragraph line box; " + gridRows() + " whole rows fit the " + round(contentH(), 2) +
          " px between the top and bottom margins, leaving " + round(gridRest(), 2) + " px"
        : gridRows() + " rows filling the " + round(contentH(), 2) +
          " px between the top and bottom margins") + "</dd>" +
      "<dt>Grid 2</dt><dd>" + round(baseline() / 2, 3) + " px</dd>" +
      "<dt>Leading</dt><dd>every role snaps to a whole number of rows, and every baseline sits on a line</dd>" +
      "<dt>Family</dt><dd>" + esc(familyStack()) + "</dd>" +
      "</dl></div></div>" + sheetFoot("Typography");
  }

  // every colour in the design with its values and how it holds up against the others
  function colourSheet() {
    var uses = [
      { name: "Format background", hex: state.stage.bg },
      { name: "Rectangle fill", hex: state.rect.fill },
      { name: "Logo fill", hex: state.logo.fill },
      { name: "Guides", hex: guideColour() }
    ];
    ROLES.forEach(function (r) {
      uses.push({ name: ROLE_NAMES[r] + " text", hex: state.type.roles[r].color });
    });

    // one card per colour, listing everything it is used for
    var order = [], byHex = {};
    uses.forEach(function (u) {
      var key = String(u.hex).toUpperCase();
      if (!byHex[key]) { byHex[key] = []; order.push(key); }
      byHex[key].push(u.name);
    });
    var cards = order.map(function (hex) {
      return '<div class="sw"><div class="sw-chip" style="background:' + hex + '"></div>' +
        '<div class="sw-body"><div class="sw-name">' + esc(byHex[hex].join(", ")) + "</div>" +
        '<div class="sw-val">' + hex + "<br>" + rgbLabel(hex) + "</div></div></div>";
    }).join("");

    var grounds = [
      { name: "the format background", hex: state.stage.bg },
      { name: "the rectangle fill", hex: state.rect.fill }
    ];
    var rows = [];
    ROLES.forEach(function (r) {
      var fg = state.type.roles[r].color, px = rolePx(r);
      var large = px >= 24 || (px >= 18.66 && state.type.roles[r].weight >= 700);
      grounds.forEach(function (g) {
        var ratio = contrastRatio(fg, g.hex), need = large ? 3 : 4.5;
        rows.push("<tr><td>" + esc(ROLE_NAMES[r]) + " on " + esc(g.name) + "</td>" +
          "<td>" + fg.toUpperCase() + " on " + g.hex.toUpperCase() + "</td>" +
          "<td>" + round(px, 1) + " px" + (large ? " (large)" : "") + "</td>" +
          "<td>" + round(ratio, 2) + ":1</td>" +
          '<td class="' + (ratio >= need ? "pass" : "fail") + '">' +
          (ratio >= need ? "passes AA" : "under AA (" + need + ":1)") + "</td></tr>");
      });
    });

    return '<h1>Colour</h1><p class="lede">Every colour the design uses, with its values and how ' +
      "each piece of type holds up against what sits behind it. Contrast is the WCAG 2 ratio; AA " +
      "asks 4.5:1 for text and 3:1 for large text.</p>" +
      '<div class="rule"></div><h2>Palette</h2><div class="swatches">' + cards + "</div>" +
      '<h2 style="margin-top:34px">Contrast</h2><table><thead><tr><th>Pairing</th><th>Colours</th>' +
      "<th>Size</th><th>Ratio</th><th>WCAG AA</th></tr></thead><tbody>" + rows.join("") +
      "</tbody></table>" + sheetFoot("Colour");
  }

  function openSheet(kind) {
    var el = $("#sheet");
    el.innerHTML = kind === "colour" ? colourSheet() : typeSheet();
    $("#sheet-title").textContent = (kind === "colour" ? "Colour" : "Typography") +
      " sheet — 1920 × 1080 · 16:9";
    $("#sheet-wrap").hidden = false;
    fitSheet();
  }

  function fitSheet() {
    var wrap = $("#sheet-wrap"), el = $("#sheet");
    if (wrap.hidden) return;
    var box = $(".sheet-scroll").getBoundingClientRect();
    var s = Math.min(1, (box.width - 48) / 1920, (box.height - 48) / 1080);
    el.style.transform = "scale(" + s + ")";
    el.style.marginBottom = (1080 * s - 1080) + "px";
  }

  /* -------------------------------------------- logo artwork and font files */

  var gfKey = "";
  try { gfKey = localStorage.getItem(GF_KEY_STORAGE) || ""; } catch (e) {}

  function fontStatus(msg, kind) {
    var el = $("#font-status");
    el.textContent = msg || "";
    el.className = "status" + (kind ? " " + kind : "");
  }
  function gfStatus(msg, kind) {
    var el = $("#gf-status");
    el.textContent = msg || "";
    el.className = "status" + (kind ? " " + kind : "");
  }

  // an SVG without width/height reports no natural size; its viewBox has the ratio
  function svgAspect(dataUrl) {
    try {
      var comma = dataUrl.indexOf(",");
      var body = dataUrl.slice(comma + 1);
      var text = /;base64/i.test(dataUrl.slice(0, comma)) ? atob(body) : decodeURIComponent(body);
      var vb = /viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
      if (vb) {
        var w = parseFloat(vb[1]), h = parseFloat(vb[2]);
        if (w > 0 && h > 0) return w / h;
      }
    } catch (e) {}
    return null;
  }

  function loadLogoFile(file) {
    if (file.size > 8 * 1024 * 1024) return fontStatus("That logo file is over 8 MB — use a smaller one.", "err");
    var reader = new FileReader();
    reader.onload = function () {
      var url = String(reader.result);
      var img = new Image();
      img.onload = function () {
        var a = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null;
        if (!a && /svg/i.test(file.type)) a = svgAspect(url);
        state.logo.aspect = a || 1;
        state.logo.src = url;
        state.logo.visible = true;
        state.sel = "logo";
        render();
      };
      img.onerror = function () { fontStatus("That file could not be read as an image.", "err"); };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function loadFontFile(file) {
    if (!window.FontFace) return fontStatus("This browser cannot load font files.", "err");
    if (file.size > 4 * 1024 * 1024) return fontStatus("That font file is over 4 MB — use a subset.", "err");
    var name = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Uploaded font";
    var reader = new FileReader();
    reader.onload = function () {
      var src = String(reader.result);
      var face;
      try { face = new FontFace(name, 'url("' + src + '")'); }
      catch (e) { return fontStatus("That font file could not be read.", "err"); }
      face.load().then(function (f) {
        document.fonts.add(f);
        state.type.uploads = state.type.uploads.filter(function (u) { return u.name !== name; });
        state.type.uploads.push({ name: name, src: src });
        state.type.family = "u:" + name;
        buildFamilySelect();
        fontStatus("Using " + name + ".", "ok");
        render();
      }, function () {
        fontStatus("The browser rejected that font file — try .woff2, .woff, .ttf or .otf.", "err");
      });
    };
    reader.readAsDataURL(file);
  }

  function loadGoogleCatalogue() {
    if (!gfKey) return gfStatus("Paste a Google Fonts API key first.", "err");
    gfStatus("Loading the catalogue…");
    fetchTimeout("https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=" +
      encodeURIComponent(gfKey), {}, 15000)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) throw new Error(data.error.message || "Google refused the key.");
        var names = (data.items || []).map(function (i) { return i.family; }).filter(Boolean);
        if (!names.length) throw new Error("The catalogue came back empty.");
        try { localStorage.setItem(GF_CACHE_KEY, JSON.stringify(names)); } catch (e) {}
        buildGoogleList();
        gfStatus(names.length + " families loaded and cached in this browser.", "ok");
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : String(err);
        gfStatus(/failed to fetch|timed out|networkerror|load failed/i.test(msg)
          ? "Could not reach the Google Fonts API — check the connection, then the key."
          : msg, "err");
      });
  }

  /* ------------------------------------------- background image generation */

  function cfStatus(msg, kind) {
    var el = $("#cf-status");
    el.textContent = msg || "";
    el.className = "status" + (kind ? " " + kind : "");
  }

  function showRaw(data) {
    var wrap = $("#cf-raw-wrap");
    wrap.hidden = false;
    var text = JSON.stringify(data, null, 1);
    $("#cf-raw").textContent = text.length > 4000 ? text.slice(0, 4000) + "\n… truncated" : text;
  }

  function fillPlaceholders(text) {
    var c = state.comfy;
    return String(text)
      .replace(/\{\{\s*prompt\s*\}\}/g, JSON.stringify(c.prompt))
      .replace(/\{\{\s*negative\s*\}\}/g, JSON.stringify(c.negative))
      .replace(/\{\{\s*seed\s*\}\}/g, String(Math.round(c.seed)))
      .replace(/\{\{\s*width\s*\}\}/g, String(Math.round(state.stage.w)))
      .replace(/\{\{\s*height\s*\}\}/g, String(Math.round(state.stage.h)));
  }

  // dig an image out of whatever shape the worker returns
  var B64_MAGIC = [
    ["iVBORw0KGgo", "image/png"], ["/9j/", "image/jpeg"], ["R0lGOD", "image/gif"],
    ["UklGR", "image/webp"], ["PHN2Zw", "image/svg+xml"], ["Qk0", "image/bmp"]
  ];
  var IMAGE_KEYS = /^(image|images|data|base64|b64|b64_json|img|message)$/i;

  function asImage(text, key) {
    var s = String(text).trim();
    if (/^data:image\//i.test(s)) return s;
    if (/^https?:\/\/[^\s"']+\.(png|jpe?g|webp|gif|avif|svg)(\?[^\s"']*)?$/i.test(s)) return s;
    var b64 = s.replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64) || b64.length < 64) return null;
    // the first few base64 characters identify the file type outright
    for (var i = 0; i < B64_MAGIC.length; i++) {
      if (b64.indexOf(B64_MAGIC[i][0]) === 0) return "data:" + B64_MAGIC[i][1] + ";base64," + b64;
    }
    // otherwise only trust it under a key that is meant to hold an image
    if (IMAGE_KEYS.test(key || "")) return "data:image/png;base64," + b64;
    return null;
  }

  function findImage(node, key, depth) {
    depth = depth || 0;
    if (node === null || node === undefined || depth > 8) return null;
    if (typeof node === "string") return asImage(node, key);
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var hit = findImage(node[i], key, depth + 1);
        if (hit) return hit;
      }
      return null;
    }
    if (typeof node === "object") {
      var priority = ["image", "images", "data", "base64", "b64_json", "url", "message", "output", "result"];
      var ordered = priority.filter(function (k) { return k in node; })
        .concat(Object.keys(node).filter(function (k) { return priority.indexOf(k) < 0; }));
      for (var j = 0; j < ordered.length; j++) {
        var found = findImage(node[ordered[j]], ordered[j], depth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  // a request that never answers should say so rather than sit on "loading" forever
  function fetchTimeout(url, opts, ms) {
    opts = opts || {};
    ms = ms || 30000;
    if (!window.AbortController) return fetch(url, opts);
    var ctrl = new AbortController(), done = false;
    var timer = setTimeout(function () { done = true; ctrl.abort(); }, ms);
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(function (r) {
      clearTimeout(timer);
      return r;
    }, function (err) {
      clearTimeout(timer);
      if (done) throw new Error("No answer after " + Math.round(ms / 1000) + " seconds — the request timed out.");
      throw err;
    });
  }

  function readJSON(res) {
    return res.text().then(function (text) {
      var data;
      try { data = JSON.parse(text); }
      catch (e) { throw new Error("HTTP " + res.status + " — the response was not JSON: " + text.slice(0, 200)); }
      if (!res.ok) throw new Error("HTTP " + res.status + " — " + (data.error || text.slice(0, 200)));
      return data;
    });
  }

  function explain(err) {
    var msg = err && err.message ? err.message : String(err);
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      return "The browser could not reach the endpoint. This is usually CORS: the page is on " +
        location.origin + ", and the endpoint has to allow cross-origin requests from it. " +
        "Put a small proxy in front of RunPod, or run this page from the same origin as the proxy.";
    }
    return msg;
  }

  function setBusy(on) {
    var b = $("#cf-generate");
    b.disabled = on;
    b.textContent = on ? "Generating…" : "Generate background";
  }

  function poll(base, id, tries) {
    if (tries > 150) return Promise.reject(new Error("Timed out after 5 minutes waiting for the job."));
    return fetchTimeout(base + "/status/" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + comfyKey }
    }, 30000).then(readJSON).then(function (data) {
      var st = String(data.status || "").toUpperCase();
      if (st === "COMPLETED") { showRaw(data); return data; }
      if (st === "FAILED" || st === "CANCELLED" || st === "TIMED_OUT") {
        showRaw(data);
        throw new Error("The job " + st.toLowerCase() + ": " + JSON.stringify(data.error || data.output || "").slice(0, 300));
      }
      cfStatus("Job " + (st.toLowerCase().replace("_", " ") || "running") + "… (" + (tries * 2) + "s)");
      return new Promise(function (resolve) { setTimeout(resolve, 2000); })
        .then(function () { return poll(base, id, tries + 1); });
    });
  }

  function generate() {
    var c = state.comfy, ep = String(c.endpoint || "").trim();
    if (!ep) return cfStatus("Add your RunPod endpoint ID, or a full URL.", "err");
    if (!comfyKey) return cfStatus("Add your API key.", "err");
    var workflow;
    try { workflow = JSON.parse(fillPlaceholders(c.workflow)); }
    catch (err) { return cfStatus("The workflow is not valid JSON once the placeholders are filled in: " + err.message, "err"); }

    var base = /^https?:\/\//i.test(ep)
      ? ep.replace(/\/+$/, "")
      : "https://api.runpod.ai/v2/" + ep.replace(/^\/+|\/+$/g, "");
    var runUrl = /\/(run|runsync)$/.test(base) ? base : base + "/run";
    var statusBase = base.replace(/\/(run|runsync)$/, "");

    setBusy(true);
    cfStatus("Sending the workflow…");
    fetchTimeout(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + comfyKey },
      body: JSON.stringify({ input: { workflow: workflow } })
    }, 45000).then(readJSON).then(function (data) {
      showRaw(data);
      var st = String(data.status || "").toUpperCase();
      if (st === "COMPLETED" || data.output) return data;
      if (data.error) throw new Error(String(data.error));
      if (!data.id) throw new Error("No job id came back from the endpoint.");
      cfStatus("Queued as " + data.id + "…");
      return poll(statusBase, data.id, 0);
    }).then(function (data) {
      var img = findImage(data.output !== undefined ? data.output : data, "output");
      if (!img) throw new Error("The job finished but no image was found in the response — open “Raw response” to see what came back.");
      state.bg.src = img;
      setBusy(false);
      cfStatus("Background updated.", "ok");
      render();
    }).catch(function (err) {
      setBusy(false);
      cfStatus(explain(err), "err");
    });
  }

  /* ------------------------------------------------------------------ boot */

  cacheEls();
  buildCornerRows();
  buildShapeSelect();
  buildPresetSelect();
  buildFormatSelect();
  buildTypeSelects();
  buildTextBlocks();
  buildGrid("#rect-align", "rect", "align");
  buildGrid("#rect-anchor", "rect", "anchor");
  buildGrid("#logo-align", "logo", "align");
  buildGrid("#logo-anchor", "logo", "anchor");
  $("#key-warning").textContent =
    "The key is kept in this browser only and sent straight to RunPod — never to this site. " +
    "Anyone with access to this browser profile can read it, so do not use a shared machine, and never commit it to the repository.";
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { blOffset = {}; render(); });
  }
  state.type.uploads.forEach(registerUpload);
  state.type.google.forEach(loadGoogleFont);
  if (state.type.family.indexOf("g:") === 0) loadGoogleFont(state.type.family.slice(2));
  $("#gf-key").value = gfKey;
  bindPanel();
  bindCanvas();
  render();
})();
