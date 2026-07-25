# Appendix B — Formulas & Algorithms

Справочник формул. Реализации — в `domain/**` согласно [04-simulation-engine.md](04-simulation-engine.md).

---

## B.1 Обозначения

| Symbol | Meaning | Unit |
|--------|---------|------|
| \(\mathbf{x}\) | position | wu |
| \(\mathbf{v}\) | velocity | wu/s |
| \(E\) | energy | eu |
| \(m\) | metabolism gene | eu/s |
| \(S\) | selectionPressure | 0..1 |
| \(r_v\) | visionRange | wu |
| \(v_{\max}\) | maxSpeed gene | wu/s |
| \(dt\) | sim step | s |
| \(N\) | LV prey | count |
| \(P\) | LV predators | count |
| \(\alpha,\beta,\gamma,\delta\) | LV params | — |

---

## B.2 Метаболизм / расход энергии

\[
\frac{dE}{dt} = -\left( m + k_v \|\mathbf{v}\| + k_s S \cdot m \right) \cdot \mu_{\text{state}}
\]

где:
- \(k_v =\) `METABOLISM_SPEED_COEFF` = 0.04
- \(k_s =\) `METABOLISM_SELECTION_COEFF` = 0.35
- \(\mu_{\text{state}} =\) `PANIC_ENERGY_MULT` (1.25) в panic; `REST_METABOLISM_MULT` (0.70) в rest; иначе 1

Дискретно:

```
drain = (metabolism + METABOLISM_SPEED_COEFF * speed + METABOLISM_SELECTION_COEFF * selectionPressure * metabolism)
        * stateMult * dt
energy = energy - drain
if energy <= 0: alive = false
```

---

## B.3 Эффективная скорость

```
eff = genes.maxSpeed
if energy / genes.maxEnergy < LOW_ENERGY_THRESHOLD:
  eff *= LOW_ENERGY_SPEED_MULT
if fsmState == 'panic':
  eff *= PANIC_SPEED_MULT
```

Steering desired velocity = `normalize(steerDir) * eff`.

Интеграция:

```
v = lerp(v, desired, clamp(TURN_RATE * dt, 0, 1))
x = x + v * dt
heading = atan2(v.y, v.x)
clamp x into world bounds
```

---

## B.4 Crossover

Для каждого гена \(g\) независимо (uniform gene blend):

\[
g_{\text{child}} = (1 - \lambda)\, g_A + \lambda\, g_B
\]

где \(\lambda =\) `CROSSOVER_BLEND` (0.5) **или** \(\lambda \sim U(0,1)\) per gene.

**Требование реализации:** используй **per-gene** \(\lambda \sim U(0,1)\) — даёт большее разнообразие. `CROSSOVER_BLEND` константа остаётся в файле как documented fallback / mean.

```
function crossover(a: DnaGenes, b: DnaGenes): DnaGenes:
  out = {}
  for each key in DnaGenes:
    lam = random()  // 0..1
    out[key] = (1 - lam) * a[key] + lam * b[key]
  return out
```

---

## B.5 Mutation

Для каждого гена:

```
if random() < mutationRate:
  delta = genes[key] * MUTATION_STRENGTH * (2 * random() - 1)  // ± strength
  genes[key] = genes[key] + delta
clamp genes[key] to kind-specific [min, max]
```

При `mutationRate = 0` результат идентичен входу (после crossover без mutate — тест).

---

## B.6 Plant regrowth

Каждый тик:

```
if livingPlants >= MAX_PLANTS: return
expected = PLANT_REGROW_CHANCE_PER_SECOND * dt * max(livingPlants, 1)
// stochastic: while random() < expected and count < MAX: spawn one; expected -= 1
// проще: if random() < min(1, expected): spawn floor(expected)+Bernoulli(frac) plants
spawn up to available slots at random free-ish positions
```

Реализуй полностью один выбранный стохастический вариант; документируй комментарием в `plant-growth.ts`.

---

## B.7 Reproduction energy split

```
childEnergy = clamp(
  ((parentA.energy + parentB.energy) * 0.5) * OFFSPRING_ENERGY_FRACTION,
  1,
  childGenes.maxEnergy
)
parentA.energy *= (1 - PARENT_ENERGY_COST_FRACTION)
parentB.energy *= (1 - PARENT_ENERGY_COST_FRACTION)
// затем clamp родителей в [0, maxEnergy]
```

---

## B.8 Lotka–Volterra ODEs

\[
\frac{dN}{dt} = \alpha N - \beta N P
\]

\[
\frac{dP}{dt} = \delta N P - \gamma P
\]

### Численный метод: Heun (RK2)

```
function derivatives(N, P, p):
  dN = p.alpha * N - p.beta * N * P
  dP = p.delta * N * P - p.gamma * P
  return dN, dP

function stepLotkaVolterra(state, dt):
  N, P = state.prey, state.predators
  p = state.params

  dN1, dP1 = derivatives(N, P, p)
  N_pred = max(0, N + dN1 * dt)
  P_pred = max(0, P + dP1 * dt)

  dN2, dP2 = derivatives(N_pred, P_pred, p)
  N_next = max(0, N + 0.5 * (dN1 + dN2) * dt)
  P_next = max(0, P + 0.5 * (dP1 + dP2) * dt)

  // soft cap for UI stability
  N_next = min(N_next, MAX_PREY * 2)
  P_next = min(P_next, MAX_PREDATORS * 2)

  return { ...state, prey: N_next, predators: P_next }
```

### Sanity checks (для тестов)
1. `P=0`, `N>0` → \(dN/dt = \alpha N > 0\) → N растёт после шага.
2. `N=0`, `P>0` → \(dP/dt = -\gamma P < 0\) → P убывает.
3. Нет NaN/Infinity при dt=0.05 и default params на 1000 шагов.

---

## B.9 Nearest query

```
candidates = spatialHash.queryRadius(x, y, range)
best = null; bestDist = +inf
for c in candidates:
  if !c.alive or wrong kind: continue
  d = hypot(c.x - x, c.y - y)
  if d <= range and d < bestDist:
    bestDist = d; best = c
return best
```

---

## B.10 Steering primitives

```
seek(from, to) = normalize(to - from)
flee(from, threat) = normalize(from - threat)
wander(heading) = normalize(dir(heading) + randomUnit() * wanderStrength)
```

`wanderStrength` рекомендуемый: 0.35.

---

## B.11 Soft selection pressure on offspring (optional-but-required when S>0.7)

Если `selectionPressure > 0.7` и у вида ≥ 10 особей:

```
p15_speed = percentile(species.maxSpeed, 15)
p15_vision = percentile(species.visionRange, 15)
if child.maxSpeed < p15_speed and child.visionRange < p15_vision:
  child.metabolism *= 1.10
  clamp metabolism to range
```

Реализуй в `reproduction.ts` полностью (перцентиль — простой sort + index).

---

## B.12 Gene averages

```
for kind in {prey, predator}:
  subset = agents.filter(a => a.alive && a.kind == kind)
  avg(field) = sum(genes[field]) / count  (0 if count==0)
```

---

## B.13 Критерий готовности Appendix B

Все формулы из B.2–B.8 реализованы в коде; LV использует Heun/RK2; тесты sanity из B.8 проходят.
