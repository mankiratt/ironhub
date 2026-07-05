# Ironhub 24/7 Gym — website

Static marketing site for Ironhub 24/7 Gym (Clyde North + Carrum Downs, south-east Melbourne).
Plain HTML, CSS, and vanilla JS — no framework, no build step. Loads fast on mobile, deploys anywhere.

## Run locally

It's static, so just open `index.html` — or serve it for correct paths and the Google Maps embeds:

```bash
# any one of these
npx serve .
python -m http.server 8000
```

Then visit `http://localhost:8000` (or the port shown).

## Deploy to Vercel

No config needed — Vercel auto-detects a static site.

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

Or push the folder to a Git repo and import it at vercel.com. Set your custom domain in the Vercel dashboard.

## Structure

```
index.html        All sections (single-page scroll + anchor nav)
css/styles.css    Design tokens + every component, mobile-first
js/main.js        Nav toggle, scroll reveal, lightbox, location switcher, form
images/           favicon.svg here; drop real photos + og-image.jpg here
fonts/            empty — fonts load from Google Fonts CDN (self-host here later if wanted)
robots.txt        crawler rules
sitemap.xml       single-URL sitemap
```

## Design system (quick reference)

- **Colour:** near-black `#0D0D0D` base, warm bone-white `#F4F2EE` text, red `#D62828` → deep `#A4161A`
  as the *only* accent (the "25kg plate" red). Red→black gradients on fills, washes, and hovers.
- **Type:** Anton (display/headlines + wordmark), Oswald (labels/nav/buttons), Inter (body).
- **Texture:** film grain via SVG `feTurbulence` over the whole page and inside every photo placeholder.
- **Signature:** the "loaded bar" divider — a thin rule with a thick red plate loaded on the left.

---

## ⚠️ What's placeholder — swap these in

Everything below is marked in the code with `<!-- TODO: ... -->` (HTML) or `// TODO:` (JS/CSS).

### Images (all of them)
- Every photo is a procedural grey **placeholder box** labelled `PLACEHOLDER`. None are real.
  Replace each element with `.ph` with a real `<img>` (already styled B&W + grain via CSS — your colour
  photos will be rendered black & white automatically by `filter: grayscale(1)`).
- **Hero** photo — `.ph--hero`, recommend ~2400×1600 landscape.
- **Program cards** (×6), **products** (×4) — square-ish.
- **About** photo, **trainer** portraits (×4) — 4:5 portrait.
- **Gallery** tiles (×8) — mixed aspect ratios.
- **`images/og-image.jpg`** — 1200×630 social share image (referenced in `<head>`; not created yet).
- **Favicons** — `favicon.svg` exists (barbell mark); add `apple-touch-icon.png` if you want one.

### Real content to confirm
- **Staffed/reception hours** — currently `9:00am – 9:00pm (placeholder — confirm)` and shown in red so it's
  obvious. 24/7 *member* access is stated as fact; staffed hours are **not** — Instagram and other listings
  disagree, so confirm before publishing. (Locations section, both panels.)
- **Trainers** — all four cards are dummy ("Coach Name", "@handle", placeholder bios). Add real photos,
  names, specialities, bios, and Instagram links.
- **Ironhub Supps** — product names/serves are placeholders. Decide: **online store** (point "Shop the range"
  at the store URL) **or in-gym only** (the note already says "grab yours at the front desk"). Pick one.
- **Membership** — "no lock-in", "free intro session", and "member pricing" perks are placeholder claims.
  Confirm or edit. Add pricing tiers if you want them shown.
- **About stat** — "1,200+ members" is a placeholder number. Confirm or remove.
- **Domain** — `www.ironhubgym.com.au` is a guess used in meta tags, sitemap, robots.txt, and structured
  data. Replace with your real domain everywhere (search the repo for `ironhubgym.com.au`).
- **Facebook** links in the footer are `#` placeholders. Instagram handles are from your brief.

### The enquiry form
- Currently opens the visitor's email app via `mailto:` (routes to the Clyde North or Carrum Downs inbox
  based on the chosen location). Works with zero backend, but depends on the visitor having mail set up.
- **Recommended:** connect to a form service for reliable delivery. Easiest is
  [Formspree](https://formspree.io) or [Netlify Forms](https://docs.netlify.com/forms/setup/). See the
  `// TODO` in `js/main.js` (section 5) and the `<form>` in `index.html`.

### Confirmed real details (from your brief — already in place)
- Clyde North: 49 Rainier Cres, Clyde North VIC 3978 · 0458 514 335 · info.ironhub@gmail.com · @ironhub247gym
- Carrum Downs: 566 Frankston-Dandenong Rd, Carrum Downs VIC 3201 · 0461 350 777 · info.ironhub.cd@gmail.com · @ironhubcarrumdowns
