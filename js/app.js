/* bos — a small design app.
   A stage with a margin box, an alignable solid and a logo circle.
   Every value can be set numerically in the panel or by dragging on the canvas. */
(function () {
  "use strict";

  var CORNERS = ["tl", "tr", "br", "bl"];
  var CORNER_LABELS = { tl: "Top left", tr: "Top right", br: "Bottom right", bl: "Bottom left" };
  var H_KEYS = ["left", "center", "right"];
  var V_KEYS = ["top", "middle", "bottom"];
  var SIDES = ["top", "right", "bottom", "left"];
  var STORAGE_KEY = "bos.design.v21";

  /* Templates for the jobs this gets used for. Each carries a format and the
     scaffolding that suits it — margins, columns and the number of baseline rows —
     so picking one sets up the page, not the contents. */
  var FORMATS = [
    { id: "ig-square", group: "Social media", name: "Instagram post", w: 1080, h: 1080,
      margin: 80, cols: 6, gutter: 24, rows: 30 },
    { id: "ig-portrait", group: "Social media", name: "Instagram portrait", w: 1080, h: 1350,
      margin: 80, cols: 6, gutter: 24, rows: 39 },
    { id: "story", group: "Social media", name: "Story / Reel", w: 1080, h: 1920,
      margin: 90, cols: 6, gutter: 24, rows: 48 },
    { id: "link-card", group: "Social media", name: "Link card", w: 1200, h: 628,
      margin: 56, cols: 6, gutter: 20, rows: 16 },
    { id: "x-post", group: "Social media", name: "X post", w: 1600, h: 900,
      margin: 72, cols: 8, gutter: 24, rows: 22 },
    { id: "yt-thumb", group: "Social media", name: "YouTube thumbnail", w: 1280, h: 720,
      margin: 56, cols: 6, gutter: 20, rows: 16 },

    { id: "leaderboard", group: "Web banners", name: "Leaderboard", w: 728, h: 90,
      margin: 10, cols: 6, gutter: 8, rows: 4 },
    { id: "billboard-ad", group: "Web banners", name: "Billboard banner", w: 970, h: 250,
      margin: 20, cols: 6, gutter: 12, rows: 8 },
    { id: "mrec", group: "Web banners", name: "Medium rectangle", w: 300, h: 250,
      margin: 16, cols: 4, gutter: 8, rows: 9 },
    { id: "half-page", group: "Web banners", name: "Half page", w: 300, h: 600,
      margin: 16, cols: 4, gutter: 8, rows: 22 },
    { id: "skyscraper", group: "Web banners", name: "Wide skyscraper", w: 160, h: 600,
      margin: 12, cols: 2, gutter: 8, rows: 24 },
    { id: "mobile-banner", group: "Web banners", name: "Mobile banner", w: 320, h: 50,
      margin: 8, cols: 4, gutter: 8, rows: 3 },

    { id: "dooh-landscape", group: "Digital OOH", name: "Screen — landscape", w: 1920, h: 1080,
      margin: 96, cols: 8, gutter: 32, rows: 24 },
    { id: "dooh-portrait", group: "Digital OOH", name: "Screen — portrait", w: 1080, h: 1920,
      margin: 80, cols: 6, gutter: 24, rows: 46 },
    { id: "dooh-ultrawide", group: "Digital OOH", name: "Screen — ultra-wide", w: 2880, h: 810,
      margin: 80, cols: 12, gutter: 32, rows: 14 },
    { id: "dooh-4k", group: "Digital OOH", name: "Screen — 4K", w: 3840, h: 2160,
      margin: 180, cols: 12, gutter: 48, rows: 30 },

    { id: "lower-third", group: "Motion", name: "Lower third", w: 1920, h: 1080,
      margin: 120, cols: 12, gutter: 24, rows: 18 },
    { id: "intro", group: "Motion", name: "Intro card", w: 1920, h: 1080,
      margin: 160, cols: 6, gutter: 32, rows: 16 },
    { id: "outro", group: "Motion", name: "Outro card", w: 1920, h: 1080,
      margin: 160, cols: 6, gutter: 32, rows: 20 },
    { id: "motion-vertical", group: "Motion", name: "Vertical cut-down", w: 1080, h: 1920,
      margin: 96, cols: 6, gutter: 24, rows: 44 },

    { id: "book-cover", group: "Book", name: "Cover — A5", w: 1240, h: 1754,
      margin: 100, cols: 6, gutter: 24, rows: 36 },
    { id: "book-text", group: "Book", name: "Inside page — text", w: 1240, h: 1754,
      margin: 140, cols: 1, gutter: 0, rows: 40 },
    { id: "book-image", group: "Book", name: "Inside page — image", w: 1240, h: 1754,
      margin: 70, cols: 2, gutter: 24, rows: 34 },
    { id: "book-imagetext", group: "Book", name: "Inside page — image and text", w: 1240, h: 1754,
      margin: 120, cols: 2, gutter: 40, rows: 38 },
    { id: "a5-print", group: "Book", name: "A5 · 150 dpi", w: 1240, h: 1754,
      margin: 120, cols: 6, gutter: 24, rows: 39 },

    // print, at 300 dpi — the DIN A sizes and a business card
    { id: "a4-print", group: "Print", name: "DIN A4 · 300 dpi", w: 2480, h: 3508,
      margin: 240, cols: 6, gutter: 48, rows: 46 },
    { id: "a3-print", group: "Print", name: "DIN A3 · 300 dpi", w: 3508, h: 4961,
      margin: 340, cols: 6, gutter: 68, rows: 46 },
    { id: "a2-print", group: "Print", name: "DIN A2 · 300 dpi", w: 4961, h: 7016,
      margin: 480, cols: 6, gutter: 96, rows: 46 },
    { id: "a1-print", group: "Print", name: "DIN A1 · 300 dpi", w: 7016, h: 9933,
      margin: 680, cols: 6, gutter: 136, rows: 46 },
    { id: "card-print", group: "Print", name: "Business card · 85 × 55 mm", w: 1004, h: 650,
      margin: 60, cols: 4, gutter: 16, rows: 14 },

    { id: "motion-4k", group: "Motion", name: "4K UHD", w: 3840, h: 2160,
      margin: 240, cols: 12, gutter: 48, rows: 24 },
    { id: "motion-2k", group: "Motion", name: "2K · Full HD", w: 1920, h: 1080,
      margin: 120, cols: 12, gutter: 24, rows: 24 }
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
  /* Blind text, for filling a block or showing a specimen. Latin, so the shapes of
     the words carry the type rather than the meaning. */
  var LOREM = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor " +
    "incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud " +
    "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure " +
    "dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur " +
    "excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt " +
    "mollit anim id est laborum sed ut perspiciatis unde omnis iste natus error sit " +
    "voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo " +
    "inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim " +
    "ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur " +
    "magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui " +
    "dolorem ipsum quia dolor sit amet consectetur adipisci velit").split(" ");

  // n words of it, as sentences that start with a capital and end with a full stop
  function blindText(n) {
    var words = [], i, w;
    for (i = 0; i < n; i++) words.push(LOREM[i % LOREM.length]);
    var out = "", len = 0, sentence = [];
    for (i = 0; i < words.length; i++) {
      sentence.push(words[i]);
      len++;
      // sentences of eight to fifteen words, so the copy has a rhythm to it
      if (len >= 8 + (i % 8) || i === words.length - 1) {
        w = sentence.join(" ");
        out += (out ? " " : "") + w.charAt(0).toUpperCase() + w.slice(1) + ".";
        sentence = []; len = 0;
      }
    }
    return out;
  }

  var ROLE_ROWS = { display: 2, headline: 2, subline: 5, paragraph: 8, smallprint: 1 };
  /* How much blind text a role asks for — what Fill gives it, and what a block
     arrives on the stage carrying, so nothing starts with a line break in it.
     Nothing wraps on its own, and the box is never narrower than its longest line,
     so these are the lengths that make a sensible line at each size. */
  var ROLE_BLIND = { display: 3, headline: 5, subline: 7, paragraph: 12, smallprint: 10 };
  var ROLE_NAMES = {
    display: "Display", headline: "Headline", subline: "Subline",
    paragraph: "Paragraph", smallprint: "Small print"
  };
  var TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div"];
  /* The paragraph size is the anchor of the scale. It is a factor of the format's
     height or width — 0.01 to 1, so a hundredth of the side up to all of it — or a
     value in pixels, set by hand and the same whatever the format. */
  var BASES = [
    { id: "long", name: "the longest side" },
    { id: "height", name: "the format height" },
    { id: "width", name: "the format width" },
    { id: "px", name: "px, set by hand" }
  ];
  var PARA_MIN = 0.1, PARA_MAX = 4;          // per cent of the side it is measured against
  var PARAPX_MIN = 1, PARAPX_MAX = 9999;     // and in pixels, when it is set by hand
  var PARAPX_SLIDER = 400;                   // as far as the slider goes in that mode

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

  /* The work runs in stages, and each is a segment of the interface: the design
     system first, then the background it sits on, then the formats it is laid
     into, then the dummies it is shown in. Only the first is built. */
  var SEGMENTS = [
    { id: "system", name: "Set design system", built: true,
      note: "The format, the logo, the margins and the columns, the solid, the type scale " +
        "and both baseline grids, and the text that sits on them." },
    { id: "colour", name: "Create colour scheme", built: true,
      note: "A scheme worked out the way colour is worked out — from one colour and a " +
        "relationship — and put on the type and the solids." },
    { id: "background", name: "Generate background", built: true,
      note: "One ground for the system to sit on, made rather than found." },
    { id: "formats", name: "Design formats", built: true,
      note: "The system and its background laid into every format the work runs in, each one " +
        "adjusted where it has to be rather than scaled and hoped for." },
    { id: "dummies", name: "Dummies",
      note: "The finished formats shown in place \u2014 a phone, a poster site, a spread \u2014 " +
        "so the work can be seen the way it will be met." }
  ];

  /* ------------------------------------------------------ formats as pages

     The work runs in several formats. One is the master, and every other one
     says which parts of the design it takes from the master and which it keeps
     for itself. A group is a name and a pair of routines that lift its values
     out of the state and put them back. */
  var LINK_GROUPS = [
    { k: "font", name: "Font",
      pick: function () {
        var roles = {};
        ROLES.forEach(function (r) { if (state.type.roles[r].family) roles[r] = state.type.roles[r].family; });
        return { family: state.type.family, google: (state.type.google || []).slice(), roles: roles };
      },
      put: function (v) {
        state.type.family = v.family;
        state.type.google = v.google.slice();
        var roles = v.roles || {};
        ROLES.forEach(function (r) {
          if (roles[r]) state.type.roles[r].family = roles[r];
          else delete state.type.roles[r].family;
        });
      } },
    { k: "sizes", name: "Font sizes",
      pick: function () {
        var r = {};
        ROLES.forEach(function (x) { r[x] = state.type.roles[x].mult; });
        return { paragraph: state.type.paragraph, basis: state.type.basis, system: state.type.system, roles: r };
      },
      put: function (v) {
        state.type.paragraph = v.paragraph; state.type.basis = v.basis; state.type.system = v.system;
        ROLES.forEach(function (x) { if (isFinite(v.roles[x])) state.type.roles[x].mult = v.roles[x]; });
      } },
    { k: "baseline", name: "Baseline grid",
      pick: function () { return { rows: state.type.rows, gridFrom: state.type.gridFrom, grid: state.type.grid }; },
      put: function (v) { state.type.rows = v.rows; state.type.gridFrom = v.gridFrom; state.type.grid = v.grid; } },
    { k: "margins", name: "Margins — the page's and every solid's",
      pick: function () {
        return { margin: clone(state.margin), cols: clone(state.cols),
          solids: state.solids.map(function (r) { return clone(r.columns.m); }) };
      },
      put: function (v) {
        state.margin = clone(v.margin);
        state.cols = clone(v.cols);
        state.solids.forEach(function (r, i) { if (v.solids[i]) r.columns.m = clone(v.solids[i]); });
        useSolid(state.solid);
      } },
    { k: "logo", name: "Logo",
      pick: function () { return clone(state.logo); },
      put: function (v) { state.logo = clone(v); } }
  ];

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function groupOf(k) { return LINK_GROUPS.filter(function (g) { return g.k === k; })[0]; }
  function masterIndex() {
    var i = state.pages.findIndex(function (pg) { return pg.master; });
    return i < 0 && state.pages.length ? 0 : i;
  }

  // the values a page runs a group at: its own when it keeps it, the master's when
  // it is linked — live, if the master is the page being worked on
  function pageValue(i, k) {
    var pg = state.pages[i], m = masterIndex();
    if (!pg) return null;
    var own = pg.own[k];
    if (pg.master || !pg.links[k]) return own || (m >= 0 && m !== i ? state.pages[m].own[k] : null);
    if (m < 0) return own || null;
    return m === state.page ? groupOf(k).pick() : (state.pages[m].own[k] || own || null);
  }

  // remember what the page that is open is set to, so the others can follow it
  function storePage(i) {
    var pg = state.pages[i], m = masterIndex();
    if (!pg) return;
    pg.w = state.stage.w; pg.h = state.stage.h;
    // the format may have been changed from the Format panel while it was open
    var f = formatById(state.stage.preset);
    if (f && f.w === pg.w && f.h === pg.h) { pg.id = f.id; pg.name = f.name; }
    else if (!f) { pg.id = ""; pg.name = "Custom " + fmt(pg.w) + " × " + fmt(pg.h); }
    LINK_GROUPS.forEach(function (g) {
      var v = g.pick();
      pg.own[g.k] = v;
      /* Linked means shared: what is set here while a group is linked is what the
         master holds, so every other page on it follows. */
      if (!pg.master && pg.links[g.k] && m >= 0 && state.pages[m]) state.pages[m].own[g.k] = v;
    });
  }

  function applyPage(i) {
    var pg = state.pages[i];
    if (!pg) return;
    state.page = i;
    state.stage.w = pg.w; state.stage.h = pg.h;
    state.stage.preset = pg.id;
    LINK_GROUPS.forEach(function (g) {
      var v = pageValue(i, g.k);
      if (v) g.put(v);
    });
  }

  function usePage(i) {
    if (!state.pages[i] || i === state.page) { applyPage(i); return; }
    storePage(state.page);
    applyPage(i);
  }

  // paint another page without leaving the one that is open
  function withPage(i, fn) {
    var pg = state.pages[i];
    if (!pg) return fn();
    if (i === state.page) return withFormat(pg.w, pg.h, fn);
    var before = {};
    LINK_GROUPS.forEach(function (g) { before[g.k] = g.pick(); });
    try {
      LINK_GROUPS.forEach(function (g) {
        var v = pageValue(i, g.k);
        if (v) g.put(v);
      });
      return withFormat(pg.w, pg.h, fn);
    } finally {
      LINK_GROUPS.forEach(function (g) { g.put(before[g.k]); });
    }
  }

  function addPage(id) {
    var f = formatById(id) || FORMATS[0];
    var links = {};
    LINK_GROUPS.forEach(function (g) { links[g.k] = true; });
    var pg = { key: "p" + (state.pageKey++), id: f.id, name: f.name, w: f.w, h: f.h,
      master: !state.pages.length, links: links, own: {} };
    // it starts from whatever is on screen, so a new format is not a blank one
    LINK_GROUPS.forEach(function (g) { pg.own[g.k] = g.pick(); });
    state.pages.push(pg);
    return pg;
  }

  function segment() {
    return SEGMENTS.filter(function (sg) { return sg.id === state.seg; })[0] || SEGMENTS[0];
  }

  function defaults() {
    return {
      v: 21,
      seg: "system",
      // a scheme built from one colour and a relationship between hues
      scheme: { base: "#4f7cff", technique: "complement", count: 6, spread: 30 },
      // the formats the work runs in; one of them is the master
      pages: [], page: 0, pageKey: 1,
      stage: { w: 1080, h: 1350, bg: "#111318", preset: "ig-portrait" },
      // the image can be pushed around and scaled on top of whichever fit it starts from
      bg: { src: "", fit: "cover", opacity: 100, scale: 100, x: 0, y: 0 },
      // a made background: which kind is switched on, and the module each kind is set to
      bgGen: { tab: "pattern", on: "", pattern: "grid", gradient: "linear", params: {}, zoom: null },
      comfy: { endpoint: "", workflow: DEFAULT_WORKFLOW, prompt: "", negative: "", seed: 12345, remember: false },
      // what to ask Claude, and where — the key is never part of the design
      ai: { model: "claude-opus-5", endpoint: "", briefs: { scheme: "", fonts: "", layout: "" } },
      // in a logo mode every margin is factor × the logo size, plus a buffer of its own
      // on each side — so the four can differ while sharing the same base
      margin: { mode: "manual", factor: 1, linked: true, locked: true,
        top: 80, right: 80, bottom: 80, left: 80,
        buf: { top: 0, right: 0, bottom: 0, left: 0 } },
      round: true,
      // the solids on the page; state.rect is a live alias of the selected one
      solids: [], solid: 0,
      rect: {
        // wmode / hmode: a set size, filling between the margins, filling the whole
        // format edge to edge, or (width only) fitting around the text
        // placed: dragged onto the stage from the tray. visible: drawn with its fill
        placed: false, visible: true, w: 520, h: 360, wmode: "fixed", hmode: "fixed", grid: 2, cols: true,
        /* What the box is filled with. A frame is a solid whose fill is a picture
           rather than a colour: it is resized, snapped and masked by exactly the
           same machinery, and the corner shape is the mask. */
        content: "fill",        // fill | image | pattern | gradient
        src: "", fit: "cover", scale: 100, x: 0, y: 0,     // the picture inside it
        module: "linear", params: {},                      // when it is made rather than loaded
        // a column grid of its own, across the box — with margins of its own
        // inside it — that blocks can line up on
        columns: { n: 3, gutter: 24, show: true, m: { top: 0, right: 0, bottom: 0, left: 0 } },
        /* Where it sits: the anchor point of the box, held as a share of the
           margin box, so it keeps its place across formats of every size and is
           free of the nine cells the logo still uses */
        pos: { x: .5, y: .5 }, anchor: { h: "center", v: "middle" },
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
        basis: "long",          // which side the paragraph factor measures against
        paragraph: 1, paraPct: true,   // per cent of that side — the anchor of the whole scale
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
        // each sits on a row of its own, counted from the margin box, so nothing on
        // the page moves it but the row it is given
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
  /* Every solid is the same shape of thing, and state.rect is a live alias of
     whichever one is selected — so the panel, the frame and every geometry helper
     go on reading state.rect and know nothing about there being several. */
  function normaliseSolid(r, d) {
    r = Object.assign({}, d.rect, r);
    if (["fill", "image", "pattern", "gradient"].indexOf(r.content) < 0) r.content = "fill";
    if (!r.params || typeof r.params !== "object") r.params = {};
    r.corners = Object.assign({}, d.rect.corners, r.corners);
    // solids used to be aligned to one of the nine cells: that cell is its position now
    if (!r.pos || !isFinite(r.pos.x) || !isFinite(r.pos.y)) {
      r.pos = r.align ? { x: fh(r.align.h), y: fv(r.align.v) } : { x: .5, y: .5 };
    }
    delete r.align;
    r.columns = Object.assign({}, d.rect.columns, r.columns);
    if (!r.columns.m || typeof r.columns.m !== "object") r.columns.m = { top: 0, right: 0, bottom: 0, left: 0 };
    SIDES.forEach(function (side) { if (!isFinite(r.columns.m[side])) r.columns.m[side] = 0; });
    return r;
  }

  function useSolid(i) {
    var n = state.solids.length;
    state.solid = n ? clamp(Math.round(i) || 0, 0, n - 1) : 0;
    state.rect = n ? state.solids[state.solid] : normaliseSolid({ placed: false }, defaults());
  }

  // run fn with a given solid selected, and put the selection back afterwards
  function withSolid(i, fn) {
    var r = state.rect, k = state.solid;
    if (state.solids[i]) { state.rect = state.solids[i]; state.solid = i; }
    try { return fn(); } finally { state.rect = r; state.solid = k; }
  }

  function addSolid() {
    var r = normaliseSolid(JSON.parse(JSON.stringify(state.rect)), defaults());
    r.placed = true;
    state.solids.push(r);
    useSolid(state.solids.length - 1);
    return r;
  }

  function save() {
    storePage(state.page);                  // the page that is open is the truth
    var copy;
    try { copy = JSON.parse(JSON.stringify(state)); } catch (e) { return; }
    /* state.rect is a live alias of the selected solid, so it is a duplicate of one
       of copy.solids — kept because with no solids on the page it is the prototype
       the next one is copied from. Loading rebuilds the alias either way. */
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
      ["stage", "bg", "bgGen", "scheme", "comfy", "margin", "logo", "view", "text", "guides", "cols"].forEach(function (k) {
        s[k] = Object.assign(d[k], s[k]);
      });
      s.type = Object.assign(d.type, s.type);
      // it was briefly a factor of a side between being a percentage of one twice
      if (!s.type.paraPct) {
        if (s.type.paraFactor && s.type.basis !== "px") s.type.paragraph = round(s.type.paragraph * 100, 3);
        delete s.type.paraFactor;
        s.type.paraPct = true;
      }
      s.type.roles = Object.assign(d.type.roles, s.type.roles);
      if (!Array.isArray(s.text.blocks)) s.text.blocks = [];
      s.text.blocks = s.text.blocks.filter(function (b) { return b && ROLES.indexOf(b.role) >= 0; });
      s.text.blocks.forEach(function (b) {
        if (b.grid !== 1 && b.grid !== 2 && b.grid !== "both") b.grid = "both";
        if (["auto", "format", "rect"].indexOf(b.cols) < 0) b.cols = "auto";
        if (b.from !== "bottom") b.from = "top";
        if (!isFinite(b.padL)) b.padL = 0;
        if (!isFinite(b.padR)) b.padR = 0;
      });
      if (!Array.isArray(s.solids)) s.solids = [];
      // a design from before there could be more than one carries its solid across
      if (!s.solids.length && s.rect && s.rect.placed) s.solids = [s.rect];
      s.solids = s.solids.map(function (r) { return normaliseSolid(r, d); });
      s.rect = normaliseSolid(s.rect, d);
      if (!s.ai || typeof s.ai !== "object") s.ai = clone(d.ai);
      else s.ai = Object.assign(clone(d.ai), s.ai);
      // the one brief became three, one per question
      if (!s.ai.briefs || typeof s.ai.briefs !== "object") s.ai.briefs = clone(d.ai.briefs);
      else s.ai.briefs = Object.assign(clone(d.ai.briefs), s.ai.briefs);
      if (s.ai.brief) { s.ai.briefs.layout = s.ai.briefs.layout || s.ai.brief; delete s.ai.brief; }
      delete s.ai.key;                       // no key was ever stored; make sure of it
      if (!s.margin.buf || typeof s.margin.buf !== "object") s.margin.buf = { top: 0, right: 0, bottom: 0, left: 0 };
      SIDES.forEach(function (side) { if (!isFinite(s.margin.buf[side])) s.margin.buf[side] = 0; });
      if (!s.logo.h || typeof s.logo.h !== "object" || !isFinite(s.logo.h.v)) s.logo.h = { v: 10, u: "%" };
      if (!isFinite(s.logo.aspect) || s.logo.aspect <= 0) s.logo.aspect = 1;
      var out = Object.assign(d, s);
      var keep = state;
      state = out; useSolid(out.solid); out = state; state = keep;
      return out;
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

  /* ----------------------------------------------- backgrounds that are made

     A pattern or a gradient is a module: a name, a few fields, and a routine
     that draws it as SVG at the size of the format. Adding another is adding an
     entry to one of these lists — nothing else knows what the modules are. */

  function svgEsc(v) { return String(v).replace(/"/g, "&quot;"); }

  // a colour part way between two, for the stops a module works out for itself
  function mixHex(a, b, t) {
    var A = hexRgb(a), B = hexRgb(b), k = clamp(t, 0, 1);
    var p = function (x, y) { return Math.round(x + (y - x) * k); };
    return "rgb(" + p(A.r, B.r) + " " + p(A.g, B.g) + " " + p(A.b, B.b) + ")";
  }
  function alpha(v) { return clamp(num(v, 100), 0, 100) / 100; }

  // x1,y1 -> x2,y2 across the unit square for an angle in degrees, 0 = upwards
  function angleLine(deg) {
    var a = (num(deg, 0) - 90) * Math.PI / 180, c = Math.cos(a) / 2, s2 = Math.sin(a) / 2;
    return { x1: .5 - c, y1: .5 - s2, x2: .5 + c, y2: .5 + s2 };
  }

  function stopsOf(list) {
    return list.map(function (st) {
      return '<stop offset="' + round(st[0], 4) + '" stop-color="' + svgEsc(st[1]) + '"' +
        (st[2] === undefined ? "" : ' stop-opacity="' + round(st[2], 3) + '"') + "/>";
    }).join("");
  }

  /* The lines of a grid the design already has, in format units. A grid stops at
     the margins, which leaves a band of nothing round a background made from it,
     so the same rhythm is carried out to the edges of the format unless it is
     asked to stop. The phase is the grid's own either way. */
  function rowLines(which, extend, h) {
    var c = content(), u = which === "grid2" ? baseline() / 2 : baseline();
    var from = extend ? c.y - Math.ceil(c.y / u) * u : c.y;
    var to = extend ? h : c.y + c.h;
    var out = [], y;
    for (y = from; y <= to + 0.01 && out.length < 4000; y += u) out.push(y);
    return out;
  }
  function colBands(which, extend, w) {
    if (which === "rect" && !state.solids.length) return [];
    var g = colGrid(which), cw = gridColW(g), step = cw + g.gutter, out = [], k, x;
    var k0 = extend ? Math.floor((0 - g.x) / step) - 1 : 0;
    var k1 = extend ? Math.ceil((w - g.x) / step) + 1 : g.n - 1;
    for (k = k0; k <= k1 && out.length < 400; k++) {
      x = g.x + k * step;
      if (x + cw < -step || x > w + step) continue;
      out.push({ x: x, w: cw });
    }
    return out;
  }

  var BG_MODULES = {
    pattern: [
      {
        id: "grid", name: "Grid",
        note: "Lines on the baseline rows and down the columns. Linked to the design's own " +
          "grids, so it follows them as they change.",
        defaults: { rows: "grid1", rowStep: 40, cols: "format", colStep: 80, band: false,
          extend: true, line: 1, color: "@0", alpha: 20 },
        fields: [
          { k: "rows", label: "Rows from", type: "select", options: [
            ["off", "Nothing"], ["grid1", "Baseline grid 1"], ["grid2", "Baseline grid 2"],
            ["custom", "A spacing of my own"]] },
          { k: "rowStep", label: "Row spacing", type: "number", min: 2, max: 400, step: 1, when: function (p) { return p.rows === "custom"; } },
          { k: "cols", label: "Columns from", type: "select", options: [
            ["off", "Nothing"], ["format", "The format columns"], ["rect", "The solid's columns"],
            ["custom", "A spacing of my own"]] },
          { k: "colStep", label: "Column spacing", type: "number", min: 2, max: 400, step: 1, when: function (p) { return p.cols === "custom"; } },
          { k: "band", label: "Fill the columns instead of drawing their edges", type: "check" },
          { k: "extend", label: "Carry the rhythm past the margins, to the edges of the format", type: "check" },
          { k: "line", label: "Line width", type: "number", min: 0.1, max: 24, step: 0.5 },
          { k: "color", label: "Colour", type: "color" },
          { k: "alpha", label: "Opacity", type: "range", min: 0, max: 100 }
        ],
        draw: function (p, w, h) {
          var out = [], lw = Math.max(0.1, num(p.line, 1)), col = svgEsc(p.color), a = alpha(p.alpha), x, k;
          function hline(y) {
            out.push('<rect x="0" y="' + round(y - lw / 2, 3) + '" width="' + w + '" height="' + lw +
              '" fill="' + col + '" fill-opacity="' + a + '"/>');
          }
          function vline(vx) {
            out.push('<rect x="' + round(vx - lw / 2, 3) + '" y="0" width="' + lw + '" height="' + h +
              '" fill="' + col + '" fill-opacity="' + a + '"/>');
          }
          if (p.rows === "custom") {
            for (x = 0; x <= h + 0.01; x += Math.max(2, num(p.rowStep, 40))) hline(x);
          } else if (p.rows !== "off") rowLines(p.rows, p.extend, h).forEach(hline);

          if (p.cols === "custom") {
            for (x = 0; x <= w + 0.01; x += Math.max(2, num(p.colStep, 80))) vline(x);
          } else if (p.cols !== "off") {
            var bands = colBands(p.cols, p.extend, w);
            for (k = 0; k < bands.length; k++) {
              if (p.band) {
                out.push('<rect x="' + round(bands[k].x, 3) + '" y="0" width="' + round(bands[k].w, 3) +
                  '" height="' + h + '" fill="' + col + '" fill-opacity="' + a + '"/>');
              } else { vline(bands[k].x); vline(bands[k].x + bands[k].w); }
            }
          }
          return out.join("");
        }
      },
      {
        id: "dots", name: "Dots",
        note: "A lattice of dots. Its spacing can come from a baseline grid, so the dots sit on it.",
        defaults: { link: "free", step: 48, r: 3, stagger: true, color: "@0", alpha: 30 },
        fields: [
          { k: "link", label: "Spacing from", type: "select", options: [
            ["free", "A spacing of my own"], ["grid1", "Baseline grid 1"], ["grid2", "Baseline grid 2"]] },
          { k: "step", label: "Spacing", type: "number", min: 2, max: 400, step: 1, when: function (p) { return p.link === "free"; } },
          { k: "r", label: "Dot radius", type: "number", min: 0.2, max: 80, step: 0.5 },
          { k: "stagger", label: "Offset every other row", type: "check" },
          { k: "color", label: "Colour", type: "color" },
          { k: "alpha", label: "Opacity", type: "range", min: 0, max: 100 }
        ],
        draw: function (p, w, h) {
          var step = p.link === "free" ? Math.max(2, num(p.step, 48))
            : p.link === "grid2" ? baseline() / 2 : baseline();
          var r = Math.max(0.2, num(p.r, 3)), out = [], row = 0, y, x;
          for (y = 0; y <= h + step; y += step, row++) {
            var off = p.stagger && row % 2 ? step / 2 : 0;
            for (x = off; x <= w + step; x += step) {
              out.push('<circle cx="' + round(x, 2) + '" cy="' + round(y, 2) + '" r="' + r + '"/>');
            }
          }
          return '<g fill="' + svgEsc(p.color) + '" fill-opacity="' + alpha(p.alpha) + '">' +
            out.join("") + "</g>";
        }
      },
      {
        id: "stripes", name: "Stripes",
        note: "Bands at any angle, drawn as a repeating tile.",
        defaults: { angle: 45, width: 24, gap: 24, color: "@0", alpha: 18 },
        fields: [
          { k: "angle", label: "Angle", type: "number", min: -180, max: 180, step: 1 },
          { k: "width", label: "Band width", type: "number", min: 1, max: 400, step: 1 },
          { k: "gap", label: "Gap", type: "number", min: 0, max: 400, step: 1 },
          { k: "color", label: "Colour", type: "color" },
          { k: "alpha", label: "Opacity", type: "range", min: 0, max: 100 }
        ],
        draw: function (p, w, h) {
          var bw = Math.max(1, num(p.width, 24)), gap = Math.max(0, num(p.gap, 24)), unit = bw + gap;
          return '<defs><pattern id="st" width="' + round(unit, 3) + '" height="' + round(unit, 3) +
            '" patternUnits="userSpaceOnUse" patternTransform="rotate(' + round(num(p.angle, 45), 2) + ')">' +
            '<rect x="0" y="0" width="' + round(bw, 3) + '" height="' + round(unit, 3) + '" fill="' +
            svgEsc(p.color) + '" fill-opacity="' + alpha(p.alpha) + '"/></pattern></defs>' +
            '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#st)"/>';
        }
      },
      {
        id: "checker", name: "Checker",
        note: "A checkerboard of two colours; the cell can follow a baseline grid.",
        defaults: { link: "free", cell: 64, a: "@0", b: "@2", alpha: 12 },
        fields: [
          { k: "link", label: "Cell from", type: "select", options: [
            ["free", "A size of my own"], ["grid1", "Baseline grid 1"], ["grid2", "Baseline grid 2"]] },
          { k: "cell", label: "Cell size", type: "number", min: 2, max: 400, step: 1, when: function (p) { return p.link === "free"; } },
          { k: "a", label: "Colour A", type: "color" },
          { k: "b", label: "Colour B", type: "color" },
          { k: "alpha", label: "Opacity", type: "range", min: 0, max: 100 }
        ],
        draw: function (p, w, h) {
          var c = p.link === "free" ? Math.max(2, num(p.cell, 64))
            : p.link === "grid2" ? baseline() / 2 : baseline();
          var a = alpha(p.alpha);
          return '<defs><pattern id="ck" width="' + round(c * 2, 3) + '" height="' + round(c * 2, 3) +
            '" patternUnits="userSpaceOnUse">' +
            '<rect x="0" y="0" width="' + round(c, 3) + '" height="' + round(c, 3) + '" fill="' + svgEsc(p.a) + '" fill-opacity="' + a + '"/>' +
            '<rect x="' + round(c, 3) + '" y="' + round(c, 3) + '" width="' + round(c, 3) + '" height="' + round(c, 3) + '" fill="' + svgEsc(p.a) + '" fill-opacity="' + a + '"/>' +
            '<rect x="' + round(c, 3) + '" y="0" width="' + round(c, 3) + '" height="' + round(c, 3) + '" fill="' + svgEsc(p.b) + '" fill-opacity="' + a + '"/>' +
            '<rect x="0" y="' + round(c, 3) + '" width="' + round(c, 3) + '" height="' + round(c, 3) + '" fill="' + svgEsc(p.b) + '" fill-opacity="' + a + '"/>' +
            '</pattern></defs><rect x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#ck)"/>';
        }
      },
      {
        id: "rings", name: "Rings",
        note: "Circles out from a point, evenly spaced.",
        defaults: { cx: 50, cy: 50, step: 64, line: 1.5, color: "@0", alpha: 26 },
        fields: [
          { k: "cx", label: "Centre across %", type: "number", min: -100, max: 200, step: 1 },
          { k: "cy", label: "Centre down %", type: "number", min: -100, max: 200, step: 1 },
          { k: "step", label: "Spacing", type: "number", min: 2, max: 400, step: 1 },
          { k: "line", label: "Line width", type: "number", min: 0.1, max: 24, step: 0.5 },
          { k: "color", label: "Colour", type: "color" },
          { k: "alpha", label: "Opacity", type: "range", min: 0, max: 100 }
        ],
        draw: function (p, w, h) {
          var cx = w * num(p.cx, 50) / 100, cy = h * num(p.cy, 50) / 100;
          var far = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy),
            Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy));
          var step = Math.max(2, num(p.step, 64)), out = [], r;
          for (r = step; r <= far + step && out.length < 2000; r += step) {
            out.push('<circle cx="' + round(cx, 2) + '" cy="' + round(cy, 2) + '" r="' + round(r, 2) + '"/>');
          }
          return '<g fill="none" stroke="' + svgEsc(p.color) + '" stroke-opacity="' + alpha(p.alpha) +
            '" stroke-width="' + Math.max(0.1, num(p.line, 1.5)) + '">' + out.join("") + "</g>";
        }
      }
    ],

    gradient: [
      {
        id: "linear", name: "Linear",
        note: "One colour to another along an angle, with the midpoint where you want it.",
        defaults: { angle: 160, from: "@0", to: "@1", mid: 50 },
        fields: [
          { k: "angle", label: "Angle", type: "number", min: -180, max: 360, step: 1 },
          { k: "from", label: "From", type: "color" },
          { k: "to", label: "To", type: "color" },
          { k: "mid", label: "Midpoint %", type: "range", min: 2, max: 98 }
        ],
        draw: function (p, w, h) {
          var a = angleLine(p.angle), m = clamp(num(p.mid, 50), 2, 98) / 100;
          return '<defs><linearGradient id="lg" x1="' + round(a.x1, 4) + '" y1="' + round(a.y1, 4) +
            '" x2="' + round(a.x2, 4) + '" y2="' + round(a.y2, 4) + '">' +
            stopsOf([[0, p.from], [m, mixHex(p.from, p.to, .5)], [1, p.to]]) +
            '</linearGradient></defs><rect width="' + w + '" height="' + h + '" fill="url(#lg)"/>';
        }
      },
      {
        id: "radial", name: "Radial",
        note: "A light from a point, falling off to the far colour.",
        defaults: { cx: 50, cy: 35, r: 70, from: "@0", to: "@1" },
        fields: [
          { k: "cx", label: "Centre across %", type: "number", min: -50, max: 150, step: 1 },
          { k: "cy", label: "Centre down %", type: "number", min: -50, max: 150, step: 1 },
          { k: "r", label: "Radius %", type: "range", min: 5, max: 200 },
          { k: "from", label: "Centre", type: "color" },
          { k: "to", label: "Edge", type: "color" }
        ],
        draw: function (p, w, h) {
          return '<defs><radialGradient id="rg" cx="' + round(num(p.cx, 50) / 100, 4) + '" cy="' +
            round(num(p.cy, 50) / 100, 4) + '" r="' + round(num(p.r, 70) / 100, 4) + '">' +
            stopsOf([[0, p.from], [1, p.to]]) +
            '</radialGradient></defs><rect width="' + w + '" height="' + h + '" fill="url(#rg)"/>';
        }
      },
      {
        id: "conic", name: "Angular sweep",
        note: "A sweep around a point, drawn as a fan of sectors.",
        defaults: { cx: 50, cy: 50, start: 0, from: "@0", to: "@1", steps: 96 },
        fields: [
          { k: "cx", label: "Centre across %", type: "number", min: -50, max: 150, step: 1 },
          { k: "cy", label: "Centre down %", type: "number", min: -50, max: 150, step: 1 },
          { k: "start", label: "Start angle", type: "number", min: -180, max: 360, step: 1 },
          { k: "from", label: "From", type: "color" },
          { k: "to", label: "To", type: "color" },
          { k: "steps", label: "Sectors", type: "range", min: 6, max: 180 }
        ],
        draw: function (p, w, h) {
          var cx = w * num(p.cx, 50) / 100, cy = h * num(p.cy, 50) / 100;
          var n = Math.max(6, Math.round(num(p.steps, 96)));
          var far = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy),
            Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)) * 1.5;
          var st = num(p.start, 0) * Math.PI / 180, out = [], i;
          for (i = 0; i < n; i++) {
            var a0 = st + i / n * Math.PI * 2, a1 = st + (i + 1.02) / n * Math.PI * 2;
            var t = i / (n - 1), k = t <= .5 ? t * 2 : (1 - t) * 2;   // there and back, so it closes
            out.push('<path d="M' + round(cx, 2) + " " + round(cy, 2) +
              "L" + round(cx + far * Math.cos(a0), 2) + " " + round(cy + far * Math.sin(a0), 2) +
              "L" + round(cx + far * Math.cos(a1), 2) + " " + round(cy + far * Math.sin(a1), 2) +
              'Z" fill="' + mixHex(p.from, p.to, k) + '"/>');
          }
          return '<rect width="' + w + '" height="' + h + '" fill="' + svgEsc(p.to) + '"/>' + out.join("");
        }
      },
      {
        id: "mesh", name: "Mesh",
        note: "Three soft lights over a ground, the way a mesh gradient reads.",
        defaults: { base: "@2", a: "@0", b: "@1", c: "@3", spread: 70 },
        fields: [
          { k: "base", label: "Ground", type: "color" },
          { k: "a", label: "Light one", type: "color" },
          { k: "b", label: "Light two", type: "color" },
          { k: "c", label: "Light three", type: "color" },
          { k: "spread", label: "Spread %", type: "range", min: 10, max: 160 }
        ],
        draw: function (p, w, h) {
          var sp = num(p.spread, 70) / 100, r = Math.max(w, h) * sp * 0.7;
          var lights = [[p.a, .18, .22], [p.b, .84, .3], [p.c, .5, .88]];
          var defs = lights.map(function (l, i) {
            return '<radialGradient id="m' + i + '"><stop offset="0" stop-color="' + svgEsc(l[0]) +
              '" stop-opacity="0.95"/><stop offset="1" stop-color="' + svgEsc(l[0]) + '" stop-opacity="0"/></radialGradient>';
          }).join("");
          var blobs = lights.map(function (l, i) {
            return '<circle cx="' + round(w * l[1], 2) + '" cy="' + round(h * l[2], 2) + '" r="' +
              round(r, 2) + '" fill="url(#m' + i + ')"/>';
          }).join("");
          return "<defs>" + defs + '</defs><rect width="' + w + '" height="' + h + '" fill="' +
            svgEsc(p.base) + '"/>' + blobs;
        }
      },
      {
        id: "bands", name: "Bands",
        note: "The same fade, stepped — a posterised gradient with hard edges.",
        defaults: { angle: 180, steps: 6, from: "@0", to: "@1" },
        fields: [
          { k: "angle", label: "Angle", type: "number", min: -180, max: 360, step: 1 },
          { k: "steps", label: "Steps", type: "range", min: 2, max: 24 },
          { k: "from", label: "From", type: "color" },
          { k: "to", label: "To", type: "color" }
        ],
        draw: function (p, w, h) {
          var a = angleLine(p.angle), n = Math.max(2, Math.round(num(p.steps, 6))), st = [], i;
          for (i = 0; i < n; i++) {
            var col = mixHex(p.from, p.to, i / (n - 1));
            st.push([i / n, col], [(i + 1) / n, col]);
          }
          return '<defs><linearGradient id="bd" x1="' + round(a.x1, 4) + '" y1="' + round(a.y1, 4) +
            '" x2="' + round(a.x2, 4) + '" y2="' + round(a.y2, 4) + '">' + stopsOf(st) +
            '</linearGradient></defs><rect width="' + w + '" height="' + h + '" fill="url(#bd)"/>';
        }
      }
    ]
  };

  /* A made background is drawn at the size of the format, so it fills it as it is.
     Turning one on clears any fit, scale or offset left over from an image that
     was there before, or it would arrive part-covered for no visible reason. */
  function bgTurnOn(kind) {
    if (!state.bgGen.on) {
      state.bg.fit = "cover";
      state.bg.scale = 100;
      state.bg.x = 0;
      state.bg.y = 0;
    }
    state.bgGen.on = kind;
  }

  /* A box that holds a picture: where the picture sits inside it, the same way a
     background sits in a format — a fit, a scale over it, and an offset. */
  function picLayout(r, w, h) {
    var nat = r.content === "image" ? imageSize(r.src) : { w: w, h: h };
    var k = Math.max(1, r.scale || 100) / 100, pw, ph;
    if (r.fit === "stretch" || !nat) { pw = w * k; ph = h * k; }
    else if (r.fit === "tile") { pw = nat.w * k; ph = nat.h * k; }
    else {
      var f = r.fit === "contain" ? Math.min(w / nat.w, h / nat.h) : Math.max(w / nat.w, h / nat.h);
      pw = nat.w * f * k; ph = nat.h * f * k;
    }
    return { w: pw, h: ph, x: (w - pw) / 2 + (r.x || 0), y: (h - ph) / 2 + (r.y || 0) };
  }

  // the picture itself: a loaded image, or one of the pattern and gradient modules
  // drawn at the size of the box
  var picCache = {};
  function picSrc(r, w, h) {
    if (r.content === "image") return r.src;
    if (r.content !== "pattern" && r.content !== "gradient") return "";
    var m = bgModule(r.content, r.module);
    var pw = round(w, 2), ph = round(h, 2);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + pw + '" height="' + ph +
      '" viewBox="0 0 ' + pw + " " + ph + '">' +
      m.draw(Object.assign({}, m.defaults, r.params[r.content + ":" + m.id] || {}), pw, ph) + "</svg>";
    var key = r.content + ":" + m.id + ":" + pw + "x" + ph;
    var hit = picCache[key];
    if (!hit || hit.svg !== svg) {
      hit = picCache[key] = { svg: svg, uri: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) };
    }
    return hit.uri;
  }

  function picParams(r) {
    var m = bgModule(r.content, r.module);
    return fromScheme(m, Object.assign({}, m.defaults, r.params[r.content + ":" + m.id] || {}));
  }
  function picSetParam(r, k, v) {
    var m = bgModule(r.content, r.module), key = r.content + ":" + m.id;
    if (!r.params[key]) r.params[key] = {};
    r.params[key][k] = v;
  }

  // always a module, so a box set to a colour or an image cannot trip over it
  function bgModule(kind, id) {
    var list = BG_MODULES[kind] || BG_MODULES.pattern;
    return list.filter(function (m) { return m.id === id; })[0] || list[0];
  }

  // a module's settings: its defaults, with whatever has been changed on top
  function bgParams(kind, id) {
    var m = bgModule(kind, id), key = kind + ":" + m.id;
    return fromScheme(m, Object.assign({}, m.defaults, state.bgGen.params[key] || {}));
  }

  /* A colour a module starts from is written "@2" — the third colour of the colour
     scheme — rather than a colour of its own, so a background that is made but
     never recoloured is in the scheme's colours and follows them as they change.
     Picking a colour stores a hex there instead, and that one is yours. */
  function fromScheme(m, p) {
    var sw = null;
    m.fields.forEach(function (f) {
      var v = p[f.k];
      if (f.type !== "color" || typeof v !== "string" || v.charAt(0) !== "@") return;
      sw = sw || schemeSwatches();
      p[f.k] = sw[(parseInt(v.slice(1), 10) || 0) % sw.length] || "#000000";
    });
    return p;
  }
  function bgSetParam(kind, id, k, v) {
    var key = kind + ":" + bgModule(kind, id).id;
    if (!state.bgGen.params[key]) state.bgGen.params[key] = {};
    state.bgGen.params[key][k] = v;
  }

  // the made background, at the size of the format it is asked for
  function bgSvg() {
    var kind = state.bgGen.on;
    if (kind !== "pattern" && kind !== "gradient") return "";
    var m = bgModule(kind, state.bgGen[kind]);
    var w = round(state.stage.w, 2), h = round(state.stage.h, 2);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h +
      '" viewBox="0 0 ' + w + " " + h + '">' + m.draw(bgParams(kind, m.id), w, h) + "</svg>";
  }

  // one slot per format, so painting the preview rail does not re-encode every tile
  var bgCache = {};
  function bgSrc() {
    if (!state.bgGen.on) return state.bg.src;
    var key = state.stage.w + "x" + state.stage.h, svg = bgSvg();
    var hit = bgCache[key];
    if (!hit || hit.svg !== svg) {
      hit = bgCache[key] = { svg: svg, uri: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) };
    }
    return hit.uri;
  }

  /* --------------------------------------------------- the background image */

  // the natural size of the image, read once; a repaint follows when it arrives
  var imageSizes = {};
  function imageSize(src) {
    if (!src) return null;
    if (Object.prototype.hasOwnProperty.call(imageSizes, src)) return imageSizes[src];
    imageSizes[src] = null;
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      imageSizes[src] = { w: img.naturalWidth || 1, h: img.naturalHeight || 1 };
      render();
    };
    img.onerror = function () { imageSizes[src] = { w: 1, h: 1 }; };
    img.src = src;
    return null;
  }

  // where the image lands: the fit gives a size, the scale multiplies it, and the
  // offsets push it around from the middle. All in format pixels.
  function bgLayout(fw, fh) {
    var bg = state.bg, src = bgSrc(), k = Math.max(1, bg.scale || 100) / 100;
    // a made background is drawn at the size of the format, so its size is known
    var nat = state.bgGen.on ? { w: fw, h: fh } : imageSize(src);
    var w, h;
    if (bg.fit === "stretch") { w = fw * k; h = fh * k; }
    else if (!nat) { w = fw * k; h = fh * k; }            // until the image has loaded
    else if (bg.fit === "tile") { w = nat.w * k; h = nat.h * k; }
    else {
      var f = bg.fit === "contain" ? Math.min(fw / nat.w, fh / nat.h) : Math.max(fw / nat.w, fh / nat.h);
      w = nat.w * f * k; h = nat.h * f * k;
    }
    return { w: w, h: h, x: (fw - w) / 2 + (bg.x || 0), y: (fh - h) / 2 + (bg.y || 0) };
  }

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
    var base = hexRgb(state.stage.bg), bg = state.bg, src = bgSrc();
    if (!src) return base;
    var over = imageColour(src) || { r: 128, g: 128, b: 128 };   // assume mid grey until it is read
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

  // the box the shapes are placed inside: the format inset by the margins
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

  // the box the text stack is painted into: the solid when there is one, the
  // margin box when there is not
  function textFrame() {
    return state.solids.length ? box("rect") : content();
  }

  // the box a given block runs in: the solid it is inside, or the margin box
  function blockFrame(b) {
    var o = blockOwner(b);
    return o >= 0 ? solidBox(o) : content();
  }

  // which lines a block may sit on: grid 1 is the full rows, grid 2 the half lines
  // between them, and "both" every line of either grid
  function blockUnit(b) { return b.grid === "both" ? baseline() / 2 : baseline(); }
  function blockShift(b) { return b.grid === 2 ? baseline() / 2 : 0; }
  function gridLabel(g) { return g === "both" ? "both grids" : "grid " + g; }

  // rows are counted from the margin box, not from the solid, so a block only
  // moves when the page moves. What rides along with the solid is decided by
  // where a block sits, not by the coordinates it is stored in
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

  // the nearest grid line to a y position, for the solid's own grid
  function snapY(y, which) { return snapUnit(y, gridUnit(which)); }

  function sizeOf(name) {
    if (name === "logo") return logoSize();
    var c = content(), u = gridUnit(state.rect.grid), r = state.rect, st = state.stage;
    var w = r.wmode === "format" ? st.w : r.wmode === "full" ? c.w
      : r.wmode === "fit" ? minRectW() : r.w;
    w = Math.max(MIN_SIZE, w);
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
  var textWOf = {};        // the widest line each solid holds, by index (-1 = the page)

  function box(name) {
    var el = state[name], c = content(), s = sizeOf(name);
    // the logo goes to one of nine points of the margin box; a solid goes where it was put
    var pv = name === "rect" ? el.pos.y : fv(el.align.v);
    var ph = name === "rect" ? el.pos.x : fh(el.align.h);
    var y = c.y + c.h * pv - s.h * fv(el.anchor.v);
    var x = c.x + c.w * ph - s.w * fh(el.anchor.h);
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

  /* Moving a shape moves it and nothing else. The anchor — which point of the
     shape lands on the point it is placed at — is the user's own setting, so
     dragging never touches it: it is only ever changed in the anchor grid. */
  function setAlign(name, h, v) {
    state[name].align = { h: h, v: v };
  }

  // where the anchor point of the selected solid is, and putting it somewhere else,
  // both in format pixels — the state keeps the share of the margin box behind them
  function solidAt() {
    var b = box("rect"), a = state.rect.anchor;
    return { x: b.x + b.w * fh(a.h), y: b.y + b.h * fv(a.v) };
  }
  function putSolidAt(x, y) {
    var c = content();
    state.rect.pos = { x: (x - c.x) / Math.max(1, c.w), y: (y - c.y) / Math.max(1, c.h) };
    keepSolidInReach();
  }
  function moveSolidBy(dx, dy) {
    var c = content();
    state.rect.pos = {
      x: state.rect.pos.x + dx / Math.max(1, c.w),
      y: state.rect.pos.y + dy / Math.max(1, c.h)
    };
    keepSolidInReach();
  }

  /* A solid may bleed off the format as far as it likes — that is what bleed is —
     but not so far that there is nothing left to take hold of, so a strip of it
     always stays on the format. */
  var IN_REACH = 48;
  function keepSolidInReach() {
    var r = state.rect, c = content(), s = sizeOf("rect"), st = state.stage;
    var kx = Math.min(s.w, IN_REACH), ky = Math.min(s.h, IN_REACH);
    var ax = s.w * fh(r.anchor.h), ay = s.h * fv(r.anchor.v);
    var x = clamp(c.x + c.w * r.pos.x - ax, kx - s.w, st.w - kx);
    var y = clamp(c.y + c.h * r.pos.y - ay, ky - s.h, st.h - ky);
    r.pos = { x: (x + ax - c.x) / Math.max(1, c.w), y: (y + ay - c.y) / Math.max(1, c.h) };
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
  /* The width the text in a solid would take without wrapping — what "fit the
     text" fits. Measured on the last paint, per solid: working it out live would
     need to know which blocks the solid owns, which needs the box, which needs this. */
  function minRectW() {
    var w = textWOf[state.solid] || 0;
    return w > 0 ? Math.max(MIN_SIZE, w + state.text.padding * 2) : MIN_SIZE;
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

  // the nearest of those
  function snapCols(w) {
    var all = colWidths();
    if (!all.length) return w;
    return all.reduce(function (best, v) {
      return Math.abs(v - w) < Math.abs(best - w) - 0.001 ? v : best;
    }, all[0]);
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
    els.columns = $("#columns"); els.rectColumns = $("#rect-columns");
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

  function familyStack(which) {
    var id = which || state.type.family || "sans";
    if (id.indexOf("g:") === 0 || id.indexOf("u:") === 0) {
      return '"' + id.slice(2).replace(/"/g, "") + '",' + FALLBACK;
    }
    var f = FAMILIES.filter(function (x) { return x.id === id; })[0];
    return (f || FAMILIES[0]).stack;
  }

  /* A role runs in the design's family unless it holds one of its own — which is
     what a pairing is: one family for the headings, another for the text. */
  function roleFamilyId(role) {
    var r = state.type.roles[role];
    return (r && r.family) || state.type.family || "sans";
  }
  function roleStack(role) { return familyStack(roleFamilyId(role)); }
  // every family the design uses, the shared one first
  function familiesInUse() {
    var out = [state.type.family || "sans"];
    ROLES.forEach(function (r) {
      var id = roleFamilyId(r);
      if (out.indexOf(id) < 0) out.push(id);
    });
    return out;
  }

  function familyLabel(which) {
    var id = which || state.type.family || "sans";
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
  function paraByHand() { return state.type.basis === "px"; }

  // the anchor: paragraph size in format pixels
  function paraPx() {
    if (paraByHand()) return Math.max(1, state.type.paragraph);
    return Math.max(1, clamp(state.type.paragraph, PARA_MIN, PARA_MAX) / 100 * typeBasis());
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

  // a block belongs to the solid only while it sits inside it: that is what makes
  // it travel with the box and take the box padding. Everywhere else — above it, below
  // it, or with no solid at all — a block lines up on the columns
  function solidBox(i) { return withSolid(i, function () { return box("rect"); }); }

  // the first solid whose span the block's row falls in, or -1 for the page itself
  function blockOwner(b) {
    var y = rowY(b), found = -1;
    for (var i = 0; i < state.solids.length; i++) {
      var r = solidBox(i);
      if (y >= r.y - 0.5 && y <= r.y + r.h + 0.5) { found = i; break; }
    }
    return found;
  }

  function blockInside(b) { return blockOwner(b) >= 0; }
  function blockOutside(b) { return !blockInside(b); }

  // the nearest column line — either edge of any column — to an offset measured from
  // the left margin
  /* There are two column grids a block can line up on: the format's, across the
     margin box, and the solid's own, across the box. Each is {x, w, n, gutter}. */
  // the box the solid's columns divide: its box, less margins of its own
  function rectColBox() {
    var r = box("rect"), m = state.rect.columns.m;
    return {
      x: r.x + (m.left || 0), y: r.y + (m.top || 0),
      w: Math.max(1, r.w - (m.left || 0) - (m.right || 0)),
      h: Math.max(1, r.h - (m.top || 0) - (m.bottom || 0))
    };
  }

  function colGrid(which) {
    if (which === "rect" && state.solids.length) {
      var r = rectColBox(), rc = state.rect.columns;
      return { x: r.x, w: r.w, n: Math.max(1, Math.round(rc.n)), gutter: Math.max(0, rc.gutter) };
    }
    var c = content();
    return { x: c.x, w: c.w, n: colCount(), gutter: Math.max(0, state.cols.gutter) };
  }
  function gridColW(g) { return Math.max(1, (g.w - (g.n - 1) * g.gutter) / g.n); }

  // the nearest line of a grid — a column edge either side of a gutter
  function gridLine(g, off) {
    var w = gridColW(g), step = w + g.gutter;
    var best = 0, bd = Infinity, k, cands = [g.w];
    for (k = 0; k < g.n; k++) cands.push(k * step, k * step + w);
    cands.forEach(function (v) {
      var d = Math.abs(v - off);
      if (d < bd) { bd = d; best = v; }
    });
    return clamp(best, 0, g.w);
  }

  function colLine(off) { return gridLine(colGrid("format"), off); }

  /* Which grid a block lines up on. "auto" keeps the old rule — the box padding
     while it is inside the solid, the format columns anywhere else. */
  function blockCols(b) {
    var c = b.cols || "auto";
    if (c === "rect" && !state.solids.length) return "format";
    if (c === "format" || c === "rect") return c;
    return blockOwner(b) >= 0 ? "box" : "format";
  }
  // a block on "the solid's columns" means the one it is inside, not the selected one
  function blockGrid(b) {
    var mode = blockCols(b), o = blockOwner(b);
    if (mode !== "rect" || o < 0) return colGrid(mode);
    return withSolid(o, function () { return colGrid("rect"); });
  }

  // what a block insets from the sides of the stack it is painted in
  /* Insets from the margin box, which is the one layer every block is painted in
     whatever it belongs to. */
  function blockInsets(b) {
    var t = state.text, c = content(), o = blockOwner(b);
    if (blockCols(b) === "box") {
      var f = o >= 0 ? solidBox(o) : c;
      var sp = o >= 0 ? withSolid(o, function () { return sidePad(b.align); }) : { l: 0, r: 0 };
      return {
        l: (f.x + t.padding + sp.l + (b.padL || 0)) - c.x,
        r: (c.x + c.w) - (f.x + f.w - t.padding - sp.r - (b.padR || 0))
      };
    }
    var g = blockGrid(b), cw = gridColW(g);
    var left = g.x + gridLine(g, b.padL || 0);
    var right = g.x + gridLine(g, g.w - (b.padR || 0));
    if (right - left < cw) right = Math.min(g.x + g.w, left + cw);
    return { l: left - c.x, r: (c.x + c.w) - right };
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
    Object.assign(stack.style, { inset: "0px", fontFamily: familyStack() });

    var origin = content().y;                                  // top of the layer, in format units
    Array.prototype.forEach.call(stack.children, function (el, i) {
      var b = blocks[i], st = state.type.roles[b.role], ins = blockInsets(b);
      el.dataset.i = t.blocks.indexOf(b);
      Object.assign(el.style, {
        top: (rowY(b) - baselineInBox(b.role) - origin) * s + "px",
        marginLeft: ins.l * s + "px",
        marginRight: ins.r * s + "px",
        /* Lines break where they are typed and again at the right edge of the area
           the block runs in: the page's right margin outside a solid, the solid's
           right edge less the side padding inside one. */
        whiteSpace: "pre-wrap",
        fontSize: rolePx(b.role) * s + "px",
        fontFamily: roleStack(b.role),
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
    var widest = {};
    var reads = kids.map(function (el, i) {
      var probe = el._probe || el.querySelector(".bl-probe");
      if (!probe) return null;
      var r = el.getBoundingClientRect();
      // a range around the text reports the widest line, whatever the box is doing
      /* What "fit the text" fits: the width the block would take if it did not
         wrap. Measured by letting it lay out that way for the length of a read —
         nothing paints in between. */
      try {
        var ws = el.style.whiteSpace, wd = el.style.width, rt = el.style.right;
        el.style.whiteSpace = "pre";
        el.style.width = "max-content";
        el.style.right = "auto";
        var line = el.getBoundingClientRect().width / s;
        el.style.whiteSpace = ws; el.style.width = wd; el.style.right = rt;
        var o = blockOwner(blocks[i]);
        widest[o] = Math.max(widest[o] || 0, line);
      } catch (e) {}
      return {
        top: parseFloat(el.style.top) || 0,
        boxTop: r.top - stageTop,
        baseline: probe.getBoundingClientRect().bottom - stageTop,
        target: rowY(blocks[i]) * s
      };
    });
    /* The box is never narrower than its text, so a new measurement can resize it.
       Nothing wraps, so the measurement does not depend on the box: this settles at once. */
    var moved = false;
    state.solids.forEach(function (sd, i) {
      var w = widest[i] || 0;
      if (Math.abs(w - (textWOf[i] || 0)) > 0.5) moved = true;
      textWOf[i] = w;
    });
    Object.keys(textWOf).forEach(function (k) {
      if (+k >= state.solids.length) delete textWOf[k];
    });
    if (moved) render();
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
      var bg = state.bg, bgs = bgSrc();
      if (bgs) {
        var bl = bgLayout(fw, fh);
        Object.assign(image.style, {
          display: "block",
          backgroundImage: 'url("' + bgs.replace(/"/g, '\\"') + '")',
          backgroundSize: round(bl.w * s, 2) + "px " + round(bl.h * s, 2) + "px",
          backgroundRepeat: bg.fit === "tile" ? "repeat" : "no-repeat",
          backgroundPosition: round(bl.x * s, 2) + "px " + round(bl.y * s, 2) + "px",
          opacity: bg.opacity / 100
        });
      } else { image.style.display = "none"; }

      /* One element per solid. The fill is a layer of its own inside each, because
         a cut shape clips whatever is inside it — and type that runs past the edge
         of a box must not be cut. */
      var solids = child(host, "solids", "div", "solids");
      while (solids.children.length > state.solids.length) solids.removeChild(solids.lastChild);
      while (solids.children.length < state.solids.length) {
        var sol = document.createElement("div");
        sol.className = "shape rect";
        sol.dataset.el = "rect";
        var fl = document.createElement("div");
        fl.className = "rect-shape";
        sol.appendChild(fl);
        solids.appendChild(sol);
      }
      state.solids.forEach(function (sd, i) {
        withSolid(i, function () {
          var el = solids.children[i];
          el.dataset.i = i;
          var shaped = sd.shape !== "radius";
          var b = box("rect");
          Object.assign(el.style, shapeStyle("rect", s));
          /* No background shorthand here: it would reset the image behind it. */
          var pic = sd.visible ? picSrc(sd, b.w, b.h) : "";
          var pl = pic ? picLayout(sd, b.w, b.h) : null;
          Object.assign(el.firstChild.style, {
            borderRadius: shaped ? "0" : radiusCSS(s),
            clipPath: shaped ? clipCSS(s) : "none",   // the corner shape is the mask
            backgroundColor: sd.visible ? sd.fill : "transparent",
            backgroundSize: pl ? round(pl.w * s, 2) + "px " + round(pl.h * s, 2) + "px" : "auto",
            backgroundPosition: pl ? round(pl.x * s, 2) + "px " + round(pl.y * s, 2) + "px" : "0 0",
            backgroundRepeat: sd.fit === "tile" ? "repeat" : "no-repeat",
            backgroundImage: pic ? 'url("' + pic.replace(/"/g, '\\"') + '")' : "none"
          });
        });
      });

      // the text runs in one layer over the margin box, whichever solid a block is in
      var free = child(host, "free", "div", "text-free");
      free.hidden = !textVisible();
      if (!free.hidden) {
        var c = content();
        Object.assign(free.style, {
          left: c.x * s + "px", top: c.y * s + "px",
          width: c.w * s + "px", height: c.h * s + "px"
        });
        paintText(free, s);
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

  // the text stack in play: inside the solid, or in the free layer
  function liveStack() {
    var r = els.stage._rect, f = els.stage._free;
    return (r && r._text) || (f && f._text) || null;
  }

  function renderStage() {
    renderSegments();
    if (!segment().built) return;   // nothing to measure while the canvas is away
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
    renderBlockInspector();
    renderSolidInspector();
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
    drawColumns(els.columns, colGrid("format"), c.show && c.n >= 1, s,
      { x: m.left, y: m.top, h: contentH() });
    var rc = state.rect.columns;
    var on = !!state.solids.length && rc.show && rc.n >= 1;
    var r = state.solids.length ? rectColBox() : null;
    drawColumns(els.rectColumns, colGrid("rect"), on, s, r);
  }

  // one grid of columns, tinted in the guide colour, over the box it belongs to
  function drawColumns(el, g, on, s, at) {
    el.hidden = !on || !at || state.showGuides === false;
    if (el.hidden) return;
    var col = gridColW(g) * s, gut = g.gutter * s;
    var rgb = hexRgb(guideColour());
    var tint = "rgba(" + Math.round(rgb.r) + "," + Math.round(rgb.g) + "," + Math.round(rgb.b) + ",0.09)";
    Object.assign(el.style, {
      left: at.x * s + "px",
      top: at.y * s + "px",
      width: g.w * s + "px",
      height: at.h * s + "px",
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
    // the project's own formats once it has any; the catalogue until then
    if (state.pages.length) {
      return state.pages.map(function (pg, i) {
        return { id: "p" + i, name: pg.name + (pg.master ? " · master" : ""), w: pg.w, h: pg.h, page: i };
      });
    }
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
        return '<button type="button" class="tile" data-w="' + f.w + '" data-h="' + f.h + '"' +
          (f.page === undefined ? "" : ' data-page="' + f.page + '"') + ">" +
          '<span class="tile-box"><span class="tile-stage"></span></span>' +
          '<span class="tile-name">' + esc(f.name) + "</span>" +
          '<span class="tile-size">' + fmt(f.w) + " × " + fmt(f.h) + "</span></button>";
      }).join("");
    }
    var active = fmt(state.stage.w) + "x" + fmt(state.stage.h);
    Array.prototype.forEach.call(host.children, function (btn, i) {
      var f = list[i];
      btn.setAttribute("aria-pressed",
        (f.page === undefined ? f.id === active : f.page === state.page) ? "true" : "false");
      var s = Math.min(TILE.w / f.w, TILE.h / f.h);
      if (f.page === undefined) paintInto(btn.querySelector(".tile-stage"), f.w, f.h, s);
      else withPage(f.page, function () { paintInto(btn.querySelector(".tile-stage"), f.w, f.h, s); });
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
      html += '<button type="button" class="handle kill" ' +
        'title="Take the solid off the stage — it goes back to the tray">✕</button>';
    }
    return html;
  }

  var frameFor = null;
  function renderFrame(s) {
    var name = state.sel;
    // the handles are part of the furniture: hiding the guides hides them too
    var on = name === "rect" ? !!state.solids.length : name && state[name] && state[name].visible;
    var shown = on && state.showGuides !== false;
    els.frame.hidden = !shown;
    if (!shown) { frameFor = null; return; }
    var key = name;
    if (frameFor !== key) { els.frame.innerHTML = frameHandles(name); frameFor = key; }

    var b = box(name);
    Object.assign(els.frame.style, shapeStyle(name, s));
    els.frame.classList.toggle("full-width", name === "rect" && state.rect.wmode !== "fixed");
    els.frame.classList.toggle("round", name === "logo" && !state.logo.src);

    var kill = els.frame.querySelector(".handle.kill");
    if (kill) {                                  // just inside the corner, clear of the handles
      kill.style.left = Math.max(0, b.w * s - 11) + "px";
      kill.style.top = Math.min(11, b.h * s / 2) + "px";
      kill.hidden = state.selBlock >= 0;         // the block's own ✕ has the corner
    }
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
    // just inside the corner, clear of the edge handles that share it
    var kill = els.blockFrame.querySelector(".bhandle.kill");
    kill.style.left = Math.max(0, r.width - 11) + "px";
    kill.style.top = Math.min(11, r.height / 2) + "px";
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

  /* The tab bar, and what it shows: the design system is the interface itself,
     the rest are stages still to come and stand behind a placeholder. */
  function renderSegments() {
    var cur = segment();
    $("#segments").innerHTML = SEGMENTS.map(function (sg, i) {
      return '<button type="button" data-seg="' + sg.id + '" aria-pressed="' +
        (sg.id === cur.id ? "true" : "false") + '">' +
        '<span class="seg-n">' + (i + 1) + "</span>" + esc(sg.name) +
        (sg.built ? "" : '<span class="seg-soon">soon</span>') + "</button>";
    }).join("");

    var system = cur.id === "system", bg = cur.id === "background", fmt = cur.id === "formats";
    var col = cur.id === "colour";
    $("#panel").hidden = !system;
    $("#canvas").hidden = !system;
    $("#seg-bg").hidden = !bg;
    $("#seg-fmt").hidden = !fmt;
    $("#seg-col").hidden = !col;
    $("#seg-stub").hidden = !!cur.built;
    document.body.classList.toggle("stub-on", !cur.built);
    if (bg) return renderBgSeg();
    if (fmt) return renderFmtSeg();
    if (col) return renderColSeg();
    if (cur.built) return;

    $("#stub-name").textContent = cur.name;
    $("#stub-note").textContent = cur.note;
    $("#stub-steps").innerHTML = (cur.steps || []).map(function (t) {
      return '<span class="stub-step">' + esc(t) + "</span>";
    }).join("");
  }

  var fmtZoom = 1;

  /* What fills the selected box: a colour, an image, or one of the pattern and
     gradient modules the background stage uses, drawn at the size of the box. */
  function syncPic(r) {
    var kind = r.content, made = kind === "pattern" || kind === "gradient";
    $("#pic-content").value = kind;
    $("#pic-image").hidden = kind !== "image";
    $("#pic-mods").hidden = !made;
    $("#pic-mod-note").hidden = !made;
    $("#pic-fields").hidden = !made;
    $("#pic-place").hidden = kind === "fill";
    if (kind === "image") {
      setValue($("#pic-url"), /^data:/.test(r.src) ? "" : r.src);
      $("#pic-url").placeholder = /^data:/.test(r.src) ? "— uploaded image —" : "https://…";
    }
    if (made) {
      var list = BG_MODULES[kind], cur = bgModule(kind, r.module);
      var host = $("#pic-mods"), sig = kind + ":" + list.map(function (m) { return m.id; }).join(",");
      if (host.dataset.sig !== sig) {
        host.dataset.sig = sig;
        host.innerHTML = list.map(function (m) {
          return '<button type="button" data-picmod="' + m.id + '">' +
            '<span class="mod-chip" data-chip="' + m.id + '"></span>' + esc(m.name) + "</button>";
        }).join("");
      }
      Array.prototype.forEach.call(host.children, function (btn, i) {
        var m = list[i];
        btn.setAttribute("aria-pressed", m.id === cur.id ? "true" : "false");
        var chip = btn.querySelector(".mod-chip");
        var pr = Object.assign({}, m.defaults, r.params[kind + ":" + m.id] || {});
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">' +
          withFormat(320, 180, function () { return m.draw(pr, 320, 180); }) + "</svg>";
        if (chip.dataset.svg !== svg) {
          chip.dataset.svg = svg;
          chip.style.backgroundColor = r.fill;
          chip.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,' +
            encodeURIComponent(svg).replace(/"/g, "%22") + '")';
        }
      });
      $("#pic-mod-note").textContent = cur.note;
      buildPicFields(r, cur);
    }
    if (kind !== "fill") {
      $("#pic-fit").value = r.fit;
      setValue($("#pic-scale"), r.scale);
      $("#pic-scale-val").textContent = fmt(r.scale) + "%";
      setValue($("#pic-x"), fmt(r.x));
      setValue($("#pic-y"), fmt(r.y));
      var pb = box("rect");
      bound("#pic-x", -Math.round(pb.w), Math.round(pb.w));
      bound("#pic-y", -Math.round(pb.h), Math.round(pb.h));
      var b = box("rect"), pl = picLayout(r, b.w, b.h);
      $("#pic-hint").textContent = "The box is " + round(b.w, 1) + " × " + round(b.h, 1) +
        " and what fills it runs " + round(pl.w, 1) + " × " + round(pl.h, 1) + " at " +
        round(pl.x, 1) + " / " + round(pl.y, 1) + " inside it. Hold ⌥/Alt and drag the box on the " +
        "canvas to move it. The corner shape masks it.";
    } else {
      $("#pic-hint").textContent = "A colour fill. Set it to an image, a pattern or a gradient and " +
        "the box becomes a frame — resized, snapped and masked exactly the same way.";
    }
  }

  function buildPicFields(r, m) {
    var host = $("#pic-fields"), pr = picParams(r);
    var show = m.fields.filter(function (f) { return !f.when || f.when(pr); });
    var sig = r.content + ":" + m.id + ":" + show.map(function (f) { return f.k; }).join(",");
    if (host.dataset.sig !== sig) {
      host.dataset.sig = sig;
      host.innerHTML = show.map(function (f) { return picFieldHtml(f); }).join("");
    }
    show.forEach(function (f) {
      var el = host.querySelector('[data-picf="' + f.k + '"]');
      if (!el) return;
      if (f.type === "check") el.checked = !!pr[f.k];
      else setValue(el, pr[f.k]);
      if (f.type === "color") {
        fillChips(host.querySelector('[data-picsw="' + f.k + '"]'), schemeSwatches(), pr[f.k], "picc", f.k);
      }
      var out = host.querySelector('[data-picv="' + f.k + '"]');
      if (out) out.textContent = fmt(pr[f.k]);
    });
  }

  function picFieldHtml(f) {
    var lab = esc(f.label);
    if (f.type === "check") {
      return '<label class="check wide"><input type="checkbox" data-picf="' + f.k + '"><span>' + lab + "</span></label>";
    }
    if (f.type === "color") {
      return '<div class="field color"><span>' + lab + '</span><input type="color" data-picf="' + f.k + '">' +
        '<span class="sw-row" data-picsw="' + f.k + '"></span></div>';
    }
    if (f.type === "range") {
      return '<label class="field wide"><span>' + lab + ' <b data-picv="' + f.k + '"></b></span>' +
        '<input type="range" data-picf="' + f.k + '" min="' + (f.min || 0) + '" max="' +
        (f.max === undefined ? 100 : f.max) + '" step="1"></label>';
    }
    if (f.type === "select") {
      return '<label class="field wide"><span>' + lab + '</span><select data-picf="' + f.k + '">' +
        f.options.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("") +
        "</select></label>";
    }
    return '<label class="field"><span>' + lab + '</span><input type="number" data-picf="' + f.k + '"' +
      (f.min === undefined ? "" : ' min="' + f.min + '"') +
      (f.max === undefined ? "" : ' max="' + f.max + '"') +
      ' step="' + (f.step || 1) + '"></label>';
  }

  function renderFmtSeg() {
    var m = masterIndex();
    if (!$("#fmt-pick").options.length) {
      var groups = [];
      FORMATS.forEach(function (f) { if (groups.indexOf(f.group) < 0) groups.push(f.group); });
      $("#fmt-pick").innerHTML = groups.map(function (g) {
        return '<optgroup label="' + esc(g) + '">' +
          FORMATS.filter(function (f) { return f.group === g; }).map(function (f) {
            return '<option value="' + f.id + '">' + esc(f.name) + " — " + f.w + " × " + f.h +
              " · " + ratioLabel(f.w, f.h) + "</option>";
          }).join("") + "</optgroup>";
      }).join("");
    }

    $("#fmt-list").innerHTML = state.pages.map(function (pg, i) {
      var links = LINK_GROUPS.map(function (g) {
        return '<label class="check"><input type="checkbox" data-link="' + g.k + '" data-i="' + i + '"' +
          (pg.links[g.k] ? " checked" : "") + "><span>" + esc(g.name) + "</span></label>";
      }).join("");
      return '<div class="fmt-row' + (i === state.page ? " on" : "") + '" data-page="' + i + '">' +
        '<div class="fmt-row-head">' +
          "<b>" + esc(pg.name) + "</b>" +
          '<span class="px">' + fmt(pg.w) + " × " + fmt(pg.h) + "</span>" +
          '<button type="button" class="x" data-drop="' + i + '" title="Take this format out of the project">✕</button>' +
        "</div>" +
        '<label class="check"><input type="radio" name="fmt-master" data-master="' + i + '"' +
          (pg.master ? " checked" : "") + "><span>Master</span></label>" +
        (pg.master
          ? '<p class="master-note">Every other format takes what it is linked to from this one.</p>'
          : '<div class="links">' + links + "</div>")
      + "</div>";
    }).join("") || '<p class="hint">No formats yet — add one below. The first is the master.</p>';

    $("#fmt-hint").textContent = state.pages.length
      ? "Tick what a format takes from the master; untick it to keep that part for this format " +
        "alone. Click a tile to work on that format in the design system."
      : "";

    // one tile per format, each painted at its own values
    var host = $("#fmt-grid");
    var sig = state.pages.map(function (pg) { return pg.key; }).join(",") + "|" + fmtZoom;
    if (host.dataset.sig !== sig) {
      host.dataset.sig = sig;
      host.innerHTML = state.pages.map(function (pg, i) {
        return '<button type="button" class="fmt-tile" data-page="' + i + '">' +
          '<span class="tile-box"><span class="tile-stage"></span></span>' +
          "<b>" + esc(pg.name) + (pg.master ? ' <span class="flag">master</span>' : "") + "</b>" +
          "<span>" + fmt(pg.w) + " × " + fmt(pg.h) + " · " + esc(ratioLabel(pg.w, pg.h)) + "</span></button>";
      }).join("");
    }
    var side = 260 * fmtZoom;
    Array.prototype.forEach.call(host.children, function (btn, i) {
      var pg = state.pages[i];
      if (!pg) return;
      btn.setAttribute("aria-pressed", i === state.page ? "true" : "false");
      btn.querySelector("b").innerHTML = esc(pg.name) + (pg.master ? ' <span class="flag">master</span>' : "");
      var sc = Math.min(side / pg.w, side / pg.h);
      var boxEl = btn.querySelector(".tile-box");     // one square each, so the labels line up
      boxEl.style.width = side + "px";
      boxEl.style.height = side + "px";
      withPage(i, function () { paintInto(btn.querySelector(".tile-stage"), pg.w, pg.h, sc); });
    });
    $("#fmt-view-name").textContent = state.pages.length
      ? state.pages.length + (state.pages.length === 1 ? " format" : " formats") +
        (m >= 0 ? " \u2014 master: " + state.pages[m].name : "")
      : "Nothing in the project yet";
    $("#fmtz-value").textContent = Math.round(fmtZoom * 100) + "%";
  }

  /* ------------------------------------------------------- colour schemes

     A scheme is one colour and a relationship between hues — the ways colour is
     usually worked out. The swatches fall out of the two, and are put on the type
     roles, the solids and the page. */
  var TECHNIQUES = [
    { id: "mono", name: "Monochromatic — one hue, light to dark", offs: function () { return [0]; } },
    { id: "analogous", name: "Analogous — neighbours on the wheel",
      offs: function (d) { return [0, -d, d, -2 * d, 2 * d]; }, spread: true },
    { id: "complement", name: "Complementary — opposite hues", offs: function () { return [0, 180]; } },
    { id: "split", name: "Split complementary — either side of the opposite",
      offs: function (d) { return [0, 180 - d, 180 + d]; }, spread: true },
    { id: "triad", name: "Triadic — three, evenly spaced", offs: function () { return [0, 120, 240]; } },
    { id: "tetrad", name: "Tetradic — four, evenly spaced", offs: function () { return [0, 90, 180, 270]; } },
    { id: "shades", name: "Tints and shades — one hue, wide range", offs: function () { return [0]; } }
  ];

  function techniqueOf(id) {
    return TECHNIQUES.filter(function (t) { return t.id === id; })[0] || TECHNIQUES[0];
  }

  function schemeSwatches() {
    var sc = state.scheme, t = techniqueOf(sc.technique), base = hexHsl(sc.base);
    var offs = t.offs(clamp(num(sc.spread, 30), 5, 90));
    var n = clamp(Math.round(num(sc.count, 6)), 3, 12), out = [], i;
    var wide = sc.technique === "shades" ? 0.26 : 0.16;
    for (i = 0; i < n; i++) {
      var pass = Math.floor(i / offs.length);
      // the first pass is the hues themselves; each one after it steps the lightness
      var step = pass === 0 ? 0 : (pass % 2 ? 1 : -1) * Math.ceil(pass / 2) * wide;
      var sat = base.s * (offs.length === 1 && pass ? 1 - Math.abs(step) * 0.5 : 1);
      out.push(hslHex(base.h + offs[i % offs.length], sat, clamp(base.l + step, 0.06, 0.96)));
    }
    return out;
  }

  // everything a scheme colour can be put on
  function schemeTargets() {
    var out = [{ k: "bg", name: "Page background", get: function () { return state.stage.bg; },
      put: function (v) { state.stage.bg = v; } }];
    ROLES.forEach(function (r) {
      out.push({ k: "role:" + r, name: ROLE_NAMES[r], type: true,
        get: function () { return state.type.roles[r].color; },
        put: function (v) { state.type.roles[r].color = v; } });
    });
    state.solids.forEach(function (sd, i) {
      out.push({ k: "solid:" + i, name: (sd.content === "fill" ? "Solid " : "Frame ") + (i + 1),
        get: function () { return sd.fill; },
        put: function (v) { sd.fill = v; } });
    });
    return out;
  }

  var colZoom = 1;

  function renderColSeg() {
    var sc = state.scheme, sw = schemeSwatches();

    if (!$("#col-technique").options.length) {
      $("#col-technique").innerHTML = TECHNIQUES.map(function (t) {
        return '<option value="' + t.id + '">' + esc(t.name) + "</option>";
      }).join("");
    }
    $("#col-technique").value = sc.technique;
    $("#col-base").value = sc.base;
    setValue($("#col-count"), sc.count);
    $("#col-count-val").textContent = clamp(Math.round(sc.count), 3, 12);
    setValue($("#col-spread"), sc.spread);
    $("#col-spread-val").textContent = fmt(sc.spread) + "°";
    $("#col-spread-field").hidden = !techniqueOf(sc.technique).spread;
    $("#col-note").textContent = techniqueOf(sc.technique).name + ". " + sw.length +
      " swatches from " + sc.base.toUpperCase() + " — click one on a row below to put it there.";

    $("#col-swatches").innerHTML = sw.map(function (hex) {
      return '<div class="sw-cell"><span class="sw-box" style="background:' + hex + '"></span>' +
        "<span>" + hex.toUpperCase() + "</span></div>";
    }).join("");

    $("#col-targets").innerHTML = schemeTargets().map(function (t) {
      var cur = (t.get() || "").toLowerCase();
      var chips = sw.map(function (hex) {
        return '<button type="button" class="sw-chip-btn' + (hex.toLowerCase() === cur ? " on" : "") +
          '" style="background:' + hex + '" data-put="' + t.k + '" data-hex="' + hex +
          '" title="' + esc(t.name) + " \u2192 " + hex.toUpperCase() + '"></button>';
      }).join("");
      var ratio = t.type ? contrastRatio(t.get(), state.stage.bg) : 0;
      return '<div class="col-row"><div class="col-row-head">' +
        '<input type="color" data-col="' + t.k + '" value="' + t.get() + '">' +
        "<b>" + esc(t.name) + "</b>" +
        (t.type ? '<span class="px">' + round(ratio, 2) + ":1 on the page</span>" : "") +
        "</div><div class=\"sw-row\">" + chips + "</div></div>";
    }).join("");

    // the formats the work runs in, painted with the scheme on them
    var host = $("#col-grid"), list = state.pages.length ? state.pages : null;
    var sig = (list ? list.map(function (pg) { return pg.key; }).join(",") : "one") + "|" + colZoom;
    if (host.dataset.sig !== sig) {
      host.dataset.sig = sig;
      host.innerHTML = (list || [{ name: formatName(), w: state.stage.w, h: state.stage.h }])
        .map(function (pg, i) {
          return '<button type="button" class="fmt-tile" data-page="' + i + '">' +
            '<span class="tile-box"><span class="tile-stage"></span></span>' +
            "<b>" + esc(pg.name) + "</b><span>" + fmt(pg.w) + " × " + fmt(pg.h) + "</span></button>";
        }).join("");
    }
    var side = 240 * colZoom;
    Array.prototype.forEach.call(host.children, function (btn, i) {
      var pg = list ? list[i] : { w: state.stage.w, h: state.stage.h };
      var boxEl = btn.querySelector(".tile-box");
      boxEl.style.width = side + "px";
      boxEl.style.height = side + "px";
      var sc2 = Math.min(side / pg.w, side / pg.h);
      var paint = function () { paintInto(btn.querySelector(".tile-stage"), pg.w, pg.h, sc2); };
      if (list) withPage(i, paint); else paint();
    });
    $("#col-view-name").textContent = list
      ? list.length + (list.length === 1 ? " format" : " formats") + " in the project"
      : "This format — add more in Design formats";
    $("#colz-value").textContent = Math.round(colZoom * 100) + "%";
  }

  var BG_TABS = [["image", "Image"], ["pattern", "Pattern"], ["gradient", "Gradient"]];

  // the made background has a zoom of its own; the view scrolls when it is bigger
  function bgFitScale() {
    var r = $("#bg-view-stage").getBoundingClientRect();
    var s = Math.min((r.width - 56) / state.stage.w, (r.height - 56) / state.stage.h);
    return s > 0 ? s : 0.2;
  }
  function bgScale() { return state.bgGen.zoom || bgFitScale(); }
  function setBgZoom(z) {
    state.bgGen.zoom = z ? clamp(z, .02, 16) : null;
    render();
  }

  function renderBgSeg() {
    var tab = state.bgGen.tab;
    if (!BG_MODULES[tab] && tab !== "image") tab = state.bgGen.tab = "pattern";

    $("#bg-tabs").innerHTML = BG_TABS.map(function (t) {
      return '<button type="button" data-bgtab="' + t[0] + '" aria-pressed="' +
        (t[0] === tab ? "true" : "false") + '">' + esc(t[1]) +
        (t[0] === "image" ? '<span class="seg-soon">soon</span>' : "") + "</button>";
    }).join("");
    $("#bg-image").hidden = tab !== "image";
    $("#bg-maker").hidden = tab === "image";

    if (tab !== "image") {
      var list = BG_MODULES[tab], cur = bgModule(tab, state.bgGen[tab]);
      var host = $("#bg-mods"), sig = tab + ":" + list.map(function (m) { return m.id; }).join(",");
      if (host.dataset.sig !== sig) {
        host.dataset.sig = sig;
        host.innerHTML = list.map(function (m) {
          return '<button type="button" data-bgmod="' + m.id + '">' +
            '<span class="mod-chip" data-chip="' + m.id + '"></span>' + esc(m.name) + "</button>";
        }).join("");
      }
      Array.prototype.forEach.call(host.children, function (btn, i) {
        var m = list[i];
        btn.setAttribute("aria-pressed", m.id === cur.id ? "true" : "false");
        // each card shows what its module makes, at the shape of the format
        var chip = btn.querySelector(".mod-chip");
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">' +
          withFormat(320, 180, function () { return m.draw(bgParams(tab, m.id), 320, 180); }) + "</svg>";
        if (chip.dataset.svg !== svg) {
          chip.dataset.svg = svg;
          chip.style.backgroundColor = state.stage.bg;
          chip.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,' +
            encodeURIComponent(svg).replace(/"/g, "%22") + '")';
        }
      });

      $("#bg-mod-note").textContent = cur.note;
      buildBgFields(tab, cur);
      var live = state.bgGen.on === tab;
      $("#bg-use").hidden = live;
      $("#bg-clear-gen").hidden = !state.bgGen.on;
      $("#bg-gen-hint").textContent = live
        ? "This is the background. It is drawn at " + fmt(state.stage.w) + " × " + fmt(state.stage.h) +
          " for this format and made again for every other one, so anything linked to the grids " +
          "follows them. Fit, opacity, scale and position are in Format \u2192 Background image."
        : state.bgGen.on
          ? "The " + state.bgGen.on + " is the background at the moment. Use this one to swap it."
          : "Nothing is made yet — the background is whatever is set in Format \u2192 Background image.";
    }

    $("#bg-view-name").textContent = formatName() + (state.bgGen.on
      ? " \u2014 " + bgModule(state.bgGen.on, state.bgGen[state.bgGen.on]).name.toLowerCase() +
        " " + state.bgGen.on
      : " \u2014 no made background");

    var s = bgScale();
    $("#bgz-value").textContent = Math.round(s * 100) + "%";
    paintInto(child($("#bg-view-stage"), "stage", "div", "bg-stage"), state.stage.w, state.stage.h, s);
  }

  // the fields of the module that is showing, built from its own list
  function buildBgFields(kind, m) {
    var host = $("#bg-fields"), p = bgParams(kind, m.id);
    var show = m.fields.filter(function (f) { return !f.when || f.when(p); });
    var sig = kind + ":" + m.id + ":" + show.map(function (f) { return f.k; }).join(",");
    if (host.dataset.sig !== sig) {
      host.dataset.sig = sig;
      host.innerHTML = show.map(function (f) {
        var lab = esc(f.label);
        if (f.type === "check") {
          return '<label class="check wide"><input type="checkbox" data-bgf="' + f.k + '"><span>' + lab + "</span></label>";
        }
        if (f.type === "color") {
          return '<div class="field color"><span>' + lab + '</span><input type="color" data-bgf="' + f.k + '">' +
            '<span class="sw-row" data-bgsw="' + f.k + '"></span></div>';
        }
        if (f.type === "range") {
          return '<label class="field wide"><span>' + lab + ' <b data-bgv="' + f.k + '"></b></span>' +
            '<input type="range" data-bgf="' + f.k + '" min="' + (f.min || 0) + '" max="' +
            (f.max === undefined ? 100 : f.max) + '" step="1"></label>';
        }
        if (f.type === "select") {
          return '<label class="field wide"><span>' + lab + '</span><select data-bgf="' + f.k + '">' +
            f.options.map(function (o) {
              return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>";
            }).join("") + "</select></label>";
        }
        return '<label class="field"><span>' + lab + '</span><input type="number" data-bgf="' + f.k + '"' +
          (f.min === undefined ? "" : ' min="' + f.min + '"') +
          (f.max === undefined ? "" : ' max="' + f.max + '"') +
          ' step="' + (f.step || 1) + '"></label>';
      }).join("");
    }
    show.forEach(function (f) {
      var el = host.querySelector('[data-bgf="' + f.k + '"]');
      if (!el) return;
      if (f.type === "check") el.checked = !!p[f.k];
      else setValue(el, p[f.k]);
      if (f.type === "color") {
        fillChips(host.querySelector('[data-bgsw="' + f.k + '"]'), schemeSwatches(), p[f.k], "bgc", f.k);
      }
      var out = host.querySelector('[data-bgv="' + f.k + '"]');
      if (out) out.textContent = fmt(p[f.k]);
    });
  }

  // everything that has not been pulled onto the stage yet
  function renderTray() {
    var items = [];
    items.push({ id: "rect", kind: "shape", name: "Solid" });   // as many as you like
    items.push({ id: "frame", kind: "shape", name: "Frame" });
    ROLES.forEach(function (r) {
      items.push({ id: "role:" + r, kind: "text", name: ROLE_NAMES[r] });   // as many as you like
    });
    var html = items.map(function (it) {
      return '<button type="button" class="chip" data-place="' + it.id + '" data-kind="' + it.kind +
        '" title="Drag onto the stage, or click to drop it in place">' + esc(it.name) + "</button>";
    }).join("");
    $("#tray-items").innerHTML = html || '<span class="tray-empty">Everything is on the stage.</span>';
    $("#tray-hint").textContent = "Drag one onto the stage — it snaps to the grid as it lands; " +
      "let go outside the format to leave it here. Pull one out as often as you like. " +
      "The ✕ on a block or a solid takes it off again.";
  }

  function renderReadout() {
    var m = margins(), parts = [
      "Format " + fmt(state.stage.w) + " × " + fmt(state.stage.h),
      "Margins " + fmt(m.top) + " / " + fmt(m.right) + " / " + fmt(m.bottom) + " / " + fmt(m.left) +
        (state.margin.mode !== "manual" ? " (logo " + (state.margin.mode === "logoH" ? "height" : "width") +
          " × " + state.margin.factor + ")" : "")
    ];
    if (state.solids.length) {
      var b = box("rect");
      var frames = state.solids.filter(function (x) { return x.content !== "fill"; }).length;
      var boxes = state.solids.length - frames;
      parts.push((state.solids.length > 1
        ? [boxes ? boxes + (boxes === 1 ? " solid" : " solids") : "",
           frames ? frames + (frames === 1 ? " frame" : " frames") : ""].filter(Boolean).join(" · ") + " · "
        : "") +
        (state.rect.content === "fill" ? "Solid " : "Frame ") + fmt(b.w) + " × " + fmt(b.h) +
        " at " + fmt(b.x) + " / " + fmt(b.y));
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

  /* ------------------------------------------------------- design tokens */

  /* The design as a W3C / DTCG token file. The format holds values, not rules —
     there is no arithmetic in it and no notion of a format — so the export says
     the same thing three ways: the relationships in rem off the paragraph size
     (which is what the scale already is), the anchor resolved per format in px,
     and the rules themselves under $extensions, where the spec puts what it does
     not model. A tool that only reads $value gets a working system; bos reading
     its own extensions gets the design back. */
  var TOKEN_NS = "com.cluster4000.bos";
  var TOKEN_SLUG = function (v) {
    return String(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";
  };

  function tokenAnchor() { return Math.max(0.0001, paraPx()); }
  // every length is a share of the paragraph size, so one number per format resolves them all
  function remOf(px, anchor) { return round(px / (anchor || tokenAnchor()), 4) + "rem"; }
  function pxOf(v) { return round(v, 2) + "px"; }
  function tok(value, note) {
    var t = { $value: value };
    if (note) t.$description = note;
    return t;
  }

  // the formats the work runs in — or the one on the stage, when none were added
  function tokenFormats() {
    if (state.pages.length) {
      return state.pages.map(function (pg, i) { return { i: i, name: pg.name, w: pg.w, h: pg.h, master: !!pg.master, links: pg.links }; });
    }
    var f = formatById(state.stage.preset);
    return [{ i: -1, name: f ? f.name : "Format " + fmt(state.stage.w) + " × " + fmt(state.stage.h),
      w: state.stage.w, h: state.stage.h, master: true, links: {} }];
  }

  function tokensJSON() {
    var anchor = tokenAnchor(), m = margins(), c = content(), ty = state.type;
    var sw = schemeSwatches(), out = {};

    out.$description = "Design tokens for this system, in the W3C Design Tokens (DTCG) format. " +
      "Lengths are held in rem off the paragraph size — 1rem is the anchor — so one number per " +
      "format resolves the whole system. The anchor is under format.<name>.anchor, and the rules " +
      "that produced these values are under $extensions." + " Exported by bos.";

    // ---- colour
    var colour = { $type: "color", scheme: {}, role: {} };
    sw.forEach(function (hex, i) { colour.scheme[i + 1] = tok(hex, i === 0 ? "The colour the scheme is worked out from" : null); });
    ROLES.forEach(function (r) { colour.role[TOKEN_SLUG(r)] = tok(ty.roles[r].color); });
    colour.page = tok(state.stage.bg, "The ground the system sits on");
    colour.guide = tok(guideColour(), "Margin guides and grids — read off the background");
    if (state.solids.length) {
      colour.solid = {};
      state.solids.forEach(function (r, i) { colour.solid[i + 1] = tok(r.fill); });
    }
    out.colour = colour;

    // ---- the scale: the multiples are the system, the sizes follow from the anchor
    var scale = { $type: "number" };
    ROLES.forEach(function (r) {
      scale[TOKEN_SLUG(r)] = tok(r === "paragraph" ? 1 : round(ty.roles[r].mult, 4),
        r === "paragraph" ? "The anchor of the scale" : "× the paragraph size");
    });
    out.scale = scale;

    // ---- typography, one composite per role
    var type = { $type: "typography" };
    ROLES.forEach(function (r) {
      var st = ty.roles[r], mult = r === "paragraph" ? 1 : st.mult;
      type[TOKEN_SLUG(r)] = tok({
        fontFamily: roleStack(r).split(",").map(function (x) { return x.trim().replace(/^"|"$/g, ""); }),
        fontSize: remOf(rolePx(r), anchor),
        fontWeight: st.weight,
        // tracking is in em of its own size, and its own size is mult × the anchor
        letterSpacing: round(st.ls * mult, 4) + "rem",
        lineHeight: round(roleLh(r), 4)
      }, st.transform !== "none" ? "Set in " + st.transform : null);
    });
    out.type = type;

    // ---- the space the system is built on
    var space = { $type: "dimension", margin: {} };
    SIDES.forEach(function (side) { space.margin[side] = tok(remOf(m[side], anchor)); });
    space.row = tok(remOf(baseline(), anchor), "Baseline grid 1 — one row");
    space["row-half"] = tok(remOf(baseline() / 2, anchor), "Baseline grid 2");
    space.column = tok(remOf(colWidth(), anchor), "One of " + colCount() + " columns");
    space.gutter = tok(remOf(state.cols.gutter, anchor));
    space["text-inset"] = tok(remOf(state.text.padding, anchor), "The side padding text runs in");
    out.space = space;

    var grid = { $type: "number", columns: tok(colCount()), rows: tok(gridRows(), "Rows of grid 1 between the margins") };
    if (state.solids.length) grid["solid-columns"] = tok(Math.max(1, Math.round(state.rect.columns.n)));
    out.grid = grid;

    if (state.solids.length) {
      var radius = { $type: "dimension" };
      CORNERS.forEach(function (n) { radius[TOKEN_SLUG(CORNER_LABELS[n])] = tok(remOf(cornerPx(n, "x"), anchor)); });
      out.radius = radius;
      out.size = { $type: "dimension",
        solid: { width: tok(remOf(sizeOf("rect").w, anchor)), height: tok(remOf(sizeOf("rect").h, anchor)) } };
    }

    /* ---- the formats, resolved. Everything above is relative; this is where the
       pixels are, one anchor per format, plus the margins for a format that keeps
       its own. Print has no viewport to work them out from. */
    var formats = {};
    tokenFormats().forEach(function (f) {
      var one = { $type: "dimension", width: tok(pxOf(f.w)), height: tok(pxOf(f.h)) };
      var paint = function (fn) { return f.i < 0 ? withFormat(f.w, f.h, fn) : withPage(f.i, fn); };
      paint(function () {
        one.anchor = tok(pxOf(paraPx()), "1rem on this format — " + paraRule());
        var mm = margins();
        one.margin = {};
        SIDES.forEach(function (side) { one.margin[side] = tok(pxOf(mm[side])); });
        one.row = tok(pxOf(baseline()));
      });
      one.$extensions = {};
      one.$extensions[TOKEN_NS] = { master: f.master, links: f.links || {} };
      formats[TOKEN_SLUG(f.name)] = one;
    });
    out.format = formats;

    // ---- and the rules, which the format does not model
    var ext = {
      version: 1,
      app: "bos",
      anchor: { basis: ty.basis, percent: paraByHand() ? null : ty.paragraph, px: paraByHand() ? ty.paragraph : null,
        rule: paraRule() },
      css: {
        root: ":root { " + tokenAnchorCSS(false) + " }",
        perBox: ".format { container-type: size; " + tokenAnchorCSS(true) + " }",
        note: "rem is root-relative, so the rem tokens resolve against the :root form — " +
          "one format per document. For several formats in one document the per-box form " +
          "hands descendants --u and every size is calc(var(--u) * <scale token>)."
      },
      baseline: { rows: ty.rows, from: ty.gridFrom, show: ty.grid },
      margin: clone(state.margin),
      columns: { format: clone(state.cols), solid: state.solids.map(function (r) { return clone(r.columns); }) },
      scheme: clone(state.scheme),
      solids: state.solids.map(function (r, i) {
        return { pos: clone(r.pos), anchor: clone(r.anchor), wmode: r.wmode, hmode: r.hmode,
          w: r.w, h: r.h, grid: r.grid, cols: r.cols, shape: r.shape, content: r.content,
          module: r.module, fill: r.fill, params: clone(r.params || {}) };
      }),
      blocks: state.text.blocks.map(function (b) {
        return { role: b.role, row: b.row, from: b.from, grid: b.grid, cols: b.cols,
          align: b.align, padL: b.padL, padR: b.padR, text: b.text };
      }),
      background: { on: state.bgGen.on, pattern: state.bgGen.pattern, gradient: state.bgGen.gradient,
        params: clone(state.bgGen.params) },
      logo: { visible: state.logo.visible, h: clone(state.logo.h), align: clone(state.logo.align),
        anchor: clone(state.logo.anchor), fill: state.logo.fill },
      families: { shared: ty.family, roles: ROLES.reduce(function (a, r) {
        if (ty.roles[r].family) a[r] = ty.roles[r].family;
        return a;
      }, {}) }
    };
    out.$extensions = {};
    out.$extensions[TOKEN_NS] = ext;
    return JSON.stringify(out, null, 2);
  }

  /* The anchor, computed rather than regenerated — measured in the browser, since
     two things about it are easy to get wrong. rem is root-relative, so an anchor
     on the format box does not move it: to work in rem the anchor goes on :root,
     which means one format per document. And a container cannot query itself, so
     the per-box form hands descendants a custom property instead of a font size.
     Both are emitted: the first for a page that is one format, the second for
     several formats on one page — a preview rail, a contact sheet. */
  function tokenAnchorCSS(perBox) {
    var basis = state.type.basis, v = round(state.type.paragraph, 4);
    if (basis === "px") {
      var px = round(v, 2) + "px";
      return perBox ? "--u: " + px : "font-size: " + px;
    }
    var unit = perBox
      ? (basis === "width" ? "cqw" : basis === "height" ? "cqh" : "cqmax")
      : (basis === "width" ? "vw" : basis === "height" ? "vh" : "vmax");
    var calc = "calc(" + v + " * 1" + unit + ")";
    return perBox ? "--u: " + calc : "font-size: " + calc;
  }

  function tokensCSS() {
    var anchor = tokenAnchor(), m = margins(), ty = state.type, sw = schemeSwatches();
    var lines = ["/* The design as custom properties, with the anchor computed rather than",
      "   written down — so the system holds in a format of any size.",
      "",
      "   One format per document: the anchor goes on the root, because rem is",
      "   root-relative, and every size below is in rem. */",
      ":root { " + tokenAnchorCSS(false) + " }   /* 1rem — " + paraRule() + " */",
      "",
      "/* Several formats in one document — a preview rail, a contact sheet — cannot",
      "   share a root anchor, and a container cannot query itself: the box hands its",
      "   descendants --u instead, and each size is calc(var(--u) * its scale). */",
      ".format { container-type: size; " + tokenAnchorCSS(true) + " }",
      "",
      ".format {"];
    sw.forEach(function (hex, i) { lines.push("  --colour-" + (i + 1) + ": " + hex + ";"); });
    lines.push("  --colour-page: " + state.stage.bg + ";");
    ROLES.forEach(function (r) { lines.push("  --colour-" + TOKEN_SLUG(r) + ": " + ty.roles[r].color + ";"); });
    SIDES.forEach(function (side) { lines.push("  --margin-" + side + ": " + remOf(m[side], anchor) + ";"); });
    lines.push("  --row: " + remOf(baseline(), anchor) + ";");
    lines.push("  --row-half: " + remOf(baseline() / 2, anchor) + ";");
    lines.push("  --column: " + remOf(colWidth(), anchor) + ";");
    lines.push("  --gutter: " + remOf(state.cols.gutter, anchor) + ";");
    ROLES.forEach(function (r) {
      var mult = r === "paragraph" ? 1 : round(ty.roles[r].mult, 4);
      // in rem under a root anchor, or off --u where the box is the anchor
      lines.push("  --size-" + TOKEN_SLUG(r) + ": " + remOf(rolePx(r), anchor) +
        ";   /* or calc(var(--u) * " + mult + ") */");
    });
    lines.push("}");
    lines.push("");
    ROLES.forEach(function (r) {
      var st = ty.roles[r], mult = r === "paragraph" ? 1 : st.mult;
      lines.push("." + TOKEN_SLUG(r) + " {");
      lines.push("  font-family: " + roleStack(r) + ";");
      lines.push("  font-size: var(--size-" + TOKEN_SLUG(r) + ");");
      lines.push("  font-weight: " + st.weight + ";");
      lines.push("  line-height: " + round(roleLh(r), 4) + ";");
      lines.push("  letter-spacing: " + round(st.ls, 3) + "em;");
      if (st.transform !== "none") lines.push("  text-transform: " + st.transform + ";");
      lines.push("  color: var(--colour-" + TOKEN_SLUG(r) + ");");
      lines.push("}");
    });
    return lines.join("\n");
  }

  /* ------------------------------------------------------------ CSS output */

  function positionCSS(name, indent) {
    var el = state[name], b = box(name), m = margins(), out = [], tx = null, ty = null;
    var full = name === "rect" && state.rect.wmode === "full";

    // the solid lands on the baseline grid and on a column line, so its edges are
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
    var bgs = bgSrc();
    if (bgs) {
      lines.push("  background-image: url(\"" + (/^data:/.test(bgs)
        ? (state.bgGen.on ? "…" + bgModule(state.bgGen.on, state.bgGen[state.bgGen.on]).name.toLowerCase() +
            " " + state.bgGen.on + ", as SVG…" : "…generated image…")
        : bgs) + "\");");
      var bl = bgLayout(state.stage.w, state.stage.h);
      lines.push("  background-size: " + round(bl.w, 2) + "px " + round(bl.h, 2) + "px;");
      lines.push("  background-position: " + round(bl.x, 2) + "px " + round(bl.y, 2) + "px;");
      if (bg.fit !== "tile") lines.push("  background-repeat: no-repeat;");
    }
    lines.push("  overflow: hidden;");
    lines.push("  /* margins " + fmt(m.top) + " " + fmt(m.right) + " " + fmt(m.bottom) + " " + fmt(m.left) +
      (state.margin.mode !== "manual"
        ? " — logo " + (state.margin.mode === "logoH" ? "height" : "width") + " × " + state.margin.factor
        : "") + " */");
    lines.push("}");
    // every solid, in the order they were put down
    state.solids.forEach(function (sd, si) { withSolid(si, function () {
      lines.push("");
      lines.push("." + (sd.content === "fill" ? "solid" : "frame") +
        (state.solids.length > 1 ? "-" + (si + 1) : "") + " {");
      lines.push("  position: absolute;");
      lines.push(positionCSS("rect", "  "));
      if (state.rect.shape === "radius") {
        lines.push("  border-radius: " + radiusCSS(1) + ";");
      } else {
        lines.push("  clip-path: " + clipCSS(1) + ";");
        lines.push("  /* " + shapeDef().name + ", cut at this size — the points are in px */");
      }
      lines.push("  background-color: " + state.rect.fill + ";");
      if (sd.content !== "fill") {                 // a frame: what fills it, and where
        var pb = box("rect"), ppl = picLayout(sd, pb.w, pb.h);
        lines.push("  background-image: url(\"" + (sd.content === "image"
          ? (/^data:/.test(sd.src) ? "…uploaded image…" : sd.src)
          : "…" + bgModule(sd.content, sd.module).name.toLowerCase() + " " + sd.content + ", as SVG…") + "\");");
        lines.push("  background-size: " + round(ppl.w, 2) + "px " + round(ppl.h, 2) + "px;");
        lines.push("  background-position: " + round(ppl.x, 2) + "px " + round(ppl.y, 2) + "px;");
        lines.push("  background-repeat: " + (sd.fit === "tile" ? "repeat" : "no-repeat") + ";");
      }
      lines.push("}");
    }); });
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
      familiesInUse().forEach(function (id) {
        if (id.indexOf("g:") === 0) {
          lines.push("@import url(\"https://fonts.googleapis.com/css2?family=" +
            id.slice(2).replace(/ /g, "+") + ":ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,400&display=swap\");");
        } else if (id.indexOf("u:") === 0) {
          lines.push("/* @font-face for \"" + id.slice(2) + "\" — ship the uploaded file yourself */");
        }
      });
      var TX = ".stage .text";
      lines.push(TX + " {");
      lines.push("  position: absolute;");
      // the text runs in the margin box, whichever solid a block belongs to; the
      // insets below carry it in to the solid it is in
      lines.push("  inset: " + SIDES.map(function (side) { return fmt(m[side]); }).join("px ") + "px;");
      lines.push("  font-family: " + familyStack() + ";");
      lines.push("}");
      lines.push("");
      lines.push(TX + " > * { position: absolute; left: 0; right: 0; margin: 0; white-space: pre-wrap; }");
      var origin = content().y;
      used.forEach(function (b, i) {
        var sp = blockInsets(b);
        lines.push(TX + " > :nth-child(" + (i + 1) + ") { top: " +
          round(rowY(b) - baselineInBox(b.role) - origin, 2) + "px;" +
          (round(sp.l, 2) ? " margin-left: " + round(sp.l, 2) + "px;" : "") +
          (round(sp.r, 2) ? " margin-right: " + round(sp.r, 2) + "px;" : "") + " }" +
          (blockCols(b) === "box" ? "" :
            "  /* on the " + (blockCols(b) === "rect" ? "box's own" : "format") + " columns */") +
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
            ? "  /* " + esc(paraRule()) + " */"
            : "  /* " + round(st.mult, 3) + " × paragraph */"));
        lines.push("  line-height: " + round(lh, 4) + ";" +
          (r === "paragraph"
            ? "  /* one row of grid 1 = " + round(size * lh, 3) + "px */"
            : steps ? "  /* " + round(size * lh, 2) + "px = " + steps + " × grid " +
              (st.snap === "half" ? "2" : "1") + " */" : ""));
        if (st.family) lines.push("  font-family: " + roleStack(r) + ";");
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
    return paraByHand() ? "set by hand" : (b || BASES[0]).name + " (" + fmt(typeBasis()) + "px)";
  }

  // how the paragraph size is arrived at, in words
  function paraRule() {
    return paraByHand()
      ? fmt(round(state.type.paragraph, 2)) + " px, set by hand"
      : round(state.type.paragraph, 3) + "% of " + basisLabel();
  }

  function renderMarkup(used) {
    var out = ['<div class="stage">'];
    var inner = [], pad = "  ";
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
    if (state.solids.length) {
      state.solids.forEach(function (sd, i) {
        inner.push('  <div class="' + (sd.content === "fill" ? "solid" : "frame") +
          (state.solids.length > 1 ? "-" + (i + 1) : "") + '"></div>');
      });
      inner = inner.concat(text);
    } else {
      inner = inner.concat(text);       // text on its own runs in the margin box
    }
    if (state.logo.visible) inner.push('  <div class="logo"></div>');
    $("#markup-out").textContent = out.concat(inner, ["</div>"]).join("\n");
    renderTokens();
  }

  function renderTokens() {
    var json = tokensJSON();
    $("#tokens-out").textContent = json;
    $("#tokens-css").textContent = tokensCSS();
    var fs = tokenFormats();
    $("#tokens-hint").textContent = "W3C / DTCG format · " + fmt(json.length / 1024) + " kB · " +
      fs.length + (fs.length === 1 ? " format" : " formats") + " · 1rem = " +
      round(tokenAnchor(), 2) + " px on this one.";
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
      pairNumbers();          // anything built in this pass gets its slider
      syncSliders();
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
    useSolid(state.solid);                  // the alias does not survive the round trip
    lastSnap = json;
    buildFamilySelect();
    inspectorFor = -1;
    blOffset = {};
    frameFor = null;
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
    // the same list again, for a role that runs in a family of its own
    $("#type-role-family").innerHTML = '<option value="">Same as the design</option>' + html;
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
          : '<input type="number" min="0.01" max="12" step="0.01" data-mult="' + r + '">') +
        '<span class="px" data-px="' + r + '"></span></div>';
    }).join("");
  }

  /* Everything a block can be set to, set at the block itself: the inspector
     opens beside the one that is selected and follows it about, so nothing
     about a text block is edited from the far side of the window. */
  var inspectorFor = -1, sharedOpen = false;
  var insClosed = false;      // shut by its ✕; picking a block opens it again
  var insPos = null;          // where the user parked it, in canvas-body pixels
  var solClosed = false, solPos = null;      // the same, for the solid's panel

  function buildInspector() {
    $("#ins-body").innerHTML =
      '<select data-block="role" class="ins-role" title="Which role in the type scale this block is">' +
        ROLES.map(function (r) {
          return '<option value="' + r + '">' + esc(ROLE_NAMES[r]) + "</option>";
        }).join("") +
      "</select>" +
      '<textarea data-block="text" rows="2" spellcheck="false" ' +
        'placeholder="Type here, or on the block itself"></textarea>' +
      '<div class="block-row blind">' +
        "<span>Blind</span>" +
        '<input type="range" min="1" max="120" step="1" data-block="blind" value="12" ' +
          'title="How much blind text to fill this block with">' +
        '<button type="button" class="ghost" data-block="fill">Fill</button>' +
        '<span class="px" data-blindn></span>' +
      "</div>" +
      '<div class="block-row field">' +
        "<span>Field</span>" +
        '<input type="number" min="0" step="1" data-block="padL" title="Inset from the left">' +
        '<input type="number" min="0" step="1" data-block="padR" title="Inset from the right">' +
        '<span class="px" data-fieldw></span>' +
      "</div>" +
      '<div class="block-row rowset">' +
        "<span>Row</span>" +
        '<input type="number" step="1" data-block="row">' +
        '<select data-block="grid"><option value="1">Grid 1</option>' +
          '<option value="2">Grid 2</option><option value="both">Both grids</option></select>' +
        '<select data-block="from" title="Which margin the rows are counted from">' +
          '<option value="top">from top</option>' +
          '<option value="bottom">from bottom</option></select>' +
      "</div>" +
      '<div class="block-row cols">' +
        "<span>Cols</span>" +
        '<select data-block="cols" title="Which column grid this block lines up on">' +
          '<option value="auto">follow the box</option>' +
          '<option value="format">the format columns</option>' +
          '<option value="rect">the box\'s own columns</option>' +
        "</select>" +
      "</div>" +
      '<div class="seg" data-block="align">' +
        ["left", "center", "right"].map(function (a) {
          return '<button type="button" data-align="' + a + '">' + a[0].toUpperCase() + a.slice(1) + "</button>";
        }).join("") +
      "</div>" +
      '<p class="hint" id="text-rows-hint"></p>' +
      '<details class="sub" id="ins-shared"' + (sharedOpen ? " open" : "") + "><summary><h3>Every block</h3></summary>" +
        '<label class="field grow"><span>Side padding \u2014 the column the blocks run in</span>' +
          '<input type="number" id="text-padding" min="0" max="400" step="1"></label>' +
        '<label class="check"><input type="checkbox" id="text-margin-pad">' +
          "<span>Hang side-aligned text on the format margins when the box fills the format</span></label>" +
        '<p class="hint" id="text-pad-hint"></p>' +
      "</details>";
  }

  function renderBlockInspector() {
    var i = state.selBlock, b = state.text.blocks[i];
    var el = b && els.stage.querySelector('.tb[data-i="' + i + '"]');
    var ins = $("#block-inspector");
    // selection UI goes with the guides, and the inspector is selection UI
    if (!el || state.showGuides === false || insClosed) { ins.hidden = true; return; }

    ins.hidden = false;
    if (inspectorFor !== i) { buildInspector(); inspectorFor = i; }
    $("#ins-title").textContent = "Block " + (i + 1) + " \u2014 " + ROLE_NAMES[b.role];

    var body = $("#ins-body");
    body.querySelector('[data-block="role"]').value = b.role;
    setValue(body.querySelector('[data-block="text"]'), b.text);
    setValue(body.querySelector('[data-block="row"]'), b.row);
    body.querySelector('[data-block="grid"]').value = String(b.grid);
    body.querySelector('[data-block="from"]').value = b.from === "bottom" ? "bottom" : "top";
    body.querySelector('[data-block="cols"]').value = b.cols || "auto";
    setValue(body.querySelector('[data-block="blind"]'), b.blind || 12);
    body.querySelector("[data-blindn]").textContent = (b.blind || 12) + " words";
    setValue(body.querySelector('[data-block="padL"]'), fmt(b.padL || 0));
    setValue(body.querySelector('[data-block="padR"]'), fmt(b.padR || 0));
    // the row runs the height of the grid it is counted in; the insets, the width it runs in
    var frame = blockFrame(b), rows = Math.max(1, Math.round(content().h / blockUnit(b)));
    bound(body.querySelector('[data-block="row"]'), 0, rows);
    bound(body.querySelector('[data-block="padL"]'), 0, Math.round(frame.w));
    bound(body.querySelector('[data-block="padR"]'), 0, Math.round(frame.w));
    var fw = frame.w - state.text.padding * 2 - (b.padL || 0) - (b.padR || 0);
    body.querySelector("[data-fieldw]").textContent = fmt(Math.max(0, fw)) + " wide";
    Array.prototype.forEach.call(body.querySelectorAll("[data-align]"), function (btn) {
      btn.setAttribute("aria-pressed", btn.dataset.align === b.align ? "true" : "false");
    });
    syncTextShared();
    positionInspector(ins, el, insPos);
  }

  /* The solid's settings, beside the solid: the same panel markup the left rail
     used to hold, moved onto the canvas so a box is set where it is. */
  function renderSolidInspector() {
    var ins = $("#solid-inspector");
    var el = state.solids.length && els.stage.querySelector('.shape.rect[data-i="' + state.solid + '"]');
    // one selection, one panel: a picked text block shows its own instead
    var show = el && state.sel === "rect" && state.selBlock < 0 &&
      state.showGuides !== false && !solClosed;
    ins.hidden = !show;
    if (!show) return;
    var r = state.rect;
    $("#sol-title").textContent = (r.content === "fill" ? "Solid " : "Frame ") + (state.solid + 1) +
      (state.solids.length > 1 ? " of " + state.solids.length : "");
    positionInspector(ins, el, solPos);

  }

  // the two settings every block shares, kept with the blocks rather than in the panel
  function syncTextShared() {
    var pad = $("#text-padding");
    if (!pad) return;
    setValue(pad, fmt(state.text.padding));
    $("#text-margin-pad").checked = !!state.text.marginPad;
    var mm = margins(), spL = sidePad("left");
    $("#text-pad-hint").textContent = !state.text.marginPad
      ? "Every block runs in a column " + fmt(state.text.padding) + " from both sides of the box."
      : state.rect.wmode !== "format"
        ? "It applies once the width is set to fill the format \u2014 the box is then wider than " +
          "the margins, and side-aligned text would otherwise start inside them."
        : "Left-aligned text starts on the left margin (" + fmt(mm.left) + ", " +
          (spL.l >= 0 ? fmt(spL.l) + " past" : fmt(-spL.l) + " short of") + " the padding); " +
          "right-aligned text ends on the right margin (" + fmt(mm.right) + "). " +
          "Centred text keeps the padding.";
    $("#text-rows-hint").textContent = "Rows run from the top or the bottom margin: grid 1 is the " +
      "full rows (" + round(baseline(), 2) + " px), grid 2 the half lines between them. " +
      "Following the box means the box padding while the block is inside the solid and the " +
      "format columns anywhere else; the other two hold whichever grid you name.";
  }

  function repositionInspector() {
    var ins = $("#block-inspector");
    var el = els.stage.querySelector('.tb[data-i="' + state.selBlock + '"]');
    if (!ins.hidden && el) positionInspector(ins, el, insPos);
    var sol = $("#solid-inspector");
    var sel = els.stage.querySelector('.shape.rect[data-i="' + state.solid + '"]');
    if (!sol.hidden && sel) positionInspector(sol, sel, solPos);
  }

  // where the user parked it, held inside the canvas whatever the window does
  function parkInspector(ins, pos) {
    var host = ins.parentNode.getBoundingClientRect();
    var w = ins.offsetWidth, h = ins.offsetHeight;
    ins.style.left = clamp(pos.x, 8, Math.max(8, host.width - w - 8)) + "px";
    ins.style.top = clamp(pos.y, 8, Math.max(8, host.height - h - 8)) + "px";
  }

  // drag it about by its head, and it stays where it is put
  function startInspectorDrag(e, ins, put) {
    var x0 = ins.offsetLeft, y0 = ins.offsetTop, sx = e.clientX, sy = e.clientY;
    document.body.classList.add("moving-ins");
    function move(ev) {
      var pos = { x: x0 + ev.clientX - sx, y: y0 + ev.clientY - sy };
      put(pos);
      parkInspector(ins, pos);
    }
    function up() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.body.classList.remove("moving-ins");
    }
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    e.preventDefault();
  }

  // beside the block, on whichever side has the room, and never off the canvas
  function positionInspector(ins, el, pos) {
    if (pos) return parkInspector(ins, pos);
    var r = el.getBoundingClientRect();
    var host = ins.parentNode.getBoundingClientRect();
    var vp = els.viewport.getBoundingClientRect();
    var w = ins.offsetWidth, h = ins.offsetHeight, gap = 14;
    var st = els.stage.getBoundingClientRect();
    var lo = vp.left - host.left + 8, hi = vp.right - host.left - w - 8;
    /* Outside the format when the canvas has the room for it there, so the
       design is not covered; otherwise beside the block, on its roomier side. */
    var left;
    if (vp.right - st.right >= w + gap * 2) left = st.right - host.left + gap;
    else if (st.left - vp.left >= w + gap * 2) left = st.left - host.left - w - gap;
    else left = vp.right - r.right >= r.left - vp.left
      ? r.right - host.left + gap
      : r.left - host.left - w - gap;
    ins.style.left = clamp(left, lo, Math.max(lo, hi)) + "px";
    ins.style.top = clamp(r.top - host.top - 10, 8,
      Math.max(8, vp.bottom - host.top - h - 8)) + "px";
  }

  function buildGrid(id, name, kind) {
    $(id).innerHTML = V_KEYS.map(function (v) {
      return H_KEYS.map(function (h) {
        return '<button type="button" data-el="' + name + '" data-kind="' + kind + '" data-h="' + h + '" data-v="' + v +
          '" title="' + v + " " + h + '" aria-label="' + v + " " + h + '"></button>';
      }).join("");
    }).join("");
  }

  // the bounds a field's slider sweeps, where they depend on the design
  function bound(sel, lo, hi) {
    var el = typeof sel === "string" ? $(sel) : sel;
    if (!el) return;
    if (String(el.min) !== String(lo)) el.min = lo;
    if (String(el.max) !== String(hi)) el.max = hi;
  }

  function setValue(el, value) {
    if (el && document.activeElement !== el && el.value !== String(value)) el.value = value;
  }

  /* Every number in the app is set two ways: a slider to sweep it and a field to
     type it in, with the arrow keys stepping the field. Rather than writing the
     pair out forty times, each number field is given its slider here — the ones
     built while the app runs included — and the slider works by writing the field
     and telling it, so whatever the field was already bound to needs to know
     nothing about it. */
  function pairNumbers(root) {
    var found = (root || document).querySelectorAll("input[type=number]:not([data-slider])");
    Array.prototype.forEach.call(found, function (el) {
      el.dataset.slider = "1";
      var wrap = document.createElement("span");
      wrap.className = "numf";
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      var sl = document.createElement("input");
      sl.type = "range";
      sl.tabIndex = -1;                       // the field is the keyboard control
      sl.setAttribute("aria-hidden", "true");
      wrap.appendChild(sl);
      sl.addEventListener("input", function () {
        if (el.disabled) { syncSliders(wrap); return; }
        el.value = sl.value;
        // whatever the field is bound to hears it as if it had been typed
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  /* The bounds a slider sweeps: the field's own, unless the field takes more than
     is worth sweeping — then data-slmin / data-slmax say how far the slider goes
     and the field stays as open as it was. Something sane if it has neither. */
  function numBounds(el) {
    var lo = num(el.dataset.slmin, num(el.min, null));
    var hi = num(el.dataset.slmax, num(el.max, null));
    var v = num(el.value, 0);
    if (lo === null) lo = Math.min(0, v);
    if (hi === null) hi = Math.max(100, Math.abs(v) * 2);
    return lo < hi ? [lo, hi] : [lo, lo + 1];
  }

  // the slider follows its field: same bounds, same step, same value
  function syncSliders(root) {
    var pairs = (root || document).querySelectorAll(".numf");
    Array.prototype.forEach.call(pairs, function (w) {
      var el = w.querySelector("input[type=number]"), sl = w.querySelector("input[type=range]");
      if (!el || !sl) return;
      var b = numBounds(el), step = num(el.step, 1) || 1;
      if (String(sl.min) !== String(b[0])) sl.min = b[0];
      if (String(sl.max) !== String(b[1])) sl.max = b[1];
      if (String(sl.step) !== String(step)) sl.step = step;
      sl.disabled = el.disabled;
      // not while it is being dragged: the value it is sending is the truth then
      if (document.activeElement !== sl) sl.value = clamp(num(el.value, b[0]), b[0], b[1]);
    });
  }

  /* The colour scheme, offered wherever a colour is set: one click puts a scheme
     colour in the field. Rebuilt only when the scheme or the choice changes. */
  function fillChips(host, sw, cur, attr, k) {
    if (!host) return;
    var now = sw.join(",") + "|" + String(cur || "").toLowerCase();
    if (host.dataset.sig === now) return;
    host.dataset.sig = now;
    host.innerHTML = sw.map(function (hex) {
      return '<button type="button" class="sw-chip-btn' +
        (hex.toLowerCase() === String(cur).toLowerCase() ? " on" : "") +
        '" style="background:' + hex + '" data-' + attr + '="' + k + '" data-hex="' + hex +
        '" title="' + hex.toUpperCase() + ' \u2014 from the colour scheme"></button>';
    }).join("");
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
    setValue($("#bg-scale"), state.bg.scale);
    $("#bg-scale-val").textContent = fmt(state.bg.scale) + "%";
    setValue($("#bg-x"), fmt(state.bg.x));
    setValue($("#bg-y"), fmt(state.bg.y));
    bound("#bg-x", -st.w, st.w); bound("#bg-y", -st.h, st.h);
    var bl = bgLayout(state.stage.w, state.stage.h);
    $("#bg-hint").textContent = state.bgGen.on
      ? "The background is being made: the " +
        bgModule(state.bgGen.on, state.bgGen[state.bgGen.on]).name.toLowerCase() + " " +
        state.bgGen.on + ", from the Generate background stage. Fit, opacity, scale and position " +
        "below still apply to it; remove it there to go back to an image of your own."
      : state.bg.src
      ? "The image runs " + round(bl.w, 1) + " × " + round(bl.h, 1) + " at " +
        round(bl.x, 1) + " / " + round(bl.y, 1) + " on a " + fmt(state.stage.w) + " × " +
        fmt(state.stage.h) + " format. Hold ⌥/Alt and drag on the canvas to move it."
      : "Upload or generate an image, then scale and move it here — or hold ⌥/Alt and drag it on the canvas.";

    setValue($("#cf-endpoint"), state.comfy.endpoint);
    setValue($("#cf-key"), comfyKey);
    setValue($("#cf-workflow"), state.comfy.workflow);
    setValue($("#cf-prompt"), state.comfy.prompt);
    aiEach('[data-ai="endpoint"]', function (el) { setValue(el, state.ai.endpoint); });
    aiEach('[data-ai="model"]', function (el) {
      el.value = state.ai.model;
      if (el.selectedIndex < 0) el.selectedIndex = 0;
    });
    aiEach("[data-ai-brief]", function (el) { setValue(el, state.ai.briefs[el.dataset.aiBrief] || ""); });
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
      bound("#margin-" + s, 0, Math.round((s === "top" || s === "bottom" ? st.h : st.w) / 2));
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
      ? "The margins define the box the shapes are placed inside."
      : "Every side starts from " + m.factor + " × the logo " +
        (m.mode === "logoH" ? "height" : "width") + " = " + round(marginBase(), 2) +
        ", and each field above adds its own buffer to that: " +
        SIDES.map(function (s) { return fmt(mm[s]); }).join(" / ") +
        " top, right, bottom, left. Dragging a guide moves that side's buffer.";

    $("#rect-visible").checked = r.visible;
    $("#rect-placed-hint").textContent = "Text inside the box takes its padding; text is pinned " +
      "to its own row on the page and stays there whatever the box does. The ✕ above takes this " +
      "box off the stage; the tray puts another one on.";
    syncGrid("#rect-anchor", r);
    var at = solidAt(), fixedW = r.wmode === "fixed" || r.wmode === "fit";
    var rb = box("rect"), stg = state.stage;
    bound("#rect-x", -Math.round(rb.w), Math.round(stg.w + rb.w));
    bound("#rect-y", -Math.round(rb.h), Math.round(stg.h + rb.h));
    setValue($("#rect-x"), fmt(at.x));
    setValue($("#rect-y"), fmt(at.y));
    $("#rect-x").disabled = !fixedW;
    $("#rect-y").disabled = r.hmode !== "fixed";
    $("#rect-pos-hint").textContent = fixedW && r.hmode === "fixed"
      ? "Measured from the top left corner of the format to the anchor point of the box. " +
        "Drag the box to put it anywhere; the arrow keys step it by a column and a row."
      : "A box that fills the " + (!fixedW && r.hmode !== "fixed" ? "format" :
          !fixedW ? "width" : "height") + " is placed by that, not by hand.";
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
    bound("#rect-w", 1, Math.round(state.stage.w * 1.5));
    bound("#rect-h", 1, Math.round(state.stage.h * 1.5));
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
            : "Width " + round(rw, 2) + ". ") +
      ((textWOf[state.solid] || 0) > 0
        ? "Text in it wraps at " + round(rw - state.text.padding, 2) + " — the box less the side " +
          "padding. Fitting the text would make it " + round(floor, 2) + " wide, the longest line " +
          "unwrapped (" + round(textWOf[state.solid], 2) + ") plus the padding on both sides."
        : "");
    setValue($("#rect-h"), fmt(r.h));
    $("#rect-fill").value = r.fill;
    syncPic(r);

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
    var csz = sizeOf("rect");
    CORNERS.forEach(function (n) {
      var c = r.corners[n];
      setValue($('[data-radius="' + n + '"][data-axis="x"]'), fmt(c.x));
      setValue($('[data-radius="' + n + '"][data-axis="y"]'), fmt(c.y));
      bound($('[data-radius="' + n + '"][data-axis="x"]'), 0, c.ux === "%" ? 100 : Math.round(csz.w / 2));
      bound($('[data-radius="' + n + '"][data-axis="y"]'), 0, c.uy === "%" ? 100 : Math.round(csz.h / 2));
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
    bound("#logo-h", 0, lg.h.u === "%" ? 100 : Math.round(Math.max(st.w, st.h)));
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

    var byHand = paraByHand();
    var pv = round(ty.paragraph, byHand ? 2 : 3);
    setValue($("#type-para"), pv);
    $("#type-para").min = byHand ? PARAPX_MIN : PARA_MIN;
    // by hand the field takes any size; its slider sweeps the part worth sweeping
    $("#type-para").max = byHand ? PARAPX_MAX : PARA_MAX;
    $("#type-para").dataset.slmax = byHand ? PARAPX_SLIDER : PARA_MAX;
    $("#type-para").step = byHand ? 1 : 0.01;
    $("#type-basis").value = ty.basis;
    $("#type-para-px").textContent = (paraByHand() ? "" : round(ty.paragraph, 3) + "% = ") +
      Math.round(paraPx()) + " px";
    $("#type-system").value = ty.system;
    ROLES.forEach(function (r) {
      var input = $('[data-mult="' + r + '"]');
      if (input) setValue(input, round(ty.roles[r].mult, 3));
      $('[data-px="' + r + '"]').textContent = Math.round(rolePx(r)) + " px";
    });
    $("#type-scale-hint").textContent = "Paragraph is " + paraRule() +
      (byHand ? "" : " = " + Math.round(paraPx()) + " px") +
      ". Every other role is a multiple of it — pick a ratio above or type any multiple. " +
      (byHand
        ? "Set by hand it is the same in every format; a share of a side scales with the format."
        : "It runs from " + PARA_MIN + "% to " + PARA_MAX + "% of that side.");

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
    $("#type-role-family").value = st2.family || "";
    if ($("#type-role-family").selectedIndex < 0) $("#type-role-family").selectedIndex = 0;
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

    var rc = state.rect.columns, rg = colGrid("rect");
    setValue($("#rcol-n"), rc.n);
    setValue($("#rcol-gutter"), fmt(rc.gutter));
    var rsz = sizeOf("rect");
    SIDES.forEach(function (side) {
      setValue($("#rcol-" + side), fmt(rc.m[side] || 0));
      bound("#rcol-" + side, 0, Math.round((side === "top" || side === "bottom" ? rsz.h : rsz.w) / 2));
    });
    $("#rcol-show").checked = !!rc.show;
    var inset = SIDES.some(function (side) { return rc.m[side]; });
    $("#rcol-hint").textContent = state.solids.length
      ? Math.max(1, Math.round(rc.n)) + " columns of " + round(gridColW(rg), 2) + " px with a " +
        fmt(rc.gutter) + " px gutter across the " + round(rg.w, 2) + " px" +
        (inset ? " left inside the " + round(box("rect").w, 2) + " px box by its margins" : " of the box") +
        ". A text block set to the box's columns lines up on these instead of the format's."
      : "The box has a column grid of its own, with margins of its own inside it. Drag the " +
        "solid onto the stage and it is drawn here; a text block can line up on it instead " +
        "of the format's columns.";

    setValue($("#col-n"), state.cols.n);
    setValue($("#col-gutter"), fmt(state.cols.gutter));
    $("#col-show").checked = state.cols.show;
    $("#col-hint").textContent = state.cols.n + " columns of " + round(colWidth(), 2) +
      " px with a " + fmt(state.cols.gutter) + " px gutter fill the " + round(content().w, 2) +
      " px between the left and right margins.";
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
    onInput("#bg-scale", function (el) { state.bg.scale = clamp(num(el.value, 100), 10, 500); });
    numInput("#bg-x", function (v) { state.bg.x = snap(v); });
    numInput("#bg-y", function (v) { state.bg.y = snap(v); });
    $("#bg-reset").addEventListener("click", function () {
      state.bg.scale = 100; state.bg.x = 0; state.bg.y = 0;
      render();
    });
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

    onChange("#rect-visible", function (el) { state.rect.visible = el.checked; if (el.checked) state.sel = "rect"; });

    onChange("#pic-content", function (el) { state.rect.content = el.value; state.sel = "rect"; });
    onInput("#pic-url", function (el) { state.rect.src = el.value.trim(); });
    $("#pic-clear").addEventListener("click", function () { state.rect.src = ""; render(); });
    $("#pic-upload-btn").addEventListener("click", function () { $("#pic-file").click(); });
    $("#pic-file").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { state.rect.src = String(fr.result); render(); };
      fr.readAsDataURL(f);
      e.target.value = "";
    });
    onChange("#pic-fit", function (el) { state.rect.fit = el.value; });
    onInput("#pic-scale", function (el) { state.rect.scale = clamp(num(el.value, 100), 10, 500); });
    numInput("#pic-x", function (v) { state.rect.x = snap(v); });
    numInput("#pic-y", function (v) { state.rect.y = snap(v); });
    $("#pic-reset").addEventListener("click", function () {
      state.rect.scale = 100; state.rect.x = 0; state.rect.y = 0;
      render();
    });
    $("#pic-mods").addEventListener("click", function (e) {
      var t = e.target.closest("[data-picmod]");
      if (!t) return;
      state.rect.module = t.dataset.picmod;
      render();
    });
    function picField(e) {
      var el = e.target.closest("[data-picf]");
      if (!el) return;
      var r = state.rect, m = bgModule(r.content, r.module);
      var f = m.fields.filter(function (x) { return x.k === el.dataset.picf; })[0];
      if (!f) return;
      if (el.value === "" && f.type !== "check") return;
      picSetParam(r, f.k, f.type === "check" ? el.checked
        : f.type === "color" || f.type === "select" ? el.value
        : num(el.value, m.defaults[f.k]));
      render();
    }
    $("#pic-fields").addEventListener("input", picField);
    $("#pic-fields").addEventListener("change", picField);
    $("#pic-fields").addEventListener("click", function (e) {
      var t = e.target.closest("[data-picc]");
      if (!t) return;
      picSetParam(state.rect, t.dataset.picc, t.dataset.hex);
      render();
    });
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

    onInput("#rect-x", function (el) { putSolidAt(num(el.value, solidAt().x), solidAt().y); });
    onInput("#rect-y", function (el) { putSolidAt(solidAt().x, num(el.value, solidAt().y)); });

    ["#rect-anchor", "#logo-align", "#logo-anchor"].forEach(function (id) {
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
    copier("#copy-tokens", "#tokens-out", "Copy tokens");
    copier("#copy-tokens-css", "#tokens-css", "Copy token CSS");
    $("#save-tokens").addEventListener("click", function () {
      var blob = new Blob([tokensJSON()], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tokens.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    });
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
    function setPara(v) {
      state.type.paragraph = paraByHand()
        ? clamp(round(v, 2), PARAPX_MIN, PARAPX_MAX)
        : clamp(round(v, 3), PARA_MIN, PARA_MAX);
    }
    numInput("#type-para", setPara);
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
    onChange("#type-role-family", function (el) {
      // a role runs in the design's family until it is given one of its own
      if (el.value) {
        styleOf().family = el.value;
        if (el.value.indexOf("g:") === 0) loadGoogleFont(el.value.slice(2));
      } else {
        delete styleOf().family;
      }
    });
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

    onChange("#rect-grid", function (el) { state.rect.grid = +el.value; });
    numInput("#rcol-n", function (v) { state.rect.columns.n = clamp(Math.round(v), 1, 48); }, 1);
    numInput("#rcol-gutter", function (v) { state.rect.columns.gutter = Math.max(0, snap(v)); }, 0);
    onChange("#rcol-show", function (el) { state.rect.columns.show = el.checked; });
    SIDES.forEach(function (side) {
      numInput("#rcol-" + side, function (v) { state.rect.columns.m[side] = snap(v); });
    });

    /* The inspector is rebuilt whenever the selection moves, so its fields are
       reached by delegation and always mean the block that is selected. */
    function selBlock() { return state.text.blocks[state.selBlock]; }

    $("#block-inspector").addEventListener("input", function (e) {
      var b = selBlock(), what = e.target.dataset.block;
      if (e.target.id === "text-padding") {
        if (e.target.value === "") return;
        state.text.padding = Math.max(0, snap(num(e.target.value, state.text.padding)));
      } else if (!b) return;
      else if (what === "blind") {                    // the slider fills as it moves
        b.blind = Math.max(1, Math.round(num(e.target.value, 12)));
        b.text = blindText(b.blind);
      } else if (what === "text") b.text = e.target.value;
      else if (what === "row" && e.target.value !== "") b.row = Math.round(num(e.target.value, b.row));
      else if ((what === "padL" || what === "padR") && e.target.value !== "") {
        b[what] = Math.max(0, snap(num(e.target.value, b[what] || 0)));
      }
      else return;
      render();
    });
    $("#block-inspector").addEventListener("change", function (e) {
      var b = selBlock(), what = e.target.dataset.block;
      if (e.target.id === "text-margin-pad") state.text.marginPad = e.target.checked;
      else if (!b) return;
      else if (what === "role") b.role = e.target.value;
      else if (what === "grid" || what === "from") {
        var y = rowY(b);                                   // keep it where it is
        if (what === "grid") b.grid = e.target.value === "both" ? "both" : +e.target.value;
        else b.from = e.target.value;
        b.row = rowAt(y, b);
      } else if (what === "cols") {
        // carry the edges across, so the block lands on the new grid where it stood
        var was = blockGrid(b), boxed = blockCols(b) === "box";
        var l = was.x + gridLine(was, b.padL || 0);
        var r = was.x + gridLine(was, was.w - (b.padR || 0));
        b.cols = e.target.value;
        var now = blockGrid(b);
        if (blockCols(b) === "box") { b.padL = 0; b.padR = 0; }
        else if (boxed) { b.padL = 0; b.padR = 0; }        // it had no edges of its own
        else {
          b.padL = snap(clamp(gridLine(now, l - now.x), 0, now.w));
          b.padR = snap(clamp(now.w - gridLine(now, r - now.x), 0, now.w));
        }
      } else return;
      render();
    });
    $("#block-inspector").addEventListener("click", function (e) {
      var b = selBlock();
      // the ✕ here shuts the panel; the one on the block itself takes the block off
      if (e.target.closest('[data-ins="close"]')) {
        insClosed = true;
        $("#block-inspector").hidden = true;
        return;
      }
      if (!b) return;
      if (e.target.closest('[data-block="fill"]')) {
        b.blind = b.blind || 12;
        b.text = blindText(b.blind);
        render();
        return;
      }
      var btn = e.target.closest("[data-align]");
      if (!btn) return;
      b.align = btn.dataset.align;
      render();
    });
    // a click inside the inspector is not a click on empty canvas
    $("#block-inspector").addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      if (e.button !== 0 || e.target.closest("button")) return;
      if (e.target.closest(".ins-head")) {
        startInspectorDrag(e, $("#block-inspector"), function (p) { insPos = p; });
      }
    });
    $("#solid-inspector").addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      if (e.button !== 0 || e.target.closest("button")) return;
      if (e.target.closest(".ins-head")) {
        startInspectorDrag(e, $("#solid-inspector"), function (p) { solPos = p; });
      }
    });
    $("#solid-inspector").addEventListener("click", function (e) {
      if (e.target.closest('[data-ins="close"]')) {
        solClosed = true;
        $("#solid-inspector").hidden = true;
      }
    });
    // opening the shared settings makes it taller; keep it on the canvas
    $("#block-inspector").addEventListener("toggle", function (e) {
      if (e.target.id === "ins-shared") sharedOpen = e.target.open;
      repositionInspector();
    }, true);

    $("#segments").addEventListener("click", function (e) {
      var tab = e.target.closest("[data-seg]");
      if (!tab) return;
      state.seg = tab.dataset.seg;
      render();
    });
    $("#stub-back").addEventListener("click", function () {
      state.seg = "system";
      render();
    });

    $("#bg-tabs").addEventListener("click", function (e) {
      var t = e.target.closest("[data-bgtab]");
      if (!t) return;
      state.bgGen.tab = t.dataset.bgtab;
      render();
    });
    $("#bg-mods").addEventListener("click", function (e) {
      var t = e.target.closest("[data-bgmod]");
      if (!t) return;
      var tab = state.bgGen.tab;
      state.bgGen[tab] = t.dataset.bgmod;
      bgTurnOn(tab);                             // picking one puts it on the format
      render();
    });
    function bgField(e) {
      var el = e.target.closest("[data-bgf]");
      if (!el) return;
      var tab = state.bgGen.tab, m = bgModule(tab, state.bgGen[tab]);
      var f = m.fields.filter(function (x) { return x.k === el.dataset.bgf; })[0];
      if (!f) return;
      var v = f.type === "check" ? el.checked
        : f.type === "color" || f.type === "select" ? el.value
        : num(el.value, m.defaults[f.k]);
      if (el.value === "" && f.type !== "check") return;
      bgSetParam(tab, m.id, f.k, v);
      bgTurnOn(tab);
      render();
    }
    $("#bg-fields").addEventListener("input", bgField);
    $("#bg-fields").addEventListener("change", bgField);
    $("#bg-fields").addEventListener("click", function (e) {
      var t = e.target.closest("[data-bgc]");
      if (!t) return;
      var tab = state.bgGen.tab;
      bgSetParam(tab, bgModule(tab, state.bgGen[tab]).id, t.dataset.bgc, t.dataset.hex);
      bgTurnOn(tab);
      render();
    });
    $("#bg-use").addEventListener("click", function () {
      bgTurnOn(state.bgGen.tab);
      render();
    });
    $("#bg-clear-gen").addEventListener("click", function () {
      state.bgGen.on = "";
      render();
    });
    onInput("#col-base", function (el) { state.scheme.base = el.value; });
    onChange("#col-technique", function (el) { state.scheme.technique = el.value; });
    onInput("#col-count", function (el) { state.scheme.count = clamp(Math.round(num(el.value, 6)), 3, 12); });
    onInput("#col-spread", function (el) { state.scheme.spread = clamp(num(el.value, 30), 5, 90); });
    $("#col-targets").addEventListener("click", function (e) {
      var chip = e.target.closest("[data-put]");
      if (!chip) return;
      var t = schemeTargets().filter(function (x) { return x.k === chip.dataset.put; })[0];
      if (t) { t.put(chip.dataset.hex); render(); }
    });
    $("#col-targets").addEventListener("input", function (e) {
      var el = e.target.closest("[data-col]");
      if (!el) return;
      var t = schemeTargets().filter(function (x) { return x.k === el.dataset.col; })[0];
      if (t) { t.put(el.value); render(); }
    });
    $("#col-grid").addEventListener("click", function (e) {
      var t = e.target.closest("[data-page]");
      if (!t || !state.pages.length) return;
      usePage(+t.dataset.page);
      render();
    });
    $("#colz-in").addEventListener("click", function () { colZoom = clamp(colZoom * 1.25, .3, 4); render(); });
    $("#colz-out").addEventListener("click", function () { colZoom = clamp(colZoom / 1.25, .3, 4); render(); });
    $("#colz-value").addEventListener("click", function () { colZoom = 1; render(); });

    $("#fmt-add").addEventListener("click", function () {
      storePage(state.page);
      addPage($("#fmt-pick").value);
      usePage(state.pages.length - 1);
      render();
    });
    $("#fmt-list").addEventListener("click", function (e) {
      var drop = e.target.closest("[data-drop]");
      if (drop) {
        var i = +drop.dataset.drop;
        state.pages.splice(i, 1);
        if (state.pages.length && !state.pages.some(function (pg) { return pg.master; })) {
          state.pages[0].master = true;
        }
        state.page = clamp(state.page > i ? state.page - 1 : state.page, 0, Math.max(0, state.pages.length - 1));
        render();
        return;
      }
      var row = e.target.closest("[data-page]");
      if (row && !e.target.closest("input")) { usePage(+row.dataset.page); render(); }
    });
    $("#fmt-list").addEventListener("change", function (e) {
      var m = e.target.closest("[data-master]");
      if (m) {
        storePage(state.page);           // the master is the source, so keep what it holds
        state.pages.forEach(function (pg, i) { pg.master = i === +m.dataset.master; });
        render();
        return;
      }
      var l = e.target.closest("[data-link]");
      if (!l) return;
      var pg = state.pages[+l.dataset.i];
      if (!pg) return;
      storePage(state.page);
      pg.links[l.dataset.link] = e.target.checked;
      if (+l.dataset.i === state.page) applyPage(state.page);
      render();
    });
    $("#fmt-grid").addEventListener("click", function (e) {
      var t = e.target.closest("[data-page]");
      if (!t) return;
      usePage(+t.dataset.page);
      state.seg = "system";              // straight to designing it
      render();
    });
    $("#fmtz-in").addEventListener("click", function () { fmtZoom = clamp(fmtZoom * 1.25, .3, 4); render(); });
    $("#fmtz-out").addEventListener("click", function () { fmtZoom = clamp(fmtZoom / 1.25, .3, 4); render(); });
    $("#fmtz-value").addEventListener("click", function () { fmtZoom = 1; render(); });

    $("#bgz-in").addEventListener("click", function () { setBgZoom(bgScale() * 1.25); });
    $("#bgz-out").addEventListener("click", function () { setBgZoom(bgScale() / 1.25); });
    $("#bgz-100").addEventListener("click", function () { setBgZoom(1); });
    $("#bgz-fit").addEventListener("click", function () { setBgZoom(null); });
    $("#bgz-value").addEventListener("click", function () { setBgZoom(null); });
    $("#bg-view-stage").addEventListener("wheel", function (e) {
      if (!(e.ctrlKey || e.metaKey)) return;         // plain wheel scrolls the view
      e.preventDefault();
      setBgZoom(bgScale() * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
    }, { passive: false });

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
      if (tile.dataset.page !== undefined) usePage(+tile.dataset.page);
      else {
        state.stage.w = +tile.dataset.w;
        state.stage.h = +tile.dataset.h;
      }
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
    state.type.paragraph = paraByHand()
      ? clamp(round(state.type.paragraph, 2), PARAPX_MIN, PARAPX_MAX)
      : clamp(round(state.type.paragraph, 3), PARA_MIN, PARA_MAX);
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

  // a solid follows the pointer; the logo picks the alignment cell nearest it
  function startShapeDrag(e, name) {
    if (!name || !state[name]) return;
    if (name === "rect" ? !state.solids.length : !state[name].visible) return;
    var el = state[name], b0 = box(name), start = toStage(e);
    if (name === "rect") {
      var p0 = { x: el.pos.x, y: el.pos.y }, c0 = content();
      drag(e, function (ev) {
        var p = toStage(ev);
        el.pos = {
          x: p0.x + (p.x - start.x) / Math.max(1, c0.w),
          y: p0.y + (p.y - start.y) / Math.max(1, c0.h)
        };
        keepSolidInReach();
      });
      return;
    }
    els.cells.hidden = false;
    renderCells(name);
    drag(e, function (ev) {
      var p = toStage(ev);
      var cx = b0.x + (p.x - start.x) + b0.w / 2;
      var cy = b0.y + (p.y - start.y) + b0.h / 2;
      // the cell it would sit closest to, measured with the anchor it already has
      var c = content(), sz = sizeOf(name);
      setAlign(name,
        nearestKey(H_KEYS, fh, c.x, c.w, sz.w, el.anchor.h, cx),
        nearestKey(V_KEYS, fv, c.y, c.h, sz.h, el.anchor.v, cy));
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
      padL: 0, padR: 0, cols: "auto",
      blind: ROLE_BLIND[role] || 12, text: blindText(ROLE_BLIND[role] || 12)
    };
  }

  function removeBlock(i) {
    if (i < 0 || i >= state.text.blocks.length) return;
    state.text.blocks.splice(i, 1);
    if (state.selBlock === i) state.selBlock = -1;
    else if (state.selBlock > i) state.selBlock--;
    if (editing === i) editing = -1;
    else if (editing > i) editing--;
    inspectorFor = -1;
    var stack = liveStack();
    if (stack) stack.dataset.sig = "";
  }

  var placing = false;

  // pull an element out of the tray: it lands where the pointer is, snapping as it
  // goes, and goes back to the tray if it is let go outside the format
  function startPlace(e, id) {
    var isRect = id === "rect" || id === "frame", role = isRect ? null : id.split(":")[1];
    var b, i = -1;
    if (isRect) {
      b = addSolid();                      // another one, every time
      if (id === "frame") {                // a solid whose fill is a picture
        b.content = "image";
        b.fill = "#232834";
      }
      solClosed = false;
      state.sel = "rect";
      state.selBlock = -1;
    } else {
      if (ROLES.indexOf(role) < 0) return;
      b = newBlock(role);
      state.text.blocks.push(b);
      i = state.text.blocks.length - 1;
      state.sel = "rect";
      state.selBlock = i;
      inspectorFor = -1;
      insClosed = false;
    }
    var landed = false, moved = false;
    placing = true;
    var move = function (ev) {
      var p = toStage(ev), st = state.stage;
      moved = true;
      landed = p.x >= 0 && p.y >= 0 && p.x <= st.w && p.y <= st.h;
      if (isRect) {
        putSolidAt(p.x, p.y);          // its anchor point lands under the pointer
      } else {
        b.row = rowAt(p.y, b);
      }
    };
    drag(e, move, function () {
      placing = false;
      els.cells.hidden = true;
      // a plain click drops it where it last sat; a drag that ends off the format
      // puts it back in the tray
      if (moved && !landed) {
        if (isRect) takeRectOff();
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

  // push the picture around inside the box that holds it
  function startPicDrag(e) {
    var r = state.rect, start = toStage(e), x0 = r.x || 0, y0 = r.y || 0;
    document.body.classList.add("moving-bg");
    drag(e, function (ev) {
      var p = toStage(ev);
      r.x = snap(x0 + p.x - start.x);
      r.y = snap(y0 + p.y - start.y);
    }, function () { document.body.classList.remove("moving-bg"); });
  }

  // push the background image around under everything else
  function startBgDrag(e) {
    var start = toStage(e), x0 = state.bg.x || 0, y0 = state.bg.y || 0;
    document.body.classList.add("moving-bg");
    drag(e, function (ev) {
      var p = toStage(ev);
      state.bg.x = snap(x0 + p.x - start.x);
      state.bg.y = snap(y0 + p.y - start.y);
    }, function () { document.body.classList.remove("moving-bg"); });
  }

  function takeRectOff() {
    if (!state.solids.length) return;
    state.solids.splice(state.solid, 1);
    useSolid(state.solid - 1 >= 0 ? state.solid - 1 : 0);
    if (!state.solids.length && state.sel === "rect") state.sel = "";
  }

  // drag a text block up and down; it lands on whole rows of its own grid
  function startTextDrag(e, index) {
    var b = state.text.blocks[index];
    if (!b) return;
    var start = toStage(e), row0 = b.row;
    // a block that is not in the solid can be moved sideways as well, landing on
    // the column lines; the field keeps the width it had
    var free = blockCols(b) !== "box", g = blockGrid(b), cw = g.w, colw = gridColW(g);
    var l0 = gridLine(g, b.padL || 0);
    var w0 = Math.max(colw, gridLine(g, cw - (b.padR || 0)) - l0);
    drag(e, function (ev) {
      var p = toStage(ev);
      var steps = Math.round((p.y - start.y) / blockUnit(b));
      b.row = row0 + (b.from === "bottom" ? -steps : steps);   // rows count upward from the bottom
      if (!free) return;
      // the left edge lands on a column line; the field keeps its width while there is
      // room for it and gives way at the last line of the grid
      var l = clamp(gridLine(g, l0 + p.x - start.x), 0, Math.max(0, cw - colw));
      var r = Math.max(l + colw, Math.min(cw, l + w0));
      b.padL = snap(l);
      b.padR = snap(Math.max(0, cw - r));
    });
  }

  // drag a field edge in or out; a field narrower than the column wraps its lines
  function startFieldResize(e, index, dir) {
    var b = state.text.blocks[index];
    if (!b) return;
    var start = toStage(e), l0 = b.padL || 0, r0 = b.padR || 0;
    var room = Math.max(MIN_SIZE, blockFrame(b).w - state.text.padding * 2);
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
      if (role === "paragraph") {
        ty.paragraph = paraByHand()
          ? clamp(round(from * k, 2), PARAPX_MIN, PARAPX_MAX)
          : clamp(round(from * k, 3), PARA_MIN, PARA_MAX);
      }
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
    /* Dragging a handle is a direct instruction. If that side is being computed —
       filling the margins, filling the format, fitting the text — take it over and
       carry on from the size that is on screen, rather than ignoring the drag. */
    if (name === "rect") {
      if (sx && state.rect.wmode !== "fixed") { state.rect.wmode = "fixed"; state.rect.w = snap(s0.w); }
      if (sy && state.rect.hmode !== "fixed") { state.rect.hmode = "fixed"; state.rect.h = snap(s0.h); }
    }
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
    }, function () {
      /* The box is snapped to the columns and the rows and held above the width of
         its text, so what it runs at is rarely what the drag asked for. Keep the
         number that was let go of, or the next drag starts from a size that is not
         on screen and the box appears not to move at all. */
      if (name !== "rect") return;
      var eff = sizeOf("rect");
      if (state.rect.wmode === "fixed") state.rect.w = snap(eff.w);
      if (state.rect.hmode === "fixed") state.rect.h = snap(eff.h);
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
      // hold alt to push a picture around: the one in the box under the pointer,
      // or the format's own background
      if (e.altKey) {
        // look under whatever is on top — text sits over the boxes
        var under = document.elementsFromPoint(e.clientX, e.clientY), over = null, q;
        for (q = 0; q < under.length && !over; q++) {
          if (under[q].closest) over = under[q].closest(".shape.rect");
        }
        if (over && over.dataset.i !== undefined) {
          useSolid(+over.dataset.i);
          if (state.rect.content !== "fill") { render(); return startPicDrag(e); }
        }
        if (state.bg.src) return startBgDrag(e);
      }
      var t = e.target;
      if (t.classList.contains("guide")) return startGuide(e, t.dataset.side);
      if (t.classList.contains("handle")) {
        if (t.classList.contains("kill")) {              // back to the tray
          e.preventDefault();
          takeRectOff();
          render();
          return;
        }
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
        insClosed = false;                         // picking a block brings it back
        els.frame.focus();
        render();
        return startTextDrag(e, i);
      }
      if (editing >= 0) stopEditing();
      if (state.selBlock >= 0) state.selBlock = -1;
      var shape = t.closest && t.closest(".shape");
      if (shape) {
        state.sel = shape.dataset.el;
        // clicking a solid picks that one out of however many are on the page
        if (state.sel === "rect" && shape.dataset.i !== undefined) {
          useSolid(+shape.dataset.i);
          solClosed = false;                       // picking one brings its panel back
        }
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
      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selBlock >= 0) {
          e.preventDefault();
          removeBlock(state.selBlock);
          render();
          return;
        }
        if (state.sel === "rect" && state.solids.length) {
          e.preventDefault();
          takeRectOff();
          render();
          return;
        }
      }
      var map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      var d = map[e.key];
      if (!d) return;
      var el = state[state.sel];
      if (!el) return;
      // a solid steps by a column and a row, the size of the snap it lands on
      if (state.sel === "rect") {
        if (!state.solids.length) return;
        e.preventDefault();
        moveSolidBy(d[0] * (state.rect.cols ? colStep() : gridUnit(state.rect.grid)),
          d[1] * gridUnit(state.rect.grid));
        render();
        return;
      }
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

  // a plain conversion, with no colour profile behind it — a starting point for print,
  // not a substitute for the separation a printer will make
  function cmykLabel(hex) {
    var c = hexRgb(hex), r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var k = 1 - Math.max(r, g, b);
    var d = 1 - k;
    var cy = d ? (d - r) / d : 0, m = d ? (d - g) / d : 0, y = d ? (d - b) / d : 0;
    return [cy, m, y, k].map(function (v) { return Math.round(v * 100); }).join(" / ") + " %";
  }

  // hue 0-360, saturation and lightness 0-1
  function hexHsl(hex) {
    var c = hexRgb(hex), r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    var l = (mx + mn) / 2, h = 0, sat = 0;
    if (d) {
      sat = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: sat, l: l };
  }

  function hslHex(h, sat, l) {
    h = ((h % 360) + 360) % 360;
    sat = clamp(sat, 0, 1);
    l = clamp(l, 0, 1);
    var c = (1 - Math.abs(2 * l - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    var t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
      : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return "#" + t.map(function (v) {
      var n = Math.round((v + m) * 255);
      return (n < 16 ? "0" : "") + clamp(n, 0, 255).toString(16);
    }).join("");
  }

  function hslLabel(hex) {
    var c = hexRgb(hex), r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    var l = (mx + mn) / 2, h = 0, sat = 0;
    if (d) {
      sat = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return "hsl(" + Math.round(h) + " " + Math.round(sat * 100) + "% " + Math.round(l * 100) + "%)";
  }

  function weightName(w) {
    return ({ 100: "Thin", 200: "Extra light", 300: "Light", 400: "Regular", 500: "Medium",
      600: "Semibold", 700: "Bold", 800: "Extra bold", 900: "Black" })[w] || String(w);
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

  // how much blind text each role shows on the sheet
  var SPECIMEN_WORDS = { display: 3, headline: 5, subline: 7, paragraph: 12, smallprint: 14 };

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
        '<span class="spec-meta">' + esc(familyLabel(roleFamilyId(r))) + " " + esc(weightName(st.weight)) +
        (st.transform !== "none" ? ", " + esc(st.transform) : "") +
        " · &lt;" + esc(st.tag) + "&gt; · " + round(px, 2) + " px = " +
        (r === "paragraph"
          ? esc(paraRule())
          : round(st.mult, 3) + " × paragraph") +
        " · line height " + round(lh, 4) + " (" + round(px * lh, 2) + " px" +
        (steps ? ", " + steps + " × grid " + (st.snap === "half" ? "2" : "1") : "") + ")" +
        " · tracking " + round(st.ls, 3) + "em · " + st.color.toUpperCase() +
        " · " + esc(snapName) + "</span></div>" +
        '<div class="spec-line" style="font-family:' + esc(roleStack(r)) + ";font-size:" + round(px * k, 2) +
        "px;line-height:" + round(lh, 4) + ";font-weight:" + st.weight + ";letter-spacing:" +
        round(st.ls, 3) + "em;text-transform:" + st.transform + ';color:#14171c">' +
        esc(blindText(SPECIMEN_WORDS[r] || 6)) + "</div></div>";
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
      "<dt>Paragraph</dt><dd>" + esc(paraRule()) + " = " +
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
      "<dt>Family</dt><dd>" + esc(familyStack()) +
        (ROLES.some(function (r) { return state.type.roles[r].family; })
          ? "; " + ROLES.filter(function (r) { return state.type.roles[r].family; }).map(function (r) {
              return ROLE_NAMES[r].toLowerCase() + " in " + familyLabel(roleFamilyId(r));
            }).join(", ")
          : "") + "</dd>" +
      "</dl></div></div>" + sheetFoot("Typography");
  }

  // every colour in the design with its values and how it holds up against the others
  function colourSheet() {
    var uses = [
      { name: "Format background", hex: state.stage.bg },
      { name: "Solid fill", hex: state.rect.fill },
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
        '<div class="sw-val">' + hex + "<br>" + rgbLabel(hex) + "<br>" + hslLabel(hex) +
        "<br>CMYK " + cmykLabel(hex) + "</div></div></div>";
    }).join("");

    var grounds = [
      { name: "the format background", hex: state.stage.bg },
      { name: "the solid fill", hex: state.rect.fill }
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
      "asks 4.5:1 for text and 3:1 for large text. CMYK is a plain conversion with no profile " +
      "behind it — a starting point for print, not the separation a printer will make.</p>" +
      '<div class="rule"></div><h2>Palette</h2><div class="swatches">' + cards + "</div>" +
      '<h2 style="margin-top:34px">Contrast</h2><table><thead><tr><th>Pairing</th><th>Colours</th>' +
      "<th>Size</th><th>Ratio</th><th>WCAG AA</th></tr></thead><tbody>" + rows.join("") +
      "</tbody></table>" + sheetFoot("Colour");
  }

  function openSheet(kind) {
    var el = $("#sheet");
    el.innerHTML = kind === "colour" ? colourSheet() : typeSheet();
    $("#sheet-title").textContent = (kind === "colour" ? "Colour" : "Typography") +
      " slide — 1920 × 1080 · 16:9";
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

  /* ------------------------------------------------------------- ask Claude */

  /* The design system can be asked for three things: a colour scheme, a font
     pairing, a layout for the format that is open. Claude answers in the app's own
     vocabulary — the settings a designer would have set by hand — so the answer is
     applied through the same state the panel writes to. It lands on the baseline
     grid and the columns by construction, it cannot express a value the app does
     not have, and one undo takes it all back.

     The key is never in the repository and never in this browser's storage. It is
     read from a key.txt handed to the page: Chromium remembers the file itself
     (not its contents), so later visits are one click; served locally, a key.txt
     sitting beside index.html is read directly. */

  /* Each question sits where its subject is: the colour scheme in the colour
     stage, the fonts under the type scale, the layout with the design system. It
     is the same box built three times — and the key, the model and the endpoint
     are one setting shared between them, so whichever one you are looking at can
     be set up without going anywhere else. */
  var AI_ASKS = [
    { kind: "scheme", host: "#ask-scheme", head: "Ask Claude for a scheme",
      button: "Work out a scheme",
      hint: "A colour, a relationship, how many swatches and which swatch goes where \u2014 " +
        "the controls above, so the harmony and the contrast readouts still hold.",
      place: "A record label's release announcement. Confident, a little severe." },
    { kind: "fonts", host: "#ask-fonts", head: "Ask Claude for the fonts",
      button: "Suggest fonts",
      hint: "A family and a weight for each of the five roles, so the answer can be one face or " +
        "five. Every name is checked against the families the app can load first.",
      place: "A club night poster. Loud, cheap, a bit ugly on purpose." },
    { kind: "layout", host: "#ask-layout", head: "Ask Claude for a layout",
      button: "Lay out this format",
      hint: "Blocks on rows of a named grid with real copy, the solids to go under them, and where " +
        "the logo sits \u2014 the app turns that into positions, so nothing it gives can land off the grid.",
      place: "The cover of a report on water. Quiet, a lot of air, one image." }
  ];

  var AI_MODELS = [
    ["claude-opus-5", "Claude Opus 5 — the default"],
    ["claude-sonnet-5", "Claude Sonnet 5 — cheaper"],
    ["claude-haiku-4-5", "Claude Haiku 4.5 — cheapest"]
  ];
  var AI_ENDPOINT = "https://api.anthropic.com/v1/messages";
  var AI_DB = "bos.keyfile", AI_STORE = "handles", AI_HANDLE = "key.txt";
  var AI_LOCAL_FLAG = "bos.keyfile.local";     // not a secret: whether to look beside the app
  var aiKey = "", aiFrom = "", aiHandle = null, aiBusy = false, aiPending = null;
  var aiLastKind = "layout";

  function aiBoxHTML(a) {
    var id = function (part) { return 'id="ai-' + a.kind + "-" + part + '"'; };
    return '<h3 class="sub-head">' + esc(a.head) + "</h3>" +
      '<p class="hint">' + esc(a.hint) + "</p>" +
      '<label class="field grow"><span>The brief \u2014 what this design is for</span>' +
        "<textarea " + id("brief") + ' data-ai-brief="' + a.kind + '" rows="3" spellcheck="false" ' +
        'placeholder="' + esc(a.place) + '"></textarea></label>' +
      '<button type="button" class="primary wide" ' + id("go") + ' data-ai-go="' + a.kind + '">' +
        esc(a.button) + "</button>" +
      '<p class="status" ' + id("status") + "></p>" +
      '<div ' + id("result") + ' hidden>' +
        '<p class="hint" ' + id("note") + "></p>" +
        '<pre class="css-out" ' + id("json") + "></pre>" +
        '<div class="row">' +
          '<button type="button" class="primary grow" data-ai-apply="' + a.kind + '">Apply</button>' +
          '<button type="button" class="ghost grow" data-ai-discard="' + a.kind + '">Discard</button>' +
        "</div>" +
      "</div>" +
      '<details class="sub ai-conn"><summary><h3>Key and connection</h3></summary>' +
        '<p class="hint warn" data-ai="warning"></p>' +
        '<div class="row">' +
          '<button type="button" class="ghost grow" data-ai="pick">Choose key.txt\u2026</button>' +
          '<button type="button" class="ghost" data-ai="forget">Forget</button>' +
        "</div>" +
        '<button type="button" class="ghost wide" data-ai="local" hidden>Use the key.txt beside the app</button>' +
        '<p class="status" data-ai="keystatus"></p>' +
        '<label class="field grow"><span>Model</span><select data-ai="model"></select></label>' +
        '<label class="field grow"><span>Endpoint</span>' +
          '<input type="text" data-ai="endpoint" spellcheck="false" autocomplete="off" ' +
          'placeholder="https://api.anthropic.com/v1/messages"></label>' +
        '<p class="hint">Point this at a proxy of your own \u2014 one that holds the key server-side \u2014 ' +
          "and no key is needed in the browser at all. The three questions share these settings.</p>" +
      "</details>";
  }

  // the boxes are three views of one thing: what is said, is said in all of them
  function aiEach(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }
  function aiStatus(msg, kind, which) {
    var el = $("#ai-" + (which || aiLastKind) + "-status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "status" + (kind ? " " + kind : "");
  }
  function aiKeyStatus(msg, kind) {
    aiEach('[data-ai="keystatus"]', function (el) {
      el.textContent = msg || "";
      el.className = "status" + (kind ? " " + kind : "");
    });
  }

  // the first whitespace-delimited token of the file, so a trailing newline is fine
  function aiTakeKey(text, from) {
    var k = String(text || "").trim().split(/\s+/)[0] || "";
    if (!/^sk-ant-/.test(k)) {
      aiKeyStatus("That file does not hold an Anthropic key — they start with sk-ant-.", "err");
      return false;
    }
    aiKey = k;
    aiFrom = from;
    aiKeyStatus("Key read from " + from + " — " + k.slice(0, 11) + "… It is held for this page only, " +
      "never stored and never sent anywhere but the endpoint above.", "ok");
    return true;
  }

  /* The file handle — not the key — is remembered, so nothing secret is written to
     this browser. A handle needs its permission asked again after a reload, which
     is why reconnecting is a click rather than nothing. */
  function aiIdb(mode, run) {
    return new Promise(function (resolve) {
      if (!window.indexedDB) return resolve(null);
      var req;
      try { req = indexedDB.open(AI_DB, 1); } catch (e) { return resolve(null); }
      req.onupgradeneeded = function () {
        try { req.result.createObjectStore(AI_STORE); } catch (e) {}
      };
      req.onerror = function () { resolve(null); };
      req.onsuccess = function () {
        var db = req.result, out = null;
        try {
          var tx = db.transaction(AI_STORE, mode);
          out = run(tx.objectStore(AI_STORE));
          tx.oncomplete = function () { db.close(); resolve(out ? out.result : null); };
          tx.onerror = function () { db.close(); resolve(null); };
        } catch (e) { resolve(null); }
      };
    });
  }
  function aiRemember(handle) {
    return aiIdb("readwrite", function (st) { return st.put(handle, AI_HANDLE); });
  }
  function aiRecall() {
    return aiIdb("readonly", function (st) { return st.get(AI_HANDLE); });
  }
  function aiForgetHandle() {
    return aiIdb("readwrite", function (st) { return st.delete(AI_HANDLE); });
  }

  function aiReadHandle(handle, ask) {
    if (!handle || !handle.getFile) return Promise.resolve(false);
    var perm = handle.queryPermission
      ? handle.queryPermission({ mode: "read" })
      : Promise.resolve("granted");
    return Promise.resolve(perm).then(function (state1) {
      if (state1 === "granted") return "granted";
      if (!ask || !handle.requestPermission) return state1;
      return handle.requestPermission({ mode: "read" });
    }).then(function (state2) {
      if (state2 !== "granted") return false;
      return handle.getFile().then(function (f) { return f.text(); }).then(function (text) {
        aiHandle = handle;
        return aiTakeKey(text, handle.name || "key.txt");
      });
    }).catch(function () { return false; });
  }

  /* A key.txt sitting beside index.html, for running the app locally. Asked for
     only where it could exist, and only once you have said it is there — a page
     that goes looking for a file nobody put there just logs a 404 at everyone. */
  function aiLocalPossible() {
    return location.protocol === "file:" ||
      /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  }
  function aiLocalWanted() {
    try { return localStorage.getItem(AI_LOCAL_FLAG) === "1"; } catch (e) { return false; }
  }
  function aiTryLocalFile(asked) {
    if (aiKey || !aiLocalPossible() || (!asked && !aiLocalWanted())) return Promise.resolve(false);
    return fetch("key.txt", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("There is no key.txt beside index.html (HTTP " + r.status + ").");
      return r.text().then(function (text) {
        if (!/^\s*sk-ant-/.test(text)) throw new Error("The key.txt beside the app does not hold a key.");
        var ok = aiTakeKey(text, "key.txt beside the app");
        if (ok) { try { localStorage.setItem(AI_LOCAL_FLAG, "1"); } catch (e) {} }
        return ok;
      });
    }).catch(function (err) {
      if (asked) aiKeyStatus(String(err.message || err), "err");
      return false;
    });
  }

  function aiPickFile() {
    if (window.showOpenFilePicker) {
      window.showOpenFilePicker({
        multiple: false,
        types: [{ description: "The key, on its own line", accept: { "text/plain": [".txt"] } }]
      }).then(function (handles) {
        var h = handles && handles[0];
        return aiReadHandle(h, true).then(function (ok) {
          if (ok) return aiRemember(h);
        });
      }).catch(function () {});
      return;
    }
    $("#ai-file").click();       // no file handles here: this session only
  }

  function aiBoot() {
    AI_ASKS.forEach(function (a) {
      var host = $(a.host);
      if (host) host.innerHTML = aiBoxHTML(a);
    });
    var models = AI_MODELS.map(function (m) {
      return '<option value="' + m[0] + '">' + esc(m[1]) + "</option>";
    }).join("");
    aiEach('[data-ai="model"]', function (el) { el.innerHTML = models; });
    aiEach('[data-ai="warning"]', function (el) {
      el.textContent =
        "The key is read from a file you choose and held for this page only — it is never written to " +
        "this browser's storage, never committed, and sent to nothing but the endpoint below. Keep a " +
        "key just for bos, with a spend limit on it, so it can be revoked on its own.";
    });
    aiEach('[data-ai="local"]', function (el) { el.hidden = !aiLocalPossible(); });
    aiKeyStatus("No key yet. Put it in a text file on its own line and choose it above." +
      (aiLocalPossible() ? " Running locally, a key.txt beside index.html can be read straight off." : ""));
    aiTryLocalFile(false).then(function (got) {
      if (got) return;
      return aiRecall().then(function (h) {
        if (!h) return;
        aiHandle = h;
        return aiReadHandle(h, false).then(function (ok) {
          if (!ok) {
            aiKeyStatus("A key file is remembered (" + (h.name || "key.txt") +
              "). Choose it again to let this page read it — the browser asks once per visit.");
          }
        });
      });
    });
  }

  /* ---- the transport. One request, one JSON answer, shaped by a schema so what
     comes back is the app's settings rather than prose about them. */
  function aiModelOpts(model) {
    // thinking and effort are on the models that take them; Haiku takes neither
    return model.indexOf("haiku") >= 0 ? {} : { thinking: { type: "adaptive" }, effort: "medium" };
  }

  function aiAsk(kind, label, schema, system, user) {
    if (aiBusy) return;
    aiLastKind = kind;
    if (!aiKey && !state.ai.endpoint) {
      return aiStatus("No key yet — open Key and connection below and choose your key.txt, " +
        "or point the endpoint at a proxy that holds one.", "err", kind);
    }
    var model = state.ai.model || AI_MODELS[0][0];
    var body = {
      model: model,
      max_tokens: 8000,
      system: system,
      messages: [{ role: "user", content: user }],
      output_config: { format: { type: "json_schema", schema: schema } }
    };
    var opt = aiModelOpts(model);
    if (opt.thinking) body.thinking = opt.thinking;
    if (opt.effort) body.output_config.effort = opt.effort;

    var headers = { "content-type": "application/json", "anthropic-version": "2023-06-01" };
    if (aiKey) {
      headers["x-api-key"] = aiKey;
      /* The API refuses a call straight from a page unless it says so. The key is
         exposed to whatever runs here either way — which is the whole reason it
         lives in a file you hand over rather than in the repository. */
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    }

    aiBusy = true;
    aiSetBusy(true, label, kind);
    aiPending = null;
    $("#ai-" + kind + "-result").hidden = true;
    aiStatus("Asking " + model + "…", null, kind);
    fetchTimeout(state.ai.endpoint || AI_ENDPOINT, {
      method: "POST", headers: headers, body: JSON.stringify(body)
    }, 180000).then(aiRead).then(function (data) {
      if (data.stop_reason === "refusal") throw new Error("Claude declined this one. Try a different brief.");
      if (data.stop_reason === "max_tokens") throw new Error("The answer ran past its length. Ask for less.");
      var text = (data.content || []).filter(function (b) { return b.type === "text"; })
        .map(function (b) { return b.text; }).join("");
      if (!text) throw new Error("Nothing came back to read.");
      var parsed;
      try { parsed = JSON.parse(text); }
      catch (e) { throw new Error("The answer was not the JSON the schema asked for: " + text.slice(0, 160)); }
      aiPending = { kind: kind, value: parsed };
      $("#ai-" + kind + "-result").hidden = false;
      $("#ai-" + kind + "-json").textContent = JSON.stringify(parsed, null, 2);
      $("#ai-" + kind + "-note").textContent = (parsed.note ? parsed.note + " " : "") + aiCost(data.usage, model);
      aiStatus("Read it over, then Apply. Undo takes it back either way.", "ok", kind);
    }).catch(function (err) {
      aiStatus(aiExplain(err), "err", kind);
    }).then(function () {
      aiBusy = false;
      aiSetBusy(false);
      render();
    });
  }

  // the API says what went wrong in the body, whatever the status
  function aiRead(res) {
    return res.text().then(function (text) {
      var data = null;
      try { data = JSON.parse(text); } catch (e) {}
      var said = data && data.error && (data.error.message || data.error.type);
      if (!res.ok) throw new Error("HTTP " + res.status + " — " + (said || text.slice(0, 200)));
      if (!data) throw new Error("The response was not JSON: " + text.slice(0, 200));
      if (said) throw new Error(said);
      return data;
    });
  }

  function aiSetBusy(on, label, kind) {
    aiEach("[data-ai-go]", function (el) { el.disabled = on; });
    if (on && label) aiStatus("Asking for " + label + "…", null, kind);
  }

  function aiCost(u, model) {
    if (!u) return "";
    var rates = { "claude-opus-5": [5, 25], "claude-sonnet-5": [2, 10], "claude-haiku-4-5": [1, 5] };
    var r = rates[model] || rates["claude-opus-5"];
    var inTok = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
    var usd = inTok / 1e6 * r[0] + (u.output_tokens || 0) / 1e6 * r[1];
    return "(" + inTok + " in / " + (u.output_tokens || 0) + " out — about $" +
      (usd < 0.01 ? usd.toFixed(4) : usd.toFixed(3)) + ")";
  }

  function aiExplain(err) {
    var msg = String((err && err.message) || err);
    if (/Failed to fetch|NetworkError|CORS/i.test(msg)) {
      return "The browser could not reach the endpoint. Either the network is blocking it, or the " +
        "API is refusing a call straight from a page — in which case run it through a proxy of your own " +
        "and put that URL in Endpoint.";
    }
    if (/HTTP 401/.test(msg)) return "The key was refused (401). Check the file holds the whole key.";
    if (/HTTP 400/.test(msg)) return "The request was rejected (400): " + msg;
    if (/HTTP 429/.test(msg)) return "Rate limited (429). Wait a moment and ask again.";
    return msg;
  }

  // what every question carries: the system, in the format the app exports
  function aiBrief(kind) { return String((state.ai.briefs || {})[kind] || "").trim(); }
  function aiSystemText() {
    return "You are working inside bos, a design-system app, as the designer's hand on its own " +
      "controls. You are given the design system as W3C design tokens, with the app's own rules " +
      "under $extensions. Answer only with settings the app has — the JSON schema is exactly its " +
      "vocabulary, and every value you give will be applied to the live design. Never invent a " +
      "field, never answer in prose. Reasons belong in the one 'note' field, in one sentence.";
  }
  function aiTokenPayload() {
    return "The design system as it stands:\n\n" + tokensJSON();
  }

  /* ---- a colour scheme, given as the controls the colour stage has: one colour,
     a relationship, how many swatches, and where each one goes. */
  function aiSchemeSchema() {
    var idx = [];
    for (var i = 1; i <= 12; i++) idx.push(i);
    var swatch = { type: "integer", enum: idx };
    var places = ["page", "display", "headline", "subline", "paragraph", "smallprint", "solid"];
    var assign = { type: "object", properties: {}, required: places.slice(), additionalProperties: false };
    places.forEach(function (k) { assign.properties[k] = swatch; });
    return {
      type: "object",
      properties: {
        base: { type: "string", description: "The colour it is worked out from, as #rrggbb" },
        technique: { type: "string", enum: TECHNIQUES.map(function (t) { return t.id; }) },
        count: { type: "integer", enum: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
        spread: { type: "integer", enum: [10, 15, 20, 25, 30, 40, 50, 60, 75, 90],
          description: "The angle between neighbouring hues — only used by analogous and split" },
        assign: assign,
        note: { type: "string" }
      },
      required: ["base", "technique", "count", "spread", "assign", "note"],
      additionalProperties: false
    };
  }
  function aiAskScheme() {
    var KIND = "scheme";
    var user = aiTokenPayload() + "\n\nThe brief: " + (aiBrief(KIND) || "none given — read the system itself.") +
      "\n\nWork out a colour scheme for it. The app builds a scheme from one colour and one " +
      "relationship between hues, so give those rather than a list of colours: the techniques are " +
      TECHNIQUES.map(function (t) { return t.id; }).join(", ") + ". The first pass of swatches is the " +
      "hues themselves and each pass after it steps the lightness, so a count of 6 on a two-hue " +
      "technique is two hues, a lighter pair, a darker pair. Then place them: 'assign' names which " +
      "swatch number goes to the page ground, to each of the five type roles, and to the solid. " +
      "Type must clear 4.5:1 against the page it sits on, and the display role at least 3:1.";
    aiAsk("scheme", "a colour scheme", aiSchemeSchema(), aiSystemText(), user);
  }
  function aiApplyScheme(v) {
    state.scheme = {
      base: /^#[0-9a-f]{6}$/i.test(v.base) ? v.base : state.scheme.base,
      technique: TECHNIQUES.some(function (t) { return t.id === v.technique; }) ? v.technique : state.scheme.technique,
      count: clamp(Math.round(v.count) || 6, 3, 12),
      spread: clamp(Math.round(v.spread) || 30, 5, 90)
    };
    var sw = schemeSwatches(), pick = function (n) { return sw[clamp(Math.round(n) - 1, 0, sw.length - 1)]; };
    var a = v.assign || {};
    if (a.page) state.stage.bg = pick(a.page);
    ROLES.forEach(function (r) { if (a[r]) state.type.roles[r].color = pick(a[r]); });
    if (a.solid) state.solids.forEach(function (r) { if (r.content === "fill") r.fill = pick(a.solid); });
    return "Scheme applied: " + v.technique + " from " + state.scheme.base + ".";
  }

  /* ---- the fonts, one per role, from the families the app can actually load.
     A role may run in a family of its own, so an answer can be one face used five
     ways, two, or five different ones — that is the answer's business. */
  function aiFontsSchema() {
    var perRole = function (item) {
      var o = { type: "object", properties: {}, required: ROLES.slice(), additionalProperties: false };
      ROLES.forEach(function (r) { o.properties[r] = item; });
      return o;
    };
    return {
      type: "object",
      properties: {
        families: perRole({ type: "string", description: "The family for this role, copied exactly from the list" }),
        weights: perRole({ type: "integer", enum: [300, 400, 500, 600, 700, 900] }),
        note: { type: "string" }
      },
      required: ["families", "weights", "note"],
      additionalProperties: false
    };
  }
  function aiAskFonts() {
    var KIND = "fonts", all = gfList();
    var user = aiTokenPayload() + "\n\nThe brief: " + (aiBrief(KIND) || "none given — read the system itself.") +
      "\n\nName the family and the weight for each of the five roles. Each role can run in a family " +
      "of its own, so this is not a choice between one font and one pairing: use as many faces as the " +
      "work wants — the usual answer is two, one for the headings and one for the text, but a display " +
      "face for the display role, a workhorse for the headline and subline, and something else again " +
      "for the small print is a perfectly good answer if that is what the brief asks for. Say why in " +
      "the note. Every name must be copied exactly from this list of Google families, which is all " +
      "the app can load:\n\n" + all.join(", ");
    aiAsk("fonts", "the fonts", aiFontsSchema(), aiSystemText(), user);
  }
  function aiApplyFonts(v) {
    var all = gfList(), fams = v.families || {};
    var find = function (name) {
      var want = String(name || "").trim().toLowerCase();
      return all.filter(function (n) { return n.toLowerCase() === want; })[0] || null;
    };
    var found = {}, missing = [];
    ROLES.forEach(function (r) {
      var n = find(fams[r]);
      if (n) found[r] = n; else missing.push(fams[r] || r);
    });
    if (missing.length) {
      throw new Error("Not in the catalogue: " + missing.join(", ") +
        ". Load the Google Fonts catalogue, or ask again.");
    }
    // the text face is the design's family; a role that wants another one says so
    var shared = found.paragraph;
    state.type.family = "g:" + shared;
    ROLES.forEach(function (r) {
      var n = found[r];
      if (state.type.google.indexOf(n) < 0) state.type.google.push(n);
      loadGoogleFont(n);
      if (n === shared) delete state.type.roles[r].family;
      else state.type.roles[r].family = "g:" + n;
      var w = v.weights && v.weights[r];
      if (w) state.type.roles[r].weight = clamp(Math.round(w), 100, 900);
    });
    buildFamilySelect();
    var names = [];
    ROLES.forEach(function (r) { if (names.indexOf(found[r]) < 0) names.push(found[r]); });
    return names.length === 1 ? names[0] + " throughout."
      : ROLES.map(function (r) { return ROLE_NAMES[r].toLowerCase() + " in " + found[r]; }).join(", ") + ".";
  }

  /* What the logo occupies, worked out here rather than left to be derived from
     the state: the app has the geometry exactly, and the answer is given in rows
     and columns, so the conclusion is handed over in rows and columns. */
  function aiLogoNote() {
    var lg = state.logo;
    if (!lg.visible) {
      return "There is no logo on this format — nothing is reserved at the top, so use the whole " +
        "margin box. Switch it on in the answer if the design wants one.";
    }
    var b = box("logo"), c = content(), u = baseline(), step = colStep(), n = colCount();
    var pseudo = { grid: 1, from: "top" };
    var r0 = Math.max(0, rowAt(b.y, pseudo)), r1 = Math.max(r0, rowAt(b.y + b.h, pseudo));
    var c0 = clamp(Math.floor((b.x - c.x) / step) + 1, 1, n);
    var c1 = clamp(Math.ceil((b.x + b.w - c.x) / step), 1, n);
    return "The logo is on this format: " + fmt(b.w) + " × " + fmt(b.h) + " at " + fmt(b.x) + " / " +
      fmt(b.y) + ", which is rows " + r0 + " to " + r1 + " of grid 1 (" + round(u, 2) + " px a row) " +
      "and column" + (c0 === c1 ? " " + c0 : "s " + c0 + " to " + c1) + ". Lay out around it, or " +
      "move it — 'logo' in the answer says where it goes — and say in the note if something is " +
      "meant to sit over it. Its height is " + (lg.h.u === "%" ? round(lg.h.v, 2) + "% of the longest side"
        : lg.h.u === "col" ? round(lg.h.v, 2) + " columns wide" : fmt(lg.h.v) + " px") +
      (state.margin.mode === "manual"
        ? ", and you may change it: 'heightPercent' is a percentage of the format's longest side."
        : ", and it is not yours to change here — the margins are worked out from it (" +
          state.margin.factor + " × the logo " + (state.margin.mode === "logoH" ? "height" : "width") +
          "), so resizing it would move every margin this layout is measured against.");
  }

  /* ---- a layout: the blocks and the solids, in the app's own terms. Rows, not
     pixels; column choices, not coordinates. */
  function aiLayoutSchema() {
    var block = {
      type: "object",
      properties: {
        role: { type: "string", enum: ROLES.slice() },
        text: { type: "string" },
        row: { type: "integer", description: "Which line of its grid it sits on, counted from the margin it is measured from" },
        from: { type: "string", enum: ["top", "bottom"] },
        grid: { type: "string", enum: ["1", "2", "both"] },
        cols: { type: "string", enum: ["auto", "format", "rect"] },
        align: { type: "string", enum: ["left", "center", "right"] },
        padL: { type: "integer", description: "Inset from the left of the area it runs in, in px" },
        padR: { type: "integer" }
      },
      required: ["role", "text", "row", "from", "grid", "cols", "align", "padL", "padR"],
      additionalProperties: false
    };
    var solid = {
      type: "object",
      properties: {
        x: { type: "number", description: "Where its anchor point sits across the margin box, 0 at the left margin, 1 at the right" },
        y: { type: "number", description: "And down: 0 at the top margin, 1 at the bottom" },
        anchorH: { type: "string", enum: ["left", "center", "right"] },
        anchorV: { type: "string", enum: ["top", "middle", "bottom"] },
        wmode: { type: "string", enum: ["fixed", "full", "format", "fit"] },
        hmode: { type: "string", enum: ["fixed", "full", "format"] },
        w: { type: "integer" },
        h: { type: "integer" },
        content: { type: "string", enum: ["fill", "pattern", "gradient"] },
        module: { type: "string", description: "When it is a pattern or a gradient, which module: grid, dots, stripes, checker, rings, linear, radial, conic, mesh, bands" },
        note: { type: "string" }
      },
      required: ["x", "y", "anchorH", "anchorV", "wmode", "hmode", "w", "h", "content", "module", "note"],
      additionalProperties: false
    };
    var logo = {
      type: "object",
      properties: {
        visible: { type: "boolean", description: "Whether the logo is on this format at all" },
        alignH: { type: "string", enum: H_KEYS.slice() },
        alignV: { type: "string", enum: V_KEYS.slice() },
        anchorH: { type: "string", enum: H_KEYS.slice(), description: "Which point of the logo lands on that place" },
        anchorV: { type: "string", enum: V_KEYS.slice() },
        heightPercent: { type: "number", description: "Its height as a percentage of the format's longest side. Ignored while the margins are worked out from the logo." }
      },
      required: ["visible", "alignH", "alignV", "anchorH", "anchorV", "heightPercent"],
      additionalProperties: false
    };
    return {
      type: "object",
      properties: {
        logo: logo,
        solids: { type: "array", items: solid },
        blocks: { type: "array", items: block },
        note: { type: "string" }
      },
      required: ["logo", "solids", "blocks", "note"],
      additionalProperties: false
    };
  }
  function aiAskLayout() {
    var KIND = "layout", st = state.stage, u = baseline();
    var user = aiTokenPayload() + "\n\nThe brief: " + (aiBrief(KIND) || "none given — read the system itself.") +
      "\n\nLay this format out: " + fmt(st.w) + " × " + fmt(st.h) + ", margins " +
      SIDES.map(function (side) { return fmt(margins()[side]); }).join(" / ") + ", " + colCount() +
      " columns, grid 1 is " + round(u, 2) + " px a row and there are " + gridRows() +
      " rows between the top and bottom margins (grid 2 is the half lines between them, so a block on " +
      "'both' has " + gridRows() * 2 + " lines to sit on).\n\n" +
      "Give the text blocks and the solids. A block sits on a line of its grid counted from the top " +
      "or the bottom margin — that is 'row' and 'from' — and it is the app that turns that into a " +
      "position, so nothing you give can land off the grid. Write real copy for each block in " +
      "'text', in the brief's language, as long as the role deserves. Keep it to what the format can " +
      "hold: a poster is not a paragraph of body text. A solid is a block of colour or a frame of " +
      "pattern or gradient; give none at all if the layout is better without one.\n\n" +
      aiLogoNote();
    aiAsk("layout", "a layout", aiLayoutSchema(), aiSystemText(), user);
  }
  function aiApplyLayout(v) {
    var blocks = (v.blocks || []).filter(function (b) { return ROLES.indexOf(b.role) >= 0; });
    if (!blocks.length && !(v.solids || []).length) throw new Error("The answer held no layout.");
    var d = defaults();
    state.solids = (v.solids || []).slice(0, 6).map(function (r) {
      var one = normaliseSolid({ placed: true }, d);
      one.pos = { x: num(r.x, 0.5), y: num(r.y, 0.5) };
      one.anchor = {
        h: ["left", "center", "right"].indexOf(r.anchorH) >= 0 ? r.anchorH : "center",
        v: ["top", "middle", "bottom"].indexOf(r.anchorV) >= 0 ? r.anchorV : "middle"
      };
      one.wmode = r.wmode || "fixed";
      one.hmode = r.hmode || "fixed";
      one.w = Math.max(MIN_SIZE, num(r.w, 520));
      one.h = Math.max(MIN_SIZE, num(r.h, 360));
      one.content = r.content === "pattern" || r.content === "gradient" ? r.content : "fill";
      if (one.content !== "fill") {
        one.module = bgModule(one.content, r.module).id;
        one.fill = "#232834";
      }
      return one;
    });
    useSolid(0);
    state.text.blocks = blocks.slice(0, 12).map(function (b) {
      var one = newBlock(b.role);
      one.text = String(b.text || one.text);
      one.blind = 0;
      one.row = Math.max(0, Math.round(num(b.row, one.row)));
      one.from = b.from === "bottom" ? "bottom" : "top";
      one.grid = b.grid === "1" ? 1 : b.grid === "2" ? 2 : "both";
      one.cols = ["auto", "format", "rect"].indexOf(b.cols) >= 0 ? b.cols : "auto";
      one.align = ["left", "center", "right"].indexOf(b.align) >= 0 ? b.align : "left";
      one.padL = Math.max(0, num(b.padL, 0));
      one.padR = Math.max(0, num(b.padR, 0));
      return one;
    });
    state.selBlock = -1;
    inspectorFor = -1;
    var stack = liveStack();
    if (stack) stack.dataset.sig = "";

    var lg = v.logo, moved = "";
    if (lg) {
      state.logo.visible = !!lg.visible;
      if (H_KEYS.indexOf(lg.alignH) >= 0 && V_KEYS.indexOf(lg.alignV) >= 0) setAlign("logo", lg.alignH, lg.alignV);
      if (H_KEYS.indexOf(lg.anchorH) >= 0 && V_KEYS.indexOf(lg.anchorV) >= 0) {
        state.logo.anchor = { h: lg.anchorH, v: lg.anchorV };
      }
      /* Its height is only the answer's to give while the margins are set by hand:
         in a logo mode the margins are worked out from it, so resizing it here would
         move the box this very layout was measured against. The unit it is held in
         is the user's, so a percentage is written back in that unit. */
      if (state.margin.mode === "manual" && isFinite(lg.heightPercent) && state.logo.h.u !== "col") {
        var pct = clamp(num(lg.heightPercent, state.logo.h.v), 0.5, 100);
        state.logo.h = state.logo.h.u === "px"
          ? { v: snap(pct / 100 * longSide()), u: "px" }
          : { v: round(pct, 2), u: "%" };
      }
      moved = state.logo.visible
        ? ", logo " + state.logo.align.v + " " + state.logo.align.h
        : ", no logo";
    }
    return state.text.blocks.length + " blocks and " + state.solids.length +
      (state.solids.length === 1 ? " solid" : " solids") + " placed" + moved + ".";
  }

  function aiApply(kind) {
    if (!aiPending || aiPending.kind !== kind) return;
    var v = aiPending.value;
    try {
      var said = kind === "scheme" ? aiApplyScheme(v)
        : kind === "fonts" ? aiApplyFonts(v)
        : aiApplyLayout(v);
      aiPending = null;
      $("#ai-" + kind + "-result").hidden = true;
      aiStatus(said + " ⌘/Ctrl + Z takes it back.", "ok", kind);
    } catch (err) {
      aiStatus(String(err.message || err), "err", kind);
    }
    render();
  }

  /* Three boxes, one set of handlers: the click tells us which question it came
     from, and the settings they share are written once and shown in all of them. */
  function bindClaude() {
    aiBoot();
    var ASK = { scheme: aiAskScheme, fonts: aiAskFonts, layout: aiAskLayout };
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-ai],[data-ai-go],[data-ai-apply],[data-ai-discard]") : null;
      if (!t) return;
      if (t.dataset.aiGo) return (ASK[t.dataset.aiGo] || function () {})();
      if (t.dataset.aiApply) return aiApply(t.dataset.aiApply);
      if (t.dataset.aiDiscard) {
        aiPending = null;
        $("#ai-" + t.dataset.aiDiscard + "-result").hidden = true;
        return aiStatus("Discarded.", null, t.dataset.aiDiscard);
      }
      if (t.dataset.ai === "pick") return aiPickFile();
      if (t.dataset.ai === "local") return void aiTryLocalFile(true).then(render);
      if (t.dataset.ai === "forget") {
        aiKey = ""; aiFrom = ""; aiHandle = null;
        try { localStorage.removeItem(AI_LOCAL_FLAG); } catch (err) {}
        return void aiForgetHandle().then(function () {
          aiKeyStatus("Forgotten — the key was never stored, and the file is no longer remembered.");
        });
      }
    });
    document.addEventListener("input", function (e) {
      var t = e.target;
      if (t.dataset && t.dataset.aiBrief) {
        state.ai.briefs[t.dataset.aiBrief] = t.value;
        return render();
      }
      if (t.dataset && t.dataset.ai === "endpoint") {
        state.ai.endpoint = t.value.trim();
        return render();
      }
    });
    document.addEventListener("change", function (e) {
      if (e.target.dataset && e.target.dataset.ai === "model") {
        state.ai.model = e.target.value;
        render();
      }
    });
    $("#ai-file").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!f) return;
      f.text().then(function (text) { aiTakeKey(text, f.name); });
    });
  }

  /* ------------------------------------------------------------------ boot */

  cacheEls();
  buildCornerRows();
  buildShapeSelect();
  buildPresetSelect();
  buildFormatSelect();
  buildTypeSelects();
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
  familiesInUse().forEach(function (id) {
    if (id.indexOf("g:") === 0) loadGoogleFont(id.slice(2));
  });
  $("#gf-key").value = gfKey;
  bindPanel();
  bindClaude();
  bindCanvas();
  render();
})();
