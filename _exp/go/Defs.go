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

package main

import (
	"math/rand"
	"strconv"
	"strings"
)

// ══════════════════════════
//  Definitions
// ══════════════════════════

var debug = false
var board_debug = false
var move_sanity_check = false
var vs_engine = false
var engine = ""
var engine_error_L1 = 0
var engine_error_L2 = 0

var variant = "Persian"

const BRD_SQ_NUM = 195

const MAXGAMEMOVES = 2048
const MAXPOSITIONMOVES = 256
const MAXDEPTH = 16

const INFINITE = 30000
const MATE = 29000

const NOMOVE = 0
const PVENTRIES = 10000

const (
	FILE_A = iota
	FILE_B
	FILE_C
	FILE_D
	FILE_E
	FILE_F
	FILE_G
	FILE_H
	FILE_I
	FILE_J
	FILE_K
	FILE_NONE
)

const (
	RANK_1 = iota
	RANK_2
	RANK_3
	RANK_4
	RANK_5
	RANK_6
	RANK_7
	RANK_8
	RANK_9
	RANK_10
	RANK_11
	RANK_NONE
)

const (
	COLOURS_WHITE = iota
	COLOURS_BLACK
	COLOURS_BOTH
)

const (
	SQUARES_A1       = 27
	SQUARES_K1       = 37
	SQUARES_B2       = 41
	SQUARES_C2       = 42
	SQUARES_D2       = 43
	SQUARES_E2       = 44
	SQUARES_F2       = 45
	SQUARES_G2       = 46
	SQUARES_H2       = 47
	SQUARES_I2       = 48
	SQUARES_J2       = 49
	SQUARES_B10      = 145
	SQUARES_C10      = 146
	SQUARES_D10      = 147
	SQUARES_E10      = 148
	SQUARES_F10      = 149
	SQUARES_G10      = 150
	SQUARES_H10      = 151
	SQUARES_I10      = 152
	SQUARES_J10      = 153
	SQUARES_A11      = 157
	SQUARES_K11      = 167
	SQUARES_NO_SQ    = 168
	SQUARES_OFFBOARD = 169
	SQUARES_ASE_SQ   = 97
)

const (
	FALSE = iota
	TRUE
)

const (
	CASTLEBIT_WKCA = 1
	CASTLEBIT_WQCA = 2
	CASTLEBIT_BKCA = 4
	CASTLEBIT_BQCA = 8
)

var FilesBrd [BRD_SQ_NUM]int
var RanksBrd [BRD_SQ_NUM]int

var Sq195ToSq121 [BRD_SQ_NUM]int
var Sq121ToSq195 [121]int

var PceChar = ".PNWCBRSFQKpnwcbrsfqk"
var UnicodePceChar = ".♙♘WC♗♖❀✙♕♔♟♞wc♝♜✿✚♛♚"

var SideChar = "wb-"
var RankChar = "123456789"
var FileChar = "abcdefghijk"

const (
	PIECES_EMPTY = iota

	wP
	wN
	wW
	wC
	wB
	wR
	wS
	wF
	wQ
	wK

	bP
	bN
	bW
	bC
	bB
	bR
	bS
	bF
	bQ
	bK
)

var PIECE_NAMES = []string{"EMPTY", "wP", "wN", "wW", "wC", "wB", "wR", "wS", "wF", "wQ", "wK", "bP", "bN", "bW", "bC", "bB", "bR", "bS", "bF", "bQ", "bK"}

var PieceVal = []int{0, 100, 325, 375, 400, 400, 550, 800, 900, 1000, 50000, 100, 325, 375, 400, 400, 550, 800, 900, 1000, 50000}

var PieceCol = []int{COLOURS_BOTH, COLOURS_WHITE, COLOURS_WHITE, COLOURS_WHITE, COLOURS_WHITE, COLOURS_WHITE, COLOURS_WHITE, COLOURS_WHITE, COLOURS_WHITE, COLOURS_WHITE, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK, COLOURS_BLACK}

// 0 0111111111 0111111111
var PieceBig = []int{0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1}

// 0 0000011111 0000011111
var PieceMaj = []int{0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1}

// 0 0111100000 0111100000
var PieceMin = []int{0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0}

// 0 1000000000 1000000000
var PiecePawn = []int{0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0}

// 0 0100000000 0100000000
var PieceKnight = []int{0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0}

// 0 0010000000 0010000000
var PieceWizard = []int{0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0}

// 0 0001000000 0001000000
var PieceChampion = []int{0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0}

// 0 0000000001 0000000001
var PieceKing = []int{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1}

// 0 0000010110 0000010110
var PieceRookFortressQueen = []int{0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0}

// 0 0000101010 0000101010
var PieceBishopPrincessQueen = []int{0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0}

// 0 0100001100 0100001100
var PieceKnightPrincessFortress = []int{0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0}

// 0 0000111110 0000111110
var PieceSlides = []int{0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0}

var KnDir = []int{-11, -25, -27, -15, 11, 25, 27, 15}
var RkDir = []int{-1, -13, 1, 13}
var BiDir = []int{-12, -14, 12, 14}
var KiDir = []int{-1, -13, 1, 13, -12, -14, 14, 12}
var WzDir = []int{-27, -25, -15, -14, -12, -11, 11, 12, 14, 15, 25, 27}
var ChDir = []int{-28, -26, -24, -13, -2, -1, 1, 2, 13, 24, 26, 28}

var DirNumNonSlide = []int{0, 0, 8, 12, 12, 4, 4, 8, 8, 8, 8, 0, 8, 12, 12, 4, 4, 8, 8, 8, 8}
var PceDirNonSlide = [][]int{nil, nil, KnDir, WzDir, ChDir, BiDir, RkDir, KnDir, KnDir, KiDir, KiDir, nil, KnDir, WzDir, ChDir, BiDir, RkDir, KnDir, KnDir, KiDir, KiDir}

var DirNumSlide = []int{0, 0, 8, 12, 12, 4, 4, 4, 4, 8, 8, 0, 8, 12, 12, 4, 4, 4, 4, 8, 8}
var PceDirSlide = [][]int{nil, nil, nil, WzDir, ChDir, BiDir, RkDir, BiDir, RkDir, KiDir, KiDir, nil, nil, WzDir, ChDir, BiDir, RkDir, BiDir, RkDir, KiDir, KiDir}

var LoopSlidePce = []int{wB, wR, wS, wF, wQ, 0, bB, bR, bS, bF, bQ, 0}
var LoopNonSlidePce = []int{wN, wW, wC, wS, wF, wK, 0, bN, bW, bC, bS, bF, bK, 0}
var LoopSlideIndex = []int{0, 6}
var LoopNonSlideIndex = []int{0, 7}

var Kings = []int{wK, bK}

var PieceKeys [22 * 195]int
var SideKey = 0
var CastleKeys [16]int

var FrameSQ = []int{28, 29, 30, 31, 32, 33, 34, 35, 36, 40, 50, 53, 63, 66, 76, 79, 89, 92, 102, 105, 115, 118, 128, 131, 141, 144, 154, 158, 159, 160, 161, 162, 163, 164, 165, 166}

var ASEDIA = []int{27, 37, 41, 49, 55, 61, 69, 73, 83, 85, 109, 111, 121, 125, 133, 139, 145, 153, 157, 167}

var Mirror121 = []int{
	110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
	99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
	88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98,
	77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87,
	66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
	55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65,
	44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
	33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
	22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
	11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

var CastlePerm = []int{
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
	15, 15, 7, 15, 15, 15, 3, 15, 15, 15, 11, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15}

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

var MFLAGEP = 0x200000    // En passant
var MFLAGPS = 0x400000    // Pawn Start
var MFLAGCA = 0x10000000  // Castle
var MFLAGRZ = 0x20000000  // Rendezvous
var MFLAGCAP = 0x1F0000   // Captured
var MFLAGPROM = 0xF800000 // Promoted

func FROMSQ(m int) int {
	return (m & 0xFF)
}

func TOSQ(m int) int {
	return (((m) >> 8) & 0xFF)
}

func CAPTURED(m int) int {
	return (((m) >> 16) & 0x1F)
}

func PROMOTED(m int) int {
	return (((m) >> 23) & 0x1F)
}

func PCEINDEX(pce int, pceNum int) int {
	return (pce*11 + pceNum)
}

func FR2SQ(f int, r int) int {
	return ((27 + (f)) + ((r) * 13))
}

func CBSQ2SQ(CBSQ string) int {
	COLUMNS := "abcdefghijk"
	f := strings.Index(COLUMNS, CBSQ[0:1])
	r, _ := strconv.Atoi(CBSQ[1:len(CBSQ)])
	return ((f + 1) + ((r + 1) * 13))
}

func SQ121(sq195 int) int {
	return Sq195ToSq121[sq195]
}

func SQ195(sq121 int) int {
	return Sq121ToSq195[sq121]
}

func MIRROR121(sq int) int {
	return Mirror121[sq]
}

func RAND_32() int {
	return rand.Int()
}

func SQASE(sq int) int {
	if sq == 97 && variant == "ASE" {
		return TRUE
	}
	return FALSE
}

func SQPERS(from int, to int) int {
	if to == 97 &&
		variant == "Persian" &&
		brd_pieces[from] != wS &&
		brd_pieces[from] != wP &&
		brd_pieces[from] != bS &&
		brd_pieces[from] != bP {
		return TRUE
	}
	return FALSE
}

func SQOFFBOARD(sq int) int {
	if FilesBrd[sq] == SQUARES_OFFBOARD {
		return TRUE
	}
	return FALSE
}

func HASH_PCE(pce int, sq int) {
	brd_posKey ^= PieceKeys[pce*195+sq]
}

func HASH_CA() {
	brd_posKey ^= CastleKeys[brd_castlePerm]
}

func HASH_SIDE() {
	brd_posKey ^= SideKey
}

func HASH_EP() {
	brd_posKey ^= PieceKeys[brd_enPas]
}

const (
	GameController_EngineSide   = COLOURS_BOTH
	GameController_PlayerSide   = COLOURS_BOTH
	GameController_BoardFlipped = FALSE
	GameController_GameOver     = FALSE
	GameController_GameSaved    = FALSE
)
