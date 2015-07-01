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

function ThreeFoldRep() {
	var i = 0, r = 0;
	for (i = 0; i < brd_hisPly; ++i)	{
	    if (brd_history[i].posKey == brd_posKey) {
		    r++;
		}
	}
	return r;
}

function DrawMaterial() {

    if (brd_pceNum[PIECES.wP]!=0 || brd_pceNum[PIECES.bP]!=0) return BOOL.FALSE;
    if (brd_pceNum[PIECES.wQ]!=0 || brd_pceNum[PIECES.bQ]!=0 || brd_pceNum[PIECES.wR]!=0 || brd_pceNum[PIECES.bR]!=0) return BOOL.FALSE;
    if (brd_pceNum[PIECES.wS]!=0 || brd_pceNum[PIECES.bS]!=0 || brd_pceNum[PIECES.wF]!=0 || brd_pceNum[PIECES.bF]!=0) return BOOL.FALSE;
    if (brd_pceNum[PIECES.wB] > 1 || brd_pceNum[PIECES.bB] > 1) {return BOOL.FALSE;}
    if (brd_pceNum[PIECES.wN] > 1 || brd_pceNum[PIECES.bN] > 1) {return BOOL.FALSE;}
    if (brd_pceNum[PIECES.wN]!=0 && brd_pceNum[PIECES.wB]!=0) {return BOOL.FALSE;}
    if (brd_pceNum[PIECES.bN]!=0 && brd_pceNum[PIECES.bB]!=0) {return BOOL.FALSE;}
	
    return BOOL.TRUE;
}

