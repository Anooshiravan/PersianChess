#!/usr/bin/env node
// Movegen benchmark. Two measurements:
//   1) GenerateMoves() in a tight loop from a mid-game position (movegen only)
//   2) Persian perft depth 4 from start (movegen + make/take together)
import { setVariantDefs } from '../src/engine/variants.ts';
import { init_engine } from '../src/engine/init.ts';
import { S } from '../src/engine/state.ts';
import { ParseFen } from '../src/engine/board.ts';
import { GenerateMoves } from '../src/engine/movegen.ts';
import { Perft } from '../src/engine/perft.ts';

setVariantDefs('Persian');
init_engine();

// Rich mid-game-ish position (lots of pieces on the board).
const RICH =
    'f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111p11111/11111P11111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';

function bench(name, fn, iters) {
    // warmup
    for (let i = 0; i < 5000; i++) fn();
    const t = process.hrtime.bigint();
    for (let i = 0; i < iters; i++) fn();
    const ns = Number(process.hrtime.bigint() - t);
    const perOp = ns / iters;
    console.log(
        `${name.padEnd(28)} ${iters.toString().padStart(9)} ops   ${(ns / 1e6).toFixed(1).padStart(8)} ms   ${perOp.toFixed(0).padStart(6)} ns/op`,
    );
}

ParseFen(RICH);
S.brd_ply = 0;
S.brd_moveListStart[0] = 0;
bench('movegen (rich position)', GenerateMoves, 200_000);

ParseFen(S.START_FEN);
S.brd_ply = 0;
S.brd_moveListStart[0] = 0;
bench('movegen (start position)', GenerateMoves, 200_000);

ParseFen(S.START_FEN);
const t = process.hrtime.bigint();
S.perft_leafNodes = 0;
Perft(4);
const ms = Number(process.hrtime.bigint() - t) / 1e6;
const nps = (S.perft_leafNodes / (ms / 1000)) | 0;
console.log(
    `perft(4) from start         ${S.perft_leafNodes.toString().padStart(9)} nodes ${ms.toFixed(1).padStart(8)} ms   ${nps.toLocaleString().padStart(9)} nps`,
);
