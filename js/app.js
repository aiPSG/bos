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
  var STORAGE_KEY = "bos.design.v2";
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
      v: 2,
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
        visible: true, d: 160,
        align: { h: "left", v: "top" }, anchor: { h: "left", v: "top" },
        fill: "#e6e9ef"
      },
      view: { zoom: null, pan: { x: 0, y: 0 }, panned: false },
      sel: "rect"
    };
  }

  var state = load() || defaults();
  var comfyKey = "";
  try { comfyKey = localStorage.getItem(KEY_STORAGE) || ""; } catch (e) {}

  function save() {
    try {
      var copy = JSON.parse(JSON.stringify(state));
      // never persist a big data: URI — it would blow the storage quota
      if (/^data:/.test(copy.bg.src)) copy.bg.src = "";
      copy.view = { zoom: null, pan: { x: 0, y: 0 }, panned: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw), d = defaults();
      if (s.v !== d.v) return null;
      ["stage", "bg", "comfy", "margin", "logo", "view"].forEach(function (k) {
        s[k] = Object.assign(d[k], s[k]);
      });
      s.rect = Object.assign(d.rect, s.rect);
      s.rect.corners = Object.assign(d.rect.corners, s.rect.corners);
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

  /* --------------------------------------------------------------- geometry */

  function margins() {
    var m = state.margin;
    if (m.mode === "logo") {
      var v = snap(m.factor * state.logo.d);
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
    if (name === "logo") return { w: state.logo.d, h: state.logo.d };
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
    els.viewport = $("#viewport"); els.stage = $("#stage"); els.image = $("#stage-image");
    els.rect = $("#rect"); els.logo = $("#logo"); els.frame = $("#frame");
    els.guides = $("#guides"); els.cells = $("#cells"); els.cssOut = $("#css-out");
    els.overlay = $("#overlay");
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

  function shapeStyle(name, s) {
    var b = box(name);
    return { left: b.x * s + "px", top: b.y * s + "px", width: b.w * s + "px", height: b.h * s + "px" };
  }

  function renderStage() {
    var s = scale(), p = pan(), st = state.stage;
    var frame = { width: st.w * s + "px", height: st.h * s + "px", left: p.x + "px", top: p.y + "px" };
    Object.assign(els.stage.style, frame, { background: st.bg });
    Object.assign(els.overlay.style, frame);

    var bg = state.bg;
    if (bg.src) {
      Object.assign(els.image.style, {
        display: "block",
        backgroundImage: 'url("' + bg.src.replace(/"/g, '\\"') + '")',
        backgroundSize: bg.fit === "stretch" ? "100% 100%" : bg.fit === "tile" ? "auto" : bg.fit,
        backgroundRepeat: bg.fit === "tile" ? "repeat" : "no-repeat",
        backgroundPosition: "center",
        opacity: bg.opacity / 100
      });
    } else { els.image.style.display = "none"; }

    var m = margins();
    els.guides.querySelector('[data-side=top]').style.top = m.top * s + "px";
    els.guides.querySelector('[data-side=bottom]').style.top = (st.h - m.bottom) * s + "px";
    els.guides.querySelector('[data-side=left]').style.left = m.left * s + "px";
    els.guides.querySelector('[data-side=right]').style.left = (st.w - m.right) * s + "px";

    els.rect.hidden = !state.rect.visible;
    if (state.rect.visible) {
      Object.assign(els.rect.style, shapeStyle("rect", s),
        { background: state.rect.fill, borderRadius: radiusCSS(s) });
    }
    els.logo.hidden = !state.logo.visible;
    if (state.logo.visible) {
      Object.assign(els.logo.style, shapeStyle("logo", s), { background: state.logo.fill });
    }

    renderFrame(s);
    els.zoomValue.textContent = Math.round(s * 100) + "%";
    renderReadout();
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
    if (frameFor !== name) { els.frame.innerHTML = frameHandles(name); frameFor = name; }

    var b = box(name);
    Object.assign(els.frame.style, shapeStyle(name, s));
    els.frame.classList.toggle("full-width", name === "rect" && state.rect.full);
    els.frame.classList.toggle("round", name === "logo");

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
        (state.margin.mode === "logo" ? " (logo × " + state.margin.factor + ")" : "")
    ];
    if (state.rect.visible) {
      var b = box("rect");
      parts.push("Rectangle " + fmt(b.w) + " × " + fmt(b.h) + " — " + state.rect.align.v + " " + state.rect.align.h);
    }
    if (state.logo.visible) parts.push("Logo ⌀" + fmt(state.logo.d) + " — " + state.logo.align.v + " " + state.logo.align.h);
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
      (state.margin.mode === "logo" ? " — logo width × " + state.margin.factor : "") + " */");
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
      lines.push("  border-radius: 50%;");
      lines.push("  background: " + state.logo.fill + ";");
      lines.push("}");
    }
    els.cssOut.textContent = lines.join("\n");
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
    $("#margin-factor-field").hidden = m.mode !== "logo";
    setValue($("#margin-factor"), m.factor);
    $("#margin-linked").checked = m.linked;
    var mm = margins();
    SIDES.forEach(function (s) {
      var input = $("#margin-" + s);
      setValue(input, fmt(mm[s]));
      input.disabled = m.mode === "logo";
    });
    $("#margin-hint").textContent = m.mode === "logo"
      ? "Every margin is " + m.factor + " × the logo diameter (" + fmt(lg.d) + ") = " + fmt(mm.top) + "."
      : "The margins define the box both shapes are aligned inside.";

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
    setValue($("#logo-d"), fmt(lg.d));
    $("#logo-fill").value = lg.fill;

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

    onChange("#margin-mode", function (el) {
      if (el.value === "manual" && state.margin.mode === "logo") {
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
    numInput("#logo-d", function (v) { state.logo.d = snap(v); }, MIN_SIZE);
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

    $("#copy-css").addEventListener("click", function (e) {
      var text = els.cssOut.textContent, btn = e.target;
      var done = function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy CSS"; }, 1200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
      else done();
    });
    $("#reset").addEventListener("click", function () {
      state = defaults();
      frameFor = null;
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
    state.logo.d = Math.round(state.logo.d);
    CORNERS.forEach(function (n) {
      var c = r.corners[n]; c.x = Math.round(c.x); c.y = Math.round(c.y);
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
        state.logo.d = Math.max(MIN_SIZE, snap(s0.w + (dx + dy) / 2));
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
      if (state.margin.mode === "logo") {
        state.margin.factor = round(Math.max(0, v / Math.max(MIN_SIZE, state.logo.d)), 3);
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
    return fetch(base + "/status/" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + comfyKey }
    }).then(readJSON).then(function (data) {
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
    fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + comfyKey },
      body: JSON.stringify({ input: { workflow: workflow } })
    }).then(readJSON).then(function (data) {
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
  buildGrid("#rect-align", "rect", "align");
  buildGrid("#rect-anchor", "rect", "anchor");
  buildGrid("#logo-align", "logo", "align");
  buildGrid("#logo-anchor", "logo", "anchor");
  $("#key-warning").textContent =
    "The key is kept in this browser only and sent straight to RunPod — never to this site. " +
    "Anyone with access to this browser profile can read it, so do not use a shared machine, and never commit it to the repository.";
  bindPanel();
  bindCanvas();
  render();
})();
