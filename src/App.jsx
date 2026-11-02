import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Info, Search, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft, ArrowDownAZ, ArrowDownZA, ArrowDown01, ArrowDown10,
  SlidersHorizontal, X, Beer, UtensilsCrossed, FerrisWheel, Target, Gift, MapPin, Store,
} from "lucide-react";
import logo from "../public/oktoberfest-logo.png";

/* ------------------------------------------------------------------ */
/* Theme — Hermes, a Wiesn price guide (matches the live Vercel build). */
/* Navy banner and controls, Oktoberfest gold accents, parchment page.  */
/* Type: Barlow Condensed for headings and names, Barlow for reading,   */
/* Grenze Gotisch for the "Oktoberfest" accent.                         */
/* ------------------------------------------------------------------ */

// Blue-and-white lozenge pattern (Bavarian "Rautenmuster"), used as a thin accent stripe
const RAUTEN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='20'%3E%3Cpath d='M6 0L12 10L6 20L0 10Z' fill='%23005293'/%3E%3C/svg%3E\")";

// The palette is light-only: cream page, navy ink, gold accents. Every tint below derives from those three.
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&family=Grenze+Gotisch:wght@700&display=swap');
:root{
  --bg:#F9F8F3; --surface:#FFFFFF; --press:rgba(212,175,55,.12); --ink:#00213B; --muted:rgba(0,33,59,.68); --hair:rgba(0,33,59,.12);
  --gold:#D4AF37; --gold-deep:#B8962E; --gold-ink:#B8962E; --on-gold:#00213B;
  --danger:#A3261C;
  --hh:calc(60px + env(safe-area-inset-top,0px));
  color-scheme:light;
}

/* One-screen app shell: the page never scrolls, only each screen's content area */
html{box-sizing:border-box;}
html,body,#root{height:100%;}
html,body{overflow:hidden;}
body{background-color:var(--bg);color:var(--ink);
  font-family:'Barlow',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;}
h1,h2,h3{text-wrap:balance}

.f-display{font-family:'Barlow Condensed','Arial Narrow',system-ui,sans-serif;}
.f-gothic{font-family:'Grenze Gotisch',Georgia,'Times New Roman',serif;}
.f-eyebrow{font-family:'Barlow Condensed','Arial Narrow',system-ui,sans-serif;font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;}
.tabular{font-variant-numeric:tabular-nums}

.h-gutter{padding-left:max(18px,env(safe-area-inset-left,0px));padding-right:max(18px,env(safe-area-inset-right,0px));}
.h-scroll{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable both-edges;}
.h-scroll-pad{padding-bottom:calc(36px + env(safe-area-inset-bottom,0px));}
.h-scroll-pad-extra{padding-bottom:calc(80px + env(safe-area-inset-bottom,0px));}
.h-rauten{background-color:#FFFFFF;background-image:${RAUTEN};background-size:12px 20px;}

/* Simple app bars: clean, solid, and practical */
.h-glass{background:rgba(249,248,243,.98);}
.h-hairline{box-shadow:0 1px 0 var(--hair);}

/* iOS-style grouped list: one surface, inset hairline dividers */
.h-group{background:var(--surface);border-radius:16px;overflow:hidden;}
.h-group > li{position:relative;}
.h-group > li + li::before{content:"";position:absolute;top:0;left:16px;right:0;height:1px;background:var(--hair);z-index:1;}

/* Festival ticket price badge: clear, tactile, and less gimmicky */
.h-ticket{position:relative;display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;border-radius:999px;
  background:#00213B;color:#fff;white-space:nowrap;box-shadow:inset 0 0 0 1px rgba(0,33,59,.12);}
.h-ticket::after{display:none;}
.h-ticket-best{background:#00213B;color:#D4AF37;box-shadow:inset 0 0 0 1px rgba(212,175,55,.35);}
.h-ticket-label{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;opacity:.8;color:inherit;}
.h-ticket-price{font-weight:700;font-size:14px;font-variant-numeric:tabular-nums;color:inherit;}

.h-chips{scrollbar-width:none;-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 22px),transparent);}
.h-chips::-webkit-scrollbar{display:none}
input[type="search"]::-webkit-search-cancel-button{-webkit-appearance:none;display:none}
.h-range{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:999px;cursor:grab;
  background:linear-gradient(#00213B,#00213B) 0/var(--fill,50%) 100% no-repeat,rgba(212,175,55,.25);}
.h-range::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#D4AF37;border:2px solid #fff;box-shadow:0 0 0 4px rgba(0,33,59,.1),0 4px 8px rgba(0,33,59,.28);transition:transform .15s;}
.h-range:hover::-webkit-slider-thumb{transform:scale(1.1);}
.h-range:active{cursor:grabbing;}
.h-range:active::-webkit-slider-thumb{transform:scale(.95);}
.h-range::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#D4AF37;border:2px solid #fff;box-shadow:0 0 0 4px rgba(0,33,59,.1),0 4px 8px rgba(0,33,59,.28);transition:transform .15s;}
.h-range:hover::-moz-range-thumb{transform:scale(1.1);}
.h-range:active::-moz-range-thumb{transform:scale(.95);}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
@media (prefers-reduced-motion: reduce){*{transition-duration:0s !important}}
`;

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* Illustrative placeholder prices, not field-verified.                 */
/* Replace with the official price list before a public launch.         */
/* ------------------------------------------------------------------ */

// Placeholder data model: Project_Hermes_MVP_Placeholder_Data_Model.xlsx
// (5 categories, 6 attributes, 2 areas, 35 vendors, 50 products, 83 offerings).
// Spreadsheet ids are kept as record ids so rows can be traced back to the workbook.

// [attribute id, chip id, label]
const ATTRIBUTES = [
  ["A001", "alcoholic", "Alcoholic"],
  ["A002", "non-alcoholic", "Non-Alcoholic"],
  ["A003", "vegan", "Vegan"],
  ["A004", "non-vegan", "Non-Vegan"],
  ["A005", "hot", "Hot"],
  ["A006", "cold", "Cold"],
].map(([code, id, label]) => ({ code, id, label }));

// [area id, name]
const AREAS = Object.fromEntries(
  [
    ["A001", "Oktoberfest"],
    ["A002", "Oide Wiesn"],
  ].map(([id, name]) => [id, { id, name }])
);

// [vendor id, name, type, area id, location]
const VENDORS = Object.fromEntries(
  [
    ["V001", "Augustiner-Festhalle", "Large tent", "A001", "Wirtestrasse"],
    ["V002", "Hacker-Festzelt", "Large tent", "A001", "Wirtestrasse"],
    ["V003", "Hofbraeu-Festzelt", "Large tent", "A001", "Wirtestrasse"],
    ["V004", "Schottenhamel-Festhalle", "Large tent", "A001", "Wirtestrasse"],
    ["V005", "Armbrustschuetzenzelt", "Large tent", "A001", "Wirtestrasse"],
    ["V006", "Loewenbraeu-Festzelt", "Large tent", "A001", "Wirtestrasse"],
    ["V007", "Kufflers Weinzelt", "Large tent", "A001", "Wirtestrasse"],
    ["V008", "Ammer Entenbraterei", "Small tent", "A001", "Street 2"],
    ["V009", "Cafe Kaiserschmarrn", "Small tent", "A001", "Street 3"],
    ["V010", "Wirtshaus im Schichtl", "Small tent", "A001", "Street 4"],
    ["V011", "Museumszelt", "Oide Wiesn tent", "A002", "Oide Wiesn"],
    ["V012", "Festzelt Tradition", "Oide Wiesn tent", "A002", "Oide Wiesn"],
    ["V013", "Bratwurst Stand Mueller", "Food stand", "A001", "Street 5"],
    ["V014", "Steckerlfisch Huber", "Food stand", "A001", "Street 6"],
    ["V015", "Brezn Baeckerei Seidl", "Food stand", "A001", "Street 1"],
    ["V016", "Pommes & Snacks Bauer", "Food stand", "A001", "Street 7"],
    ["V017", "Mandelbrennerei Lenz", "Food stand", "A001", "Street 8"],
    ["V018", "Vegan Wiesn Kitchen", "Food stand", "A001", "Street 9"],
    ["V019", "Riesenrad Willenborg", "Ride", "A001", "Schaustellerstrasse"],
    ["V020", "Olympia Looping", "Ride", "A001", "Schaustellerstrasse"],
    ["V021", "Teufelsrad", "Ride", "A001", "Schaustellerstrasse"],
    ["V022", "Toboggan", "Ride", "A001", "Schaustellerstrasse"],
    ["V023", "Jules Verne Tower", "Ride", "A001", "Schaustellerstrasse"],
    ["V024", "Skater", "Ride", "A001", "Schaustellerstrasse"],
    ["V025", "Autoscooter Distel", "Ride", "A001", "Schaustellerstrasse"],
    ["V026", "Historic Chain Carousel", "Ride", "A002", "Oide Wiesn"],
    ["V027", "Krinoline", "Ride", "A002", "Oide Wiesn"],
    ["V028", "Schiessbude Wagner", "Game stand", "A001", "Street 10"],
    ["V029", "Wurfspiel Schneider", "Game stand", "A001", "Street 11"],
    ["V030", "Entenangeln Fischer", "Game stand", "A001", "Street 12"],
    ["V031", "Hau den Lukas Bauer", "Game stand", "A002", "Oide Wiesn"],
    ["V032", "Losbude Glueckspilz", "Game stand", "A001", "Street 13"],
    ["V033", "Lebkuchenherz Stand Rosi", "Merchandise stand", "A001", "Street 14"],
    ["V034", "Souvenir Stand Bavaria", "Merchandise stand", "A001", "Street 15"],
    ["V035", "Balloon Seller Munich", "Merchandise stand", "A001", "Street 16"],
  ].map(([id, name, type, area, location]) => [id, { id, name, type, area, location }])
);

// [offering id, vendor id, product id, price €, new this year]
const OFFERINGS = [
  ["O001", "V001", "P001", 14.9, false],
  ["O002", "V001", "P020", 10.8, false],
  ["O003", "V001", "P022", 11.9, false],
  ["O004", "V001", "P040", 17.2, false],
  ["O005", "V001", "P044", 4.8, false],
  ["O006", "V002", "P001", 15.4, false],
  ["O007", "V002", "P020", 10.8, false],
  ["O008", "V002", "P023", 11.8, false],
  ["O009", "V002", "P040", 18.2, false],
  ["O010", "V002", "P042", 24.5, false],
  ["O011", "V003", "P001", 15.5, false],
  ["O012", "V003", "P020", 11.2, false],
  ["O013", "V003", "P022", 12.1, false],
  ["O014", "V003", "P040", 18.5, false],
  ["O015", "V003", "P043", 8.9, false],
  ["O016", "V004", "P001", 15.3, false],
  ["O017", "V004", "P020", 10.9, false],
  ["O018", "V004", "P040", 18, false],
  ["O019", "V004", "P044", 4.9, false],
  ["O020", "V005", "P001", 15.9, false],
  ["O021", "V005", "P020", 11.5, false],
  ["O022", "V005", "P040", 17, false],
  ["O023", "V006", "P001", 15.6, false],
  ["O024", "V006", "P022", 12, false],
  ["O025", "V006", "P042", 25.5, false],
  ["O026", "V007", "P003", 8.9, false],
  ["O027", "V007", "P020", 15.33, false],
  ["O028", "V007", "P045", 14.5, false],
  ["O029", "V008", "P041", 29.9, false],
  ["O030", "V008", "P001", 14.8, false],
  ["O031", "V008", "P020", 9.9, false],
  ["O032", "V009", "P045", 13.5, false],
  ["O033", "V009", "P025", 4.5, false],
  ["O034", "V009", "P026", 5.2, false],
  ["O035", "V010", "P001", 14.9, false],
  ["O036", "V010", "P020", 8.8, false],
  ["O037", "V010", "P083", 5, false],
  ["O038", "V011", "P001", 14.8, false],
  ["O039", "V011", "P020", 8.5, false],
  ["O040", "V011", "P043", 8.5, false],
  ["O041", "V012", "P001", 14.8, false],
  ["O042", "V012", "P044", 4.5, false],
  ["O043", "V012", "P050", 12.9, false],
  ["O044", "V013", "P046", 6.5, false],
  ["O045", "V013", "P049", 5.8, false],
  ["O046", "V013", "P021", 4.2, false],
  ["O047", "V014", "P047", 15, false],
  ["O048", "V014", "P048", 6.9, false],
  ["O049", "V014", "P021", 4.5, false],
  ["O050", "V015", "P044", 4.3, false],
  ["O051", "V015", "P052", 5.5, false],
  ["O052", "V016", "P049", 5.5, false],
  ["O053", "V016", "P046", 6.9, false],
  ["O054", "V016", "P023", 5, false],
  ["O055", "V017", "P052", 5.8, false],
  ["O056", "V017", "P053", 4.9, false],
  ["O057", "V018", "P051", 7.5, true],
  ["O058", "V018", "P049", 5.9, false],
  ["O059", "V018", "P024", 4.8, false],
  ["O060", "V019", "P080", 10, false],
  ["O061", "V020", "P081", 12, false],
  ["O062", "V021", "P082", 5, false],
  ["O063", "V022", "P083", 6, false],
  ["O064", "V023", "P084", 9, false],
  ["O065", "V024", "P085", 8, false],
  ["O066", "V025", "P086", 4.5, false],
  ["O067", "V026", "P087", 1.5, false],
  ["O068", "V027", "P088", 1.5, false],
  ["O069", "V026", "P089", 1.5, false],
  ["O070", "V028", "P100", 2, false],
  ["O071", "V028", "P101", 15, false],
  ["O072", "V028", "P102", 28, false],
  ["O073", "V029", "P103", 6, false],
  ["O074", "V029", "P107", 5, false],
  ["O075", "V030", "P104", 5, false],
  ["O076", "V031", "P105", 1.5, false],
  ["O077", "V032", "P106", 2, false],
  ["O078", "V033", "P120", 9.5, false],
  ["O079", "V033", "P121", 14, false],
  ["O080", "V034", "P122", 12, false],
  ["O081", "V034", "P123", 24, false],
  ["O082", "V034", "P125", 4.5, false],
  ["O083", "V035", "P124", 6, false],
].map(([id, vendorId, productId, price, isNew]) => ({ id, vendorId, productId, price, isNew }));

// product id -> attribute codes
const PRODUCT_ATTRIBUTES = {
  P001: ["A001", "A006"],
  P002: ["A001", "A006"],
  P003: ["A001", "A006"],
  P004: ["A001", "A006"],
  P005: ["A002", "A006"],
  P020: ["A002", "A006"],
  P021: ["A002", "A006"],
  P022: ["A002", "A006"],
  P023: ["A002", "A006"],
  P024: ["A002", "A006"],
  P025: ["A002", "A005"],
  P026: ["A002", "A005"],
  P040: ["A004", "A005"],
  P041: ["A004", "A005"],
  P042: ["A004", "A005"],
  P043: ["A004", "A005"],
  P044: ["A004"],
  P045: ["A004", "A005"],
  P046: ["A004", "A005"],
  P047: ["A004", "A005"],
  P048: ["A004", "A006"],
  P049: ["A003", "A005"],
  P050: ["A004", "A005"],
  P051: ["A003", "A005"],
  P052: ["A003", "A005"],
  P053: ["A003"],
};

// [product id, category id, name, variant, unit, traditional]
const PRODUCT_ROWS = [
  ["P001", "C001", "Mass Helles", "1L", "litre", true],
  ["P002", "C001", "Mass Weissbier", "1L", "litre", true],
  ["P003", "C001", "Weissbier", "0.5L", "litre", true],
  ["P004", "C001", "Radler", "1L", "litre", true],
  ["P005", "C001", "Alcohol-Free Beer", "0.5L", "litre", false],
  ["P020", "C001", "Table Water", "1L", "litre", false],
  ["P021", "C001", "Mineral Water", "0.5L", "litre", false],
  ["P022", "C001", "Spezi", "1L", "litre", false],
  ["P023", "C001", "Lemonade", "1L", "litre", false],
  ["P024", "C001", "Apple Schorle", "0.5L", "litre", false],
  ["P025", "C001", "Coffee", "Cup", "cup", false],
  ["P026", "C001", "Hot Chocolate", "Cup", "cup", false],
  ["P040", "C003", "Half Chicken", "Standard", "piece", true],
  ["P041", "C003", "Bio Half Chicken", "With potato salad", "piece", false],
  ["P042", "C003", "Pork Knuckle", "Standard", "portion", true],
  ["P043", "C003", "Weisswurst", "Pair", "portion", true],
  ["P044", "C003", "Brezn", "Large", "piece", true],
  ["P045", "C003", "Kaiserschmarrn", "Standard", "portion", true],
  ["P046", "C003", "Bratwurst in Semmel", "Standard", "piece", true],
  ["P047", "C003", "Steckerlfisch", "Mackerel", "piece", true],
  ["P048", "C003", "Fischsemmel", "Herring", "piece", true],
  ["P049", "C003", "Pommes", "Regular", "portion", false],
  ["P050", "C003", "Cheese Spaetzle", "Standard", "portion", true],
  ["P051", "C003", "Vegan Sausage in Semmel", "Standard", "piece", false],
  ["P052", "C003", "Roasted Almonds", "100g", "bag", true],
  ["P053", "C003", "Chocolate Fruit Skewer", "Standard", "piece", true],
  ["P080", "C004", "Ferris Wheel Ride", "Single Ride", "ticket", true],
  ["P081", "C004", "Roller Coaster Ride", "Single Ride", "ticket", false],
  ["P082", "C004", "Devil's Wheel Entry", "Single Entry", "ticket", true],
  ["P083", "C004", "Toboggan Entry", "Single Entry", "ticket", true],
  ["P084", "C004", "Tower Swing Ride", "Single Ride", "ticket", false],
  ["P085", "C004", "Top Scan Ride", "Single Ride", "ticket", false],
  ["P086", "C004", "Bumper Car Ride", "Single Ride", "ticket", false],
  ["P087", "C004", "Historic Chain Carousel", "Single Ride", "ticket", true],
  ["P088", "C004", "Krinoline Ride", "Single Ride", "ticket", true],
  ["P089", "C004", "Children's Carousel", "Single Ride", "ticket", true],
  ["P100", "C005", "Shooting Gallery", "1 Shot", "shot", true],
  ["P101", "C005", "Shooting Gallery", "10 Shots", "shots", true],
  ["P102", "C005", "Shooting Gallery", "20 Shots", "shots", true],
  ["P103", "C005", "Ring Toss", "5 Rings", "round", true],
  ["P104", "C005", "Duck Fishing", "1 Round", "round", true],
  ["P105", "C005", "Strongman Hammer", "1 Try", "try", true],
  ["P106", "C005", "Lottery Ticket", "1 Ticket", "ticket", true],
  ["P107", "C005", "Can Knockdown", "3 Balls", "round", true],
  ["P120", "C006", "Gingerbread Heart", "Medium", "piece", true],
  ["P121", "C006", "Gingerbread Heart", "Large", "piece", true],
  ["P122", "C006", "Oktoberfest Mug", "Souvenir", "piece", false],
  ["P123", "C006", "Felt Hat", "Souvenir", "piece", false],
  ["P124", "C006", "Balloon", "Standard", "piece", false],
  ["P125", "C006", "Souvenir Pin", "Standard", "piece", false],
];

// Workbook category ids mapped onto the app's category ids (which also key the artwork)
const CATEGORY_LIST = [
  { id: "drinks", code: "C001", label: "Drinks", icon: Beer },
  { id: "foods", code: "C003", label: "Food", icon: UtensilsCrossed },
  { id: "rides", code: "C004", label: "Rides", icon: FerrisWheel },
  { id: "games", code: "C005", label: "Games", icon: Target },
  { id: "merch", code: "C006", label: "Merchandise", icon: Gift },
];
const CATEGORY_BY_CODE = Object.fromEntries(CATEGORY_LIST.map((c) => [c.code, c]));
const ATTRIBUTE_BY_CODE = Object.fromEntries(ATTRIBUTES.map((a) => [a.code, a]));
const ATTRIBUTE_BY_ID = Object.fromEntries(ATTRIBUTES.map((a) => [a.id, a]));
// Hot (A005) and Cold (A006) stay in the workbook mirror above but are not used by the app
const EXCLUDED_ATTRIBUTES = new Set(["A005", "A006"]);

// Every product, ride, game and souvenir is compared across the vendors that offer it, cheapest first.
// Products with no offering have no price to compare, so they are left out of lists and search.
const PRODUCTS = PRODUCT_ROWS.map(([id, categoryCode, name, variant, unit, traditional]) => ({
  id,
  category: CATEGORY_BY_CODE[categoryCode].id,
  name: variant && variant !== "Standard" ? `${name} (${variant})` : name,
  unit,
  traditional,
  attrs: (PRODUCT_ATTRIBUTES[id] ?? []).filter((code) => !EXCLUDED_ATTRIBUTES.has(code)).map((code) => ATTRIBUTE_BY_CODE[code].id),
  prices: OFFERINGS.filter((o) => o.productId === id)
    .map(({ vendorId, price, isNew }) => ({ vendorId, price, isNew }))
    .sort((a, b) => a.price - b.price),
})).filter((p) => p.prices.length > 0);

// Filter chips: "All", then each attribute that at least one product in the category carries
const CATEGORIES = CATEGORY_LIST.map((c) => ({
  ...c,
  subs: [
    { id: "all", label: `All ${c.label}`, short: "All" },
    ...ATTRIBUTES.filter((a) => PRODUCTS.some((p) => p.category === c.id && p.attrs.includes(a.id))).map((a) => ({
      id: a.id,
      label: `${a.label} ${c.label}`,
      short: a.label,
    })),
  ],
}));
const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// Category artwork served from /public/icons
const CATEGORY_ART = {
  drinks: "/icons/drinks.png",
  foods: "/icons/foods.png",
  rides: "/icons/rides.png",
  games: "/icons/games.png",
  merch: "/icons/souvenirs.png",
};

// Rows rendered per "Show more" step, so long lists don't overwhelm
const PAGE_SIZE = 8;

const fromPrice = (product) => Math.min(...product.prices.map((p) => p.price));
const formatPrice = (v) => `€${Number.isInteger(v) ? v : v.toFixed(2)}`;
const formatInput = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

// Only real numbers get a price badge; placeholders like "prices vary" are hidden
const hasPrice = (v) => {
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s || s === "null" || s === "undefined" || /^\[.*\]$/.test(s)) return false;
    const lower = s.toLowerCase();
    if (lower.includes("no price") || lower.includes("prices vary")) return false;
    return !Number.isNaN(Number.parseFloat(s.replace(",", ".")));
  }
  return false;
};

function itemsFor(categoryId, subId) {
  return PRODUCTS.filter((p) => p.category === categoryId && (subId === "all" || p.attrs.includes(subId)));
}

// Accent- and spelling-insensitive matching. The workbook spells German words in ASCII ("Weissbier", "Spaetzle"),
// so ß becomes ss and ae/oe/ue fold to a/o/u on both sides: "Weißbier", "weissbier" and "Käsespätzle" all match.
const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u");

// Words each attribute adds to search. "Non-Vegan" adds none: matching is by substring,
// so its label would make a search for "vegan" return every meat dish.
const ATTRIBUTE_SEARCH_TERMS = {
  alcoholic: "alcoholic",
  "non-alcoholic": "non-alcoholic alcohol-free",
  vegan: "vegan",
  "non-vegan": "",
};

// Searchable text: the product name, its category, its attributes and the vendors that sell it
const SEARCH_INDEX = PRODUCTS.map((p) => ({
  ...p,
  from: fromPrice(p),
  terms: [
    p.name,
    CATEGORY_BY_ID[p.category].label,
    ...p.attrs.map((id) => ATTRIBUTE_SEARCH_TERMS[id] ?? ATTRIBUTE_BY_ID[id].label),
    ...p.prices.map((o) => VENDORS[o.vendorId].name),
  ],
})).map((e) => ({ ...e, haystack: normalize(e.terms.join(" ")) }));

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

function MugMark({ size = 72, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <path d="M44 27h5a7 7 0 0 1 7 7v6a7 7 0 0 1-7 7h-5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M13 22h31v32a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V22Z" fill="var(--gold)" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M21 31v18M28.5 31v18M36 31v18" stroke="currentColor" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M11 23c-2-5 2-10 7-9 1-5 8-7 12-3 3-3 10-2 11 3 5-1 8 4 6 9H11Z"
        fill="var(--surface)"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                      */
/* ------------------------------------------------------------------ */

// Lets the screen below tell the header when content has scrolled under it
const HeaderLineContext = createContext(() => {});

// Every screen shares one content width so page transitions don't shift the layout.
const CONTAINER = "mx-auto w-full max-w-2xl px-4";

function Header({ onHome, onInfo, hairline }) {
  return (
    <header
      className={`absolute inset-x-0 top-0 z-30 bg-[#00213B] text-[#F9F8F3] shadow-[0_8px_18px_rgba(0,33,59,0.18)] transition-shadow ${
        hairline ? "shadow-[0_8px_18px_rgba(0,33,59,0.18),0_1px_0_rgba(255,255,255,0.16)]" : ""
      }`}
    >
      <div className="h-rauten h-1.5" aria-hidden="true" />
      <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className={`${CONTAINER} flex h-[74px] items-center justify-between`}>
          <button
            type="button"
            onClick={onHome}
            aria-label="Hermes, go to start"
            className="flex items-center gap-3 rounded-lg transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
          >
            <img src={logo} alt="Hermes Logo" className="mr-3 h-10 w-auto object-contain drop-shadow" />
            <div className="flex flex-col items-start leading-none">
              <span className="f-display text-[26px] font-extrabold uppercase tracking-[.04em] text-[#F9F8F3]">HERMES</span>
              <span className="f-eyebrow mt-1 text-[9px] tracking-[0.22em] text-[#D4AF37]">OKTOBERFEST PRICES</span>
            </div>
          </button>
          <button
            type="button"
            onClick={onInfo}
            aria-label="About Hermes"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#D4AF37]/40 bg-white/5 text-[#F9F8F3] transition-[background-color,border-color,transform] hover:border-[#D4AF37] hover:bg-[rgba(255,255,255,0.12)] active:scale-90"
          >
            <Info size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="h-rauten h-2" aria-hidden="true" />
    </header>
  );
}

// The only scrolling element on a screen. It starts under the header;
// `pinned` content sticks just below it while the list scrolls underneath.
const ScrollArea = React.forwardRef(function ScrollArea({ label, pinned, children, extraBottomPadding = false }, ref) {
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
        <div className={`h-glass sticky z-10 transition-shadow ${scrolled ? "h-hairline" : ""}`} style={{ top: "var(--hh)" }}>
          <div className={`${CONTAINER} pt-2`}>{pinned}</div>
        </div>
      )}
      <div className={`${CONTAINER} h-scroll-pad${extraBottomPadding ? " h-scroll-pad-extra" : ""}`}>{children}</div>
    </div>
  );
});

function CategoryIcon({ category, size = "md", useHermesIcon = false }) {
  const Icon = category.icon;
  const box = size === "sm" ? "h-7 w-7 rounded-[9px]" : "h-10 w-10 rounded-[12px]";
  const artSize = size === "menu" || size === "banner" ? "h-8 w-8" : "h-10 w-10";
  const art = CATEGORY_ART[category.id];
  return (
    <span
      className={
        useHermesIcon
          ? `flex ${artSize} shrink-0 items-center justify-center`
          : `relative grid shrink-0 place-items-center overflow-hidden bg-[#00213B] text-[#D4AF37] ${box}`
      }
    >
      {useHermesIcon && art ? (
        <img
          src={art}
          alt={category.label}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className={`${artSize} scale-[1.35] object-contain drop-shadow-sm`}
        />
      ) : (
        <Icon size={size === "sm" ? 15 : 20} strokeWidth={2.1} />
      )}
    </span>
  );
}

function PriceTicket({ price, label, best, vendor = false }) {
  const vendorClass = `inline-flex min-w-[54px] items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-black shadow-sm ${
    best ? "bg-[#D4AF37] text-[#00213B]" : "bg-[#00213B] text-white"
  }`;
  return (
    <span
      className={
        vendor
          ? vendorClass
          : `h-ticket border ${best ? "h-ticket-best border-[#D4AF37]/60" : "border-[#00213B]/10 bg-[#00213B] text-white"}`
      }
      aria-label={best ? `Best price ${formatPrice(price)}` : undefined}
    >
      {label && label !== "Best" && <span className={vendor ? "text-[9px] font-bold uppercase opacity-80" : "h-ticket-label"}>{label}</span>}
      <span className={vendor ? "tabular text-xs font-black" : "h-ticket-price"}>{formatPrice(price)}</span>
    </span>
  );
}

// Category switcher: the category name as an inline title that opens a compact gold-framed menu
function Dropdown({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.id === value)));
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
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
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div ref={rootRef} className={`relative w-fit max-w-full ${open ? "z-20" : ""}`}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selected?.label ?? ""}`}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && options[active] ? `${id}-opt-${options[active].id}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="flex w-fit max-w-full items-center gap-2 px-0 py-0 text-left text-[#00213B] transition-[opacity,transform] hover:opacity-80 active:scale-[0.98]"
      >
        <span className="f-display min-w-0 truncate text-xl font-extrabold uppercase tracking-wide text-[#00213B]">{selected?.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="ml-2 h-4 w-4 shrink-0 text-[#00213B]/70"
        >
          <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-[calc(100%+8px)] z-30 w-48 max-w-[calc(100vw-36px)] overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-[#F9F8F3] py-2 text-[#00213B] shadow-xl"
          >
            <ul id={`${id}-list`} role="listbox" aria-label={label} className="bg-[#F9F8F3]">
              {options.map((o, i) => {
                const isSelected = o.id === value;
                return (
                  <li
                    key={o.id}
                    id={`${id}-opt-${o.id}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(o)}
                    className={`mx-1 my-0.5 flex cursor-pointer items-center rounded-lg px-3 py-2 text-[#00213B] transition-colors hover:bg-[#D4AF37]/15 ${
                      i === active ? "bg-[#D4AF37]/15" : ""
                    }`}
                  >
                    <span className="f-display flex-1 text-sm font-bold text-[#00213B]">{o.label}</span>
                    {isSelected && (
                      <span aria-hidden="true" className="text-[#D4AF37]">
                        ✓
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkRow({ name, price, onClick, showPrice = true }) {
  const priced = showPrice && hasPrice(price);
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button
        type="button"
        onClick={onClick}
        className="group flex min-h-[58px] w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#D4AF37]/5 active:bg-[var(--press)]"
      >
        <span className="f-display min-w-0 flex-1 text-[19px] font-semibold leading-tight">{name}</span>
        {priced ? <PriceTicket price={price} label="from" /> : null}
        <ChevronRight
          size={18}
          strokeWidth={2.5}
          aria-hidden="true"
          className="-mr-1 shrink-0 text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </motion.li>
  );
}

function ExpandRow({ id, name, price, showFrom, best, type, location, expanded, onToggle, showPrice = true }) {
  const priced = showPrice && hasPrice(price);
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-row={id}
      // The 4px gold accent is reserved for the best price. Open rows stay full width inside the list frame;
      // only the white details panel below the header marks them as open.
      className={`relative overflow-hidden ${best ? "border-l-4 !border-l-[#D4AF37] bg-[#D4AF37]/5" : "bg-[#F9F8F3]"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`${id}-details`}
        className={`flex min-h-[58px] w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors active:bg-[var(--press)] ${
          best ? "bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10" : "bg-[#F9F8F3] hover:bg-[#D4AF37]/5"
        }`}
      >
        <span className="f-display min-w-0 flex-1 break-normal hyphens-manual text-[19px] font-semibold leading-tight text-[var(--ink)]">
          {name}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {priced && best && (
            <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#00213B] shadow-sm">
              BEST PRICE
            </span>
          )}
          {priced && <PriceTicket price={price} label={showFrom ? "from" : null} best={best} vendor />}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="-mr-1 shrink-0 text-[var(--gold-ink)]"
          >
            <ChevronDown size={18} strokeWidth={2.5} aria-hidden="true" />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`${id}-details`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#D4AF37]/30 bg-white p-4"
          >
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-2 text-[15px] text-[#00213B]">
              <Store size={15} aria-hidden="true" />
              <div><dt className="sr-only">Type</dt><dd>{type}</dd></div>
              <MapPin size={15} aria-hidden="true" />
              <div><dt className="sr-only">Location</dt><dd className="font-semibold">{location}</dd></div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

// Shared pill style for the main navy actions (SHOW RESULTS, SHOW MORE)
const NAVY_PILL =
  "bg-[#00213B] px-8 py-3.5 text-sm font-black uppercase tracking-wider text-[#F9F8F3] rounded-full shadow-md transition-all hover:bg-[#00213B]/90 hover:shadow-lg active:scale-[0.98]";

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
          <div className="absolute inset-0 bg-[#00213B]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
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
            className="relative w-full max-w-[380px] overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-[#F9F8F3] p-6 pt-7 shadow-2xl"
          >
            <div className="h-rauten absolute inset-x-0 top-0 h-1" aria-hidden="true" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full text-[#00213B]/60 transition-[background-color,color,transform] hover:bg-[#00213B]/5 hover:text-[#00213B] active:scale-90"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <p className="f-eyebrow text-xs font-extrabold tracking-widest text-[#D4AF37]">Your budget</p>
            <h2 id="budget-title" className="f-display mt-1 text-2xl font-black uppercase leading-none tracking-wide text-[#00213B]">
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

            <div className="tabular mt-4 flex items-center justify-between gap-3 text-[15px] font-semibold text-[#00213B]/70">
              <span>€0</span>
              <span
                className={`rounded-full p-[1px] transition-shadow ${
                  outOfRange ? "shadow-[0_0_0_2px_var(--danger)]" : "focus-within:shadow-[0_0_0_2px_rgba(212,175,55,0.28)]"
                }`}
              >
                <label className="flex cursor-text items-center justify-center gap-1 rounded-full border-2 border-[#D4AF37]/50 bg-white px-4 py-2 text-[#00213B] transition-colors hover:border-[#D4AF37] focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 focus-within:outline-none">
                  <span aria-hidden="true" className="text-xl font-black text-[#00213B]">€</span>
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
                    className="tabular w-16 min-w-0 border-0 bg-transparent text-center text-xl font-black text-[#00213B] placeholder:text-[#00213B]/40 focus:outline-none"
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

            <div className="mt-5 text-center">
              <button type="submit" className={NAVY_PILL}>
                Show results
              </button>
            </div>
            {value !== null && (
              <button
                type="button"
                onClick={() => onApply(null)}
                className="mx-auto mt-3 block rounded-md px-2 text-xs font-bold text-[#00213B]/70 underline underline-offset-4 transition-[color,transform] hover:text-[#00213B] active:scale-[0.98]"
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

const SEARCH_HINT = "What are you looking for? (e.g. Helles, Brezn, souvenirs)";

function HomeScreen({ onOpenCategory, onOpenItem }) {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const matches = q ? SEARCH_INDEX.filter((e) => e.haystack.includes(q)) : [];

  return (
    <ScrollArea label="Start">
      <section className="pt-9">
        <p className="f-eyebrow text-[var(--gold-ink)]">Theresienwiese · München</p>
        <h1 className="f-display mt-2 text-[46px] font-extrabold uppercase leading-[.88] tracking-[-.005em]">
          Find the best prices at
          <span className="f-gothic mt-1 block text-[1.02em] normal-case leading-[1] tracking-normal text-[#00213B]">
            Oktoberfest
          </span>
        </h1>
        <p className="mt-3 max-w-[30ch] text-[16px] leading-snug text-[var(--muted)]">
          Search for a product, set your budget and compare vendors.
        </p>
      </section>

      <form
        role="search"
        className="relative mt-5 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (matches[0]) onOpenItem(matches[0]);
        }}
      >
        <label htmlFor="home-search" className="sr-only">{SEARCH_HINT}</label>
        <Search size={19} strokeWidth={2.25} aria-hidden="true" className="pointer-events-none absolute left-4 top-[26px] -translate-y-1/2 text-[var(--muted)]" />
        <input
          id="home-search"
          type="search"
          aria-label={SEARCH_HINT}
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={SEARCH_HINT}
          className="h-[52px] w-full rounded-full border border-[#D4AF37]/40 bg-[var(--surface)] transition-colors hover:border-[#D4AF37] focus:border-[#D4AF37] p-4 pl-11 pr-11 text-[14px] leading-5 text-[var(--ink)] shadow-sm placeholder:text-[var(--muted)] sm:text-[16px] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--gold)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-[26px] grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--press)] text-[var(--muted)] transition-transform active:scale-90"
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
              className="absolute inset-x-0 top-[60px] z-10 max-h-[min(60vh,420px)] overflow-y-auto rounded-2xl border border-[#D4AF37]/40 bg-[var(--surface)] shadow-[0_12px_28px_-12px_rgba(10,25,47,.28)]"
            >
              {matches.length ? (
                <ul aria-label="Search results" className="h-group rounded-none">
                  {matches.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => onOpenItem(m)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#D4AF37]/5 active:bg-[var(--press)]"
                      >
                        <CategoryIcon category={CATEGORY_BY_ID[m.category]} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="f-display block truncate text-[18px] font-semibold leading-tight">{m.name}</span>
                          <span className="block text-[13px] text-[var(--muted)]">{CATEGORY_BY_ID[m.category].label}</span>
                        </span>
                        {hasPrice(m.from) ? <PriceTicket price={m.from} label="from" /> : null}
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

      <div className="mt-6 w-full">
        <h2 className="f-eyebrow mb-2 text-[var(--muted)]">Browse the Wiesn</h2>
        <nav aria-label="Categories">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {CATEGORIES.map((c) => (
              <li key={c.id} className="sm:last:odd:col-span-2">
                <button
                  type="button"
                  onClick={() => onOpenCategory(c.id)}
                  className="group flex min-h-[52px] w-full items-center justify-between gap-4 rounded-2xl border border-[#D4AF37]/60 bg-[#00213B] p-4 text-left shadow-md transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-[#D4AF37]/70 hover:shadow-md active:scale-[0.98] active:bg-[#00213B]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                      <img
                        src={CATEGORY_ART[c.id]}
                        alt=""
                        aria-hidden="true"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="h-full w-full scale-125 object-contain brightness-110 drop-shadow-sm"
                      />
                    </div>
                    <span className="flex-1 text-base font-extrabold uppercase tracking-wide text-white">{c.label}</span>
                  </div>
                  <ChevronRight
                    size={22}
                    strokeWidth={2.5}
                    aria-hidden="true"
                    className="text-xl text-[#D4AF37] transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[var(--muted)]">
        <PretzelMark size={18} className="text-[var(--gold)]" />
        Illustrative placeholder prices, not field-verified
      </div>
    </ScrollArea>
  );
}

function ListScreen({ view, maxPrice, setMaxPrice, onNavigate, onBack }) {
  const { category: categoryId, sub: subId, item: itemId, focus } = view;
  const cat = CATEGORY_BY_ID[categoryId];
  const sub = cat.subs.find((s) => s.id === subId) ?? cat.subs[0];
  const product = itemId ? PRODUCTS.find((p) => p.id === itemId) : null;
  // Vendor view: the vendors offering one product; otherwise the category's products
  const isVendorView = Boolean(product);

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
    return itemsFor(categoryId, sub.id).map((i) => ({ ...i, price: fromPrice(i) }));
  }, [product, categoryId, sub.id]);

  const priceCeiling = Math.max(20, Math.ceil(Math.max(...rows.map((r) => r.price)) / 5) * 5);
  const budgetActive = maxPrice !== null && maxPrice < priceCeiling;

  const visible = useMemo(() => {
    const list = rows.filter((r) => maxPrice === null || r.price <= maxPrice);
    const byPrice = (a, b) => a.price - b.price || a.name.localeCompare(b.name);
    const byName = (a, b) => a.name.localeCompare(b.name);
    list.sort(product ? byPrice : byName);
    return sortDesc ? list.reverse() : list;
  }, [rows, maxPrice, sortDesc, product]);

  // "Best price" only means something when there is more than one vendor to compare
  const bestPrice = product && visible.length > 1 ? Math.min(...visible.map((r) => r.price)) : null;

  // Show one page at a time; a search result opened from the start screen is always on the first page shown
  const focusIndex = focus ? visible.findIndex((r) => r.id === focus) : -1;
  const shown = visible.slice(0, Math.max(limit, focusIndex + 1));
  const remaining = visible.length - shown.length;

  const title = product ? product.name : sub.id === "all" ? cat.label : sub.label;
  const countLabel = isVendorView
    ? `${visible.length} ${visible.length === 1 ? "vendor" : "vendors"} found`
    : `${visible.length} ${visible.length === 1 ? "product" : "products"}`;

  const SortIcon = product ? (sortDesc ? ArrowDown10 : ArrowDown01) : sortDesc ? ArrowDownZA : ArrowDownAZ;
  const sortLabel = product
    ? sortDesc ? "Sorted by price, highest first" : "Sorted by price, lowest first"
    : sortDesc ? "Sorted Z to A" : "Sorted A to Z";

  // Sticky controls: back + category title, then sub-category chips with the price and sort buttons
  const pinned = (
    <div className="flex w-full flex-col gap-0 pt-2">
      <div className="mb-6 mt-6 flex w-full items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={product ? `Back to ${sub.id === "all" ? cat.label : sub.label} list` : "Back to start"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2 text-xl font-bold text-[#00213B] transition-[background-color,transform] hover:bg-[#00213B]/5 active:scale-95"
        >
          <ArrowLeft size={24} strokeWidth={2.4} />
        </button>
        <div className="min-w-0 flex-1 px-2 py-2">
          <Dropdown
            id="category-dropdown"
            label="Category"
            value={categoryId}
            options={CATEGORIES}
            onChange={(id) => onNavigate({ category: id, sub: "all", item: null })}
          />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1.5">
        <div ref={chipsRef} role="radiogroup" aria-label="Sub-category" className="h-chips -my-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 pr-2">
          {cat.subs.map((s) => {
            const active = s.id === sub.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => !active && onNavigate({ category: categoryId, sub: s.id, item: null })}
                // The active chip's 2px border takes 1px from each side's padding so chips don't change width
                className={`h-9 shrink-0 rounded-full text-[14px] transition-[background-color,border-color,color,transform] duration-150 active:scale-95 ${
                  active
                    ? "border-2 border-[#D4AF37] bg-white px-[11px] font-semibold text-[#B8962E] shadow-sm"
                    : "border border-[#D4AF37]/30 bg-white/80 px-3 font-medium text-[#00213B]/80 hover:border-[#D4AF37]"
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
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-95 ${
            budgetActive || budgetOpen
              ? "border-2 border-[#D4AF37] bg-white text-[#D4AF37] shadow-sm"
              : "bg-[var(--surface)] text-[var(--gold-ink)] hover:bg-[var(--press)]"
          }`}
        >
          <SlidersHorizontal size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            setSortDesc((v) => !v);
            restartList();
          }}
          aria-label={`${sortLabel}. Reverse order`}
          title={sortLabel}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#D4AF37] transition-[background-color,transform] hover:bg-[var(--press)] active:scale-90"
        >
          <SortIcon size={20} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ScrollArea ref={scrollRef} label={title} pinned={pinned} extraBottomPadding>
        {product && (
          <div className="mb-2 mt-6">
            <h2 className="f-display mb-1 text-xl font-bold uppercase leading-tight tracking-wide text-[#00213B]">{title}</h2>
            <p className="tabular mb-4 text-[13px] text-[var(--muted)]" aria-live="polite">{countLabel}</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {budgetActive && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="mb-4 mt-2 flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#F9F8F3] px-3 py-1 text-xs text-[#00213B]/70 shadow-sm transition-colors hover:border-[#D4AF37]"
            >
              <button
                type="button"
                onClick={() => setBudgetOpen(true)}
                aria-label={`Maximum price ${formatPrice(maxPrice)}. Change filter`}
                className="flex items-center gap-1.5 transition-transform active:scale-[0.98]"
              >
                <span className="font-medium text-[#00213B]/60">Max Price:</span>
                <span className="tabular font-bold text-[#00213B]">{formatPrice(maxPrice)}</span>
              </button>
              <button
                type="button"
                onClick={() => changeBudget(null)}
                aria-label="Clear maximum price filter"
                className="ml-1 grid h-5 w-5 shrink-0 place-items-center text-xs text-[#00213B]/50 transition-[color,transform] hover:text-[#00213B] active:scale-90"
              >
                <X size={14} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {visible.length ? (
          <>
            <motion.ul
              layout
              transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
              className="mt-1 divide-y divide-[#D4AF37]/25 overflow-hidden rounded-2xl border border-[#D4AF37]/40 !bg-[#F9F8F3] shadow-sm transition-all duration-300 ease-in-out"
            >
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
            </motion.ul>
            <div className="mt-5 flex flex-col items-center gap-2.5">
              <p className="f-eyebrow tabular text-[var(--muted)]">
                Showing {shown.length} of {visible.length}
              </p>
              {remaining > 0 && (
                <button type="button" onClick={() => setLimit(shown.length + PAGE_SIZE)} className={NAVY_PILL}>
                  Show more
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-[#D4AF37]/40 bg-[#F9F8F3] px-6 pb-8 pt-7 text-center shadow-sm">
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

// About page: each section is one gold-bordered card; the steps inside are plain rows with navy badges
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
    <h2 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#00213B]">
      <span className="font-extrabold text-[#D4AF37]">—</span> {children}
    </h2>
  );
  const CARD = "mb-4 rounded-2xl border border-[#D4AF37]/40 bg-[#F9F8F3] p-4 shadow-sm";
  return (
    <ScrollArea label="About Hermes">
      <article className="flex w-full flex-col pb-8 text-[16px] leading-relaxed">
        <div className="mb-5 flex items-center gap-2 pt-14">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="rounded-full p-1 text-[#00213B] transition-[background-color,transform] hover:bg-[#00213B]/5 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex items-center gap-1.5 text-xl font-black uppercase tracking-wide text-[#00213B]">
            ABOUT <span className="font-serif text-xl font-bold lowercase first-letter:uppercase">Hermes</span>
          </h1>
        </div>
        <section className={CARD}>
          <Heading>FIND PRICES</Heading>
          <p className="text-sm leading-relaxed text-[#00213B]/80">
            Hermes helps you compare prices for drinks, food, rides, games and merchandise at Oktoberfest.
          </p>
        </section>
        <section className={CARD}>
          <Heading>HOW IT WORKS</Heading>
          <ol className="mt-3 space-y-3">
            {steps.map(([n, text]) => (
              <li key={text} className="flex items-center gap-3 text-sm text-[#00213B]">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00213B] text-xs font-bold text-white">
                  {n}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </section>
        <section className={CARD}>
          <Heading>ABOUT PRICES</Heading>
          <p className="text-sm leading-relaxed text-[#00213B]/80">
            Prices are based on the data provided for the Oktoberfest. Prices may change. In this prototype they are sample prices
            in line with recent Wiesn ranges, for example €14.50–€15.80 for a Maß of Festbier.
          </p>
        </section>
        <section className={CARD}>
          <Heading>DATA</Heading>
          <p className="text-sm leading-relaxed text-[#00213B]/80">Last updated: Sept 2026 (sample data for this prototype)</p>
        </section>
      </article>
    </ScrollArea>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */

export default function App() {
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

  const openSearchResult = (entry) => openList({ category: entry.category, item: entry.id });

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
        <div className="relative h-full overflow-hidden text-[var(--ink)]">
          <Header
            hairline={headerLine}
            onHome={() => navigate({ screen: "home" }, -1)}
            onInfo={() => view.screen !== "about" && navigate({ screen: "about", from: view })}
          />

          <main className="flex h-full flex-col pt-0">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={viewKey}
                custom={direction}
                initial={{ opacity: 0, x: 24 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 * direction }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col pt-1"
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
