# 01 — Product Vision & UX

Документ обязателен к исполнению целиком. Генератор кода не имеет права упрощать сценарии или выкидывать панели.

---

## 1.1 Продукт

| Поле | Значение |
|------|----------|
| Название | **BioEvolve** |
| Подзаголовок (RU) | Симулятор Экосистемы и Направленной Эволюции |
| Подзаголовок (EN) | Ecosystem & Directed Evolution Simulator |
| Тип | SPA, образовательно-научная интерактивная лаборатория |
| Платформа | Современный desktop Chrome/Firefox/Edge; mobile — usable (панели collapsible), desktop — primary |
| Рендер | HTML5 Canvas 2D (мир + графики) |
| Научный уровень | Агентная экосистема хищник–жертва–ресурс + генетический алгоритм + параллельная модель Лотки–Вольтерры |

**Ценность:** показать, как из простых правил поведения и ДНК возникает эволюция признаков (скорость, зрение) и динамика популяций, сравнивая агентную симуляцию с классической математической моделью.

**Аудитория:** студенты биологии/экологии, преподаватели, энтузиасты эволюционных алгоритмов, разработчики, изучающие Angular + canvas simulations.

---

## 1.2 Информационная архитектура экрана

Один главный экран (без роутинга страниц):

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Toolbar: BioEvolve | theme | lang | reset | screenshot | hint            │
├────────────────────────────────┬───────────────────┬─────────────────────┤
│                                │ God Panel         │ Analytics           │
│                                │  - spawn buttons  │  - pop chart        │
│         Sim Canvas (full)      │  - sliders        │  - gene averages    │
│         (ecosystem world)      │  - pause / play   │  - LV compare chart │
│                                │ Genetic Passport  │                     │
│                                │  (when selected)  │                     │
└────────────────────────────────┴───────────────────┴─────────────────────┘
│ Status bar: tick | populations | sim speed | mutation % | selection      │
└──────────────────────────────────────────────────────────────────────────┘
```

- Canvas занимает основную левую область (минимум ~55% ширины на desktop ≥ 1200px).
- Правая колонка: God Panel сверху, Genetic Passport (если выбран агент), Analytics снизу; ширина правой колонки **360px**.
- На ширине `< 1000px`: правая колонка — overlay / drawer с кнопкой закрытия; Analytics может быть вкладкой.
- Z-index: canvas (0) < panels (10) < status (15) < drawers/modals (30).

---

## 1.3 Визуальный язык — Sci-Fi Dark Laboratory

Тема по умолчанию: **dark** (Sci-Fi Dark). Светлая тема — переключатель.

CSS variables (обязательные имена в `styles.scss`):

```scss
:root,
[data-theme='dark'] {
  --bev-bg-deep: #070b12;
  --bev-bg-panel: #0d1522;
  --bev-bg-panel-elevated: #121c2c;
  --bev-border: #1e2f45;
  --bev-text: #e6eef8;
  --bev-text-muted: #8aa0b8;
  --bev-accent: #3dd6c6;       /* lab cyan — не purple */
  --bev-accent-2: #f0b429;     /* prey highlight */
  --bev-danger: #e85d5d;       /* predator */
  --bev-plant: #3ecf6a;
  --bev-prey: #4da3ff;
  --bev-predator: #e85d5d;
  --bev-grid: rgba(61, 214, 198, 0.06);
  --bev-glow: rgba(61, 214, 198, 0.25);
  --bev-font-ui: 'IBM Plex Sans', 'Segoe UI', sans-serif;
  --bev-font-mono: 'IBM Plex Mono', 'Consolas', monospace;
}

[data-theme='light'] {
  --bev-bg-deep: #e8eef5;
  --bev-bg-panel: #f5f8fc;
  --bev-bg-panel-elevated: #ffffff;
  --bev-border: #c5d3e3;
  --bev-text: #0d1522;
  --bev-text-muted: #5a6f86;
  --bev-accent: #0f8f84;
  --bev-accent-2: #b8860b;
  --bev-danger: #c62828;
  --bev-plant: #1b8a45;
  --bev-prey: #1565c0;
  --bev-predator: #c62828;
  --bev-grid: rgba(15, 143, 132, 0.08);
  --bev-glow: rgba(15, 143, 132, 0.15);
}
```

Шрифты подключить через Google Fonts (IBM Plex Sans + IBM Plex Mono) в `index.html`. Canvas фон мира всегда тёмный «биореактор» (`#070b12` / лёгкая сетка), даже в light theme панелей.

**Запрещено:** purple/indigo градиенты как бренд, Inter/Roboto/Arial как единственный стек, emoji в UI-кнопках.

Brand в toolbar: слово **BioEvolve** крупнее соседних контролов (не только мелкий текст в nav).

---

## 1.4 User Journeys (обязательные сценарии)

### J1 — Первый запуск / обзор экосистемы
1. Пользователь открывает приложение.
2. Тема: **dark**. Locale: **ru**.
3. Симуляция: **playing**, скорость по умолчанию из [appendix-a-defaults.md](appendix-a-defaults.md).
4. Мир уже засеян: стартовые популяции растений / зайцев / волков из appendix A.
5. Камера: центр мира, zoom так, чтобы весь мир (`worldWidth` × `worldHeight`) помещался с padding 4%.
6. Analytics показывает первые точки графика популяций; LV-трек стартует с тех же начальных численностей.

### J2 — Наблюдение за агентом (Genetic Passport)
1. Клик по зайцу или волку на canvas.
2. Агент становится `selectedAgentId`.
3. Камера переходит в режим **follow**: центр камеры = позиция агента каждый кадр.
4. В правой колонке открывается **Генетический паспорт**: все гены, возраст, энергия (сытость), поколение, вид, FSM-состояние, id.
5. `Esc` или кнопка «Снять фокус» → follow off; камера остаётся на последней позиции; passport скрывается / показывает empty state.

### J3 — Панель Бога: спавн и параметры
1. Кнопка «Добавить 50 зайцев» → спавн 50 жертв со случайной ДНК в допустимых диапазонах.
2. «Добавить 10 волков» → 10 хищников.
3. «Засеять травой» → добавить N растений (см. appendix A).
4. Слайдеры: шанс мутации 0–100%, жёсткость отбора, скорость симуляции — мгновенно влияют на следующий тик.
5. Pause / Start переключают `isPlaying`.

### J4 — Эволюция на глазах
1. Пользователь оставляет симуляцию на несколько минут (или ускоряет speed).
2. Analytics → блок «Средние гены» показывает рост/падение avg speed / avg vision для жертв и хищников.
3. Пользователь видит, что популяции осциллируют; при вымирании одного вида спавн восстанавливает эксперимент.

### J5 — Сравнение с Lotka–Volterra
1. В Analytics виден график агентных численностей (3 линии).
2. Ниже / рядом — сравнительный график: агентные жертвы/хищники vs теоретические N(t), P(t) из LV.
3. Параметры LV калибруются из настроек мира / наблюдаемых rates (см. 07 + appendix B); UI может показывать текущие α, β, γ, δ.

### J6 — Reset / Screenshot / Lang / Theme
1. Reset → мир пересоздаётся со стартовыми популяциями; история графиков очищается; LV перезапускается; selection сбрасывается.
2. Screenshot → PNG только sim-canvas: `bio-evolve-YYYYMMDD-HHmmss.png`.
3. Lang RU↔EN мгновенно через `t(key)`.
4. Theme dark↔light меняет панели; canvas мира остаётся тёмным.

---

## 1.5 Цвета сущностей на canvas (закон)

| Сущность | Цвет fill | Примечание |
|----------|-----------|------------|
| Plant | `#3ecf6a` | круг, без вектора направления |
| Prey (hare) | `#4da3ff` (молодёжь чуть светлее допустимо) | круг + вектор |
| Predator (wolf) | `#e85d5d` | круг + вектор |
| Selected | обводка `#3dd6c6`, толщина 2–3 px, лёгкий glow | поверх цвета вида |
| Panic prey | допустим краткий tint `#f0b429` | опционально по FSM state |

Размер круга на экране пропорционален `genes.bodySize` (см. 05), с clamp min/max.

---

## 1.6 Горячие клавиши

| Key | Действие |
|-----|----------|
| `Space` | Toggle pause / play |
| `Esc` | Снять follow / selection |
| `R` | Reset мира (если фокус не в input/range) |
| `S` | Screenshot sim-canvas |
| `T` | Toggle theme |
| `G` | Toggle locale RU/EN |
| `1` | Spawn 50 prey |
| `2` | Spawn 10 predators |
| `3` | Seed plants |
| `H` | Показать/скрыть overlay подсказок hotkeys |

Не перехватывать клавиши, если `event.target` — `INPUT`, `TEXTAREA`, `SELECT` или `contenteditable`.

---

## 1.7 Accessibility

- Все кнопки и слайдеры: `aria-label` (через i18n).
- Pause/Play: `aria-pressed`.
- Слайдеры: `aria-valuemin/max/now`.
- Passport: заголовок как landmark / `aria-live="polite"` при смене выбранного агента.
- Контраст текста панелей WCAG AA относительно `--bev-bg-panel`.
- Focus ring видимый на интерактивных контролах (`:focus-visible`).

---

## 1.8 Empty / Edge states

| Состояние | UI |
|-----------|-----|
| Нет выбранного агента | Passport: «Кликните агента на карте» / EN эквивалент |
| Популяция вида = 0 | График продолжает линию на 0; avg genes для вида скрыть или «—» |
| Все агенты вымерли | Banner: «Экосистема обрушилась — засейте заново» + кнопки spawn |
| Симуляция на паузе | Индикатор PAUSED в status bar и на кнопке Play |

---

## 1.9 Критерий готовности документа 01

Продуктовые сценарии J1–J6 реализуемы в UI; тема Sci-Fi Dark задана CSS variables; hotkeys и a11y описаны и будут реализованы в 06/07.
