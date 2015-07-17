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

function StartEngine() {
	init_engine();
	$('#fenIn').val(START_FEN);
	NewGame();
}

function InitBoardVars() {

	var index = 0;
	for(index = 0; index < MAXGAMEMOVES; index++) {
		brd_history.push({
			move : NOMOVE,
			castlePerm : 0,
			enPas : 0,
			fiftyMove : 0,
			posKey : 0
		}); 
	}
	
	for(index = 0; index < PVENTRIES; index++) {
		brd_PvTable.push({
			move : NOMOVE,
			posKey : 0
		}); 
	}

}

function EvalInit() {
	var index = 0;
	
	for(index = 0; index < 10; ++index) {				
		PawnRanksWhite[index] = 0;			
		PawnRanksBlack[index] = 0;
	}
}

function InitHashKeys() {
    var index = 0;
	
	for(index = 0; index < 21 * 195; ++index) {				
		PieceKeys[index] = RAND_32();
	}
	
	SideKey = RAND_32();
	
	for(index = 0; index < 16; ++index) {
		CastleKeys[index] = RAND_32();
	}
}

function InitSq195To121() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq121 = 0;
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		Sq195ToSq121[index] = 122;
	}
	
	for(index = 0; index < 121; ++index) {
		Sq121ToSq195[index] = 195;
	}
	
	for(rank = RANKS.RANK_1; rank <= RANKS.RANK_11; ++rank) {
		for(file = FILES.FILE_A; file <= FILES.FILE_K; ++file) {
			sq = FR2SQ(file,rank);
			Sq121ToSq195[sq121] = sq;
			Sq195ToSq121[sq] = sq121;
			sq121++;
		}
	}
}

function InitFilesRanksBrd() {
	
	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq121 = 0;
	
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		FilesBrd[index] = SQUARES.OFFBOARD;
		RanksBrd[index] = SQUARES.OFFBOARD;
	}
	
	for(rank = RANKS.RANK_1; rank <= RANKS.RANK_11; ++rank) {
		for(file = FILES.FILE_A; file <= FILES.FILE_K; ++file) {
			sq = FR2SQ(file,rank);
			FilesBrd[sq] = file;
			RanksBrd[sq] = rank;
		}
	}
    // console.log(FilesBrd);
    // console.log(RanksBrd);
}

function init_engine() {	
	InitFilesRanksBrd();
	InitSq195To121();
	InitHashKeys();
	InitBoardVars();
	InitMvvLva();
	// initBoardSquares();
	EvalInit();
	srch_thinking = BOOL.FALSE;
}