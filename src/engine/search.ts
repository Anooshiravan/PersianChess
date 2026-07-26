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
//  Search
// ══════════════════════════

import {
    BRD_PCE_NUM,
    BRD_SQ_NUM,
    MAXDEPTH,
    PVENTRIES,
    COLOURS,
    SQUARES,
    Kings,
    PCEINDEX,
    FROMSQ,
    TOSQ,
    MFLAGCAP,
    NOMOVE,
    INFINITE,
    MATE,
} from './defs';
import { S, HASH_EP, HASH_SIDE, debuglog } from './state';
import { ParseFen, BoardToFen, ResetBoard, SqAttacked } from './board';
import { MakeMove, TakeMove } from './movehandler';
import { GenerateMoves, GenerateCaptures, ResetMoveCounters, ReadMoveCounters } from './movegen';
import { EvalPosition } from './eval';
import { ProbePvTable, StorePvMove, GetPvLine } from './pvtable';
import { InitMvvLva } from './movegen';
import { PrMove, PrMoveWithPieces } from './input';
import { BookMove, SanityCheck } from './book';
import { SendMessageToGui, SendBestMove } from './protocol';
import { init_engine } from './init';

export { InitMvvLva };

let Qcalled: number = 0;
let ABcalled: number = 0;

export function CheckUp(): void {
    if (Date.now() - S.srch_start > S.srch_time && Treshhold > 1) S.srch_stop = true;
}

export function PickNextMove(moveNum: number): void {
    let bestScore: number = 0;
    let bestNum: number = moveNum;
    let temp: number;

    for (let index = moveNum; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
        if (S.brd_moveScores[index] > bestScore) {
            bestScore = S.brd_moveScores[index];
            bestNum = index;
        }
    }

    temp = S.brd_moveList[moveNum];
    S.brd_moveList[moveNum] = S.brd_moveList[bestNum];
    S.brd_moveList[bestNum] = temp;

    temp = S.brd_moveScores[moveNum];
    S.brd_moveScores[moveNum] = S.brd_moveScores[bestNum];
    S.brd_moveScores[bestNum] = temp;
}

export function IsRepetition(): boolean {
    for (let index = S.brd_hisPly - S.brd_fiftyMove; index < S.brd_hisPly - 1; ++index) {
        if (S.brd_posKey === S.brd_history[index].posKey) return true;
    }
    return false;
}

export function ClearPvTable(): void {
    for (let index = 0; index < PVENTRIES; index++) {
        S.brd_PvTable[index].move = NOMOVE;
        S.brd_PvTable[index].posKey = 0;
    }
}

export function ClearForSearch(): void {
    for (let index = 0; index < BRD_PCE_NUM * BRD_SQ_NUM; ++index) {
        S.brd_searchHistory[index] = 0;
    }

    for (let index = 0; index < 3 * MAXDEPTH; ++index) {
        S.brd_searchKillers[index] = 0;
    }

    ClearPvTable();

    S.brd_ply = 0;

    S.srch_nodes = 0;
    S.srch_fh = 0;
    S.srch_fhf = 0;
    S.srch_start = Date.now();
    S.srch_stop = false;
    S.srch_best = NOMOVE;

    ResetMoveCounters();
    Qcalled = 0;
    ABcalled = 0;
}

export function Quiescence(alpha: number, beta: number): number {
    Qcalled++;

    if ((S.srch_nodes & 8192) === 0) CheckUp();

    S.srch_nodes++;

    if (IsRepetition() || S.brd_fiftyMove >= 100) return 0;

    if (S.brd_ply > MAXDEPTH - 1) return EvalPosition();

    let Score = EvalPosition();

    if (Score >= beta) return beta;

    if (Score > alpha) alpha = Score;

    GenerateCaptures();

    let MoveNum: number = 0;
    let Legal: number = 0;
    const OldAlpha = alpha;
    let BestMove = NOMOVE;
    Score = -INFINITE;
    const PvMove = ProbePvTable();

    if (PvMove !== NOMOVE) {
        for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
            if (S.brd_moveList[MoveNum] === PvMove) {
                (Object(S.brd_moveScores[MoveNum]) as { score?: number }).score = 2000000;
                break;
            }
        }
    }

    for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
        PickNextMove(MoveNum);

        if (!MakeMove(S.brd_moveList[MoveNum])) continue;

        Legal++;
        Score = -Quiescence(-beta, -alpha);
        TakeMove();
        if (S.srch_stop) return 0;
        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal === 1) S.srch_fhf++;
                S.srch_fh++;
                return beta;
            }
            alpha = Score;
            BestMove = S.brd_moveList[MoveNum];
        }
    }

    if (alpha !== OldAlpha) StorePvMove(BestMove);

    return alpha;
}

export function AlphaBeta(alpha: number, beta: number, depth: number, DoNull: boolean): number {
    ABcalled++;

    if (depth <= 0) return Quiescence(alpha, beta);

    if ((S.srch_nodes & 8192) === 0) CheckUp();

    S.srch_nodes++;

    if ((IsRepetition() || S.brd_fiftyMove >= 100) && S.brd_ply !== 0) return 0;

    if (S.brd_ply > MAXDEPTH - 1) return EvalPosition();

    const InCheck = SqAttacked(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)], S.brd_side ^ 1);

    if (InCheck) depth++;

    let Score = -INFINITE;

    if (DoNull && !InCheck && S.brd_ply !== 0 && S.brd_material[S.brd_side] > 50200 && depth >= 4) {
        const ePStore = S.brd_enPas;
        if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
        S.brd_side ^= 1;
        HASH_SIDE();
        S.brd_enPas = SQUARES.NO_SQ;

        Score = -AlphaBeta(-beta, -beta + 1, depth - 4, false);

        S.brd_side ^= 1;
        HASH_SIDE();
        S.brd_enPas = ePStore;
        if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();

        if (S.srch_stop) return 0;
        if (Score >= beta) return beta;
    }

    GenerateMoves();

    let MoveNum: number = 0;
    let Legal: number = 0;
    const OldAlpha = alpha;
    let BestMove = NOMOVE;
    Score = -INFINITE;
    const PvMove = ProbePvTable();

    if (PvMove !== NOMOVE) {
        for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
            if (S.brd_moveList[MoveNum] === PvMove) {
                (Object(S.brd_moveScores[MoveNum]) as { score?: number }).score = 2000000;
                break;
            }
        }
    }

    for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
        PickNextMove(MoveNum);

        if (!MakeMove(S.brd_moveList[MoveNum])) continue;

        Legal++;
        Score = -AlphaBeta(-beta, -alpha, depth - 1, true);
        TakeMove();
        if (S.srch_stop) return 0;

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal === 1) S.srch_fhf++;
                S.srch_fh++;

                if ((S.brd_moveList[MoveNum] & MFLAGCAP) === 0) {
                    S.brd_searchKillers[MAXDEPTH + S.brd_ply] = S.brd_searchKillers[S.brd_ply];
                    S.brd_searchKillers[S.brd_ply] = S.brd_moveList[MoveNum];
                }
                return beta;
            }
            alpha = Score;
            BestMove = S.brd_moveList[MoveNum];
            if ((BestMove & MFLAGCAP) === 0) {
                S.brd_searchHistory[S.brd_pieces[FROMSQ(BestMove)] * BRD_SQ_NUM + TOSQ(BestMove)] += depth;
            }
        }
    }

    if (Legal === 0) {
        if (InCheck) return -MATE + S.brd_ply;
        return 0;
    }

    if (alpha !== OldAlpha) StorePvMove(BestMove);

    return alpha;
}

let hint: any = NOMOVE;

export function SearchPosition(): void {
    let bestMove: any = NOMOVE;
    ClearForSearch();

    // Book move
    bestMove = BookMove(false);
    if (bestMove !== NOMOVE) {
        S.srch_best = bestMove;
        S.srch_thinking = false;
        const console_msg = `Book move: ${PrMove(bestMove)}`;
        SendMessageToGui('console', console_msg);
        SendBestMove(bestMove);
        hint = BookMove(true);
        if (hint !== NOMOVE && hint !== '') {
            SendMessageToGui('info', `hint|${hint}`);
        } else {
            SendMessageToGui('info', 'hint|End of opening line.');
        }
        return;
    }

    // Start search
    let srch_start_msg: string;
    if (S.srch_time !== 2147483647) srch_start_msg = `Engine time: ${Number(S.srch_time) / 1000} seconds`;
    else srch_start_msg = `Engine depth: ${S.srch_depth}`;
    debuglog(srch_start_msg);
    SendMessageToGui('console', ' ');
    SendMessageToGui('console', srch_start_msg);

    // Iterative deepening in max-depth
    bestMove = IterativeDeepening(S.srch_depth);

    // Fail safe level one, search in depth 3
    if (bestMove === NOMOVE || bestMove === undefined || !SanityCheck(bestMove)) {
        if (!S.GameController.GameOver) {
            SendMessageToGui('console', '> Fail safe L1, Depth 3');
            FailSafeResetBoard('L1');
            bestMove = IterativeDeepening(3);
        }
    }

    // Fail safe level two, reset everything and search in depth 1 (just a good legal move)
    if (bestMove === NOMOVE || bestMove === undefined || !SanityCheck(bestMove)) {
        if (!S.GameController.GameOver) {
            SendMessageToGui('console', '> Fail safe L2: Depth 1');
            FailSafeResetBoard('L2');
            bestMove = IterativeDeepening(1);
        }
    }

    if (bestMove === NOMOVE || bestMove === undefined || !SanityCheck(bestMove)) {
        if (!S.GameController.GameOver) {
            SendMessageToGui('init', 'engine_error');
            return;
        }
    } else {
        S.srch_best = bestMove;
        SendBestMove(bestMove);
        SendMessageToGui('info', `hint|${hint}`);
    }
    S.srch_thinking = false;
    ShowPerformance();
}

export function FailSafeResetBoard(level: string): void {
    const fen = BoardToFen();
    const brd_hisPly_bak = S.brd_hisPly;
    const brd_history_bak = S.brd_history;
    const brd_history_notes_bak = S.brd_history_notes;

    init_engine();
    ResetBoard();
    ClearForSearch();

    switch (level) {
        case 'L1':
            ParseFen(fen);
            S.brd_hisPly = brd_hisPly_bak;
            S.brd_history = brd_history_bak;
            S.brd_history_notes = brd_history_notes_bak;
            break;

        case 'L2':
            ParseFen(fen);
            break;

        default:
            break;
    }
}

let Treshhold: number = 0;

export function IterativeDeepening(id_depth: number): number {
    let bestMove = NOMOVE;
    let bestScore = -INFINITE;
    let _pvNum: number = 0;
    let line: string;

    for (let currentDepth = 1; currentDepth <= id_depth; ++currentDepth) {
        Treshhold = currentDepth;

        bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, true);

        if (S.srch_stop) break;
        _pvNum = GetPvLine(currentDepth);

        bestMove = S.brd_PvArray[0];
        line = `Depth:${currentDepth}: ${PrMoveWithPieces(bestMove)} Score:${bestScore} Nodes:${S.srch_nodes}`;

        if (currentDepth !== 1) {
            line += ` Ordering:${((S.srch_fhf / S.srch_fh) * 100).toFixed(2)}%`;
        }

        let currentScore: number = 0;
        if (S.brd_side === COLOURS.WHITE) currentScore = bestScore;
        else currentScore = -bestScore;

        let pvline = `${currentDepth}[${currentScore}]`;
        for (let i = 0; i < currentDepth; i++) {
            if (S.brd_PvArray[i] !== undefined) pvline += ` ${PrMove(S.brd_PvArray[i])}`;
        }
        if (currentDepth !== 1) {
            pvline += ` <${Math.round((S.srch_fhf / S.srch_fh) * 100)}%>`;
        }
        hint = PrMove(S.brd_PvArray[1]);
        debuglog(line);
        SendMessageToGui('console', pvline);
    }
    return bestMove;
}

export function ShowPerformance(): void {
    const counters = ReadMoveCounters();
    debuglog('-------- Performance Counters ----------');
    debuglog(`AlphaBeta: ${ABcalled}`);
    debuglog(`Quiescence: ${Qcalled}`);
    debuglog(`MoveGen: ${counters.GenerateMovesNum}`);
    debuglog(`CapGen: ${counters.GenerateCapturesNum}`);
    debuglog(`Node: ${S.srch_nodes}`);
    debuglog(`MOVE: ${counters.gen_m}`);
}
