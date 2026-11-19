# Sami Alzahrani / portfolio

Personal portfolio of Sami Alzahrani: VR training, Unity games, websites with an AI assistant, and software that talks to hardware. Featuring **RushLab**, a VR hematology game for Meta Quest 3.

Live at **https://samikalzah.github.io/**

## Stack

Plain HTML, CSS and vanilla JavaScript. No build step, so GitHub Pages serves the files as they are.

- `index.html` is the whole site
- `assets/css/site.css` holds the design tokens (dark and light themes) and all styles
- `assets/js/main.js` handles the theme toggle, the menu, reveal-on-scroll, the RushLab player and loop strip, the A-7 dialogue, and the work-list hover preview
- `assets/fonts/` self-hosts Archivo (variable, with a width axis) and JetBrains Mono
- `coffee-station/` is the Coffee Station dashboard demo. It simulates the sensors when no ESP32 answers.
- `404.html` is the custom not-found page

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Update a project

Edit the matching block in `index.html`. Images live in `assets/img/` (WebP, 16:9 works best). Commit and push to `main`, and GitHub Pages redeploys in about a minute.
