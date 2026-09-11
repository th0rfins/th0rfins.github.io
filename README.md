# 🪐 TH0RFINS.ORBITAL — Space Explorer

Interactive 3D solar system hosted on **GitHub Pages** (`https://th0rfins.github.io`).

- Pure static: `index.html` + `style.css` + `app.js`
- Three.js r160 via CDN (importmap), no build step
- All planet textures are procedural `<canvas>` — zero external images
- Interactions: drag rotate · scroll zoom · **click planet** for dossier · day/night · warp speed · trails · speed slider

## Deploy

Push to `main` → Pages serves `/` automatically.

```
git add . && git commit -m "launch orbital" && git push origin main
```
