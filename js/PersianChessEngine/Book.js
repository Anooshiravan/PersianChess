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
//  Book
// ══════════════════════════

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


// ════════════════════════════════════════════════════
debuglog ("Book.js is loaded.")