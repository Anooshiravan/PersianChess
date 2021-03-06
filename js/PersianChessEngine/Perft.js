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
//  Performance tests
// ══════════════════════════

var perft_leafNodes;

function Perft(depth) {
    MakeNullMove();
    if (brd_posKey != GeneratePosKey()) {
        debuglog(printGameLine());
        if (debug) PrintBoard();
        srch_stop = BOOL.TRUE;
        debuglog('Hash Error After Make');
    }

    TakeNullMove();
    if (brd_posKey != GeneratePosKey()) {
        debuglog(printGameLine());
        if (debug) PrintBoard();
        srch_stop = BOOL.TRUE;
        debuglog('Hash Error After Take');
    }

    if (depth == 0) {
        perft_leafNodes++;
        return;
    }

    GenerateMoves();

    var index;
    var move;
    for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

        move = brd_moveList[index];
        if (MakeMove(move) == BOOL.FALSE) {
            continue;
        }
        Perft(depth - 1);
        TakeMove();
    }

    return;
}

function PerftTest(depth) {

    if (debug) PrintBoard();
    debuglog("Starting Test To Depth:" + depth);
    perft_leafNodes = 0;
    GenerateMoves();
    var index;
    var move;
    var moveNum = 0;
    for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

        move = brd_moveList[index];
        if (MakeMove(move) == BOOL.FALSE) {
            continue;
        }
        moveNum++;
        var cumnodes = perft_leafNodes;
        Perft(depth - 1);
        TakeMove();
        var oldnodes = perft_leafNodes - cumnodes;
        debuglog("move:" + moveNum + " " + PrMove(move) + " " + oldnodes);
    }

    // debuglog("Test Complete : " + perft_leafNodes + " leaf nodes visited");
    //   $("#FenOutput").text("Test Complete : " + perft_leafNodes + " leaf nodes visited");

    return;
}

function PerformanceTest() {
    /*
    t1 = performance.now();
    for (run = 0; run < 100000; ++run) {
    	EvaluateSqAttacked();
    }
    t2 = performance.now();
    ms = t2-t1;
    debuglog("Evaluate SqAttacked is run 100.000 times in: " + ms + " miliseconds.")
    */
    t1 = performance.now();
    for (run = 0; run < 100000; ++run) {
        GenerateMoves();
    }
    t2 = performance.now();
    ms = t2 - t1;
    debuglog("MoveGen is run 100.000 times in: " + ms + " miliseconds.");
        /*
        t1 = performance.now();
        for (run = 0; run < 100000; ++run) {
        	AlphaBeta(-INFINITE, INFINITE, 1, BOOL.TRUE);
        }
        t2 = performance.now();
        ms = t2-t1;
        debuglog("AlphaBeta is run 100.000 times in: " + ms + " miliseconds.")
        t1 = performance.now();
        for (run = 0; run < 100000; ++run) {
        	EvalPosition()
        }
        t2 = performance.now();
        ms = t2-t1;
        debuglog("Evaluation is run 100.000 times in: " + ms + " miliseconds.")
	
        t1 = performance.now();
        for (run = 0; run < 100000; ++run) {
        	Mobility();
        }
        t2 = performance.now();
        ms = t2-t1;
        debuglog("Mobility is run 100.000 times in: " + ms + " miliseconds.")
        debuglog (Mobility());
        */

    t1 = performance.now();
    for (run = 0; run < 100000; ++run) {
        SqAttacked(97, COLOURS.WHITE);
    }
    t2 = performance.now();
    ms = t2 - t1;
    debuglog("SqAttacked is run 100.000 times in: " + ms + " miliseconds.");

}

// ════════════════════════════════════════════════════
debuglog("Variants.js is loaded.");
