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
//  Search
// ══════════════════════════

var srch_nodes;
var srch_fh;
var srch_fhf;
var srch_depth;
var srch_time;
var srch_start;
var srch_stop;
var srch_best;
var srch_thinking;

var engine_recovery = true;

var Qcalled = 0;
var ABcalled = 0;


function CheckUp() {
    if (((new Date).getTime() - srch_start) > srch_time) srch_stop = BOOL.TRUE;
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
    srch_start = (new Date).getTime();
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

    Qcalled++;

    if ((srch_nodes & 8192) == 0) CheckUp();

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

    ABcalled++;

    if (depth <= 0) {
        return Quiescence(alpha, beta);
    }

    if ((srch_nodes & 8192) == 0) CheckUp();

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
    var iterativeDepth = srch_depth;
    ClearForSearch();

    // Book move
    bestMove = BookMove();
    if (bestMove != NOMOVE) {
        srch_best = bestMove;
        srch_thinking = BOOL.FALSE;
        var console_msg = "Book move: " + PrMove(bestMove);
        SendMessageToGui("console", console_msg);
        SendBestMove(bestMove);
        return;
    }

    // Start search
    var srch_start_msg;
    if (srch_time != 2147483647) srch_start_msg =  "Engine time: " + srch_time / 1000 + " seconds";
    else srch_start_msg = "Engine depth: " + srch_depth;
    debuglog (srch_start_msg);
    SendMessageToGui("console", "———————————————————");
    SendMessageToGui("console", srch_start_msg);
    
    // Iterative deepening in max-depth
    bestMove = IterativeDeepening(srch_depth);

    // Fail safe level one, search in depth 3
    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        if (GameController.GameOver == BOOL.FALSE)
        {
            SendMessageToGui("console", "> Fail safe L1, Depth 3");
            engine_error_L1++;
            FailSafeResetBoard("L1");
            bestMove = IterativeDeepening(3);
        }
    }

    // Fail safe level two, reset everything and search in depth 1 (just a good legal move)
    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        if (GameController.GameOver == BOOL.FALSE)
        {
            SendMessageToGui("console", "> Fail safe L2: Depth 1");
            engine_error_L2++;
            FailSafeResetBoard("L2");
            bestMove = IterativeDeepening(1);

            // Engine is creashed and recovered, send report
            ReportEngineError();
        }
    }

    if (bestMove == NOMOVE || bestMove == undefined || SanityCheck(bestMove) == BOOL.FALSE) {
        if (GameController.GameOver == BOOL.FALSE)
        {
            SendMessageToGui("init", "engine_error");
            return;
        }
    }
    else 
    {
        // There is no engine error or errors are recovered, continue.
        srch_best = bestMove;
        SendBestMove(bestMove);
    }
    srch_thinking = BOOL.FALSE;
    ShowErrorMoves();
    ShowPerformance();
}

function FailSafeResetBoard(level)
{
    // Backup board
    fen = BoardToFen();
    var brd_hisPly_bak = brd_hisPly;
    var brd_history_bak = brd_history;
    var brd_history_notes_bak = brd_history_notes;

    // Reset all
    init_engine();
    ResetBoard();
    ClearForSearch();

    switch(level) {
        case "L1":
            // Restore board
            ParseFen(fen);
            brd_hisPly = brd_hisPly_bak;
            brd_history = brd_history_bak;
            brd_history_notes = brd_history_notes_bak;
            break;

        case "L2":
            // Only restore fen
            ParseFen(fen);
            break;
        
        default:
            break
    }
}


function IterativeDeepening(id_depth)
{
    var bestMove = NOMOVE;
    var bestScore = -INFINITE;
    var pvNum = 0;
    var line;
    var currentDepth = 0;

    for (currentDepth = 1; currentDepth <= id_depth; ++currentDepth) {

        bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, BOOL.TRUE);
        
        if (srch_stop == BOOL.TRUE && currentDepth > 1) break; // Do not break the search until depth 1 is complete
        pvNum = GetPvLine(currentDepth);

        bestMove = brd_PvArray[0];
        line = ("Depth:" + currentDepth + ": " + PrMoveWithPieces(bestMove) + " Score:" + bestScore + " Nodes:" + srch_nodes);

        if (currentDepth != 1) {
            line += (" Ordering:" + ((srch_fhf / srch_fh) * 100).toFixed(2) + "%");
        }

        // Print PV line
        var pvline = ("Depth " + currentDepth + ": ");
            for (i = 0; i < currentDepth; i++) { 
            if (brd_PvArray[i] != undefined) pvline += " " + PrMove(brd_PvArray[i]);
        }
        debuglog (line);
        SendMessageToGui("console", pvline);
    }
    return bestMove;
}


function ShowPerformance()
{
    debuglog ("-------- Performance Counters ----------");
    debuglog ("AlphaBeta: " + ABcalled);
    debuglog ("Quiescence: " + Qcalled);
    debuglog ("MoveGen: " + GenerateMovesNum);
    debuglog ("CapGen: " + GenerateCapturesNum);
    debuglog ("Node: " + srch_nodes);
    debuglog ("MOVE: " + gen_m);
}


// ════════════════════════════════════════════════════
debuglog ("Search.js is loaded.")