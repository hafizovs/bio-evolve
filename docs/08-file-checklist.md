# 08 — File Checklist

Генератор **обязан** создать каждый файл из списка. Отмечай мысленно ☑. Пропуск файла = провал DoD.

Рядом с путём — краткое содержание (1–2 предложения). Код внутри файла — **полный**, без сокращений.

---

## 8.1 Project root / Angular scaffold

| # | Path | Content |
|---|------|---------|
| 1 | `package.json` | Имя `bio-evolve`, scripts start/build/test |
| 2 | `angular.json` | project config, styles `src/styles.scss` |
| 3 | `tsconfig.json` | base TS config |
| 4 | `tsconfig.app.json` | app TS config |
| 5 | `tsconfig.spec.json` | spec TS config |
| 6 | `src/index.html` | title BioEvolve, fonts IBM Plex, root element |
| 7 | `src/main.ts` | bootstrapApplication |
| 8 | `src/styles.scss` | CSS variables Sci-Fi Dark/light, reset, full viewport |
| 9 | `README.md` | install, start, test, hotkeys, link to docs |

---

## 8.2 App shell

| # | Path | Content |
|---|------|---------|
| 10 | `src/app/app.config.ts` | zoneless providers |
| 11 | `src/app/app.component.ts` | composition + hotkeys init + theme effect |
| 12 | `src/app/app.component.html` | toolbar, shell, status, help |
| 13 | `src/app/app.component.scss` | shell layout grid/responsive |

---

## 8.3 Core constants

| # | Path | Content |
|---|------|---------|
| 14 | `src/app/core/constants/world.constants.ts` | WORLD_*, INITIAL_*, MAX_* |
| 15 | `src/app/core/constants/genetics.constants.ts` | mutation, crossover, selection defaults |
| 16 | `src/app/core/constants/simulation.constants.ts` | speed, dt, history, spatial |
| 17 | `src/app/core/constants/ecology.constants.ts` | plant/prey/predator ecology numbers |
| 18 | `src/app/core/constants/render.constants.ts` | DPR, pick, zoom, grid |

---

## 8.4 Core models

| # | Path | Content |
|---|------|---------|
| 19 | `src/app/core/models/vec2.model.ts` | Vec2 |
| 20 | `src/app/core/models/agent-kind.model.ts` | AgentKind |
| 21 | `src/app/core/models/agent-fsm-state.model.ts` | FSM state unions |
| 22 | `src/app/core/models/dna-genes.model.ts` | DnaGenes |
| 23 | `src/app/core/models/agent.model.ts` | Agent |
| 24 | `src/app/core/models/plant.model.ts` | Plant |
| 25 | `src/app/core/models/world-config.model.ts` | WorldConfig |
| 26 | `src/app/core/models/simulation-settings.model.ts` | SimulationSettings |
| 27 | `src/app/core/models/population-sample.model.ts` | PopulationSample |
| 28 | `src/app/core/models/gene-stats.model.ts` | GeneStatsSnapshot |
| 29 | `src/app/core/models/lotka-volterra.model.ts` | LV types |
| 30 | `src/app/core/models/camera-state.model.ts` | CameraState |
| 31 | `src/app/core/models/theme.model.ts` | ThemeId |
| 32 | `src/app/core/models/locale.model.ts` | LocaleId |
| 33 | `src/app/core/models/sim-render-snapshot.model.ts` | SimRenderSnapshot |

---

## 8.5 Domain genetics

| # | Path | Content |
|---|------|---------|
| 34 | `src/app/domain/genetics/gene-ranges.ts` | min/max per kind |
| 35 | `src/app/domain/genetics/random-dna.ts` | createRandomGenes(kind) |
| 36 | `src/app/domain/genetics/crossover.ts` | crossover(a,b) |
| 37 | `src/app/domain/genetics/mutate.ts` | mutate(genes, rate, strength) |
| 38 | `src/app/domain/genetics/gene-stats.ts` | computeGeneStats(agents) |
| 39 | `src/app/domain/genetics/crossover.spec.ts` | tests |
| 40 | `src/app/domain/genetics/mutate.spec.ts` | tests |

---

## 8.6 Domain AI / ecology / population / math

| # | Path | Content |
|---|------|---------|
| 41 | `src/app/domain/ai/prey-fsm.ts` | prey state machine |
| 42 | `src/app/domain/ai/predator-fsm.ts` | predator state machine |
| 43 | `src/app/domain/ai/steering.ts` | seek/flee/wander |
| 44 | `src/app/domain/ai/prey-fsm.spec.ts` | FSM tests |
| 45 | `src/app/domain/ecology/energy.ts` | metabolism drain |
| 46 | `src/app/domain/ecology/feeding.ts` | prey eats plants |
| 47 | `src/app/domain/ecology/hunting.ts` | predator kills prey |
| 48 | `src/app/domain/ecology/reproduction.ts` | mate + offspring |
| 49 | `src/app/domain/ecology/plant-growth.ts` | regrow plants |
| 50 | `src/app/domain/population/spatial-hash.ts` | grid index |
| 51 | `src/app/domain/population/nearest.ts` | nearest queries |
| 52 | `src/app/domain/math/clamp.ts` | clamp/lerp |
| 53 | `src/app/domain/math/rng.ts` | RNG helper |
| 54 | `src/app/domain/math/lotka-volterra.ts` | LV step |
| 55 | `src/app/domain/math/lotka-volterra.spec.ts` | LV tests |

---

## 8.7 State stores

| # | Path | Content |
|---|------|---------|
| 56 | `src/app/state/simulation.store.ts` | world, agents, settings, LV, selection |
| 57 | `src/app/state/camera.store.ts` | pan zoom follow |
| 58 | `src/app/state/ui.store.ts` | theme locale drawers help |
| 59 | `src/app/state/analytics.store.ts` | histories + gene stats |
| 60 | `src/app/state/simulation.store.spec.ts` | play/settings tests |

---

## 8.8 Services

| # | Path | Content |
|---|------|---------|
| 61 | `src/app/services/simulation-engine.service.ts` | full tick orchestration |
| 62 | `src/app/services/spawn.service.ts` | create/seed/spawn batches |
| 63 | `src/app/services/render-loop.service.ts` | rAF loop |
| 64 | `src/app/services/screenshot.service.ts` | PNG download |
| 65 | `src/app/services/hotkeys.service.ts` | keyboard map |
| 66 | `src/app/services/i18n.service.ts` | t() / dictionaries |

---

## 8.9 i18n

| # | Path | Content |
|---|------|---------|
| 67 | `src/app/i18n/locale.type.ts` | LocaleId re-export/type |
| 68 | `src/app/i18n/i18n.keys.ts` | keys list |
| 69 | `src/app/i18n/dictionaries/ru.ts` | полный RU словарь |
| 70 | `src/app/i18n/dictionaries/en.ts` | полный EN словарь |

---

## 8.10 Feature: Sim Canvas

| # | Path | Content |
|---|------|---------|
| 71 | `src/app/features/sim-canvas/sim-canvas.component.ts` | host canvas + lifecycle |
| 72 | `src/app/features/sim-canvas/sim-canvas.component.html` | canvas element |
| 73 | `src/app/features/sim-canvas/sim-canvas.component.scss` | full size |
| 74 | `src/app/features/sim-canvas/canvas-renderer.ts` | draw snapshot |
| 75 | `src/app/features/sim-canvas/canvas-camera.ts` | transforms |
| 76 | `src/app/features/sim-canvas/canvas-pointer.controller.ts` | pan zoom pick |
| 77 | `src/app/features/sim-canvas/layers/grid.layer.ts` | lab grid |
| 78 | `src/app/features/sim-canvas/layers/plants.layer.ts` | plants |
| 79 | `src/app/features/sim-canvas/layers/agents.layer.ts` | agents + heading |
| 80 | `src/app/features/sim-canvas/layers/selection.layer.ts` | selection + vision |

---

## 8.11 Feature: God Panel / Passport / Toolbar / Status / Help

| # | Path | Content |
|---|------|---------|
| 81 | `src/app/features/god-panel/god-panel.component.ts` | spawn + sliders + play |
| 82 | `src/app/features/god-panel/god-panel.component.html` | layout |
| 83 | `src/app/features/god-panel/god-panel.component.scss` | styles |
| 84 | `src/app/features/passport/genetic-passport.component.ts` | passport logic |
| 85 | `src/app/features/passport/genetic-passport.component.html` | fields |
| 86 | `src/app/features/passport/genetic-passport.component.scss` | card styles |
| 87 | `src/app/features/toolbar/toolbar.component.ts` | toolbar |
| 88 | `src/app/features/toolbar/toolbar.component.html` | buttons |
| 89 | `src/app/features/toolbar/toolbar.component.scss` | styles |
| 90 | `src/app/features/status-bar/status-bar.component.ts` | status |
| 91 | `src/app/features/status-bar/status-bar.component.html` | readout |
| 92 | `src/app/features/status-bar/status-bar.component.scss` | styles |
| 93 | `src/app/features/hotkeys-help/hotkeys-help.component.ts` | overlay |
| 94 | `src/app/features/hotkeys-help/hotkeys-help.component.html` | list |
| 95 | `src/app/features/hotkeys-help/hotkeys-help.component.scss` | styles |

---

## 8.12 Feature: Analytics

| # | Path | Content |
|---|------|---------|
| 96 | `src/app/features/analytics/analytics-panel.component.ts` | container |
| 97 | `src/app/features/analytics/analytics-panel.component.html` | sections |
| 98 | `src/app/features/analytics/analytics-panel.component.scss` | styles |
| 99 | `src/app/features/analytics/population-chart.component.ts` | pop chart host |
| 100 | `src/app/features/analytics/population-chart.component.html` | canvas |
| 101 | `src/app/features/analytics/population-chart.component.scss` | size |
| 102 | `src/app/features/analytics/population-chart.renderer.ts` | draw pop series |
| 103 | `src/app/features/analytics/gene-stats-view.component.ts` | averages |
| 104 | `src/app/features/analytics/gene-stats-view.component.html` | table |
| 105 | `src/app/features/analytics/gene-stats-view.component.scss` | styles |
| 106 | `src/app/features/analytics/lv-compare-chart.component.ts` | LV chart host |
| 107 | `src/app/features/analytics/lv-compare-chart.component.html` | canvas |
| 108 | `src/app/features/analytics/lv-compare-chart.component.scss` | size |
| 109 | `src/app/features/analytics/lv-compare-chart.renderer.ts` | draw LV compare |

---

## 8.13 Prompt docs (этот пакет)

Не удаляй папку `docs/` с промптами при генерации приложения. Если приложение создаётся в подпапке `bio-evolve/`, оставь `docs/` рядом (в `bio_evolve/docs/`) и укажи путь в README.

---

## 8.14 Итог

**Всего обязательных файлов приложения: 109** (плюс стандартные CLI служебные вроде `public/favicon.ico`, если CLI создаёт).

Перед сдачей: пройди таблицу сверху и убедись, что каждый path существует и не содержит `TODO` / `// ...`.
