# Persian Chess

Chess variant. See [persianchess.com](https://persianchess.com/).

## Project

- TypeScript (strict), bundled with **esbuild** into three IIFE modules.
- The engine runs in a **Web Worker**; the UI runs on the main thread. They exchange framed string messages of the form `title::body`.
- Unit tests with **vitest** (perft + move-generator coverage).
- **Biome** for lint + format.
- No runtime dependencies. `puppeteer` is a dev-only dep for the probe scripts.

## Development

```sh
npm install
npm run dev       # typecheck + lint + bundle + serve at localhost:8000
npm run build     # typecheck + lint + bundle (no server)
npm test          # vitest run
npm run probe -- "<FEN>" [variant]   # ad-hoc engine probe
```

`npm run dev` runs the local server at `server/server.ts` which serves the repo root. Marketing pages live at `/`, the game at `/app/`.

## Layout

```
/                 marketing pages (index.html, rules.html, assets/, CNAME)
app/              the playable game — compiled JS + HTML/img/audio/css
src/
  app.ts          UI controller: worker messaging, audio, storage, DOM bindings
  board.ts        board rendering + input + move highlights + hint arrow
  engine/         move gen, search, eval, book, movegen, worker entry
tests/            perft + movegen tests + ground-truth JSON
server/server.ts  local dev server (dir-index resolution, no framework)
scripts/          probe/bench utilities
```

## Engine notes

- Four variants: Persian, Citadel, Pyramid, Oriental.
- Search: iterative deepening α–β + PV table, opening book.
- Time-controlled search; time configurable from the Settings tab.

## License

Copyright 2014 Anooshiravan Ahmadi. Released under the GPL. See `index.html` header for the full notice.
