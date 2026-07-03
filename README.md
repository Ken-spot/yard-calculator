# Yard Tools

A phone-friendly web app that calculates the full DIY materials list (with cost
estimates and Home Depot / Lowe's search links) for yard projects. Eight
calculators: pavers, grass (seed or sod), mulch, gravel/rock, concrete slabs,
fences, tree & bush spacing, and sprinklers (rotor, spray, drip, or hose-end).
Turn on whichever calculators a project needs in the Build tab.

**Live app:** hosted on GitHub Pages — open it in Safari on the iPhone, tap
Share → **Add to Home Screen**, and it behaves like a regular app (works offline).

## How it's built

Plain HTML/CSS/JavaScript — no frameworks, no build step, nothing to install.

```
index.html            App shell + iOS home-screen meta tags
css/styles.css        Mobile-first styles, automatic light/dark
js/engine/            Pure calculation library (no DOM) — all the math
  constants.js        ← every coverage rate, bag size, seed rate, default price
  geometry.js         Composite area/perimeter from shapes
  paver-calc.js       Paver materials formulas
  grass-calc.js       Grass materials formulas (seed + sod)
js/ui/                One module per tab
js/app.js             Wiring: state, tabs, saving, service worker
sw.js                 Offline caching  ← bump CACHE_NAME on every deploy!
tests/                Automated formula tests
dev/serve.ps1         Local dev server (no Node/Python needed)
dev/gen-icons.ps1     Regenerates the app icons
```

Projects and prices are saved in the browser's localStorage on the device.

## Making changes / deploying

1. Edit the files (all tunable numbers live in `js/engine/constants.js`).
2. **Bump the version in `sw.js`** (`yardcalc-v1` → `yardcalc-v2` → …). If you
   skip this, phones keep showing the old cached version.
3. Commit and push:
   ```
   git add -A
   git commit -m "describe the change"
   git push
   ```
4. The live site updates in about a minute. On the phone, close and reopen the
   app (sometimes twice) to pick up the new version.

## Testing locally

```
powershell -NoProfile -ExecutionPolicy Bypass -File dev\serve.ps1
```

Then open `http://localhost:8420/` for the app and
`http://localhost:8420/tests/test.html` for the formula tests (all rows should
be green). The service worker is disabled on localhost so you always see fresh
files; add `?sw=1` to test it.
