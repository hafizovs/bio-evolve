# 03 — Data Model & Units

Все интерфейсы ниже реализуй **буквально** в указанных файлах. Числовые диапазоны и дефолты — в [appendix-a-defaults.md](appendix-a-defaults.md); скопируй значения в `*.constants.ts` / `gene-ranges.ts` без «примерно».

---

## 3.1 Единицы

| Величина | Единица в симуляции | Пояснение |
|----------|---------------------|-----------|
| Позиция / размер мира | world units (wu) | 1 wu ≈ 1 px при zoom=1 (удобно для canvas) |
| Время | секунды симуляции | `simulationTime`; масштабируется `simSpeed` |
| Скорость | wu / sim-second | из гена `maxSpeed` |
| Энергия | условные единицы | 0…`genes.maxEnergy` |
| Возраст | sim-seconds | с момента рождения |
| Мутация | доля 0…1 в логике; UI 0…100% | `mutationRate` |

---

## 3.2 Константы (файлы)

### `core/constants/world.constants.ts`

```ts
export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 800;
export const INITIAL_PLANTS = 120;
export const INITIAL_PREY = 40;
export const INITIAL_PREDATORS = 10;
export const MAX_PLANTS = 400;
export const MAX_PREY = 300;
export const MAX_PREDATORS = 120;
export const MAX_TOTAL_AGENTS = 400;
```

### `core/constants/genetics.constants.ts`

См. полные min/max/mean в [appendix-a-defaults.md](appendix-a-defaults.md). Минимум экспортируй:

```ts
export const MUTATION_RATE_DEFAULT = 0.08;      // 8%
export const MUTATION_STRENGTH = 0.12;          // ±12% от значения гена
export const SELECTION_PRESSURE_DEFAULT = 0.5;  // 0..1
export const CROSSOVER_BLEND = 0.5;             // доля генов от parentB (см. appendix B)
```

### `core/constants/simulation.constants.ts`

```ts
export const SIM_SPEED_DEFAULT = 1;
export const SIM_SPEED_MIN = 0.25;
export const SIM_SPEED_MAX = 8;
export const DT_CLAMP_SECONDS = 0.05;
export const HISTORY_MAX_SAMPLES = 300;
export const HISTORY_SAMPLE_EVERY_TICKS = 5;
export const SPATIAL_CELL_SIZE = 64;
```

### `core/constants/ecology.constants.ts`

```ts
export const PLANT_ENERGY_VALUE = 25;
export const PLANT_RADIUS = 4;
/** Ожидаемый коэффициент регенерации: expected ≈ rate * dt * livingPlants (см. appendix B.6) */
export const PLANT_REGROW_CHANCE_PER_SECOND = 0.15;
export const PREY_EAT_RADIUS_FACTOR = 1.0;  // × bodySize
export const PREDATOR_KILL_RADIUS_FACTOR = 1.1;
export const PREDATION_ENERGY_GAIN = 45;
export const REPRODUCTION_COOLDOWN = 4; // sim-seconds
export const OFFSPRING_ENERGY_FRACTION = 0.4;
export const PARENT_ENERGY_COST_FRACTION = 0.35;
export const METABOLISM_SPEED_COEFF = 0.04;
export const METABOLISM_SELECTION_COEFF = 0.35;
export const PANIC_SPEED_MULT = 1.15;
export const PANIC_ENERGY_MULT = 1.25;
export const LOW_ENERGY_THRESHOLD = 0.25;
export const LOW_ENERGY_SPEED_MULT = 0.55;
export const REST_ENERGY_THRESHOLD = 0.15;
export const REST_METABOLISM_MULT = 0.7;
export const TURN_RATE = 8;
export const SEED_PLANTS_BATCH = 40;
```

### `core/constants/render.constants.ts`

```ts
export const MAX_DPR = 2;
export const GRID_STEP_WU = 40;
export const PICK_RADIUS_PX = 12;
export const MIN_AGENT_SCREEN_RADIUS_PX = 3;
export const MAX_AGENT_SCREEN_RADIUS_PX = 16;
export const DIRECTION_VECTOR_LENGTH_PX = 10;
export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 4;
export const ZOOM_WHEEL_SENSITIVITY = 0.0012;
```

---

## 3.3 Базовые типы

### `vec2.model.ts`

```ts
export interface Vec2 {
  x: number;
  y: number;
}
```

### `agent-kind.model.ts`

```ts
export type AgentKind = 'prey' | 'predator';
```

### `agent-fsm-state.model.ts`

```ts
export type PreyFsmState =
  | 'wander'
  | 'seekFood'
  | 'panic'
  | 'seekMate'
  | 'reproduce';

export type PredatorFsmState =
  | 'wander'
  | 'hunt'
  | 'seekMate'
  | 'reproduce'
  | 'rest';

export type AgentFsmState = PreyFsmState | PredatorFsmState;
```

### `dna-genes.model.ts`

```ts
/**
 * Геном агента. Все поля — непрерывные числа в диапазонах appendix A.
 * Храни как структуру (не «массив без имён»), чтобы паспорт и мутации были явными.
 */
export interface DnaGenes {
  /** Радиус зрения, world units */
  visionRange: number;
  /** Максимальная скорость, wu/s */
  maxSpeed: number;
  /** Максимальный запас энергии */
  maxEnergy: number;
  /** Базовый расход энергии в секунду (метаболизм покоя) */
  metabolism: number;
  /** Возраст (sim-seconds), с которого разрешено размножение */
  reproductiveAge: number;
  /** Порог энергии для входа в seekMate */
  reproductionEnergyThreshold: number;
  /** Размер тела — влияет на радиус коллизий, здоровье-ёмкость и отрисовку */
  bodySize: number;
}
```

---

## 3.4 Сущности мира

### `plant.model.ts`

```ts
export interface Plant {
  id: string;
  position: Vec2;
  energyValue: number; // обычно PLANT_ENERGY_VALUE
  radius: number;
  alive: boolean;
}
```

### `agent.model.ts`

```ts
export interface Agent {
  id: string;
  kind: AgentKind;
  genes: DnaGenes;
  position: Vec2;
  velocity: Vec2;
  heading: number; // radians
  energy: number;
  age: number;
  generation: number;
  fsmState: AgentFsmState;
  reproductionCooldown: number;
  alive: boolean;
  parentIds: [string | null, string | null];
}
```

### `world-config.model.ts`

```ts
export interface WorldConfig {
  width: number;
  height: number;
}
```

### `simulation-settings.model.ts`

```ts
export interface SimulationSettings {
  /** 0..1 */
  mutationRate: number;
  /** 0..1 — усиливает стоимость метаболизма / порог отбора (см. appendix B) */
  selectionPressure: number;
  /** множитель dt для ускорения симуляции */
  simSpeed: number;
}
```

---

## 3.5 Аналитика и LV

### `population-sample.model.ts`

```ts
export interface PopulationSample {
  t: number; // simulationTime
  plants: number;
  prey: number;
  predators: number;
}
```

### `gene-stats.model.ts`

```ts
export interface KindGeneAverages {
  count: number;
  avgVisionRange: number;
  avgMaxSpeed: number;
  avgMetabolism: number;
  avgBodySize: number;
  avgGeneration: number;
}

export interface GeneStatsSnapshot {
  prey: KindGeneAverages;
  predators: KindGeneAverages;
}
```

### `lotka-volterra.model.ts`

```ts
export interface LotkaVolterraParams {
  /** prey growth rate */
  alpha: number;
  /** predation rate */
  beta: number;
  /** predator death rate */
  gamma: number;
  /** predator growth from predation */
  delta: number;
}

export interface LotkaVolterraState {
  prey: number;
  predators: number;
  params: LotkaVolterraParams;
}

export interface LotkaVolterraSample {
  t: number;
  prey: number;
  predators: number;
  agentPrey: number;
  agentPredators: number;
}
```

### `camera-state.model.ts`

```ts
export interface CameraState {
  offsetX: number;
  offsetY: number;
  zoom: number;
  followEnabled: boolean;
  focusAgentId: string | null;
}
```

### `theme.model.ts` / `locale.model.ts`

```ts
export type ThemeId = 'dark' | 'light';
export type LocaleId = 'ru' | 'en';
```

---

## 3.6 Snapshot для рендера

Движок / store должен уметь отдать read-only snapshot:

```ts
export interface SimRenderSnapshot {
  world: WorldConfig;
  plants: readonly Plant[];
  agents: readonly Agent[];
  selectedAgentId: string | null;
  tick: number;
  simulationTime: number;
  isPlaying: boolean;
}
```

Файл: допустимо в `core/models/sim-render-snapshot.model.ts` **или** рядом с renderer; если добавишь отдельный файл — отрази в [08-file-checklist.md](08-file-checklist.md) как созданный (чеклист уже включает этот path).

---

## 3.7 Идентификаторы

- Растения: `plant-${monotonicCounter}`
- Жертвы: `prey-${monotonicCounter}`
- Хищники: `pred-${monotonicCounter}`
- Счётчики живут в `SpawnService` / `SimulationEngineService` и не сбрасываются при death (только при full reset).

---

## 3.8 Инварианты

1. `0 ≤ energy ≤ genes.maxEnergy`
2. Мёртвые сущности (`alive === false`) удаляются из массивов в конце тика (не копятся бесконечно).
3. `genes.*` всегда clamp в диапазоны appendix A после мутации.
4. `counts.prey` + `counts.predators` ≤ `MAX_TOTAL_AGENTS`; спавн и рождение уважают лимиты.
5. `heading` нормализован в `[0, 2π)` или `[-π, π)` — выбери один вариант и используй везде.

---

## 3.9 Критерий готовности документа 03

Все модели существуют как TypeScript interfaces/types; константы совпадают с appendix A; stores типизированы этими моделями.
