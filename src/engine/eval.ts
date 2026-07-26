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
//  Position Evaluator
// ══════════════════════════

import { PIECES, COLOURS, RANKS, PieceVal, PCEINDEX } from './defs';
import { S, SQ121, MIRROR121 } from './state';
import { LsbExist } from './movegen';

const RookOpenFile = 10;
const RookSemiOpenFile = 5;
const QueenOpenFile = 5;
const QueenSemiOpenFile = 3;
const BishopPair = 30;
const LightSquareBishop = 60;

const PawnIsolated = -10;
const PawnPassed = [0, 5, 10, 20, 35, 60, 100, 200, 300];

/* beautify preserve:start */

const PawnTable = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 0, -10, -10, -10, 0, 10, 5, 0, 0, 15, 0,
    0, 5, 5, 5, 0, 0, 15, 0, 0, 0, 0, 10, 20, 20, 20, 10, 0, 0, 0, 0, 5, 5, 5, 30, 30, 30, 5, 5, 5, 0, 0, 5, 5, 5, 10,
    30, 10, 5, 5, 5, 0, 0, 10, 10, 10, 20, 20, 20, 10, 10, 10, 0, 0, 20, 20, 20, 30, 30, 30, 20, 20, 20, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KnightTable = [
    -15, 0, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, 0, -10, 0, 0, 0, 0, 0, -10, 0, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 10, 35, 20, 35, 10, 5, 0, 0, 0, 5, 10, 15, 20, 20, 20, 15, 10, 5, 0, 0, 5, 10,
    15, 35, 20, 35, 15, 10, 5, 0, 0, 5, 10, 10, 20, 20, 20, 10, 10, 5, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const WizardChampionTable = [
    -10, 0, 0, 0, 0, 0, 0, 0, 0, 0, -10, 0, 0, 10, -10, 0, 0, 0, -10, 10, 0, 0, 0, 15, 0, 0, 10, 10, 10, 0, 0, 15, 0, 0,
    0, 0, 10, 15, 15, 15, 10, 0, 0, 0, 0, 0, 10, 15, 20, 20, 20, 15, 10, 0, 0, 0, 0, 10, 15, 20, 20, 20, 15, 10, 0, 0,
    0, 0, 10, 15, 20, 20, 20, 15, 10, 0, 0, 0, 0, 0, 10, 15, 15, 15, 10, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const BishopTable = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -10, 0, 0, 0, -10, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0,
    10, 15, 15, 15, 10, 0, 0, 0, 0, 0, 10, 15, 20, 20, 20, 15, 10, 0, 0, 0, 0, 10, 15, 20, 20, 20, 15, 10, 0, 0, 0, 0,
    10, 15, 20, 20, 20, 15, 10, 0, 0, 0, 0, 0, 10, 15, 15, 15, 10, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const RookTable = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 10, 10, 10, 5, 5, 0, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5,
    10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5, 10, 10,
    10, 5, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 25, 25, 25, 25, 25, 25, 25, 25, 25, 0, 0, 0, 0, 5, 10, 10,
    10, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const PrincessTable = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -10, 0, 0, 0, -10, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0,
    10, 15, 15, 15, 10, 0, 0, 0, 0, 0, 10, 15, 35, 20, 35, 15, 10, 0, 0, 0, 0, 10, 15, 25, 70, 25, 15, 10, 0, 0, 0, 0,
    10, 15, 35, 20, 35, 15, 10, 0, 0, 0, 0, 0, 10, 15, 15, 15, 10, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const FortressTable = [
    -10, 0, 0, 0, 0, 0, 0, 0, 0, 0, -10, 0, 0, 15, 5, 10, 10, 10, 5, 15, 0, 0, 0, 15, 0, 5, 10, 10, 10, 5, 0, 15, 0, 0,
    0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5,
    10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 5, 0, 0, 0, 0, 25, 25, 25, 25, 25, 25, 25, 25, 25, 0, 0, 0, 0, 5,
    10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KingE = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -50, -10, 0, 0, 0, 0, 0, -10, -50, 0, 0, -10, 0, 10, 10, 10, 10, 10, 0, -10, 0,
    0, 0, 10, 20, 20, 30, 20, 20, 10, 0, 0, 0, 0, 10, 20, 40, 50, 40, 20, 10, 0, 0, 0, 0, 10, 20, 40, 0, 40, 20, 10, 0,
    0, 0, 0, 10, 20, 40, 50, 40, 20, 10, 0, 0, 0, 0, 10, 20, 20, 30, 20, 20, 10, 0, 0, 0, -10, 0, 10, 10, 10, 10, 10, 0,
    -10, 0, 0, -50, -10, 0, 0, 0, 0, 0, -10, -50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KingO = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, -10, -10, -10, 0, 10, 5, 0, 0, -30, -30, -30, -30, -30, -30, -30, -30,
    -30, 0, 0, -50, -50, -50, -50, -50, -50, -50, -50, -50, 0, 0, -70, -70, -70, -70, -70, -70, -70, -70, -70, 0, 0,
    -70, -70, -70, -70, -70, -70, -70, -70, -70, 0, 0, -70, -70, -70, -70, -70, -70, -70, -70, -70, 0, 0, -70, -70, -70,
    -70, -70, -70, -70, -70, -70, 0, 0, -70, -70, -70, -70, -70, -70, -70, -70, -70, 0, 0, -70, -70, -70, -70, -70, -70,
    -70, -70, -70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

/* beautify preserve:end */

export function MaterialDraw(): boolean {
    if (
        0 === S.brd_pceNum[PIECES.wR] &&
        0 === S.brd_pceNum[PIECES.bR] &&
        0 === S.brd_pceNum[PIECES.wS] &&
        0 === S.brd_pceNum[PIECES.bS] &&
        0 === S.brd_pceNum[PIECES.wF] &&
        0 === S.brd_pceNum[PIECES.bF] &&
        0 === S.brd_pceNum[PIECES.wQ] &&
        0 === S.brd_pceNum[PIECES.bQ]
    ) {
        if (0 === S.brd_pceNum[PIECES.bB] && 0 === S.brd_pceNum[PIECES.wB]) {
            if (S.brd_pceNum[PIECES.wN] < 3 && S.brd_pceNum[PIECES.bN] < 3) return true;
        } else if (0 === S.brd_pceNum[PIECES.wN] && 0 === S.brd_pceNum[PIECES.bN]) {
            if (Math.abs(S.brd_pceNum[PIECES.wB] - S.brd_pceNum[PIECES.bB]) < 2) return true;
        } else if (
            (S.brd_pceNum[PIECES.wN] < 3 && 0 === S.brd_pceNum[PIECES.wB]) ||
            (S.brd_pceNum[PIECES.wB] === 1 && 0 === S.brd_pceNum[PIECES.wN])
        ) {
            if (
                (S.brd_pceNum[PIECES.bN] < 3 && 0 === S.brd_pceNum[PIECES.bB]) ||
                (S.brd_pceNum[PIECES.bB] === 1 && 0 === S.brd_pceNum[PIECES.bN])
            )
                return true;
        }
    } else if (0 === S.brd_pceNum[PIECES.wQ] && 0 === S.brd_pceNum[PIECES.bQ]) {
        if (S.brd_pceNum[PIECES.wR] === 1 && S.brd_pceNum[PIECES.bR] === 1) {
            if (
                S.brd_pceNum[PIECES.wN] + S.brd_pceNum[PIECES.wB] < 2 &&
                S.brd_pceNum[PIECES.bN] + S.brd_pceNum[PIECES.bB] < 2
            )
                return true;
        } else if (S.brd_pceNum[PIECES.wR] === 1 && 0 === S.brd_pceNum[PIECES.bR]) {
            if (
                S.brd_pceNum[PIECES.wN] + S.brd_pceNum[PIECES.wB] === 0 &&
                (S.brd_pceNum[PIECES.bN] + S.brd_pceNum[PIECES.bB] === 1 ||
                    S.brd_pceNum[PIECES.bN] + S.brd_pceNum[PIECES.bB] === 2)
            )
                return true;
        } else if (S.brd_pceNum[PIECES.bR] === 1 && 0 === S.brd_pceNum[PIECES.wR]) {
            if (
                S.brd_pceNum[PIECES.bN] + S.brd_pceNum[PIECES.bB] === 0 &&
                (S.brd_pceNum[PIECES.wN] + S.brd_pceNum[PIECES.wB] === 1 ||
                    S.brd_pceNum[PIECES.wN] + S.brd_pceNum[PIECES.wB] === 2)
            )
                return true;
        }
    }
    return false;
}

const ENDGAME_MAT = 1 * PieceVal[PIECES.wR] + 2 * PieceVal[PIECES.wN] + 2 * PieceVal[PIECES.wP] + PieceVal[PIECES.wK];

export function PawnsInit(): void {
    let pce: number;
    let sq: number;

    for (let index = 0; index < 10; ++index) {
        S.PawnRanksWhite[index] = RANKS.RANK_8;
        S.PawnRanksBlack[index] = RANKS.RANK_1;
    }

    pce = PIECES.wP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        if (S.RanksBrd[sq] < S.PawnRanksWhite[S.FilesBrd[sq] + 1]) {
            S.PawnRanksWhite[S.FilesBrd[sq] + 1] = S.RanksBrd[sq];
        }
    }

    pce = PIECES.bP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        if (S.RanksBrd[sq] > S.PawnRanksBlack[S.FilesBrd[sq] + 1]) {
            S.PawnRanksBlack[S.FilesBrd[sq] + 1] = S.RanksBrd[sq];
        }
    }
}

export function EvalPosition(): number {
    let pce: number;
    let sq: number;
    let score: number = S.brd_material[COLOURS.WHITE] - S.brd_material[COLOURS.BLACK];
    let file: number;
    let rank: number;

    PawnsInit();

    // Mobility and attack score, disabled becasue it seems very slow
    // score += EvaluateSqAttacked();

    pce = PIECES.wP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += PawnTable[SQ121(sq)];
        file = S.FilesBrd[sq] + 1;
        rank = S.RanksBrd[sq];
        if (S.PawnRanksWhite[file - 1] === RANKS.RANK_8 && S.PawnRanksWhite[file + 1] === RANKS.RANK_8) {
            score += PawnIsolated;
        }

        if (
            S.PawnRanksBlack[file - 1] <= rank &&
            S.PawnRanksBlack[file] <= rank &&
            S.PawnRanksBlack[file + 1] <= rank
        ) {
            score += PawnPassed[rank];
        }
    }

    pce = PIECES.bP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= PawnTable[MIRROR121(SQ121(sq))];
        file = S.FilesBrd[sq] + 1;
        rank = S.RanksBrd[sq];
        if (S.PawnRanksBlack[file - 1] === RANKS.RANK_1 && S.PawnRanksBlack[file + 1] === RANKS.RANK_1) {
            score -= PawnIsolated;
        }

        if (
            S.PawnRanksWhite[file - 1] >= rank &&
            S.PawnRanksWhite[file] >= rank &&
            S.PawnRanksWhite[file + 1] >= rank
        ) {
            score -= PawnPassed[7 - rank];
        }
    }

    pce = PIECES.wN;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += KnightTable[SQ121(sq)];
    }

    pce = PIECES.bN;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= KnightTable[MIRROR121(SQ121(sq))];
    }

    if (S.variant === 'Oriental') {
        pce = PIECES.wW;
        for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];
            score += WizardChampionTable[SQ121(sq)];
        }

        pce = PIECES.bW;
        for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];
            score -= WizardChampionTable[MIRROR121(SQ121(sq))];
        }

        pce = PIECES.wC;
        for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];
            score += WizardChampionTable[SQ121(sq)];
        }

        pce = PIECES.bC;
        for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];
            score -= WizardChampionTable[MIRROR121(SQ121(sq))];
        }
    }
    pce = PIECES.wB;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += BishopTable[SQ121(sq)];
    }

    pce = PIECES.bB;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= BishopTable[MIRROR121(SQ121(sq))];
    }

    pce = PIECES.wR;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += RookTable[SQ121(sq)];
        file = S.FilesBrd[sq] + 1;
        if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
            if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
                score += RookOpenFile;
            } else {
                score += RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.bR;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= RookTable[MIRROR121(SQ121(sq))];
        file = S.FilesBrd[sq] + 1;
        if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
            if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
                score -= RookOpenFile;
            } else {
                score -= RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.wS;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += PrincessTable[SQ121(sq)];
    }

    pce = PIECES.bS;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= PrincessTable[MIRROR121(SQ121(sq))];
    }

    pce = PIECES.wF;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += FortressTable[SQ121(sq)];
        file = S.FilesBrd[sq] + 1;
        if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
            if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
                score += RookOpenFile;
            } else {
                score += RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.bF;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= FortressTable[MIRROR121(SQ121(sq))];
        file = S.FilesBrd[sq] + 1;
        if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
            if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
                score -= RookOpenFile;
            } else {
                score -= RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.wQ;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += RookTable[SQ121(sq)];
        file = S.FilesBrd[sq] + 1;
        if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
            if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
                score += QueenOpenFile;
            } else {
                score += QueenSemiOpenFile;
            }
        }
    }

    pce = PIECES.bQ;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= RookTable[MIRROR121(SQ121(sq))];
        file = S.FilesBrd[sq] + 1;
        if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
            if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
                score -= QueenOpenFile;
            } else {
                score -= QueenSemiOpenFile;
            }
        }
    }

    pce = PIECES.wK;
    sq = S.brd_pList[PCEINDEX(pce, 0)];

    if (S.brd_material[COLOURS.BLACK] <= ENDGAME_MAT) {
        score += KingE[SQ121(sq)];
    } else {
        score += KingO[SQ121(sq)];
    }

    pce = PIECES.bK;
    sq = S.brd_pList[PCEINDEX(pce, 0)];

    if (S.brd_material[COLOURS.WHITE] <= ENDGAME_MAT) {
        score -= KingE[MIRROR121(SQ121(sq))];
    } else {
        score -= KingO[MIRROR121(SQ121(sq))];
    }

    if (S.brd_pceNum[PIECES.wB] >= 2) score += BishopPair;
    if (S.brd_pceNum[PIECES.bB] >= 2) score -= BishopPair;

    if (LsbExist(COLOURS.WHITE)) score += LightSquareBishop;
    if (LsbExist(COLOURS.BLACK)) score -= LightSquareBishop;

    if (S.brd_side === COLOURS.WHITE) {
        return score;
    } else {
        return -score;
    }
}
