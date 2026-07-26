/*
   _____              _                _____ _
  |  __ \            (_)              / ____| |
  | |__) |__ _ __ ___ _  __ _ _ __   | |    | |__   ___  ___ ___
  |  ___/ _ \ '__/ __| |/ _` | '_ \  | |    | '_ \ / _ \/ __/ __|
  | |  |  __/ |  \__ \ | (_| | | | | | |____| | | |  __/\__ \__ \
  |_|   \___|_|  |___/_|\__,_|_| |_|  \_____|_| |_|\___||___/___/

════════════════════════════════════════════════════════════════════
 Persian Chess (www.PersianChess.com)
 Copyright 2006 - 2015
 Anooshiravan Ahmadi (aahmadi@schubergphilis.com)
 http://www.PersianChess.com/About
 Licensed under GNU General Public License 3.0
 ════════════════════════════════════════════════════════════════════
*/

// ══════════════════════════
//  Performance tests
// ══════════════════════════

import { COLOURS } from './defs';
import { S, debuglog } from './state';
import { GenerateMoves } from './movegen';
import { MakeMove, TakeMove } from './movehandler';
import { PrintBoard, GeneratePosKey, printGameLine } from './board';
import { SqAttacked } from './board';
import { PrMove } from './input';

function MakeNullMove(): void {}
function TakeNullMove(): void {}

export function Perft(depth: number): void {
    MakeNullMove();
    if (S.brd_posKey !== GeneratePosKey()) {
        debuglog(printGameLine());
        if (S.debug) PrintBoard();
        S.srch_stop = true;
        debuglog('Hash Error After Make');
    }

    TakeNullMove();
    if (S.brd_posKey !== GeneratePosKey()) {
        debuglog(printGameLine());
        if (S.debug) PrintBoard();
        S.srch_stop = true;
        debuglog('Hash Error After Take');
    }

    if (depth === 0) {
        S.perft_leafNodes++;
        return;
    }

    GenerateMoves();

    for (let index = S.brd_moveListStart[S.brd_ply]; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
        const move = S.brd_moveList[index];
        if (!MakeMove(move)) continue;
        Perft(depth - 1);
        TakeMove();
    }
}

export function PerftTest(depth: number): void {
    if (S.debug) PrintBoard();
    debuglog(`Starting Test To Depth:${depth}`);
    S.perft_leafNodes = 0;
    GenerateMoves();
    let moveNum: number = 0;
    for (let index = S.brd_moveListStart[S.brd_ply]; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
        const move = S.brd_moveList[index];
        if (!MakeMove(move)) continue;
        moveNum++;
        const cumnodes = S.perft_leafNodes;
        Perft(depth - 1);
        TakeMove();
        const oldnodes = S.perft_leafNodes - cumnodes;
        debuglog(`move:${moveNum} ${PrMove(move)} ${oldnodes}`);
    }
}

export function PerformanceTest(): void {
    /*
    t1 = performance.now();
    for (run = 0; run < 100000; ++run) {
        EvaluateSqAttacked();
    }
    t2 = performance.now();
    ms = t2-t1;
    debuglog("Evaluate SqAttacked is run 100.000 times in: " + ms + " miliseconds.")
    */
    let t1 = performance.now();
    for (let run = 0; run < 100000; ++run) {
        GenerateMoves();
    }
    let t2 = performance.now();
    let ms = t2 - t1;
    debuglog(`MoveGen is run 100.000 times in: ${ms} miliseconds.`);
    /*
        t1 = performance.now();
        for (run = 0; run < 100000; ++run) {
            AlphaBeta(-INFINITE, INFINITE, 1, BOOL.TRUE);
        }
        t2 = performance.now();
        ms = t2-t1;
        debuglog("AlphaBeta is run 100.000 times in: " + ms + " miliseconds.")
        t1 = performance.now();
        for (run = 0; run < 100000; ++run) {
            EvalPosition()
        }
        t2 = performance.now();
        ms = t2-t1;
        debuglog("Evaluation is run 100.000 times in: " + ms + " miliseconds.")

        t1 = performance.now();
        for (run = 0; run < 100000; ++run) {
            Mobility();
        }
        t2 = performance.now();
        ms = t2-t1;
        debuglog("Mobility is run 100.000 times in: " + ms + " miliseconds.")
        debuglog (Mobility());
        */

    t1 = performance.now();
    for (let run = 0; run < 100000; ++run) {
        SqAttacked(97, COLOURS.WHITE);
    }
    t2 = performance.now();
    ms = t2 - t1;
    debuglog(`SqAttacked is run 100.000 times in: ${ms} miliseconds.`);
}
