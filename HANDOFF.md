# Hermes / Wiesn Finder: Front-End Handoff

This file is the blueprint for the production front end. The target is the prototype in this repository at commit `36ef6fc`, deployed at **https://re-di-lab-hermes.vercel.app/**. Where this document and the prototype disagree, the prototype wins; please flag the difference.

Every value below was read from `src/App.jsx` at `36ef6fc` and checked against the live site at 375 px and 1280 px wide. Pixel positions in brackets are measured on the live site.

## Contents

1. [Prototype reference and live demo](#1-prototype-reference-and-live-demo)
2. [Design tokens and visual system](#2-design-tokens-and-visual-system)
3. [Layout and navigation](#3-layout-and-navigation)
4. [Core components and data model](#4-core-components-and-data-model)
5. [Developer implementation checklist](#5-developer-implementation-checklist)

---

## 1. Prototype reference and live demo

- **Live demo:** https://re-di-lab-hermes.vercel.app/
- **Source:** `Mathou2712/Mathou2712`, branch `main`, commit `36ef6fc`
- **Stack:** React 18 + Vite 5 + Tailwind CSS 3 (utility classes, mostly arbitrary values such as `bg-[#00213B]`), framer-motion for animation, lucide-react for icons.

### Files that define the target

| File | What it holds | Use it for |
| --- | --- | --- |
| `src/App.jsx` | The whole app in one file: theme CSS, data model, every component and screen | The single source of truth for UI, behavior and data |
| `index.html` | Root page, `<title>`, meta description, `#root` mount point | Page shell |
| `src/main.jsx` | Mounts `<App />` in `React.StrictMode`, imports `src/index.css` | Entry point |
| `src/index.css` | `@tailwind base/components/utilities` plus a few base resets | Tailwind setup (its colors and font are overridden by the theme in `App.jsx`) |
| `tailwind.config.js` | Default Tailwind theme, no extensions; scans `index.html` and `src/**/*.{js,ts,jsx,tsx}` | Tailwind config |
| `public/oktoberfest-logo.png` | Header logo (imported in `App.jsx`) | Asset |
| `public/icons/{drinks,foods,rides,games,souvenirs}.png` | Category artwork on the Home cards | Assets |

**Not used, do not copy:** `src/App.css` and `src/main.js` are leftovers from an earlier version. Nothing imports them, and their colors (`#0d2c5b`, `#e7b94a`, Segoe UI) are **not** the design system.

### How `src/App.jsx` is organized (top to bottom)

| Block | Contents |
| --- | --- |
| Theme | `THEME_CSS` string injected with `<style>`: Google Fonts import, CSS variables, helper classes (`.f-display`, `.h-ticket`, `.h-range` …) |
| Data (workbook mirror) | `ATTRIBUTES`, `AREAS`, `VENDORS`, `OFFERINGS`, `PRODUCT_ATTRIBUTES`, `PRODUCT_ROWS`, generated from `Project_Hermes_MVP_Placeholder_Data_Model.xlsx` |
| Data (derived) | `CATEGORY_LIST`, audience tags, `PRODUCTS`, `CATEGORIES` (with chip lists), `SEARCH_INDEX`, `normalize()` |
| Building blocks | `Header`, `ScrollArea`, `CategoryIcon`, `PriceTicket`, `Dropdown`, `LinkRow`, `ExpandRow`, `BudgetPopup` |
| Screens | `HomeScreen`, `ListScreen`, `AboutScreen` |
| `App` | View state machine, navigation, page transitions |

There is no router. `App` keeps one `view` object in state:

```js
{ screen: "home" }
{ screen: "about", from: <previous view> }
{ screen: "list", category, sub, item, focus }
```

---

## 2. Design tokens and visual system

### 2.1 Color palette

The palette is **light-only** (there is no dark mode). Every color in the UI is one of these, or one of them with an opacity.

| Token | Hex | Used for |
| --- | --- | --- |
| Navy (ink) | `#00213B` | Header, all body text, category cards, price pills, primary buttons, step badges |
| Gold | `#D4AF37` | Borders, accents, active filter button icon, slider thumb, best-price badge, "OKTOBERFEST PRICES" |
| Deep gold | `#B8962E` | Gold **text** (active chip label, eyebrow "Theresienwiese · München", chevrons in vendor rows), hover of the gold button |
| Cream (page) | `#F9F8F3` | Page background, list rows, cards, popup and dropdown surfaces |
| White | `#FFFFFF` | Search input, chips, expanded vendor detail panel, text on navy |
| Danger | `#A3261C` | Budget input error ring and message only |
| Bavarian blue | `#005293` | Only inside the blue-and-white diamond stripe ("Rautenmuster") above and below the header and on top of the budget popup |

CSS variables (in `THEME_CSS`):

```css
--bg: #F9F8F3;  --surface: #FFFFFF;  --ink: #00213B;
--muted: rgba(0,33,59,.68);   /* secondary text */
--hair: rgba(0,33,59,.12);    /* hairlines */
--press: rgba(212,175,55,.12);/* pressed/hover tint */
--gold: #D4AF37;  --gold-deep: #B8962E;  --gold-ink: #B8962E;  --on-gold: #00213B;
--danger: #A3261C;
--hh: calc(60px + env(safe-area-inset-top, 0px)); /* header offset used by the scroll area */
```

Opacity variants in use (Tailwind syntax): navy `/5` `/10` `/50` `/60` `/70` `/80` `/90`; gold `/5` `/10` `/15` `/20` `/25` `/30` `/40` `/50` `/60` `/70`; `white/5` `white/80`.

**Rule:** no default Tailwind palette colors (`gray-*`, `slate-*`, `blue-*` …) anywhere.

### 2.2 Typography

Loaded from Google Fonts: **Barlow** 400/500/600/700, **Barlow Condensed** 600/700/800, **Grenze Gotisch** 700.

| Role | Font | Size / line height | Weight | Case and tracking | Example |
| --- | --- | --- | --- | --- | --- |
| Body default | Barlow | 16px | 400 | — | About text |
| Display (`.f-display`) | Barlow Condensed | per use | 600–800 | — | names, titles |
| Eyebrow (`.f-eyebrow`) | Barlow Condensed | 12px | 700 | UPPERCASE, `0.14em` | "THERESIENWIESE · MÜNCHEN", "BROWSE THE WIESN", "SHOWING 8 OF 10" |
| Header wordmark | Barlow Condensed | 26px | 800 | UPPERCASE, `0.04em` | "HERMES" |
| Header tagline | Barlow Condensed | 9px | 700 | UPPERCASE, `0.22em`, gold | "OKTOBERFEST PRICES" |
| Home H1 | Barlow Condensed | 46px / 0.88 | 800 | UPPERCASE, `-0.005em` | "FIND THE BEST PRICES AT" |
| H1 accent | Grenze Gotisch | 1.02em (≈47px) / 1 | 700 | normal case | "Oktoberfest" |
| Home intro | Barlow | 16px, `leading-snug`, max 30ch | 400 | muted | "Search for a product…" |
| Category card label | Barlow | 16px | 800 | UPPERCASE, `tracking-wide`, white | "DRINKS" |
| List title (dropdown) | Barlow Condensed | 20px | 800 | UPPERCASE, `tracking-wide` | "DRINKS ⌄" |
| Product / vendor row name | Barlow Condensed | 19px, `leading-tight` | 600 | normal | "Mass Helles (1L)" |
| Product view title | Barlow Condensed | 20px | 700 | UPPERCASE, `tracking-wide` | "MASS HELLES (1L)" |
| Chip label | Barlow | 14px | 500 inactive / 600 active | normal | "Non-Alcoholic" |
| Price pill (list) | Barlow 14px + label Barlow Condensed 9.5px | 700 | label UPPERCASE `0.1em` | "FROM €4.80" |
| Price pill (vendor) | Barlow 12px + label 9px | 900 | label UPPERCASE | "€14.80" |
| Button (navy pill) | Barlow 14px | 900 | UPPERCASE, `tracking-wider` | "SHOW MORE" |
| Popup title | Barlow Condensed 24px | 900 | UPPERCASE | "MAXIMUM PRICE" |
| Prices | `font-variant-numeric: tabular-nums` (`.tabular`) | | | | |

Price format: `€` + number; whole numbers without decimals (`€10`), otherwise two decimals (`€14.80`).

### 2.3 Spacing and layout grid

| Item | Value |
| --- | --- |
| Content container (all screens and header) | `mx-auto w-full max-w-2xl px-4` → max 672px wide, 16px side padding |
| Content edges at 375px | 16px → 359px |
| Content edges at 1280px | 320px → 960px |
| Header inner row height | 74px |
| Space between stacked category cards | 12px mobile (`gap-3`), 16px from 640px (`sm:gap-4`) |
| Chip gap | 6px (`gap-1.5`) |
| Row padding (list rows) | `px-4 py-3.5`, min height 58px |
| Expanded detail panel padding | 16px (`p-4`) |
| About cards | `p-4`, 16px gap below each (`mb-4`) |
| Bottom padding of scroll area | 36px, or 80px on list screens (+ safe-area inset) |

### 2.4 Border radii

| Radius | Tailwind | Used for |
| --- | --- | --- |
| Full pill | `rounded-full` (9999px) | Search input, chips, price pills, BEST PRICE badge, navy buttons, icon buttons, budget input, max-price tag |
| 16px | `rounded-2xl` | Category cards, product/vendor list frame, About cards, budget popup, dropdown menu, search results panel, empty state |
| 12px | `rounded-[12px]` | Category icon tile (36–40px) |
| 9px | `rounded-[9px]` | Small category icon tile in search results |
| 8px | `rounded-lg` | Dropdown menu items, header logo focus area |

### 2.5 Borders

| Element | Border |
| --- | --- |
| List frame, About cards, empty state, search results panel, search input | `1px` gold at 40% |
| Category card (Home) | `1px` gold at 60% (70% on hover) |
| Row dividers inside lists | `1px` gold at 25% (`divide-y`) |
| Expanded panel top line | `1px` gold at 30% |
| Active chip / active filter button | `2px` solid gold |
| Inactive chip | `1px` gold at 30% (solid gold on hover) |
| Budget popup, dropdown menu | `2px` solid gold |
| Budget input | `2px` gold at 50% (solid on hover/focus) |
| Best-price row | `4px` solid gold left border |
| Header info button | `1px` gold at 40% (solid on hover) |

### 2.6 Shadows

| Element | Shadow |
| --- | --- |
| Header | `0 8px 18px rgba(0,33,59,0.18)`; when content scrolls under it, add `0 1px 0 rgba(255,255,255,0.16)` |
| Category card | Tailwind `shadow-md` |
| List frame, chips (active), search input, About cards | Tailwind `shadow-sm` |
| Navy pill button | `shadow-md`, `shadow-lg` on hover |
| Search results panel | `0 12px 28px -12px rgba(10,25,47,.28)` |
| Budget popup | `shadow-2xl` over a navy 60% backdrop with `backdrop-blur-sm` |
| Dropdown menu | `shadow-xl` |
| Slider thumb | `0 0 0 4px rgba(0,33,59,.1), 0 4px 8px rgba(0,33,59,.28)` |
| Sticky filter bar when scrolled | `0 1px 0 rgba(0,33,59,.12)` |

### 2.7 Motion

| Interaction | Animation |
| --- | --- |
| Screen change | Fade + slide 24px, 0.18s ease-out; forward slides from the right, back from the left |
| Vendor row expand | Height 0 → auto + fade, 0.2s |
| Chevron (row, dropdown) | Rotates 0° → 180°, 0.2s ease-in-out |
| List re-order / filter | framer-motion `layout`, 0.3s ease-in-out |
| Budget popup | Spring (stiffness 430, damping 32), from `y:-18, scale:0.96` |
| Dropdown menu | Fade + `y:-6`, `scale:0.98`, 0.16s |
| Press feedback | `active:scale-[0.98]` on cards and buttons (0.95/0.9 on small icon buttons) |
| Reduced motion | Respect `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` + CSS transition reset) |

Focus ring everywhere: `outline: 2px solid #D4AF37; outline-offset: 2px` on `:focus-visible`.

---

## 3. Layout and navigation

### 3.1 App shell

- The page itself never scrolls: `html, body, #root { height: 100%; overflow: hidden }`.
- Each screen has **one** scroll container (`ScrollArea`). It reserves scrollbar space on both sides (`scrollbar-gutter: stable both-edges`) so content stays centered and doesn't shift between screens.
- The header is `position: absolute` on top. The scroll area starts with a `var(--hh)` spacer so content begins below the header.
- On list screens, the controls (back button, category title, chips, filter and sort) are a **sticky bar** pinned under the header (`top: var(--hh)`, background `rgba(249,248,243,.98)`). The list scrolls underneath it, and a hairline shadow appears once the list has scrolled.

### 3.2 Header (all screens)

```
[ diamond stripe 6px ]
[ logo 40px ] HERMES            ( i )      ← 74px row, navy #00213B
              OKTOBERFEST PRICES
[ diamond stripe 8px ]
```

- Total height **88px** (6 + 74 + 8).
- Logo and wordmark form one button: it goes to Home.
- Info button: 40×40, round, gold 40% border, opens About.
- The inner row uses the same container as the content, so the logo's left edge lines up with the content [16px at 375; 320px at 1280].

### 3.3 Screens and navigation flow

```
Home ──(category card)──► Category list ──(product row)──► Vendor list (one product)
  │                           │  ▲ back                         │ back ▲
  │                           └── dropdown switches category ───┘
  ├─(search result)──► Vendor list for that product
  │                    (Merchandise result → Merchandise stand list, that stand opened)
  └─(info button, any screen)──► About ──(back)──► previous screen
```

| Screen | Contents, top to bottom |
| --- | --- |
| **Home** | Eyebrow "THERESIENWIESE · MÜNCHEN" (gold) · H1 "FIND THE BEST PRICES AT / Oktoberfest" · intro line · search bar · eyebrow "BROWSE THE WIESN" · 5 category cards · footer note "Illustrative placeholder prices, not field-verified" with a pretzel icon |
| **Category list** | Sticky: ← back · category name as a dropdown · chip row + filter button + sort button. Then the optional max-price tag, the product list (or stand list for Merchandise), "SHOWING X OF Y" and a "SHOW MORE" button |
| **Vendor list** | Same sticky bar · product name (H2) and "N vendors found" · vendor rows, cheapest first |
| **About** | ← back + "ABOUT Hermes" title, 56px top padding · 4 gold-bordered cards: Find prices, How it works (6 numbered steps with navy badges), About prices, Data |

**Back button rules:** in a vendor list it returns to that category's product list, keeping the selected chip. In a category list it returns to Home. In About it returns to the screen that opened About.

### 3.4 Category cards (Home)

Order: **Drinks, Food, Rides, Games, Merchandise**.

- Card: navy `#00213B` background, `rounded-2xl`, gold 60% border, `p-4`, `shadow-md`.
- Inside: 40px category artwork (PNG, scaled 125%), white uppercase label, gold chevron on the right.
- Hover: lifts 2px (`-translate-y-0.5`), and the chevron nudges right.

### 3.5 Responsive rules

There is one breakpoint, Tailwind `sm` = **640px**. Everything else scales by container width.

| | Mobile (375px) | Desktop (≥ 640px, measured at 1280px) |
| --- | --- | --- |
| Container | 343px wide, x 16→359 | max 672px; 640px of content, x 320→960 |
| Category cards | 1 column, 343 × 74px each, 12px gap | 2 columns (312px each), 16px gap; the 5th card (Merchandise) spans both columns (`sm:last:odd:col-span-2`) |
| Search input text | 14px | 16px |
| Header | Full width; logo and info button aligned to the container | Same |
| Lists, chips, popup | Same layout, wider | Same layout, wider; popup max 380px |

Safe areas are respected: top inset on the header and `--hh`, bottom inset on scroll padding.

---

## 4. Core components and data model

### 4.1 Data model

The data is the **placeholder workbook** `Project_Hermes_MVP_Placeholder_Data_Model.xlsx`, mirrored in `App.jsx`. The workbook's IDs are kept, so every row can be traced back to it.

| Entity | Count | Fields |
| --- | --- | --- |
| Category | 5 | `id` (`drinks`, `foods`, `rides`, `games`, `merch`), `code` (`C001`, `C003`, `C004`, `C005`, `C006`), `label` (Drinks, Food, Rides, Games, Merchandise), `listsVendors` (Merchandise only) |
| Attribute | 6 in workbook + 2 app-only | `code` (A001–A006, `FAMILY`, `ADULT`), `id`, `label` |
| Area | 2 | A001 Oktoberfest, A002 Oide Wiesn (not shown in the UI yet) |
| Vendor | 35 | `id` (V001–V035), `name`, `type` (label), `area`, `location` |
| Product | 50 in workbook, **47 shown** | `id` (P001–P125, not contiguous), `category`, `name` (= `product_name` + ` (variant)` unless the variant is "Standard"), `unit`, `traditional`, `attrs[]`, `prices[]` |
| Offering | 83 | `vendorId`, `productId`, `price` (EUR), `isNew` |

Rules:
- A product's `prices[]` comes from its offerings, sorted cheapest first. Its **"from" price** is the minimum.
- **Products with no offering are hidden everywhere:** P002 Mass Weissbier, P004 Radler, P005 Alcohol-Free Beer.
- Vendor type labels map from the workbook: `large_tent` → "Large tent", `small_tent` → "Small tent", `oide_tent` → "Oide Wiesn tent", `food_stand` → "Food stand", `ride` → "Ride", `game` → "Game stand", `merch_stand` → "Merchandise stand".
- Attributes **A005 Hot** and **A006 Cold** are in the workbook but ignored by the app.
- **Family-Friendly / Adult-Friendly** exist only in the app (`PRODUCT_AUDIENCE`). Rides follow the workbook's `Activity_Details.family_friendly` flag: only the Roller Coaster and Top Scan rides are Adult-Friendly. Games are sorted by type: the Shooting Gallery options and Strongman Hammer are Adult-Friendly, and Ring Toss, Duck Fishing, Lottery Ticket and Can Knockdown are Family-Friendly.
- All prices are illustrative placeholders, not field-verified.

### 4.2 Filter chips

The chips are a horizontal, scrollable radio group (`role="radiogroup"`). Exactly one chip is selected; "All" is the default. The scrollbar is hidden, and the right edge fades out over 22px.

| Category | Chips (products shown) |
| --- | --- |
| Drinks | All (9) · Alcoholic (2) · Non-Alcoholic (7) |
| Food | All (14) · Vegan (4) · Non-Vegan (10) |
| Rides | All (10) · Family-Friendly (8) · Adult-Friendly (2) |
| Games | All (8) · Family-Friendly (4) · Adult-Friendly (4) |
| Merchandise | All (3 stands) |

The chip list is **derived**: "All" plus every attribute that at least one product in the category carries, in attribute order. When a chip is selected, the list title becomes "<Chip> <Category>" (for example "Vegan Food"); this shows as the screen's accessible label.

| State | Classes |
| --- | --- |
| Default | `h-9 rounded-full px-3 text-[14px] font-medium border border-[#D4AF37]/30 bg-white/80 text-[#00213B]/80` |
| Hover | border becomes solid `#D4AF37` |
| **Active** | `border-2 border-[#D4AF37] bg-white px-[11px] font-semibold text-[#B8962E] shadow-sm` (padding drops by 1px so the chip keeps the same width) |
| Pressed | `active:scale-95` |

Selecting a chip keeps the current budget and restarts paging. When the screen opens, the selected chip is scrolled into the middle of the row.

### 4.3 Budget filter (filter button → popup)

**Filter button:** a 36px round icon button (sliders icon) to the right of the chips.
- Idle: white with a deep-gold icon.
- Popup open **or** a budget set: white, 2px gold border, gold icon, `shadow-sm`.
- **Hidden in Merchandise**, which shows no prices.

**Popup:**
- **Layout:** a dialog 88px from the top (header + 28px), max 380px wide, cream, 2px gold border, `rounded-2xl`, with a diamond stripe on top. It sits over a navy 60% backdrop with blur. Clicking the backdrop or pressing Esc closes it.
- **Content:** the eyebrow "YOUR BUDGET" (gold), then the title "MAXIMUM PRICE", then the line "Set your maximum price to see available vendors."
- **Slider:**
  - Range: **min 0**, **max = price ceiling**, **step 0.1**.
  - Track: 6px, navy fill up to the thumb, gold 25% after it.
  - Thumb: 28px gold circle with a 2px white border; scales up on hover.
- **Price ceiling:** `max(20, ceil(highest price in this view / 5) × 5)`. That is €20 for Drinks, €30 for Food, and €20 for the Mass Helles vendor list.
- **Readout:** "€0" on the left, the maximum price on the right, and a white pill input in the middle showing the current value.
  - The input and slider stay in sync both ways.
  - The input accepts up to two decimals, with a comma or a dot.
  - A value outside 0–ceiling shows a red ring and the message "Enter a price from €0 to €X." The default hint is "Drag the slider or type a price."
- **Buttons:**
  - "SHOW RESULTS" (navy pill) applies the price. Choosing the ceiling itself means "no limit".
  - "Remove price limit" (underlined text link) appears only when a limit is set, and clears it.
- **Filtering logic:**
  - In a product list, a product is kept when its **"from" price ≤ max**.
  - In a vendor list, a vendor is kept when **its price ≤ max**.
- **When it resets:** the budget belongs to the current category. Switching category clears it, but opening a product inside the category keeps it.
- **Active readout:** a pill under the sticky bar, "Max Price: €X ✕". Tapping the text reopens the popup, and ✕ clears the limit.
- **Empty result:** a cream card with a beer mug illustration, "NOTHING AT €X OR LESS", "Raise your maximum price to see more products/vendors." and a gold "CHANGE MAXIMUM PRICE" button.

### 4.4 Lists and cards

All lists use the **same frame**: `rounded-2xl`, 1px gold 40% border, cream background, `shadow-sm`, rows divided by 1px gold 25% lines. **Rows run flush to the frame**: no inner margins, no floating cards.

**Paging:** 8 rows at a time. Below the list is "SHOWING X OF Y" (eyebrow), plus a "SHOW MORE" navy pill while more remain.

**Sort button** (36px, gold icon, A–Z or 0–9 arrows):
- Product lists and Merchandise sort by name A–Z, then Z–A.
- Vendor lists sort by price, lowest first, then highest first.

#### Fields shown per category

| View | Row shows | Tap does | Expanded panel shows |
| --- | --- | --- | --- |
| **Drinks / Food / Rides / Games – product list** | Name (19px Barlow Condensed) · navy pill "FROM €X" · chevron › | Opens that product's vendor list | — |
| **Vendor list (one product)** | Vendor name · price pill `€X` · chevron ⌄. The cheapest vendor(s), **only when 2+ vendors**, get a gold "BEST PRICE" badge, a gold price pill, a 4px gold left border and a gold 5% tint | Expands / collapses in place | Stand type (store icon) and location (pin icon, semibold) |
| **Merchandise – stand list** | Stand name · chevron ⌄. **No price, no badge** | Expands / collapses | Stand type and location only |

**Why Merchandise is different:** a souvenir stand sells a mix of items (pins, mugs, hats, gingerbread hearts), so there is no single product to compare across vendors. Merchandise therefore skips the product level, lists the **stands** directly (Balloon Seller Munich, Lebkuchenherz Stand Rosi, Souvenir Stand Bavaria), and shows **no prices anywhere**. For the same reason there is no budget filter and no "from" price. This is driven by `listsVendors: true` on the category.

#### Price pills

| Variant | Look |
| --- | --- |
| Product "from" pill | 26px high, navy, white text, label "FROM" in 9.5px condensed caps + price 14px bold |
| Vendor price pill | Navy, white 12px black-weight text, min-width 54px |
| Vendor price pill (best) | Gold `#D4AF37` background, navy text |
| BEST PRICE badge | Gold pill, navy 10px black-weight caps |

### 4.5 Vendor detail (expanded row)

- This is an **in-place accordion**, not a modal or drawer. Only **one** row is open at a time; opening another closes the first.
- The row stays **full width inside the list frame**. The header part keeps its cream background, and the title color does not change.
- Below it, a **white panel** (`bg-white p-4`) with a gold 30% top line holds:
  - store icon + stand type (15px)
  - pin icon + location (15px, semibold)
- Nothing follows the location line; the panel ends with its 16px padding.
- The chevron turns 180° when open. The panel opens and closes with a 0.2s height animation.
- Hover tints the row gold 5% (10% on the best-price row). Press tints it gold 12%.

### 4.6 Search bar (Home)

- **Look:**
  - 52px tall, full container width, `rounded-full`.
  - White background, gold 40% border (solid on hover and focus), `shadow-sm`.
  - Search icon on the left; a round ✕ clear button on the right appears once there is text.
- **Placeholder:** "What are you looking for? (e.g. Helles, Brezn, souvenirs)"
- **Auto-expand:** results appear on **every keystroke**, with no debounce, in a panel 60px below the input top.
  - The panel is white, `rounded-2xl`, gold 40% border, max height `min(60vh, 420px)`, and scrolls.
  - Each result shows a navy category tile, the name (18px condensed), the category label, and a "FROM €X" pill (no pill for Merchandise).
- **No results:** pretzel icon + "Nothing called "…" on the Wiesn. Try "Maß", "Brezn" or "roller coaster"."
- **Enter key:** opens the first result.
- **Selecting a result:**
  - A product opens its vendor list.
  - A merchandise item opens the Merchandise stand list with the stand that sells it already expanded and scrolled into view.
- **Matching rules:**
  1. Trim the query; an empty query shows no panel.
  2. Normalize both the query and the indexed text: Unicode NFD, strip accents, lowercase, `ß` → `ss`, then `ae`→`a`, `oe`→`o`, `ue`→`u`. So "Maß", "weißbier" and "spätzle" find "Mass Helles", "Weissbier" and "Cheese Spaetzle".
  3. A result matches when its text **contains** the query (substring, not fuzzy). Results keep data order.
  4. Indexed text = product name + category label + attribute terms + names of all vendors selling it. Attribute terms: Alcoholic → "alcoholic"; Non-Alcoholic → "non-alcoholic alcohol-free"; Vegan → "vegan"; Non-Vegan → *(nothing, so "vegan" doesn't match meat dishes)*; Family → "family-friendly"; Adult → "adult-friendly".

### 4.7 Category dropdown (list screens)

- **Trigger:** the category name (20px condensed caps) with a chevron.
- **Menu:**
  - Cream, 2px gold border, `rounded-2xl`, 192px wide.
  - Items are 14px condensed bold; the hover/active item gets a gold 15% tint, and the current category has a gold ✓.
- **Keyboard:** ↑/↓ moves, Enter picks, Esc closes. Clicking outside closes it.
- **Choosing a category:** opens its list with chip "All".

### 4.8 Accessibility (keep these)

- **Icon buttons:** every one has an `aria-label`.
- **Chips:** `role="radio"` with `aria-checked`.
- **Vendor rows:** `aria-expanded` / `aria-controls`.
- **Budget popup:** `role="dialog"`, `aria-modal`, initial focus on Close.
- **Search:** `role="search"`.
- **Live updates:** the vendor count and the budget hint use `aria-live="polite"`.

---

## 5. Developer implementation checklist

Tick each item against your build at **375×812** and **1280×800**. Wherever a pixel position is given, compare it with the live prototype at the same width.

### A. Global

- [ ] Page background is exactly `#F9F8F3`; there is no dark-mode variant.
- [ ] All text is navy `#00213B` or a navy opacity; secondary text is navy at 68%.
- [ ] Only these colors appear: `#00213B`, `#D4AF37`, `#B8962E`, `#F9F8F3`, `#FFFFFF`, plus `#A3261C` for errors and `#005293` inside the diamond stripe. There are no Tailwind gray/slate/blue classes.
- [ ] Fonts Barlow, Barlow Condensed and Grenze Gotisch are loaded with the weights listed in 2.2.
- [ ] Prices use tabular numbers and the `€14.80` / `€10` format.
- [ ] Focus ring is 2px gold with a 2px offset on every interactive element.
- [ ] `prefers-reduced-motion` turns animations off.
- [ ] The page body never scrolls; only the screen's content area does, and content doesn't shift sideways when a scrollbar appears.

### B. Header

- [ ] Navy bar, 88px total: 6px diamond stripe + 74px row + 8px diamond stripe.
- [ ] Logo 40px high, "HERMES" 26px Barlow Condensed 800, "OKTOBERFEST PRICES" 9px gold `0.22em`.
- [ ] Logo left edge at 16px (375) and 320px (1280); info button right edge at 359px (375) and 960px (1280).
- [ ] Info button: 40px round, gold 40% border, opens About; logo + wordmark go Home.
- [ ] A shadow appears under the header; a hairline is added when content scrolls beneath.

### C. Home

- [ ] Eyebrow "THERESIENWIESE · MÜNCHEN" in `#B8962E`, 12px caps.
- [ ] H1 46px Barlow Condensed 800, line height 0.88; "Oktoberfest" in Grenze Gotisch on its own line.
- [ ] Search bar: 52px, pill, white, gold 40% border, full container width [x 16→359 / 320→960].
- [ ] "BROWSE THE WIESN" eyebrow, then 5 navy cards in order Drinks, Food, Rides, Games, Merchandise.
- [ ] Cards: 1 column at 375 (343×74px); 2 columns from 640px, with Merchandise spanning both [312px / 640px wide at 1280].
- [ ] Card style: `rounded-2xl`, gold 60% border, `p-4`, `shadow-md`, white caps label, gold chevron; lifts 2px on hover.
- [ ] Footer note with pretzel icon: "Illustrative placeholder prices, not field-verified".

### D. Search

- [ ] Results open on each keystroke (no debounce, no button needed).
- [ ] The ✕ clear button appears only with text and empties the field.
- [ ] Results panel: white, `rounded-2xl`, gold 40% border, max `min(60vh, 420px)`, scrolls.
- [ ] Each result: category tile, name, category label, "FROM €X" pill; **no pill for Merchandise**.
- [ ] "Maß", "weißbier", "spätzle" and "olympia" (a vendor name) all return results.
- [ ] "vegan" returns only vegan items (plus items sold by "Vegan Wiesn Kitchen"), never meat dishes.
- [ ] "radler" returns nothing (an unpriced product is hidden).
- [ ] No-match message with the pretzel icon and the three suggestions.
- [ ] Enter opens the first result. A product opens its vendor list; a merchandise item opens the stand list with that stand expanded.

### E. Category list screen

- [ ] Sticky bar under the header: ← back (40px round), category name as a dropdown, chip row, filter button, sort button.
- [ ] The sticky bar background is `rgba(249,248,243,.98)` and gains a hairline once the list scrolls.
- [ ] Dropdown menu: cream, 2px gold border, `rounded-2xl`, 192px wide, ✓ on the current category, keyboard support (↑ ↓ Enter Esc).
- [ ] Chips match table 4.2 exactly for each category; Hot and Cold never appear.
- [ ] Inactive chip: white 80%, gold 30% border, navy 80% text, 14px medium.
- [ ] Active chip: white, **2px solid `#D4AF37` border**, `#B8962E` semibold text, `shadow-sm`, same width as when inactive.
- [ ] Chip row scrolls sideways with a hidden scrollbar and a faded right edge.
- [ ] Product rows: name 19px condensed, "FROM €X" navy pill, chevron ›; rows flush inside a `rounded-2xl` gold-bordered frame with gold 25% dividers.
- [ ] 8 rows per page, "SHOWING X OF Y", "SHOW MORE" navy pill.
- [ ] Sort button flips A–Z / Z–A.

### F. Budget filter

- [ ] Filter button idle: white, deep-gold icon. Open or active: 2px gold border, gold icon, `shadow-sm`.
- [ ] No filter button in Merchandise.
- [ ] Popup: 88px from the top, max 380px, cream, 2px gold border, `rounded-2xl`, diamond stripe on top, navy 60% blurred backdrop.
- [ ] Slider min 0, step 0.1, max = `max(20, ceil(highest price / 5) × 5)` (€20 Drinks, €30 Food).
- [ ] Gold 28px thumb with a white border; navy fill left of the thumb, gold 25% right.
- [ ] Typed input and slider stay in sync; comma and dot both work; out-of-range shows a red ring and message.
- [ ] "SHOW RESULTS" applies; choosing the maximum means no limit; "Remove price limit" shows only when a limit is set.
- [ ] Esc, the ✕ button and a backdrop click all close the popup without applying.
- [ ] Product list filters by "from" price; vendor list filters by the vendor's price.
- [ ] "Max Price: €X ✕" pill appears under the bar while a limit is active; ✕ clears it.
- [ ] Switching category clears the budget; opening a product keeps it.
- [ ] Empty result shows the mug card and the gold "CHANGE MAXIMUM PRICE" button.

### G. Vendor list and detail

- [ ] Title = product name (20px condensed caps) + "N vendors found".
- [ ] Vendors sorted cheapest first; sort button flips to highest first.
- [ ] With 2+ vendors, every vendor at the lowest price gets the BEST PRICE badge, the gold pill, the 4px gold left border and the gold 5% tint. With 1 vendor there is no badge.
- [ ] Tapping a row expands it in place; only one row is open at a time; chevron rotates 180°.
- [ ] The open row stays full width and flush with the frame (no floating card, no extra margin or shadow); its header keeps the cream background; the title color doesn't change.
- [ ] White detail panel, gold 30% top line, `p-4`: store icon + type, pin icon + location (semibold). Nothing below the location.
- [ ] Check Mass Helles: 10 vendors, three at €14.80 marked best (Ammer Entenbraterei, Festzelt Tradition, Museumszelt).

### H. Merchandise

- [ ] Opens straight to 3 stands: Balloon Seller Munich, Lebkuchenherz Stand Rosi, Souvenir Stand Bavaria (A–Z).
- [ ] No price, pill or badge anywhere, and no filter button; the sort button stays.
- [ ] Expanding a stand shows only "Merchandise stand" and its street (for example "Street 14").

### I. About

- [ ] Opens from the header info button; back returns to the previous screen.
- [ ] Title "ABOUT Hermes" with 56px top padding and a chevron-left back button.
- [ ] Four cards (`rounded-2xl`, gold 40% border, cream, `p-4`, `shadow-sm`, 16px apart): Find prices, How it works, About prices, Data.
- [ ] "How it works" lists 6 steps (1, +, 2, 3, 4, 5) with 24px navy round badges and white numbers.

### J. Data

- [ ] Data comes from the placeholder workbook: 35 vendors, 47 shown products, 83 offerings, workbook IDs kept.
- [ ] Unpriced products P002, P004, P005 never appear.
- [ ] Product names = name + " (variant)" unless the variant is "Standard".
- [ ] Family-Friendly / Adult-Friendly assignments match section 4.1.

---

*Generated from commit `36ef6fc`. If the prototype changes, regenerate this file from the new commit before handing off.*
