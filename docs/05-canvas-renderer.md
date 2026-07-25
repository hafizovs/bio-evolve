# 05 — Canvas 2D Renderer (Simulation World)

Реализуй полный пайплайн отрисовки мира. **Только Canvas 2D.** Константы — закон из [03-data-model.md](03-data-model.md) / [appendix-a-defaults.md](appendix-a-defaults.md).

---

## 5.1 Файлы

- `features/sim-canvas/sim-canvas.component.*` — `<canvas>`, ResizeObserver, pointer events
- `canvas-renderer.ts` — оркестратор слоёв
- `canvas-camera.ts` — world↔screen transforms
- `canvas-pointer.controller.ts` — wheel zoom, drag pan, click pick
- `layers/grid.layer.ts`
- `layers/plants.layer.ts`
- `layers/agents.layer.ts`
- `layers/selection.layer.ts`

---

## 5.2 Camera transforms

Мир: origin top-left world (0,0), y вниз (как canvas) **или** y вверх — выбери **y вниз** (как DOM canvas), чтобы меньше путаницы.

```ts
// world → screen
screenX = (worldX - camera.offsetX) * camera.zoom * dprAdjust
screenY = (worldY - camera.offsetY) * camera.zoom * dprAdjust
```

Фактически: используй CSS pixel size canvas; учитывай `devicePixelRatio` capped by `MAX_DPR`.

`fitWorld(world)`:
- zoom = min(viewW / world.width, viewH / world.height) * 0.96
- offset так, чтобы мир был по центру view.

`zoomAt(screenX, screenY, factor)` — zoom к курсору (стандартный pan/zoom).

Follow:
```
offsetX = agent.x - (viewWidth / zoom) / 2
offsetY = agent.y - (viewHeight / zoom) / 2
```
каждый кадр после physics step.

---

## 5.3 Порядок слоёв draw

1. Clear / fill background `#070b12`
2. `grid.layer` — тонкая сетка `GRID_STEP_WU`, цвет `--bev-grid` эквивалент rgba
3. `plants.layer` — зелёные круги
4. `agents.layer` — prey затем predators (или все в одном проходе по массиву)
5. `selection.layer` — обводка + опционально vision range ring для selected

Не рисуй мёртвых.

---

## 5.4 Отрисовка растений

- fill `#3ecf6a`, alpha 0.85
- radius screen = `plant.radius * zoom`, clamp ≥ 2px
- без stroke обязательного

---

## 5.5 Отрисовка агентов

Для каждого agent:
1. `r = clamp(genes.bodySize * zoom, MIN_AGENT_SCREEN_RADIUS_PX, MAX_AGENT_SCREEN_RADIUS_PX)`
2. fill: prey `#4da3ff`, predator `#e85d5d`
3. если `fsmState === 'panic'` у prey — допустим fill `#f0b429` или смесь
4. **вектор направления:** линия от центра длиной `DIRECTION_VECTOR_LENGTH_PX` (в screen px, не умножать повторно чрезмерно) вдоль `heading`
5. лёгкий darker stroke для читаемости

---

## 5.6 Selection / vision ring

Если есть selected:
- stroke `#3dd6c6`, lineWidth 2–3 (CSS px → умножь на dpr аккуратно)
- полупрозрачная окружность радиусом `genes.visionRange * zoom` (stroke only, alpha ~0.35)

---

## 5.7 Pointer / pick

`canvas-pointer.controller.ts`:
- **wheel:** zoomAt
- **pointerdown + move:** pan (если не click-only)
- **click** (без существенного drag, threshold 4px): pick nearest agent within `PICK_RADIUS_PX` in screen space

Pick алгоритм:
1. convert click to world
2. среди agents найди min distance; если `dist * zoom ≤ PICK_RADIUS_PX` (или world threshold = PICK/zoom) → select + enableFollow
3. если miss → clearSelection + disableFollow (опционально; допустимо clear только по Esc — зафиксируй: **miss не снимает selection**, только Esc/кнопка)

Растения не выбираются.

---

## 5.8 Resize / DPR

```ts
const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
canvas.width = Math.floor(cssWidth * dpr);
canvas.height = Math.floor(cssHeight * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
// дальнейшая отрисовка в CSS pixels
```

ResizeObserver на host; при resize не терять относительный центр камеры.

---

## 5.9 Производительность

- Не аллоцируй path2d на каждого агента без нужды; `arc` + `fill` ок.
- При N>300 допустимо отключать vision ring для non-selected (и так только selected).
- Grid можно кэшировать в offscreen canvas при неизменных zoom/offset — опциональная оптимизация; если делаешь — полностью, без TODO.

---

## 5.10 SimCanvasComponent responsibilities

- Владеет `<canvas #scene>`.
- Регистрирует canvas в `ScreenshotService` и `RenderLoopService`.
- Подключает pointer controller.
- Не содержит бизнес-логики симуляции.

---

## 5.11 Критерий готовности документа 05

Мир рисуется слоями; направление видно; клик выбирает агента и включает follow; pan/zoom/fitWorld работают; DPR/resize корректны.
