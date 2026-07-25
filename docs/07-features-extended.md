# 07 — Extended Features

Все фичи этого документа **обязательны**. Не помечай их optional в коде.

---

## 7.1 Lotka–Volterra parallel track

### Назначение
Показать пользователю классическую осцилляцию хищник–жертва рядом с агентной симуляцией.

### Реализация
- Файл: `domain/math/lotka-volterra.ts`
- API:

```ts
export function stepLotkaVolterra(
  state: LotkaVolterraState,
  dt: number
): LotkaVolterraState;

export function createDefaultLvState(
  initialPrey: number,
  initialPredators: number,
  params?: Partial<LotkaVolterraParams>
): LotkaVolterraState;
```

- Формулы и численный метод — [appendix-b-formulas.md](appendix-b-formulas.md).
- Параметры по умолчанию — [appendix-a-defaults.md](appendix-a-defaults.md).
- Каждый тик engine вызывает `stepLotkaVolterra` и пишет sample в AnalyticsStore:

```ts
{
  t: simulationTime,
  prey: lv.prey,
  predators: lv.predators,
  agentPrey: counts.prey,
  agentPredators: counts.predators,
}
```

- Clamp LV populations снизу: `max(0, value)`. При численном взрыве — soft clamp к `MAX_PREY` / `MAX_PREDATORS` * 2 для графика (не ломать UI).

### UI
`bev-lv-compare-chart`:
- 4 серии: Agent Prey, Agent Predators, LV Prey, LV Predators.
- Различай стилем: agent = solid, LV = dashed.
- Показывай текущие α, β, γ, δ мелким mono текстом.
- Без внешних chart-библиотек.

---

## 7.2 Screenshot export

`services/screenshot.service.ts`:

```ts
@Injectable({ providedIn: 'root' })
export class ScreenshotService {
  private canvas: HTMLCanvasElement | null = null;

  setCanvas(canvas: HTMLCanvasElement | null): void { /* ... full impl */ }

  capture(): void {
    // 1. assert canvas
    // 2. const url = canvas.toDataURL('image/png')
    // 3. <a download="bio-evolve-YYYYMMDD-HHmmss.png" href=url>
    // 4. click + remove
  }
}
```

Имя файла строго с timestamp локального времени, zero-pad.  
Hotkey `S` → `capture()`. Только sim-canvas, не charts.

---

## 7.3 Reset мира

- Toolbar Reset + hotkey `R` → `simulationStore.resetToDefaults()` (см. 04.12).
- Подтверждение dialog **не обязателен**; мгновенный reset ок.
- После reset: fitWorld, clear selection, clear analytics, LV re-init.

---

## 7.4 i18n (signal-словари)

### Файлы
- `i18n/locale.type.ts` — `LocaleId`
- `i18n/i18n.keys.ts` — union type всех ключей **или** const object
- `i18n/dictionaries/ru.ts` — полный RU
- `i18n/dictionaries/en.ts` — полный EN
- `services/i18n.service.ts` — `locale` signal + `t(key): string`

### Правила
- Никаких хардкод-строк в шаблонах (кроме brand имени `BioEvolve`, допустимо).
- Ключи покрывают: toolbar, god panel, passport fields, fsm states, kind labels, analytics titles, status, hotkeys help, empty states, collapse banner.

Минимальный набор fsm keys:
`fsm.wander`, `fsm.seekFood`, `fsm.panic`, `fsm.seekMate`, `fsm.reproduce`, `fsm.hunt`, `fsm.rest`.

---

## 7.5 Hotkeys

`services/hotkeys.service.ts` слушает `window` keydown (capture false), фильтрует input targets, вызывает store/service методы по таблице из 01.

Инициализация в `AppComponent` constructor/`inject` + unsubscribe on destroy.

---

## 7.6 Theme

- `ui.theme` ↔ `document.documentElement.dataset.theme = 'dark' | 'light'`
- effect в AppComponent или UiStore.
- Canvas мира всегда тёмный фон (не перекрашивать в белый).

---

## 7.7 Unit tests (обязательные)

| Файл | Что покрыть |
|------|-------------|
| `domain/genetics/crossover.spec.ts` | потомок в диапазонах; гены между/из родителей (для blend — среднее в допуске) |
| `domain/genetics/mutate.spec.ts` | при rate=0 гены идентичны; при rate=1 и strength>0 хотя бы один ген может измениться (seeded RNG); clamp соблюдён |
| `domain/math/lotka-volterra.spec.ts` | один шаг меняет N,P предсказуемо; при P=0 prey растёт; нет NaN |
| `domain/ai/prey-fsm.spec.ts` | при predator в vision → panic; иначе seekFood при низком energy |
| `state/simulation.store.spec.ts` | togglePlay; setMutationRate clamp 0..1 |

Запусти через стандартный `ng test` / npm script CLI. Тесты должны быть **полными**, не skipped.

Для детерминизма: `rng.ts` должен позволять inject seed в genetics функциях в тестах.

---

## 7.8 Collapse / extinction banner

Если `prey + predators === 0` (или оба нули по отдельности — показывать soft warning):
- неблокирующий banner в shell: i18n `banner.extinction`
- CTA кнопки spawn prey / predators / plants

---

## 7.9 README

Корневой `README.md` приложения:
- установка, start, test
- краткое описание BioEvolve
- hotkeys summary
- ссылка на `docs/` пакет промптов (не удалять docs)

---

## 7.10 Критерий готовности документа 07

LV график живой; screenshot/reset/i18n/theme/hotkeys работают; тесты написаны и проходят; extinction banner есть.
