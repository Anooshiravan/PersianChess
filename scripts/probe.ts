#!/usr/bin/env -S npx tsx
// Ad-hoc probe of a position against the ported TS engine.
// Usage:
//   npx tsx scripts/probe.ts "<FEN>" [variant]
//   npx tsx scripts/probe.ts start [variant]        (loads S.START_FEN)
//
// Prints:
//   - the ASCII board (PrintBoard),
//   - side to move,
//   - whether the side-to-move's king is in check,
//   - all legal moves (pseudo-legal filtered through MakeMove),
//   - whether GameOver() reports mate/stalemate/draw and which gameover
//     message the engine would send to the GUI.

import { setVariantDefs } from '../src/engine/variants';
import { init_engine } from '../src/engine/init';
import { S } from '../src/engine/state';
import { ParseFen, PrintBoard, SqAttacked } from '../src/engine/board';
import { GenerateMoves } from '../src/engine/movegen';
import { MakeMove, TakeMove } from '../src/engine/movehandler';
import { GameOver } from '../src/engine/engine';
import { COLOURS, BOOL, Kings, PCEINDEX, FROMSQ, TOSQ } from '../src/engine/defs';
import { PrSq } from '../src/engine/input';

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: npx tsx scripts/probe.ts "<FEN>" [variant]');
    console.error('       npx tsx scripts/probe.ts start [variant]');
    process.exit(1);
}
const variant = args[1] ?? 'Persian';
setVariantDefs(variant);
init_engine();

const fen = args[0] === 'start' ? S.START_FEN : args[0];
const ok = ParseFen(fen);
if (!ok) {
    console.error('ParseFen failed for:', fen);
    process.exit(2);
}

// Capture GUI messages the engine would emit.
const guiMessages: string[] = [];
(globalThis as any).postMessage = (msg: string) => guiMessages.push(msg);
S.debug_log = true; // route debuglog through postMessage so PrintBoard shows up

console.log('=== Position ===');
console.log('Variant:', variant);
console.log('FEN:    ', fen);
PrintBoard();
console.log(
    guiMessages
        .filter((m) => m.startsWith('debug::'))
        .map((m) => m.slice(7))
        .join('\n'),
);
guiMessages.length = 0;
S.debug_log = false;

console.log('Side to move:', S.brd_side === COLOURS.WHITE ? 'white' : 'black');

const kSq = S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)];
const inCheck = SqAttacked(kSq, S.brd_side ^ 1) === BOOL.TRUE;
console.log(`Own king (${PrSq(kSq)}) in check?`, inCheck);

// Legal moves
GenerateMoves();
const start = S.brd_moveListStart[S.brd_ply];
const end = S.brd_moveListStart[S.brd_ply + 1];
const pseudoCount = end - start;
const legal: string[] = [];
for (let i = start; i < end; i++) {
    const m = S.brd_moveList[i];
    if (MakeMove(m) === BOOL.TRUE) {
        legal.push(`${PrSq(FROMSQ(m))}-${PrSq(TOSQ(m))}`);
        TakeMove();
    }
}
console.log('\n=== Moves ===');
console.log('Pseudo-legal:', pseudoCount);
console.log('Legal:       ', legal.length);
if (legal.length > 0) {
    console.log(`  ${legal.join(', ')}`);
}

// GameOver — captures the gameover message the engine would send.
console.log('\n=== GameOver check ===');
const isOver = GameOver() === BOOL.TRUE;
console.log('GameOver() returned:', isOver);
const goMsg = guiMessages.find((m) => m.startsWith('gameover::'));
console.log('Message that would be sent:', goMsg ?? '(none)');
