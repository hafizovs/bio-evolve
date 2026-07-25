# 04 — Simulation Engine

Реализуй движок **точно** по этому документу и [appendix-b-formulas.md](appendix-b-formulas.md). Не заменяй FSM случайным блужданием. Не пропускай генетику размножения.

---

## 4.1 Файлы

| Файл | Назначение |
|------|------------|
| `domain/math/rng.ts` | seeded / Math.random wrapper для тестов |
| `domain/math/clamp.ts` | clamp, lerp |
| `domain/math/lotka-volterra.ts` | шаг LV |
| `domain/genetics/*` | random DNA, crossover, mutate, gene-stats |
| `domain/ai/prey-fsm.ts` | FSM жертвы |
| `domain/ai/predator-fsm.ts` | FSM хищника |
| `domain/ai/steering.ts` | seek / flee / wander векторы |
| `domain/ecology/*` | energy, feeding, hunting, reproduction, plant-growth |
| `domain/population/spatial-hash.ts` | сетка соседей |
| `domain/population/nearest.ts` | nearest plant/agent queries |
| `services/simulation-engine.service.ts` | оркестрация тика |
| `services/spawn.service.ts` | создание сущностей |

---

## 4.2 Порядок тика (`SimulationEngineService.step(dtSimSeconds)`)

Пусть `dt` уже умножен на `simSpeed` снаружи (RenderLoop) **или** умножается внутри — зафиксируй один вариант; рекомендуется: RenderLoop передаёт `dtReal`, engine делает `dt = dtReal * settings.simSpeed` и clamp через `DT_CLAMP_SECONDS * simSpeed`.

Порядок **строго**:

1. **Rebuild spatial hash** по текущим живым plants + agents.
2. Для каждого живого **prey**: FSM decide → steering → integrate motion → metabolism.
3. Для каждого живого **predator**: FSM decide → steering → integrate motion → metabolism (скорость снижена при низкой энергии).
4. **Feeding:** prey ↔ nearest plant in eat radius → plant dies, prey energy += value.
5. **Hunting:** predator ↔ nearest prey in kill radius → prey dies, predator energy += gain.
6. **Reproduction:** пары seekMate одного kind в радиусе и с достаточным energy/age → offspring via crossover+mutate; cooldown.
7. **Plant growth / reseeding:** случайный regrow в пределах `MAX_PLANTS`.
8. **Cleanup:** удалить `alive === false`.
9. **Age / cooldown:** `age += dt`, `reproductionCooldown = max(0, cd - dt)`.
10. **Lotka–Volterra step** с теми же `dt` (см. 4.8).
11. **Analytics:** каждые `HISTORY_SAMPLE_EVERY_TICKS` — push population + LV sample; recompute gene stats.
12. **Publish** snapshot в `SimulationStore` + `AnalyticsStore`; `tick++`, `simulationTime += dt`.

---

## 4.3 Spatial Hash

`SpatialHash`:
- cell size = `SPATIAL_CELL_SIZE` (64 wu).
- `clear()` + `insert(id, x, y, kind)` каждый тик (или double-buffer).
- `queryRadius(x, y, r)` → кандидаты из покрывающих ячеек.
- `nearest.ts` фильтрует по kind и реальной дистанции.

Без spatial hash при N>200 FPS деградирует — **обязателен**.

---

## 4.4 Интеграция движения

```
desired = steeringForce (нормализованный * effectiveMaxSpeed)
velocity = lerp(velocity, desired, turnRate * dt)  // или прямое присвоение desired
position += velocity * dt
heading = atan2(velocity.y, velocity.x)
wrapOrClamp position в [0, world.width) × [0, world.height)
```

**Границы мира:** clamp (не тороид), чтобы follow-камера и LV-сравнение были предсказуемы. При упоре в стенку обнуляй компоненту скорости наружу.

`effectiveMaxSpeed`:
- base = `genes.maxSpeed`
- если `energy / maxEnergy < 0.25` → множитель `0.55` (хищники и жертвы)
- в состоянии `panic` у жертвы → множитель `1.15` (доп. расход энергии — см. appendix B)

---

## 4.5 Энергия и метаболизм

Каждый тик для агента:

\[
E \leftarrow E - \left(m + k_v \cdot \|v\| + k_s \cdot S\right) \cdot dt
\]

где \(m\) = `genes.metabolism`, \(S\) = `selectionPressure`, коэффициенты — в appendix B.

Если `E <= 0` → `alive = false` (смерть от голода).

---

## 4.6 FSM — Жертвы (`prey-fsm.ts`)

Приоритет переходов (сверху вниз):

1. Если в `visionRange` есть **predator** → `panic` (flee от ближайшего).
2. Иначе если `age >= reproductiveAge` и `energy >= reproductionEnergyThreshold` и `reproductionCooldown <= 0` и есть visible mate → `seekMate`.
3. Иначе если `energy < 0.7 * maxEnergy` → `seekFood` (nearest plant).
4. Иначе → `wander`.
5. Если оба партнёра в радиусе mate и оба в `seekMate`/`reproduce` → `reproduce` (один тик создаёт потомка через ecology/reproduction).

Flee: направление = normalize(myPos - predatorPos).  
Seek: normalize(target - myPos).  
Wander: слабый случайный steering + инерция.

---

## 4.7 FSM — Хищники (`predator-fsm.ts`)

1. Если энергия очень низкая (`< 0.15 * maxEnergy`) и нет жертвы рядом → `rest` (почти стоп, низкий метаболизм multiplier 0.7).
2. Иначе если готовы к размножению и есть mate → `seekMate` / `reproduce`.
3. Иначе если в `visionRange` есть prey → `hunt` (pursue nearest).
4. Иначе → `wander`.

При `hunt` скорость = `effectiveMaxSpeed`; при низкой энергии effective уже снижен (4.4).

---

## 4.8 Питание и охота

**Feeding:** если distance(prey, plant) ≤ `prey.genes.bodySize * PREY_EAT_RADIUS_FACTOR + plant.radius` → plant.alive=false; prey.energy = min(maxEnergy, energy + plant.energyValue).

**Hunting:** если distance(pred, prey) ≤ `(pred.bodySize + prey.bodySize) * 0.5 * PREDATOR_KILL_RADIUS_FACTOR` → prey.alive=false; pred.energy = min(max, energy + PREDATION_ENERGY_GAIN).

Один агент — одна успешная атака/поедание за тик (первый nearest).

---

## 4.9 Размножение и генетика

Условия пары (оба агента kind K):
- оба alive, cooldown=0, age≥reproductiveAge, energy≥threshold
- distance ≤ `(bodyA + bodyB) * 0.75`
- лимит популяции kind не превышен

Алгоритм:
1. `childGenes = crossover(parentA.genes, parentB.genes)`
2. `childGenes = mutate(childGenes, mutationRate, MUTATION_STRENGTH)` + clamp ranges
3. Создать Agent: generation = max(parents)+1, energy = avg(parents)*OFFSPRING_ENERGY_FRACTION (или фиксированная доля maxEnergy — см. appendix B), position = midpoint + small jitter
4. У обоих родителей: `energy *= (1 - PARENT_ENERGY_COST_FRACTION)`, `reproductionCooldown = REPRODUCTION_COOLDOWN`, fsm → wander

`selectionPressure` влияет на то, какие особи чаще доживают до reproduction (через метаболизм), а не на «удаление слабых» вручную. Дополнительно допустим soft filter: при `selectionPressure > 0.7` потомки с `maxSpeed` и `visionRange` ниже 15-го перцентиля текущего вида получают штраф метаболизма +10% (реализуй явно в `reproduction.ts` или `energy.ts`).

---

## 4.10 Lotka–Volterra (параллельный трек)

Классическая модель:

\[
\frac{dN}{dt} = \alpha N - \beta N P
\]

\[
\frac{dP}{dt} = \delta N P - \gamma P
\]

Численный шаг: **RK2 (Heun)** или semi-implicit Euler — см. appendix B.  
Начальные N,P = стартовые counts prey/predators.  
Параметры α,β,γ,δ — из appendix A; при Reset пересоздаются.

**Важно:** LV **не** управляет агентами; только аналитика/сравнение.

---

## 4.11 SpawnService

Методы:
- `createRandomPrey(position?: Vec2): Agent`
- `createRandomPredator(position?: Vec2): Agent`
- `createPlant(position?: Vec2): Plant`
- `seedInitialWorld(): { plants, agents }`
- `spawnPreyBatch(n)`, `spawnPredatorBatch(n)`, `seedPlants(n)` — уважают MAX_* лимиты

Случайная ДНК: uniform в [min, max] из gene-ranges (разные диапазоны для prey vs predator — appendix A).

---

## 4.12 Reset

`simulationStore.resetToDefaults()`:
1. pause optional — лучше оставить playing.
2. clear analytics history.
3. `spawn.seedInitialWorld()` → replace plants/agents.
4. reset LV state to initial counts + default params.
5. clear selection, `camera.fitWorld`, tick=0, time=0.

---

## 4.13 Критерий готовности документа 04

Тик выполняется в указанном порядке; FSM жертв/хищников различимы поведением; кроссинговер+мутация создают потомков; LV шагает параллельно; spatial hash используется для nearest queries.
