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

function ClearPiece(sq) {	
	
    var pce = brd_pieces[sq];	
	var col = PieceCol[pce];
	var index = 0;
	var t_pceNum = -1;
	
    HASH_PCE(pce,sq);
	
	brd_pieces[sq] = PIECES.EMPTY;
    brd_material[col] -= PieceVal[pce];
	
	for(index = 0; index < brd_pceNum[pce]; ++index) {
		if(brd_pList[PCEINDEX(pce,index)] == sq) {
			t_pceNum = index;
			break;
		}
	}
	
	brd_pceNum[pce]--;		
	brd_pList[PCEINDEX(pce,t_pceNum)] = brd_pList[PCEINDEX(pce,brd_pceNum[pce])];
  
}

function AddPiece(sq, pce) {   
	
	var col = PieceCol[pce];

    HASH_PCE(pce,sq);
	
	brd_pieces[sq] = pce; 

	brd_material[col] += PieceVal[pce];
	brd_pList[PCEINDEX(pce,brd_pceNum[pce])] = sq;
	brd_pceNum[pce]++;
}

function MovePiece(from, to) {   
	
	var index = 0;
	var pce = brd_pieces[from];	
	var col = PieceCol[pce];	

	HASH_PCE(pce,from);
	brd_pieces[from] = PIECES.EMPTY;
	
	HASH_PCE(pce,to);
	brd_pieces[to] = pce;	
	
	for(index = 0; index < brd_pceNum[pce]; ++index) {
		if(brd_pList[PCEINDEX(pce,index)] == from) {
			brd_pList[PCEINDEX(pce,index)] = to;
			break;
		}
	}
	
}

function MakeMove(move) {
    
	var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = brd_side;	
	
	brd_history[brd_hisPly].posKey = brd_posKey;
	
	if( (move & MFLAGEP) != 0) {
        if(side == COLOURS.WHITE) {
            ClearPiece(to-13);
        } else {
            ClearPiece(to+13);
        }
    } else if ( (move & MFLAGCA) != 0) {
        switch(to) {
            case SQUARES.D2:
                MovePiece(SQUARES.B2, SQUARES.E2);
			break;
            case SQUARES.D10:
                MovePiece(SQUARES.B10, SQUARES.E10);
			break;
            case SQUARES.I2:
                MovePiece(SQUARES.J2, SQUARES.H2);
			break;
            case SQUARES.I10:
                MovePiece(SQUARES.J10, SQUARES.H10);
			break;
            default: break;
        }
    }	
    // Rendezvous
    else if ( (move & MFLAGRZ) != 0) {
        switch(to) {
            case SQUARES.H2:
                ClearPiece(SQUARES.G2);
                AddPiece(SQUARES.G2, PIECES.wB);
                ClearPiece(SQUARES.H2);
                if (variant == "Orbital")
                {
                    AddPiece(SQUARES.H2, PIECES.wC);
                }
                else
                {
                    AddPiece(SQUARES.H2, PIECES.wS);
                }
			break;
            case SQUARES.H10:
                ClearPiece(SQUARES.G10);
                AddPiece(SQUARES.G10, PIECES.bB);
                ClearPiece(SQUARES.H10);
                if (variant == "Orbital")
                {
                    AddPiece(SQUARES.H10, PIECES.bC);
                }
                else
                {
                    AddPiece(SQUARES.H10, PIECES.bS);
                }
			break;
            default: break;
        }
    }	
	
	if(brd_enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
	
	brd_history[brd_hisPly].move = move;
    brd_history[brd_hisPly].fiftyMove = brd_fiftyMove;
    brd_history[brd_hisPly].enPas = brd_enPas;
    brd_history[brd_hisPly].castlePerm = brd_castlePerm;

    brd_castlePerm &= CastlePerm[from];
    brd_castlePerm &= CastlePerm[to];
    brd_enPas = SQUARES.NO_SQ;

	HASH_CA();
	
	var captured = CAPTURED(move);
    brd_fiftyMove++;
	
	if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        brd_fiftyMove = 0;
    }
	
	brd_hisPly++;
	brd_ply++;
	
	if(PiecePawn[brd_pieces[from]] == BOOL.TRUE) {
        brd_fiftyMove = 0;
        if( (move & MFLAGPS) != 0) {
            if(side==COLOURS.WHITE) {
                brd_enPas=from+13;
            } else {
                brd_enPas=from-13;
            }
            HASH_EP();
        }
    }
	
	if ( (move & MFLAGRZ) == 0) MovePiece(from, to);
	
	var prPce = PROMOTED(move);
    if(prPce != PIECES.EMPTY)   {       
        ClearPiece(to);
        AddPiece(to, prPce);
    }
		
	brd_side ^= 1;
    HASH_SIDE();
	
	
	if(SqAttacked(brd_pList[PCEINDEX(Kings[side],0)], brd_side))  {
        TakeMove();
        return BOOL.FALSE;
    }
	return BOOL.TRUE;	
}


function TakeMove() {		
	
	brd_hisPly--;
    brd_ply--;
	
    var move = brd_history[brd_hisPly].move;
    var from = FROMSQ(move);
    var to = TOSQ(move);	
	
	if(brd_enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    brd_castlePerm = brd_history[brd_hisPly].castlePerm;
    brd_fiftyMove = brd_history[brd_hisPly].fiftyMove;
    brd_enPas = brd_history[brd_hisPly].enPas;

    if(brd_enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    brd_side ^= 1;
    HASH_SIDE();
	
	if( (MFLAGEP & move) != 0) {
        if(brd_side == COLOURS.WHITE) {
            AddPiece(to-13, PIECES.bP);
        } else {
            AddPiece(to+13, PIECES.wP);
        }
    } else if( (MFLAGCA & move) != 0) {
        switch(to) {
            case SQUARES.D2: MovePiece(SQUARES.E2, SQUARES.B2); break;
            case SQUARES.D10: MovePiece(SQUARES.E10, SQUARES.B10); break;
            case SQUARES.I2: MovePiece(SQUARES.H2, SQUARES.J2); break;
            case SQUARES.I10: MovePiece(SQUARES.H10, SQUARES.J10); break;
            default: break;
        }
    }
    
    // Rendezvous
    else if ( (move & MFLAGRZ) != 0) {
        switch(to) {
            case SQUARES.H2:
                ClearPiece(SQUARES.G2);
                if (variant == "Orbital")
                {
                    AddPiece(SQUARES.G2, PIECES.wC);
                }
                else
                {
                    AddPiece(SQUARES.G2, PIECES.wS);
                }
                
                ClearPiece(SQUARES.H2);
                AddPiece(SQUARES.H2, PIECES.wB);
                break;
            case SQUARES.H10:
                ClearPiece(SQUARES.G10);
                if (variant == "Orbital")
                {
                    AddPiece(SQUARES.G10, PIECES.bC);
                }
                else
                {
                    AddPiece(SQUARES.G10, PIECES.bS);
                }
                ClearPiece(SQUARES.H10);
                AddPiece(SQUARES.H10, PIECES.bB);
			break;
            default: break;
        }
    }	
	
	if ( (move & MFLAGRZ) == 0) MovePiece(to, from);
	
	var captured = CAPTURED(move);
    if(captured != PIECES.EMPTY) {      
        AddPiece(to, captured);
    }
	
	if(PROMOTED(move) != PIECES.EMPTY)   {        
        ClearPiece(from);
        AddPiece(from, (PieceCol[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
}



                
