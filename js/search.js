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
 http://www.PersianChess.com/About
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

var Qcalled = 0;
var ABcalled = 0;


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
    
    for (index = 0; index < 22 * BRD_SQ_NUM; ++index) {
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
    
    // Debug and performance
    GenerateCapturesNum = 0;
    GenerateMovesNum = 0;
    Qcalled = 0;
    ABcalled = 0;
    gen_m = 0;
    er_0 = 0;
    er_1 = 0;
    er_2 = 0;
    er_3 = 0;
    er_4 = 0;
    er_5 = 0;
    er_6 = 0;
    er_7 = 0;
    er_8 = 0;
    er_9 = 0;
}


function Quiescence(alpha, beta) {

    if ((srch_nodes & 20470) == 0) CheckUp();

    srch_nodes++;
    Qcalled++;

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
        // if (variant == "Oriental") return EvalPosition();
        return Quiescence(alpha, beta);
    }
    if ((srch_nodes & 20470) == 0) CheckUp();

    srch_nodes++;
    ABcalled++;

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
        // console.log ("AA: Pv move stored: " + PrMove(BestMove) + "in depth:" + currentDepth);
    }

    return alpha;
}


function SearchPosition() {
    var bestMove = NOMOVE;
    var bestScore = -INFINITE;
    var currentDepth = 0;
    var pvNum = 0;
    var line;
        
    output = '\r\n---------------------\r\nENGINE MaxTime:' + srch_time + 'ms';
    console.log(output);
    ClearForSearch();

    bestMove = BookMove();

    if (bestMove != NOMOVE) {
        srch_best = bestMove;
        srch_thinking = BOOL.FALSE;
        output += "\r\n - Book move."
        if (vs_engine == true) postMove(bestMove);
        return;
    }


    // iterative deepening
    for (currentDepth = 1; currentDepth <= srch_depth; ++currentDepth) {

        bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, BOOL.TRUE);
        if (srch_stop == BOOL.TRUE) break;
        pvNum = GetPvLine(currentDepth);

        bestMove = brd_PvArray[0];
        line = ("Depth:" + currentDepth + ": " + PrMoveWithPieces(bestMove) + " Score:" + bestScore + " Nodes:" + srch_nodes);

        if (currentDepth != 1) {
            line += (" Ordering:" + ((srch_fhf / srch_fh) * 100).toFixed(2) + "%");
        }

        // Print PV line
        var pvline = ("- Line: ");
            for (i = 0; i < brd_PvArray.length; i++) { 
            if (brd_PvArray[i] != undefined) pvline += " " + PrMove(brd_PvArray[i]);
        }
        console.log(line);
        console.log (pvline);
    }

    // There is an error, move the best move in depth 1
    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        ClearForSearch();
        bestScore = AlphaBeta(-INFINITE, INFINITE, 1, BOOL.TRUE);
        pvNum = GetPvLine(1);
        bestMove = brd_PvArray[0];
        line = ("Depth:1: " + PrMoveWithPieces(bestMove) + " Score:" + bestScore + " Nodes:" + srch_nodes);
    }

    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        line = "\r\n\r\n------ ENGINE ERROR -----\r\nEngine is crashed! Game is stopped.";
        console.log("------ ENGINE ERROR -----");
        srch_best = NOMOVE;
    } else {
        srch_best = bestMove;

        if (PIECE_NAMES[brd_pieces[TOSQ(srch_best)]] != "EMPTY")
        {
            if ((srch_best & MFLAGRZ) == 0) PlaySound(capture);
            addNoteToMoveList("[Captures " + PIECE_NAMES[brd_pieces[TOSQ(srch_best)]] + "]");
        }
        if ((srch_best & MFLAGRZ) != 0)
        {
            addNoteToMoveList("[Rendezvous]");
        }
        updateMoveList();
    }
    srch_thinking = BOOL.FALSE;
    if (vs_engine == true) postMove(bestMove);
    output += "\r\n" + line;
    
    ShowErrorMoves();
    ShowPerformance();
}

function ShowPerformance()
{
    console.log ("-------- Performance Counters ----------");
    console.log ("Total nodes: " + srch_nodes);
    console.log ("Quiescence: " + Qcalled);
    console.log ("Capture Gen: " + GenerateCapturesNum);
    console.log ("AlphaBeta: " + ABcalled);
    console.log ("Move Gen: " + GenerateMovesNum);
}