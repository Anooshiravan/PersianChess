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


var GenerateCapturesNum = 0;
var GenerateMovesNum = 0;
var WhiteMobility = 0;
var BlackMobility = 0;

var VictimScore = [0, 100, 200, 300, 400, 500, 600, 700, 800, 100, 200, 300, 400, 500, 600, 700, 800];
var MvvLvaScores = new Array(22 * 22);

function InitMvvLva() {
    var Attacker;
    var Victim;
    for (Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
        for (Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
            MvvLvaScores[Victim * 22 + Attacker] = VictimScore[Victim] + 6 - (VictimScore[Attacker] / 100);
        }
    }
}

// Error moves
var gen_m = 0;
var er_0 = 0;
var er_1 = 0;
var er_2 = 0;
var er_3 = 0;
var er_4 = 0;
var er_5 = 0;
var er_6 = 0;
var er_7 = 0;
var er_8 = 0;
var er_9 = 0;

function ShowErrorMoves()
{
    if (move_sanity_check)
    {
        debuglog ("------------- Move debugging ------------");
        debuglog ("MOVE: " + gen_m);
        if (er_0 > 0) debuglog ("Error 0: " + er_0);
        if (er_1 > 0) debuglog ("Error 1: " + er_1);
        if (er_2 > 0) debuglog ("Error 2: " + er_2);
        if (er_3 > 0) debuglog ("Error 3: " + er_3);
        if (er_4 > 0) debuglog ("Error 4: " + er_4);
        if (er_5 > 0) debuglog ("Error 5: " + er_5);
        if (er_6 > 0) debuglog ("Error 6: " + er_6);
        if (er_7 > 0) debuglog ("Error 7: " + er_7);
        if (er_8 > 0) debuglog ("Error 8: " + er_8);
        if (er_9 > 0) debuglog ("Error 9: " + er_9);
    }
}

var consolespam = 0;

function MOVE(from, to, captured, promoted, flag) {
    
    gen_m++;

    // Sanity check
    if (move_sanity_check) 
    {
        
        // Error 0: out of bound to and from sq
        if (from < 0 || from > 254 || to < 0 || to > 254 ) {
            er_0++;
            return NOMOVE;
        }
        // Error 1: Moving a nothing from fromsq
        if (brd_pieces[from] == PIECES.EMPTY) {
            er_1++;
            return NOMOVE;
        }
        // Error 2: White is moving black piece from fromsq
        if (brd_side == COLOURS.WHITE && brd_pieces[from] >= PIECES.bP) {
            er_2++;
            return NOMOVE;
        }
        // Error 3: Black is moving white piece from fromsq
        if (brd_side == COLOURS.BLACK && brd_pieces[from] < PIECES.bP && flag != MFLAGRZ) {
            er_3++;
            return NOMOVE;
        }
        // Error 4: White is capturing white piece
        if (brd_pieces[from] < PIECES.bP && brd_pieces[to] < PIECES.bP && brd_pieces[to] != PIECES.EMPTY && flag != MFLAGRZ) {
            er_4++;
            return NOMOVE;
        }
        // Error 5: Black is capturing black piece
        if (brd_pieces[from] >= PIECES.bP && brd_pieces[to] >= PIECES.bP && flag != MFLAGRZ) {
            er_5++;
            return NOMOVE;
        }
        // Error 6: Move from or to center SQ in Egyptian Eye
        if ((from == 97 || to == 97) && variant == "ASE") {
            er_6++;
            return NOMOVE;
        }
        // Error 7: Move from or to center SQ in Persian Princess (except for Pawns and Princess)
        if ((from == 97 || to == 97) && variant == "Persian" && brd_pieces[from] != PIECES.wS && brd_pieces[from] != PIECES.bS && brd_pieces[from] != PIECES.wP && brd_pieces[from] != PIECES.bP) {
            er_7++;
            return NOMOVE;
        }
        // Error 8: From or TO squares are OFFBOARD
        if (from == SQUARES.NO_SQ || from == SQUARES.OFFBOARD || to == SQUARES.NO_SQ || to == SQUARES.OFFBOARD) {
            er_8++;
            return NOMOVE;
        }
    }

    return (from | (to << 8) | (captured << 16) | (promoted << 23) | flag);
}

// Check if side has light square bishop
function LsbExist(side) {
    var pceType;
    var pceNum;
    var pceIndex;
    var sq;
    if (side == COLOURS.WHITE) {
        pceType = PIECES.wB;
        for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pceType, pceNum)];
            if (brd_pieces[sq] == PIECES.wB && isEven(sq)) {
                return BOOL.TRUE;
            }
        }
    }
    if (side == COLOURS.BLACK) {
        pceType = PIECES.bB;
        for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pceType, pceNum)];
            if (brd_pieces[sq] == PIECES.bB && isEven(sq)) {
                return BOOL.TRUE;
            }
        }
    }
    return BOOL.FALSE;
}

function isEven(n) {
    n = Number(n);
    return n === 0 || !! (n && !(n % 2));
}

function MoveExists(move) {

    if (move == NOMOVE) return BOOL.FALSE;

    GenerateMoves();

    var index;
    var moveFound = NOMOVE;
    for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

        moveFound = brd_moveList[index];
        if (MakeMove(moveFound) == BOOL.FALSE) {
            continue;
        }
        TakeMove();
        if (move == moveFound) {
            return BOOL.TRUE;
        }
    }
    return BOOL.FALSE;
}

function AddCaptureMove(move) {
    if (move == NOMOVE) return;
    brd_moveList[brd_moveListStart[brd_ply + 1]] = move;
    brd_moveScores[brd_moveListStart[brd_ply + 1]++] = MvvLvaScores[CAPTURED(move) * 18 + brd_pieces[FROMSQ(move)]] + 1000000;
}

function AddQuietMove(move) {
    if (move == NOMOVE) return;
    brd_moveList[brd_moveListStart[brd_ply + 1]] = move;

    if (brd_searchKillers[brd_ply] == move) {
        brd_moveScores[brd_moveListStart[brd_ply + 1]] = 900000;
    } else if (brd_searchKillers[MAXDEPTH + brd_ply] == move) {
        brd_moveScores[brd_moveListStart[brd_ply + 1]] = 800000;
    } else {
        brd_moveScores[brd_moveListStart[brd_ply + 1]] = brd_searchHistory[brd_pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
    }
    brd_moveListStart[brd_ply + 1]++;
}

function AddEnPassantMove(move) {
    if (move == NOMOVE) return;
    brd_moveList[brd_moveListStart[brd_ply + 1]] = move;
    brd_moveScores[brd_moveListStart[brd_ply + 1]++] = 105 + 1000000;
}

function AddWhitePawnCaptureMove(from, to, cap) {
    if (RanksBrd[from] == RANKS.RANK_9) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function AddWhitePawnQuietMove(from, to) {
    if (RanksBrd[from] == RANKS.RANK_9) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
    } else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

function AddBlackPawnCaptureMove(from, to, cap) {
    if (RanksBrd[from] == RANKS.RANK_3) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function AddBlackPawnQuietMove(from, to) {
    if (RanksBrd[from] == RANKS.RANK_3) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
    } else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}


function GenerateMoves() {
    brd_moveListStart[brd_ply + 1] = brd_moveListStart[brd_ply];
    var pceType;
    var pceNum;
    var pceIndex;
    var pce;
    var sq;
    var tsq;
    var index;
    if (brd_side == COLOURS.WHITE) {
        pceType = PIECES.wP;
        for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pceType, pceNum)];
            if (brd_pieces[sq + 13] == PIECES.EMPTY && SQASE(sq + 13) == BOOL.FALSE) {
                AddWhitePawnQuietMove(sq, sq + 13);
                if (RanksBrd[sq] == RANKS.RANK_3 && brd_pieces[sq + 26] == PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, (sq + 26), PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            if (SQOFFBOARD(sq + 12) == BOOL.FALSE && SQASE(sq + 12) == BOOL.FALSE && PieceCol[brd_pieces[sq + 12]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 12, brd_pieces[sq + 12]);
            }
            if (SQOFFBOARD(sq + 14) == BOOL.FALSE && SQASE(sq + 14) == BOOL.FALSE && PieceCol[brd_pieces[sq + 14]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 14, brd_pieces[sq + 14]);
            }

            if (brd_enPas != SQUARES.NO_SQ) {
                if (sq + 12 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq + 14 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (brd_castlePerm & CASTLEBIT.WKCA) {
            if (brd_pieces[SQUARES.G2] == PIECES.EMPTY && brd_pieces[SQUARES.H2] == PIECES.EMPTY && brd_pieces[SQUARES.I2] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F2, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.G2, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.H2, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.I2, COLOURS.BLACK) == BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.F2, SQUARES.I2, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (brd_castlePerm & CASTLEBIT.WQCA) {
            if (brd_pieces[SQUARES.E2] == PIECES.EMPTY && brd_pieces[SQUARES.D2] == PIECES.EMPTY && brd_pieces[SQUARES.C2] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F2, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.E2, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.D2, COLOURS.BLACK) == BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.F2, SQUARES.D2, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        // Add Rendezvous
        if (brd_pieces[SQUARES.G2] == PIECES.wS && brd_pieces[SQUARES.H2] == PIECES.wB) {
            AddQuietMove(MOVE(SQUARES.G2, SQUARES.H2, PIECES.EMPTY, PIECES.EMPTY, MFLAGRZ));
        }


        pceType = PIECES.wN; // HACK to set for loop other pieces

    } else {
        pceType = PIECES.bP;
        for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pceType, pceNum)];

            if (brd_pieces[sq - 13] == PIECES.EMPTY && SQASE(sq - 13) == BOOL.FALSE) {
                AddBlackPawnQuietMove(sq, sq - 13);
                if (RanksBrd[sq] == RANKS.RANK_9 && brd_pieces[sq - 26] == PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, (sq - 26), PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            if (SQOFFBOARD(sq - 12) == BOOL.FALSE && SQASE(sq - 12) == BOOL.FALSE && PieceCol[brd_pieces[sq - 12]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 12, brd_pieces[sq - 12]);
            }

            if (SQOFFBOARD(sq - 14) == BOOL.FALSE && SQASE(sq - 14) == BOOL.FALSE && PieceCol[brd_pieces[sq - 14]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 14, brd_pieces[sq - 14]);
            }
            if (brd_enPas != SQUARES.NO_SQ) {
                if (sq - 12 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq - 14 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (brd_castlePerm & CASTLEBIT.BKCA) {
            if (brd_pieces[SQUARES.G10] == PIECES.EMPTY && brd_pieces[SQUARES.H10] == PIECES.EMPTY && brd_pieces[SQUARES.I10] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F10, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.G10, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.H10, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.I10, COLOURS.WHITE) == BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.F10, SQUARES.I10, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (brd_castlePerm & CASTLEBIT.BQCA) {
            if (brd_pieces[SQUARES.E10] == PIECES.EMPTY && brd_pieces[SQUARES.D10] == PIECES.EMPTY && brd_pieces[SQUARES.C10] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F10, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.E10, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.D10, COLOURS.WHITE) == BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.F10, SQUARES.D10, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        // Add Rendezvous
        if (brd_pieces[SQUARES.G10] == PIECES.bS && brd_pieces[SQUARES.H10] == PIECES.bB) {
            AddQuietMove(MOVE(SQUARES.G10, SQUARES.H10, PIECES.EMPTY, PIECES.EMPTY, MFLAGRZ));
        }

        pceType = PIECES.bN; // HACK to set for loop other pieces
    }


    pceIndex = LoopSlideIndex[brd_side];
    pce = LoopSlidePce[pceIndex++];
    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumSlide[pce]; ++index) {
                dir = PceDirSlide[pce][index];
                t_sq = sq + dir;

                while (SQOFFBOARD(t_sq) == BOOL.FALSE) {

                    if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                        if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
                            AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    if (SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    if (SQPERS(sq, t_sq) == BOOL.TRUE && brd_pieces[t_sq] != PIECES.EMPTY) break;
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[brd_side];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumNonSlide[pce]; ++index) {
                dir = PceDirNonSlide[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq) == BOOL.TRUE) {
                    continue;
                }

                if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                    if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
                        AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
                    }
                    continue;
                }
                if (SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    ++GenerateMovesNum;
}

function GenerateCaptures() {
    brd_moveListStart[brd_ply + 1] = brd_moveListStart[brd_ply];
    var pceType;
    var pceNum;
    var pceIndex;
    var pce;
    var sq;
    var tsq;
    var index;
    if (brd_side == COLOURS.WHITE) {
        pceType = PIECES.wP;
        for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pceType, pceNum)];

            if (SQOFFBOARD(sq + 12) == BOOL.FALSE && SQASE(sq + 12) == BOOL.FALSE && PieceCol[brd_pieces[sq + 12]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 12, brd_pieces[sq + 12]);
            }
            if (SQOFFBOARD(sq + 14) == BOOL.FALSE && SQASE(sq + 14) == BOOL.FALSE && PieceCol[brd_pieces[sq + 14]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 14, brd_pieces[sq + 14]);
            }

            if (brd_enPas != SQUARES.NO_SQ) {
                if (sq + 12 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq + 14 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }

        pceType = PIECES.wN; // HACK to set for loop other pieces

    } else {
        pceType = PIECES.bP;
        for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pceType, pceNum)];

            if (SQOFFBOARD(sq - 12) == BOOL.FALSE && SQASE(sq - 12) == BOOL.FALSE && PieceCol[brd_pieces[sq - 12]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 12, brd_pieces[sq - 12]);
            }

            if (SQOFFBOARD(sq - 14) == BOOL.FALSE && SQASE(sq - 14) == BOOL.FALSE && PieceCol[brd_pieces[sq - 14]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 14, brd_pieces[sq - 14]);
            }
            if (brd_enPas != SQUARES.NO_SQ) {
                if (sq - 12 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq - 14 == brd_enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }

        pceType = PIECES.bN; // HACK to set for loop other pieces
    }


    pceIndex = LoopSlideIndex[brd_side];
    pce = LoopSlidePce[pceIndex++];
    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumSlide[pce]; ++index) {
                dir = PceDirSlide[pce][index];
                t_sq = sq + dir;

                while (SQOFFBOARD(t_sq) == BOOL.FALSE) {

                    if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                        if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
                            AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[brd_side];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumNonSlide[pce]; ++index) {
                dir = PceDirNonSlide[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq) == BOOL.TRUE) {
                    continue;
                }

                if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                    if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
                        AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
                    }
                    continue;
                }
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    ++GenerateCapturesNum;
}



function Mobility() {
    brd_moveListStart[brd_ply + 1] = brd_moveListStart[brd_ply];
    WhiteMobility = 0;
    BlackMobility = 0;
    var pceType;
    var pceNum;
    var pceIndex;
    var pce;
    var sq;
    var tsq;
    var index;
    
    // White Mobility
    pceIndex = LoopSlideIndex[COLOURS.WHITE];
    pce = LoopSlidePce[pceIndex++];
    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumSlide[pce]; ++index) {
                dir = PceDirSlide[pce][index];
                t_sq = sq + dir;

                while (SQOFFBOARD(t_sq) == BOOL.FALSE) {
                    if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                        if (PieceCol[brd_pieces[t_sq]] == COLOURS.BLACK) {
                            WhiteMobility++;
                            WhiteMobility++;
                        }
                        break;
                    }
                    if (SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) WhiteMobility++;
                    if (SQPERS(sq, t_sq) == BOOL.TRUE && brd_pieces[t_sq] != PIECES.EMPTY) break;
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }
    
    
    pceIndex = LoopNonSlideIndex[COLOURS.WHITE];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumNonSlide[pce]; ++index) {
                dir = PceDirNonSlide[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq) == BOOL.TRUE) {
                    continue;
                }

                if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                    if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
                        WhiteMobility++;
                        WhiteMobility++;
                    }
                    continue;
                }
                if (SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) WhiteMobility++;
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }

    
    // Black Mobility
    pceIndex = LoopSlideIndex[COLOURS.BLACK];
    pce = LoopSlidePce[pceIndex++];
    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumSlide[pce]; ++index) {
                dir = PceDirSlide[pce][index];
                t_sq = sq + dir;

                while (SQOFFBOARD(t_sq) == BOOL.FALSE) {

                    if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                        if (PieceCol[brd_pieces[t_sq]] == COLOURS.WHITE) {
                            BlackMobility++;
                            BlackMobility++;
                        }
                        break;
                    }
                    if (SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) BlackMobility++;
                    if (SQPERS(sq, t_sq) == BOOL.TRUE && brd_pieces[t_sq] != PIECES.EMPTY) break;
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }
    
    pceIndex = LoopNonSlideIndex[COLOURS.BLACK];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce != 0) {

        for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
            sq = brd_pList[PCEINDEX(pce, pceNum)];

            for (index = 0; index < DirNumNonSlide[pce]; ++index) {
                dir = PceDirNonSlide[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq) == BOOL.TRUE) {
                    continue;
                }

                if (brd_pieces[t_sq] != PIECES.EMPTY && SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) {
                    if (PieceCol[brd_pieces[t_sq]] == COLOURS.WHITE) {
                        BlackMobility++;
                        BlackMobility++;
                    }
                    continue;
                }
                if (SQASE(t_sq) == BOOL.FALSE && SQPERS(sq, t_sq) == BOOL.FALSE) BlackMobility++;
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    return WhiteMobility - BlackMobility;
}


// ════════════════════════════════════════════════════
debuglog ("MoveGenerator.js is loaded.")