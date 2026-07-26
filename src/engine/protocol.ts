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
//  Draw Protocols
// ══════════════════════════

import { PIECES, SQUARES } from './defs';
import { S } from './state';

export { SendMessageToGui, SendBestMove, ReportEngineError } from './engine';

export function ThreeFoldRep(): number {
    let r: number = 0;
    for (let i = 0; i < S.brd_hisPly; ++i) {
        if (S.brd_history[i].posKey === S.brd_posKey) {
            r++;
        }
    }
    return r;
}

export function CitadelDraw(): boolean {
    if (S.brd_pieces[SQUARES.A11] === PIECES.wK || S.brd_pieces[SQUARES.K11] === PIECES.wK) return true;
    if (S.brd_pieces[SQUARES.A1] === PIECES.bK || S.brd_pieces[SQUARES.K1] === PIECES.bK) return true;
    return false;
}

export function DrawMaterial(): boolean {
    if (S.brd_pceNum[PIECES.wP] !== 0 || S.brd_pceNum[PIECES.bP] !== 0) return false;
    if (
        S.brd_pceNum[PIECES.wQ] !== 0 ||
        S.brd_pceNum[PIECES.bQ] !== 0 ||
        S.brd_pceNum[PIECES.wR] !== 0 ||
        S.brd_pceNum[PIECES.bR] !== 0
    )
        return false;
    if (
        S.brd_pceNum[PIECES.wS] !== 0 ||
        S.brd_pceNum[PIECES.bS] !== 0 ||
        S.brd_pceNum[PIECES.wF] !== 0 ||
        S.brd_pceNum[PIECES.bF] !== 0
    )
        return false;
    if (S.brd_pceNum[PIECES.wB] > 1 || S.brd_pceNum[PIECES.bB] > 1) return false;
    if (S.brd_pceNum[PIECES.wN] > 1 || S.brd_pceNum[PIECES.bN] > 1) return false;
    if (S.brd_pceNum[PIECES.wN] !== 0 && S.brd_pceNum[PIECES.wB] !== 0) return false;
    if (S.brd_pceNum[PIECES.bN] !== 0 && S.brd_pceNum[PIECES.bB] !== 0) return false;

    return true;
}

export function CapturedPieces(): string {
    const cwP = 9 - S.brd_pceNum[PIECES.wP];
    const cwN = 2 - S.brd_pceNum[PIECES.wN];
    const cwB = 2 - S.brd_pceNum[PIECES.wB];
    const cwR = 2 - S.brd_pceNum[PIECES.wR];
    const cwS = 1 - S.brd_pceNum[PIECES.wS];
    const cwF = 2 - S.brd_pceNum[PIECES.wF];
    const cwQ = 1 - S.brd_pceNum[PIECES.wQ];
    const cbP = 9 - S.brd_pceNum[PIECES.bP];
    const cbN = 2 - S.brd_pceNum[PIECES.bN];
    const cbB = 2 - S.brd_pceNum[PIECES.bB];
    const cbR = 2 - S.brd_pceNum[PIECES.bR];
    const cbS = 1 - S.brd_pceNum[PIECES.bS];
    const cbF = 2 - S.brd_pceNum[PIECES.bF];
    const cbQ = 1 - S.brd_pceNum[PIECES.bQ];
    const white_captured_pieces = `White P[${cwP}]N[${cwN}]B[${cwB}]R[${cwR}]S[${cwS}]F[${cwF}]Q[${cwQ}]`;
    const black_captured_pieces = `Black p[${cbP}]n[${cbN}]b[${cbB}]r[${cbR}]s[${cbS}]f[${cbF}]q[${cbQ}]`;

    const is_piece_captured = cwP + cwN + cwB + cwR + cwS + cwF + cwQ + cbP + cbN + cbB + cbR + cbS + cbF + cbQ;

    if (is_piece_captured > 0) {
        return `Captured Pieces: \r\n${white_captured_pieces}\r\n${black_captured_pieces}`;
    } else {
        return '';
    }
}
