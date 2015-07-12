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

var variant = "Persian"

var PIECES =  { EMPTY : 0, wP : 1, wN : 2, wB : 3, wR : 4, wS : 5, wF : 6, wQ : 7, wK : 8, bP : 9, bN : 10, bB : 11, bR : 12, bS : 13, bF : 14, bQ : 15, bK : 16 };
var PIECE_NAMES = ['EMPTY', 'wP', 'wN', 'wB', 'wR', 'wS', 'wF', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bS', 'bF', 'bQ', 'bK'];
var PieceVal= [ 0, 100, 325, 325, 550, 750, 900, 1000, 50000, 100, 325, 325, 550, 750, 900, 1000, 50000  ];

var BRD_SQ_NUM = 195;

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;

var INFINITE = 30000;
var MATE = 29000;

var START_FEN = "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var START_FEN_NON_CITADEL = "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var START_FEN_CITADEL = "f111111111f/1rnbqkbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";

// Check white Persian
//var START_FEN = "11111111111/11111k11111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

// Check black Persian
//var START_FEN = "f1111111111/1rn1qk1b111/1ppp11npp11/111111p1111/11b11111fr1/1111ps11111/11111p111p1/11111111111/111K1111111/11111111111/S111111111S w q - 9 24";

// Board empty
// var START_FEN = "11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111 w KQkq - 0 1";

// Princess-side Castling
// var START_FEN = "f111111111f/1rnbqk111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQK111R1/F111111111F w KQkq - 0 1";

// Queen-side Castling
// var START_FEN = "f111111111f/1r111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1R111KSBNR1/F111111111F w KQkq - 0 1";

// Princess moves
// var START_FEN = "p111111111p/1p1111111p1/11p11111p11/111pp1pp111/111pp1pp111/11111S11111/111pp1pp111/111pp1pp111/11p11111p11/1p1111111p1/p111111111p w KQkq - 0 1";

// Fortress moves
// var START_FEN = "11111111111/11111p11111/11111p11111/1111ppp1111/111p1p1p111/1ppppFpppp1/111p1p1p111/1111ppp1111/11111p11111/11111p11111/11111111111 w KQkq - 0 1";


// var START_FEN = "f111111111f/1rnbqkbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";


// check circular repetition
// var START_FEN = "11111111111/11111k1r111/11p11111p11/1pS111111p1/1111111p111/111111p111/111r11P1F11/11Q1111NPP1/1111111P1K/1q111111111/11111111111 b KQkq - 0 0";

// TRAINING POSITIONS:

var TP_FEN_1 = "11111111111/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_2 = "f111111111f/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_3 = "f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_4 = "f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_5 = "1111111111f/11111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_6 = "f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";

var TP_FEN_7 = "f111111111f/1rnb1ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";


var FILES =  { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_I:8, FILE_J:9, FILE_K:10, FILE_NONE:11 };
var RANKS =  { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, RANK_9:8, RANK_10:9, RANK_11:10,  RANK_NONE:11 };

var COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

var SQUARES = {
  B2:41, C2:42, D2:43, E2:44, F2:45, G2:46, H2:47, I2:48, J2:49,  
  B10:145, C10:146, D10:147, E10:148, F10:149, G10:150, H10:151, I10:152, J10:153, 
  NO_SQ:168, OFFBOARD:169, ASE_SQ:97
};

var BOOL = { FALSE:0, TRUE:1 };

var CASTLEBIT = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var Sq195ToSq121 = new Array(BRD_SQ_NUM);
var Sq121ToSq195 = new Array(121);

var PceChar = ".PNBRSFQKpnbrsfqk";
var SideChar = "wb-";
var RankChar = "123456789";
var FileChar = "abcdefghijk";

var PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
// MQ  0011111011111
// MMQ 00111111101111111
var PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
// MQ  0000111000111
// MMQ 00001111100011111
var PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
// MQ 0011000011000
// MMQ 00110000001100000
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
	COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
	
var PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];	
// MQ  0100000100000
// MMQ 01000000010000000
var PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
// MQ  0010000010000
// MMQ 00100000001000000
var PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
// MQ  0000001000001
// MMQ 00000000100000001
var PieceRookFortressQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
// MQ  0000110000110
// MMQ 00001011000010110
var PieceBishopPrincessQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
// MQ  0001010001010
// MMQ 00010101000101010
var PieceKnightPrincessFortress = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE ];
// MMQ 00100110001001100
var PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
// MQ  0001110001110
// MMQ 00011111000111110

var KnDir = [ -11, -25,	-27, -15, 11, 25, 27, 15 ];
var RkDir = [ -1, -13,	1, 13 ];
var BiDir = [ -12, -14, 12, 14 ];
var KiDir = [ -1, -13,	1, 13, -12, -14, 14, 12 ];

var DirNumNonSlide = [ 0, 0, 8, 4, 4, 8, 8, 8, 8, 0, 8, 4, 4, 8, 8, 8, 8 ];
var PceDirNonSlide = [0, 0, KnDir, BiDir, RkDir, KnDir, KnDir, KiDir, KiDir, 0, KnDir, BiDir, RkDir, KnDir, KnDir, KiDir, KiDir ];

var DirNumSlide = [ 0, 0, 8, 4, 4, 4, 4, 8, 8, 0, 8, 4, 4, 4, 4, 8, 8 ];
var PceDirSlide = [0, 0, KnDir, BiDir, RkDir, BiDir, RkDir, KiDir, KiDir, 0, KnDir, BiDir, RkDir, BiDir, RkDir, KiDir, KiDir ];

var LoopSlidePce = [ PIECES.wB, PIECES.wR, PIECES.wS, PIECES.wF, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bS, PIECES.bF, PIECES.bQ, 0 ];
var LoopNonSlidePce = [ PIECES.wN, PIECES.wS, PIECES.wF, PIECES.wK, 0, PIECES.bN, PIECES.bS, PIECES.bF, PIECES.bK, 0 ];
var LoopSlideIndex = [ 0, 6 ];
var LoopNonSlideIndex = [ 0, 5 ];


var Kings = [PIECES.wK, PIECES.bK];

var PieceKeys = new Array(18 * 195);
var SideKey;
var CastleKeys = new Array(16);

var FrameSQ = new Array();

    FrameSQ[0] = 28;
    FrameSQ[1] = 29;
    FrameSQ[2] = 30;
    FrameSQ[3] = 31;
    FrameSQ[4] = 32;
    FrameSQ[5] = 33;
    FrameSQ[6] = 34;
    FrameSQ[7] = 35;
    FrameSQ[8] = 36;
    FrameSQ[9] = 40;
    FrameSQ[10] = 50;
    FrameSQ[11] = 53;
    FrameSQ[12] = 63;
    FrameSQ[13] = 66;
    FrameSQ[14] = 76;
    FrameSQ[15] = 79;
    FrameSQ[16] = 89;
    FrameSQ[17] = 92;
    FrameSQ[18] = 102;
    FrameSQ[19] = 105;
    FrameSQ[20] = 115;
    FrameSQ[21] = 118;
    FrameSQ[22] = 128;
    FrameSQ[23] = 131;
    FrameSQ[24] = 141;
    FrameSQ[25] = 144;
    FrameSQ[26] = 154;
    FrameSQ[27] = 158;
    FrameSQ[28] = 159;
    FrameSQ[29] = 160;
    FrameSQ[30] = 161;
    FrameSQ[31] = 162;
    FrameSQ[32] = 163;
    FrameSQ[33] = 164;
    FrameSQ[34] = 165;
    FrameSQ[35] = 166;


var Mirror121 = [
110	,	111	,	112	,	113	,	114	,	115	,	116	,	117	,	118	,	119	,	120	,
99	,	100	,	101	,	102	,	103	,	104	,	105	,	106	,	107	,	108	,	109	,
88	,	89	,	90	,	91	,	92	,	93	,	94	,	95	,	96	,	97	,	98	,
77	,	78	,	79	,	80	,	81	,	82	,	83	,	84	,	85	,	86	,	87	,
66	,	67	,	68	,	69	,	70	,	71	,	72	,	73	,	74	,	75	,	76	,
55	,	56	,	57	,	58	,	59	,	60	,	61	,	62	,	63	,	64	,	65	,
44	,	45	,	46	,	47	,	48	,	49	,	50	,	51	,	52	,	53	,	54	,
33	,	34	,	35	,	36	,	37	,	38	,	39	,	40	,	41	,	42	,	43	,
22	,	23	,	24	,	25	,	26	,	27	,	28	,	29	,	30	,	31	,	32	,
11	,	12	,	13	,	14	,	15	,	16	,	17	,	18	,	19	,	20	,	21	,
0	,	1	,	2	,	3	,	4	,	5	,	6	,	7   ,   8   ,   9   ,   10
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
0000 0011 1110 0000 0000 0000 0000 0000 -> Promoted Piece >> 21, 0x1F
0000 0100 0000 0000 0000 0000 0000 0000 -> Castle 0x4000000
0000 1000 0000 0000 0000 0000 0000 0000 -> Rendezvous 0x8000000
0001 0000 0000 0000 0000 0000 0000 0000 -> EP 0x100000
0010 0000 0000 0000 0000 0000 0000 0000 -> Pawn Start 0x200000
0100 0000 0000 0000 0000 0000 0000 0000 -> Unused
1000 0000 0000 0000 0000 0000 0000 0000 -> Unused
*/

function FROMSQ(m) { return (m & 0xFF); }
function TOSQ(m)  { return (((m)>>8) & 0xFF); }
function CAPTURED(m)  { return (((m)>>16) & 0x1F); }
function PROMOTED(m)  { return (((m)>>21) & 0x1F); }
var MFLAGCAP = 0x1F0000     // Captured 
var MFLAGPROM = 0x3E00000   // Promoted
var MFLAGCA = 0x4000000     // Castle
var MFLAGRZ = 0x8000000     // Rendezvous
var MFLAGEP = 0x10000000    // En passant
var MFLAGPS = 0x20000000    // Pawn Start
var NOMOVE = 0


var PVENTRIES = 10000;

function PCEINDEX(pce, pceNum) {
	return (pce * 11 + pceNum);
}

function FR2SQ(f,r) {
 	return ( (27 + (f) ) + ( (r) * 13 ) );
}

function CBSQ2SQ(CBSQ) {
 	COLUMNS = "abcdefghijk";
	f = parseInt(COLUMNS.indexOf(CBSQ.substring(0,1)));
	r = parseInt(CBSQ.substring(1,CBSQ.length));
	return (( f + 1 ) + ( (r + 1) * 13 ) );
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

	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
		 | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);

}

function SQASE(sq)
{
    if (sq == 97 && variant == "ASE") return BOOL.TRUE;
    return BOOL.FALSE;
}

function SQOFFBOARD(sq) {
	if(FilesBrd[sq]==SQUARES.OFFBOARD || $.inArray(sq, FrameSQ) > -1) return BOOL.TRUE;
	return BOOL.FALSE;	
}

function HASH_PCE(pce,sq) { 
	brd_posKey ^= PieceKeys[pce*195 + sq]; 
}
function HASH_CA() { brd_posKey ^= CastleKeys[brd_castlePerm]; }
function HASH_SIDE() { brd_posKey ^= SideKey; }
function HASH_EP() { brd_posKey ^= PieceKeys[brd_enPas]; }

var GameController = {};
GameController.EngineSide = COLOURS.BOTH;
GameController.PlayerSide = COLOURS.BOTH;
GameController.BoardFlipped = BOOL.FALSE;
GameController.GameOver = BOOL.FALSE;
GameController.GameSaved = BOOL.TRUE;








