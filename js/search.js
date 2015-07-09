/*
  _____              _                _____ _                   
 |  __ \            (_)              / ____| |                  
 | |__) |__ _ __ ___ _  __ _ _ __   | |    | |__   ___  ___ ___ 
 |  ___/ _ \ '__/ __| |/ _` | '_ \  | |    | '_ \ / _ \/ __/ __|
 | |  |  __/ |  \__ \ | (_| | | | | | |____| | | |  __/\__ \__ \
 |_|   \___|_|  |___/_|\__,_|_| |_|  \_____|_| |_|\___||___/___/
                                                                
----------------------------------------------------------------
 Persian Chess (www.PersianChess.com)
 Copyright 2014 Anooshiravan Ahmadi - MCE @ Schuberg Philis
 Released under the GPL license
 Based on the open source projects mentioned at:
 http://www.PersianChess.com/Copyright
 Redistribution of this game design, rules and the engine 
 requires written permission from the author.
----------------------------------------------------------------
*/

var srch_nodes;
var srch_fh;
var srch_fhf;
var srch_depth;
var srch_time;
var srch_start;
var srch_stop;
var srch_best;
var srch_thinking;

function CheckUp() {
    if (($.now() - srch_start) > srch_time) srch_stop = BOOL.TRUE;
}

function PickNextMove(moveNum) {

    var index = 0;
    var bestScore = 0;
    var bestNum = moveNum;

    for (index = moveNum; index < brd_moveListStart[brd_ply + 1]; ++index) {
        if (brd_moveScores[index] > bestScore) {
            bestScore = brd_moveScores[index];
            bestNum = index;
        }
    }

    temp = brd_moveList[moveNum];
    brd_moveList[moveNum] = brd_moveList[bestNum];
    brd_moveList[bestNum] = temp;

    temp = brd_moveScores[moveNum];
    brd_moveScores[moveNum] = brd_moveScores[bestNum];
    brd_moveScores[bestNum] = temp;
}

function IsRepetition() {

    var index = 0;

    for (index = brd_hisPly - brd_fiftyMove; index < brd_hisPly - 1; ++index) {
        if (brd_posKey == brd_history[index].posKey) {
            return BOOL.TRUE;
        }
    }
    return BOOL.FALSE;
}

function ClearPvTable() {

    for (index = 0; index < PVENTRIES; index++) {
        brd_PvTable[index].move = NOMOVE;
        brd_PvTable[index].posKey = 0;

    }
}

function ClearForSearch() {

    var index = 0;
    var index2 = 0;

    for (index = 0; index < 18 * BRD_SQ_NUM; ++index) {
        brd_searchHistory[index] = 0;
    }

    for (index = 0; index < 3 * MAXDEPTH; ++index) {
        brd_searchKillers[index] = 0;
    }

    ClearPvTable();

    brd_ply = 0;

    srch_nodes = 0;
    srch_fh = 0;
    srch_fhf = 0;
    srch_start = $.now();
    srch_stop = BOOL.FALSE;
    srch_best = NOMOVE;
}


function Quiescence(alpha, beta) {

    if ((srch_nodes & 2047) == 0) CheckUp();

    srch_nodes++;

    if (IsRepetition() || brd_fiftyMove >= 100) {
        return 0;
    }

    if (brd_ply > MAXDEPTH - 1) {
        return EvalPosition();
    }

    var Score = EvalPosition();

    if (Score >= beta) {
        return beta;
    }

    if (Score > alpha) {
        alpha = Score;
    }

    GenerateCaptures();

    var MoveNum = 0;
    var Legal = 0;
    var OldAlpha = alpha;
    var BestMove = NOMOVE;
    Score = -INFINITE;
    var PvMove = ProbePvTable();

    if (PvMove != NOMOVE) {
        for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
            if (brd_moveList[MoveNum] == PvMove) {
                brd_moveScores[MoveNum].score = 2000000;
                break;
            }
        }
    }

    for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {

        PickNextMove(MoveNum);

        if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
            continue;
        }

        Legal++;
        Score = -Quiescence(-beta, -alpha);
        TakeMove();
        if (srch_stop == BOOL.TRUE) return 0;
        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal == 1) {
                    srch_fhf++;
                }
                srch_fh++;

                return beta;
            }
            alpha = Score;
            BestMove = brd_moveList[MoveNum];
        }
    }

    if (alpha != OldAlpha) {
        StorePvMove(BestMove);
    }

    return alpha;
}

function AlphaBeta(alpha, beta, depth, DoNull) {


    if (depth <= 0) {
        return Quiescence(alpha, beta);
        // return EvalPosition();
    }
    if ((srch_nodes & 2047) == 0) CheckUp();

    srch_nodes++;

    if ((IsRepetition() || brd_fiftyMove >= 100) && brd_ply != 0) {
        return 0;
    }

    if (brd_ply > MAXDEPTH - 1) {
        return EvalPosition();
    }

    var InCheck = SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1);

    if (InCheck == BOOL.TRUE) {
        depth++;
    }

    var Score = -INFINITE;

    if (DoNull == BOOL.TRUE && BOOL.FALSE == InCheck &&
        brd_ply != 0 && (brd_material[brd_side] > 50200) && depth >= 4) {


        var ePStore = brd_enPas;
        if (brd_enPas != SQUARES.NO_SQ) HASH_EP();
        brd_side ^= 1;
        HASH_SIDE();
        brd_enPas = SQUARES.NO_SQ;

        Score = -AlphaBeta(-beta, -beta + 1, depth - 4, BOOL.FALSE);

        brd_side ^= 1;
        HASH_SIDE();
        brd_enPas = ePStore;
        if (brd_enPas != SQUARES.NO_SQ) HASH_EP();

        if (srch_stop == BOOL.TRUE) return 0;
        if (Score >= beta) {
            return beta;
        }
    }

    GenerateMoves();

    var MoveNum = 0;
    var Legal = 0;
    var OldAlpha = alpha;
    var BestMove = NOMOVE;
    Score = -INFINITE;
    var PvMove = ProbePvTable();

    if (PvMove != NOMOVE) {
        for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
            if (brd_moveList[MoveNum] == PvMove) {
                brd_moveScores[MoveNum].score = 2000000;
                break;
            }
        }
    }

    for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {

        PickNextMove(MoveNum);

        if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
            continue;
        }

        Legal++;
        Score = -AlphaBeta(-beta, -alpha, depth - 1, BOOL.TRUE);
        TakeMove();
        if (srch_stop == BOOL.TRUE) return 0;

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal == 1) {
                    srch_fhf++;
                }
                srch_fh++;

                if ((brd_moveList[MoveNum] & MFLAGCAP) == 0) {
                    brd_searchKillers[MAXDEPTH + brd_ply] = brd_searchKillers[brd_ply];
                    brd_searchKillers[brd_ply] = brd_moveList[MoveNum];
                }
                return beta;
            }
            alpha = Score;
            BestMove = brd_moveList[MoveNum];
            if ((BestMove & MFLAGCAP) == 0) {
                brd_searchHistory[brd_pieces[FROMSQ(BestMove)] * BRD_SQ_NUM + TOSQ(BestMove)] += depth;
            }
        }
    }

    if (Legal == 0) {
        if (InCheck) {
            return -MATE + brd_ply;
        } else {
            return 0;
        }
    }

    if (alpha != OldAlpha) {
        StorePvMove(BestMove);
    }

    return alpha;
}

function SearchPosition() {

    var bestMove = NOMOVE;
    var bestScore = -INFINITE;
    var currentDepth = 0;
    var pvNum = 0;
    var line;
    var OLD_MAXDEPTH = MAXDEPTH;
    var old_srch_time = srch_time;

    // Don't think more than 1 second in the first 10 ply
    if (brd_hisPly < 10) {
        MAXDEPTH = 16;
        srch_time = 1000;
    } else {
        MAXDEPTH = 32;
        srch_time = old_srch_time;
    }
    output = 'ENGINE MaxDepth:' + MAXDEPTH + ' MaxTime:' + srch_time + 'ms';
    console.log(output);
    ClearForSearch();

    bestMove = BookMove();

    if (bestMove != NOMOVE) {
        srch_best = bestMove;
        srch_thinking = BOOL.FALSE;
        output += "\r\n - Book move."
        return;
    }


    // iterative deepening
    for (currentDepth = 1; currentDepth <= srch_depth; ++currentDepth) {

        bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, BOOL.TRUE);
        if (srch_stop == BOOL.TRUE) break;
        pvNum = GetPvLine(currentDepth);

        bestMove = brd_PvArray[0];
        line = ("Depth:" + currentDepth + " best:" + PrMoveWithPieces(bestMove) + " Score:" + bestScore + " nodes:" + srch_nodes);

        if (currentDepth != 1) {
            line += (" Ordering:" + ((srch_fhf / srch_fh) * 100).toFixed(2) + "%");
        }
        console.log(line);
    }

    // No move found, start search round 2
    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        console.log("------ Search round 2 -----");
        // Change srch_time and MAXDEPTH
        MAXDEPTH = 7;
        srch_time += 1000;
        bestScore = -INFINITE;
        currentDepth = 0;
        pvNum = 0;
        ClearForSearch();
        for (currentDepth = 1; currentDepth <= srch_depth; ++currentDepth) {
            bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, BOOL.TRUE);
            if (srch_stop == BOOL.TRUE) break;
            pvNum = GetPvLine(currentDepth);
            bestMove = brd_PvArray[0];
            line = ("Depth:" + currentDepth + " best:" + PrMoveWithPieces(bestMove) + " Score:" + bestScore + " nodes:" + srch_nodes);

            if (currentDepth != 1) {
                line += (" Ordering:" + ((srch_fhf / srch_fh) * 100).toFixed(2) + "%");
            }
            console.log(line);
        }
        MAXDEPTH = OLD_MAXDEPTH;
    }

    // No move found, start search round 3
    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        console.log("------ Search round 3 -----");
        // Change srch_time and MAXDEPTH
        MAXDEPTH = 3;
        srch_time += 1000;
        bestScore = -INFINITE;
        currentDepth = 0;
        pvNum = 0;
        ClearForSearch();
        for (currentDepth = 1; currentDepth <= srch_depth; ++currentDepth) {
            bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, BOOL.TRUE);
            if (srch_stop == BOOL.TRUE) break;
            pvNum = GetPvLine(currentDepth);
            bestMove = brd_PvArray[0];
            line = ("Depth:" + currentDepth + " best:" + PrMoveWithPieces(bestMove) + " Score:" + bestScore + " nodes:" + srch_nodes);

            if (currentDepth != 1) {
                line += (" Ordering:" + ((srch_fhf / srch_fh) * 100).toFixed(2) + "%");
            }
            console.log(line);
        }
    }
    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        console.log("------ ENGINE ERROR -----");
        srch_best = NOMOVE;
    } else {
        srch_best = bestMove;
        // $("#GameStatus").text(PrMoveWithPieces(srch_best));
        // addToMoveList(PrMoveWithPieces(bestMove), BoardToFen());

        if (PIECE_NAMES[brd_pieces[TOSQ(srch_best)]] != "EMPTY")
        {
            addNoteToMoveList("[Captures " + PIECE_NAMES[brd_pieces[TOSQ(srch_best)]] + "]");
        }
        if ((srch_best & MFLAGRZ) != 0)
        {
            addNoteToMoveList("[Rendezvous]");
        }
        updateMoveList();
    }
    MAXDEPTH = OLD_MAXDEPTH;
    srch_time = old_srch_time;
    srch_thinking = BOOL.FALSE;
    output += "\r\n- " + line;
}