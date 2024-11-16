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

var perft_leafNodes;

function Perft(depth) { 
	MakeNullMove();
	if(brd_posKey !=  GeneratePosKey())  {
		console.log(printGameLine());
		if (debug) PrintBoard();
		srch_stop = BOOL.TRUE;
		console.log('Hash Error After Make');
	}   
	
	TakeNullMove();
	if(brd_posKey !=  GeneratePosKey())  {
		console.log(printGameLine());
		if (debug) PrintBoard();
		srch_stop = BOOL.TRUE;
		console.log('Hash Error After Take');
	}   

	if(depth == 0) {
        perft_leafNodes++;
        return;
    }	

    GenerateMoves();
    
	var index;
	var move;
	for(index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {
	
		move = brd_moveList[index];	
		if(MakeMove(move) == BOOL.FALSE) {
			continue;
		}		
		Perft(depth-1);
		TakeMove();
	}

    return;
}

function PerftTest(depth) {    

	if (debug) PrintBoard();
	console.log("Starting Test To Depth:" + depth);	
	perft_leafNodes = 0;
	GenerateMoves();
	var index;
	var move;
	var moveNum = 0;
	for(index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {
	
		move = brd_moveList[index];	
		if(MakeMove(move) == BOOL.FALSE) {
			continue;
		}	
		moveNum++;	
        var cumnodes = perft_leafNodes;
		Perft(depth-1);
		TakeMove();
		var oldnodes = perft_leafNodes - cumnodes;
        console.log("move:" + moveNum + " " + PrMove(move) + " " + oldnodes);
	}
    
	// console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");
    //   $("#FenOutput").text("Test Complete : " + perft_leafNodes + " leaf nodes visited");

    return;
}

function PerformanceTest()
{
	/*
	t1 = performance.now();
	for (run = 0; run < 100000; ++run) {
		EvaluateSqAttacked();
	}
	t2 = performance.now();
	ms = t2-t1;
	console.log("Evaluate SqAttacked is run 100.000 times in: " + ms + " miliseconds.")
	*/
	t1 = performance.now();
	for (run = 0; run < 100000; ++run) {
		GenerateMoves();
	}
	t2 = performance.now();
	ms = t2-t1;
	console.log("MoveGen is run 100.000 times in: " + ms + " miliseconds.")
	/*
	t1 = performance.now();
	for (run = 0; run < 100000; ++run) {
		AlphaBeta(-INFINITE, INFINITE, 1, BOOL.TRUE)
	}
	t2 = performance.now();
	ms = t2-t1;
	console.log("AlphaBeta is run 100.000 times in: " + ms + " miliseconds.")
	t1 = performance.now();
	for (run = 0; run < 100000; ++run) {
		EvalPosition()
	}
	t2 = performance.now();
	ms = t2-t1;
	console.log("Evaluation is run 100.000 times in: " + ms + " miliseconds.")
	
	t1 = performance.now();
	for (run = 0; run < 100000; ++run) {
		Mobility();
	}
	t2 = performance.now();
	ms = t2-t1;
	console.log("Mobility is run 100.000 times in: " + ms + " miliseconds.")
	console.log (Mobility());
	*/
	
	t1 = performance.now();
	for (run = 0; run < 100000; ++run) {
		SqAttacked(97, COLOURS.WHITE);
	}
	t2 = performance.now();
	ms = t2-t1;
	console.log("SqAttacked is run 100.000 times in: " + ms + " miliseconds.")
	
}
