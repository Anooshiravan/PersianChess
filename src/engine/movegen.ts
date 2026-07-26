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
//  Move Generator
// ══════════════════════════

import {
    BRD_PCE_NUM,
    BRD_SQ_NUM,
    MAXDEPTH,
    PIECES,
    COLOURS,
    SQUARES,
    RANKS,
    CASTLEBIT,
    PieceCol,
    LoopSlidePce,
    LoopNonSlidePce,
    LoopSlideIndex,
    LoopNonSlideIndex,
    DirNumSlide,
    DirNumNonSlide,
    PceDirSlide,
    PceDirNonSlide,
    MFLAGEP,
    MFLAGPS,
    MFLAGCA,
    MFLAGRZ,
    FROMSQ,
    TOSQ,
    CAPTURED,
    PCEINDEX,
    NOMOVE,
} from './defs';
import { S, SQCENTER, SQOFFBOARD } from './state';
import { SqAttacked } from './board';
import { MakeMove, TakeMove } from './movehandler';

export let GenerateCapturesNum: number = 0;
export let GenerateMovesNum: number = 0;
export let WhiteMobility: number = 0;
export let BlackMobility: number = 0;

const VictimScore = [
    0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
];
const MvvLvaScores = new Array<number>(22 * 22);

export function InitMvvLva(): void {
    for (let Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
        for (let Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
            MvvLvaScores[Victim * 22 + Attacker] = VictimScore[Victim] + 6 - VictimScore[Attacker] / 100;
        }
    }
}

let gen_m: number = 0;

export function ResetMoveCounters(): void {
    GenerateCapturesNum = 0;
    GenerateMovesNum = 0;
    gen_m = 0;
}

export function ReadMoveCounters() {
    return { GenerateCapturesNum, GenerateMovesNum, gen_m };
}

export function MOVE(from: number, to: number, captured: number, promoted: number, flag: number): number {
    gen_m++;
    return from | (to << 8) | (captured << 16) | (promoted << 23) | flag;
}

// Check if side has light square bishop
export function LsbExist(side: number): boolean {
    if (side === COLOURS.WHITE) {
        const pceType = PIECES.wB;
        for (let pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
            const sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
            if (S.brd_pieces[sq] === PIECES.wB && isEven(sq)) return true;
        }
    }
    if (side === COLOURS.BLACK) {
        const pceType = PIECES.bB;
        for (let pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
            const sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
            if (S.brd_pieces[sq] === PIECES.bB && isEven(sq)) return true;
        }
    }
    return false;
}

export function isEven(n: number): boolean {
    return n % 2 === 0;
}

export function MoveExists(move: number): boolean {
    if (move === NOMOVE) return false;

    GenerateMoves();

    for (let index = S.brd_moveListStart[S.brd_ply]; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
        const moveFound = S.brd_moveList[index];
        if (!MakeMove(moveFound)) continue;
        TakeMove();
        if (move === moveFound) return true;
    }
    return false;
}

export function AddCaptureMove(move: number): void {
    S.brd_moveList[S.brd_moveListStart[S.brd_ply + 1]] = move;
    S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]++] =
        MvvLvaScores[CAPTURED(move) * BRD_PCE_NUM + S.brd_pieces[FROMSQ(move)]] + 1000000;
}

export function AddQuietMove(move: number): void {
    S.brd_moveList[S.brd_moveListStart[S.brd_ply + 1]] = move;

    if (S.brd_searchKillers[S.brd_ply] === move) {
        S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]] = 900000;
    } else if (S.brd_searchKillers[MAXDEPTH + S.brd_ply] === move) {
        S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]] = 800000;
    } else {
        S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]] =
            S.brd_searchHistory[S.brd_pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
    }
    S.brd_moveListStart[S.brd_ply + 1]++;
}

export function AddEnPassantMove(move: number): void {
    S.brd_moveList[S.brd_moveListStart[S.brd_ply + 1]] = move;
    S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]++] = 105 + 1000000;
}

export function AddWhitePawnCaptureMove(from: number, to: number, cap: number): void {
    if (S.RanksBrd[from] === RANKS.RANK_9) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

export function AddWhitePawnQuietMove(from: number, to: number): void {
    if (S.RanksBrd[from] === RANKS.RANK_9) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
    } else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

export function AddBlackPawnCaptureMove(from: number, to: number, cap: number): void {
    if (S.RanksBrd[from] === RANKS.RANK_3) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

export function AddBlackPawnQuietMove(from: number, to: number): void {
    if (S.RanksBrd[from] === RANKS.RANK_3) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
    } else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

export function GenerateMoves(): void {
    S.brd_moveListStart[S.brd_ply + 1] = S.brd_moveListStart[S.brd_ply];
    let pceType: number;
    let pceNum: number;
    let pceIndex: number;
    let pce: number;
    let sq: number;
    let index: number;
    let dir: number;
    let t_sq: number;
    if (S.brd_side === COLOURS.WHITE) {
        pceType = PIECES.wP;
        for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
            if (S.brd_pieces[sq + 13] === PIECES.EMPTY && !SQCENTER(sq + 13, PIECES.wP)) {
                AddWhitePawnQuietMove(sq, sq + 13);
                if (S.RanksBrd[sq] === RANKS.RANK_3 && S.brd_pieces[sq + 26] === PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, sq + 26, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            if (
                !SQOFFBOARD(sq + 12) &&
                !SQCENTER(sq + 12, PIECES.wP) &&
                PieceCol[S.brd_pieces[sq + 12]] === COLOURS.BLACK
            ) {
                AddWhitePawnCaptureMove(sq, sq + 12, S.brd_pieces[sq + 12]);
            }
            if (
                !SQOFFBOARD(sq + 14) &&
                !SQCENTER(sq + 14, PIECES.wP) &&
                PieceCol[S.brd_pieces[sq + 14]] === COLOURS.BLACK
            ) {
                AddWhitePawnCaptureMove(sq, sq + 14, S.brd_pieces[sq + 14]);
            }

            if (S.brd_enPas !== SQUARES.NO_SQ) {
                if (sq + 12 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq + 14 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (S.brd_castlePerm & CASTLEBIT.WKCA) {
            if (
                S.brd_pieces[SQUARES.G2] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.H2] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.I2] === PIECES.EMPTY
            ) {
                if (
                    !SqAttacked(SQUARES.F2, COLOURS.BLACK) &&
                    !SqAttacked(SQUARES.G2, COLOURS.BLACK) &&
                    !SqAttacked(SQUARES.H2, COLOURS.BLACK) &&
                    !SqAttacked(SQUARES.I2, COLOURS.BLACK)
                ) {
                    AddQuietMove(MOVE(SQUARES.F2, SQUARES.I2, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (S.brd_castlePerm & CASTLEBIT.WQCA) {
            if (
                S.brd_pieces[SQUARES.E2] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.D2] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.C2] === PIECES.EMPTY
            ) {
                if (
                    !SqAttacked(SQUARES.F2, COLOURS.BLACK) &&
                    !SqAttacked(SQUARES.E2, COLOURS.BLACK) &&
                    !SqAttacked(SQUARES.D2, COLOURS.BLACK)
                ) {
                    AddQuietMove(MOVE(SQUARES.F2, SQUARES.D2, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (S.brd_pieces[SQUARES.G2] === PIECES.wS && S.brd_pieces[SQUARES.H2] === PIECES.wB) {
            AddQuietMove(MOVE(SQUARES.G2, SQUARES.H2, PIECES.EMPTY, PIECES.EMPTY, MFLAGRZ));
        }
    } else {
        pceType = PIECES.bP;
        for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pceType, pceNum)];

            if (S.brd_pieces[sq - 13] === PIECES.EMPTY && !SQCENTER(sq - 13, PIECES.bP)) {
                AddBlackPawnQuietMove(sq, sq - 13);
                if (S.RanksBrd[sq] === RANKS.RANK_9 && S.brd_pieces[sq - 26] === PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, sq - 26, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            if (
                !SQOFFBOARD(sq - 12) &&
                !SQCENTER(sq - 12, PIECES.bP) &&
                PieceCol[S.brd_pieces[sq - 12]] === COLOURS.WHITE
            ) {
                AddBlackPawnCaptureMove(sq, sq - 12, S.brd_pieces[sq - 12]);
            }

            if (
                !SQOFFBOARD(sq - 14) &&
                !SQCENTER(sq - 14, PIECES.bP) &&
                PieceCol[S.brd_pieces[sq - 14]] === COLOURS.WHITE
            ) {
                AddBlackPawnCaptureMove(sq, sq - 14, S.brd_pieces[sq - 14]);
            }
            if (S.brd_enPas !== SQUARES.NO_SQ) {
                if (sq - 12 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq - 14 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (S.brd_castlePerm & CASTLEBIT.BKCA) {
            if (
                S.brd_pieces[SQUARES.G10] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.H10] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.I10] === PIECES.EMPTY
            ) {
                if (
                    !SqAttacked(SQUARES.F10, COLOURS.WHITE) &&
                    !SqAttacked(SQUARES.G10, COLOURS.WHITE) &&
                    !SqAttacked(SQUARES.H10, COLOURS.WHITE) &&
                    !SqAttacked(SQUARES.I10, COLOURS.WHITE)
                ) {
                    AddQuietMove(MOVE(SQUARES.F10, SQUARES.I10, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (S.brd_castlePerm & CASTLEBIT.BQCA) {
            if (
                S.brd_pieces[SQUARES.E10] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.D10] === PIECES.EMPTY &&
                S.brd_pieces[SQUARES.C10] === PIECES.EMPTY
            ) {
                if (
                    !SqAttacked(SQUARES.F10, COLOURS.WHITE) &&
                    !SqAttacked(SQUARES.E10, COLOURS.WHITE) &&
                    !SqAttacked(SQUARES.D10, COLOURS.WHITE)
                ) {
                    AddQuietMove(MOVE(SQUARES.F10, SQUARES.D10, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (S.brd_pieces[SQUARES.G10] === PIECES.bS && S.brd_pieces[SQUARES.H10] === PIECES.bB) {
            AddQuietMove(MOVE(SQUARES.G10, SQUARES.H10, PIECES.EMPTY, PIECES.EMPTY, MFLAGRZ));
        }
    }

    pceIndex = LoopSlideIndex[S.brd_side];
    pce = LoopSlidePce[pceIndex++];
    while (pce !== 0) {
        const dirs = PceDirSlide[pce];
        const nDirs = DirNumSlide[pce];

        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < nDirs; ++index) {
                dir = dirs[index];
                t_sq = sq + dir;

                while (!SQOFFBOARD(t_sq)) {
                    const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
                    const tPiece = S.brd_pieces[t_sq];

                    if (tPiece !== PIECES.EMPTY && !centerBlock) {
                        if (PieceCol[tPiece] !== S.brd_side) {
                            AddCaptureMove(MOVE(sq, t_sq, tPiece, PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    if (!centerBlock) AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    if (centerBlock && tPiece !== PIECES.EMPTY) break;
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[S.brd_side];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce !== 0) {
        const dirs = PceDirNonSlide[pce];
        const nDirs = DirNumNonSlide[pce];

        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < nDirs; ++index) {
                dir = dirs[index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq)) continue;

                const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
                const tPiece = S.brd_pieces[t_sq];

                if (tPiece !== PIECES.EMPTY && !centerBlock) {
                    if (PieceCol[tPiece] !== S.brd_side) {
                        AddCaptureMove(MOVE(sq, t_sq, tPiece, PIECES.EMPTY, 0));
                    }
                    continue;
                }
                if (!centerBlock) AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    ++GenerateMovesNum;
}

export function GenerateCaptures(): void {
    S.brd_moveListStart[S.brd_ply + 1] = S.brd_moveListStart[S.brd_ply];
    let pceType: number;
    let pceNum: number;
    let pceIndex: number;
    let pce: number;
    let sq: number;
    let index: number;
    let dir: number;
    let t_sq: number;
    if (S.brd_side === COLOURS.WHITE) {
        pceType = PIECES.wP;
        for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pceType, pceNum)];

            if (
                !SQOFFBOARD(sq + 12) &&
                !SQCENTER(sq + 12, PIECES.wP) &&
                PieceCol[S.brd_pieces[sq + 12]] === COLOURS.BLACK
            ) {
                AddWhitePawnCaptureMove(sq, sq + 12, S.brd_pieces[sq + 12]);
            }
            if (
                !SQOFFBOARD(sq + 14) &&
                !SQCENTER(sq + 14, PIECES.wP) &&
                PieceCol[S.brd_pieces[sq + 14]] === COLOURS.BLACK
            ) {
                AddWhitePawnCaptureMove(sq, sq + 14, S.brd_pieces[sq + 14]);
            }

            if (S.brd_enPas !== SQUARES.NO_SQ) {
                if (sq + 12 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq + 14 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
    } else {
        pceType = PIECES.bP;
        for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pceType, pceNum)];

            if (
                !SQOFFBOARD(sq - 12) &&
                !SQCENTER(sq - 12, PIECES.bP) &&
                PieceCol[S.brd_pieces[sq - 12]] === COLOURS.WHITE
            ) {
                AddBlackPawnCaptureMove(sq, sq - 12, S.brd_pieces[sq - 12]);
            }

            if (
                !SQOFFBOARD(sq - 14) &&
                !SQCENTER(sq - 14, PIECES.bP) &&
                PieceCol[S.brd_pieces[sq - 14]] === COLOURS.WHITE
            ) {
                AddBlackPawnCaptureMove(sq, sq - 14, S.brd_pieces[sq - 14]);
            }
            if (S.brd_enPas !== SQUARES.NO_SQ) {
                if (sq - 12 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq - 14 === S.brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
    }

    pceIndex = LoopSlideIndex[S.brd_side];
    pce = LoopSlidePce[pceIndex++];
    while (pce !== 0) {
        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumSlide[pce]; ++index) {
                dir = PceDirSlide[pce][index];
                t_sq = sq + dir;

                while (!SQOFFBOARD(t_sq)) {
                    if (S.brd_pieces[t_sq] !== PIECES.EMPTY && !SQCENTER(t_sq, S.brd_pieces[sq])) {
                        if (PieceCol[S.brd_pieces[t_sq]] !== S.brd_side) {
                            AddCaptureMove(MOVE(sq, t_sq, S.brd_pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[S.brd_side];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce !== 0) {
        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumNonSlide[pce]; ++index) {
                dir = PceDirNonSlide[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq)) continue;

                if (S.brd_pieces[t_sq] !== PIECES.EMPTY && !SQCENTER(t_sq, S.brd_pieces[sq])) {
                    if (PieceCol[S.brd_pieces[t_sq]] !== S.brd_side) {
                        AddCaptureMove(MOVE(sq, t_sq, S.brd_pieces[t_sq], PIECES.EMPTY, 0));
                    }
                }
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    ++GenerateCapturesNum;
}

export function Mobility(): number {
    S.brd_moveListStart[S.brd_ply + 1] = S.brd_moveListStart[S.brd_ply];
    WhiteMobility = 0;
    BlackMobility = 0;
    let pceNum: number;
    let pceIndex: number;
    let pce: number;
    let sq: number;
    let index: number;
    let dir: number;
    let t_sq: number;

    // White Mobility
    pceIndex = LoopSlideIndex[COLOURS.WHITE];
    pce = LoopSlidePce[pceIndex++];
    while (pce !== 0) {
        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumSlide[pce]; ++index) {
                dir = PceDirSlide[pce][index];
                t_sq = sq + dir;

                while (!SQOFFBOARD(t_sq)) {
                    const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
                    const tPiece = S.brd_pieces[t_sq];
                    if (tPiece !== PIECES.EMPTY && !centerBlock) {
                        if (PieceCol[tPiece] === COLOURS.BLACK) {
                            WhiteMobility++;
                            WhiteMobility++;
                        }
                        break;
                    }
                    if (!centerBlock) WhiteMobility++;
                    if (centerBlock && tPiece !== PIECES.EMPTY) break;
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[COLOURS.WHITE];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce !== 0) {
        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumNonSlide[pce]; ++index) {
                dir = PceDirNonSlide[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq)) continue;

                const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
                const tPiece = S.brd_pieces[t_sq];
                if (tPiece !== PIECES.EMPTY && !centerBlock) {
                    if (PieceCol[tPiece] === COLOURS.BLACK) {
                        WhiteMobility++;
                        WhiteMobility++;
                    }
                    continue;
                }
                if (!centerBlock) WhiteMobility++;
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }

    // Black Mobility
    pceIndex = LoopSlideIndex[COLOURS.BLACK];
    pce = LoopSlidePce[pceIndex++];
    while (pce !== 0) {
        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumSlide[pce]; ++index) {
                dir = PceDirSlide[pce][index];
                t_sq = sq + dir;

                while (!SQOFFBOARD(t_sq)) {
                    const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
                    const tPiece = S.brd_pieces[t_sq];
                    if (tPiece !== PIECES.EMPTY && !centerBlock) {
                        if (PieceCol[tPiece] === COLOURS.WHITE) {
                            BlackMobility++;
                            BlackMobility++;
                        }
                        break;
                    }
                    if (!centerBlock) BlackMobility++;
                    if (centerBlock && tPiece !== PIECES.EMPTY) break;
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[COLOURS.BLACK];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce !== 0) {
        for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
            sq = S.brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumNonSlide[pce]; ++index) {
                dir = PceDirNonSlide[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq)) continue;

                const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
                const tPiece = S.brd_pieces[t_sq];
                if (tPiece !== PIECES.EMPTY && !centerBlock) {
                    if (PieceCol[tPiece] === COLOURS.WHITE) {
                        BlackMobility++;
                        BlackMobility++;
                    }
                    continue;
                }
                if (!centerBlock) BlackMobility++;
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    return WhiteMobility - BlackMobility;
}
