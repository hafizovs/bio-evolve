## Live demo

https://hafizovs.github.io/bio-evolve/

# BioEvolve

Ecosystem and directed-evolution simulator (prey / predators / plants) on Angular 22+ with Canvas 2D, genetics, finite-state machines, and a parallel Lotka–Volterra model.

## About

BioEvolve simulates an ecosystem and directed evolution for prey, predators, and plants. It is built with Angular 22+, Canvas 2D, genetics, finite-state machines, and a parallel Lotka–Volterra model. The world and its charts share the canvas, in a Sci-Fi Dark theme.

## Capabilities

- Prey, predators, and plants on a Canvas 2D world
- Genetics, finite-state machines, and a parallel Lotka–Volterra model
- World view plus charts
- Sci-Fi Dark theme (SCSS and CSS variables) and RU/EN
- PNG snapshot of the sim canvas

## Functionality

- Pause or start with Space, reset the world with `R`, and clear focus or close help with Esc
- Add 50 hares (`1`), add 10 wolves (`2`), or seed grass (`3`)
- Save a PNG of the sim canvas with `S`
- Toggle dark/light (`T`) and RU/EN (`G`), and open the hotkey help with `H`

## Install and run

```bash
npm install
npm start
```

Open the URL printed by the CLI (usually `http://localhost:4200`).

## Tests

```bash
npm test
# или
npm run test:unit
```

## Build

```bash
npm run build
```

## Hotkeys

| Key | Action |
|---------|----------|
| Space | Pause / Start |
| Esc | Clear focus / close help |
| R | Reset world |
| S | Snapshot of the sim canvas (PNG) |
| T | Theme dark/light |
| G | Language RU/EN |
| 1 | +50 hares |
| 2 | +10 wolves |
| 3 | Seed with grass |
| H | Hotkey help |

## Stack

- Angular 22 (standalone, signals, zoneless)
- HTML5 Canvas 2D (world + charts)
- SCSS + CSS variables (Sci-Fi Dark)
- Vitest unit tests
