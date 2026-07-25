# 06 — UI Panels

Все панели — standalone components, Signals, control flow `@if`/`@for`. Строки UI — только через `I18nService.t(...)`. Стили — SCSS + CSS variables из [01-product-vision.md](01-product-vision.md).

---

## 6.1 Toolbar (`bev-toolbar`)

Элементы слева направо:

1. Brand: **BioEvolve** (крупный текст; подзаголовок мелким muted допустим).
2. Spacer.
3. Button **Reset** (`R`).
4. Button **Screenshot** (`S`).
5. Button **Theme** (`T`).
6. Button **Lang** (`G`) — показывает `RU`/`EN`.
7. Button **Hotkeys** (`H`).

Требования:
- `aria-label` на каждой кнопке.
- Высота toolbar 48px; sticky top.
- Brand не должен выглядеть как «ещё одна кнопка» — визуальный вес выше.

i18n keys (минимум): `toolbar.reset`, `toolbar.screenshot`, `toolbar.theme`, `toolbar.lang`, `toolbar.hotkeys`, `brand.subtitle`.

---

## 6.2 God Panel (`bev-god-panel`)

Заголовок: `god.title` («Панель Бога» / «God Panel»).

### Кнопки спавна
| Кнопка | Действие |
|--------|----------|
| Добавить 50 зайцев | `spawn.spawnPreyBatch(50)` |
| Добавить 10 волков | `spawn.spawnPredatorBatch(10)` |
| Засеять травой | `spawn.seedPlants(SEED_PLANTS_BATCH)` — значение из appendix A (по умолчанию 40) |

Кнопки disabled, если достигнут соответствующий MAX_* (с `aria-disabled` + title hint).

### Слайдеры
| Контрол | Binding | UI range | Store |
|---------|---------|----------|-------|
| Шанс мутации | `settings.mutationRate` | 0–100% | `setMutationRate(v/100)` |
| Жёсткость отбора | `settings.selectionPressure` | 0–100% | `setSelectionPressure(v/100)` |
| Скорость симуляции | `settings.simSpeed` | 0.25–8 (step 0.25) | `setSimSpeed(v)` |

Рядом со слайдером — числовое value (mono font).

### Время
- Кнопка **Пауза / Старт** (toggle) — `simulation.togglePlay()`
- Визуально pressed когда playing / paused согласно `aria-pressed`
- Допустимы отдельные иконки Play и Pause

### Дополнительно
- Кнопка **Снять фокус** — если `selectedAgentId != null`
- Компактный readout текущих counts: 🌿/plants, prey/prey, pred — **без emoji в кнопках**; в readout допустимы текстовые метки i18n, не emoji-обязательно. Предпочтительно цветовые swatches + числа.

---

## 6.3 Genetic Passport (`bev-genetic-passport`)

Показывать карточку, если `selectedAgent()` не null; иначе empty state.

### Поля (все обязательны)

| Поле UI | Источник |
|---------|----------|
| ID | `agent.id` |
| Вид | `t('kind.prey')` / `t('kind.predator')` |
| FSM состояние | `t('fsm.' + agent.fsmState)` |
| Поколение | `agent.generation` |
| Возраст | `agent.age` formatted (1 decimal) + единица |
| Энергия / сытость | `energy` / `genes.maxEnergy` + progress bar |
| visionRange | gene |
| maxSpeed | gene |
| maxEnergy | gene |
| metabolism | gene |
| reproductiveAge | gene |
| reproductionEnergyThreshold | gene |
| bodySize | gene |
| Родители | `parentIds` или «—» для стартового поколения |

Форматирование чисел: 2 decimals для генов, mono font.

Визуал: «лабораторная карточка» / паспорт — border accent, заголовок `passport.title`.

---

## 6.4 Analytics Panel (`bev-analytics-panel`)

Секции сверху вниз:

### A. Population chart (`bev-population-chart`)
- Canvas (отдельный от мира) или SVG polyline — **Canvas предпочтителен** для единообразия.
- Три линии: plants, prey, predators — цвета из brand tokens.
- Ось X: время (последние N samples), ось Y: auto-scale max count * 1.1.
- Легенда.
- Данные: `analyticsStore.populationHistory()`.
- ResizeObserver на host chart.

`population-chart.renderer.ts` — чистая функция/класс `draw(ctx, series, cssSize)` без Angular DI.

### B. Gene averages (`bev-gene-stats-view`)
Таблица или две колонки Prey / Predator:
- count
- avg vision
- avg speed
- avg metabolism
- avg body size
- avg generation

Обновляется из `analyticsStore.geneStats()`.

### C. LV compare chart (`bev-lv-compare-chart`)
См. детализацию в [07-features-extended.md](07-features-extended.md).  
Кратко: линии agent prey, agent predators, LV prey, LV predators (4 линии или 2 панели).  
Подпись параметров α,β,γ,δ.

---

## 6.5 Status Bar (`bev-status-bar`)

Одна строка:
- tick
- simulationTime
- counts plants/prey/predators
- mutation %
- selection %
- simSpeed ×
- PLAYING / PAUSED badge

---

## 6.6 Hotkeys Help (`bev-hotkeys-help`)

Modal/overlay со списком клавиш из [01-product-vision.md](01-product-vision.md).  
Закрытие: кнопка, клик по backdrop, `H` или `Esc` (Esc сначала снимает selection если есть — приоритет: если help open → закрыть help; иначе clear selection).

---

## 6.7 Responsive

`< 1000px`:
- `.bev-shell__side` становится drawer; кнопка в toolbar «Панели» открывает `ui.mobileDrawerOpen`.
- Charts уменьшают высоту (min 120px).

---

## 6.8 Критерий готовности документа 06

God Panel управляет спавном и настройками; Passport показывает полный геном; Analytics рисует population + gene stats; Status/Toolbar/Hotkeys help работают с i18n.
