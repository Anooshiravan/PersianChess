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
//  Draw Protocols
// ══════════════════════════


function ThreeFoldRep() {
	var i = 0, r = 0;
	for (i = 0; i < brd_hisPly; ++i)	{
	    if (brd_history[i].posKey == brd_posKey) {
		    r++;
		}
	}
	return r;
}

function CitadelDraw() {
    if (brd_pieces[SQUARES.A11] == PIECES.wK || brd_pieces[SQUARES.K11] == PIECES.wK) return BOOL.TRUE;
    if (brd_pieces[SQUARES.A1] == PIECES.bK || brd_pieces[SQUARES.K1] == PIECES.bK) return BOOL.TRUE;
    return BOOL.FALSE;
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

function CapturedPieces()
{
    var cwP = 9 - brd_pceNum[PIECES.wP];
    var cwN = 2 - brd_pceNum[PIECES.wN];
    var cwB = 2 - brd_pceNum[PIECES.wB];
    var cwR = 2 - brd_pceNum[PIECES.wR];
    var cwS = 1 - brd_pceNum[PIECES.wS];
    var cwF = 2 - brd_pceNum[PIECES.wF];
    var cwQ = 1 - brd_pceNum[PIECES.wQ];
    var cbP = 9 - brd_pceNum[PIECES.bP];
    var cbN = 2 - brd_pceNum[PIECES.bN];
    var cbB = 2 - brd_pceNum[PIECES.bB];
    var cbR = 2 - brd_pceNum[PIECES.bR];
    var cbS = 1 - brd_pceNum[PIECES.bS];
    var cbF = 2 - brd_pceNum[PIECES.bF];
    var cbQ = 1 - brd_pceNum[PIECES.bQ];
    var white_captured_pieces = "White P["+ cwP + "]N[" + cwN + "]B[" + cwB + "]R[" + cwR + "]S[" + cwS + "]F[" + cwF + "]Q[" + cwQ + "]";
    var black_captured_pieces = "Black p["+ cbP + "]n[" + cbN + "]b[" + cbB + "]r[" + cbR + "]s[" + cbS + "]f[" + cbF + "]q[" + cbQ + "]";

    var is_piece_captured = cwP + cwN + cwB + cwR + cwS + cwF + cwQ + cbP + cbN + cbB + cbR + cbS + cbF + cbQ;

    if (is_piece_captured > 0)
    {
        return "Captured Pieces: \r\n" + white_captured_pieces + "\r\n" + black_captured_pieces;
    }
    else
    {
        return "";
    }
}



// ════════════════════════════════════════════════════
debuglog ("Protocol.js is loaded.")

