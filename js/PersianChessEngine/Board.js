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

var brd_side = COLOURS.WHITE;
var brd_pieces = new Array(BRD_SQ_NUM);
var brd_enPas = SQUARES.NO_SQ;
var brd_fiftyMove;
var brd_ply;
var brd_hisPly;
var brd_castlePerm;
var brd_posKey;
var brd_pceNum = new Array(21);
var brd_material = new Array(2);
var brd_pList = new Array(22 * 11);

var brd_history = [];
var brd_history_notes = new Array(255);

var brd_moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
var brd_moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
var brd_moveListStart = new Array(MAXDEPTH);

var brd_PvTable = [PVENTRIES];
var brd_PvArray = new Array(MAXDEPTH);
var brd_searchHistory = new Array(22 * BRD_SQ_NUM);
var brd_searchKillers = new Array(3 * MAXDEPTH);

// board functions
function BoardToFen() {
    var fenStr = '';
    var rank, file, sq, piece;
    var emptyCount = 0;

    for (rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        for (file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            sq = FR2SQ(file, rank);
            piece = brd_pieces[sq];
            if (piece == PIECES.EMPTY || piece == SQUARES.OFFBOARD) {
                fenStr += '1';
            } else {
                fenStr += PceChar[piece];
            }
        }

        if (rank != RANKS.RANK_1) {
            fenStr += '/';
        } else {
            fenStr += ' ';
        }
    }

    fenStr += SideChar[brd_side] + ' ';

    if (brd_castlePerm == 0) {
        fenStr += '- ';
    } else {
        if (brd_castlePerm & CASTLEBIT.WKCA) fenStr += 'K';
        if (brd_castlePerm & CASTLEBIT.WQCA) fenStr += 'Q';
        if (brd_castlePerm & CASTLEBIT.BKCA) fenStr += 'k';
        if (brd_castlePerm & CASTLEBIT.BQCA) fenStr += 'q';
        fenStr += ' ';
    }

    if (brd_enPas == SQUARES.NO_SQ) {
        fenStr += '- ';
    } else {
        fenStr += PrSq(brd_enPas) + ' ';
    }
    fenStr += brd_fiftyMove;
    
    if (brd_hisPly > 2)
    {
        fenStr += ' ';
        var tempHalfMove = brd_hisPly;
        if (brd_side == COLOURS.BLACK) {
            tempHalfMove--;
        }
        var pLy =  tempHalfMove / 2;
        if (pLy < 1) pLy = 1;
        fenStr += pLy;
    }
    return fenStr;
}

function CheckBoard() {

    var t_pceNum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var t_material = [0, 0];

    var sq121, t_piece, t_pce_num, sq195, colour, pcount;

    // check piece lists
    for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        for (t_pce_num = 0; t_pce_num < brd_pceNum[t_piece]; ++t_pce_num) {
            sq195 = brd_pList[PCEINDEX(t_piece, t_pce_num)];
            if (brd_pieces[sq195] != t_piece) {
                debuglog('Error Pce Lists');
                return BOOL.FALSE;
            }
        }
    }

    // check piece count and other counters	
    for (sq121 = 0; sq121 < 121; ++sq121) {
        sq195 = SQ195(sq121);
        t_piece = brd_pieces[sq195];
        t_pceNum[t_piece]++;
        t_material[PieceCol[t_piece]] += PieceVal[t_piece];
    }

    for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        if (t_pceNum[t_piece] != brd_pceNum[t_piece]) {
            debuglog('Error t_pceNum');
            return BOOL.FALSE;
        }
    }

    if (t_material[COLOURS.WHITE] != brd_material[COLOURS.WHITE] || t_material[COLOURS.BLACK] != brd_material[COLOURS.BLACK]) {
        debuglog('Error t_material');
        return BOOL.FALSE;
    }
    if (brd_side != COLOURS.WHITE && brd_side != COLOURS.BLACK) {
        debuglog('Error brd_side');
        return BOOL.FALSE;
    }
    if (GeneratePosKey() != brd_posKey) {
        debuglog('Error brd_posKey');
        return BOOL.FALSE;
    }


    return BOOL.TRUE;
}

function printGameLine() {

    var moveNum = 0;
    var gameLine = "";
    for (moveNum = 0; moveNum < brd_hisPly; ++moveNum) {
        gameLine += PrMove(brd_history[moveNum].move) + " ";
    }
    //debuglog('Game Line: ' + gameLine);
    return gameLine.trim();
}

function PrintPceLists() {
    var piece, pceNum;

    for (piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
        for (pceNum = 0; pceNum < brd_pceNum[piece]; ++pceNum) {
            debuglog("Piece " + PceChar[piece] + " on " + PrSq(brd_pList[PCEINDEX(piece, pceNum)]));
        }
    }

}

function UpdateListsMaterial() {

    var piece, sq, index, colour;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        sq = index;
        piece = brd_pieces[index];
        if (piece != PIECES.OFFBOARD && piece != PIECES.EMPTY) {
            colour = PieceCol[piece];

            brd_material[colour] += PieceVal[piece];

            brd_pList[PCEINDEX(piece, brd_pceNum[piece])] = sq;
            brd_pceNum[piece]++;
        }
    }
}

function GeneratePosKey() {

    var sq = 0;
    var finalKey = 0;
    var piece = PIECES.EMPTY;

    // pieces
    for (sq = 0; sq < BRD_SQ_NUM; ++sq) {
        piece = brd_pieces[sq];
        if (piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
            finalKey ^= PieceKeys[(piece * 195) + sq];
        }
    }

    if (brd_side == COLOURS.WHITE) {
        finalKey ^= SideKey;
    }

    if (brd_enPas != SQUARES.NO_SQ) {
        finalKey ^= PieceKeys[brd_enPas];
    }

    finalKey ^= CastleKeys[brd_castlePerm];

    return finalKey;
}

function PrintBoard() {

    var sq, file, rank, piece, line;

    debuglog("\nGame Board:\n");

    for (rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        line = "";
        if (rank + 1 > 9) line = ((rank + 1) + "|");
        else line = ((rank + 1) + " |");
        for (file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            sq = FR2SQ(file, rank);
            piece = brd_pieces[sq];
            if (piece == SQUARES.OFFBOARD) line += (" * ");
            else line += (" " + PceChar[piece] + " ");
        }
        debuglog(line);
    }

    debuglog("");
    line = "   ";
    for (file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
        line += (' ' + FileChar.charAt(file) + ' ');
    }
    debuglog(line);
    debuglog("");
    debuglog("side:" + SideChar[brd_side]);
    debuglog("enPas:" + brd_enPas);
    line = "";
    if (brd_castlePerm & CASTLEBIT.WKCA) line += 'K';
    if (brd_castlePerm & CASTLEBIT.WQCA) line += 'Q';
    if (brd_castlePerm & CASTLEBIT.BKCA) line += 'k';
    if (brd_castlePerm & CASTLEBIT.BQCA) line += 'q';

    debuglog("castle:" + line);
    debuglog("key:" + brd_posKey.toString(16));
    // PrintPceLists();
}

function ResetBoard() {

    var index = 0;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        brd_pieces[index] = SQUARES.OFFBOARD;
    }

    for (index = 0; index < 121; ++index) {
   
        if (FrameSQ.indexOf(SQ195(index)) > -1) brd_pieces[SQ195(index)] = SQUARES.OFFBOARD;
        else brd_pieces[SQ195(index)] = PIECES.EMPTY;
    }

    for (index = 0; index < 22 * 11; ++index) {
        brd_pList[index] = PIECES.EMPTY;
    }

    for (index = 0; index < 2; ++index) {
        brd_material[index] = 0;
    }

    for (index = 0; index < 21; ++index) {
        brd_pceNum[index] = 0;
    }

    brd_side = COLOURS.BOTH;
    brd_enPas = SQUARES.NO_SQ;
    brd_fiftyMove = 0;
    brd_ply = 0;
    brd_hisPly = 0;
    brd_castlePerm = 0;
    brd_posKey = 0;
    brd_moveListStart[brd_ply] = 0;

}

function ParseFen(fen) {

    var rank = RANKS.RANK_11;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;
    var sq121 = 0;
    var sq195 = 0;
    var fenCnt = 0;

    ResetBoard();

    while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
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
            debuglog("FEN error \n");
            return false;
        }

        for (i = 0; i < count; i++) {
            sq121 = rank * 11 + file;
            sq195 = SQ195(sq121);
            if (piece != PIECES.EMPTY) {
                if (brd_pieces[sq195] != SQUARES.OFFBOARD) brd_pieces[sq195] = piece;
            }
            file++;
        }
        fenCnt++;
    }

    brd_side = (fen[fenCnt] == 'w') ? COLOURS.WHITE : COLOURS.BLACK;
    fenCnt += 2;

    for (i = 0; i < 4; i++) {
        if (fen[fenCnt] == ' ') {
            break;
        }
        switch (fen[fenCnt]) {

        case 'K':
            brd_castlePerm |= CASTLEBIT.WKCA;
            break;
        case 'Q':
            brd_castlePerm |= CASTLEBIT.WQCA;
            break;
        case 'k':
            brd_castlePerm |= CASTLEBIT.BKCA;
            break;
        case 'q':
            brd_castlePerm |= CASTLEBIT.BQCA;
            break;
        default:
            break;
        }
        fenCnt++;
    }
    fenCnt++;

    if (fen[fenCnt] != '-'  && fen[fenCnt] != undefined) {
        file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
        rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();
        debuglog("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
        brd_enPas = FR2SQ(file, rank);
    }

    brd_posKey = GeneratePosKey();
    UpdateListsMaterial();
    return true;
}

function SqAttacked(sq, side) {
    var pce;
    var t_sq;
    var index;
    
    if (brd_pieces[sq] == SQUARES.OFFBOARD) return BOOL.FALSE;

    if (variant == "ASE" && ASEDIA.indexOf(sq) > -1) return BOOL.TRUE;
     
    if (side == COLOURS.WHITE) {
        if (brd_pieces[sq - 14] == PIECES.wP || brd_pieces[sq - 12] == PIECES.wP) {
            return BOOL.TRUE;
        }
    } else {
        if (brd_pieces[sq + 14] == PIECES.bP || brd_pieces[sq + 12] == PIECES.bP) {
            return BOOL.TRUE;
        }
    }

    // Knight, Princess and Fortress (non slide moves)

    for (index = 0; index < 8; ++index) {
        pce = brd_pieces[sq + KnDir[index]];
        if (pce != SQUARES.OFFBOARD && PieceKnightPrincessFortress[pce] == BOOL.TRUE && PieceCol[pce] == side) {
            return BOOL.TRUE;
        }
    }

    // Rook, Fortress and Queen (slide moves)

    for (index = 0; index < 4; ++index) {
        dir = RkDir[index];
        t_sq = sq + dir;
        pce = brd_pieces[t_sq];
        while (pce != SQUARES.OFFBOARD) {
            if (pce != PIECES.EMPTY) {
                if (PieceRookFortressQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
                    return BOOL.TRUE;
                }
                break;
            }
            t_sq += dir;
            pce = brd_pieces[t_sq];
        }
    }

    // Bishop, Princess and Queen (slide moves)

    for (index = 0; index < 4; ++index) {
        dir = BiDir[index];
        t_sq = sq + dir;
        pce = brd_pieces[t_sq];
        while (pce != SQUARES.OFFBOARD) {
            if (pce != PIECES.EMPTY) {
                if (PieceBishopPrincessQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
                    return BOOL.TRUE;
                }
                break;
            }
            t_sq += dir;
            pce = brd_pieces[t_sq];
        }
    }

    // Wizard and Champion

    if (variant == "Oriental")
    {
        for (index = 0; index < 12; ++index) {
            pce = brd_pieces[sq + WzDir[index]];
            if (pce != SQUARES.OFFBOARD && PieceWizard[pce] == BOOL.TRUE && PieceCol[pce] == side) {
                return BOOL.TRUE;
            }
        }

        for (index = 0; index < 12; ++index) {
            pce = brd_pieces[sq + ChDir[index]];
            if (pce != SQUARES.OFFBOARD && PieceChampion[pce] == BOOL.TRUE && PieceCol[pce] == side) {
                return BOOL.TRUE;
            }
        }
    }
    
    // King

    for (index = 0; index < 8; ++index) {
        pce = brd_pieces[sq + KiDir[index]];
        if (pce != SQUARES.OFFBOARD && PieceKing[pce] == BOOL.TRUE && PieceCol[pce] == side) {
            return BOOL.TRUE;
        }
    }

    return BOOL.FALSE;
}

function PrintSqAttacked() {

    var sq, file, rank, piece, line;

    debuglog("\nAttacked by Black:\n");

    for (rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        line = ((rank + 1) + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            sq = FR2SQ(file, rank);
            if (SqAttacked(sq, COLOURS.BLACK) == BOOL.TRUE) piece = "X";
            else if (brd_pieces[sq] == SQUARES.OFFBOARD) piece = "*";
            else piece = "-";
            line += (" " + piece + " ");
        }
        debuglog(line);
    }

    debuglog("\nAttacked by White:\n");

    for (rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        line = ((rank + 1) + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            sq = FR2SQ(file, rank);
            if (SqAttacked(sq, COLOURS.WHITE) == BOOL.TRUE) piece = "X";
            else if (brd_pieces[sq] == SQUARES.OFFBOARD) piece = "*";
            else piece = "-";
            line += (" " + piece + " ");
        }
        debuglog(line);
    }
}

function EvaluateSqAttacked()
{
    // This function is not used in the evaluation yet, it is very slow
    var SqAttackedByWhite = 0;
    var SqAttackedByBlack = 0;
    var SqAttackedScore = 0;
    for (rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
        for (file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
            sq = FR2SQ(file, rank);
            if (SqAttacked(sq, COLOURS.WHITE) == BOOL.TRUE) SqAttackedByWhite++;
            else if (SqAttacked(sq, COLOURS.BLACK) == BOOL.TRUE) SqAttackedByBlack++;
        }
    }
    SqAttackedScore = SqAttackedByWhite - SqAttackedByBlack;
    return SqAttackedScore;
}

// ════════════════════════════════════════════════════
debuglog ("Board.js is loaded.");