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

function GetPvLine(depth) {;

	var move = ProbePvTable();
	var count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( MoveExists(move) ) {
			MakeMove(move);
			brd_PvArray[count++] = move;
		} else {
			break;
		}		
		move = ProbePvTable();	
	}
	
	while(brd_ply > 0) {
		TakeMove();
	}
	return count;
	
}

function StorePvMove(move) {

	var index = brd_posKey % PVENTRIES;	
	
	brd_PvTable[index].move = move;
    brd_PvTable[index].posKey = brd_posKey;
}

function ProbePvTable() {

	var index = brd_posKey % PVENTRIES;	
	
	if( brd_PvTable[index].posKey == brd_posKey ) {
		return brd_PvTable[index].move;
	}
	
	return NOMOVE;
}