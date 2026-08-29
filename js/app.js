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
  var STORAGE_KEY = "bos.design.v7";

  var FORMATS = [
    { id: "1080x1080", name: "Square", w: 1080, h: 1080 },
    { id: "1080x1350", name: "Portrait 4:5", w: 1080, h: 1350 },
    { id: "1080x1920", name: "Story 9:16", w: 1080, h: 1920 },
    { id: "1920x1080", name: "Landscape 16:9", w: 1920, h: 1080 },
    { id: "1240x1754", name: "A5 · 150 dpi", w: 1240, h: 1754 },
    { id: "2480x3508", name: "A4 · 300 dpi", w: 2480, h: 3508 }
  ];

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
  var ROLES = ["headline", "subline", "paragraph", "smallprint"];
  var ROLE_NAMES = {
    headline: "Headline", subline: "Subline", paragraph: "Paragraph", smallprint: "Small print"
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
      v: 7,
      stage: { w: 1080, h: 1350, bg: "#111318" },
      bg: { src: "", fit: "cover", opacity: 100 },
      comfy: { endpoint: "", workflow: DEFAULT_WORKFLOW, prompt: "", negative: "", seed: 12345, remember: false },
      margin: { mode: "manual", factor: 1, linked: true, top: 80, right: 80, bottom: 80, left: 80 },
      round: true,
      rect: {
        visible: true, w: 520, h: 360, full: false,
        align: { h: "left", v: "bottom" }, anchor: { h: "left", v: "bottom" },
        fill: "#4f7cff", linked: true, elliptical: false,
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
        grid: "both",           // baseline grid on the canvas: off | full | half | both
        // every role is a multiple of the paragraph size; line heights snap to the
        // baseline grid unless a role is set free
        roles: {
          headline:   { mult: 2.618, tag: "h1", snap: "full", weight: 700, lh: 1.05, ls: -0.02, transform: "none", color: "#ffffff" },
          subline:    { mult: 1.618, tag: "h2", snap: "half", weight: 600, lh: 1.2, ls: -0.01, transform: "none", color: "#ffffff" },
          paragraph:  { mult: 1, tag: "p", snap: "free", weight: 400, lh: 1.5, ls: 0, transform: "none", color: "#ffffff" },
          smallprint: { mult: 0.5, tag: "p", snap: "half", weight: 400, lh: 1.4, ls: 0.02, transform: "none", color: "#ffffff" }
        },
        google: [], uploads: [],
        editing: "headline"
      },
      text: {
        padding: 48, gap: 14, align: "middle", snapGrid: true,
        blocks: [
          { visible: true, role: "headline", align: "left", text: "Headline goes here" },
          { visible: true, role: "subline", align: "left", text: "A subline carrying the second thought" },
          { visible: true, role: "paragraph", align: "left", text: "A supporting line of copy that explains the headline in a few words." },
          { visible: true, role: "smallprint", align: "left", text: "Small print: terms, credits and the things set in the quiet size." }
        ]
      },
      guides: { mode: "auto", color: "#ff2d55" },
      view: { zoom: null, pan: { x: 0, y: 0 }, panned: false },
      showRail: true,
      sel: "rect"
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
      ["stage", "bg", "comfy", "margin", "logo", "view", "text", "guides"].forEach(function (k) {
        s[k] = Object.assign(d[k], s[k]);
      });
      s.type = Object.assign(d.type, s.type);
      s.type.roles = Object.assign(d.type.roles, s.type.roles);
      if (!Array.isArray(s.text.blocks) || !s.text.blocks.length) s.text.blocks = d.text.blocks;
      s.rect = Object.assign(d.rect, s.rect);
      s.rect.corners = Object.assign(d.rect.corners, s.rect.corners);
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

  // the logo is defined by its height; the width follows the artwork's aspect ratio
  function logoSize() {
    var lg = state.logo;
    var h = Math.max(MIN_SIZE, lenPx(lg.h));
    return { w: Math.max(MIN_SIZE, h * (lg.aspect || 1)), h: h };
  }

  function setLogoHeightPx(px) {
    var len = state.logo.h;
    var v = len.u === "%" ? px / Math.max(1, longSide()) * 100 : px;
    len.v = Math.max(state.round ? 1 : 0.1, snap(v));
  }

  function setLogoUnit(u) {
    var len = state.logo.h, px = lenPx(len);
    len.u = u;
    len.v = Math.max(state.round ? 1 : 0.1, snap(u === "%" ? px / Math.max(1, longSide()) * 100 : px));
  }

  function margins() {
    var m = state.margin;
    if (m.mode !== "manual") {
      var v = snap(m.factor * (m.mode === "logoH" ? logoSize().h : logoSize().w));
      return { top: v, right: v, bottom: v, left: v };
    }
    return { top: m.top, right: m.right, bottom: m.bottom, left: m.left };
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

  function sizeOf(name) {
    if (name === "logo") return logoSize();
    var c = content();
    return { w: state.rect.full ? c.w : state.rect.w, h: state.rect.h };
  }

  // anchor point of the shape lands on the aligned point of the content box
  function box(name) {
    var el = state[name], c = content(), s = sizeOf(name);
    return {
      x: c.x + c.w * fh(el.align.h) - s.w * fh(el.anchor.h),
      y: c.y + c.h * fv(el.align.v) - s.h * fv(el.anchor.v),
      w: s.w, h: s.h
    };
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
    els.overlay = $("#overlay"); els.railList = $("#rail-list"); els.baseline = $("#baseline");
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

  // grid 1 divides that height into whole rows, so it always fits exactly. the stored
  // paragraph line height is the target; the row count is the nearest whole number to it
  function gridRows() {
    var maxRows = Math.max(1, Math.floor(contentH() / (paraPx() * 0.5)));
    var target = Math.max(0.5, state.type.roles.paragraph.lh);
    return clamp(Math.round(contentH() / (paraPx() * target)), 1, maxRows);
  }

  // grid 1 is one row; grid 2 halves it
  function baseline() {
    return contentH() / gridRows();
  }

  // and the row height is what the paragraph line height actually is
  function paraLh() {
    return baseline() / paraPx();
  }

  // typing a row count writes back through the target line height
  function setRows(rows) {
    var r = Math.max(1, Math.round(rows));
    state.type.roles.paragraph.lh = round(contentH() / r / paraPx(), 4);
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
    r.headline.mult = round(sys.r * sys.r, 3);
    r.subline.mult = round(sys.r, 3);
    r.paragraph.mult = 1;
    r.smallprint.mult = round(1 / sys.r, 3);
    state.type.system = id;
  }

  function textVisible() {
    return state.text.blocks.some(function (b) { return b.visible && b.text.trim(); });
  }

  // ascent and descent as a share of the font size, measured once per family+weight.
  // these are what decide where the browser puts the baseline inside a line box
  var metricsCache = {};
  function fontMetrics(weight) {
    var key = weight + "|" + familyStack();
    if (metricsCache[key]) return metricsCache[key];
    var m = { a: 0.8, d: 0.2 };                       // a sane guess if the API is missing
    try {
      var cv = metricsCache._cv || (metricsCache._cv = document.createElement("canvas"));
      var ctx = cv.getContext("2d");
      ctx.font = weight + " 100px " + familyStack();
      var t = ctx.measureText("Hxpg");
      if (t.fontBoundingBoxAscent && t.fontBoundingBoxDescent) {
        m = { a: t.fontBoundingBoxAscent / 100, d: t.fontBoundingBoxDescent / 100 };
      }
    } catch (e) {}
    metricsCache[key] = m;
    return m;
  }

  // distance from the top of a role's line box down to its baseline, in format units
  function baselineInBox(role) {
    var size = rolePx(role), lead = size * roleLh(role);
    var m = fontMetrics(state.type.roles[role].weight);
    var content = (m.a + m.d) * size;                 // the font's own content area
    return (lead - content) / 2 + m.a * size;         // half-leading, then the ascender
  }

  // the gap between blocks, snapped to the half baseline so the rhythm holds
  function textGap() {
    if (!state.text.snapGrid) return state.text.gap;
    var unit = baseline() / 2;
    if (state.text.gap <= 0) return 0;
    // never round a real gap away to nothing on a coarse grid
    return Math.max(1, Math.round(state.text.gap / unit)) * unit;
  }

  function paintText(rectEl, s) {
    var t = state.text;
    var blocks = t.blocks.filter(function (b) { return b.visible && b.text.trim(); });
    var stack = child(rectEl, "text", "div", "text-stack");
    if (!blocks.length) { stack.hidden = true; return; }
    stack.hidden = false;

    var sig = blocks.map(function (b) {
      return b.role + "\u0000" + state.type.roles[b.role].tag + "\u0000" + b.text;
    }).join("\u0001");
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
    Object.assign(stack.style, {
      inset: t.padding * s + "px",
      gap: textGap() * s + "px",
      justifyContent: t.align === "top" ? "flex-start" : t.align === "bottom" ? "flex-end" : "center",
      fontFamily: familyStack()
    });
    Array.prototype.forEach.call(stack.children, function (el, i) {
      var b = blocks[i], st = state.type.roles[b.role];
      Object.assign(el.style, {
        fontSize: rolePx(b.role) * s + "px",
        fontWeight: st.weight,
        lineHeight: roleLh(b.role),
        letterSpacing: st.ls + "em",
        textTransform: st.transform,
        color: st.color,
        textAlign: b.align
      });
    });
  }

  // line boxes and gaps are whole grid rows, but a baseline sits inside its box —
  // half-leading plus the ascender — so each block gets nudged onto its grid line.
  // the shift is relative, so it moves the type without disturbing the spacing
  function alignBaselines(stack, s) {
    if (!stack || stack.hidden) return;
    var blocks = state.text.blocks.filter(function (b) { return b.visible && b.text.trim(); });
    var kids = Array.prototype.slice.call(stack.children);
    if (kids.length !== blocks.length) return;

    kids.forEach(function (el) { el.style.top = "0px"; });
    if (!state.text.snapGrid) return;

    var stageTop = els.stage.getBoundingClientRect().top + margins().top * s;
    var shifts = kids.map(function (el, i) {
      var role = blocks[i].role;
      var unit = roleUnit(role) * s;
      if (!(unit > 0.5)) return 0;
      var probe = el._probe || el.querySelector(".bl-probe");
      if (!probe) return 0;
      var fromGrid = probe.getBoundingClientRect().bottom - stageTop;
      var r = ((fromGrid % unit) + unit) % unit;
      return r <= unit / 2 ? -r : unit - r;          // whichever grid line is nearer
    });
    kids.forEach(function (el, i) { el.style.top = shifts[i] + "px"; });
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
      var showRect = state.rect.visible || textVisible();
      rectEl.hidden = !showRect;
      if (showRect) {
        Object.assign(rectEl.style, shapeStyle("rect", s), {
          background: state.rect.visible ? state.rect.fill : "transparent",
          borderRadius: radiusCSS(s)
        });
        paintText(rectEl, s);
      }

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

  function renderStage() {
    document.body.classList.toggle("rail-open", !!state.showRail);
    var s = scale(), p = pan(), st = state.stage;
    paintInto(els.stage, st.w, st.h, s);
    Object.assign(els.stage.style, { left: p.x + "px", top: p.y + "px" });
    Object.assign(els.overlay.style, {
      width: st.w * s + "px", height: st.h * s + "px", left: p.x + "px", top: p.y + "px"
    });

    els.guides.style.setProperty("--guide", guideColour());
    var m = margins();
    els.guides.querySelector("[data-side=top]").style.top = m.top * s + "px";
    els.guides.querySelector("[data-side=bottom]").style.top = (st.h - m.bottom) * s + "px";
    els.guides.querySelector("[data-side=left]").style.left = m.left * s + "px";
    els.guides.querySelector("[data-side=right]").style.left = (st.w - m.right) * s + "px";

    renderBaseline(s);
    alignBaselines(els.stage._rect && els.stage._rect._text, s);
    renderFrame(s);
    renderRail();
    els.zoomValue.textContent = Math.round(s * 100) + "%";
    renderReadout();
  }

  // the baseline grid: paragraph line boxes, drawn down the margin box from its top edge
  function renderBaseline(s) {
    var mode = state.type.grid;
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

  /* ------------------------------------------------ the format preview rail */

  var TILE = { w: 116, h: 132 };

  function railFormats() {
    var list = FORMATS.slice();
    var id = fmt(state.stage.w) + "x" + fmt(state.stage.h);
    if (!list.some(function (f) { return f.id === id; })) {
      list.unshift({ id: id, name: "Custom", w: state.stage.w, h: state.stage.h, custom: true });
    }
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
    var shown = name && state[name] && state[name].visible;
    els.frame.hidden = !shown;
    if (!shown) { frameFor = null; return; }
    var key = name;
    if (frameFor !== key) { els.frame.innerHTML = frameHandles(name); frameFor = key; }

    var b = box(name);
    Object.assign(els.frame.style, shapeStyle(name, s));
    els.frame.classList.toggle("full-width", name === "rect" && state.rect.full);
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

  function renderReadout() {
    var m = margins(), parts = [
      "Format " + fmt(state.stage.w) + " × " + fmt(state.stage.h),
      "Margins " + fmt(m.top) + " / " + fmt(m.right) + " / " + fmt(m.bottom) + " / " + fmt(m.left) +
        (state.margin.mode !== "manual" ? " (logo " + (state.margin.mode === "logoH" ? "height" : "width") +
          " × " + state.margin.factor + ")" : "")
    ];
    if (state.rect.visible) {
      var b = box("rect");
      parts.push("Rectangle " + fmt(b.w) + " × " + fmt(b.h) + " — " + state.rect.align.v + " " + state.rect.align.h);
    }
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
    var full = name === "rect" && state.rect.full;

    if (full) {
      out.push("left: " + fmt(m.left) + "px");
      out.push("right: " + fmt(m.right) + "px");
    } else if (el.align.h === "left" && el.anchor.h === "left") out.push("left: " + fmt(m.left) + "px");
    else if (el.align.h === "right" && el.anchor.h === "right") out.push("right: " + fmt(m.right) + "px");
    else if (el.align.h === "center" && el.anchor.h === "center") { out.push("left: 50%"); tx = "-50%"; }
    else out.push("left: " + fmt(b.x) + "px");

    if (el.align.v === "top" && el.anchor.v === "top") out.push("top: " + fmt(m.top) + "px");
    else if (el.align.v === "bottom" && el.anchor.v === "bottom") out.push("bottom: " + fmt(m.bottom) + "px");
    else if (el.align.v === "middle" && el.anchor.v === "middle") { out.push("top: 50%"); ty = "-50%"; }
    else out.push("top: " + fmt(b.y) + "px");

    if (!full) out.push("width: " + fmt(b.w) + "px");
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
    if (state.rect.visible) {
      lines.push("");
      lines.push(".rectangle {");
      lines.push("  position: absolute;");
      lines.push(positionCSS("rect", "  "));
      lines.push("  border-radius: " + radiusCSS(1) + ";");
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
    var t = state.text, used = t.blocks.filter(function (b) { return b.visible && b.text.trim(); });
    if (used.length) {
      lines.push("");
      if (state.type.family.indexOf("g:") === 0) {
        var gname = state.type.family.slice(2);
        lines.push("@import url(\"https://fonts.googleapis.com/css2?family=" +
          gname.replace(/ /g, "+") + ":ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,400&display=swap\");");
      } else if (state.type.family.indexOf("u:") === 0) {
        lines.push("/* @font-face for \"" + state.type.family.slice(2) + "\" — ship the uploaded file yourself */");
      }
      lines.push(".rectangle .text {");
      lines.push("  position: absolute;");
      lines.push("  inset: " + fmt(t.padding) + "px;");
      lines.push("  display: flex;");
      lines.push("  flex-direction: column;");
      lines.push("  justify-content: " +
        (t.align === "top" ? "flex-start" : t.align === "bottom" ? "flex-end" : "center") + ";");
      lines.push("  gap: " + fmt(t.gap) + "px;");
      lines.push("  font-family: " + familyStack() + ";");
      lines.push("}");
      lines.push("");
      lines.push(".rectangle .text > * { margin: 0; }");
      lines.push("/* grid 1: " + gridRows() + " rows of " + round(baseline(), 3) + "px filling the " +
        round(contentH(), 2) + "px content height; grid 2 halves it at " + round(baseline() / 2, 3) + "px */");

      var roles = [];
      used.forEach(function (b) { if (roles.indexOf(b.role) < 0) roles.push(b.role); });
      ROLES.filter(function (r) { return roles.indexOf(r) >= 0; }).forEach(function (r) {
        var st = state.type.roles[r], size = rolePx(r), lh = roleLh(r), steps = roleSteps(r);
        lines.push("");
        lines.push(".rectangle .text ." + r + " {");
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
        lines.push(".rectangle .text .align-" + a + " { text-align: " + a + "; }");
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
    var inner = [];
    if (state.rect.visible || used.length) {
      inner.push('  <div class="rectangle">');
      if (used.length) {
        inner.push('    <div class="text">');
        used.forEach(function (b) {
          var tag = state.type.roles[b.role].tag || "p";
          inner.push('      <' + tag + ' class="' + b.role + " align-" + b.align + '">' +
            esc(b.text) + "</" + tag + ">");
        });
        inner.push("    </div>");
      }
      inner.push("  </div>");
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
    });
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

  function buildPresetSelect() {
    $("#corner-preset").innerHTML = '<option value="">Custom…</option>' +
      CORNER_PRESETS.map(function (p) {
        return '<option value="' + p.id + '">' + esc(p.name) + "</option>";
      }).join("");
  }

  function buildFormatSelect() {
    $("#stage-preset").innerHTML = '<option value="">Custom…</option>' +
      FORMATS.map(function (f) {
        return '<option value="' + f.id + '">' + esc(f.name) + " — " + f.w + " × " + f.h + "</option>";
      }).join("");
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
    $("#text-blocks").innerHTML = state.text.blocks.map(function (b, i) {
      return '<div class="block" data-i="' + i + '">' +
        '<div class="block-head">' +
          '<label class="check"><input type="checkbox" data-block="visible"><span>Block ' + (i + 1) + "</span></label>" +
          '<select data-block="role" class="level">' +
            ROLES.map(function (r) { return '<option value="' + r + '">' + esc(ROLE_NAMES[r]) + "</option>"; }).join("") +
          "</select>" +
        "</div>" +
        '<textarea data-block="text" rows="2" spellcheck="false"></textarea>' +
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
    preset.value = fmt(st.w) + "x" + fmt(st.h);
    if (preset.selectedIndex < 0) preset.selectedIndex = 0;
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
    var mm = margins();
    SIDES.forEach(function (s) {
      var input = $("#margin-" + s);
      setValue(input, fmt(mm[s]));
      input.disabled = m.mode !== "manual";
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
      : "Every margin is " + m.factor + " × the logo " + (m.mode === "logoH" ? "height" : "width") +
        " (" + fmt(m.mode === "logoH" ? logoSize().h : logoSize().w) + ") = " + fmt(mm.top) + ".";

    $("#rect-visible").checked = r.visible;
    syncGrid("#rect-align", r); syncGrid("#rect-anchor", r);
    $("#rect-full").checked = r.full;
    $("#rect-w").disabled = r.full;
    setValue($("#rect-w"), fmt(sizeOf("rect").w));
    setValue($("#rect-h"), fmt(r.h));
    $("#rect-fill").value = r.fill;

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
    $("#logo-size-hint").textContent = (lg.src ? "Artwork " : "Circle ") +
      fmt(ls.w) + " × " + fmt(ls.h) + " — long side of this format is " + fmt(longSide()) +
      (lg.src ? ", artwork ratio " + round(lg.aspect, 3) + ":1" : "") + ".";

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
    setValue($("#type-rows"), gridRows());
    $("#type-rowpx").value = round(baseline(), 2) + " px";
    $("#type-grid-hint").textContent = "Grid 1 divides the " + round(contentH(), 1) +
      " px between the top and bottom margins into " + gridRows() + " rows of " + round(baseline(), 2) +
      " px, so it fits exactly. That row is the paragraph line height — " + round(paraPx(), 1) + " px × " +
      round(paraLh(), 3) + ". Grid 2 halves it at " + round(baseline() / 2, 2) + " px.";

    $("#type-level").value = ty.editing;
    $("#type-tag").value = st2.tag;
    $("#type-weight").value = String(st2.weight);
    setValue($("#type-lh"), round(ty.editing === "paragraph" ? paraLh() : st2.lh, 3));
    $("#type-snap").value = ty.editing === "paragraph" ? "free" : st2.snap;
    $("#type-snap").disabled = ty.editing === "paragraph";
    setValue($("#type-ls"), st2.ls);
    $("#type-transform").value = st2.transform;
    $("#type-color").value = st2.color;
    var eff = roleLh(ty.editing), steps = roleSteps(ty.editing);
    $("#type-lh-px").textContent = "= " + round(rolePx(ty.editing) * eff, 1) + " px";
    $("#type-style-hint").textContent = ty.editing === "paragraph"
      ? "Paragraph rides grid 1: " + gridRows() + " rows fill the content height exactly, so its line " +
        "height is " + round(paraLh(), 4) + ". Type another and the nearest whole row count that still " +
        "fits is used."
      : steps
        ? "Line height " + round(st2.lh, 2) + " snaps to " + round(eff, 3) + " so the line box is " +
          steps + " × grid " + (st2.snap === "half" ? "2" : "1") + " = " +
          round(rolePx(ty.editing) * eff, 1) + " px."
        : "Free: the typed line height is used as it is, off both grids.";

    setValue($("#text-padding"), fmt(state.text.padding));
    setValue($("#text-gap"), fmt(state.text.gap));
    $("#text-align").value = state.text.align;
    $("#text-snap").checked = state.text.snapGrid;
    $("#text-snap-hint").textContent = !state.text.snapGrid
      ? "Padding and gap are used exactly as typed."
      : "Gap " + fmt(state.text.gap) + " runs as " + round(textGap(), 1) +
        " — a whole number of grid 2 rows — and every block is nudged so its baselines sit on its own " +
        "grid line, whatever the stack alignment.";
    Array.prototype.forEach.call($("#text-blocks").children, function (row, i) {
      var b = state.text.blocks[i];
      row.querySelector('[data-block="visible"]').checked = b.visible;
      row.querySelector('[data-block="role"]').value = b.role;
      setValue(row.querySelector('[data-block="text"]'), b.text);
      Array.prototype.forEach.call(row.querySelectorAll("[data-align]"), function (btn) {
        btn.setAttribute("aria-pressed", btn.dataset.align === b.align ? "true" : "false");
      });
    });

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
    numInput("#stage-w", function (v) { state.stage.w = snap(v); }, 1);
    numInput("#stage-h", function (v) { state.stage.h = snap(v); }, 1);
    onInput("#stage-bg", function (el) { state.stage.bg = el.value; });
    onChange("#stage-preset", function (el) {
      if (!el.value) return;
      var d = el.value.split("x");
      state.stage.w = +d[0]; state.stage.h = +d[1];
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
      if (el.value === "manual" && state.margin.mode !== "manual") {
        var mm = margins();                              // keep what the logo rule produced
        SIDES.forEach(function (s) { state.margin[s] = mm[s]; });
      }
      state.margin.mode = el.value;
    });
    numInput("#margin-factor", function (v) { state.margin.factor = round(v, 3); }, 0);
    onChange("#margin-linked", function (el) {
      state.margin.linked = el.checked;
      if (el.checked) setMargin("top", state.margin.top);
    });
    SIDES.forEach(function (side) {
      numInput("#margin-" + side, function (v) { setMargin(side, snap(v)); }, 0);
    });

    onChange("#rect-visible", function (el) { state.rect.visible = el.checked; if (el.checked) state.sel = "rect"; });
    onChange("#rect-full", function (el) {
      if (el.checked) state.rect.w = sizeOf("rect").w;
      state.rect.full = el.checked;
    });
    numInput("#rect-w", function (v) { state.rect.w = snap(v); }, MIN_SIZE);
    numInput("#rect-h", function (v) { state.rect.h = snap(v); }, MIN_SIZE);
    onInput("#rect-fill", function (el) { state.rect.fill = el.value; });

    onChange("#logo-visible", function (el) { state.logo.visible = el.checked; if (el.checked) state.sel = "logo"; });
    numInput("#logo-h", function (v) { state.logo.h.v = Math.max(0.01, round(v, 2)); }, 0);
    onChange("#logo-hu", function (el) { setLogoUnit(el.value); });
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
    numInput("#type-rows", function (v) { setRows(v); }, 1);
    onChange("#type-tag", function (el) { styleOf().tag = el.value; });
    onChange("#type-snap", function (el) { styleOf().snap = el.value; });
    onChange("#type-weight", function (el) { styleOf().weight = +el.value; });
    numInput("#type-lh", function (v) {
      if (state.type.editing === "paragraph") setRows(contentH() / (paraPx() * Math.max(0.5, v)));
      else styleOf().lh = round(v, 3);
    }, .5);
    numInput("#type-ls", function (v) { styleOf().ls = round(v, 3); });
    onChange("#type-transform", function (el) { styleOf().transform = el.value; });
    onInput("#type-color", function (el) { styleOf().color = el.value; });

    onChange("#text-snap", function (el) { state.text.snapGrid = el.checked; });
    numInput("#text-padding", function (v) { state.text.padding = snap(v); }, 0);
    numInput("#text-gap", function (v) { state.text.gap = snap(v); }, 0);
    onChange("#text-align", function (el) { state.text.align = el.value; });
    $("#text-blocks").addEventListener("input", function (e) {
      var row = e.target.closest(".block");
      if (!row) return;
      var b = state.text.blocks[+row.dataset.i], what = e.target.dataset.block;
      if (what === "text") b.text = e.target.value;
      else return;
      render();
    });
    $("#text-blocks").addEventListener("change", function (e) {
      var row = e.target.closest(".block");
      if (!row) return;
      var b = state.text.blocks[+row.dataset.i], what = e.target.dataset.block;
      if (what === "visible") b.visible = e.target.checked;
      else if (what === "role") b.role = e.target.value;
      else return;
      render();
    });
    $("#text-blocks").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-align]");
      if (!btn) return;
      state.text.blocks[+btn.closest(".block").dataset.i].align = btn.dataset.align;
      render();
    });

    $("#rail-toggle").addEventListener("click", function () {
      state.showRail = !state.showRail;
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
    state.text.gap = Math.round(state.text.gap);
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
    if (!name || !state[name] || !state[name].visible) return;
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
      if (sx && !state.rect.full) state.rect.w = snap(w);
      if (sy) state.rect.h = Math.max(MIN_SIZE, snap(h));
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
    drag(e, function (ev) {
      var p = toStage(ev), st = state.stage;
      var v = side === "left" ? p.x : side === "right" ? st.w - p.x
        : side === "top" ? p.y : st.h - p.y;
      v = Math.max(0, snap(v));
      if (state.margin.mode !== "manual") {
        var base = state.margin.mode === "logoH" ? logoSize().h : logoSize().w;
        state.margin.factor = round(Math.max(0, v / Math.max(MIN_SIZE, base)), 3);
      } else setMargin(side, v);
    });
  }

  function bindCanvas() {
    els.viewport.addEventListener("pointerdown", function (e) {
      if (e.button === 1 || spaceDown) return startPan(e);
      if (e.button !== 0) return;
      var t = e.target;
      if (t.classList.contains("guide")) return startGuide(e, t.dataset.side);
      if (t.classList.contains("handle")) {
        els.frame.focus();
        return t.classList.contains("radius") ? startRadius(e, t.dataset.corner) : startResize(e, t.dataset.dir);
      }
      var shape = t.closest && t.closest(".shape");
      if (shape) {
        state.sel = shape.dataset.el;
        els.frame.focus();
        render();
        return startShapeDrag(e, state.sel);
      }
      if (t === els.frame) { els.frame.focus(); return startShapeDrag(e, state.sel); }
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
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.code === "Space") { spaceDown = true; document.body.classList.add("can-pan"); return; }
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
    document.fonts.ready.then(function () { metricsCache = {}; render(); });
  }
  state.type.uploads.forEach(registerUpload);
  state.type.google.forEach(loadGoogleFont);
  if (state.type.family.indexOf("g:") === 0) loadGoogleFont(state.type.family.slice(2));
  $("#gf-key").value = gfKey;
  bindPanel();
  bindCanvas();
  render();
})();
