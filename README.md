## Live demo

https://hafizovs.github.io/bio-evolve/

# BioEvolve

Симулятор экосистемы и направленной эволюции (жертвы / хищники / растения) на Angular 22+ с Canvas 2D, генетикой, FSM и параллельной моделью Lotka–Volterra.

## Установка и запуск

```bash
npm install
npm start
```

Откройте URL из вывода CLI (обычно `http://localhost:4200`).

## Тесты

```bash
npm test
# или
npm run test:unit
```

## Сборка

```bash
npm run build
```

## Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| Space | Пауза / Старт |
| Esc | Снять фокус / закрыть справку |
| R | Сброс мира |
| S | Снимок sim-canvas (PNG) |
| T | Тема dark/light |
| G | Язык RU/EN |
| 1 | +50 зайцев |
| 2 | +10 волков |
| 3 | Засеять травой |
| H | Справка по клавишам |

## Стек

- Angular 22 (standalone, signals, zoneless)
- HTML5 Canvas 2D (мир + графики)
- SCSS + CSS variables (Sci-Fi Dark)
- Vitest unit tests
