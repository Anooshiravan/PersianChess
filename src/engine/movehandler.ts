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
//  Move Handler
// ══════════════════════════

import {
    PIECES,
    COLOURS,
    SQUARES,
    PieceCol,
    PieceVal,
    PiecePawn,
    Kings,
    CastlePerm,
    MFLAGEP,
    MFLAGPS,
    MFLAGCA,
    MFLAGRZ,
    FROMSQ,
    TOSQ,
    CAPTURED,
    PROMOTED,
    PCEINDEX,
} from './defs';
import { S, HASH_PCE, HASH_CA, HASH_SIDE, HASH_EP } from './state';
import { SqAttacked } from './board';

export function ClearPiece(sq: number): void {
    const pce = S.brd_pieces[sq];
    const col = PieceCol[pce];
    let t_pceNum: number = -1;

    HASH_PCE(pce, sq);

    S.brd_pieces[sq] = PIECES.EMPTY;
    S.brd_material[col] -= PieceVal[pce];

    for (let index = 0; index < S.brd_pceNum[pce]; ++index) {
        if (S.brd_pList[PCEINDEX(pce, index)] === sq) {
            t_pceNum = index;
            break;
        }
    }

    S.brd_pceNum[pce]--;
    S.brd_pList[PCEINDEX(pce, t_pceNum)] = S.brd_pList[PCEINDEX(pce, S.brd_pceNum[pce])];
}

export function AddPiece(sq: number, pce: number): void {
    const col = PieceCol[pce];

    HASH_PCE(pce, sq);

    S.brd_pieces[sq] = pce;

    S.brd_material[col] += PieceVal[pce];
    S.brd_pList[PCEINDEX(pce, S.brd_pceNum[pce])] = sq;
    S.brd_pceNum[pce]++;
}

export function MovePiece(from: number, to: number): void {
    const pce = S.brd_pieces[from];

    HASH_PCE(pce, from);
    S.brd_pieces[from] = PIECES.EMPTY;

    HASH_PCE(pce, to);
    S.brd_pieces[to] = pce;

    for (let index = 0; index < S.brd_pceNum[pce]; ++index) {
        if (S.brd_pList[PCEINDEX(pce, index)] === from) {
            S.brd_pList[PCEINDEX(pce, index)] = to;
            break;
        }
    }
}

export function MakeMove(move: number): boolean {
    const from = FROMSQ(move);
    const to = TOSQ(move);
    const side = S.brd_side;

    S.brd_history[S.brd_hisPly].posKey = S.brd_posKey;

    if ((move & MFLAGEP) !== 0) {
        if (side === COLOURS.WHITE) {
            ClearPiece(to - 13);
        } else {
            ClearPiece(to + 13);
        }
    } else if ((move & MFLAGCA) !== 0) {
        switch (to) {
            case SQUARES.D2:
                MovePiece(SQUARES.B2, SQUARES.E2);
                break;
            case SQUARES.D10:
                MovePiece(SQUARES.B10, SQUARES.E10);
                break;
            case SQUARES.I2:
                MovePiece(SQUARES.J2, SQUARES.H2);
                break;
            case SQUARES.I10:
                MovePiece(SQUARES.J10, SQUARES.H10);
                break;
            default:
                break;
        }
    }
    // Rendezvous
    else if ((move & MFLAGRZ) !== 0) {
        switch (to) {
            case SQUARES.H2:
                ClearPiece(SQUARES.G2);
                AddPiece(SQUARES.G2, PIECES.wB);
                ClearPiece(SQUARES.H2);
                if (S.variant === 'Oriental') {
                    AddPiece(SQUARES.H2, PIECES.wC);
                } else {
                    AddPiece(SQUARES.H2, PIECES.wS);
                }
                break;
            case SQUARES.H10:
                ClearPiece(SQUARES.G10);
                AddPiece(SQUARES.G10, PIECES.bB);
                ClearPiece(SQUARES.H10);
                if (S.variant === 'Oriental') {
                    AddPiece(SQUARES.H10, PIECES.bC);
                } else {
                    AddPiece(SQUARES.H10, PIECES.bS);
                }
                break;
            default:
                break;
        }
    }

    if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    S.brd_history[S.brd_hisPly].move = move;
    S.brd_history[S.brd_hisPly].fiftyMove = S.brd_fiftyMove;
    S.brd_history[S.brd_hisPly].enPas = S.brd_enPas;
    S.brd_history[S.brd_hisPly].castlePerm = S.brd_castlePerm;

    S.brd_castlePerm &= CastlePerm[from];
    S.brd_castlePerm &= CastlePerm[to];
    S.brd_enPas = SQUARES.NO_SQ;

    HASH_CA();

    const captured = CAPTURED(move);
    S.brd_fiftyMove++;

    if (captured !== PIECES.EMPTY) {
        ClearPiece(to);
        S.brd_fiftyMove = 0;
    }

    S.brd_hisPly++;
    S.brd_ply++;

    if (PiecePawn[S.brd_pieces[from]]) {
        S.brd_fiftyMove = 0;
        if ((move & MFLAGPS) !== 0) {
            if (side === COLOURS.WHITE) {
                S.brd_enPas = from + 13;
            } else {
                S.brd_enPas = from - 13;
            }
            HASH_EP();
        }
    }

    if ((move & MFLAGRZ) === 0) MovePiece(from, to);

    const prPce = PROMOTED(move);
    if (prPce !== PIECES.EMPTY) {
        ClearPiece(to);
        AddPiece(to, prPce);
    }

    S.brd_side ^= 1;
    HASH_SIDE();

    if (SqAttacked(S.brd_pList[PCEINDEX(Kings[side], 0)], S.brd_side)) {
        TakeMove();
        return false;
    }
    return true;
}

export function TakeMove(): void {
    S.brd_hisPly--;
    S.brd_ply--;

    const move = S.brd_history[S.brd_hisPly].move;
    const from = FROMSQ(move);
    const to = TOSQ(move);

    if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    S.brd_castlePerm = S.brd_history[S.brd_hisPly].castlePerm;
    S.brd_fiftyMove = S.brd_history[S.brd_hisPly].fiftyMove;
    S.brd_enPas = S.brd_history[S.brd_hisPly].enPas;

    if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    S.brd_side ^= 1;
    HASH_SIDE();

    if ((MFLAGEP & move) !== 0) {
        if (S.brd_side === COLOURS.WHITE) {
            AddPiece(to - 13, PIECES.bP);
        } else {
            AddPiece(to + 13, PIECES.wP);
        }
    } else if ((MFLAGCA & move) !== 0) {
        switch (to) {
            case SQUARES.D2:
                MovePiece(SQUARES.E2, SQUARES.B2);
                break;
            case SQUARES.D10:
                MovePiece(SQUARES.E10, SQUARES.B10);
                break;
            case SQUARES.I2:
                MovePiece(SQUARES.H2, SQUARES.J2);
                break;
            case SQUARES.I10:
                MovePiece(SQUARES.H10, SQUARES.J10);
                break;
            default:
                break;
        }
    }

    // Rendezvous
    else if ((move & MFLAGRZ) !== 0) {
        switch (to) {
            case SQUARES.H2:
                ClearPiece(SQUARES.G2);
                if (S.variant === 'Oriental') {
                    AddPiece(SQUARES.G2, PIECES.wC);
                } else {
                    AddPiece(SQUARES.G2, PIECES.wS);
                }

                ClearPiece(SQUARES.H2);
                AddPiece(SQUARES.H2, PIECES.wB);
                break;
            case SQUARES.H10:
                ClearPiece(SQUARES.G10);
                if (S.variant === 'Oriental') {
                    AddPiece(SQUARES.G10, PIECES.bC);
                } else {
                    AddPiece(SQUARES.G10, PIECES.bS);
                }
                ClearPiece(SQUARES.H10);
                AddPiece(SQUARES.H10, PIECES.bB);
                break;
            default:
                break;
        }
    }

    if ((move & MFLAGRZ) === 0) MovePiece(to, from);

    const captured = CAPTURED(move);
    if (captured !== PIECES.EMPTY) {
        AddPiece(to, captured);
    }

    if (PROMOTED(move) !== PIECES.EMPTY) {
        ClearPiece(from);
        AddPiece(from, PieceCol[PROMOTED(move)] === COLOURS.WHITE ? PIECES.wP : PIECES.bP);
    }
}
