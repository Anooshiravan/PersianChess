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
//  Constants
// ══════════════════════════

var debug = false;
var board_debug = false;
var move_sanity_check = false;
var vs_engine = false;
var engine_error_L1 = 0;
var engine_error_L2 = 0;

var variant = "Persian";
var BRD_SQ_NUM = 195;

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 16;

var INFINITE = 30000;
var MATE = 29000;

var FILES = {
    FILE_A: 0,
    FILE_B: 1,
    FILE_C: 2,
    FILE_D: 3,
    FILE_E: 4,
    FILE_F: 5,
    FILE_G: 6,
    FILE_H: 7,
    FILE_I: 8,
    FILE_J: 9,
    FILE_K: 10,
    FILE_NONE: 11
};
var RANKS = {
    RANK_1: 0,
    RANK_2: 1,
    RANK_3: 2,
    RANK_4: 3,
    RANK_5: 4,
    RANK_6: 5,
    RANK_7: 6,
    RANK_8: 7,
    RANK_9: 8,
    RANK_10: 9,
    RANK_11: 10,
    RANK_NONE: 11
};

var COLOURS = {
    WHITE: 0,
    BLACK: 1,
    BOTH: 2
};

var SQUARES = {
    A1: 27,
    K1: 37,
    B2: 41,
    C2: 42,
    D2: 43,
    E2: 44,
    F2: 45,
    G2: 46,
    H2: 47,
    I2: 48,
    J2: 49,
    B10: 145,
    C10: 146,
    D10: 147,
    E10: 148,
    F10: 149,
    G10: 150,
    H10: 151,
    I10: 152,
    J10: 153,
    A11: 157,
    K11: 167,
    NO_SQ: 168,
    OFFBOARD: 169,
    ASE_SQ: 97
};

var BOOL = {
    FALSE: 0,
    TRUE: 1
};

var CASTLEBIT = {
    WKCA: 1,
    WQCA: 2,
    BKCA: 4,
    BQCA: 8
};

var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var Sq195ToSq121 = new Array(BRD_SQ_NUM);
var Sq121ToSq195 = new Array(121);

var PceChar = ".PNWCBRSFQKpnwcbrsfqk";
var SideChar = "wb-";
var RankChar = "123456789";
var FileChar = "abcdefghijk";


/* beautify preserve:start */

var PIECES =  {
    EMPTY : 0,

    wP : 1,
    wN : 2,
    wW : 3,
    wC : 4,
    wB : 5,
    wR : 6,
    wS : 7,
    wF : 8,
    wQ : 9,
    wK : 10,

    bP : 11,
    bN : 12,
    bW : 13,
    bC : 14,
    bB : 15,
    bR : 16,
    bS : 17,
    bF : 18,
    bQ : 19,
    bK : 20
};

var PIECE_NAMES = ['EMPTY', 'wP', 'wN', 'wW', 'wC', 'wB', 'wR', 'wS', 'wF', 'wQ', 'wK', 'bP', 'bN', 'bW', 'bC', 'bB', 'bR', 'bS', 'bF', 'bQ', 'bK'];
var PieceVal= [ 0, 100, 325, 375, 400, 400, 550, 800, 900, 1000, 50000, 100, 325, 375, 400, 400, 550, 800, 900, 1000, 50000  ];

var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];

// 0 0111111111 0111111111
var PieceBig =      [ 0, 0,1,1,1,1,1,1,1,1,1, 0,1,1,1,1,1,1,1,1,1 ];

// 0 0000011111 0000011111
var PieceMaj =      [ 0, 0,0,0,0,0,1,1,1,1,1, 0,0,0,0,0,1,1,1,1,1 ];

// 0 0111100000 0111100000
var PieceMin =      [ 0, 0,1,1,1,1,0,0,0,0,0, 0,1,1,1,1,0,0,0,0,0 ];

// 0 1000000000 1000000000
var PiecePawn =     [ 0, 1,0,0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0 ];

// 0 0100000000 0100000000
var PieceKnight =   [ 0, 0,1,0,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0,0,0 ];

// 0 0010000000 0010000000
var PieceWizard =   [ 0, 0,0,1,0,0,0,0,0,0,0, 0,0,1,0,0,0,0,0,0,0 ];

// 0 0001000000 0001000000
var PieceChampion = [ 0, 0,0,0,1,0,0,0,0,0,0, 0,0,0,1,0,0,0,0,0,0 ];

// 0 0000000001 0000000001
var PieceKing =     [ 0, 0,0,0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,0,0,1 ];

// 0 0000010110 0000010110
var PieceRookFortressQueen = [ 0, 0,0,0,0,0,1,0,1,1,0, 0,0,0,0,0,1,0,1,1,0 ];

// 0 0000101010 0000101010
var PieceBishopPrincessQueen = [ 0, 0,0,0,0,1,0,1,0,1,0, 0,0,0,0,1,0,1,0,1,0 ];

// 0 0100001100 0100001100
var PieceKnightPrincessFortress = [ 0, 0,1,0,0,0,0,1,1,0,0, 0,1,0,0,0,0,1,1,0,0 ];

// 0 0000111110 0000111110
var PieceSlides = [ 0, 0,0,0,0,1,1,1,1,1,0, 0,0,0,0,1,1,1,1,1,0 ];

var KnDir = [ -11, -25, -27, -15, 11, 25, 27, 15 ];
var RkDir = [ -1, -13,  1, 13 ];
var BiDir = [ -12, -14, 12, 14 ];
var KiDir = [ -1, -13,  1, 13, -12, -14, 14, 12 ];
var WzDir = [-27, -25, -15, -14, -12, -11, 11, 12, 14, 15, 25, 27];
var ChDir = [-28, -26, -24, -13, -2, -1, 1, 2, 13, 24, 26, 28];

var DirNumNonSlide = [ 0, 0, 8, 12, 12, 4, 4, 8, 8, 8, 8, 0, 8, 12, 12, 4, 4, 8, 8, 8, 8 ];
var PceDirNonSlide = [0, 0, KnDir, WzDir, ChDir, BiDir, RkDir, KnDir, KnDir, KiDir, KiDir, 0, KnDir, WzDir, ChDir, BiDir, RkDir, KnDir, KnDir, KiDir, KiDir ];

var DirNumSlide = [ 0, 0, 8, 12, 12, 4, 4, 4, 4, 8, 8, 0, 8, 12, 12, 4, 4, 4, 4, 8, 8 ];
var PceDirSlide = [0, 0, 0, WzDir, ChDir, BiDir, RkDir, BiDir, RkDir, KiDir, KiDir, 0, 0, WzDir, ChDir, BiDir, RkDir, BiDir, RkDir, KiDir, KiDir ];

var LoopSlidePce = [ PIECES.wB, PIECES.wR, PIECES.wS, PIECES.wF, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bS, PIECES.bF, PIECES.bQ, 0 ];
var LoopNonSlidePce = [ PIECES.wN, PIECES.wW, PIECES.wC, PIECES.wS, PIECES.wF, PIECES.wK, 0, PIECES.bN, PIECES.bW, PIECES.bC, PIECES.bS, PIECES.bF, PIECES.bK, 0 ];
var LoopSlideIndex = [ 0, 6 ];
var LoopNonSlideIndex = [ 0, 7 ];

var Kings = [PIECES.wK, PIECES.bK];

var PieceKeys = new Array(22 * 195);
var SideKey;
var CastleKeys = new Array(16);

var FrameSQ = [
28, 29, 30, 31, 32, 33, 34, 35, 36, 40, 50, 53, 63, 66, 76, 79, 89, 92, 102, 105, 115, 118, 128, 131, 141, 144, 154, 158, 159, 160, 161, 162, 163, 164, 165, 166
];

var ASEDIA = [27, 37, 41, 49, 55, 61, 69, 73, 83, 85, 109, 111, 121, 125, 133, 139, 145, 153, 157, 167];

var Mirror121 = [
110 ,   111 ,   112 ,   113 ,   114 ,   115 ,   116 ,   117 ,   118 ,   119 ,   120 ,
99  ,   100 ,   101 ,   102 ,   103 ,   104 ,   105 ,   106 ,   107 ,   108 ,   109 ,
88  ,   89  ,   90  ,   91  ,   92  ,   93  ,   94  ,   95  ,   96  ,   97  ,   98  ,
77  ,   78  ,   79  ,   80  ,   81  ,   82  ,   83  ,   84  ,   85  ,   86  ,   87  ,
66  ,   67  ,   68  ,   69  ,   70  ,   71  ,   72  ,   73  ,   74  ,   75  ,   76  ,
55  ,   56  ,   57  ,   58  ,   59  ,   60  ,   61  ,   62  ,   63  ,   64  ,   65  ,
44  ,   45  ,   46  ,   47  ,   48  ,   49  ,   50  ,   51  ,   52  ,   53  ,   54  ,
33  ,   34  ,   35  ,   36  ,   37  ,   38  ,   39  ,   40  ,   41  ,   42  ,   43  ,
22  ,   23  ,   24  ,   25  ,   26  ,   27  ,   28  ,   29  ,   30  ,   31  ,   32  ,
11  ,   12  ,   13  ,   14  ,   15  ,   16  ,   17  ,   18  ,   19  ,   20  ,   21  ,
0   ,   1   ,   2   ,   3   ,   4   ,   5   ,   6   ,   7   ,   8   ,   9   ,   10
];

var CastlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 13, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15,  7, 15, 15, 15,  3, 15, 15, 15, 11, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];

/*                                                  
1111 1111 1111 1111 1111 1111 1111 1111 -> 32 bit hash                                                   
0000 0000 0000 0000 0000 0000 1111 1111 -> From 0xFF
0000 0000 0000 0000 1111 1111 0000 0000 -> To >> 8, 0xFF
0000 0000 0001 1111 0000 0000 0000 0000 -> Captured >> 16, 0x1F
0000 0000 0010 0000 0000 0000 0000 0000 -> EP 0x200000
0000 0000 0100 0000 0000 0000 0000 0000 -> Pawn Start 0x400000
0000 1111 1000 0000 0000 0000 0000 0000 -> Promoted Piece >> 23, 0x1F
0001 0000 0000 0000 0000 0000 0000 0000 -> Castle 0x10000000
0010 0000 0000 0000 0000 0000 0000 0000 -> Rendezvous 0x20000000
0100 0000 0000 0000 0000 0000 0000 0000 -> Unused
1000 0000 0000 0000 0000 0000 0000 0000 -> Unused
*/

var MFLAGEP     = 0x200000;     // En passant
var MFLAGPS     = 0x400000;     // Pawn Start
var MFLAGCA     = 0x10000000;   // Castle 
var MFLAGRZ     = 0x20000000;   // Rendezvous
var MFLAGCAP    = 0x1F0000;     // Captured
var MFLAGPROM   = 0xF800000;    // Promoted


/* beautify preserve:end */

function FROMSQ(m) {
    return (m & 0xFF);
}

function TOSQ(m) {
    return (((m) >> 8) & 0xFF);
}

function CAPTURED(m) {
    return (((m) >> 16) & 0x1F);
}

function PROMOTED(m) {
    return (((m) >> 23) & 0x1F);
}

var NOMOVE = 0;

var PVENTRIES = 10000;

function PCEINDEX(pce, pceNum) {
    return (pce * 11 + pceNum);
}

function FR2SQ(f, r) {
    return ((27 + (f)) + ((r) * 13));
}

function CBSQ2SQ(CBSQ) {
    COLUMNS = "abcdefghijk";
    f = parseInt(COLUMNS.indexOf(CBSQ.substring(0, 1)), 10);
    r = parseInt(CBSQ.substring(1, CBSQ.length), 10);
    return ((f + 1) + ((r + 1) * 13));
}

function SQ121(sq195) {
    return Sq195ToSq121[(sq195)];
}

function SQ195(sq121) {
    return Sq121ToSq195[(sq121)];
}

function MIRROR121(sq) {
    return Mirror121[sq];
}

function RAND_32() {

    return (Math.floor((Math.random() * 255) + 1) << 23) | (Math.floor((Math.random() * 255) + 1) << 16) | (Math.floor((Math.random() * 255) + 1) << 8) | Math.floor((Math.random() * 255) + 1);

}

function SQASE(sq) {
    if (sq == 97 && variant == "ASE") return BOOL.TRUE;
    return BOOL.FALSE;
}

function SQPERS(from, to) {
    if (
        to == 97 &&
        variant == "Persian" &&
        brd_pieces[from] != PIECES.wS &&
        brd_pieces[from] != PIECES.wP &&
        brd_pieces[from] != PIECES.bS &&
        brd_pieces[from] != PIECES.bP
    ) return BOOL.TRUE;
    return BOOL.FALSE;
}

function SQOFFBOARD(sq) {
    if (FilesBrd[sq] == SQUARES.OFFBOARD) return BOOL.TRUE;
    return BOOL.FALSE;
}

function HASH_PCE(pce, sq) {
    brd_posKey ^= PieceKeys[pce * 195 + sq];
}

function HASH_CA() {
    brd_posKey ^= CastleKeys[brd_castlePerm];
}

function HASH_SIDE() {
    brd_posKey ^= SideKey;
}

function HASH_EP() {
    brd_posKey ^= PieceKeys[brd_enPas];
}

var GameController = {};
GameController.EngineSide = COLOURS.BOTH;
GameController.PlayerSide = COLOURS.BOTH;
GameController.BoardFlipped = BOOL.FALSE;
GameController.GameOver = BOOL.FALSE;
GameController.GameSaved = BOOL.TRUE;


// ════════════════════════════════════════════════════
debuglog("Defs.js is loaded.");
