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
//  Engine mutable state
// ══════════════════════════

import { BRD_SQ_NUM, BRD_PCE_NUM, SQUARES, COLOURS, MAXDEPTH, MAXPOSITIONMOVES } from './defs';

export interface HistoryEntry {
    move: number;
    castlePerm: number;
    enPas: number;
    fiftyMove: number;
    posKey: number;
}

export interface PvEntry {
    move: number;
    posKey: number;
}

export const S = {
    // ── Global flags / debug (Defs.js top) ──
    debug: false,
    board_debug: false,
    vs_engine: false,
    debug_log: false,
    engine_on: false,

    // ── Variant ──
    variant: 'Persian' as string,
    variantId: 0, // 0=Persian, 1=Pyramid, 2=Citadel, 3=Oriental — mirrors S.variant, int fast-path
    START_FEN:
        'f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1',

    // ── Coordinate mapping tables (Init.js fills these) ──
    FilesBrd: new Array<number>(BRD_SQ_NUM),
    RanksBrd: new Array<number>(BRD_SQ_NUM),
    Sq195ToSq121: new Array<number>(BRD_SQ_NUM),
    Sq121ToSq195: new Array<number>(121),

    // ── Zobrist hashing ──
    PieceKeys: new Array<number>(BRD_PCE_NUM * BRD_SQ_NUM),
    SideKey: 0,
    CastleKeys: new Array<number>(16),

    // ── Board state (Board.js) ──
    brd_side: COLOURS.WHITE as number,
    brd_pieces: new Array<number>(BRD_SQ_NUM),
    brd_enPas: SQUARES.NO_SQ as number,
    brd_fiftyMove: 0,
    brd_ply: 0,
    brd_hisPly: 0,
    brd_castlePerm: 0,
    brd_posKey: 0,
    brd_pceNum: new Array<number>(21),
    brd_material: new Array<number>(2),
    brd_pList: new Array<number>(BRD_PCE_NUM * 11),

    brd_history: [] as HistoryEntry[],
    brd_history_notes: new Array<string>(255),

    brd_moveList: new Array<number>(MAXDEPTH * MAXPOSITIONMOVES),
    brd_moveScores: new Array<number>(MAXDEPTH * MAXPOSITIONMOVES),
    brd_moveListStart: new Array<number>(MAXDEPTH),

    brd_PvTable: [] as PvEntry[],
    brd_PvArray: new Array<number>(MAXDEPTH),
    brd_searchHistory: new Array<number>(BRD_PCE_NUM * BRD_SQ_NUM),
    brd_searchKillers: new Array<number>(3 * MAXDEPTH),

    // ── Search state (Search.js) ──
    srch_thinking: false,
    srch_stop: false,
    srch_nodes: 0,
    srch_fh: 0,
    srch_fhf: 0,
    srch_depth: 0,
    srch_time: 3000,
    srch_start: 0,
    srch_best: 0,
    srch_history: 0,

    // ── Evaluator state ──
    PawnRanksWhite: new Array<number>(10),
    PawnRanksBlack: new Array<number>(10),

    // ── Perft ──
    perft_leafNodes: 0,

    // ── Game controller ──
    GameController: {
        EngineSide: COLOURS.BOTH as number,
        PlayerSide: COLOURS.BOTH as number,
        BoardFlipped: false,
        GameOver: false,
        GameSaved: true,
    },
};

// Hash helpers — port of HASH_* macros from Defs.js.
export function HASH_PCE(pce: number, sq: number): void {
    S.brd_posKey ^= S.PieceKeys[pce * 195 + sq];
}
export function HASH_CA(): void {
    S.brd_posKey ^= S.CastleKeys[S.brd_castlePerm];
}
export function HASH_SIDE(): void {
    S.brd_posKey ^= S.SideKey;
}
export function HASH_EP(): void {
    S.brd_posKey ^= S.PieceKeys[S.brd_enPas];
}

// Context-dependent helpers (need brd_pieces / variant) — Defs.js had these too.
import { PIECES } from './defs';

// Centre-square rule. Returns true if `sq` is the centre (f6, sq 97) AND
// the current variant forbids `piece` from occupying/passing through it.
//   Persian: forbids everything except Pawn and Princess.
//   Pyramid: forbids all pieces.
//   Citadel / Oriental: no centre rule.
export function SQCENTER(sq: number, piece: number): boolean {
    if (sq !== 97) return false;
    if (S.variantId === 1) return true;
    if (S.variantId === 0 && piece !== PIECES.wS && piece !== PIECES.wP && piece !== PIECES.bS && piece !== PIECES.bP)
        return true;
    return false;
}

export function SQOFFBOARD(sq: number): boolean {
    return S.FilesBrd[sq] === SQUARES.OFFBOARD;
}

export function SQ121(sq195: number): number {
    return S.Sq195ToSq121[sq195];
}
export function SQ195(sq121: number): number {
    return S.Sq121ToSq195[sq121];
}

import { Mirror121 } from './defs';
export function MIRROR121(sq: number): number {
    return Mirror121[sq];
}

export function debuglog(_message: string): void {
    if (S.debug_log) {
        // eslint-disable-next-line no-console
        console.log(`debug::${_message}`);
    }
}
