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

var RookOpenFile = 10;
var RookSemiOpenFile = 5;
var QueenOpenFile = 5;
var QueenSemiOpenFile = 3;
var BishopPair = 30;
var LightSquareBishop = 60;

var PawnRanksWhite = new Array(10);
var PawnRanksBlack = new Array(10);

var PawnIsolated = -10;
var PawnPassed = [ 0, 5, 10, 20, 35, 60, 100, 200, 300 ]; 

var PawnTable = [
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
0	,	5	,	10	,	0	,	-10	,	-10	,	-10	,	0	,	10	,	5	,	0	,
0	,	15	,	0	,	0	,	5	,	5	,	5	,	0	,	0	,	15	,	0	,
0	,	0	,	0	,	10	,	20	,	20	,	20	,	10	,	0	,	0	,	0	,
0	,	5	,	5	,	5	,	30	,	30	,	30	,	5	,	5	,	5	,	0	,
0	,	5	,	5	,	5	,	10	,	30	,	10	,	5	,	5	,	5	,	0	,
0	,	10	,	10	,	10	,	20	,	20	,	20	,	10	,	10	,	10	,	0	,
0	,	20	,	20	,	20	,	30	,	30	,	30	,	20	,	20	,	20	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];

var KnightTable = [

-15	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	-15	, 
0	,	0	,	-10	,	0	,	0	,	0	,	0	,	0	,	-10	,	0	,	0	,
0	,	0	,	0	,	0	,	5	,	5	,	5	,	0	,	0	,	0	,	0	,
0	,	0	,	0	,	10	,	10	,	10	,	10	,	10	,	0	,	0	,	0	,
0	,	0	,	0	,	10	,	35	,	20	,	35	,	10	,	5	,	0	,	0	,
0	,	5	,	10	,	15	,	20	,	20	,	20	,	15	,	10	,	5	,	0	,
0	,	5	,	10	,	15	,	35	,	20	,	35	,	15	,	10	,	5	,	0	,
0	,	5	,	10	,	10	,	20	,	20	,	20	,	10	,	10	,	5	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0		
];

var WizardChampionTable = [
-10 ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   , -10   , 
0   ,   0   ,   10  ,   -10 ,   0   ,   0   ,   0   ,   -10 ,   10  ,   0   ,   0   ,
0   ,   15  ,   0   ,   0   ,   10  ,   10  ,   10  ,   0   ,   0   ,   15  ,   0   ,
0   ,   0   ,   0   ,   10  ,   15  ,   15  ,   15  ,   10  ,   0   ,   0   ,   0   ,
0   ,   0   ,   10  ,   15  ,   20  ,   20  ,   20  ,   15  ,   10  ,   0   ,   0   ,
0   ,   0   ,   10  ,   15  ,   20  ,   20  ,   20  ,   15  ,   10  ,   0   ,   0   ,
0   ,   0   ,   10  ,   15  ,   20  ,   20  ,   20  ,   15  ,   10  ,   0   ,   0   ,
0   ,   0   ,   0   ,   10  ,   15  ,   15  ,   15  ,   10  ,   0   ,   0   ,   0   ,
0   ,   0   ,   0   ,   0   ,   10  ,   10  ,   10  ,   0   ,   0   ,   0   ,   0   ,
0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   , 
0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   
];

var BishopTable = [
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
0	,	0	,	0	,	-10	,	0	,	0	,	0	,	-10	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	10	,	10	,	10	,	0	,	0	,	0	,	0	,
0	,	0	,	0	,	10	,	15	,	15	,	15	,	10	,	0	,	0	,	0	,
0	,	0	,	10	,	15	,	20	,	20	,	20	,	15	,	10	,	0	,	0	,
0	,	0	,	10	,	15	,	20	,	20	,	20	,	15	,	10	,	0	,	0	,
0	,	0	,	10	,	15	,	20	,	20	,	20	,	15	,	10	,	0	,	0	,
0	,	0	,	0	,	10	,	15	,	15	,	15	,	10	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	10	,	10	,	10	,	0	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];

var RookTable = [
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
0	,	0	,	5	,	5	,	10	,	10	,	10	,	5	,	5	,	0	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
];

var PrincessTable = [
0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   , 
0   ,   0   ,   0   ,   -10 ,   0   ,   0   ,   0   ,   -10 ,   0   ,   0   ,   0   ,
0   ,   0   ,   0   ,   0   ,   10  ,   10  ,   10  ,   0   ,   0   ,   0   ,   0   ,
0   ,   0   ,   0   ,   10  ,   15  ,   15  ,   15  ,   10  ,   0   ,   0   ,   0   ,
0   ,   0   ,   10  ,   15  ,   30  ,   20  ,   30  ,   15  ,   10  ,   0   ,   0   ,
0   ,   0   ,   10  ,   15  ,   20  ,   40  ,   20  ,   15  ,   10  ,   0   ,   0   ,
0   ,   0   ,   10  ,   15  ,   30  ,   20  ,   30  ,   15  ,   10  ,   0   ,   0   ,
0   ,   0   ,   0   ,   10  ,   15  ,   15  ,   15  ,   10  ,   0   ,   0   ,   0   ,
0   ,   0   ,   0   ,   0   ,   10  ,   10  ,   10  ,   0   ,   0   ,   0   ,   0   ,
0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   , 
0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   ,   0   
];


var FortressTable = [
-10	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	-10	, 
0	,	0	,	10	,	5	,	10	,	10	,	10	,	5	,	10	,	0	,	0	,
0	,	15	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	15	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	5	,	10	,	15	,	20	,	15	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	15	,	20	,	15	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	15	,	20	,	15	,	10	,	5	,	0	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,	0	,
0	,	0	,	0	,	5	,	10	,	10	,	10	,	5	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	, 
];

var KingE = [	
	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
    0	,	-50	,	-10	,	0	,	0	,	0	,	0	,	0	,	-10	,	-50	,	0	,
	0	,	-10,	0	,	10	,	10	,	10	,	10	,	10	,	0	,	-10	,	0	,
	0	,	0	,	10	,	20	,	20	,	30	,	20	,	20	,	10	,	0	,	0	,
	0	,	0	,	10	,	20	,	40	,	50	,	40	,	20	,	10	,	0	,	0	,
	0	,	0	,	10	,	20	,	40	,	0	,	40	,	20	,	10	,	0	,	0	,	
    0	,	0	,	10	,	20	,	40	,	50	,	40	,	20	,	10	,	0	,	0	,
	0	,	0	,	10	,	20	,	20	,	30	,	20	,	20	,	10	,	0	,	0	,
	0	,	-10,	0	,	10	,	10	,	10	,	10	,	10	,	0	,	-10	,	0	,
	0	,	-50	,	-10	,	0	,	0	,	0	,	0	,	0	,	-10	,	-50	,	0	,
	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0
];

var KingO = [	
	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	
    0	,	0	,	5	,	5	,	-10	,	-10	,	-10	,	0	,	10	,	5	,	0	,
	0	,	-30	,	-30	,	-30	,	-30	,	-30	,	-30	,	-30	,	-30	,	-30	,	0	,
	0	,	-50	,	-50	,	-50	,	-50	,	-50	,	-50	,	-50	,	-50	,	-50	,	0	,
	0	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	0	,
	0	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	0	,
	0	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	0	,
	0	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	0	,
	0	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	0	,
	0	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	-70	,	0	,
	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,	0
];


/*
function MaterialDraw() {

    if (0 == brd_pceNum[PIECES.wR] && 0 == brd_pceNum[PIECES.bR] && 0 == brd_pceNum[PIECES.wS] && 0 == brd_pceNum[PIECES.bS] && 0 == brd_pceNum[PIECES.wF] && 0 == brd_pceNum[PIECES.bF] && 0 == brd_pceNum[PIECES.wQ] && 0 == brd_pceNum[PIECES.bQ]) 
    {

        if (0 == brd_pceNum[PIECES.bB] && 0 == brd_pceNum[PIECES.wB]) {
            if (brd_pceNum[PIECES.wN] < 3 && brd_pceNum[PIECES.bN] < 3) {
                return BOOL.TRUE;
            }
        } else if (0 == brd_pceNum[PIECES.wN] && 0 == brd_pceNum[PIECES.bN]) {
            if (Math.abs(brd_pceNum[PIECES.wB] - brd_pceNum[PIECES.bB]) < 2) {
                return BOOL.TRUE;
            }
        } else if ((brd_pceNum[PIECES.wN] < 3 && 0 == brd_pceNum[PIECES.wB]) || (brd_pceNum[PIECES.wB] == 1 && 0 == brd_pceNum[PIECES.wN])) {
            if ((brd_pceNum[PIECES.bN] < 3 && 0 == brd_pceNum[PIECES.bB]) || (brd_pceNum[PIECES.bB] == 1 && 0 == brd_pceNum[PIECES.bN])) {
                return BOOL.TRUE;
            }
        }
    } 
    else if (0 == brd_pceNum[PIECES.wQ] && 0 == brd_pceNum[PIECES.bQ]) 
    {
        if (brd_pceNum[PIECES.wR] == 1 && brd_pceNum[PIECES.bR] == 1) {
            if ((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB]) < 2 && (brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB]) < 2) {
                return BOOL.TRUE;
            }
        } else if (brd_pceNum[PIECES.wR] == 1 && 0 == brd_pceNum[PIECES.bR]) {
            if ((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB] == 0) && (((brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB]) == 1) || ((brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB]) == 2))) {
                return BOOL.TRUE;
            }
        } else if (brd_pceNum[PIECES.bR] == 1 && 0 == brd_pceNum[PIECES.wR]) {
            if ((brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB] == 0) && (((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB]) == 1) || ((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB]) == 2))) {
                return BOOL.TRUE;
            }
        }
    }
    return BOOL.FALSE;
}

*/

var ENDGAME_MAT = 1 * PieceVal[PIECES.wR] + 2 * PieceVal[PIECES.wN] + 2 * PieceVal[PIECES.wP] + PieceVal[PIECES.wK];

function PawnsInit() {
    var index = 0;

    for (index = 0; index < 10; ++index) {
        PawnRanksWhite[index] = RANKS.RANK_8;
        PawnRanksBlack[index] = RANKS.RANK_1;
    }

    pce = PIECES.wP;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        if (RanksBrd[sq] < PawnRanksWhite[FilesBrd[sq] + 1]) {
            PawnRanksWhite[FilesBrd[sq] + 1] = RanksBrd[sq];
        }
    }

    pce = PIECES.bP;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        if (RanksBrd[sq] > PawnRanksBlack[FilesBrd[sq] + 1]) {
            PawnRanksBlack[FilesBrd[sq] + 1] = RanksBrd[sq];
        }
    }
}

function EvalPosition() {

    var pce;
    var pceNum;
    var sq;
    var score = brd_material[COLOURS.WHITE] - brd_material[COLOURS.BLACK];
    var file;
    var rank;
    
    // TODO: Fix checking the material draw in evaluation
    // if (0 == brd_pceNum[PIECES.wP] && 0 == brd_pceNum[PIECES.bP] && MaterialDraw() == BOOL.TRUE) {
    //    return 0;
    // }

    PawnsInit();

    pce = PIECES.wP;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += PawnTable[SQ121(sq)];
        file = FilesBrd[sq] + 1;
        rank = RanksBrd[sq];
        if (PawnRanksWhite[file - 1] == RANKS.RANK_8 && PawnRanksWhite[file + 1] == RANKS.RANK_8) {
            score += PawnIsolated;
        }

        if (PawnRanksBlack[file - 1] <= rank && PawnRanksBlack[file] <= rank && PawnRanksBlack[file + 1] <= rank) {
            score += PawnPassed[rank];
        }
    }

    pce = PIECES.bP;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= PawnTable[MIRROR121(SQ121(sq))];
        file = FilesBrd[sq] + 1;
        rank = RanksBrd[sq];
        if (PawnRanksBlack[file - 1] == RANKS.RANK_1 && PawnRanksBlack[file + 1] == RANKS.RANK_1) {
            score -= PawnIsolated;
        }

        if (PawnRanksWhite[file - 1] >= rank && PawnRanksWhite[file] >= rank && PawnRanksWhite[file + 1] >= rank) {
            score -= PawnPassed[7 - rank];
        }
    }

    pce = PIECES.wN;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += KnightTable[SQ121(sq)];
    }

    pce = PIECES.bN;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= KnightTable[MIRROR121(SQ121(sq))];
    }

    pce = PIECES.wW;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += WizardChampionTable[SQ121(sq)];
    }

    pce = PIECES.bW;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= WizardChampionTable[MIRROR121(SQ121(sq))];
    }

    pce = PIECES.wC;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += WizardChampionTable[SQ121(sq)];
    }

    pce = PIECES.bC;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= WizardChampionTable[MIRROR121(SQ121(sq))];
    }

    pce = PIECES.wB;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += BishopTable[SQ121(sq)];
    }

    pce = PIECES.bB;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= BishopTable[MIRROR121(SQ121(sq))];
    }

    pce = PIECES.wR;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += RookTable[SQ121(sq)];
        file = FilesBrd[sq] + 1;
        if (PawnRanksWhite[file] == RANKS.RANK_8) {
            if (PawnRanksBlack[file] == RANKS.RANK_1) {
                score += RookOpenFile;
            } else {
                score += RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.bR;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= RookTable[MIRROR121(SQ121(sq))];
        file = FilesBrd[sq] + 1;
        if (PawnRanksBlack[file] == RANKS.RANK_1) {
            if (PawnRanksWhite[file] == RANKS.RANK_8) {
                score -= RookOpenFile;
            } else {
                score -= RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.wS;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += PrincessTable[SQ121(sq)];
    }

    pce = PIECES.bS;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= PrincessTable[MIRROR121(SQ121(sq))];
    }

    pce = PIECES.wF;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += FortressTable[SQ121(sq)];
        file = FilesBrd[sq] + 1;
        if (PawnRanksWhite[file] == RANKS.RANK_8) {
            if (PawnRanksBlack[file] == RANKS.RANK_1) {
                score += RookOpenFile;
            } else {
                score += RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.bF;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= FortressTable[MIRROR121(SQ121(sq))];
        file = FilesBrd[sq] + 1;
        if (PawnRanksBlack[file] == RANKS.RANK_1) {
            if (PawnRanksWhite[file] == RANKS.RANK_8) {
                score -= RookOpenFile;
            } else {
                score -= RookSemiOpenFile;
            }
        }
    }

    pce = PIECES.wQ;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score += RookTable[SQ121(sq)];
        file = FilesBrd[sq] + 1;
        if (PawnRanksWhite[file] == RANKS.RANK_8) {
            if (PawnRanksBlack[file] == RANKS.RANK_1) {
                score += QueenOpenFile;
            } else {
                score += QueenSemiOpenFile;
            }
        }
    }

    pce = PIECES.bQ;
    for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
        sq = brd_pList[PCEINDEX(pce, pceNum)];
        score -= RookTable[MIRROR121(SQ121(sq))];
        file = FilesBrd[sq] + 1;
        if (PawnRanksBlack[file] == RANKS.RANK_1) {
            if (PawnRanksWhite[file] == RANKS.RANK_8) {
                score -= QueenOpenFile;
            } else {
                score -= QueenSemiOpenFile;
            }
        }
    }

    pce = PIECES.wK;
    sq = brd_pList[PCEINDEX(pce, 0)];

    if ((brd_material[COLOURS.BLACK] <= ENDGAME_MAT)) {
        score += KingE[SQ121(sq)];
    } else {
        score += KingO[SQ121(sq)];
    }

    pce = PIECES.bK;
    sq = brd_pList[PCEINDEX(pce, 0)];

    if ((brd_material[COLOURS.WHITE] <= ENDGAME_MAT)) {
        score -= KingE[MIRROR121(SQ121(sq))];
    } else {
        score -= KingO[MIRROR121(SQ121(sq))];
    }

    if (brd_pceNum[PIECES.wB] >= 2) score += BishopPair;
    if (brd_pceNum[PIECES.bB] >= 2) score -= BishopPair;

    if (LsbExist(COLOURS.WHITE)) score += LightSquareBishop;
    if (LsbExist(COLOURS.BLACK)) score -= LightSquareBishop;

    if (brd_side == COLOURS.WHITE) {
        return score;
    } else {
        return -score;
    }
}