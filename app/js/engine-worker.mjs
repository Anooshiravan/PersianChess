"use strict";
(() => {
  // src/engine/defs.ts
  var BRD_SQ_NUM = 195;
  var BRD_PCE_NUM = 22;
  var MAXGAMEMOVES = 2048;
  var MAXPOSITIONMOVES = 256;
  var MAXDEPTH = 16;
  var INFINITE = 3e4;
  var MATE = 29e3;
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
  var CASTLEBIT = { WKCA: 1, WQCA: 2, BKCA: 4, BQCA: 8 };
  var PceChar = ".PNWCBRSFQKpnwcbrsfqk";
  var SideChar = "wb-";
  var FileChar = "abcdefghijk";
  var PIECES = {
    EMPTY: 0,
    wP: 1,
    wN: 2,
    wW: 3,
    wC: 4,
    wB: 5,
    wR: 6,
    wS: 7,
    wF: 8,
    wQ: 9,
    wK: 10,
    bP: 11,
    bN: 12,
    bW: 13,
    bC: 14,
    bB: 15,
    bR: 16,
    bS: 17,
    bF: 18,
    bQ: 19,
    bK: 20
  };
  var PIECE_NAMES = [
    "EMPTY",
    "wP",
    "wN",
    "wW",
    "wC",
    "wB",
    "wR",
    "wS",
    "wF",
    "wQ",
    "wK",
    "bP",
    "bN",
    "bW",
    "bC",
    "bB",
    "bR",
    "bS",
    "bF",
    "bQ",
    "bK"
  ];
  var PieceVal = [
    0,
    100,
    325,
    375,
    400,
    400,
    550,
    800,
    900,
    1e3,
    5e4,
    100,
    325,
    375,
    400,
    400,
    550,
    800,
    900,
    1e3,
    5e4
  ];
  var PieceCol = [
    COLOURS.BOTH,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.WHITE,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK,
    COLOURS.BLACK
  ];
  var PiecePawn = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var PieceKnight = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  var PieceWizard = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];
  var PieceChampion = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
  var PieceKing = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  var PieceRookFortressQueen = [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0];
  var PieceBishopPrincessQueen = [0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0];
  var PieceKnightPrincessFortress = [0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0];
  var KnDir = [-11, -25, -27, -15, 11, 25, 27, 15];
  var RkDir = [-1, -13, 1, 13];
  var BiDir = [-12, -14, 12, 14];
  var KiDir = [-1, -13, 1, 13, -12, -14, 14, 12];
  var WzDir = [-27, -25, -15, -14, -12, -11, 11, 12, 14, 15, 25, 27];
  var ChDir = [-28, -26, -24, -13, -2, -1, 1, 2, 13, 24, 26, 28];
  var DirNumNonSlide = [0, 0, 8, 12, 12, 4, 4, 8, 8, 8, 8, 0, 8, 12, 12, 4, 4, 8, 8, 8, 8];
  var PceDirNonSlide = [
    [],
    [],
    KnDir,
    WzDir,
    ChDir,
    BiDir,
    RkDir,
    KnDir,
    KnDir,
    KiDir,
    KiDir,
    [],
    KnDir,
    WzDir,
    ChDir,
    BiDir,
    RkDir,
    KnDir,
    KnDir,
    KiDir,
    KiDir
  ];
  var DirNumSlide = [0, 0, 8, 12, 12, 4, 4, 4, 4, 8, 8, 0, 8, 12, 12, 4, 4, 4, 4, 8, 8];
  var PceDirSlide = [
    [],
    [],
    [],
    WzDir,
    ChDir,
    BiDir,
    RkDir,
    BiDir,
    RkDir,
    KiDir,
    KiDir,
    [],
    [],
    WzDir,
    ChDir,
    BiDir,
    RkDir,
    BiDir,
    RkDir,
    KiDir,
    KiDir
  ];
  var LoopSlidePce = [
    PIECES.wB,
    PIECES.wR,
    PIECES.wS,
    PIECES.wF,
    PIECES.wQ,
    0,
    PIECES.bB,
    PIECES.bR,
    PIECES.bS,
    PIECES.bF,
    PIECES.bQ,
    0
  ];
  var LoopNonSlidePce = [
    PIECES.wN,
    PIECES.wW,
    PIECES.wC,
    PIECES.wS,
    PIECES.wF,
    PIECES.wK,
    0,
    PIECES.bN,
    PIECES.bW,
    PIECES.bC,
    PIECES.bS,
    PIECES.bF,
    PIECES.bK,
    0
  ];
  var LoopSlideIndex = [0, 6];
  var LoopNonSlideIndex = [0, 7];
  var Kings = [PIECES.wK, PIECES.bK];
  var FrameSQ = [
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    40,
    50,
    53,
    63,
    66,
    76,
    79,
    89,
    92,
    102,
    105,
    115,
    118,
    128,
    131,
    141,
    144,
    154,
    158,
    159,
    160,
    161,
    162,
    163,
    164,
    165,
    166
  ];
  var ASEDIA = [27, 37, 41, 49, 55, 61, 69, 73, 83, 85, 109, 111, 121, 125, 133, 139, 145, 153, 157, 167];
  var Mirror121 = [
    110,
    111,
    112,
    113,
    114,
    115,
    116,
    117,
    118,
    119,
    120,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10
  ];
  var CastlePerm = [
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    13,
    15,
    15,
    15,
    12,
    15,
    15,
    15,
    14,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    7,
    15,
    15,
    15,
    3,
    15,
    15,
    15,
    11,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15
  ];
  var MFLAGEP = 2097152;
  var MFLAGPS = 4194304;
  var MFLAGCA = 268435456;
  var MFLAGRZ = 536870912;
  var MFLAGCAP = 2031616;
  var MFLAGPROM = 260046848;
  function FROMSQ(m) {
    return m & 255;
  }
  function TOSQ(m) {
    return m >> 8 & 255;
  }
  function CAPTURED(m) {
    return m >> 16 & 31;
  }
  function PROMOTED(m) {
    return m >> 23 & 31;
  }
  var NOMOVE = 0;
  var PVENTRIES = 1e4;
  function PCEINDEX(pce, pceNum) {
    return pce * 11 + pceNum;
  }
  function FR2SQ(f, r) {
    return 27 + f + r * 13;
  }
  function CBSQ2SQ(CBSQ) {
    const COLUMNS = "abcdefghijk";
    const f = parseInt(String(COLUMNS.indexOf(CBSQ.substring(0, 1))), 10);
    const r = parseInt(CBSQ.substring(1, CBSQ.length), 10);
    return f + 1 + (r + 1) * 13;
  }
  function RAND_32() {
    return Math.floor(Math.random() * 255 + 1) << 23 | Math.floor(Math.random() * 255 + 1) << 16 | Math.floor(Math.random() * 255 + 1) << 8 | Math.floor(Math.random() * 255 + 1);
  }

  // src/engine/state.ts
  var S = {
    // ── Global flags / debug (Defs.js top) ──
    debug: false,
    board_debug: false,
    vs_engine: false,
    debug_log: false,
    engine_on: false,
    // ── Variant ──
    variant: "Persian",
    variantId: 0,
    // 0=Persian, 1=Pyramid, 2=Citadel, 3=Oriental — mirrors S.variant, int fast-path
    START_FEN: "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1",
    // ── Coordinate mapping tables (Init.js fills these) ──
    FilesBrd: new Array(BRD_SQ_NUM),
    RanksBrd: new Array(BRD_SQ_NUM),
    Sq195ToSq121: new Array(BRD_SQ_NUM),
    Sq121ToSq195: new Array(121),
    // ── Zobrist hashing ──
    PieceKeys: new Array(BRD_PCE_NUM * BRD_SQ_NUM),
    SideKey: 0,
    CastleKeys: new Array(16),
    // ── Board state (Board.js) ──
    brd_side: COLOURS.WHITE,
    brd_pieces: new Array(BRD_SQ_NUM),
    brd_enPas: SQUARES.NO_SQ,
    brd_fiftyMove: 0,
    brd_ply: 0,
    brd_hisPly: 0,
    brd_castlePerm: 0,
    brd_posKey: 0,
    brd_pceNum: new Array(21),
    brd_material: new Array(2),
    brd_pList: new Array(BRD_PCE_NUM * 11),
    brd_history: [],
    brd_history_notes: new Array(255),
    brd_moveList: new Array(MAXDEPTH * MAXPOSITIONMOVES),
    brd_moveScores: new Array(MAXDEPTH * MAXPOSITIONMOVES),
    brd_moveListStart: new Array(MAXDEPTH),
    brd_PvTable: [],
    brd_PvArray: new Array(MAXDEPTH),
    brd_searchHistory: new Array(BRD_PCE_NUM * BRD_SQ_NUM),
    brd_searchKillers: new Array(3 * MAXDEPTH),
    // ── Search state (Search.js) ──
    srch_thinking: false,
    srch_stop: false,
    srch_nodes: 0,
    srch_fh: 0,
    srch_fhf: 0,
    srch_depth: 0,
    srch_time: 3e3,
    srch_start: 0,
    srch_best: 0,
    srch_history: 0,
    // ── Evaluator state ──
    PawnRanksWhite: new Array(10),
    PawnRanksBlack: new Array(10),
    // ── Perft ──
    perft_leafNodes: 0,
    // ── Game controller ──
    GameController: {
      EngineSide: COLOURS.BOTH,
      PlayerSide: COLOURS.BOTH,
      BoardFlipped: false,
      GameOver: false,
      GameSaved: true
    }
  };
  function HASH_PCE(pce, sq) {
    S.brd_posKey ^= S.PieceKeys[pce * 195 + sq];
  }
  function HASH_CA() {
    S.brd_posKey ^= S.CastleKeys[S.brd_castlePerm];
  }
  function HASH_SIDE() {
    S.brd_posKey ^= S.SideKey;
  }
  function HASH_EP() {
    S.brd_posKey ^= S.PieceKeys[S.brd_enPas];
  }
  function SQCENTER(sq, piece) {
    if (sq !== 97) return false;
    if (S.variantId === 1) return true;
    if (S.variantId === 0 && piece !== PIECES.wS && piece !== PIECES.wP && piece !== PIECES.bS && piece !== PIECES.bP)
      return true;
    return false;
  }
  function SQOFFBOARD(sq) {
    return S.FilesBrd[sq] === SQUARES.OFFBOARD;
  }
  function SQ121(sq195) {
    return S.Sq195ToSq121[sq195];
  }
  function SQ195(sq121) {
    return S.Sq121ToSq195[sq121];
  }
  function MIRROR121(sq) {
    return Mirror121[sq];
  }
  function debuglog(_message) {
    if (S.debug_log) {
      console.log(`debug::${_message}`);
    }
  }

  // src/engine/movehandler.ts
  function ClearPiece(sq) {
    const pce = S.brd_pieces[sq];
    const col = PieceCol[pce];
    let t_pceNum = -1;
    HASH_PCE(pce, sq);
    S.brd_pieces[sq] = PIECES.EMPTY;
    S.brd_material[col] -= PieceVal[pce];
    for (let index = 0; index < S.brd_pceNum[pce]; ++index) {
      if (S.brd_pList[PCEINDEX(pce, index)] === sq) {
        t_pceNum = index;
        break;
      }
    }
    S.brd_pceNum[pce]--;
    S.brd_pList[PCEINDEX(pce, t_pceNum)] = S.brd_pList[PCEINDEX(pce, S.brd_pceNum[pce])];
  }
  function AddPiece(sq, pce) {
    const col = PieceCol[pce];
    HASH_PCE(pce, sq);
    S.brd_pieces[sq] = pce;
    S.brd_material[col] += PieceVal[pce];
    S.brd_pList[PCEINDEX(pce, S.brd_pceNum[pce])] = sq;
    S.brd_pceNum[pce]++;
  }
  function MovePiece(from, to) {
    const pce = S.brd_pieces[from];
    HASH_PCE(pce, from);
    S.brd_pieces[from] = PIECES.EMPTY;
    HASH_PCE(pce, to);
    S.brd_pieces[to] = pce;
    for (let index = 0; index < S.brd_pceNum[pce]; ++index) {
      if (S.brd_pList[PCEINDEX(pce, index)] === from) {
        S.brd_pList[PCEINDEX(pce, index)] = to;
        break;
      }
    }
  }
  function MakeMove(move) {
    const from = FROMSQ(move);
    const to = TOSQ(move);
    const side = S.brd_side;
    S.brd_history[S.brd_hisPly].posKey = S.brd_posKey;
    if ((move & MFLAGEP) !== 0) {
      if (side === COLOURS.WHITE) {
        ClearPiece(to - 13);
      } else {
        ClearPiece(to + 13);
      }
    } else if ((move & MFLAGCA) !== 0) {
      switch (to) {
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
        default:
          break;
      }
    } else if ((move & MFLAGRZ) !== 0) {
      switch (to) {
        case SQUARES.H2:
          ClearPiece(SQUARES.G2);
          AddPiece(SQUARES.G2, PIECES.wB);
          ClearPiece(SQUARES.H2);
          if (S.variant === "Oriental") {
            AddPiece(SQUARES.H2, PIECES.wC);
          } else {
            AddPiece(SQUARES.H2, PIECES.wS);
          }
          break;
        case SQUARES.H10:
          ClearPiece(SQUARES.G10);
          AddPiece(SQUARES.G10, PIECES.bB);
          ClearPiece(SQUARES.H10);
          if (S.variant === "Oriental") {
            AddPiece(SQUARES.H10, PIECES.bC);
          } else {
            AddPiece(SQUARES.H10, PIECES.bS);
          }
          break;
        default:
          break;
      }
    }
    if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    S.brd_history[S.brd_hisPly].move = move;
    S.brd_history[S.brd_hisPly].fiftyMove = S.brd_fiftyMove;
    S.brd_history[S.brd_hisPly].enPas = S.brd_enPas;
    S.brd_history[S.brd_hisPly].castlePerm = S.brd_castlePerm;
    S.brd_castlePerm &= CastlePerm[from];
    S.brd_castlePerm &= CastlePerm[to];
    S.brd_enPas = SQUARES.NO_SQ;
    HASH_CA();
    const captured = CAPTURED(move);
    S.brd_fiftyMove++;
    if (captured !== PIECES.EMPTY) {
      ClearPiece(to);
      S.brd_fiftyMove = 0;
    }
    S.brd_hisPly++;
    S.brd_ply++;
    if (PiecePawn[S.brd_pieces[from]]) {
      S.brd_fiftyMove = 0;
      if ((move & MFLAGPS) !== 0) {
        if (side === COLOURS.WHITE) {
          S.brd_enPas = from + 13;
        } else {
          S.brd_enPas = from - 13;
        }
        HASH_EP();
      }
    }
    if ((move & MFLAGRZ) === 0) MovePiece(from, to);
    const prPce = PROMOTED(move);
    if (prPce !== PIECES.EMPTY) {
      ClearPiece(to);
      AddPiece(to, prPce);
    }
    S.brd_side ^= 1;
    HASH_SIDE();
    if (SqAttacked(S.brd_pList[PCEINDEX(Kings[side], 0)], S.brd_side)) {
      TakeMove();
      return false;
    }
    return true;
  }
  function TakeMove() {
    S.brd_hisPly--;
    S.brd_ply--;
    const move = S.brd_history[S.brd_hisPly].move;
    const from = FROMSQ(move);
    const to = TOSQ(move);
    if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    S.brd_castlePerm = S.brd_history[S.brd_hisPly].castlePerm;
    S.brd_fiftyMove = S.brd_history[S.brd_hisPly].fiftyMove;
    S.brd_enPas = S.brd_history[S.brd_hisPly].enPas;
    if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    S.brd_side ^= 1;
    HASH_SIDE();
    if ((MFLAGEP & move) !== 0) {
      if (S.brd_side === COLOURS.WHITE) {
        AddPiece(to - 13, PIECES.bP);
      } else {
        AddPiece(to + 13, PIECES.wP);
      }
    } else if ((MFLAGCA & move) !== 0) {
      switch (to) {
        case SQUARES.D2:
          MovePiece(SQUARES.E2, SQUARES.B2);
          break;
        case SQUARES.D10:
          MovePiece(SQUARES.E10, SQUARES.B10);
          break;
        case SQUARES.I2:
          MovePiece(SQUARES.H2, SQUARES.J2);
          break;
        case SQUARES.I10:
          MovePiece(SQUARES.H10, SQUARES.J10);
          break;
        default:
          break;
      }
    } else if ((move & MFLAGRZ) !== 0) {
      switch (to) {
        case SQUARES.H2:
          ClearPiece(SQUARES.G2);
          if (S.variant === "Oriental") {
            AddPiece(SQUARES.G2, PIECES.wC);
          } else {
            AddPiece(SQUARES.G2, PIECES.wS);
          }
          ClearPiece(SQUARES.H2);
          AddPiece(SQUARES.H2, PIECES.wB);
          break;
        case SQUARES.H10:
          ClearPiece(SQUARES.G10);
          if (S.variant === "Oriental") {
            AddPiece(SQUARES.G10, PIECES.bC);
          } else {
            AddPiece(SQUARES.G10, PIECES.bS);
          }
          ClearPiece(SQUARES.H10);
          AddPiece(SQUARES.H10, PIECES.bB);
          break;
        default:
          break;
      }
    }
    if ((move & MFLAGRZ) === 0) MovePiece(to, from);
    const captured = CAPTURED(move);
    if (captured !== PIECES.EMPTY) {
      AddPiece(to, captured);
    }
    if (PROMOTED(move) !== PIECES.EMPTY) {
      ClearPiece(from);
      AddPiece(from, PieceCol[PROMOTED(move)] === COLOURS.WHITE ? PIECES.wP : PIECES.bP);
    }
  }

  // src/engine/movegen.ts
  var GenerateCapturesNum = 0;
  var GenerateMovesNum = 0;
  var VictimScore = [
    0,
    100,
    200,
    300,
    400,
    500,
    600,
    700,
    800,
    900,
    1e3,
    100,
    200,
    300,
    400,
    500,
    600,
    700,
    800,
    900,
    1e3
  ];
  var MvvLvaScores = new Array(22 * 22);
  function InitMvvLva() {
    for (let Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
      for (let Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
        MvvLvaScores[Victim * 22 + Attacker] = VictimScore[Victim] + 6 - VictimScore[Attacker] / 100;
      }
    }
  }
  var gen_m = 0;
  function ResetMoveCounters() {
    GenerateCapturesNum = 0;
    GenerateMovesNum = 0;
    gen_m = 0;
  }
  function ReadMoveCounters() {
    return { GenerateCapturesNum, GenerateMovesNum, gen_m };
  }
  function MOVE(from, to, captured, promoted, flag) {
    gen_m++;
    return from | to << 8 | captured << 16 | promoted << 23 | flag;
  }
  function LsbExist(side) {
    if (side === COLOURS.WHITE) {
      const pceType = PIECES.wB;
      for (let pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
        const sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
        if (S.brd_pieces[sq] === PIECES.wB && isEven(sq)) return true;
      }
    }
    if (side === COLOURS.BLACK) {
      const pceType = PIECES.bB;
      for (let pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
        const sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
        if (S.brd_pieces[sq] === PIECES.bB && isEven(sq)) return true;
      }
    }
    return false;
  }
  function isEven(n) {
    return n % 2 === 0;
  }
  function MoveExists(move) {
    if (move === NOMOVE) return false;
    GenerateMoves();
    for (let index = S.brd_moveListStart[S.brd_ply]; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
      const moveFound = S.brd_moveList[index];
      if (!MakeMove(moveFound)) continue;
      TakeMove();
      if (move === moveFound) return true;
    }
    return false;
  }
  function AddCaptureMove(move) {
    S.brd_moveList[S.brd_moveListStart[S.brd_ply + 1]] = move;
    S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]++] = MvvLvaScores[CAPTURED(move) * BRD_PCE_NUM + S.brd_pieces[FROMSQ(move)]] + 1e6;
  }
  function AddQuietMove(move) {
    S.brd_moveList[S.brd_moveListStart[S.brd_ply + 1]] = move;
    if (S.brd_searchKillers[S.brd_ply] === move) {
      S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]] = 9e5;
    } else if (S.brd_searchKillers[MAXDEPTH + S.brd_ply] === move) {
      S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]] = 8e5;
    } else {
      S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]] = S.brd_searchHistory[S.brd_pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
    }
    S.brd_moveListStart[S.brd_ply + 1]++;
  }
  function AddEnPassantMove(move) {
    S.brd_moveList[S.brd_moveListStart[S.brd_ply + 1]] = move;
    S.brd_moveScores[S.brd_moveListStart[S.brd_ply + 1]++] = 105 + 1e6;
  }
  function AddWhitePawnCaptureMove(from, to, cap) {
    if (S.RanksBrd[from] === RANKS.RANK_9) {
      AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
      AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
      AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
      AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
    } else {
      AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
  }
  function AddWhitePawnQuietMove(from, to) {
    if (S.RanksBrd[from] === RANKS.RANK_9) {
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
    } else {
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
  }
  function AddBlackPawnCaptureMove(from, to, cap) {
    if (S.RanksBrd[from] === RANKS.RANK_3) {
      AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
      AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
      AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
      AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
    } else {
      AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
  }
  function AddBlackPawnQuietMove(from, to) {
    if (S.RanksBrd[from] === RANKS.RANK_3) {
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
    } else {
      AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
  }
  function GenerateMoves() {
    S.brd_moveListStart[S.brd_ply + 1] = S.brd_moveListStart[S.brd_ply];
    let pceType;
    let pceNum;
    let pceIndex;
    let pce;
    let sq;
    let index;
    let dir;
    let t_sq;
    if (S.brd_side === COLOURS.WHITE) {
      pceType = PIECES.wP;
      for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
        if (S.brd_pieces[sq + 13] === PIECES.EMPTY && !SQCENTER(sq + 13, PIECES.wP)) {
          AddWhitePawnQuietMove(sq, sq + 13);
          if (S.RanksBrd[sq] === RANKS.RANK_3 && S.brd_pieces[sq + 26] === PIECES.EMPTY) {
            AddQuietMove(MOVE(sq, sq + 26, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
          }
        }
        if (!SQOFFBOARD(sq + 12) && !SQCENTER(sq + 12, PIECES.wP) && PieceCol[S.brd_pieces[sq + 12]] === COLOURS.BLACK) {
          AddWhitePawnCaptureMove(sq, sq + 12, S.brd_pieces[sq + 12]);
        }
        if (!SQOFFBOARD(sq + 14) && !SQCENTER(sq + 14, PIECES.wP) && PieceCol[S.brd_pieces[sq + 14]] === COLOURS.BLACK) {
          AddWhitePawnCaptureMove(sq, sq + 14, S.brd_pieces[sq + 14]);
        }
        if (S.brd_enPas !== SQUARES.NO_SQ) {
          if (sq + 12 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq + 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
          if (sq + 14 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq + 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
        }
      }
      if (S.brd_castlePerm & CASTLEBIT.WKCA) {
        if (S.brd_pieces[SQUARES.G2] === PIECES.EMPTY && S.brd_pieces[SQUARES.H2] === PIECES.EMPTY && S.brd_pieces[SQUARES.I2] === PIECES.EMPTY) {
          if (!SqAttacked(SQUARES.F2, COLOURS.BLACK) && !SqAttacked(SQUARES.G2, COLOURS.BLACK) && !SqAttacked(SQUARES.H2, COLOURS.BLACK) && !SqAttacked(SQUARES.I2, COLOURS.BLACK)) {
            AddQuietMove(MOVE(SQUARES.F2, SQUARES.I2, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
          }
        }
      }
      if (S.brd_castlePerm & CASTLEBIT.WQCA) {
        if (S.brd_pieces[SQUARES.E2] === PIECES.EMPTY && S.brd_pieces[SQUARES.D2] === PIECES.EMPTY && S.brd_pieces[SQUARES.C2] === PIECES.EMPTY) {
          if (!SqAttacked(SQUARES.F2, COLOURS.BLACK) && !SqAttacked(SQUARES.E2, COLOURS.BLACK) && !SqAttacked(SQUARES.D2, COLOURS.BLACK)) {
            AddQuietMove(MOVE(SQUARES.F2, SQUARES.D2, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
          }
        }
      }
      if (S.brd_pieces[SQUARES.G2] === PIECES.wS && S.brd_pieces[SQUARES.H2] === PIECES.wB) {
        AddQuietMove(MOVE(SQUARES.G2, SQUARES.H2, PIECES.EMPTY, PIECES.EMPTY, MFLAGRZ));
      }
    } else {
      pceType = PIECES.bP;
      for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
        if (S.brd_pieces[sq - 13] === PIECES.EMPTY && !SQCENTER(sq - 13, PIECES.bP)) {
          AddBlackPawnQuietMove(sq, sq - 13);
          if (S.RanksBrd[sq] === RANKS.RANK_9 && S.brd_pieces[sq - 26] === PIECES.EMPTY) {
            AddQuietMove(MOVE(sq, sq - 26, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
          }
        }
        if (!SQOFFBOARD(sq - 12) && !SQCENTER(sq - 12, PIECES.bP) && PieceCol[S.brd_pieces[sq - 12]] === COLOURS.WHITE) {
          AddBlackPawnCaptureMove(sq, sq - 12, S.brd_pieces[sq - 12]);
        }
        if (!SQOFFBOARD(sq - 14) && !SQCENTER(sq - 14, PIECES.bP) && PieceCol[S.brd_pieces[sq - 14]] === COLOURS.WHITE) {
          AddBlackPawnCaptureMove(sq, sq - 14, S.brd_pieces[sq - 14]);
        }
        if (S.brd_enPas !== SQUARES.NO_SQ) {
          if (sq - 12 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq - 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
          if (sq - 14 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq - 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
        }
      }
      if (S.brd_castlePerm & CASTLEBIT.BKCA) {
        if (S.brd_pieces[SQUARES.G10] === PIECES.EMPTY && S.brd_pieces[SQUARES.H10] === PIECES.EMPTY && S.brd_pieces[SQUARES.I10] === PIECES.EMPTY) {
          if (!SqAttacked(SQUARES.F10, COLOURS.WHITE) && !SqAttacked(SQUARES.G10, COLOURS.WHITE) && !SqAttacked(SQUARES.H10, COLOURS.WHITE) && !SqAttacked(SQUARES.I10, COLOURS.WHITE)) {
            AddQuietMove(MOVE(SQUARES.F10, SQUARES.I10, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
          }
        }
      }
      if (S.brd_castlePerm & CASTLEBIT.BQCA) {
        if (S.brd_pieces[SQUARES.E10] === PIECES.EMPTY && S.brd_pieces[SQUARES.D10] === PIECES.EMPTY && S.brd_pieces[SQUARES.C10] === PIECES.EMPTY) {
          if (!SqAttacked(SQUARES.F10, COLOURS.WHITE) && !SqAttacked(SQUARES.E10, COLOURS.WHITE) && !SqAttacked(SQUARES.D10, COLOURS.WHITE)) {
            AddQuietMove(MOVE(SQUARES.F10, SQUARES.D10, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
          }
        }
      }
      if (S.brd_pieces[SQUARES.G10] === PIECES.bS && S.brd_pieces[SQUARES.H10] === PIECES.bB) {
        AddQuietMove(MOVE(SQUARES.G10, SQUARES.H10, PIECES.EMPTY, PIECES.EMPTY, MFLAGRZ));
      }
    }
    pceIndex = LoopSlideIndex[S.brd_side];
    pce = LoopSlidePce[pceIndex++];
    while (pce !== 0) {
      const dirs = PceDirSlide[pce];
      const nDirs = DirNumSlide[pce];
      for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        for (index = 0; index < nDirs; ++index) {
          dir = dirs[index];
          t_sq = sq + dir;
          while (!SQOFFBOARD(t_sq)) {
            const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
            const tPiece = S.brd_pieces[t_sq];
            if (tPiece !== PIECES.EMPTY && !centerBlock) {
              if (PieceCol[tPiece] !== S.brd_side) {
                AddCaptureMove(MOVE(sq, t_sq, tPiece, PIECES.EMPTY, 0));
              }
              break;
            }
            if (!centerBlock) AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
            if (centerBlock && tPiece !== PIECES.EMPTY) break;
            t_sq += dir;
          }
        }
      }
      pce = LoopSlidePce[pceIndex++];
    }
    pceIndex = LoopNonSlideIndex[S.brd_side];
    pce = LoopNonSlidePce[pceIndex++];
    while (pce !== 0) {
      const dirs = PceDirNonSlide[pce];
      const nDirs = DirNumNonSlide[pce];
      for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        for (index = 0; index < nDirs; ++index) {
          dir = dirs[index];
          t_sq = sq + dir;
          if (SQOFFBOARD(t_sq)) continue;
          const centerBlock = SQCENTER(t_sq, S.brd_pieces[sq]);
          const tPiece = S.brd_pieces[t_sq];
          if (tPiece !== PIECES.EMPTY && !centerBlock) {
            if (PieceCol[tPiece] !== S.brd_side) {
              AddCaptureMove(MOVE(sq, t_sq, tPiece, PIECES.EMPTY, 0));
            }
            continue;
          }
          if (!centerBlock) AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
        }
      }
      pce = LoopNonSlidePce[pceIndex++];
    }
    ++GenerateMovesNum;
  }
  function GenerateCaptures() {
    S.brd_moveListStart[S.brd_ply + 1] = S.brd_moveListStart[S.brd_ply];
    let pceType;
    let pceNum;
    let pceIndex;
    let pce;
    let sq;
    let index;
    let dir;
    let t_sq;
    if (S.brd_side === COLOURS.WHITE) {
      pceType = PIECES.wP;
      for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
        if (!SQOFFBOARD(sq + 12) && !SQCENTER(sq + 12, PIECES.wP) && PieceCol[S.brd_pieces[sq + 12]] === COLOURS.BLACK) {
          AddWhitePawnCaptureMove(sq, sq + 12, S.brd_pieces[sq + 12]);
        }
        if (!SQOFFBOARD(sq + 14) && !SQCENTER(sq + 14, PIECES.wP) && PieceCol[S.brd_pieces[sq + 14]] === COLOURS.BLACK) {
          AddWhitePawnCaptureMove(sq, sq + 14, S.brd_pieces[sq + 14]);
        }
        if (S.brd_enPas !== SQUARES.NO_SQ) {
          if (sq + 12 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq + 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
          if (sq + 14 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq + 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
        }
      }
    } else {
      pceType = PIECES.bP;
      for (pceNum = 0; pceNum < S.brd_pceNum[pceType]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pceType, pceNum)];
        if (!SQOFFBOARD(sq - 12) && !SQCENTER(sq - 12, PIECES.bP) && PieceCol[S.brd_pieces[sq - 12]] === COLOURS.WHITE) {
          AddBlackPawnCaptureMove(sq, sq - 12, S.brd_pieces[sq - 12]);
        }
        if (!SQOFFBOARD(sq - 14) && !SQCENTER(sq - 14, PIECES.bP) && PieceCol[S.brd_pieces[sq - 14]] === COLOURS.WHITE) {
          AddBlackPawnCaptureMove(sq, sq - 14, S.brd_pieces[sq - 14]);
        }
        if (S.brd_enPas !== SQUARES.NO_SQ) {
          if (sq - 12 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq - 12, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
          if (sq - 14 === S.brd_enPas) {
            AddEnPassantMove(MOVE(sq, sq - 14, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
          }
        }
      }
    }
    pceIndex = LoopSlideIndex[S.brd_side];
    pce = LoopSlidePce[pceIndex++];
    while (pce !== 0) {
      for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        for (index = 0; index < DirNumSlide[pce]; ++index) {
          dir = PceDirSlide[pce][index];
          t_sq = sq + dir;
          while (!SQOFFBOARD(t_sq)) {
            if (S.brd_pieces[t_sq] !== PIECES.EMPTY && !SQCENTER(t_sq, S.brd_pieces[sq])) {
              if (PieceCol[S.brd_pieces[t_sq]] !== S.brd_side) {
                AddCaptureMove(MOVE(sq, t_sq, S.brd_pieces[t_sq], PIECES.EMPTY, 0));
              }
              break;
            }
            t_sq += dir;
          }
        }
      }
      pce = LoopSlidePce[pceIndex++];
    }
    pceIndex = LoopNonSlideIndex[S.brd_side];
    pce = LoopNonSlidePce[pceIndex++];
    while (pce !== 0) {
      for (pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        for (index = 0; index < DirNumNonSlide[pce]; ++index) {
          dir = PceDirNonSlide[pce][index];
          t_sq = sq + dir;
          if (SQOFFBOARD(t_sq)) continue;
          if (S.brd_pieces[t_sq] !== PIECES.EMPTY && !SQCENTER(t_sq, S.brd_pieces[sq])) {
            if (PieceCol[S.brd_pieces[t_sq]] !== S.brd_side) {
              AddCaptureMove(MOVE(sq, t_sq, S.brd_pieces[t_sq], PIECES.EMPTY, 0));
            }
          }
        }
      }
      pce = LoopNonSlidePce[pceIndex++];
    }
    ++GenerateCapturesNum;
  }

  // src/engine/input.ts
  function SqFromAlg(moveAlg) {
    if (moveAlg.length > 8) return SQUARES.NO_SQ;
    const file = moveAlg[0].charCodeAt(0) - "a".charCodeAt(0);
    const rank = moveAlg.substring(1) - 1;
    return FR2SQ(file, rank);
  }
  function PrSq(sq) {
    const file = S.FilesBrd[sq];
    const rank = S.RanksBrd[sq];
    const sqStr = String.fromCharCode("a".charCodeAt(0) + file) + (rank + 1);
    return sqStr;
  }
  function PrMoveWithPieces(move) {
    let MvStr;
    const ff = S.FilesBrd[FROMSQ(move)];
    const rf = S.RanksBrd[FROMSQ(move)];
    const ft = S.FilesBrd[TOSQ(move)];
    const rt = S.RanksBrd[TOSQ(move)];
    MvStr = `${String.fromCharCode("a".charCodeAt(0) + ff) + (rf + 1)}-${String.fromCharCode("a".charCodeAt(0) + ft)}${rt + 1}`;
    if ((move & MFLAGRZ) !== 0) {
      MvStr += " [Rendezvous]";
      return MvStr;
    }
    if (PIECE_NAMES[S.brd_pieces[TOSQ(move)]] !== "EMPTY") {
      MvStr += ` [Captures ${PIECE_NAMES[S.brd_pieces[TOSQ(move)]]}]`;
      return MvStr;
    }
    return MvStr;
  }
  function PrMove(move) {
    const ff = S.FilesBrd[FROMSQ(move)];
    const rf = S.RanksBrd[FROMSQ(move)];
    const ft = S.FilesBrd[TOSQ(move)];
    const rt = S.RanksBrd[TOSQ(move)];
    let MvStr = `${String.fromCharCode("a".charCodeAt(0) + ff) + (rf + 1)}-${String.fromCharCode("a".charCodeAt(0) + ft)}${rt + 1}`;
    const promoted = PROMOTED(move);
    if (promoted !== PIECES.EMPTY) {
      let pchar = "q";
      if (PieceKnight[promoted]) {
        pchar = "n";
      } else if (PieceRookFortressQueen[promoted] && !PieceBishopPrincessQueen[promoted]) {
        pchar = "r";
      } else if (!PieceRookFortressQueen[promoted] && PieceBishopPrincessQueen[promoted]) {
        pchar = "b";
      }
      MvStr += pchar;
    }
    return MvStr;
  }
  function ParseMove(from, to) {
    GenerateMoves();
    let Move = NOMOVE;
    let PromPce = PIECES.EMPTY;
    let found = false;
    for (let index = S.brd_moveListStart[S.brd_ply]; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
      Move = S.brd_moveList[index];
      if (FROMSQ(Move) === from && TOSQ(Move) === to) {
        PromPce = PROMOTED(Move);
        if (PromPce !== PIECES.EMPTY) {
          if (PromPce === PIECES.wQ && S.brd_side === COLOURS.WHITE || PromPce === PIECES.bQ && S.brd_side === COLOURS.BLACK) {
            found = true;
            break;
          }
          continue;
        }
        found = true;
        break;
      }
    }
    if (found) {
      if (!MakeMove(Move)) return NOMOVE;
      TakeMove();
      return Move;
    }
    return NOMOVE;
  }
  function SanityCheck(move) {
    if (S.brd_pieces[FROMSQ(move)] === 0) return false;
    return true;
  }

  // src/engine/board.ts
  function BoardToFen() {
    let fenStr = "";
    const _emptyCount = 0;
    for (let rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
      for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
        const sq = FR2SQ(file, rank);
        const piece = S.brd_pieces[sq];
        if (piece === PIECES.EMPTY || piece === SQUARES.OFFBOARD) {
          fenStr += "1";
        } else {
          fenStr += PceChar[piece];
        }
      }
      if (rank !== RANKS.RANK_1) {
        fenStr += "/";
      } else {
        fenStr += " ";
      }
    }
    fenStr += `${SideChar[S.brd_side]} `;
    if (S.brd_castlePerm === 0) {
      fenStr += "- ";
    } else {
      if (S.brd_castlePerm & CASTLEBIT.WKCA) fenStr += "K";
      if (S.brd_castlePerm & CASTLEBIT.WQCA) fenStr += "Q";
      if (S.brd_castlePerm & CASTLEBIT.BKCA) fenStr += "k";
      if (S.brd_castlePerm & CASTLEBIT.BQCA) fenStr += "q";
      fenStr += " ";
    }
    if (S.brd_enPas === SQUARES.NO_SQ) {
      fenStr += "- ";
    } else {
      fenStr += `${PrSq(S.brd_enPas)} `;
    }
    fenStr += S.brd_fiftyMove;
    if (S.brd_hisPly > 2) {
      fenStr += " ";
      let tempHalfMove = S.brd_hisPly;
      if (S.brd_side === COLOURS.BLACK) {
        tempHalfMove--;
      }
      let pLy = tempHalfMove / 2;
      if (pLy < 1) pLy = 1;
      fenStr += pLy;
    }
    return fenStr;
  }
  function printGameLine() {
    let gameLine = "";
    for (let moveNum = 0; moveNum < S.brd_hisPly; ++moveNum) {
      gameLine += `${PrMove(S.brd_history[moveNum].move)} `;
    }
    return gameLine.trim();
  }
  function UpdateListsMaterial() {
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
      const sq = index;
      const piece = S.brd_pieces[index];
      if (piece !== SQUARES.OFFBOARD && piece !== PIECES.EMPTY) {
        const colour = PieceCol[piece];
        S.brd_material[colour] += PieceVal[piece];
        S.brd_pList[PCEINDEX(piece, S.brd_pceNum[piece])] = sq;
        S.brd_pceNum[piece]++;
      }
    }
  }
  function GeneratePosKey() {
    let finalKey = 0;
    for (let sq = 0; sq < BRD_SQ_NUM; ++sq) {
      const piece = S.brd_pieces[sq];
      if (piece !== PIECES.EMPTY && piece !== SQUARES.OFFBOARD) {
        finalKey ^= S.PieceKeys[piece * 195 + sq];
      }
    }
    if (S.brd_side === COLOURS.WHITE) {
      finalKey ^= S.SideKey;
    }
    if (S.brd_enPas !== SQUARES.NO_SQ) {
      finalKey ^= S.PieceKeys[S.brd_enPas];
    }
    finalKey ^= S.CastleKeys[S.brd_castlePerm];
    return finalKey;
  }
  function PrintBoard() {
    debuglog("\nGame Board:\n");
    for (let rank = RANKS.RANK_11; rank >= RANKS.RANK_1; rank--) {
      let line2 = "";
      if (rank + 1 > 9) line2 = `${rank + 1}|`;
      else line2 = `${rank + 1} |`;
      for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
        const sq = FR2SQ(file, rank);
        const piece = S.brd_pieces[sq];
        if (piece === SQUARES.OFFBOARD) line2 += " * ";
        else line2 += ` ${PceChar[piece]} `;
      }
      debuglog(line2);
    }
    debuglog("");
    let line = "   ";
    for (let file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
      line += ` ${FileChar.charAt(file)} `;
    }
    debuglog(line);
    debuglog("");
    debuglog(`side:${SideChar[S.brd_side]}`);
    debuglog(`enPas:${S.brd_enPas}`);
    line = "";
    if (S.brd_castlePerm & CASTLEBIT.WKCA) line += "K";
    if (S.brd_castlePerm & CASTLEBIT.WQCA) line += "Q";
    if (S.brd_castlePerm & CASTLEBIT.BKCA) line += "k";
    if (S.brd_castlePerm & CASTLEBIT.BQCA) line += "q";
    debuglog(`castle:${line}`);
    debuglog(`key:${S.brd_posKey.toString(16)}`);
  }
  function ResetBoard() {
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
      S.brd_pieces[index] = SQUARES.OFFBOARD;
    }
    for (let index = 0; index < 121; ++index) {
      if (FrameSQ.indexOf(SQ195(index)) > -1) S.brd_pieces[SQ195(index)] = SQUARES.OFFBOARD;
      else S.brd_pieces[SQ195(index)] = PIECES.EMPTY;
    }
    for (let index = 0; index < 22 * 11; ++index) {
      S.brd_pList[index] = PIECES.EMPTY;
    }
    for (let index = 0; index < 2; ++index) {
      S.brd_material[index] = 0;
    }
    for (let index = 0; index < 21; ++index) {
      S.brd_pceNum[index] = 0;
    }
    S.brd_side = COLOURS.BOTH;
    S.brd_enPas = SQUARES.NO_SQ;
    S.brd_fiftyMove = 0;
    S.brd_ply = 0;
    S.brd_hisPly = 0;
    S.brd_castlePerm = 0;
    S.brd_posKey = 0;
    S.brd_moveListStart[S.brd_ply] = 0;
  }
  function ParseFen(fen) {
    let rank = RANKS.RANK_11;
    let file = FILES.FILE_A;
    let piece = 0;
    let count = 0;
    let i = 0;
    let sq121 = 0;
    let sq195 = 0;
    let fenCnt = 0;
    ResetBoard();
    while (rank >= RANKS.RANK_1 && fenCnt < fen.length) {
      count = 1;
      switch (fen[fenCnt]) {
        case "p":
          piece = PIECES.bP;
          break;
        case "r":
          piece = PIECES.bR;
          break;
        case "n":
          piece = PIECES.bN;
          break;
        case "w":
          piece = PIECES.bW;
          break;
        case "c":
          piece = PIECES.bC;
          break;
        case "b":
          piece = PIECES.bB;
          break;
        case "s":
          piece = PIECES.bS;
          break;
        case "f":
          piece = PIECES.bF;
          break;
        case "k":
          piece = PIECES.bK;
          break;
        case "q":
          piece = PIECES.bQ;
          break;
        case "P":
          piece = PIECES.wP;
          break;
        case "R":
          piece = PIECES.wR;
          break;
        case "N":
          piece = PIECES.wN;
          break;
        case "W":
          piece = PIECES.wW;
          break;
        case "C":
          piece = PIECES.wC;
          break;
        case "B":
          piece = PIECES.wB;
          break;
        case "S":
          piece = PIECES.wS;
          break;
        case "F":
          piece = PIECES.wF;
          break;
        case "K":
          piece = PIECES.wK;
          break;
        case "Q":
          piece = PIECES.wQ;
          break;
        case "1":
          piece = PIECES.EMPTY;
          break;
        case "/":
        case " ":
          rank--;
          file = FILES.FILE_A;
          fenCnt++;
          continue;
        default:
          debuglog("FEN error \n");
          return false;
      }
      for (i = 0; i < count; i++) {
        sq121 = rank * 11 + file;
        sq195 = SQ195(sq121);
        if (piece !== PIECES.EMPTY) {
          if (S.brd_pieces[sq195] !== SQUARES.OFFBOARD) S.brd_pieces[sq195] = piece;
        }
        file++;
      }
      fenCnt++;
    }
    S.brd_side = fen[fenCnt] === "w" ? COLOURS.WHITE : COLOURS.BLACK;
    fenCnt += 2;
    for (i = 0; i < 4; i++) {
      if (fen[fenCnt] === " ") break;
      switch (fen[fenCnt]) {
        case "K":
          S.brd_castlePerm |= CASTLEBIT.WKCA;
          break;
        case "Q":
          S.brd_castlePerm |= CASTLEBIT.WQCA;
          break;
        case "k":
          S.brd_castlePerm |= CASTLEBIT.BKCA;
          break;
        case "q":
          S.brd_castlePerm |= CASTLEBIT.BQCA;
          break;
        default:
          break;
      }
      fenCnt++;
    }
    fenCnt++;
    if (fen[fenCnt] !== "-" && fen[fenCnt] !== void 0) {
      file = fen[fenCnt].charCodeAt(0) - "a".charCodeAt(0);
      rank = fen[fenCnt + 1].charCodeAt(0) - "1".charCodeAt(0);
      debuglog(`fen[fenCnt]:${fen[fenCnt]} File:${file} Rank:${rank}`);
      S.brd_enPas = FR2SQ(file, rank);
    }
    S.brd_posKey = GeneratePosKey();
    UpdateListsMaterial();
    return true;
  }
  function SqAttacked(sq, side) {
    if (S.brd_pieces[sq] === SQUARES.OFFBOARD) return false;
    if (S.variant === "Pyramid" && ASEDIA.indexOf(sq) > -1) return true;
    if (side === COLOURS.WHITE) {
      if (S.brd_pieces[sq - 14] === PIECES.wP || S.brd_pieces[sq - 12] === PIECES.wP) return true;
    } else {
      if (S.brd_pieces[sq + 14] === PIECES.bP || S.brd_pieces[sq + 12] === PIECES.bP) return true;
    }
    for (let index = 0; index < 8; ++index) {
      const pce = S.brd_pieces[sq + KnDir[index]];
      if (pce !== SQUARES.OFFBOARD && PieceKnightPrincessFortress[pce] && PieceCol[pce] === side) return true;
    }
    for (let index = 0; index < 4; ++index) {
      const dir = RkDir[index];
      let t_sq = sq + dir;
      let pce = S.brd_pieces[t_sq];
      while (pce !== SQUARES.OFFBOARD) {
        if (pce !== PIECES.EMPTY) {
          if (PieceRookFortressQueen[pce] && PieceCol[pce] === side) return true;
          break;
        }
        t_sq += dir;
        pce = S.brd_pieces[t_sq];
      }
    }
    for (let index = 0; index < 4; ++index) {
      const dir = BiDir[index];
      let t_sq = sq + dir;
      let pce = S.brd_pieces[t_sq];
      while (pce !== SQUARES.OFFBOARD) {
        if (pce !== PIECES.EMPTY) {
          if (PieceBishopPrincessQueen[pce] && PieceCol[pce] === side) return true;
          break;
        }
        t_sq += dir;
        pce = S.brd_pieces[t_sq];
      }
    }
    if (S.variant === "Oriental") {
      for (let index = 0; index < 12; ++index) {
        const pce = S.brd_pieces[sq + WzDir[index]];
        if (pce !== SQUARES.OFFBOARD && PieceWizard[pce] && PieceCol[pce] === side) return true;
      }
      for (let index = 0; index < 12; ++index) {
        const pce = S.brd_pieces[sq + ChDir[index]];
        if (pce !== SQUARES.OFFBOARD && PieceChampion[pce] && PieceCol[pce] === side) return true;
      }
    }
    for (let index = 0; index < 8; ++index) {
      const pce = S.brd_pieces[sq + KiDir[index]];
      if (pce !== SQUARES.OFFBOARD && PieceKing[pce] && PieceCol[pce] === side) return true;
    }
    return false;
  }

  // src/engine/eval.ts
  var RookOpenFile = 10;
  var RookSemiOpenFile = 5;
  var QueenOpenFile = 5;
  var QueenSemiOpenFile = 3;
  var BishopPair = 30;
  var LightSquareBishop = 60;
  var PawnIsolated = -10;
  var PawnPassed = [0, 5, 10, 20, 35, 60, 100, 200, 300];
  var PawnTable = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    0,
    -10,
    -10,
    -10,
    0,
    10,
    5,
    0,
    0,
    15,
    0,
    0,
    5,
    5,
    5,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    10,
    20,
    20,
    20,
    10,
    0,
    0,
    0,
    0,
    5,
    5,
    5,
    30,
    30,
    30,
    5,
    5,
    5,
    0,
    0,
    5,
    5,
    5,
    10,
    30,
    10,
    5,
    5,
    5,
    0,
    0,
    10,
    10,
    10,
    20,
    20,
    20,
    10,
    10,
    10,
    0,
    0,
    20,
    20,
    20,
    30,
    30,
    30,
    20,
    20,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var KnightTable = [
    -15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -15,
    0,
    0,
    -10,
    0,
    0,
    0,
    0,
    0,
    -10,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    5,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    10,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    35,
    20,
    35,
    10,
    5,
    0,
    0,
    0,
    5,
    10,
    15,
    20,
    20,
    20,
    15,
    10,
    5,
    0,
    0,
    5,
    10,
    15,
    35,
    20,
    35,
    15,
    10,
    5,
    0,
    0,
    5,
    10,
    10,
    20,
    20,
    20,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var WizardChampionTable = [
    -10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -10,
    0,
    0,
    10,
    -10,
    0,
    0,
    0,
    -10,
    10,
    0,
    0,
    0,
    15,
    0,
    0,
    10,
    10,
    10,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    10,
    15,
    15,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    20,
    20,
    20,
    15,
    10,
    0,
    0,
    0,
    0,
    10,
    15,
    20,
    20,
    20,
    15,
    10,
    0,
    0,
    0,
    0,
    10,
    15,
    20,
    20,
    20,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    15,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var BishopTable = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -10,
    0,
    0,
    0,
    -10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    15,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    20,
    20,
    20,
    15,
    10,
    0,
    0,
    0,
    0,
    10,
    15,
    20,
    20,
    20,
    15,
    10,
    0,
    0,
    0,
    0,
    10,
    15,
    20,
    20,
    20,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    15,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var RookTable = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    5,
    10,
    10,
    10,
    5,
    5,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    25,
    25,
    25,
    25,
    25,
    25,
    25,
    25,
    25,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var PrincessTable = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -10,
    0,
    0,
    0,
    -10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    15,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    35,
    20,
    35,
    15,
    10,
    0,
    0,
    0,
    0,
    10,
    15,
    25,
    70,
    25,
    15,
    10,
    0,
    0,
    0,
    0,
    10,
    15,
    35,
    20,
    35,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    10,
    15,
    15,
    15,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var FortressTable = [
    -10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -10,
    0,
    0,
    15,
    5,
    10,
    10,
    10,
    5,
    15,
    0,
    0,
    0,
    15,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    15,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    25,
    25,
    25,
    25,
    25,
    25,
    25,
    25,
    25,
    0,
    0,
    0,
    0,
    5,
    10,
    10,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var KingE = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -50,
    -10,
    0,
    0,
    0,
    0,
    0,
    -10,
    -50,
    0,
    0,
    -10,
    0,
    10,
    10,
    10,
    10,
    10,
    0,
    -10,
    0,
    0,
    0,
    10,
    20,
    20,
    30,
    20,
    20,
    10,
    0,
    0,
    0,
    0,
    10,
    20,
    40,
    50,
    40,
    20,
    10,
    0,
    0,
    0,
    0,
    10,
    20,
    40,
    0,
    40,
    20,
    10,
    0,
    0,
    0,
    0,
    10,
    20,
    40,
    50,
    40,
    20,
    10,
    0,
    0,
    0,
    0,
    10,
    20,
    20,
    30,
    20,
    20,
    10,
    0,
    0,
    0,
    -10,
    0,
    10,
    10,
    10,
    10,
    10,
    0,
    -10,
    0,
    0,
    -50,
    -10,
    0,
    0,
    0,
    0,
    0,
    -10,
    -50,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var KingO = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    5,
    -10,
    -10,
    -10,
    0,
    10,
    5,
    0,
    0,
    -30,
    -30,
    -30,
    -30,
    -30,
    -30,
    -30,
    -30,
    -30,
    0,
    0,
    -50,
    -50,
    -50,
    -50,
    -50,
    -50,
    -50,
    -50,
    -50,
    0,
    0,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    0,
    0,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    0,
    0,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    0,
    0,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    0,
    0,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    0,
    0,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    -70,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  var ENDGAME_MAT = 1 * PieceVal[PIECES.wR] + 2 * PieceVal[PIECES.wN] + 2 * PieceVal[PIECES.wP] + PieceVal[PIECES.wK];
  function PawnsInit() {
    let pce;
    let sq;
    for (let index = 0; index < 10; ++index) {
      S.PawnRanksWhite[index] = RANKS.RANK_8;
      S.PawnRanksBlack[index] = RANKS.RANK_1;
    }
    pce = PIECES.wP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      if (S.RanksBrd[sq] < S.PawnRanksWhite[S.FilesBrd[sq] + 1]) {
        S.PawnRanksWhite[S.FilesBrd[sq] + 1] = S.RanksBrd[sq];
      }
    }
    pce = PIECES.bP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      if (S.RanksBrd[sq] > S.PawnRanksBlack[S.FilesBrd[sq] + 1]) {
        S.PawnRanksBlack[S.FilesBrd[sq] + 1] = S.RanksBrd[sq];
      }
    }
  }
  function EvalPosition() {
    let pce;
    let sq;
    let score = S.brd_material[COLOURS.WHITE] - S.brd_material[COLOURS.BLACK];
    let file;
    let rank;
    PawnsInit();
    pce = PIECES.wP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score += PawnTable[SQ121(sq)];
      file = S.FilesBrd[sq] + 1;
      rank = S.RanksBrd[sq];
      if (S.PawnRanksWhite[file - 1] === RANKS.RANK_8 && S.PawnRanksWhite[file + 1] === RANKS.RANK_8) {
        score += PawnIsolated;
      }
      if (S.PawnRanksBlack[file - 1] <= rank && S.PawnRanksBlack[file] <= rank && S.PawnRanksBlack[file + 1] <= rank) {
        score += PawnPassed[rank];
      }
    }
    pce = PIECES.bP;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score -= PawnTable[MIRROR121(SQ121(sq))];
      file = S.FilesBrd[sq] + 1;
      rank = S.RanksBrd[sq];
      if (S.PawnRanksBlack[file - 1] === RANKS.RANK_1 && S.PawnRanksBlack[file + 1] === RANKS.RANK_1) {
        score -= PawnIsolated;
      }
      if (S.PawnRanksWhite[file - 1] >= rank && S.PawnRanksWhite[file] >= rank && S.PawnRanksWhite[file + 1] >= rank) {
        score -= PawnPassed[7 - rank];
      }
    }
    pce = PIECES.wN;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score += KnightTable[SQ121(sq)];
    }
    pce = PIECES.bN;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score -= KnightTable[MIRROR121(SQ121(sq))];
    }
    if (S.variant === "Oriental") {
      pce = PIECES.wW;
      for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += WizardChampionTable[SQ121(sq)];
      }
      pce = PIECES.bW;
      for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= WizardChampionTable[MIRROR121(SQ121(sq))];
      }
      pce = PIECES.wC;
      for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score += WizardChampionTable[SQ121(sq)];
      }
      pce = PIECES.bC;
      for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
        sq = S.brd_pList[PCEINDEX(pce, pceNum)];
        score -= WizardChampionTable[MIRROR121(SQ121(sq))];
      }
    }
    pce = PIECES.wB;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score += BishopTable[SQ121(sq)];
    }
    pce = PIECES.bB;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score -= BishopTable[MIRROR121(SQ121(sq))];
    }
    pce = PIECES.wR;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score += RookTable[SQ121(sq)];
      file = S.FilesBrd[sq] + 1;
      if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
        if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
          score += RookOpenFile;
        } else {
          score += RookSemiOpenFile;
        }
      }
    }
    pce = PIECES.bR;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score -= RookTable[MIRROR121(SQ121(sq))];
      file = S.FilesBrd[sq] + 1;
      if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
        if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
          score -= RookOpenFile;
        } else {
          score -= RookSemiOpenFile;
        }
      }
    }
    pce = PIECES.wS;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score += PrincessTable[SQ121(sq)];
    }
    pce = PIECES.bS;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score -= PrincessTable[MIRROR121(SQ121(sq))];
    }
    pce = PIECES.wF;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score += FortressTable[SQ121(sq)];
      file = S.FilesBrd[sq] + 1;
      if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
        if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
          score += RookOpenFile;
        } else {
          score += RookSemiOpenFile;
        }
      }
    }
    pce = PIECES.bF;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score -= FortressTable[MIRROR121(SQ121(sq))];
      file = S.FilesBrd[sq] + 1;
      if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
        if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
          score -= RookOpenFile;
        } else {
          score -= RookSemiOpenFile;
        }
      }
    }
    pce = PIECES.wQ;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score += RookTable[SQ121(sq)];
      file = S.FilesBrd[sq] + 1;
      if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
        if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
          score += QueenOpenFile;
        } else {
          score += QueenSemiOpenFile;
        }
      }
    }
    pce = PIECES.bQ;
    for (let pceNum = 0; pceNum < S.brd_pceNum[pce]; ++pceNum) {
      sq = S.brd_pList[PCEINDEX(pce, pceNum)];
      score -= RookTable[MIRROR121(SQ121(sq))];
      file = S.FilesBrd[sq] + 1;
      if (S.PawnRanksBlack[file] === RANKS.RANK_1) {
        if (S.PawnRanksWhite[file] === RANKS.RANK_8) {
          score -= QueenOpenFile;
        } else {
          score -= QueenSemiOpenFile;
        }
      }
    }
    pce = PIECES.wK;
    sq = S.brd_pList[PCEINDEX(pce, 0)];
    if (S.brd_material[COLOURS.BLACK] <= ENDGAME_MAT) {
      score += KingE[SQ121(sq)];
    } else {
      score += KingO[SQ121(sq)];
    }
    pce = PIECES.bK;
    sq = S.brd_pList[PCEINDEX(pce, 0)];
    if (S.brd_material[COLOURS.WHITE] <= ENDGAME_MAT) {
      score -= KingE[MIRROR121(SQ121(sq))];
    } else {
      score -= KingO[MIRROR121(SQ121(sq))];
    }
    if (S.brd_pceNum[PIECES.wB] >= 2) score += BishopPair;
    if (S.brd_pceNum[PIECES.bB] >= 2) score -= BishopPair;
    if (LsbExist(COLOURS.WHITE)) score += LightSquareBishop;
    if (LsbExist(COLOURS.BLACK)) score -= LightSquareBishop;
    if (S.brd_side === COLOURS.WHITE) {
      return score;
    } else {
      return -score;
    }
  }

  // src/engine/pvtable.ts
  function GetPvLine(depth) {
    let move = ProbePvTable();
    let count = 0;
    while (move !== NOMOVE && count < depth) {
      if (MoveExists(move)) {
        MakeMove(move);
        S.brd_PvArray[count++] = move;
      } else {
        break;
      }
      move = ProbePvTable();
    }
    while (S.brd_ply > 0) {
      TakeMove();
    }
    return count;
  }
  function StorePvMove(move) {
    const index = S.brd_posKey % PVENTRIES;
    S.brd_PvTable[index].move = move;
    S.brd_PvTable[index].posKey = S.brd_posKey;
  }
  function ProbePvTable() {
    const index = S.brd_posKey % PVENTRIES;
    if (S.brd_PvTable[index].posKey === S.brd_posKey) {
      return S.brd_PvTable[index].move;
    }
    return NOMOVE;
  }

  // src/engine/book.ts
  function LineMatch(BookLine, gameline) {
    for (let len = 0; len < gameline.length; ++len) {
      if (len >= BookLine.length) return false;
      if (gameline[len] !== BookLine[len]) return false;
    }
    return true;
  }
  function BookMove(return_hint) {
    const gameLine = printGameLine();
    const bookMoves = [];
    let lengthOfLineHack = gameLine.length;
    let hint2 = NOMOVE;
    if (gameLine.length === 0) lengthOfLineHack--;
    for (let bookLineNum = 0; bookLineNum < brd_bookLines.length; ++bookLineNum) {
      if (LineMatch(brd_bookLines[bookLineNum], gameLine)) {
        let move = brd_bookLines[bookLineNum].substr(lengthOfLineHack + 1);
        if (move.indexOf(" ") !== -1) {
          const hintLine = move.substr(move.indexOf(" ") + 1);
          move = move.substr(0, move.indexOf(" "));
          if (hintLine.indexOf(" ") !== -1) {
            hint2 = hintLine.substr(0, hintLine.indexOf(" "));
          }
        }
        if (move.length > 4 && move.length < 8) {
          const from = SqFromAlg(move.split("-")[0]);
          const to = SqFromAlg(move.split("-")[1]);
          const varInternalMove = ParseMove(from, to);
          bookMoves.push(varInternalMove);
        }
      }
    }
    if (bookMoves.length === 0) return NOMOVE;
    const num = Math.floor(Math.random() * bookMoves.length);
    if (return_hint) {
      return hint2;
    } else {
      return bookMoves[num];
    }
  }
  var brd_bookLines = [
    //F3-F5
    "f3-f5 e9-e7 g3-g5 f9-f7 j3-j4 j9-j8 k1-j3 k11-j9",
    "f3-f5 e9-e7 g3-g5 f9-f7 e3-e5 g9-g7 i2-h4 g10-h10 g2-h2 d10-f8 d2-f4 i10-h8",
    "f3-f5 e9-e7 i2-h4 g10-h10 g2-h2 f9-f7 g3-g4 g9-g7 c2-d4 d10-f8",
    "f3-f5 e9-e7 e3-e4 g10-h10 i2-h4 f9-f7 g3-g5 g9-g7 g2-h2 d10-f8",
    "f3-f5 e9-e7 e3-e5 g10-h10 g3-g5 g9-g7 c2-d4 f9-f7",
    "f3-f5 e9-e7 j3-j4 g10-h10 g3-g5 h10-i8 c2-d4 d10-g7 e2-g4 f9-f7",
    "f3-f5 e9-e7 g3-g5 f9-f7 e3-e5 g9-g7 i2-h4 g10-h10 g2-h2 d10-f8 c2-d4 c10-d8 d2-f4 i10-h8 g2-e4 j9-j8 j3-j4",
    //G3-G5
    "g3-g5 e9-e7 i2-h4c10-d8 g2-h2 g10-h10",
    "g3-g5 e9-e7 e3-e5 f9-f7 f3-f5 g9-g7 i2-h4 g10-h10 c2-d4 d10-f8 d2-f4 i10-h8",
    "g3-g5 e9-e7 c2-d4 f9-f7 e3-e4 g9-g7 f3-f5 g10-h10 g2-h2 d10-f8",
    "g3-g5 j9-j8 f3-f5 e9-e7 g2-h2 k11-j9 h2-c7 d9-d8 c7-e5 g9-g7 e5-g6",
    "g3-g5 e9-e7 f3-f5 f9-f7 e3-e5 g10-h10 i2-h4 g9-g7 g2-h2 d10-f8 c2-d4 i10-h8 d2-f4 c10-d8",
    "g3-g5 e9-e7 f3-f5 f9-f7 e3-e5 g10-h10 g2-h2 d10-i5 h3-h4 i5-f8 c2-d4 g9-g7 d2-f4 i10-h8",
    //E3-E5
    "e3-e5 g9-g7 g3-g5 e9-e7 g2-h2 g10-h10 f3-f5 f9-f7 d2-f4 d10-f8",
    "e3-e5 g9-g7 f3-f5 g10-h10 g3-g5 h10-c5 c2-d4 e9-e7 i2-h4 f9-f7 b3-b4 c5-b6",
    "e3-e5 g9-g7 g3-g5 e9-e7 f3-f5 g10-h10 d2-f4 d9-d8 c2-d4 f9-f7 i2-h4 d10-f8 g5-g6 f7-g6 f5-g6 e10-c8",
    "e3-e5 g9-g7 j3-j4 i10-h8 k1-j3 g10-h10 g2-h2 f9-f7 g3-g5 e9-e7 f3-f5 d10-f8",
    //C2-D4
    "c2-d4 e9-e7 e3-e5 f9-f7 f3-f5 g10-h10 g3-g5 g9-g7",
    "c2-d4 e9-e7 i2-h4 f9-f7 f3-f5 g10-h10 g3-g5 g9-g7 g2-h2 d10-f8",
    "c2-d4 e9-e7 a1-c2 f9-f7 f3-f5 g10-h10 g3-g5 d10-i5 h3-h4 i5-f8",
    "c2-d4 e9-e7 e3-e5 f9-f7 i2-h4 g10-h10 f3-f5 g9-g7 d2-f4 d10-f8",
    //I2-H4
    "i2-h4 i10-h8 k1-i2 k11-i10",
    "i2-h4 i10-h8 c2-d4 e9-e7 g3-g5 g10-h10 f3-f5 f9-f7 g2-h2 g9-g7",
    "i2-h4 i10-h8 f3-f5 e9-e7 e3-e5 f9-f7 c2-e3 g10-h10 g3-g4 g9-g7",
    //J3-J4
    "j3-j4 e9-e7 k1-j3 g10-h10 g3-g5 g9-g7 f3-f5 h10-i8 c2-d4 i8-j6 h3-h4 f9-f7",
    "j3-j4 e9-e7 f3-f5 g10-h10 k1-j3 h10-i8 c2-d4 f9-f7 g3-g5 d10-g7 e2-g4 g10-d7 e3-e4 e7-e6",
    //B3-B4
    "b3-b4 e9-e7 a1-b3 g10-h10 g2-h2 h10-g8 c3-c4 f9-f7",
    "b3-b4 e9-e7 e3-e5 g10-h10 f3-f5 f9-f7 a1-b3 g10-d7 i2-h4 d10-i5 g2-f3 c10-d8",
    "b3-b4 e9-e7 a1-b3 g10-h10 e3-e5 h10-g8 c3-c4 f9-f7 i2-h4 d10-g7 f3-f4 i10-h8",
    "b3-b4 e9-e7 a1-b3 g10-h10 g2-h2 h10-g8 c3-c4 f9-f7 f3-f5 d10-g7 d3-d4 g10-d7 i2-h4 c10-d8 e3-e5 i10-h8",
    //H3-H5
    "h3-h5 e9-e7 g3-g5 f9-f7 f3-f4 g10-h10 i2-h4 d10-i5 h2-g3 g9-g7 c2-d4 i10-h8",
    "h3-h5 e9-e7 g3-g5 f9-f7 i2-h4 g10-h10 c2-d4 d10-i5 h2-g3 g9-g7",
    //D3-D5
    "d3-d5 e9-e7 e3-e5 g10-h10 g2-h2 f9-f7 g3-g5 g9-g7",
    //END
    ""
  ];

  // src/engine/protocol.ts
  function ThreeFoldRep() {
    let r = 0;
    for (let i = 0; i < S.brd_hisPly; ++i) {
      if (S.brd_history[i].posKey === S.brd_posKey) {
        r++;
      }
    }
    return r;
  }
  function CitadelDraw() {
    if (S.brd_pieces[SQUARES.A11] === PIECES.wK || S.brd_pieces[SQUARES.K11] === PIECES.wK) return true;
    if (S.brd_pieces[SQUARES.A1] === PIECES.bK || S.brd_pieces[SQUARES.K1] === PIECES.bK) return true;
    return false;
  }
  function DrawMaterial() {
    if (S.brd_pceNum[PIECES.wP] !== 0 || S.brd_pceNum[PIECES.bP] !== 0) return false;
    if (S.brd_pceNum[PIECES.wQ] !== 0 || S.brd_pceNum[PIECES.bQ] !== 0 || S.brd_pceNum[PIECES.wR] !== 0 || S.brd_pceNum[PIECES.bR] !== 0)
      return false;
    if (S.brd_pceNum[PIECES.wS] !== 0 || S.brd_pceNum[PIECES.bS] !== 0 || S.brd_pceNum[PIECES.wF] !== 0 || S.brd_pceNum[PIECES.bF] !== 0)
      return false;
    if (S.brd_pceNum[PIECES.wB] > 1 || S.brd_pceNum[PIECES.bB] > 1) return false;
    if (S.brd_pceNum[PIECES.wN] > 1 || S.brd_pceNum[PIECES.bN] > 1) return false;
    if (S.brd_pceNum[PIECES.wN] !== 0 && S.brd_pceNum[PIECES.wB] !== 0) return false;
    if (S.brd_pceNum[PIECES.bN] !== 0 && S.brd_pceNum[PIECES.bB] !== 0) return false;
    return true;
  }
  function CapturedPieces() {
    const cwP = 9 - S.brd_pceNum[PIECES.wP];
    const cwN = 2 - S.brd_pceNum[PIECES.wN];
    const cwB = 2 - S.brd_pceNum[PIECES.wB];
    const cwR = 2 - S.brd_pceNum[PIECES.wR];
    const cwS = 1 - S.brd_pceNum[PIECES.wS];
    const cwF = 2 - S.brd_pceNum[PIECES.wF];
    const cwQ = 1 - S.brd_pceNum[PIECES.wQ];
    const cbP = 9 - S.brd_pceNum[PIECES.bP];
    const cbN = 2 - S.brd_pceNum[PIECES.bN];
    const cbB = 2 - S.brd_pceNum[PIECES.bB];
    const cbR = 2 - S.brd_pceNum[PIECES.bR];
    const cbS = 1 - S.brd_pceNum[PIECES.bS];
    const cbF = 2 - S.brd_pceNum[PIECES.bF];
    const cbQ = 1 - S.brd_pceNum[PIECES.bQ];
    const white_captured_pieces = `White P[${cwP}]N[${cwN}]B[${cwB}]R[${cwR}]S[${cwS}]F[${cwF}]Q[${cwQ}]`;
    const black_captured_pieces = `Black p[${cbP}]n[${cbN}]b[${cbB}]r[${cbR}]s[${cbS}]f[${cbF}]q[${cbQ}]`;
    const is_piece_captured = cwP + cwN + cwB + cwR + cwS + cwF + cwQ + cbP + cbN + cbB + cbR + cbS + cbF + cbQ;
    if (is_piece_captured > 0) {
      return `Captured Pieces: \r
${white_captured_pieces}\r
${black_captured_pieces}`;
    } else {
      return "";
    }
  }

  // src/engine/init.ts
  function StartEngine() {
    init_engine();
    S.engine_on = true;
    SendMessageToGui("init", "engine_started");
  }
  function InitBoardVars() {
    S.brd_history.splice(0, S.brd_history.length);
    S.brd_PvTable.splice(0, S.brd_PvTable.length);
    for (let index = 0; index < MAXGAMEMOVES; index++) {
      S.brd_history.push({
        move: NOMOVE,
        castlePerm: 0,
        enPas: 0,
        fiftyMove: 0,
        posKey: 0
      });
    }
    for (let index = 0; index < PVENTRIES; index++) {
      S.brd_PvTable.push({
        move: NOMOVE,
        posKey: 0
      });
    }
  }
  function EvalInit() {
    for (let index = 0; index < 10; ++index) {
      S.PawnRanksWhite[index] = 0;
      S.PawnRanksBlack[index] = 0;
    }
  }
  function InitHashKeys() {
    for (let index = 0; index < 21 * 195; ++index) {
      S.PieceKeys[index] = RAND_32();
    }
    S.SideKey = RAND_32();
    for (let index = 0; index < 16; ++index) {
      S.CastleKeys[index] = RAND_32();
    }
  }
  function InitSq195To121() {
    let sq121 = 0;
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
      S.Sq195ToSq121[index] = 122;
    }
    for (let index = 0; index < 121; ++index) {
      S.Sq121ToSq195[index] = 195;
    }
    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_11; ++rank) {
      for (let file = FILES.FILE_A; file <= FILES.FILE_K; ++file) {
        const sq = FR2SQ(file, rank);
        S.Sq121ToSq195[sq121] = sq;
        S.Sq195ToSq121[sq] = sq121;
        sq121++;
      }
    }
  }
  function InitFilesRanksBrd() {
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
      S.FilesBrd[index] = SQUARES.OFFBOARD;
      S.RanksBrd[index] = SQUARES.OFFBOARD;
    }
    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_11; ++rank) {
      for (let file = FILES.FILE_A; file <= FILES.FILE_K; ++file) {
        const sq = FR2SQ(file, rank);
        S.FilesBrd[sq] = file;
        S.RanksBrd[sq] = rank;
        if (FrameSQ.indexOf(sq) > -1) {
          S.FilesBrd[sq] = SQUARES.OFFBOARD;
          S.RanksBrd[sq] = SQUARES.OFFBOARD;
        }
      }
    }
  }
  function init_engine() {
    InitFilesRanksBrd();
    InitSq195To121();
    InitHashKeys();
    InitBoardVars();
    InitMvvLva();
    EvalInit();
    S.srch_thinking = false;
  }
  function NewGame() {
    init_engine();
    ParseFen(S.START_FEN);
    if (S.debug_log) PrintBoard();
    S.GameController.PlayerSide = S.brd_side;
    S.GameController.GameSaved = false;
    SendMessageToGui("init", "new_game_started");
    SendPosition();
  }

  // src/engine/search.ts
  var Qcalled = 0;
  var ABcalled = 0;
  function CheckUp() {
    if (Date.now() - S.srch_start > S.srch_time && Treshhold > 1) S.srch_stop = true;
  }
  function PickNextMove(moveNum) {
    let bestScore = 0;
    let bestNum = moveNum;
    let temp;
    for (let index = moveNum; index < S.brd_moveListStart[S.brd_ply + 1]; ++index) {
      if (S.brd_moveScores[index] > bestScore) {
        bestScore = S.brd_moveScores[index];
        bestNum = index;
      }
    }
    temp = S.brd_moveList[moveNum];
    S.brd_moveList[moveNum] = S.brd_moveList[bestNum];
    S.brd_moveList[bestNum] = temp;
    temp = S.brd_moveScores[moveNum];
    S.brd_moveScores[moveNum] = S.brd_moveScores[bestNum];
    S.brd_moveScores[bestNum] = temp;
  }
  function IsRepetition() {
    for (let index = S.brd_hisPly - S.brd_fiftyMove; index < S.brd_hisPly - 1; ++index) {
      if (S.brd_posKey === S.brd_history[index].posKey) return true;
    }
    return false;
  }
  function ClearPvTable() {
    for (let index = 0; index < PVENTRIES; index++) {
      S.brd_PvTable[index].move = NOMOVE;
      S.brd_PvTable[index].posKey = 0;
    }
  }
  function ClearForSearch() {
    for (let index = 0; index < BRD_PCE_NUM * BRD_SQ_NUM; ++index) {
      S.brd_searchHistory[index] = 0;
    }
    for (let index = 0; index < 3 * MAXDEPTH; ++index) {
      S.brd_searchKillers[index] = 0;
    }
    ClearPvTable();
    S.brd_ply = 0;
    S.srch_nodes = 0;
    S.srch_fh = 0;
    S.srch_fhf = 0;
    S.srch_start = Date.now();
    S.srch_stop = false;
    S.srch_best = NOMOVE;
    ResetMoveCounters();
    Qcalled = 0;
    ABcalled = 0;
  }
  function Quiescence(alpha, beta) {
    Qcalled++;
    if ((S.srch_nodes & 8192) === 0) CheckUp();
    S.srch_nodes++;
    if (IsRepetition() || S.brd_fiftyMove >= 100) return 0;
    if (S.brd_ply > MAXDEPTH - 1) return EvalPosition();
    let Score = EvalPosition();
    if (Score >= beta) return beta;
    if (Score > alpha) alpha = Score;
    GenerateCaptures();
    let MoveNum = 0;
    let Legal = 0;
    const OldAlpha = alpha;
    let BestMove = NOMOVE;
    Score = -INFINITE;
    const PvMove = ProbePvTable();
    if (PvMove !== NOMOVE) {
      for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
        if (S.brd_moveList[MoveNum] === PvMove) {
          Object(S.brd_moveScores[MoveNum]).score = 2e6;
          break;
        }
      }
    }
    for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
      PickNextMove(MoveNum);
      if (!MakeMove(S.brd_moveList[MoveNum])) continue;
      Legal++;
      Score = -Quiescence(-beta, -alpha);
      TakeMove();
      if (S.srch_stop) return 0;
      if (Score > alpha) {
        if (Score >= beta) {
          if (Legal === 1) S.srch_fhf++;
          S.srch_fh++;
          return beta;
        }
        alpha = Score;
        BestMove = S.brd_moveList[MoveNum];
      }
    }
    if (alpha !== OldAlpha) StorePvMove(BestMove);
    return alpha;
  }
  function AlphaBeta(alpha, beta, depth, DoNull) {
    ABcalled++;
    if (depth <= 0) return Quiescence(alpha, beta);
    if ((S.srch_nodes & 8192) === 0) CheckUp();
    S.srch_nodes++;
    if ((IsRepetition() || S.brd_fiftyMove >= 100) && S.brd_ply !== 0) return 0;
    if (S.brd_ply > MAXDEPTH - 1) return EvalPosition();
    const InCheck = SqAttacked(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)], S.brd_side ^ 1);
    if (InCheck) depth++;
    let Score = -INFINITE;
    if (DoNull && !InCheck && S.brd_ply !== 0 && S.brd_material[S.brd_side] > 50200 && depth >= 4) {
      const ePStore = S.brd_enPas;
      if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
      S.brd_side ^= 1;
      HASH_SIDE();
      S.brd_enPas = SQUARES.NO_SQ;
      Score = -AlphaBeta(-beta, -beta + 1, depth - 4, false);
      S.brd_side ^= 1;
      HASH_SIDE();
      S.brd_enPas = ePStore;
      if (S.brd_enPas !== SQUARES.NO_SQ) HASH_EP();
      if (S.srch_stop) return 0;
      if (Score >= beta) return beta;
    }
    GenerateMoves();
    let MoveNum = 0;
    let Legal = 0;
    const OldAlpha = alpha;
    let BestMove = NOMOVE;
    Score = -INFINITE;
    const PvMove = ProbePvTable();
    if (PvMove !== NOMOVE) {
      for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
        if (S.brd_moveList[MoveNum] === PvMove) {
          Object(S.brd_moveScores[MoveNum]).score = 2e6;
          break;
        }
      }
    }
    for (MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
      PickNextMove(MoveNum);
      if (!MakeMove(S.brd_moveList[MoveNum])) continue;
      Legal++;
      Score = -AlphaBeta(-beta, -alpha, depth - 1, true);
      TakeMove();
      if (S.srch_stop) return 0;
      if (Score > alpha) {
        if (Score >= beta) {
          if (Legal === 1) S.srch_fhf++;
          S.srch_fh++;
          if ((S.brd_moveList[MoveNum] & MFLAGCAP) === 0) {
            S.brd_searchKillers[MAXDEPTH + S.brd_ply] = S.brd_searchKillers[S.brd_ply];
            S.brd_searchKillers[S.brd_ply] = S.brd_moveList[MoveNum];
          }
          return beta;
        }
        alpha = Score;
        BestMove = S.brd_moveList[MoveNum];
        if ((BestMove & MFLAGCAP) === 0) {
          S.brd_searchHistory[S.brd_pieces[FROMSQ(BestMove)] * BRD_SQ_NUM + TOSQ(BestMove)] += depth;
        }
      }
    }
    if (Legal === 0) {
      if (InCheck) return -MATE + S.brd_ply;
      return 0;
    }
    if (alpha !== OldAlpha) StorePvMove(BestMove);
    return alpha;
  }
  var hint = NOMOVE;
  function SearchPosition() {
    let bestMove = NOMOVE;
    ClearForSearch();
    bestMove = BookMove(false);
    if (bestMove !== NOMOVE) {
      S.srch_best = bestMove;
      S.srch_thinking = false;
      const console_msg = `Book move: ${PrMove(bestMove)}`;
      SendMessageToGui("console", console_msg);
      SendBestMove(bestMove);
      hint = BookMove(true);
      if (hint !== NOMOVE && hint !== "") {
        SendMessageToGui("info", `hint|${hint}`);
      } else {
        SendMessageToGui("info", "hint|End of opening line.");
      }
      return;
    }
    let srch_start_msg;
    if (S.srch_time !== 2147483647) srch_start_msg = `Engine time: ${Number(S.srch_time) / 1e3} seconds`;
    else srch_start_msg = `Engine depth: ${S.srch_depth}`;
    debuglog(srch_start_msg);
    SendMessageToGui("console", " ");
    SendMessageToGui("console", srch_start_msg);
    bestMove = IterativeDeepening(S.srch_depth);
    if (bestMove === NOMOVE || bestMove === void 0 || !SanityCheck(bestMove)) {
      if (!S.GameController.GameOver) {
        SendMessageToGui("console", "> Fail safe L1, Depth 3");
        FailSafeResetBoard("L1");
        bestMove = IterativeDeepening(3);
      }
    }
    if (bestMove === NOMOVE || bestMove === void 0 || !SanityCheck(bestMove)) {
      if (!S.GameController.GameOver) {
        SendMessageToGui("console", "> Fail safe L2: Depth 1");
        FailSafeResetBoard("L2");
        bestMove = IterativeDeepening(1);
      }
    }
    if (bestMove === NOMOVE || bestMove === void 0 || !SanityCheck(bestMove)) {
      if (!S.GameController.GameOver) {
        SendMessageToGui("init", "engine_error");
        return;
      }
    } else {
      S.srch_best = bestMove;
      SendBestMove(bestMove);
      SendMessageToGui("info", `hint|${hint}`);
    }
    S.srch_thinking = false;
    ShowPerformance();
  }
  function FailSafeResetBoard(level) {
    const fen = BoardToFen();
    const brd_hisPly_bak = S.brd_hisPly;
    const brd_history_bak = S.brd_history;
    const brd_history_notes_bak = S.brd_history_notes;
    init_engine();
    ResetBoard();
    ClearForSearch();
    switch (level) {
      case "L1":
        ParseFen(fen);
        S.brd_hisPly = brd_hisPly_bak;
        S.brd_history = brd_history_bak;
        S.brd_history_notes = brd_history_notes_bak;
        break;
      case "L2":
        ParseFen(fen);
        break;
      default:
        break;
    }
  }
  var Treshhold = 0;
  function IterativeDeepening(id_depth) {
    let bestMove = NOMOVE;
    let bestScore = -INFINITE;
    let _pvNum = 0;
    let line;
    for (let currentDepth = 1; currentDepth <= id_depth; ++currentDepth) {
      Treshhold = currentDepth;
      bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, true);
      if (S.srch_stop) break;
      _pvNum = GetPvLine(currentDepth);
      bestMove = S.brd_PvArray[0];
      line = `Depth:${currentDepth}: ${PrMoveWithPieces(bestMove)} Score:${bestScore} Nodes:${S.srch_nodes}`;
      if (currentDepth !== 1) {
        line += ` Ordering:${(S.srch_fhf / S.srch_fh * 100).toFixed(2)}%`;
      }
      let currentScore = 0;
      if (S.brd_side === COLOURS.WHITE) currentScore = bestScore;
      else currentScore = -bestScore;
      let pvline = `${currentDepth}[${currentScore}]`;
      for (let i = 0; i < currentDepth; i++) {
        if (S.brd_PvArray[i] !== void 0) pvline += ` ${PrMove(S.brd_PvArray[i])}`;
      }
      if (currentDepth !== 1) {
        pvline += ` <${Math.round(S.srch_fhf / S.srch_fh * 100)}%>`;
      }
      hint = PrMove(S.brd_PvArray[1]);
      debuglog(line);
      SendMessageToGui("console", pvline);
    }
    return bestMove;
  }
  function ShowPerformance() {
    const counters = ReadMoveCounters();
    debuglog("-------- Performance Counters ----------");
    debuglog(`AlphaBeta: ${ABcalled}`);
    debuglog(`Quiescence: ${Qcalled}`);
    debuglog(`MoveGen: ${counters.GenerateMovesNum}`);
    debuglog(`CapGen: ${counters.GenerateCapturesNum}`);
    debuglog(`Node: ${S.srch_nodes}`);
    debuglog(`MOVE: ${counters.gen_m}`);
  }

  // src/engine/variants.ts
  var START_FEN = "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
  function setVariantDefs(this_variant) {
    S.variant = this_variant;
    S.variantId = this_variant === "Persian" ? 0 : this_variant === "Pyramid" ? 1 : this_variant === "Citadel" ? 2 : this_variant === "Oriental" ? 3 : -1;
    switch (S.variant) {
      case "Persian":
        START_FEN = "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "Pyramid":
        START_FEN = "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "Citadel":
        START_FEN = "f111111111f/1rnbqkbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "Oriental":
        START_FEN = "w111111111w/1rnbqkcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      default:
        break;
    }
    S.START_FEN = START_FEN;
  }
  function Get_TP_Fen(tp) {
    let tp_fen = START_FEN;
    switch (tp) {
      case "TP_FEN_1_Citadel":
        tp_fen = "11111111111/11111k1s111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_2_Citadel":
        tp_fen = "f111111111f/11111k1s111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_3_Citadel":
        tp_fen = "f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_4_Citadel":
        tp_fen = "f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_5_Citadel":
        tp_fen = "1111111111f/11111kbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_6_Citadel":
        tp_fen = "f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_7_Citadel":
        tp_fen = "f111111111f/1rnb1kbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_1_Persian":
        tp_fen = "11111111111/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_2_Persian":
        tp_fen = "f111111111f/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_3_Persian":
        tp_fen = "f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_4_Persian":
        tp_fen = "f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_5_Persian":
        tp_fen = "1111111111f/11111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_6_Persian":
        tp_fen = "f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_7_Persian":
        tp_fen = "f111111111f/1rnb1ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_1_Pyramid":
        tp_fen = "11111111111/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_2_Pyramid":
        tp_fen = "f111111111f/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_3_Pyramid":
        tp_fen = "f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_4_Pyramid":
        tp_fen = "f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_5_Pyramid":
        tp_fen = "1111111111f/11111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_6_Pyramid":
        tp_fen = "f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_7_Pyramid":
        tp_fen = "f111111111f/1rnb1ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
        break;
      case "TP_FEN_1_Oriental":
        tp_fen = "11111111111/11111kc1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      case "TP_FEN_2_Oriental":
        tp_fen = "w111111111w/11111kc1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      case "TP_FEN_3_Oriental":
        tp_fen = "w111111111w/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      case "TP_FEN_4_Oriental":
        tp_fen = "w111111111w/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      case "TP_FEN_5_Oriental":
        tp_fen = "1111111111w/11111kcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      case "TP_FEN_6_Oriental":
        tp_fen = "w111111111w/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      case "TP_FEN_7_Oriental":
        tp_fen = "w111111111w/1rnb1kcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1";
        break;
      default:
        break;
    }
    return tp_fen;
  }

  // src/engine/engine.ts
  function postToGui(msg) {
    const pm = typeof postMessage !== "undefined" ? postMessage : globalThis.postMessage;
    if (typeof pm === "function") pm(msg);
  }
  function SendMessageToGui(title, message) {
    postToGui(`${title}::${message}`);
  }
  function ProcessGuiMessage(message) {
    if (typeof message !== "string") {
      debuglog(`Ignoring non-string message: ${typeof message}`);
      return;
    }
    debuglog(`Message received: ${message}`);
    const msg_title = message.substr(0, message.indexOf("::"));
    const msg_body = message.substr(message.indexOf("::") + 2);
    switch (msg_title) {
      case "init":
        ProcessGuiMessage_Init(msg_body);
        break;
      case "parse":
        ProcessGuiMessage_Parse(msg_body);
        break;
      case "move":
        ProcessGuiMessage_Move(msg_body);
        break;
      case "set":
        ProcessGuiMessage_Set(msg_body);
        break;
      case "do":
        ProcessGuiMessage_Do(msg_body);
        break;
      default:
        debuglog("Message not recognised.");
        break;
    }
  }
  function ProcessGuiMessage_Init(message) {
    switch (message) {
      case "hello":
        SendMessageToGui("init", "hi");
        break;
      case "start_engine":
        StartEngine();
        break;
      case "new_game":
        NewGame();
        SendPosition();
        break;
      case "turn_on":
        S.engine_on = true;
        SendMessageToGui("init", "engine_is_on");
        break;
      case "turn_off":
        S.engine_on = false;
        SendMessageToGui("init", "engine_is_off");
        break;
      case "go":
        if (S.engine_on) MoveNow();
        break;
      default:
        debuglog("Init::message not recognised.");
        break;
    }
  }
  function ProcessGuiMessage_Parse(move) {
    debuglog(`Begin parsing move: ${move} in variant ${S.variant}`);
    const src = CBSQ2SQlocal(move.split("-")[0]);
    const dst = CBSQ2SQlocal(move.split("-")[1]);
    const parsed = ParseMove(src, dst);
    if (parsed !== NOMOVE) {
      let msg = `${move}|${parsed}`;
      let flag = "|quite";
      if ((parsed & MFLAGEP) !== 0) flag = "|en_passant";
      if ((parsed & MFLAGCA) !== 0) flag = "|castle";
      if ((parsed & MFLAGRZ) !== 0) flag = "|rendezvous";
      if ((parsed & MFLAGCAP) !== 0) flag = "|capture";
      if ((parsed & MFLAGPROM) !== 0) flag = "|promote";
      msg += flag;
      SendMessageToGui("parsed", msg);
    } else {
      SendMessageToGui("parsed", "NOMOVE");
      SendPosition();
    }
  }
  function CBSQ2SQlocal(s) {
    return CBSQ2SQ(s);
  }
  function ProcessGuiMessage_Move(parsed_move_str) {
    const parsed_move = Number(parsed_move_str);
    debuglog(`Making move: ${parsed_move}`);
    MakeMove(parsed_move);
    if (S.debug_log) PrintBoard();
    SendPosition();
    CheckAndSet();
    if (S.engine_on && !S.GameController.GameOver) {
      setTimeout(() => {
        MoveNow();
      }, 100);
    }
  }
  function ProcessGuiMessage_Set(message) {
    const set = message.split("|")[0];
    const value = message.split("|")[1];
    switch (set) {
      case "thinktime":
        debuglog(`Set srch_time: ${value}`);
        S.srch_time = Number(value);
        break;
      case "depth":
        debuglog(`Set srch_depth: ${value}`);
        S.srch_depth = Number(value);
        break;
      case "variant":
        debuglog(`Set variant: ${value}`);
        setVariantDefs(value);
        break;
      case "fen":
        debuglog(`Set FEN: ${value}`);
        SetFen(value);
        break;
      case "history":
        debuglog(`Set History: ${value}`);
        SetHistory(value);
        SendPosition();
        break;
      case "tp":
        debuglog(`Set TP: ${value}`);
        SetFen(Get_TP_Fen(value));
        break;
      default:
        debuglog("Set::message not recognised.");
        break;
    }
  }
  function ProcessGuiMessage_Do(command) {
    switch (command) {
      case "flip":
        S.GameController.BoardFlipped = !S.GameController.BoardFlipped;
        SendPosition();
        break;
      case "takeback":
        if (S.brd_hisPly > 0) {
          TakeMove();
          S.brd_ply = 0;
          if (S.debug_log) PrintBoard();
          S.GameController.GameOver = false;
          SendGameState();
          SendPosition();
        }
        break;
      case "forward": {
        const move = S.brd_history[S.brd_hisPly].move;
        if (move !== 0 && move !== void 0 && ParseMove(FROMSQ(move), TOSQ(move))) {
          MakeMove(move);
          SendPosition();
        } else {
          if (S.engine_on) MoveNow();
        }
        break;
      }
      case "start_demo":
        StartEngineDemo();
        break;
      case "stop_demo":
        StopEngineDemo();
        break;
      default:
        debuglog("Do::message not recognised.");
        break;
    }
  }
  function MoveNow() {
    debuglog("Starting to think.");
    SendMessageToGui("info", "thinking");
    S.GameController.PlayerSide = S.brd_side ^ 1;
    setTimeout(() => {
      StartSearch();
    }, 100);
  }
  function StartSearch() {
    if (S.srch_time === void 0 || S.srch_time <= 0) S.srch_time = 3e3;
    if (S.srch_depth === 0 || S.srch_depth === void 0) S.srch_depth = MAXDEPTH;
    debuglog(`Starting search: srch_depth: ${S.srch_depth} srch_time: ${S.srch_time}`);
    SearchPosition();
    MakeMove(S.srch_best);
    if (S.debug_log) PrintBoard();
    SendPosition();
    CheckAndSet();
    if (CapturedPieces() !== "") {
      SendMessageToGui("console", CapturedPieces());
    }
  }
  function CheckAndSet() {
    let KingSq = SQUARES.OFFBOARD;
    SendMessageToGui(
      "debug",
      `CheckAndSet: side=${S.brd_side} king=${PrSq(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)])}`
    );
    if (SqAttacked(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)], S.brd_side ^ 1)) {
      KingSq = PrSq(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)]);
      SendMessageToGui("info", `check|${KingSq}`);
    }
    const isOver = GameOver();
    SendMessageToGui("debug", `CheckAndSet: GameOver returned ${isOver}`);
    if (!isOver) {
      S.GameController.GameOver = false;
    } else {
      S.GameController.GameOver = true;
      S.GameController.GameSaved = true;
    }
    ClearHistory();
    SendGameState();
    if (CapturedPieces() !== "" && !S.engine_on) {
      SendMessageToGui("console", CapturedPieces());
    }
  }
  function GameOver() {
    let KingSq = SQUARES.OFFBOARD;
    if (S.brd_fiftyMove > 100) {
      SendMessageToGui("gameover", `draw|fifty_move_rule|${SQUARES.NO_SQ}`);
      return true;
    }
    if (ThreeFoldRep() >= 2) {
      SendMessageToGui("gameover", `draw|3_ford_repetition|${SQUARES.NO_SQ}`);
      return true;
    }
    if (DrawMaterial()) {
      SendMessageToGui("gameover", `draw|insufficient_material|${SQUARES.NO_SQ}`);
      return true;
    }
    if (CitadelDraw()) {
      SendMessageToGui("gameover", `draw|citadel_rule|${SQUARES.NO_SQ}`);
      return true;
    }
    GenerateMoves();
    let found = 0;
    for (let MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
      if (!MakeMove(S.brd_moveList[MoveNum])) continue;
      found++;
      TakeMove();
      break;
    }
    if (found !== 0) return false;
    const InCheck = SqAttacked(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)], S.brd_side ^ 1);
    debuglog(`No Move Found, incheck:${InCheck}`);
    if (InCheck) {
      KingSq = PrSq(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)]);
      if (S.brd_side === COLOURS.WHITE) {
        SendMessageToGui("gameover", `blackwins|checkmate|${KingSq}`);
      } else {
        SendMessageToGui("gameover", `whitewins|checkmate|${KingSq}`);
      }
      return true;
    }
    SendMessageToGui("gameover", `draw|stalemate|${KingSq}`);
    return true;
  }
  function ClearHistory() {
    for (let index = S.brd_hisPly; index < 2048; index++) {
      S.brd_history[index].move = NOMOVE;
      S.brd_history[index].fiftyMove = 0;
      S.brd_history[index].enPas = 0;
      S.brd_history[index].castlePerm = 0;
    }
  }
  function SendPosition() {
    const engine_position = BoardToFen().replace(/ .+$/, "");
    SendMessageToGui("pos", `${engine_position}|${S.brd_side}`);
  }
  function SendBestMove(best_move) {
    let flag = "|quite";
    if ((best_move & MFLAGEP) !== 0) flag = "|en_passant";
    if ((best_move & MFLAGCA) !== 0) flag = "|castle";
    if ((best_move & MFLAGRZ) !== 0) flag = "|rendezvous";
    if ((best_move & MFLAGCAP) !== 0) flag = "|capture";
    if ((best_move & MFLAGPROM) !== 0) flag = "|promote";
    SendMessageToGui("bestmove", PrMove(best_move) + flag);
  }
  function SendGameState() {
    SendMessageToGui("fen", BoardToFen());
    if (BoardToHistory().length > 1) SendMessageToGui("history", BoardToHistory());
  }
  function BoardToHistory() {
    let history = "";
    for (let index = 0; index < S.brd_hisPly; ++index) {
      history += `${PrSq(FROMSQ(S.brd_history[index].move))}-${PrSq(TOSQ(S.brd_history[index].move))}/`;
      history += `${S.brd_history[index].move}/`;
      history += `${S.brd_history[index].posKey}/`;
      history += `${S.brd_history[index].fiftyMove}/`;
      history += `${S.brd_history[index].enPas}/`;
      history += `${S.brd_history[index].castlePerm}/`;
      history += S.brd_hisPly;
      history += " ";
    }
    return history;
  }
  function SetHistory(this_history) {
    const page = this_history.split(" ");
    if (page.length < 2) return;
    for (let index = 0; index < page.length - 1; ++index) {
      const h_array = page[index].split("/");
      S.brd_history[index].move = Number(h_array[1]);
      S.brd_history[index].posKey = Number(h_array[2]);
      S.brd_history[index].fiftyMove = Number(h_array[3]);
      S.brd_history[index].enPas = Number(h_array[4]);
      S.brd_history[index].castlePerm = Number(h_array[5]);
      S.brd_hisPly = Number(h_array[6]);
    }
  }
  function SetFen(this_fen) {
    const current_fen = BoardToFen();
    if (ParseFen(this_fen)) {
      S.GameController.PlayerSide = S.brd_side;
      CheckAndSet();
      EvalPosition();
      SendPosition();
    } else {
      SendMessageToGui("info", "invalid_fen");
      ParseFen(current_fen);
      SendPosition();
    }
  }
  var EngineDemoTimer;
  function StartEngineDemo() {
    StartSearch();
    EngineDemoTimer = setTimeout(StartEngineDemo, 1e3);
    if (S.GameController.GameOver) clearTimeout(EngineDemoTimer);
  }
  function StopEngineDemo() {
    clearTimeout(EngineDemoTimer);
  }

  // src/engine/engine-worker.ts
  self.onmessage = (e) => {
    ProcessGuiMessage(e.data);
  };
})();
