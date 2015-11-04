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

function SqFromAlg(moveAlg) {
    if (moveAlg.length > 8) return SQUARES.NO_SQ;
    file = moveAlg[0].charCodeAt() - 'a'.charCodeAt();
    rank = moveAlg.substring(1) - 1;
    return FR2SQ(file, rank);
}

function PrintMoveList() {
    var index;
    var move;
    debuglog("MoveList:");

    for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

        move = brd_moveList[index];
        debuglog("Move:" + (index + 1) + " > " + PrMove(move));

    }
}

function PrSq(sq) {
    var file = FilesBrd[sq];
    var rank = RanksBrd[sq];
    var brdRank = rank + 1;
    var sqStr = String.fromCharCode('a'.charCodeAt() + file) + (rank + 1);
    return sqStr;
}

function PrMoveWithPieces(move) {
    var MvStr;
    var ff = FilesBrd[FROMSQ(move)];
    var rf = RanksBrd[FROMSQ(move)];
    var ft = FilesBrd[TOSQ(move)];
    var rt = RanksBrd[TOSQ(move)];

    MvStr = String.fromCharCode('a'.charCodeAt() + ff) + (rf + 1) + "-" + String.fromCharCode('a'.charCodeAt() + ft) + (rt + 1);
    if ((move & MFLAGRZ) != 0)
    // MvStr = String.fromCharCode('a'.charCodeAt() + ff) + (rf+1) + " [" + PIECE_NAMES[brd_pieces[FROMSQ(move)]] + "] - " + String.fromCharCode('a'.charCodeAt() + ft) + (rt+1);

    {
        MvStr += " [Rendezvous]";
        return MvStr;
    }
    if (PIECE_NAMES[brd_pieces[TOSQ(move)]] != "EMPTY") {
        MvStr += " [Captures " + PIECE_NAMES[brd_pieces[TOSQ(move)]] + "]";
        return MvStr;
    }
    return MvStr;
}


function PrMove(move) {

    var MvStr;

    var ff = FilesBrd[FROMSQ(move)];
    var rf = RanksBrd[FROMSQ(move)];
    var ft = FilesBrd[TOSQ(move)];
    var rt = RanksBrd[TOSQ(move)];

    MvStr = String.fromCharCode('a'.charCodeAt() + ff) + (rf + 1) + '-' + String.fromCharCode('a'.charCodeAt() + ft) + (rt + 1);

    var promoted = PROMOTED(move);

    if (promoted != PIECES.EMPTY) {
        var pchar = 'q';
        if (PieceKnight[promoted] == BOOL.TRUE) {
            pchar = 'n';
        } else if (PieceRookFortressQueen[promoted] == BOOL.TRUE && PieceBishopPrincessQueen[promoted] == BOOL.FALSE) {
            pchar = 'r';
        } else if (PieceRookFortressQueen[promoted] == BOOL.FALSE && PieceBishopPrincessQueen[promoted] == BOOL.TRUE) {
            pchar = 'b';
        }
        MvStr += pchar;
    }
    return MvStr;
}

function ParseMove(from, to) {

    GenerateMoves();

    var Move = NOMOVE;
    var PromPce = PIECES.EMPTY;
    var found = BOOL.FALSE;
    for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {
        Move = brd_moveList[index];
        if (FROMSQ(Move) == from && TOSQ(Move) == to) {
            PromPce = PROMOTED(Move);
            if (PromPce != PIECES.EMPTY) {
                if ((PromPce == PIECES.wQ && brd_side == COLOURS.WHITE) || (PromPce == PIECES.bQ && brd_side == COLOURS.BLACK)) {
                    found = BOOL.TRUE;
                    break;
                }
                continue;
            }
            found = BOOL.TRUE;
            break;
        }
    }

    if (found != BOOL.FALSE) {
        if (MakeMove(Move) == BOOL.FALSE) {
            return NOMOVE;
        }
        TakeMove();
        return Move;
    }

    return NOMOVE;
}

function SanityCheck(move) {
    if (brd_pieces[FROMSQ(move)] == 0) {
        return BOOL.FALSE;
    }
    return BOOL.TRUE;
}

// ════════════════════════════════════════════════════
debuglog("InputOutput.js is loaded.");
