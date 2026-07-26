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
//  Input/Output
// ══════════════════════════

import {
    PIECES,
    COLOURS,
    SQUARES,
    PIECE_NAMES,
    PieceKnight,
    PieceRookFortressQueen,
    PieceBishopPrincessQueen,
    FR2SQ,
    FROMSQ,
    TOSQ,
    PROMOTED,
    MFLAGRZ,
    NOMOVE,
} from './defs';
import { S, debuglog } from './state';
import { GenerateMoves } from './movegen';
import { MakeMove, TakeMove } from './movehandler';

export function SqFromAlg(moveAlg: string): number {
    if (moveAlg.length > 8) return SQUARES.NO_SQ;
    const file = moveAlg[0].charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = (moveAlg.substring(1) as any) - 1;
    return FR2SQ(file, rank);
}

export function PrintMoveList(): void {
    debuglog('MoveList:');
    for (let index = S.brd_moveListStart[S.brd_ply]; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
        const move = S.brd_moveList[index];
        debuglog(`Move:${index + 1} > ${PrMove(move)}`);
    }
}

export function PrSq(sq: number): string {
    const file = S.FilesBrd[sq];
    const rank = S.RanksBrd[sq];
    const sqStr = String.fromCharCode('a'.charCodeAt(0) + file) + (rank + 1);
    return sqStr;
}

export function PrMoveWithPieces(move: number): string {
    let MvStr: string;
    const ff = S.FilesBrd[FROMSQ(move)];
    const rf = S.RanksBrd[FROMSQ(move)];
    const ft = S.FilesBrd[TOSQ(move)];
    const rt = S.RanksBrd[TOSQ(move)];

    MvStr = `${String.fromCharCode('a'.charCodeAt(0) + ff) + (rf + 1)}-${String.fromCharCode('a'.charCodeAt(0) + ft)}${rt + 1}`;
    if ((move & MFLAGRZ) !== 0) {
        MvStr += ' [Rendezvous]';
        return MvStr;
    }
    if (PIECE_NAMES[S.brd_pieces[TOSQ(move)]] !== 'EMPTY') {
        MvStr += ` [Captures ${PIECE_NAMES[S.brd_pieces[TOSQ(move)]]}]`;
        return MvStr;
    }
    return MvStr;
}

export function PrMove(move: number): string {
    const ff = S.FilesBrd[FROMSQ(move)];
    const rf = S.RanksBrd[FROMSQ(move)];
    const ft = S.FilesBrd[TOSQ(move)];
    const rt = S.RanksBrd[TOSQ(move)];

    let MvStr = `${String.fromCharCode('a'.charCodeAt(0) + ff) + (rf + 1)}-${String.fromCharCode('a'.charCodeAt(0) + ft)}${rt + 1}`;

    const promoted = PROMOTED(move);

    if (promoted !== PIECES.EMPTY) {
        let pchar = 'q';
        if (PieceKnight[promoted]) {
            pchar = 'n';
        } else if (PieceRookFortressQueen[promoted] && !PieceBishopPrincessQueen[promoted]) {
            pchar = 'r';
        } else if (!PieceRookFortressQueen[promoted] && PieceBishopPrincessQueen[promoted]) {
            pchar = 'b';
        }
        MvStr += pchar;
    }
    return MvStr;
}

export function ParseMove(from: number, to: number): number {
    GenerateMoves();

    let Move: number = NOMOVE;
    let PromPce: number = PIECES.EMPTY;
    let found = false;
    for (let index = S.brd_moveListStart[S.brd_ply]; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
        Move = S.brd_moveList[index];
        if (FROMSQ(Move) === from && TOSQ(Move) === to) {
            PromPce = PROMOTED(Move);
            if (PromPce !== PIECES.EMPTY) {
                if (
                    (PromPce === PIECES.wQ && S.brd_side === COLOURS.WHITE) ||
                    (PromPce === PIECES.bQ && S.brd_side === COLOURS.BLACK)
                ) {
                    found = true;
                    break;
                }
                continue;
            }
            found = true;
            break;
        }
    }

    if (found) {
        if (!MakeMove(Move)) return NOMOVE;
        TakeMove();
        return Move;
    }

    return NOMOVE;
}

export function SanityCheck(move: number): boolean {
    if (S.brd_pieces[FROMSQ(move)] === 0) return false;
    return true;
}
