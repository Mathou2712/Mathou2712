import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Info, Search, ChevronDown, ChevronRight, ArrowLeft, ArrowDownAZ, ArrowDownZA, ArrowDown01, ArrowDown10,
  SlidersHorizontal, X, Beer, UtensilsCrossed, FerrisWheel, Target, Gift, Check, MapPin, Store,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Theme — Hermes, a Wiesn price guide.                                 */
/* Parchment page, midnight-navy ink, Bavarian blue for navigation and  */
/* deep beer gold for prices, set as festival tickets.                  */
/* Type: Barlow Condensed for punchy headings and names, Barlow for     */
/* reading and prices, Grenze Gotisch as the one Bavarian accent.       */
/* ------------------------------------------------------------------ */

// Blue-and-white lozenge pattern (Bavarian "Rautenmuster"), used as a thin accent stripe
const RAUTEN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='20'%3E%3Cpath d='M6 0L12 10L6 20L0 10Z' fill='%23005293'/%3E%3C/svg%3E\")";

// Fine paper grain for the parchment background
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.04 0 0 0 0 0.09 0 0 0 0 0.18 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&family=Grenze+Gotisch:wght@700&display=swap');
:root{
  --bg:#F4F1EA; --surface:#FBF9F4; --press:#F0E9DF; --ink:#0A192F; --muted:#5B6578; --hair:rgba(10,25,47,.12);
  --blue:#005293; --sky:#0066B3; --blue-ink:#005293; --blue-soft:#EAF1F8; --on-blue:#FBF9F4;
  --gold:#D4AF37; --gold-deep:#B98C1F; --gold-soft:#F5E8B9; --gold-ink:#785514; --on-gold:#0A192F;
  --danger:#A3261C; --scrim:rgba(10,25,47,.5);
  --hh:calc(60px + env(safe-area-inset-top,0px));
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0A192F; --surface:#112443; --press:#18305A; --ink:#F4F1EA; --muted:#9DA9BC; --hair:rgba(244,241,234,.12);
    --blue:#3D8BD6; --sky:#5AA2E6; --blue-ink:#8CC0F0; --blue-soft:#163257; --on-blue:#FBF9F4;
    --gold:#D4AA45; --gold-deep:#E0B957; --gold-soft:#3A2F14; --gold-ink:#E6C46C; --on-gold:#0A192F;
    --danger:#F2A099; --scrim:rgba(0,0,0,.65);
    color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#0A192F; --surface:#112443; --press:#18305A; --ink:#F4F1EA; --muted:#9DA9BC; --hair:rgba(244,241,234,.12);
  --blue:#3D8BD6; --sky:#5AA2E6; --blue-ink:#8CC0F0; --blue-soft:#163257; --on-blue:#FBF9F4;
  --gold:#D4AA45; --gold-deep:#E0B957; --gold-soft:#3A2F14; --gold-ink:#E6C46C; --on-gold:#0A192F;
  --danger:#F2A099; --scrim:rgba(0,0,0,.65);
  color-scheme:dark;
}

/* One-screen app shell: the page never scrolls, only each screen's content area */
html{box-sizing:border-box;}
html,body,#root{height:100%;}
html,body{overflow:hidden;}
body{background-color:var(--bg);background-image:${GRAIN};color:var(--ink);
  font-family:'Barlow',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;}
h1,h2,h3{text-wrap:balance}

.f-display{font-family:'Barlow Condensed','Arial Narrow',system-ui,sans-serif;}
.f-gothic{font-family:'Grenze Gotisch',Georgia,'Times New Roman',serif;}
.f-eyebrow{font-family:'Barlow Condensed','Arial Narrow',system-ui,sans-serif;font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;}
.tabular{font-variant-numeric:tabular-nums}

.h-gutter{padding-left:max(18px,env(safe-area-inset-left,0px));padding-right:max(18px,env(safe-area-inset-right,0px));}
.h-scroll{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}
.h-scroll-pad{padding-bottom:calc(36px + env(safe-area-inset-bottom,0px));}
.h-rauten{background-color:#FFFFFF;background-image:${RAUTEN};background-size:12px 20px;}

/* Simple app bars: clean, solid, and practical */
.h-glass{background:rgba(244,241,234,.98);}
.h-hairline{box-shadow:0 1px 0 var(--hair);}

/* iOS-style grouped list: one surface, inset hairline dividers */
.h-group{background:var(--surface);border-radius:18px;overflow:hidden;}
.h-group > li{position:relative;}
.h-group > li + li::before{content:"";position:absolute;top:0;left:16px;right:0;height:1px;background:var(--hair);z-index:1;}

/* Festival ticket price badge: clear, tactile, and less gimmicky */
.h-ticket{position:relative;display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 12px;border-radius:999px;
  background:linear-gradient(180deg,#E8C05C,#D4AF37);color:var(--on-gold);white-space:nowrap;box-shadow:inset 0 0 0 1px rgba(10,25,47,.12);}
.h-ticket::after{display:none;}
.h-ticket-best{background:var(--ink);color:var(--gold);box-shadow:inset 0 0 0 1px rgba(212,175,55,.22);}
.h-ticket-label{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;}
.h-ticket-price{font-weight:700;font-size:15px;font-variant-numeric:tabular-nums;}

.h-chips{scrollbar-width:none;-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);}
.h-chips::-webkit-scrollbar{display:none}
input[type="search"]::-webkit-search-cancel-button{-webkit-appearance:none;display:none}
.h-range{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:999px;cursor:pointer;
  background:linear-gradient(var(--blue),var(--blue)) 0/var(--fill,50%) 100% no-repeat,var(--hair);}
.h-range::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:var(--gold);border:4px solid var(--surface);box-shadow:0 1px 4px rgba(10,25,47,.35);transition:transform .15s;}
.h-range:active::-webkit-slider-thumb{transform:scale(1.12);}
.h-range::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--gold);border:4px solid var(--surface);box-shadow:0 1px 4px rgba(10,25,47,.35);}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
@media (prefers-reduced-motion: reduce){*{transition-duration:0s !important}}
`;

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* Realistic sample prices in line with recent Wiesn price ranges.      */
/* Replace with the official price list before a public launch.         */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  {
    id: "drinks", label: "Drinks", kind: "products", icon: Beer,
    subs: [
      { id: "all", label: "All Drinks", short: "All" },
      { id: "alcoholic", label: "Alcoholic Drinks", short: "Alcoholic" },
      { id: "non-alcoholic", label: "Non-Alcoholic Drinks", short: "Non-Alcoholic" },
    ],
  },
  {
    id: "foods", label: "Foods", kind: "products", icon: UtensilsCrossed,
    subs: [
      { id: "all", label: "All Foods", short: "All" },
      { id: "vegetarian", label: "Vegetarian Food", short: "Vegetarian" },
      { id: "non-vegetarian", label: "Non-Vegetarian Food", short: "Non-Vegetarian" },
    ],
  },
  {
    id: "rides", label: "Rides", kind: "places", icon: FerrisWheel,
    subs: [
      { id: "all", label: "All Rides", short: "All" },
      { id: "adult", label: "Adult-Friendly Rides", short: "Adult-Friendly" },
      { id: "family", label: "Family-Friendly Rides", short: "Family-Friendly" },
    ],
  },
  {
    id: "games", label: "Games", kind: "places", icon: Target,
    subs: [
      { id: "all", label: "All Games", short: "All" },
      { id: "adult", label: "Adult-Friendly Games", short: "Adult-Friendly" },
      { id: "family", label: "Family-Friendly Games", short: "Family-Friendly" },
    ],
  },
  { id: "merch", label: "Souvenirs", kind: "places", icon: Gift, subs: [{ id: "all", label: "All Souvenirs", short: "All" }] },
];
const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// The 17 festival tents compared for every drink and food — [id, name, type, location]
const VENDORS = Object.fromEntries(
  [
    ["schottenhamel", "Schottenhamel-Festhalle", "Large beer tent", "Wirtsbudenstraße"],
    ["hofbraeu", "Hofbräu-Festzelt", "Large beer tent", "Wirtsbudenstraße"],
    ["armbrust", "Armbrustschützenzelt", "Large beer tent", "Wirtsbudenstraße"],
    ["kuffler", "Kufflers Weinzelt", "Wine tent", "Wirtsbudenstraße"],
    ["ochsenbraterei", "Ochsenbraterei", "Large beer tent", "Wirtsbudenstraße"],
    ["loewenbraeu", "Löwenbräu-Festzelt", "Large beer tent", "Matthias-Pschorr-Straße"],
    ["braeurosl", "Bräurosl", "Large beer tent", "Matthias-Pschorr-Straße"],
    ["augustiner", "Augustiner-Festhalle", "Large beer tent", "Wirtsbudenstraße"],
    ["paulaner", "Paulaner Festzelt Winzerer Fähndl", "Large beer tent", "Wirtsbudenstraße"],
    ["hacker", "Hacker-Festzelt", "Large beer tent", "Wirtsbudenstraße"],
    ["fischervroni", "Fischer-Vroni", "Large beer tent", "Wirtsbudenstraße"],
    ["kaefer", "Käfer Wiesn-Schänke", "Small tent", "Wirtsbudenstraße"],
    ["marstall", "Marstall", "Large beer tent", "Wirtsbudenstraße"],
    ["schuetzen", "Schützen-Festzelt", "Large beer tent", "Below the Bavaria statue"],
    ["schichtl", "Wirtshaus im Schichtl", "Small tent", "Wirtsbudenstraße"],
    ["tradition", "Festzelt Tradition", "Large beer tent", "Oide Wiesn"],
    ["herzkasperl", "Herzkasperl Festzelt", "Large beer tent", "Oide Wiesn"],
  ].map(([id, name, type, location]) => [id, { id, name, type, location }])
);
const TENTS = Object.keys(VENDORS);

// Deterministic 0..1 value so sample prices stay stable between renders
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

// One price per tent inside [min, max]: the cheapest tent costs `min`, the dearest `max`
function priceList(productId, min, max) {
  const list = TENTS.map((v) => ({
    vendorId: v,
    price: Math.round((min + seeded(productId + v) * (max - min)) * 10) / 10,
  }));
  list.sort((a, b) => a.price - b.price);
  list[0].price = min;
  list[list.length - 1].price = max;
  return list;
}

// [id, name, category, sub-category, min €, max €, search aliases]
const PRODUCTS = [
  ["mass", "Wiesn Maß (Festbier, 1 L)", "drinks", "alcoholic", 14.5, 15.8, ["beer", "mass", "masskrug", "festbier", "helles"]],
  ["af-weissbier", "Alcohol-Free Weissbier", "drinks", "non-alcoholic", 9.2, 11, ["beer", "weissbeer", "weißbier", "non-alcoholic"]],
  ["apfelschorle", "Apfelschorle (1 L)", "drinks", "non-alcoholic", 9.2, 11, ["apple", "spritzer", "juice", "schorle"]],
  ["radler", "Radler Maß (1 L)", "drinks", "alcoholic", 14.5, 15.8, ["beer", "shandy", "lemonade"]],
  ["weisswein", "Weißwein (0.2 L)", "drinks", "alcoholic", 9.5, 13.9, ["white wine", "wine", "weisswein"]],
  ["rotwein", "Rotwein (0.2 L)", "drinks", "alcoholic", 9.5, 13.9, ["red wine", "wine"]],
  ["schnaps", "Schnaps (2 cl)", "drinks", "alcoholic", 5.5, 8.5, ["shot", "obstler", "enzian"]],
  ["coffee", "Coffee", "drinks", "non-alcoholic", 4.2, 5.8, ["kaffee"]],
  ["hot-chocolate", "Hot Chocolate", "drinks", "non-alcoholic", 4.9, 6.5, ["kakao", "chocolate"]],

  ["hendl", "Hendl (½ grilled chicken)", "foods", "non-vegetarian", 16.5, 21.5, ["chicken", "roast chicken", "hendl"]],
  ["bratwurst", "Bratwurst with sauerkraut", "foods", "non-vegetarian", 10.5, 14.5, ["sausage", "wurst"]],
  ["leberkaese", "Leberkäse with potato salad", "foods", "non-vegetarian", 11.9, 15.5, ["meatloaf", "leberkase"]],
  ["brezn", "Brezn (giant pretzel)", "foods", "vegetarian", 6.5, 8.5, ["pretzel", "breze", "bread"]],
  ["obatzda", "Obatzda with Brezn", "foods", "vegetarian", 12.9, 16.9, ["cheese", "spread"]],
  ["kaesespaetzle", "Käsespätzle", "foods", "vegetarian", 15.5, 19.5, ["cheese", "noodles", "kasespatzle"]],
  ["kaiserschmarrn", "Kaiserschmarrn", "foods", "vegetarian", 14.5, 18.9, ["dessert", "pancake", "sweet"]],
  ["apfelstrudel", "Apfelstrudel with vanilla sauce", "foods", "vegetarian", 9.2, 12.5, ["apple", "dessert", "strudel"]],
].map(([id, name, category, sub, min, max, aliases]) => ({
  id, name, category, sub, aliases,
  prices: priceList(id, min, max),
}));

// Rides, games and souvenirs are the vendors themselves — [id, name, category, sub, from €, type, location]
const PLACES = [
  ["riesenrad", "Riesenrad", "rides", "family", 10, "Ferris wheel", "Schaustellerstraße"],
  ["olympia-looping", "Olympia Looping", "rides", "adult", 12, "Roller coaster", "Schaustellerstraße"],
  ["bayern-tower", "Bayern Tower", "rides", "adult", 10, "Drop tower", "Schaustellerstraße"],
  ["skyfall", "SkyFall", "rides", "adult", 10, "Drop tower", "Schaustellerstraße"],
  ["chaos-pendel", "Chaos Pendel", "rides", "adult", 10, "Pendulum ride", "Schaustellerstraße"],
  ["flip-fly", "Flip Fly", "rides", "adult", 9, "Giant swing", "Schaustellerstraße"],
  ["hexenschaukel", "Hexenschaukel", "rides", "adult", 8, "Haunted swing", "Schaustellerstraße"],
  ["jules-verne", "Jules Verne Tower", "rides", "family", 7, "Chain swing tower", "Schaustellerstraße"],
  ["krinoline", "Krinoline", "rides", "family", 5, "Historic carousel", "Schaustellerstraße"],
  ["rutschn", "Münchner Rutschn", "rides", "family", 5, "Giant slide", "Matthias-Pschorr-Straße"],
  ["teufelsrad", "Teufelsrad", "rides", "family", 5, "Spinning disc", "Schaustellerstraße"],
  ["toboggan", "Toboggan", "rides", "family", 6, "Tower slide", "Schaustellerstraße"],

  ["schiessbude", "Schießbude", "games", "adult", 5, "Shooting gallery", "Schaustellerstraße"],
  ["hau-den-lukas", "Hau den Lukas", "games", "adult", 3, "Strength tester", "Oide Wiesn"],
  ["dosenwerfen", "Dosenwerfen", "games", "family", 4, "Can toss", "Schaustellerstraße"],
  ["ringwerfen", "Ringwerfen", "games", "family", 4, "Ring toss", "Matthias-Pschorr-Straße"],
  ["losbude", "Losbude", "games", "family", 2, "Lottery booth", "Wirtsbudenstraße"],
  ["entenangeln", "Entenangeln", "games", "family", 3, "Duck fishing", "Oide Wiesn"],

  ["lebkuchenherz", "Lebkuchenherz", "merch", "all", 5, "Gingerbread stand", "Wirtsbudenstraße"],
  ["masskrug", "Official Wiesn Maßkrug", "merch", "all", 19.9, "Souvenir stand", "Wirtsbudenstraße"],
  ["trachtenhut", "Trachtenhut", "merch", "all", 25, "Hat stand", "Matthias-Pschorr-Straße"],
  ["wiesn-pin", "Official Wiesn Pin", "merch", "all", 9.9, "Souvenir stand", "Schaustellerstraße"],
  ["wiesn-shirt", "Wiesn T-Shirt", "merch", "all", 19.9, "Souvenir stand", "Schaustellerstraße"],
  ["pluesch-loewe", "Plush Lion", "merch", "all", 14.9, "Plush toy stand", "Oide Wiesn"],
].map(([id, name, category, sub, from, type, location]) => ({ id, name, category, sub, from, type, location }));

// Rows rendered per "Show more" step, so long lists don't overwhelm
const PAGE_SIZE = 8;

const fromPrice = (product) => Math.min(...product.prices.map((p) => p.price));
const formatPrice = (v) => `€${Number.isInteger(v) ? v : v.toFixed(2)}`;
const formatInput = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

function itemsFor(categoryId, subId) {
  const pool = CATEGORY_BY_ID[categoryId].kind === "products" ? PRODUCTS : PLACES;
  return pool.filter((p) => p.category === categoryId && (subId === "all" || p.sub === subId));
}

const SEARCH_INDEX = [
  ...PRODUCTS.map((p) => ({ ...p, from: fromPrice(p), terms: [p.name, ...p.aliases] })),
  ...PLACES.map((p) => ({ ...p, terms: [p.name, p.type] })),
].map((e) => ({ ...e, haystack: e.terms.join(" ").toLowerCase() }));

/* ------------------------------------------------------------------ */
/* Illustrations                                                        */
/* ------------------------------------------------------------------ */

function PretzelMark({ size = 56, className = "" }) {
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 64 55" fill="none" aria-hidden="true" className={className}>
      <path
        d="M20 50 C6 47 2 33 7 23 C12 12 26 9 33 18 C38 25 34 35 27 41 L18 49 M44 50 C58 47 62 33 57 23 C52 12 38 9 31 18 C26 25 30 35 37 41 L46 49"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="var(--surface)">
        <circle cx="12" cy="27" r="1.3" /><circle cx="22" cy="16" r="1.3" /><circle cx="52" cy="28" r="1.3" />
        <circle cx="41" cy="15" r="1.3" /><circle cx="25" cy="44" r="1.3" /><circle cx="40" cy="44" r="1.3" />
      </g>
    </svg>
  );
}

function MugMark({ size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M44 27h5a7 7 0 0 1 7 7v6a7 7 0 0 1-7 7h-5" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M13 22h31v32a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V22Z" fill="var(--gold)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M21 31v18M28.5 31v18M36 31v18" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M11 23c-2-5 2-10 7-9 1-5 8-7 12-3 3-3 10-2 11 3 5-1 8 4 6 9H11Z"
        fill="var(--surface)"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                      */
/* ------------------------------------------------------------------ */

// Lets the screen below tell the frosted header when content has scrolled under it
const HeaderLineContext = createContext(() => {});

function Header({ onHome, onInfo, hairline }) {
  return (
    <header className={`h-glass absolute inset-x-0 top-0 z-30 transition-shadow ${hairline ? "h-hairline" : ""}`}>
      <div className="h-rauten h-1" aria-hidden="true" />
      <div className="h-gutter" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="mx-auto flex h-14 max-w-[560px] items-center justify-between">
          <button
            type="button"
            onClick={onHome}
            aria-label="Hermes, go to start"
            className="flex items-center gap-2.5 rounded-lg transition-transform active:scale-95"
          >
            <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-[11px] bg-[var(--gold)] text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(10,25,47,0.08)]">
              <Beer size={18} strokeWidth={2.2} />
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="f-gothic text-[22px] leading-none text-[var(--blue-ink)]">Hermes</span>
              <span className="f-eyebrow -mt-0.5 text-[9px] tracking-[0.12em] text-[var(--muted)]">WIESN PRICE GUIDE</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onInfo}
            aria-label="About Hermes"
            className="grid h-10 w-10 place-items-center rounded-full text-[var(--ink)] transition-[background-color,transform] hover:bg-[var(--press)] active:scale-90"
          >
            <Info size={21} strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </header>
  );
}

// The only scrolling element on a screen. It starts under the frosted header;
// `pinned` content sticks just below the header and the list slides under both.
const ScrollArea = React.forwardRef(function ScrollArea({ label, pinned, children }, ref) {
  const [scrolled, setScrolled] = useState(false);
  const setHeaderLine = useContext(HeaderLineContext);

  useEffect(() => {
    setHeaderLine(false);
  }, [setHeaderLine]);

  const onScroll = (e) => {
    const s = e.currentTarget.scrollTop > 4;
    if (s === scrolled) return;
    setScrolled(s);
    if (!pinned) setHeaderLine(s);
  };

  return (
    <div ref={ref} onScroll={onScroll} role="region" aria-label={label} tabIndex={0} className="h-scroll min-h-0 flex-1 focus:outline-none">
      <div aria-hidden="true" style={{ height: "var(--hh)" }} />
      {pinned && (
        <div
          className={`h-glass sticky z-10 transition-shadow ${scrolled ? "h-hairline" : ""}`}
          style={{ top: "var(--hh)" }}
        >
          <div className="h-gutter">
            <div className="mx-auto max-w-[560px] pb-3 pt-1">{pinned}</div>
          </div>
        </div>
      )}
      <div className="h-gutter">
        <div className="h-scroll-pad mx-auto max-w-[560px]">{children}</div>
      </div>
    </div>
  );
});

function CategoryIcon({ category, size = "md" }) {
  const Icon = category.icon;
  const box = size === "sm" ? "h-7 w-7 rounded-[9px]" : "h-10 w-10 rounded-[12px]";
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center bg-[var(--blue)] text-[#F4E2B0] ${box}`}>
      <Icon size={size === "sm" ? 15 : 20} strokeWidth={2.1} />
    </span>
  );
}

function PriceTicket({ price, label, best }) {
  return (
    <span className={`h-ticket ${best ? "h-ticket-best" : ""}`}>
      {label && <span className="h-ticket-label">{label}</span>}
      <span className="h-ticket-price">{formatPrice(price)}</span>
    </span>
  );
}

// Category selector: a filled field that opens a search box over an inset, iOS-style option list
function Dropdown({ id, label, value, options, onChange, searchPlaceholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.id === value);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.id === value)));
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };
  const choose = (option) => {
    onChange(option.id);
    close();
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div ref={rootRef} className={`relative ${open ? "z-20" : ""}`}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selected?.label ?? ""}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center gap-3 rounded-[14px] bg-[var(--surface)] pl-2.5 pr-3.5 text-left transition-[background-color,transform] active:scale-[.98] active:bg-[var(--press)]"
      >
        {selected?.icon && <CategoryIcon category={selected} size="sm" />}
        <span className="f-display min-w-0 flex-1 truncate text-[19px] font-bold uppercase tracking-[.03em]">{selected?.label}</span>
        <span className="f-eyebrow hidden text-[var(--muted)] min-[360px]:inline">Change</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-[var(--blue-ink)]">
          <ChevronDown size={18} strokeWidth={2.5} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-[18px] bg-[var(--surface)] shadow-[0_12px_28px_-12px_rgba(10,25,47,.28)]"
          >
            <div className="relative p-2">
              <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-list`}
                aria-activedescendant={filtered[active] ? `${id}-opt-${filtered[active].id}` : undefined}
                aria-label={`Filter ${label.toLowerCase()} options`}
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-[11px] bg-[var(--press)] pl-9 pr-3 text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
              />
            </div>
            <ul id={`${id}-list`} role="listbox" aria-label={label} className="h-group rounded-none">
              {filtered.map((o, i) => {
                const isSelected = o.id === value;
                return (
                  <li
                    key={o.id}
                    id={`${id}-opt-${o.id}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(o)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${i === active ? "bg-[var(--press)]" : ""}`}
                  >
                    {o.icon && <CategoryIcon category={o} size="sm" />}
                    <span className={`f-display flex-1 text-[18px] font-semibold ${isSelected ? "text-[var(--blue-ink)]" : ""}`}>{o.label}</span>
                    {isSelected && <Check size={18} strokeWidth={2.75} aria-hidden="true" className="text-[var(--blue-ink)]" />}
                  </li>
                );
              })}
              {!filtered.length && <li className="px-4 py-3 text-sm text-[var(--muted)]">No category matches “{query.trim()}”.</li>}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkRow({ name, price, onClick }) {
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[58px] w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-[var(--press)]"
      >
        <span className="f-display min-w-0 flex-1 text-[19px] font-semibold leading-tight">{name}</span>
        <PriceTicket price={price} label="from" />
        <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" className="-mr-1 shrink-0 text-[var(--muted)]" />
      </button>
    </motion.li>
  );
}

function ExpandRow({ id, name, price, showFrom, best, type, location, expanded, onToggle }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-row={id}
      className={`transition-colors ${expanded ? "bg-[var(--blue-soft)]" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`${id}-details`}
        className="flex min-h-[58px] w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-[var(--press)]"
      >
        <span className={`f-display min-w-0 flex-1 text-[19px] font-semibold leading-tight ${expanded ? "text-[var(--blue-ink)]" : ""}`}>
          {name}
        </span>
        <PriceTicket price={price} label={best ? "Best" : showFrom ? "from" : null} best={best} />
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="-mr-1 shrink-0 text-[var(--muted)]">
          <ChevronDown size={18} strokeWidth={2.5} aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`${id}-details`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-1.5 px-4 pb-4 text-[15px]">
              <Store size={15} aria-hidden="true" className="text-[var(--blue-ink)]" />
              <div><dt className="sr-only">Type</dt><dd>{type}</dd></div>
              <MapPin size={15} aria-hidden="true" className="text-[var(--blue-ink)]" />
              <div><dt className="sr-only">Location</dt><dd className="font-semibold">{location}</dd></div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function BudgetPopup({ open, max, value, onClose, onApply }) {
  const [draft, setDraft] = useState(value ?? max);
  const [text, setText] = useState(formatInput(value ?? max));
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Reset the draft only when the popup opens, so typing is never overwritten
  useEffect(() => {
    if (!open) return;
    const start = Math.min(value ?? max, max);
    setDraft(start);
    setText(formatInput(start));
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const typed = parseFloat(text.replace(",", "."));
  const outOfRange = text.trim() !== "" && (Number.isNaN(typed) || typed < 0 || typed > max);

  const onSlide = (n) => {
    setDraft(n);
    setText(formatInput(n));
  };
  // Typed text drives the slider whenever it parses to a number
  const onType = (raw) => {
    if (!/^\d*([.,]\d{0,2})?$/.test(raw)) return;
    setText(raw);
    const n = parseFloat(raw.replace(",", "."));
    if (!Number.isNaN(n)) setDraft(Math.min(Math.max(n, 0), max));
  };
  const apply = () => onApply(draft >= max ? null : Math.round(draft * 100) / 100);

  const pct = max ? (draft / max) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="h-gutter fixed inset-0 z-40 flex items-start justify-center"
          style={{ paddingTop: "calc(var(--hh) + 28px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[var(--scrim)]" onClick={onClose} aria-hidden="true" />
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-title"
            aria-describedby="budget-desc"
            onSubmit={(e) => {
              e.preventDefault();
              apply();
            }}
            initial={{ y: -18, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 430, damping: 32 }}
            className="relative w-full max-w-[380px] overflow-hidden rounded-[24px] bg-[var(--surface)] px-6 pb-6 pt-7 shadow-[0_24px_60px_-18px_rgba(10,25,47,.55)]"
          >
            <div className="h-rauten absolute inset-x-0 top-0 h-1" aria-hidden="true" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full text-[var(--muted)] transition-[background-color,transform] hover:bg-[var(--press)] active:scale-90"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <p className="f-eyebrow text-[var(--gold-ink)]">Your budget</p>
            <h2 id="budget-title" className="f-display mt-1 text-[28px] font-extrabold uppercase leading-none tracking-[.01em]">
              Maximum price
            </h2>
            <p id="budget-desc" className="mt-2 pr-8 text-[15px] leading-snug text-[var(--muted)]">
              Set your maximum price to see available vendors.
            </p>

            <label htmlFor="budget-range" className="sr-only">Maximum price slider</label>
            <input
              id="budget-range"
              type="range"
              min={0}
              max={max}
              step={0.1}
              value={draft}
              onChange={(e) => onSlide(Number(e.target.value))}
              className="h-range mt-7"
              style={{ "--fill": `${pct}%` }}
            />

            <div className="tabular mt-4 flex items-center justify-between gap-3 text-[15px] font-semibold text-[var(--muted)]">
              <span>€0</span>
              {/* The ticket's notch mask would clip an outline, so the focus ring sits on this wrapper */}
              <span
                className={`rounded-lg p-[3px] transition-shadow ${
                  outOfRange ? "shadow-[0_0_0_2px_var(--danger)]" : "focus-within:shadow-[0_0_0_2px_var(--blue)]"
                }`}
              >
              <label className="h-ticket h-11 cursor-text gap-1 px-4">
                <span aria-hidden="true" className="text-lg font-bold">€</span>
                <input
                  id="budget-input"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  aria-label="Maximum price in euros"
                  aria-describedby="budget-hint"
                  aria-invalid={outOfRange}
                  value={text}
                  onChange={(e) => onType(e.target.value)}
                  onBlur={() => setText(formatInput(draft))}
                  className="tabular w-16 min-w-0 bg-transparent text-center text-xl font-bold text-[var(--on-gold)] focus:outline-none"
                />
              </label>
              </span>
              <span>{formatPrice(max)}</span>
            </div>
            <p
              id="budget-hint"
              className={`mt-2.5 min-h-5 text-center text-[13px] ${outOfRange ? "font-semibold text-[var(--danger)]" : "text-[var(--muted)]"}`}
              aria-live="polite"
            >
              {outOfRange ? `Enter a price from €0 to ${formatPrice(max)}.` : "Drag the slider or type a price."}
            </p>

            <button
              type="submit"
              className="f-display mx-auto mt-5 block h-12 w-full rounded-full bg-[var(--gold)] text-[19px] font-bold uppercase tracking-[.06em] text-[var(--on-gold)] transition-[background-color,transform] hover:bg-[var(--gold-deep)] active:scale-95"
            >
              Show results
            </button>
            {value !== null && (
              <button
                type="button"
                onClick={() => onApply(null)}
                className="mx-auto mt-3 block rounded-md px-2 text-sm font-semibold text-[var(--blue-ink)] underline underline-offset-4 transition-transform active:scale-95"
              >
                Remove price limit
              </button>
            )}
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Screens                                                              */
/* ------------------------------------------------------------------ */

function HomeScreen({ onOpenCategory, onOpenItem }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = q ? SEARCH_INDEX.filter((e) => e.haystack.includes(q)).slice(0, 6) : [];
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, itemsFor(c.id, "all").length]));

  return (
    <ScrollArea label="Start">
      <section className="pt-7">
        <p className="f-eyebrow text-[var(--gold-ink)]">Theresienwiese · München</p>
        <h1 className="f-display mt-2 text-[46px] font-extrabold uppercase leading-[.88] tracking-[-.005em]">
          Find the best prices at
          <span className="f-gothic mt-1 block text-[1.02em] normal-case leading-[1] tracking-normal text-[var(--blue-ink)]">
            Oktoberfest
          </span>
        </h1>
        <p className="mt-4 max-w-[30ch] text-[16px] leading-snug text-[var(--muted)]">
          Search for a product, set your budget and compare vendors.
        </p>
      </section>

      <form
        role="search"
        className="relative mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (matches[0]) onOpenItem(matches[0]);
        }}
      >
        <label htmlFor="home-search" className="sr-only">Search for a product</label>
        <Search size={19} strokeWidth={2.25} aria-hidden="true" className="pointer-events-none absolute left-4 top-6 -translate-y-1/2 text-[var(--muted)]" />
        <input
          id="home-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Maß, Brezn, Riesenrad…"
          className="h-12 w-full rounded-[14px] bg-[var(--surface)] pl-11 pr-11 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--gold)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-6 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--press)] text-[var(--muted)] transition-transform active:scale-90"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}

        <AnimatePresence>
          {q && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute inset-x-0 top-[56px] z-10 overflow-hidden rounded-[18px] bg-[var(--surface)] shadow-[0_12px_28px_-12px_rgba(10,25,47,.28)]"
            >
              {matches.length ? (
                <ul aria-label="Search results" className="h-group rounded-none">
                  {matches.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => onOpenItem(m)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-[var(--press)]"
                      >
                        <CategoryIcon category={CATEGORY_BY_ID[m.category]} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="f-display block truncate text-[18px] font-semibold leading-tight">{m.name}</span>
                          <span className="block text-[13px] text-[var(--muted)]">{CATEGORY_BY_ID[m.category].label}</span>
                        </span>
                        <PriceTicket price={m.from} label="from" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 px-4 py-4">
                  <PretzelMark size={34} className="shrink-0 text-[var(--gold)]" />
                  <p className="text-[14px] leading-snug text-[var(--muted)]">
                    Nothing called “{query.trim()}” on the Wiesn. Try “Maß”, “Brezn” or “roller coaster”.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <h2 className="f-eyebrow mb-2 ml-4 mt-8 text-[var(--muted)]">Browse the Wiesn</h2>
      <nav aria-label="Categories">
        <ul className="h-group">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onOpenCategory(c.id)}
                className="flex h-[64px] w-full items-center gap-3.5 px-3.5 text-left transition-colors active:bg-[var(--press)]"
              >
                <CategoryIcon category={c} />
                <span className="f-display flex-1 text-[22px] font-bold uppercase tracking-[.03em]">{c.label}</span>
                <span className="tabular text-[14px] text-[var(--muted)]">{counts[c.id]}</span>
                <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" className="-mr-1 text-[var(--muted)]" />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex items-center justify-center gap-2 text-[13px] text-[var(--muted)]">
        <PretzelMark size={18} className="text-[var(--gold)]" />
        Sample prices in line with recent Wiesn ranges
      </div>
    </ScrollArea>
  );
}

function ListScreen({ view, maxPrice, setMaxPrice, onNavigate, onBack }) {
  const { category: categoryId, sub: subId, item: itemId, focus } = view;
  const cat = CATEGORY_BY_ID[categoryId];
  const sub = cat.subs.find((s) => s.id === subId) ?? cat.subs[0];
  const product = itemId ? PRODUCTS.find((p) => p.id === itemId) : null;
  // Vendor views: the tents selling one product, or a list of rides / games / souvenir stands
  const isVendorView = Boolean(product) || cat.kind === "places";

  const [sortDesc, setSortDesc] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [expanded, setExpanded] = useState(focus ?? null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const scrollRef = useRef(null);
  const chipsRef = useRef(null);

  // Keep the selected sub-category chip in view inside the horizontally scrolling row
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector('[aria-checked="true"]');
    if (row && chip) row.scrollLeft = Math.max(0, chip.offsetLeft - row.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2);
  }, []);

  useEffect(() => {
    if (!focus) return;
    const row = scrollRef.current?.querySelector(`[data-row="${focus}"]`);
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focus]);

  // A new sort or budget starts again from the first page, at the top of the list
  const restartList = () => {
    setLimit(PAGE_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const changeBudget = (v) => {
    setMaxPrice(v);
    restartList();
  };

  // Rows for this view, each with the price the budget filter applies to:
  // the tent's own price in a vendor list, the cheapest "from" price in a product list
  const rows = useMemo(() => {
    if (product) return product.prices.map((p) => ({ ...VENDORS[p.vendorId], price: p.price }));
    return itemsFor(categoryId, sub.id).map((i) => ({ ...i, price: cat.kind === "products" ? fromPrice(i) : i.from }));
  }, [product, categoryId, sub.id, cat.kind]);

  const priceCeiling = Math.max(20, Math.ceil(Math.max(...rows.map((r) => r.price)) / 5) * 5);

  const visible = useMemo(() => {
    const list = rows.filter((r) => maxPrice === null || r.price <= maxPrice);
    const byPrice = (a, b) => a.price - b.price || a.name.localeCompare(b.name);
    const byName = (a, b) => a.name.localeCompare(b.name);
    list.sort(product ? byPrice : byName);
    return sortDesc ? list.reverse() : list;
  }, [rows, maxPrice, sortDesc, product]);

  const bestPrice = product && visible.length ? Math.min(...visible.map((r) => r.price)) : null;

  // Show one page at a time; a search result opened from the start screen is always on the first page shown
  const focusIndex = focus ? visible.findIndex((r) => r.id === focus) : -1;
  const shown = visible.slice(0, Math.max(limit, focusIndex + 1));
  const remaining = visible.length - shown.length;

  const title = product ? product.name : sub.id === "all" ? `${cat.label} list` : sub.label;
  const countLabel = isVendorView
    ? `${visible.length} ${visible.length === 1 ? "vendor" : "vendors"} found`
    : `${visible.length} ${visible.length === 1 ? "product" : "products"}`;

  const SortIcon = product ? (sortDesc ? ArrowDown10 : ArrowDown01) : sortDesc ? ArrowDownZA : ArrowDownAZ;
  const sortLabel = product
    ? sortDesc ? "Sorted by price, highest first" : "Sorted by price, lowest first"
    : sortDesc ? "Sorted Z to A" : "Sorted A to Z";

  // Sticky controls: one category selector, then sub-category chips with the price button beside them
  const pinned = (
    <div className="flex flex-col gap-2.5">
      <Dropdown
        id="category-dropdown"
        label="Category"
        value={categoryId}
        options={CATEGORIES}
        searchPlaceholder="Search categories"
        onChange={(id) => onNavigate({ category: id, sub: "all", item: null })}
      />

      <div className="flex items-center gap-2">
        <div ref={chipsRef} role="radiogroup" aria-label="Sub-category" className="h-chips -my-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 pr-6">
          {cat.subs.map((s) => {
            const active = s.id === sub.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => !active && onNavigate({ category: categoryId, sub: s.id, item: null })}
                className={`h-9 shrink-0 rounded-full px-4 text-[14px] font-semibold transition-[background-color,color,transform] duration-150 active:scale-95 ${
                  active
                    ? "bg-[var(--ink)] text-[var(--bg)]"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--press)]"
                }`}
              >
                {s.short}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setBudgetOpen(true)}
          aria-haspopup="dialog"
          aria-label={maxPrice === null ? "Set maximum price" : `Maximum price ${formatPrice(maxPrice)}. Change`}
          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] font-bold transition-[background-color,transform] duration-150 active:scale-95 ${
            maxPrice === null
              ? "bg-[var(--surface)] text-[var(--gold-ink)] hover:bg-[var(--press)]"
              : "bg-[var(--gold)] text-[var(--on-gold)] hover:bg-[var(--gold-deep)]"
          }`}
        >
          <SlidersHorizontal size={16} strokeWidth={2.4} aria-hidden="true" />
          {maxPrice !== null && <span className="tabular">≤ {formatPrice(maxPrice)}</span>}
        </button>
      </div>

      <div className="flex items-center gap-1 pt-0.5">
        <button
          type="button"
          onClick={onBack}
          aria-label={product ? `Back to ${sub.id === "all" ? cat.label : sub.label} list` : "Back to start"}
          className="-ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--blue-ink)] transition-[background-color,transform] hover:bg-[var(--press)] active:scale-90"
        >
          <ArrowLeft size={21} strokeWidth={2.4} />
        </button>
        <h2 className="min-w-0 flex-1 truncate">
          <span className="f-display text-[21px] font-extrabold uppercase tracking-[.02em]">{title}</span>
          <span className="tabular ml-2 text-[13px] text-[var(--muted)]" aria-live="polite">{countLabel}</span>
        </h2>
        <button
          type="button"
          onClick={() => {
            setSortDesc((v) => !v);
            restartList();
          }}
          aria-label={`${sortLabel}. Reverse order`}
          title={sortLabel}
          className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--blue-ink)] transition-[background-color,transform] hover:bg-[var(--press)] active:scale-90"
        >
          <SortIcon size={20} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ScrollArea ref={scrollRef} label={title} pinned={pinned}>
        {visible.length ? (
          <>
            <ul className="h-group mt-2">
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map((r) =>
                  isVendorView ? (
                    <ExpandRow
                      key={r.id}
                      id={r.id}
                      name={r.name}
                      price={r.price}
                      showFrom={!product}
                      best={bestPrice !== null && r.price === bestPrice}
                      type={r.type}
                      location={r.location}
                      expanded={expanded === r.id}
                      onToggle={() => setExpanded((cur) => (cur === r.id ? null : r.id))}
                    />
                  ) : (
                    <LinkRow
                      key={r.id}
                      name={r.name}
                      price={r.price}
                      onClick={() => onNavigate({ category: categoryId, sub: sub.id, item: r.id })}
                    />
                  )
                )}
              </AnimatePresence>
            </ul>
            <div className="mt-5 flex flex-col items-center gap-2.5">
              <p className="f-eyebrow tabular text-[var(--muted)]">
                Showing {shown.length} of {visible.length}
              </p>
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setLimit(shown.length + PAGE_SIZE)}
                  className="f-display tabular h-11 rounded-full bg-[var(--ink)] px-6 text-[17px] font-bold uppercase tracking-[.06em] text-[var(--bg)] transition-transform active:scale-95"
                >
                  Show {Math.min(PAGE_SIZE, remaining)} more
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-[22px] bg-[var(--surface)] px-6 pb-8 pt-7 text-center">
            <MugMark />
            <p className="f-display mt-3 text-[24px] font-extrabold uppercase leading-tight">
              Nothing at {formatPrice(maxPrice ?? 0)} or less
            </p>
            <p className="mt-1.5 max-w-[28ch] text-[15px] leading-snug text-[var(--muted)]">
              Raise your maximum price to see more {isVendorView ? "vendors" : "products"}.
            </p>
            <button
              type="button"
              onClick={() => setBudgetOpen(true)}
              className="f-display mt-5 h-11 rounded-full bg-[var(--gold)] px-6 text-[17px] font-bold uppercase tracking-[.06em] text-[var(--on-gold)] transition-[background-color,transform] hover:bg-[var(--gold-deep)] active:scale-95"
            >
              Change maximum price
            </button>
          </div>
        )}
      </ScrollArea>

      <BudgetPopup
        open={budgetOpen}
        max={priceCeiling}
        value={maxPrice}
        onClose={() => setBudgetOpen(false)}
        onApply={(v) => {
          changeBudget(v);
          setBudgetOpen(false);
        }}
      />
    </>
  );
}

// "About Hermes" frame from the Figma
function AboutScreen({ onBack }) {
  const steps = [
    ["1", "Select a category"],
    ["+", "Optional: select a sub-category"],
    ["2", "Select a product"],
    ["3", "Set your maximum price"],
    ["4", "Compare available vendors"],
    ["5", "Select a vendor to see more information"],
  ];
  const Heading = ({ children }) => (
    <h2 className="f-display flex items-center gap-2 text-[20px] font-extrabold uppercase tracking-[.03em]">
      <span aria-hidden="true" className="h-[3px] w-4 rounded-full bg-[var(--gold)]" />
      {children}
    </h2>
  );
  return (
    <ScrollArea label="About Hermes">
      <article className="flex max-w-prose flex-col gap-7 pt-5 text-[16px] leading-relaxed">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-[var(--blue-ink)] transition-[background-color,transform] hover:bg-[var(--press)] active:scale-90"
          >
            <ArrowLeft size={22} strokeWidth={2.4} />
          </button>
          <h1 className="f-display text-[32px] font-extrabold uppercase leading-none">
            About <span className="f-gothic normal-case text-[var(--blue-ink)]">Hermes</span>
          </h1>
        </div>
        <section>
          <p className="f-eyebrow text-[var(--gold-ink)]">Find prices at Oktoberfest</p>
          <p className="mt-2">Hermes helps you compare prices for drinks, food, rides, games and souvenirs at Oktoberfest.</p>
        </section>
        <section>
          <Heading>How it works</Heading>
          <ol className="h-group mt-3">
            {steps.map(([n, text]) => (
              <li key={text} className="flex items-center gap-3 px-4 py-3">
                <span className="f-display grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--blue)] text-[15px] font-bold text-[var(--on-blue)]">
                  {n}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <Heading>About prices</Heading>
          <p className="mt-2">
            Prices are based on the data provided for the Oktoberfest. Prices may change. In this prototype they are
            sample prices in line with recent Wiesn ranges, for example €14.50–€15.80 for a Maß of Festbier.
          </p>
        </section>
        <section>
          <Heading>Data</Heading>
          <p className="mt-2">Last updated: Sept 2026 (sample data for this prototype)</p>
        </section>
      </article>
    </ScrollArea>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */

export default function OktoberfestVendorFinder() {
  // { screen: "home" } | { screen: "about", from } | { screen: "list", category, sub, item, focus }
  const [view, setView] = useState({ screen: "home" });
  const [maxPrice, setMaxPrice] = useState(null);
  const [direction, setDirection] = useState(1);
  const [headerLine, setHeaderLine] = useState(false);

  const navigate = (next, dir = 1) => {
    setDirection(dir);
    setView(next);
  };

  const openList = (next, dir = 1) => {
    // The budget belongs to one category; switching category clears it
    if (view.screen !== "list" || view.category !== next.category) setMaxPrice(null);
    navigate({ screen: "list", sub: "all", item: null, focus: null, ...next }, dir);
  };

  const openSearchResult = (entry) =>
    CATEGORY_BY_ID[entry.category].kind === "products"
      ? openList({ category: entry.category, item: entry.id })
      : openList({ category: entry.category, focus: entry.id });

  const goBack = () => {
    if (view.screen === "about") return navigate(view.from ?? { screen: "home" }, -1);
    if (view.item) return openList({ category: view.category, sub: view.sub, item: null }, -1);
    navigate({ screen: "home" }, -1);
  };

  const viewKey =
    view.screen === "list" ? `${view.category}/${view.sub}/${view.item ?? "all"}/${view.focus ?? ""}` : view.screen;

  return (
    <MotionConfig reducedMotion="user">
      <style>{THEME_CSS}</style>
      <HeaderLineContext.Provider value={setHeaderLine}>
        {/* Full-height shell: the frosted header floats over each screen's own scroll area */}
        <div className="relative h-full overflow-hidden text-[var(--ink)]">
          <Header
            hairline={headerLine}
            onHome={() => navigate({ screen: "home" }, -1)}
            onInfo={() => view.screen !== "about" && navigate({ screen: "about", from: view })}
          />

          <main className="flex h-full flex-col">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={viewKey}
                custom={direction}
                initial={{ opacity: 0, x: 24 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 * direction }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {view.screen === "home" && (
                  <HomeScreen onOpenCategory={(id) => openList({ category: id })} onOpenItem={openSearchResult} />
                )}
                {view.screen === "list" && (
                  <ListScreen
                    view={view}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    onNavigate={(next) => openList(next, next.item ? 1 : 0)}
                    onBack={goBack}
                  />
                )}
                {view.screen === "about" && <AboutScreen onBack={goBack} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </HeaderLineContext.Provider>
    </MotionConfig>
  );
}