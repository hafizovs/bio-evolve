# Appendix A — Defaults, Ranges & Seed Data

Справочник чисел. Реализации копируют значения в `core/constants/*` и `domain/genetics/gene-ranges.ts` **без округления «на глаз»**.

---

## A.1 Мир

| Константа | Значение |
|-----------|----------|
| `WORLD_WIDTH` | 1200 |
| `WORLD_HEIGHT` | 800 |
| `INITIAL_PLANTS` | 120 |
| `INITIAL_PREY` | 40 |
| `INITIAL_PREDATORS` | 10 |
| `MAX_PLANTS` | 400 |
| `MAX_PREY` | 300 |
| `MAX_PREDATORS` | 120 |
| `MAX_TOTAL_AGENTS` | 400 |
| `SEED_PLANTS_BATCH` | 40 |
| `SPATIAL_CELL_SIZE` | 64 |

Стартовые позиции: равномерно-случайно в `[margin, width-margin] × [margin, height-margin]`, `margin = 20`.

---

## A.2 Настройки симуляции (дефолт UI)

| Параметр | Значение | UI |
|----------|----------|-----|
| `mutationRate` | 0.08 | 8% |
| `selectionPressure` | 0.50 | 50% |
| `simSpeed` | 1.0 | ×1 |
| `SIM_SPEED_MIN` | 0.25 | |
| `SIM_SPEED_MAX` | 8 | |
| `MUTATION_STRENGTH` | 0.12 | ±12% |
| `CROSSOVER_BLEND` | 0.5 | |
| `HISTORY_MAX_SAMPLES` | 300 | |
| `HISTORY_SAMPLE_EVERY_TICKS` | 5 | |
| `DT_CLAMP_SECONDS` | 0.05 | |

---

## A.3 Экология

| Константа | Значение |
|-----------|----------|
| `PLANT_ENERGY_VALUE` | 25 |
| `PLANT_RADIUS` | 4 |
| `PLANT_REGROW_CHANCE_PER_SECOND` | 0.15 | суммарный rate: пытаться добавить `chance * dt * livingPlants` с потолком MAX — см. формулу B.6 |
| `PREY_EAT_RADIUS_FACTOR` | 1.0 |
| `PREDATOR_KILL_RADIUS_FACTOR` | 1.1 |
| `PREDATION_ENERGY_GAIN` | 45 |
| `REPRODUCTION_COOLDOWN` | 4 |
| `OFFSPRING_ENERGY_FRACTION` | 0.40 |
| `PARENT_ENERGY_COST_FRACTION` | 0.35 |
| `METABOLISM_SPEED_COEFF` | 0.04 |
| `METABOLISM_SELECTION_COEFF` | 0.35 |
| `PANIC_SPEED_MULT` | 1.15 |
| `PANIC_ENERGY_MULT` | 1.25 |
| `LOW_ENERGY_THRESHOLD` | 0.25 |
| `LOW_ENERGY_SPEED_MULT` | 0.55 |
| `REST_ENERGY_THRESHOLD` | 0.15 |
| `REST_METABOLISM_MULT` | 0.70 |
| `TURN_RATE` | 8.0 |

---

## A.4 Диапазоны генов — Prey (hare)

| Ген | Min | Max | Typical mean (для справки) |
|-----|-----|-----|----------------------------|
| `visionRange` | 40 | 160 | 90 |
| `maxSpeed` | 35 | 110 | 60 |
| `maxEnergy` | 80 | 160 | 110 |
| `metabolism` | 1.5 | 5.0 | 2.8 |
| `reproductiveAge` | 6 | 20 | 10 |
| `reproductionEnergyThreshold` | 45 | 100 | 70 |
| `bodySize` | 4 | 9 | 6 |

Файл: `gene-ranges.ts` → `PREY_GENE_RANGES`.

---

## A.5 Диапазоны генов — Predator (wolf)

| Ген | Min | Max | Typical mean |
|-----|-----|-----|--------------|
| `visionRange` | 50 | 200 | 120 |
| `maxSpeed` | 40 | 130 | 75 |
| `maxEnergy` | 100 | 200 | 140 |
| `metabolism` | 2.0 | 6.5 | 3.5 |
| `reproductiveAge` | 8 | 24 | 12 |
| `reproductionEnergyThreshold` | 55 | 120 | 85 |
| `bodySize` | 6 | 12 | 8 |

Файл: `gene-ranges.ts` → `PREDATOR_GENE_RANGES`.

Стартовые агенты: каждый ген ~ Uniform(min, max).  
Стартовая энергия = `0.7 * maxEnergy`.  
Стартовый `generation = 0`, `fsmState = 'wander'`, `reproductionCooldown = 0`, `parentIds = [null, null]`.

---

## A.6 Цвета (canvas + UI tokens)

| Token / сущность | Hex |
|------------------|-----|
| Plant | `#3ecf6a` |
| Prey | `#4da3ff` |
| Predator | `#e85d5d` |
| Panic prey tint | `#f0b429` |
| Selection | `#3dd6c6` |
| Lab bg | `#070b12` |

---

## A.7 Lotka–Volterra default params

Подобраны для видимых осцилляций на масштабе симуляции (не «реальные» полевые коэффициенты):

| Param | Symbol | Value |
|-------|--------|-------|
| Prey growth | α `alpha` | 0.55 |
| Predation | β `beta` | 0.025 |
| Predator death | γ `gamma` | 0.45 |
| Predator growth | δ `delta` | 0.012 |

Initial:
- `N0 = INITIAL_PREY` (40)
- `P0 = INITIAL_PREDATORS` (10)

При Reset: N,P ← текущие стартовые counts из seed world (после seed = INITIAL_*).

---

## A.8 Render defaults

| Константа | Значение |
|-----------|----------|
| `MAX_DPR` | 2 |
| `GRID_STEP_WU` | 40 |
| `PICK_RADIUS_PX` | 12 |
| `MIN_AGENT_SCREEN_RADIUS_PX` | 3 |
| `MAX_AGENT_SCREEN_RADIUS_PX` | 16 |
| `DIRECTION_VECTOR_LENGTH_PX` | 10 |
| `ZOOM_MIN` | 0.4 |
| `ZOOM_MAX` | 4 |
| `ZOOM_WHEEL_SENSITIVITY` | 0.0012 |

---

## A.9 Mate / vision interaction radii

| Правило | Формула |
|---------|---------|
| Prey sees predator | `distance ≤ prey.genes.visionRange` |
| Predator sees prey | `distance ≤ predator.genes.visionRange` |
| Mate proximity | `distance ≤ (bodyA + bodyB) * 0.75` |
| Eat plant | `distance ≤ prey.bodySize * PREY_EAT_RADIUS_FACTOR + plant.radius` |
| Kill prey | `distance ≤ (pred.bodySize + prey.bodySize) * 0.5 * PREDATOR_KILL_RADIUS_FACTOR` |

---

## A.10 Критерий готовности Appendix A

Все таблицы перенесены в constants/gene-ranges; стартовый seed и LV params совпадают с этим документом.
