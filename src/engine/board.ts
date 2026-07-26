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
//  Engine system board
// ══════════════════════════

import {
    BRD_SQ_NUM,
    RANKS,
    FILES,
    COLOURS,
    SQUARES,
    PIECES,
    CASTLEBIT,
    PceChar,
    SideChar,
    FileChar,
    PieceCol,
    PieceVal,
    PieceKnightPrincessFortress,
    PieceRookFortressQueen,
    PieceBishopPrincessQueen,
    PieceWizard,
    PieceChampion,
    PieceKing,
    KnDir,
    RkDir,
    BiDir,
    KiDir,
    WzDir,
    ChDir,
    FrameSQ,
    ASEDIA,
    FR2SQ,
    PCEINDEX,
} from './defs';
import { S, SQ195, debuglog } from './state';
import { PrSq, PrMove } from './input';

// board functions
export function BoardToFen(): string {
    let fenStr = '';
    const _emptyCount = 0;

    for (let rank: number = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        for (let file: number = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            const sq = FR2SQ(file, rank);
            const piece = S.brd_pieces[sq];
            if (piece === PIECES.EMPTY || piece === SQUARES.OFFBOARD) {
                fenStr += '1';
            } else {
                fenStr += PceChar[piece];
            }
        }

        if (rank !== RANKS.RANK_1) {
            fenStr += '/';
        } else {
            fenStr += ' ';
        }
    }

    fenStr += `${SideChar[S.brd_side]} `;

    if (S.brd_castlePerm === 0) {
        fenStr += '- ';
    } else {
        if (S.brd_castlePerm & CASTLEBIT.WKCA) fenStr += 'K';
        if (S.brd_castlePerm & CASTLEBIT.WQCA) fenStr += 'Q';
        if (S.brd_castlePerm & CASTLEBIT.BKCA) fenStr += 'k';
        if (S.brd_castlePerm & CASTLEBIT.BQCA) fenStr += 'q';
        fenStr += ' ';
    }

    if (S.brd_enPas === SQUARES.NO_SQ) {
        fenStr += '- ';
    } else {
        fenStr += `${PrSq(S.brd_enPas)} `;
    }
    fenStr += S.brd_fiftyMove;

    if (S.brd_hisPly > 2) {
        fenStr += ' ';
        let tempHalfMove = S.brd_hisPly;
        if (S.brd_side === COLOURS.BLACK) {
            tempHalfMove--;
        }
        let pLy = tempHalfMove / 2;
        if (pLy < 1) pLy = 1;
        fenStr += pLy;
    }
    return fenStr;
}

export function CheckBoard(): boolean {
    const t_pceNum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const t_material = [0, 0];

    // check piece lists
    for (let t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        for (let t_pce_num = 0; t_pce_num < S.brd_pceNum[t_piece]; ++t_pce_num) {
            const sq195 = S.brd_pList[PCEINDEX(t_piece, t_pce_num)];
            if (S.brd_pieces[sq195] !== t_piece) {
                debuglog('Error Pce Lists');
                return false;
            }
        }
    }

    // check piece count and other counters
    for (let sq121 = 0; sq121 < 121; ++sq121) {
        const sq195 = SQ195(sq121);
        const t_piece = S.brd_pieces[sq195];
        t_pceNum[t_piece]++;
        t_material[PieceCol[t_piece]] += PieceVal[t_piece];
    }

    for (let t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        if (t_pceNum[t_piece] !== S.brd_pceNum[t_piece]) {
            debuglog('Error t_pceNum');
            return false;
        }
    }

    if (
        t_material[COLOURS.WHITE] !== S.brd_material[COLOURS.WHITE] ||
        t_material[COLOURS.BLACK] !== S.brd_material[COLOURS.BLACK]
    ) {
        debuglog('Error t_material');
        return false;
    }
    if (S.brd_side !== COLOURS.WHITE && S.brd_side !== COLOURS.BLACK) {
        debuglog('Error brd_side');
        return false;
    }
    if (GeneratePosKey() !== S.brd_posKey) {
        debuglog('Error brd_posKey');
        return false;
    }

    return true;
}

export function printGameLine(): string {
    let gameLine = '';
    for (let moveNum = 0; moveNum < S.brd_hisPly; ++moveNum) {
        gameLine += `${PrMove(S.brd_history[moveNum].move)} `;
    }
    return gameLine.trim();
}

export function PrintPceLists(): void {
    for (let piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
        for (let pceNum = 0; pceNum < S.brd_pceNum[piece]; ++pceNum) {
            debuglog(`Piece ${PceChar[piece]} on ${PrSq(S.brd_pList[PCEINDEX(piece, pceNum)])}`);
        }
    }
}

export function UpdateListsMaterial(): void {
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
        const sq = index;
        const piece = S.brd_pieces[index];
        if (piece !== SQUARES.OFFBOARD && piece !== PIECES.EMPTY) {
            const colour = PieceCol[piece];

            S.brd_material[colour] += PieceVal[piece];

            S.brd_pList[PCEINDEX(piece, S.brd_pceNum[piece])] = sq;
            S.brd_pceNum[piece]++;
        }
    }
}

export function GeneratePosKey(): number {
    let finalKey = 0;

    // pieces
    for (let sq = 0; sq < BRD_SQ_NUM; ++sq) {
        const piece = S.brd_pieces[sq];
        if (piece !== PIECES.EMPTY && piece !== SQUARES.OFFBOARD) {
            finalKey ^= S.PieceKeys[piece * 195 + sq];
        }
    }

    if (S.brd_side === COLOURS.WHITE) {
        finalKey ^= S.SideKey;
    }

    if (S.brd_enPas !== SQUARES.NO_SQ) {
        finalKey ^= S.PieceKeys[S.brd_enPas];
    }

    finalKey ^= S.CastleKeys[S.brd_castlePerm];

    return finalKey;
}

export function PrintBoard(): void {
    debuglog('\nGame Board:\n');

    for (let rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        let line = '';
        if (rank + 1 > 9) line = `${rank + 1}|`;
        else line = `${rank + 1} |`;
        for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            const sq = FR2SQ(file, rank);
            const piece = S.brd_pieces[sq];
            if (piece === SQUARES.OFFBOARD) line += ' * ';
            else line += ` ${PceChar[piece]} `;
        }
        debuglog(line);
    }

    debuglog('');
    let line = '   ';
    for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
        line += ` ${FileChar.charAt(file)} `;
    }
    debuglog(line);
    debuglog('');
    debuglog(`side:${SideChar[S.brd_side]}`);
    debuglog(`enPas:${S.brd_enPas}`);
    line = '';
    if (S.brd_castlePerm & CASTLEBIT.WKCA) line += 'K';
    if (S.brd_castlePerm & CASTLEBIT.WQCA) line += 'Q';
    if (S.brd_castlePerm & CASTLEBIT.BKCA) line += 'k';
    if (S.brd_castlePerm & CASTLEBIT.BQCA) line += 'q';

    debuglog(`castle:${line}`);
    debuglog(`key:${S.brd_posKey.toString(16)}`);
}

export function ResetBoard(): void {
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
        S.brd_pieces[index] = SQUARES.OFFBOARD;
    }

    for (let index = 0; index < 121; ++index) {
        if (FrameSQ.indexOf(SQ195(index)) > -1) S.brd_pieces[SQ195(index)] = SQUARES.OFFBOARD;
        else S.brd_pieces[SQ195(index)] = PIECES.EMPTY;
    }

    for (let index = 0; index < 22 * 11; ++index) {
        S.brd_pList[index] = PIECES.EMPTY;
    }

    for (let index = 0; index < 2; ++index) {
        S.brd_material[index] = 0;
    }

    for (let index = 0; index < 21; ++index) {
        S.brd_pceNum[index] = 0;
    }

    S.brd_side = COLOURS.BOTH;
    S.brd_enPas = SQUARES.NO_SQ;
    S.brd_fiftyMove = 0;
    S.brd_ply = 0;
    S.brd_hisPly = 0;
    S.brd_castlePerm = 0;
    S.brd_posKey = 0;
    S.brd_moveListStart[S.brd_ply] = 0;
}

export function ParseFen(fen: string): boolean {
    let rank: number = RANKS.RANK_11;
    let file: number = FILES.FILE_A;
    let piece: number = 0;
    let count: number = 0;
    let i: number = 0;
    let sq121: number = 0;
    let sq195: number = 0;
    let fenCnt: number = 0;

    ResetBoard();

    while (rank >= RANKS.RANK_1 && fenCnt < fen.length) {
        count = 1;
        switch (fen[fenCnt]) {
            case 'p':
                piece = PIECES.bP;
                break;
            case 'r':
                piece = PIECES.bR;
                break;
            case 'n':
                piece = PIECES.bN;
                break;
            case 'w':
                piece = PIECES.bW;
                break;
            case 'c':
                piece = PIECES.bC;
                break;
            case 'b':
                piece = PIECES.bB;
                break;
            case 's':
                piece = PIECES.bS;
                break;
            case 'f':
                piece = PIECES.bF;
                break;
            case 'k':
                piece = PIECES.bK;
                break;
            case 'q':
                piece = PIECES.bQ;
                break;
            case 'P':
                piece = PIECES.wP;
                break;
            case 'R':
                piece = PIECES.wR;
                break;
            case 'N':
                piece = PIECES.wN;
                break;
            case 'W':
                piece = PIECES.wW;
                break;
            case 'C':
                piece = PIECES.wC;
                break;
            case 'B':
                piece = PIECES.wB;
                break;
            case 'S':
                piece = PIECES.wS;
                break;
            case 'F':
                piece = PIECES.wF;
                break;
            case 'K':
                piece = PIECES.wK;
                break;
            case 'Q':
                piece = PIECES.wQ;
                break;
            case '1':
                piece = PIECES.EMPTY;
                break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;

            default:
                debuglog('FEN error \n');
                return false;
        }

        for (i = 0; i < count; i++) {
            sq121 = rank * 11 + file;
            sq195 = SQ195(sq121);
            if (piece !== PIECES.EMPTY) {
                if (S.brd_pieces[sq195] !== SQUARES.OFFBOARD) S.brd_pieces[sq195] = piece;
            }
            file++;
        }
        fenCnt++;
    }

    S.brd_side = fen[fenCnt] === 'w' ? COLOURS.WHITE : COLOURS.BLACK;
    fenCnt += 2;

    for (i = 0; i < 4; i++) {
        if (fen[fenCnt] === ' ') break;
        switch (fen[fenCnt]) {
            case 'K':
                S.brd_castlePerm |= CASTLEBIT.WKCA;
                break;
            case 'Q':
                S.brd_castlePerm |= CASTLEBIT.WQCA;
                break;
            case 'k':
                S.brd_castlePerm |= CASTLEBIT.BKCA;
                break;
            case 'q':
                S.brd_castlePerm |= CASTLEBIT.BQCA;
                break;
            default:
                break;
        }
        fenCnt++;
    }
    fenCnt++;

    if (fen[fenCnt] !== '-' && fen[fenCnt] !== undefined) {
        file = fen[fenCnt].charCodeAt(0) - 'a'.charCodeAt(0);
        rank = fen[fenCnt + 1].charCodeAt(0) - '1'.charCodeAt(0);
        debuglog(`fen[fenCnt]:${fen[fenCnt]} File:${file} Rank:${rank}`);
        S.brd_enPas = FR2SQ(file, rank);
    }

    S.brd_posKey = GeneratePosKey();
    UpdateListsMaterial();
    return true;
}

export function SqAttacked(sq: number, side: number): boolean {
    if (S.brd_pieces[sq] === SQUARES.OFFBOARD) return false;

    if (S.variant === 'Pyramid' && ASEDIA.indexOf(sq) > -1) return true;

    if (side === COLOURS.WHITE) {
        if (S.brd_pieces[sq - 14] === PIECES.wP || S.brd_pieces[sq - 12] === PIECES.wP) return true;
    } else {
        if (S.brd_pieces[sq + 14] === PIECES.bP || S.brd_pieces[sq + 12] === PIECES.bP) return true;
    }

    // Knight, Princess and Fortress (non slide moves)
    for (let index = 0; index < 8; ++index) {
        const pce = S.brd_pieces[sq + KnDir[index]];
        if (pce !== SQUARES.OFFBOARD && PieceKnightPrincessFortress[pce] && PieceCol[pce] === side) return true;
    }

    // Rook, Fortress and Queen (slide moves)
    for (let index = 0; index < 4; ++index) {
        const dir = RkDir[index];
        let t_sq = sq + dir;
        let pce = S.brd_pieces[t_sq];
        while (pce !== SQUARES.OFFBOARD) {
            if (pce !== PIECES.EMPTY) {
                if (PieceRookFortressQueen[pce] && PieceCol[pce] === side) return true;
                break;
            }
            t_sq += dir;
            pce = S.brd_pieces[t_sq];
        }
    }

    // Bishop, Princess and Queen (slide moves)
    for (let index = 0; index < 4; ++index) {
        const dir = BiDir[index];
        let t_sq = sq + dir;
        let pce = S.brd_pieces[t_sq];
        while (pce !== SQUARES.OFFBOARD) {
            if (pce !== PIECES.EMPTY) {
                if (PieceBishopPrincessQueen[pce] && PieceCol[pce] === side) return true;
                break;
            }
            t_sq += dir;
            pce = S.brd_pieces[t_sq];
        }
    }

    // Wizard and Champion
    if (S.variant === 'Oriental') {
        for (let index = 0; index < 12; ++index) {
            const pce = S.brd_pieces[sq + WzDir[index]];
            if (pce !== SQUARES.OFFBOARD && PieceWizard[pce] && PieceCol[pce] === side) return true;
        }

        for (let index = 0; index < 12; ++index) {
            const pce = S.brd_pieces[sq + ChDir[index]];
            if (pce !== SQUARES.OFFBOARD && PieceChampion[pce] && PieceCol[pce] === side) return true;
        }
    }

    // King
    for (let index = 0; index < 8; ++index) {
        const pce = S.brd_pieces[sq + KiDir[index]];
        if (pce !== SQUARES.OFFBOARD && PieceKing[pce] && PieceCol[pce] === side) return true;
    }

    return false;
}

export function PrintSqAttacked(): void {
    debuglog('\nAttacked by Black:\n');

    for (let rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        let line = `${rank + 1}  `;
        for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            const sq = FR2SQ(file, rank);
            let piece: string;
            if (SqAttacked(sq, COLOURS.BLACK)) piece = 'X';
            else if (S.brd_pieces[sq] === SQUARES.OFFBOARD) piece = '*';
            else piece = '-';
            line += ` ${piece} `;
        }
        debuglog(line);
    }

    debuglog('\nAttacked by White:\n');

    for (let rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        let line = `${rank + 1}  `;
        for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            const sq = FR2SQ(file, rank);
            let piece: string;
            if (SqAttacked(sq, COLOURS.WHITE)) piece = 'X';
            else if (S.brd_pieces[sq] === SQUARES.OFFBOARD) piece = '*';
            else piece = '-';
            line += ` ${piece} `;
        }
        debuglog(line);
    }
}

export function EvaluateSqAttacked(): number {
    // This function is not used in the evaluation yet, it is very slow
    let SqAttackedByWhite = 0;
    let SqAttackedByBlack = 0;
    for (let rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            const sq = FR2SQ(file, rank);
            if (SqAttacked(sq, COLOURS.WHITE)) SqAttackedByWhite++;
            else if (SqAttacked(sq, COLOURS.BLACK)) SqAttackedByBlack++;
        }
    }
    return SqAttackedByWhite - SqAttackedByBlack;
}
