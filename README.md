# Spec Quest · 選型大挑戰

A browser game about industrial-PC specs: ten industry scenarios, pick the board, fill the I/O, choose six spec grades. Buying more is waste, buying less becomes field losses later. Just enough scores 100.

工業電腦選型小遊戲：十個產業情境，選板型、補介面、挑六項規格。買多是浪費，買少是之後的現場損失，剛好才拿滿分。

## Play

Open `index.html` in any modern browser. No install, no build step, no server.
Progress is saved in the browser (localStorage).

## Publish on GitHub Pages

1. Create a repository and upload `index.html` plus the three `bgm-*` audio files next to it (background music needs them).
2. Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
3. The game is live at `https://<your-account>.github.io/<repo>/`.

## Notes

- Terms follow PICMG, TIA, ISO, IEC and JEDEC. Prices and losses are simplified game values, not real quotes. Board cards reference real Avalue Technology models (e.g. EPX-TWLP) for realism; port/slot counts are still the game's own simplified values, not a 1:1 copy of any datasheet.
- Every level has exactly one best answer, verified by an exhaustive solver (`test_engine.mjs`).
- Source files: `engine.js` (rules, solver, scoring), `index.src.html` (UI), `build.mjs` (bundles into `index.html`).

## Music credits

- `bgm-practice.ogg` — "Exploration Theme" by Cleyton Kauffman ([soundcloud.com/cleytonkauffman](https://soundcloud.com/cleytonkauffman)), [CC0](https://opengameart.org/content/exploration-theme). Attribution not required.
- `bgm-formal.ogg` / `bgm-formal.mp3` — "Tense Future Loop" by gmason, [CC0](https://opengameart.org/content/tense-future-loop). Attribution not required.
