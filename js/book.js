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

function LineMatch(BookLine, gameline) {
    //console.log("Matching " + gameline + " with " + BookLine + " len = " + gameline.length);
    for (var len = 0; len < gameline.length; ++len) {
        //console.log("Char Matching " + gameline[len] + " with " + BookLine[len]);
        if (len >= BookLine.length) { /*console.log('no match');*/
            return BOOL.FALSE;
        }
        if (gameline[len] != BookLine[len]) { /*console.log('no match'); */
            return BOOL.FALSE;
        }
    }
    //console.log('Match');
    return BOOL.TRUE;
}

function BookMove() {
    var gameLine = printGameLine();
    var bookMoves = [];
    var lengthOfLineHack = gameLine.length;

    if (gameLine.length == 0) lengthOfLineHack--;
    for (var bookLineNum = 0; bookLineNum < brd_bookLines.length; ++bookLineNum) {

        if (LineMatch(brd_bookLines[bookLineNum], gameLine) == BOOL.TRUE) {
            var move = brd_bookLines[bookLineNum].substr(lengthOfLineHack + 1);
            if (move.indexOf(' ') != -1) move = move.substr(0, move.indexOf(' '));
            if (move.length > 4 && move.length < 8) {
                var from = SqFromAlg(move.split('-')[0]);
                var to = SqFromAlg(move.split('-')[1]);
                varInternalMove = ParseMove(from, to);
                bookMoves.push(varInternalMove);
            }
         }
    }
    if (bookMoves.length == 0) return NOMOVE;
    var num = Math.floor(Math.random() * bookMoves.length);
    console.log("Book move: " + PrMove(bookMoves[num]));
    // addNoteToMoveList("[Book Move]");
    updateMoveList();
    return bookMoves[num];

}


// *** BOOK Moves *** 
var brd_bookLines = [
    //F3-F5
    'f3-f5 e9-e7 g3-g5 f9-f7 j3-j4 j9-j8 k1-j3 k11-j9',
    'f3-f5 e9-e7 g3-g5 f9-f7 e3-e5 g9-g7 i2-h4 g10-h10 g2-h2 d10-f8 d2-f4 i10-h8',
    'f3-f5 e9-e7 i2-h4 g10-h10 g2-h2 f9-f7 g3-g4 g9-g7 c2-d4 d10-f8',
    'f3-f5 e9-e7 e3-e4 g10-h10 i2-h4 f9-f7 g3-g5 g9-g7 g2-h2 d10-f8',
    'f3-f5 e9-e7 e3-e5 g10-h10 g3-g5 g9-g7 c2-d4 f9-f7',
    'f3-f5 e9-e7 j3-j4 g10-h10 g3-g5 h10-i8 c2-d4 d10-g7 e2-g4 f9-f7',
    'f3-f5 e9-e7 g3-g5 f9-f7 e3-e5 g9-g7 i2-h4 g10-h10 g2-h2 d10-f8 c2-d4 c10-d8 d2-f4 i10-h8 g2-e4 j9-j8 j3-j4',
    //G3-G5
    'g3-g5 e9-e7 i2-h4c10-d8 g2-h2 g10-h10',
    'g3-g5 e9-e7 e3-e5 f9-f7 f3-f5 g9-g7 i2-h4 g10-h10 c2-d4 d10-f8 d2-f4 i10-h8',
    'g3-g5 e9-e7 c2-d4 f9-f7 e3-e4 g9-g7 f3-f5 g10-h10 g2-h2 d10-f8',
    'g3-g5 j9-j8 f3-f5 e9-e7 g2-h2 k11-j9 h2-c7 d9-d8 c7-e5 g9-g7 e5-g6',
    'g3-g5 e9-e7 f3-f5 f9-f7 e3-e5 g10-h10 i2-h4 g9-g7 g2-h2 d10-f8 c2-d4 i10-h8 d2-f4 c10-d8',
    'g3-g5 e9-e7 f3-f5 f9-f7 e3-e5 g10-h10 g2-h2 d10-i5 h3-h4 i5-f8 c2-d4 g9-g7 d2-f4 i10-h8',
    //E3-E5
    'e3-e5 g9-g7 g3-g5 e9-e7 g2-h2 g10-h10 f3-f5 f9-f7 d2-f4 d10-f8',
    'e3-e5 g9-g7 f3-f5 g10-h10 g3-g5 h10-c5 c2-d4 e9-e7 i2-h4 f9-f7 b3-b4 c5-b6',
    'e3-e5 g9-g7 g3-g5 e9-e7 f3-f5 g10-h10 d2-f4 d9-d8 c2-d4 f9-f7 i2-h4 d10-f8 g5-g6 f7-g6 f5-g6 e10-c8',
    'e3-e5 g9-g7 j3-j4 i10-h8 k1-j3 g10-h10 g2-h2 f9-f7 g3-g5 e9-e7 f3-f5 d10-f8',
    //C2-D4
    'c2-d4 e9-e7 e3-e5 f9-f7 f3-f5 g10-h10 g3-g5 g9-g7',
    'c2-d4 e9-e7 i2-h4 f9-f7 f3-f5 g10-h10 g3-g5 g9-g7 g2-h2 d10-f8',
    'c2-d4 e9-e7 a1-c2 f9-f7 f3-f5 g10-h10 g3-g5 d10-i5 h3-h4 i5-f8',
    'c2-d4 e9-e7 e3-e5 f9-f7 i2-h4 g10-h10 f3-f5 g9-g7 d2-f4 d10-f8',
    //I2-H4
    'i2-h4 i10-h8 k1-i2 k11-i10',
    'i2-h4 i10-h8 c2-d4 e9-e7 g3-g5 g10-h10 f3-f5 f9-f7 g2-h2 g9-g7',
    'i2-h4 i10-h8 f3-f5 e9-e7 e3-e5 f9-f7 c2-e3 g10-h10 g3-g4 g9-g7',
    //J3-J4
    'j3-j4 e9-e7 k1-j3 g10-h10 g3-g5 g9-g7 f3-f5 h10-i8 c2-d4 i8-j6 h3-h4 f9-f7',
    'j3-j4 e9-e7 f3-f5 g10-h10 k1-j3 h10-i8 c2-d4 f9-f7 g3-g5 d10-g7 e2-g4 g10-d7 e3-e4 e7-e6',
    //B3-B4
    'b3-b4 e9-e7 a1-b3 g10-h10 g2-h2 h10-g8 c3-c4 f9-f7',
    'b3-b4 e9-e7 e3-e5 g10-h10 f3-f5 f9-f7 a1-b3 g10-d7 i2-h4 d10-i5 g2-f3 c10-d8',
    'b3-b4 e9-e7 a1-b3 g10-h10 e3-e5 h10-g8 c3-c4 f9-f7 i2-h4 d10-g7 f3-f4 i10-h8',
    'b3-b4 e9-e7 a1-b3 g10-h10 g2-h2 h10-g8 c3-c4 f9-f7 f3-f5 d10-g7 d3-d4 g10-d7 i2-h4 c10-d8 e3-e5 i10-h8',
    //H3-H5
    'h3-h5 e9-e7 g3-g5 f9-f7 f3-f4 g10-h10 i2-h4 d10-i5 h2-g3 g9-g7 c2-d4 i10-h8',
    'h3-h5 e9-e7 g3-g5 f9-f7 i2-h4 g10-h10 c2-d4 d10-i5 h2-g3 g9-g7',
    //D3-D5
    'd3-d5 e9-e7 e3-e5 g10-h10 g2-h2 f9-f7 g3-g5 g9-g7',
    //END
    ''
];


// ########################
// ## Training Positions ##
// ########################

// Celtic Citadel
var TP_FEN_1_Citadel = "11111111111/11111k1s111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";

var TP_FEN_2_Citadel = "f111111111f/11111k1s111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";

var TP_FEN_3_Citadel = "f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";

var TP_FEN_4_Citadel = "f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";

var TP_FEN_5_Citadel = "1111111111f/11111kbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";

var TP_FEN_6_Citadel = "f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";

var TP_FEN_7_Citadel = "f111111111f/1rnb1kbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";


// Persian Princess
var TP_FEN_1_Persian = "11111111111/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_2_Persian = "f111111111f/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_3_Persian = "f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_4_Persian = "f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_5_Persian = "1111111111f/11111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_6_Persian = "f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_7_Persian = "f111111111f/1rnb1ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

// Egyptian Eye
var TP_FEN_1_ASE = "11111111111/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_2_ASE = "f111111111f/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_3_ASE = "f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_4_ASE = "f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_5_ASE = "1111111111f/11111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_6_ASE = "f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_7_ASE = "f111111111f/1rnb1ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

// Orbital Omega

var TP_FEN_1_Orbital = "11111111111/11111kc1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";

var TP_FEN_2_Orbital = "w111111111w/11111kc1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";

var TP_FEN_3_Orbital = "w111111111w/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";

var TP_FEN_4_Orbital = "w111111111w/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";

var TP_FEN_5_Orbital = "1111111111w/11111kcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";

var TP_FEN_6_Orbital = "w111111111w/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";

var TP_FEN_7_Orbital = "w111111111w/1rnb1kcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";