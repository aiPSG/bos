/* bos — a minimal design app: one stage, one rectangle.
   Every value can be set numerically in the panel or by dragging a handle. */
(function () {
  "use strict";

  var CORNERS = ["tl", "tr", "br", "bl"];
  var CORNER_LABELS = { tl: "Top left", tr: "Top right", br: "Bottom right", bl: "Bottom left" };
  var STORAGE_KEY = "bos.design.v1";
  var MIN_SIZE = 1;

  /* ------------------------------------------------------------------ state */

  function defaults() {
    return {
      stage: { w: 1080, h: 1080, bg: "#111318" },
      align: { h: "left", v: "top" },
      off: { x: 64, y: 64 },          // distance from the aligned format borders
      size: { w: 520, h: 360 },
      fullWidth: false,
      fill: "#4f7cff",
      linked: true,
      elliptical: false,
      corners: {
        tl: { x: 32, ux: "px", y: 32, uy: "px" },
        tr: { x: 32, ux: "px", y: 32, uy: "px" },
        br: { x: 32, ux: "px", y: 32, uy: "px" },
        bl: { x: 32, ux: "px", y: 32, uy: "px" }
      },
      zoom: null                       // null = fit to viewport
    };
  }

  var state = load() || defaults();

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw), d = defaults();
      // shallow-merge so an older saved shape can never break the app
      s.stage = Object.assign(d.stage, s.stage);
      s.align = Object.assign(d.align, s.align);
      s.off = Object.assign(d.off, s.off);
      s.size = Object.assign(d.size, s.size);
      s.corners = Object.assign(d.corners, s.corners);
      return Object.assign(d, s);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------ utils */

  var $ = function (sel) { return document.querySelector(sel); };
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function round(v, dp) { var f = Math.pow(10, dp || 0); return Math.round(v * f) / f; }
  function num(v, fallback) { var n = parseFloat(v); return isFinite(n) ? n : fallback; }

  /* ------------------------------------------------- derived geometry model */

  function rectW() {
    return state.fullWidth
      ? Math.max(MIN_SIZE, state.stage.w - state.off.x * 2)
      : state.size.w;
  }

  // absolute box in stage coordinates
  function abs() {
    var w = rectW(), h = state.size.h;
    return {
      x: state.align.h === "left" ? state.off.x : state.stage.w - state.off.x - w,
      y: state.align.v === "top" ? state.off.y : state.stage.h - state.off.y - h,
      w: w,
      h: h
    };
  }

  // write an absolute box back through the alignment anchors
  function setAbs(box) {
    var w = Math.max(MIN_SIZE, box.w), h = Math.max(MIN_SIZE, box.h);
    if (!state.fullWidth) state.size.w = round(w, 1);
    state.size.h = round(h, 1);
    state.off.x = round(state.align.h === "left" ? box.x : state.stage.w - box.x - w, 1);
    state.off.y = round(state.align.v === "top" ? box.y : state.stage.h - box.y - h, 1);
  }

  /* --------------------------------------------------------- corner radius */

  function cornerDim(axis) { return axis === "x" ? rectW() : state.size.h; }

  function cornerPx(name, axis) {
    var c = state.corners[name];
    var v = axis === "x" ? c.x : c.y;
    var u = axis === "x" ? c.ux : c.uy;
    return u === "%" ? v / 100 * cornerDim(axis) : v;
  }

  function setCornerPx(name, axis, px) {
    var c = state.corners[name];
    var u = axis === "x" ? c.ux : c.uy;
    var dim = cornerDim(axis);
    var v = u === "%" ? (dim ? px / dim * 100 : 0) : px;
    v = Math.max(0, round(v, u === "%" ? 1 : 0));
    if (axis === "x") c.x = v; else c.y = v;
    if (!state.elliptical) { // keep both axes identical while circular
      if (axis === "x") { c.y = c.x; c.uy = c.ux; } else { c.x = c.y; c.ux = c.uy; }
    }
  }

  function eachTargetCorner(name, fn) {
    (state.linked ? CORNERS : [name]).forEach(fn);
  }

  // border-radius shorthand; pxScale lets the on-screen preview scale px values
  function radiusCSS(pxScale) {
    var s = pxScale || 1;
    var fmt = function (v, u) {
      return (u === "%" ? round(v, 2) : round(v * s, 2)) + u;
    };
    var hx = CORNERS.map(function (n) { return fmt(state.corners[n].x, state.corners[n].ux); });
    var vy = CORNERS.map(function (n) { return fmt(state.corners[n].y, state.corners[n].uy); });
    var same = function (a) { return a.every(function (v) { return v === a[0]; }); };
    var side = function (a) { return same(a) ? a[0] : a.join(" "); };
    return same(hx) && same(vy) && hx[0] === vy[0] ? hx[0] : side(hx) + " / " + side(vy);
  }

  // parse any valid CSS border-radius value back into the model
  function parseRadius(text) {
    var halves = String(text).trim().toLowerCase().split("/");
    if (halves.length > 2) return null;
    var parse = function (part) {
      var tokens = part.trim().split(/\s+/).filter(Boolean);
      if (!tokens.length || tokens.length > 4) return null;
      var out = tokens.map(function (t) {
        var m = /^(\d*\.?\d+)(px|%)?$/.exec(t);
        if (!m) return null;
        return { v: parseFloat(m[1]), u: m[2] || "px" };
      });
      if (out.some(function (o) { return !o; })) return null;
      if (out.length === 1) out = [out[0], out[0], out[0], out[0]];
      else if (out.length === 2) out = [out[0], out[1], out[0], out[1]];
      else if (out.length === 3) out = [out[0], out[1], out[2], out[1]];
      return out;                                    // [tl, tr, br, bl]
    };
    var h = parse(halves[0]);
    if (!h) return null;
    var v = halves.length === 2 ? parse(halves[1]) : h;
    if (!v) return null;
    var elliptical = false, corners = {};
    CORNERS.forEach(function (n, i) {
      corners[n] = { x: h[i].v, ux: h[i].u, y: v[i].v, uy: v[i].u };
      if (h[i].v !== v[i].v || h[i].u !== v[i].u) elliptical = true;
    });
    return { corners: corners, elliptical: elliptical };
  }

  /* ------------------------------------------------------------------- zoom */

  var viewport = $("#viewport");

  function fitScale() {
    var pad = 2 * parseFloat(getComputedStyle(viewport).paddingLeft || 40);
    var aw = Math.max(80, viewport.clientWidth - pad);
    var ah = Math.max(80, viewport.clientHeight - pad);
    return Math.min(aw / state.stage.w, ah / state.stage.h);
  }

  function scale() { return state.zoom || fitScale(); }

  /* ------------------------------------------------------------- rendering */

  var els = {
    stage: $("#stage"), rect: $("#rect"), frame: $("#frame"),
    cssOut: $("#css-out"), readout: $("#readout"), zoomValue: $("#zoom-value"),
    shorthand: $("#radius-shorthand"), anchorHint: $("#anchor-hint")
  };

  function buildCornerRows() {
    var host = $("#corners");
    host.innerHTML = CORNERS.map(function (n) {
      return '<div class="corner-row" data-corner="' + n + '">' +
        "<span>" + CORNER_LABELS[n] + "</span>" +
        '<input type="number" min="0" step="1" data-radius="' + n + '" data-axis="x">' +
        '<select data-unit="' + n + '" data-axis="x"><option>px</option><option>%</option></select>' +
        '<input type="number" min="0" step="1" class="axis-y" data-radius="' + n + '" data-axis="y">' +
        '<select class="axis-y" data-unit="' + n + '" data-axis="y"><option>px</option><option>%</option></select>' +
        "</div>";
    }).join("");
  }

  function setValue(el, value) {
    if (el && document.activeElement !== el && el.value !== String(value)) el.value = value;
  }

  function syncPanel() {
    setValue($("#stage-w"), round(state.stage.w, 2));
    setValue($("#stage-h"), round(state.stage.h, 2));
    $("#stage-bg").value = state.stage.bg;
    var preset = $("#stage-preset");
    preset.value = round(state.stage.w, 2) + "x" + round(state.stage.h, 2);
    if (preset.selectedIndex < 0) preset.selectedIndex = 0;

    Array.prototype.forEach.call($("#anchor").children, function (b) {
      b.setAttribute("aria-pressed",
        b.dataset.h === state.align.h && b.dataset.v === state.align.v ? "true" : "false");
    });
    $("#dist-x-label").textContent = state.fullWidth
      ? "Left & right" : (state.align.h === "left" ? "Left" : "Right");
    $("#dist-y-label").textContent = state.align.v === "top" ? "Top" : "Bottom";
    els.anchorHint.textContent = "Anchored " + state.align.v + " " + state.align.h +
      " — distances are measured from those borders.";

    setValue($("#off-x"), round(state.off.x, 2));
    setValue($("#off-y"), round(state.off.y, 2));
    $("#full-width").checked = state.fullWidth;
    $("#rect-w").disabled = state.fullWidth;
    setValue($("#rect-w"), round(rectW(), 2));
    setValue($("#rect-h"), round(state.size.h, 2));
    $("#rect-fill").value = state.fill;

    $("#corners-linked").checked = state.linked;
    $("#corners-elliptical").checked = state.elliptical;
    document.body.classList.toggle("elliptical", state.elliptical);
    CORNERS.forEach(function (n) {
      var c = state.corners[n];
      setValue(document.querySelector('[data-radius="' + n + '"][data-axis="x"]'), round(c.x, 2));
      setValue(document.querySelector('[data-radius="' + n + '"][data-axis="y"]'), round(c.y, 2));
      document.querySelector('[data-unit="' + n + '"][data-axis="x"]').value = c.ux;
      document.querySelector('[data-unit="' + n + '"][data-axis="y"]').value = c.uy;
    });
    setValue(els.shorthand, radiusCSS(1));
    els.shorthand.classList.remove("invalid");
  }

  function renderStage() {
    var s = scale(), box = abs();
    els.stage.style.width = state.stage.w * s + "px";
    els.stage.style.height = state.stage.h * s + "px";
    els.stage.style.background = state.stage.bg;

    var css = {
      left: box.x * s + "px", top: box.y * s + "px",
      width: box.w * s + "px", height: box.h * s + "px"
    };
    Object.assign(els.rect.style, css, { background: state.fill, borderRadius: radiusCSS(s) });
    Object.assign(els.frame.style, css);
    els.frame.classList.toggle("full-width", state.fullWidth);

    CORNERS.forEach(function (n) {
      var el = document.querySelector('.handle.radius[data-corner="' + n + '"]');
      var rx = clamp(cornerPx(n, "x") * s, 14, Math.max(14, box.w * s / 2));
      var ry = clamp(cornerPx(n, "y") * s, 14, Math.max(14, box.h * s / 2));
      el.style.left = (n === "tl" || n === "bl" ? rx : box.w * s - rx) + "px";
      el.style.top = (n === "tl" || n === "tr" ? ry : box.h * s - ry) + "px";
    });
    var pos = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
    Array.prototype.forEach.call(document.querySelectorAll(".handle.size"), function (el) {
      var p = pos[el.dataset.dir];
      el.style.left = box.w * s * p[0] + "px";
      el.style.top = box.h * s * p[1] + "px";
    });

    els.zoomValue.textContent = Math.round(s * 100) + "%";
    els.readout.textContent =
      "Format " + round(state.stage.w, 2) + " × " + round(state.stage.h, 2) +
      "   ·   Rectangle " + round(box.w, 2) + " × " + round(box.h, 2) +
      "   ·   " + (state.align.v === "top" ? "Top" : "Bottom") + " " + round(state.off.y, 2) +
      ", " + (state.fullWidth ? "Left & right " : (state.align.h === "left" ? "Left " : "Right ")) +
      round(state.off.x, 2);
  }

  function renderCSS() {
    var box = abs();
    var horiz = state.fullWidth
      ? "  left: " + round(state.off.x, 2) + "px;\n  right: " + round(state.off.x, 2) + "px;"
      : "  " + (state.align.h === "left" ? "left" : "right") + ": " + round(state.off.x, 2) +
        "px;\n  width: " + round(box.w, 2) + "px;";
    els.cssOut.textContent =
      ".stage {\n" +
      "  position: relative;\n" +
      "  width: " + round(state.stage.w, 2) + "px;\n" +
      "  height: " + round(state.stage.h, 2) + "px;\n" +
      "  background: " + state.stage.bg + ";\n" +
      "  overflow: hidden;\n" +
      "}\n\n" +
      ".rectangle {\n" +
      "  position: absolute;\n" +
      horiz + "\n" +
      "  " + (state.align.v === "top" ? "top" : "bottom") + ": " + round(state.off.y, 2) + "px;\n" +
      "  height: " + round(box.h, 2) + "px;\n" +
      "  border-radius: " + radiusCSS(1) + ";\n" +
      "  background: " + state.fill + ";\n" +
      "}";
  }

  var frameId = null;
  function render() {
    if (frameId) return;
    frameId = requestAnimationFrame(function () {
      frameId = null;
      syncPanel();
      renderStage();
      renderCSS();
      save();
    });
  }

  /* --------------------------------------------------------- panel wiring */

  function onInput(sel, fn) {
    $(sel).addEventListener("input", function (e) { fn(e.target); render(); });
  }

  onInput("#stage-w", function (el) { if (el.value !== "") state.stage.w = Math.max(1, num(el.value, state.stage.w)); });
  onInput("#stage-h", function (el) { if (el.value !== "") state.stage.h = Math.max(1, num(el.value, state.stage.h)); });
  onInput("#stage-bg", function (el) { state.stage.bg = el.value; });
  onInput("#rect-fill", function (el) { state.fill = el.value; });
  onInput("#off-x", function (el) { if (el.value !== "") state.off.x = num(el.value, state.off.x); });
  onInput("#off-y", function (el) { if (el.value !== "") state.off.y = num(el.value, state.off.y); });
  onInput("#rect-w", function (el) { if (el.value !== "") state.size.w = Math.max(MIN_SIZE, num(el.value, state.size.w)); });
  onInput("#rect-h", function (el) { if (el.value !== "") state.size.h = Math.max(MIN_SIZE, num(el.value, state.size.h)); });

  $("#stage-preset").addEventListener("change", function (e) {
    if (!e.target.value) return;
    var d = e.target.value.split("x");
    state.stage.w = +d[0];
    state.stage.h = +d[1];
    render();
  });

  $("#full-width").addEventListener("change", function (e) {
    if (e.target.checked) {
      state.size.w = rectW();                          // remember the pixel width we came from
      // never collapse the rectangle: keep at least 4% of the format width
      state.off.x = Math.min(state.off.x, state.stage.w * 0.96 / 2);
    }
    state.fullWidth = e.target.checked;
    render();
  });

  $("#anchor").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var box = abs();                                    // keep the rectangle where it is
    state.align.h = b.dataset.h;
    state.align.v = b.dataset.v;
    setAbs(box);
    render();
  });

  $("#corners-linked").addEventListener("change", function (e) {
    state.linked = e.target.checked;
    if (state.linked) eachTargetCorner("tl", function (n) {
      state.corners[n] = Object.assign({}, state.corners.tl);
    });
    render();
  });

  $("#corners-elliptical").addEventListener("change", function (e) {
    state.elliptical = e.target.checked;
    if (!state.elliptical) CORNERS.forEach(function (n) {
      state.corners[n].y = state.corners[n].x;
      state.corners[n].uy = state.corners[n].ux;
    });
    render();
  });

  $("#corners").addEventListener("input", function (e) {
    var el = e.target;
    if (!el.dataset.radius || el.value === "") return;
    var axis = el.dataset.axis, v = Math.max(0, num(el.value, 0));
    eachTargetCorner(el.dataset.radius, function (n) {
      var c = state.corners[n];
      if (axis === "x") { c.x = v; if (!state.elliptical) c.y = v; }
      else { c.y = v; if (!state.elliptical) c.x = v; }
    });
    render();
  });

  $("#corners").addEventListener("change", function (e) {
    var el = e.target;
    if (!el.dataset.unit) return;
    var axis = el.dataset.axis, u = el.value;
    eachTargetCorner(el.dataset.unit, function (n) {
      var c = state.corners[n];
      // convert the current value so the shape does not jump when the unit changes
      var px = cornerPx(n, axis);
      var dim = cornerDim(axis);
      var v = Math.max(0, round(u === "%" ? (dim ? px / dim * 100 : 0) : px, u === "%" ? 1 : 0));
      if (axis === "x") { c.ux = u; c.x = v; if (!state.elliptical) { c.uy = u; c.y = v; } }
      else { c.uy = u; c.y = v; if (!state.elliptical) { c.ux = u; c.x = v; } }
    });
    render();
  });

  els.shorthand.addEventListener("input", function (e) {
    var parsed = parseRadius(e.target.value);
    if (!parsed) { e.target.classList.add("invalid"); return; }
    e.target.classList.remove("invalid");
    state.corners = parsed.corners;
    if (parsed.elliptical) state.elliptical = true;
    render();   // the field being typed in is focused, so syncPanel leaves it alone
  });

  $("#copy-css").addEventListener("click", function (e) {
    var text = els.cssOut.textContent;
    var done = function () {
      e.target.textContent = "Copied";
      setTimeout(function () { e.target.textContent = "Copy CSS"; }, 1200);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else done();
  });

  $("#reset").addEventListener("click", function () {
    state = defaults();
    render();
  });

  /* ------------------------------------------------------------------ zoom */

  function setZoom(z) { state.zoom = z ? clamp(z, .02, 8) : null; render(); }
  $("#zoom-in").addEventListener("click", function () { setZoom(scale() * 1.25); });
  $("#zoom-out").addEventListener("click", function () { setZoom(scale() / 1.25); });
  $("#zoom-fit").addEventListener("click", function () { setZoom(null); });
  $("#zoom-value").addEventListener("click", function () { setZoom(null); });
  window.addEventListener("resize", function () { if (!state.zoom) render(); });

  /* ------------------------------------------------------- drag interaction */

  function startDrag(e, onMove) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    var target = e.currentTarget;
    var s = scale();
    var start = { x: e.clientX, y: e.clientY };
    target.setPointerCapture(e.pointerId);

    var move = function (ev) {
      onMove((ev.clientX - start.x) / s, (ev.clientY - start.y) / s, ev);
      render();
    };
    var up = function (ev) {
      target.releasePointerCapture(ev.pointerId);
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  }

  // move
  els.frame.addEventListener("pointerdown", function (e) {
    if (e.target !== els.frame) return;                 // handles deal with themselves
    els.frame.focus();
    var box = abs();
    startDrag(e, function (dx, dy, ev) {
      var mx = dx, my = dy;
      if (ev.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) my = 0; else mx = 0; }
      setAbs({ x: box.x + (state.fullWidth ? 0 : mx), y: box.y + my, w: box.w, h: box.h });
    });
  });

  // resize
  Array.prototype.forEach.call(document.querySelectorAll(".handle.size"), function (el) {
    el.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      var dir = el.dataset.dir;
      var sx = dir.indexOf("w") > -1 ? -1 : dir.indexOf("e") > -1 ? 1 : 0;
      var sy = dir.indexOf("n") > -1 ? -1 : dir.indexOf("s") > -1 ? 1 : 0;
      var box = abs(), off0 = state.off.x, ratio = box.w / box.h;

      startDrag(e, function (dx, dy, ev) {
        if (state.fullWidth && sx !== 0) {              // edges drive the symmetric gap
          state.off.x = round(Math.max(0, off0 + (sx === -1 ? dx : -dx)), 1);
          return;
        }
        var n = { x: box.x, y: box.y, w: box.w, h: box.h };
        if (sx === -1) { n.x = box.x + dx; n.w = box.w - dx; }
        if (sx === 1) { n.w = box.w + dx; }
        if (sy === -1) { n.y = box.y + dy; n.h = box.h - dy; }
        if (sy === 1) { n.h = box.h + dy; }
        if (n.w < MIN_SIZE) { if (sx === -1) n.x = box.x + box.w - MIN_SIZE; n.w = MIN_SIZE; }
        if (n.h < MIN_SIZE) { if (sy === -1) n.y = box.y + box.h - MIN_SIZE; n.h = MIN_SIZE; }
        if (ev.shiftKey && sx !== 0 && sy !== 0) {      // keep the aspect ratio
          var h2 = n.w / ratio;
          if (sy === -1) n.y += n.h - h2;
          n.h = h2;
        }
        setAbs(n);
      });
    });
  });

  // corner radius
  Array.prototype.forEach.call(document.querySelectorAll(".handle.radius"), function (el) {
    el.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      var name = el.dataset.corner;
      var dirX = (name === "tl" || name === "bl") ? 1 : -1;   // inward direction
      var dirY = (name === "tl" || name === "tr") ? 1 : -1;
      var box = abs();
      var start = { x: cornerPx(name, "x"), y: cornerPx(name, "y") };

      startDrag(e, function (dx, dy, ev) {
        var rx = start.x + dx * dirX;
        var ry = start.y + dy * dirY;
        if (!state.elliptical || ev.shiftKey) rx = ry = (rx + ry) / 2;
        rx = clamp(rx, 0, box.w / 2);
        ry = clamp(ry, 0, box.h / 2);
        eachTargetCorner(name, function (n) {
          setCornerPx(n, "x", rx);
          setCornerPx(n, "y", state.elliptical ? ry : rx);
        });
      });
    });
  });

  // keyboard nudging
  els.frame.addEventListener("keydown", function (e) {
    var map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    var d = map[e.key];
    if (!d) return;
    e.preventDefault();
    var step = e.shiftKey ? 10 : 1;
    var box = abs();
    setAbs({
      x: box.x + (state.fullWidth ? 0 : d[0] * step),
      y: box.y + d[1] * step,
      w: box.w, h: box.h
    });
    render();
  });

  /* ------------------------------------------------------------------ boot */

  buildCornerRows();
  render();
})();
