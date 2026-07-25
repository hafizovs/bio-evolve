# BioEvolve — Главный промпт генерации проекта

> **Как использовать этот пакет:** вставь содержимое этого файла (INDEX.md) в начало диалога с кодовым агентом, затем укажи: «Прочитай и строго выполни документы `docs/01` → `docs/09` и оба appendix в указанном порядке. Генерируй полный код приложения без сокращений.»

---

## 0. Роль и миссия

Ты — **Senior Angular Engineer** и **Systems Biologist**. Твоя задача — **с нуля** создать полноценное, интерактивное, биологически осмысленное веб-приложение:

**«BioEvolve: Симулятор Экосистемы и Направленной Эволюции»**

на **последнем стабильном Angular (22+ на момент генерации)**.

Не спрашивай разрешения «начать с MVP». Выдай **полный рабочий проект**: все файлы, все формулы, все модели ДНК, весь FSM агентов, все UI-панели, Lotka–Volterra, графики, тесты из пакета документов. Выжми максимум из контекста. Не жалей токенов. Пиши шедевр.

Этот INDEX — точка входа. Детальные требования — в связанных документах ниже. При конфликте: **более специфичный документ побеждает**; жёсткие правила из §1 этого файла **неотменяемы**.

---

## 1. ЖЁСТКИЕ ПРАВИЛА ГЕНЕРАЦИИ КОДА (БЕЗ ИСКЛЮЧЕНИЙ)

1. **ПИШИ КОД ПОЛНОСТЬЮ.** Любые сокращения, комментарии вида `// ...`, `// TODO`, `// аналогично`, `/* rest of file */`, `...existing code...` **ЗАПРЕЩЕНЫ**. Каждая строка, каждая функция, каждый класс, каждый цикл симуляции, каждый словарь i18n, каждый тест — целиком. Если файл большой — пиши его целиком.
2. **Только современный Angular:**
   - Standalone-компоненты (`standalone: true` явно, если CLI ещё требует).
   - **Angular Signals** для реактивного состояния экосистемы (`signal`, `computed`, `effect`, `linkedSignal`). **Запрещены** `BehaviorSubject` / `Subject` для UI/симуляционного состояния.
   - Новый Control Flow: `@if`, `@for` (с обязательным `track`), `@switch`, `@let`. **Запрещены** `*ngIf`, `*ngFor`, `*ngSwitch`.
   - `input()`, `output()`, `model()` вместо `@Input` / `@Output` декораторов.
   - `inject()` для DI.
   - **Zoneless** change detection (как в новых приложениях Angular 21+/22+). Не опирайся на Zone.js для обновления UI.
   - `ChangeDetectionStrategy.OnPush` (дефолт новых приложений — не отключай).
3. **Разделяй логику:** интерфейсы/модели отдельно, genetics/FSM/ecology отдельно, Canvas-рендерер отдельно, UI-компоненты отдельно, stores (signals) отдельно. UI **не** считает кроссинговер и уравнения Лотки–Вольтерры.
4. **Canvas 2D only.** HTML5 `<canvas>` для мира симуляции и для графиков популяций / сравнения с LV. **Запрещены** Three.js, Babylon, WebGL-фреймворки, Chart.js, D3, Plotly.
5. **Биологическая механика обязательна:** ДНК-гены, FSM жертв/хищников, метаболизм энергии, кроссинговер + мутация, смерть, спавн. Числа и диапазоны — из [appendix-a-defaults.md](appendix-a-defaults.md). Формулы — из [appendix-b-formulas.md](appendix-b-formulas.md) и [04-simulation-engine.md](04-simulation-engine.md).
6. **Lotka–Volterra** интегрируется параллельно агентной симуляции для сравнительного графика — обязательно (см. [07-features-extended.md](07-features-extended.md)).
7. **Запрещены заглушки:** пустые методы, `return 0`, fake agents, Lorem Ipsum в UI, `console.log` вместо логики, «потом допишем».
8. **Тесты обязательны** минимум для: crossover, mutation, Lotka–Volterra step, FSM transition sanity (см. [07-features-extended.md](07-features-extended.md), [09-acceptance-criteria.md](09-acceptance-criteria.md)).
9. **i18n RU/EN** через signal-словарь (не `@angular/localize` build-time), см. [07-features-extended.md](07-features-extended.md).
10. **Структура файлов** должна соответствовать [08-file-checklist.md](08-file-checklist.md). Не пропускай файлы из чеклиста.
11. **Стили:** SCSS + CSS variables, тема **Sci-Fi Dark** по умолчанию. Tailwind **не** подключать (чтобы не плодить зависимости); визуал лаборатории — на чистом CSS.

---

## 2. Порядок чтения и выполнения документов

Выполняй **строго по порядку**. Не начинай UI, пока не зафиксированы модели и движок симуляции.

| Шаг | Документ | Что сделать |
|-----|----------|-------------|
| 1 | [01-product-vision.md](01-product-vision.md) | Понять продукт, UX лаборатории, journeys, хоткеи, a11y |
| 2 | [02-architecture.md](02-architecture.md) | Создать скелет Angular-проекта и папок |
| 3 | [03-data-model.md](03-data-model.md) + [appendix-a-defaults.md](appendix-a-defaults.md) | Модели ДНК, агентов, растений, настроек, истории |
| 4 | [04-simulation-engine.md](04-simulation-engine.md) + [appendix-b-formulas.md](appendix-b-formulas.md) | Тик мира, FSM, генетика, энергия, spatial hash |
| 5 | [05-canvas-renderer.md](05-canvas-renderer.md) | Полный Canvas pipeline мира |
| 6 | [06-ui-panels.md](06-ui-panels.md) | God Panel, Genetic Passport, Analytics |
| 7 | [07-features-extended.md](07-features-extended.md) | Lotka–Volterra, сравнение графиков, i18n, тесты, hotkeys, reset |
| 8 | [08-file-checklist.md](08-file-checklist.md) | Сверка: все файлы существуют и полны |
| 9 | [09-acceptance-criteria.md](09-acceptance-criteria.md) | Прогнать DoD / приёмку |

---

## 3. Краткий функциональный объём (обязателен целиком)

### Ядро симуляции
- 2D-мир на Canvas: **Растения** (ресурс), **Зайцы** (жертвы/травоядные), **Волки** (хищники).
- У каждого зайца и волка — уникальная **ДНК** (структура генов): радиус зрения, макс. скорость, запас энергии / метаболизм, репродуктивный возраст и порог энергии, размер тела.
- **FSM** поведение: жертвы ищут растения, паникуют от хищников; хищники преследуют жертв; при низкой энергии скорость падает.
- **Размножение:** поиск партнёра своего вида → кроссинговер ДНК → мутация → потомок.
- Энергия, метаболизм, смерть от голода / хищничества; засев травы и регенерация растений.

### Интерфейс
- Интерактивный Canvas: круги разных цветов + вектор направления; клик → follow-камера + **Генетический паспорт**.
- **Панель Бога:** спавн 50 зайцев / 10 волков / трава; слайдеры мутации, жёсткости отбора, скорости симуляции; Pause / Start.
- **Аналитика:** график численности (трава, жертвы, хищники) на чистом Canvas; средние гены скорости и зрения по популяциям.

### Расширения (обязательны)
- Параллельный расчёт **Lotka–Volterra** + сравнительный график агентная модель vs теория.
- Reset мира, hotkeys, Sci-Fi Dark + светлая тема, i18n RU/EN.
- Unit-тесты genetics / LV / FSM.

---

## 4. Технологический стек (зафиксировано)

| Область | Выбор |
|---------|--------|
| Framework | Angular **latest stable ≥ 22** |
| Components | Standalone only |
| State | Signals stores (`providedIn: 'root'` или feature) |
| CD | Zoneless + OnPush |
| Rendering | HTML5 Canvas 2D (мир + charts) |
| Forms controls | native + signals / `model()` |
| Styling | SCSS + CSS variables (Sci-Fi Dark); **без** Tailwind |
| i18n | Signal-словари `ru.ts` / `en.ts` + `I18nService.t(key)` |
| Tests | Стандартный test runner CLI проекта (Vitest или Jest) |
| Package manager | npm |
| Language UI default | `ru` |

**Команда старта проекта (ориентир):**

```bash
npx @angular/cli@latest new bio-evolve --routing=false --style=scss --ssr=false
cd bio-evolve
```

Имя приложения в `package.json` / title: **BioEvolve**. Селектор префикс: `bev`.

---

## 5. Definition of Done (кратко)

Приложение **готово**, только если:

1. `ng serve` / `npm start` запускает симулятор без ошибок.
2. На canvas видны растения, зайцы, волки; агенты двигаются; направление отрисовано.
3. Жертвы едят растения и убегают от волков; волки преследуют и охотятся; размножение с кроссинговером/мутацией работает.
4. Клик по агенту включает follow и открывает Genetic Passport со всеми генами, возрастом, энергией, поколением.
5. God Panel: спавн, слайдеры, pause/play работают.
6. График популяций и средние гены обновляются в реальном времени.
7. Lotka–Volterra считается параллельно и сравнительный график отображается.
8. i18n RU↔EN, theme toggle, hotkeys, reset — работают.
9. Unit-тесты genetics/LV/FSM проходят.
10. В исходниках **нет** `// TODO`, `// ...`, `*ngIf`, `*ngFor`, BehaviorSubject-state, Chart.js, Three.js, Tailwind.
11. Чеклист [08-file-checklist.md](08-file-checklist.md) выполнен на 100%.
12. Все пункты [09-acceptance-criteria.md](09-acceptance-criteria.md) отмечены как выполненные.

Полный текст приёмки — в документе 09.

---

## 6. Стиль ответа генератора

1. Сначала создай структуру проекта и доменный слой (модели → genetics/FSM/ecology → stores).
2. Затем simulation tick + spatial hash, затем Canvas, затем UI-панели, затем Lotka–Volterra, i18n и тесты.
3. Каждый файл выводи **целиком** с путём.
4. После завершения — кратко перечисли, как запустить и как проверить ключевые сценарии из §5.
5. Не предлагай «упростить генетику». Не заменяй FSM на случайное блуждание. Не пропускай Lotka–Volterra.

---

## 7. Начни сейчас

Прочитай [01-product-vision.md](01-product-vision.md) и приступай к генерации полного проекта **BioEvolve** согласно всему пакету `docs/`.

**Начинай генерацию. Напиши этот проект как Senior Angular Engineer и Systems Biologist.**
