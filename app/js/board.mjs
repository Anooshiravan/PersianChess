"use strict";
(() => {
  // src/board.ts
  var DEBUG_DEFAULT = true;
  function dlog(...args) {
    const on = typeof window !== "undefined" && window.PC_DEBUG !== void 0 ? window.PC_DEBUG : DEBUG_DEFAULT;
    if (on) console.log("[board]", ...args);
  }
  if (typeof window !== "undefined" && window.PC_DEBUG === void 0) {
    window.PC_DEBUG = DEBUG_DEFAULT;
  }
  var BRD_SQ_NUM = 195;
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
    FILE_K: 10
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
    RANK_11: 10
  };
  var SQUARES = {
    OFFBOARD: -1,
    A1: 27,
    B1: 28,
    C1: 29,
    D1: 30,
    E1: 31,
    F1: 32,
    G1: 33,
    H1: 34,
    I1: 35,
    J1: 36,
    K1: 37,
    NO_SQ: -1
  };
  var COLUMNS = "abcdefghijk";
  var FRAME_SQ = [
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    // rank 1: b1-j1
    40,
    50,
    // rank 2: a2, k2
    53,
    63,
    // rank 3: a3, k3
    66,
    76,
    // rank 4: a4, k4
    79,
    89,
    // rank 5: a5, k5
    92,
    102,
    // rank 6: a6, k6
    105,
    115,
    // rank 7: a7, k7
    118,
    128,
    // rank 8: a8, k8
    131,
    141,
    // rank 9: a9, k9
    144,
    154,
    // rank 10: a10, k10
    158,
    159,
    160,
    161,
    162,
    163,
    164,
    165,
    166
    // rank 11: b11-j11
  ];
  var GRID_COLS = 11;
  var GRID_ROWS = 11;
  var FilesBrd = new Array(BRD_SQ_NUM);
  var RanksBrd = new Array(BRD_SQ_NUM);
  var Sq121ToSq195 = [];
  var Sq195ToSq121 = [];
  function initSq121ToSq195() {
    for (let i = 0; i < 121; i++) Sq121ToSq195[i] = 195;
    for (let i = 0; i < BRD_SQ_NUM; i++) Sq195ToSq121[i] = 122;
    let file, rank, sq, sq121;
    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_11; rank++) {
      for (file = FILES.FILE_A; file <= FILES.FILE_K; file++) {
        sq = 27 + file + rank * 13;
        sq121 = rank * 11 + file;
        Sq121ToSq195[sq121] = sq;
        Sq195ToSq121[sq] = sq121;
      }
    }
  }
  function initFilesRanksBrd() {
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
      FilesBrd[index] = SQUARES.OFFBOARD;
      RanksBrd[index] = SQUARES.OFFBOARD;
    }
    const frameSet = {};
    for (let f = 0; f < FRAME_SQ.length; f++) frameSet[FRAME_SQ[f]] = true;
    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_11; ++rank) {
      for (let file = FILES.FILE_A; file <= FILES.FILE_K; ++file) {
        const sq = 27 + file + rank * 13;
        FilesBrd[sq] = file;
        RanksBrd[sq] = rank;
        if (frameSet[sq]) {
          FilesBrd[sq] = SQUARES.OFFBOARD;
          RanksBrd[sq] = SQUARES.OFFBOARD;
        }
      }
    }
  }
  function fr2sq(f, r) {
    return 27 + f + r * 13;
  }
  function sqFromAlg(moveAlg) {
    const columns = "abcdefghijk";
    const f = columns.indexOf(moveAlg[0]);
    const r = parseInt(moveAlg.substring(1), 10);
    return f + 1 + (r + 1) * 13;
  }
  function PrSq(sq) {
    const file = FilesBrd[sq];
    const rank = RanksBrd[sq];
    if (file === SQUARES.OFFBOARD) return "offboard";
    return String.fromCharCode("a".charCodeAt(0) + file) + (rank + 1);
  }
  function CBSQ2SQ(cbsq) {
    const colChar = cbsq.charAt(0);
    const f = COLUMNS.indexOf(colChar);
    const r = parseInt(cbsq.substring(1, cbsq.length), 10);
    return f + 1 + (r + 1) * 13;
  }
  var GRID_LAYOUT = [];
  var sqToGrid = {};
  var gridToSq = [];
  function buildGridLayout() {
    initSq121ToSq195();
    initFilesRanksBrd();
    GRID_LAYOUT = [];
    for (let r = 0; r < 11; r++) {
      const row = [];
      for (let c = 0; c < 11; c++) {
        const sq121 = (10 - r) * 11 + c;
        const sq = Sq121ToSq195[sq121];
        row.push(sq);
      }
      GRID_LAYOUT.push(row);
    }
  }
  function buildGrid() {
    gridToSq = [];
    sqToGrid = {};
    for (let r = 0; r < GRID_ROWS; r++) {
      gridToSq[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const sq = GRID_LAYOUT[r][c];
        gridToSq[r][c] = sq;
        sqToGrid[sq] = { row: r, col: c };
      }
    }
  }
  var _currentTheme = "green";
  var pieceImageCache = {};
  function getPiecePath(code) {
    return `img/chesspieces/wikipedia/${code}.png`;
  }
  function preloadPieceImages(pieces) {
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (piece && !pieceImageCache[piece]) {
        const img = new Image();
        img.src = getPiecePath(piece);
        pieceImageCache[piece] = img;
      }
    }
  }
  var boardState = {
    pieces: new Array(195),
    flipped: false,
    active: true,
    lastMove: null,
    inCheck: null,
    inCheckmate: null,
    sideToMove: "white",
    draggedFrom: null,
    dragGhost: null
  };
  function parseFenChar(ch) {
    const lower = ch.toLowerCase();
    const pieceMap = {
      p: "p",
      n: "n",
      w: "w",
      c: "c",
      b: "b",
      r: "r",
      s: "s",
      f: "f",
      q: "q",
      k: "k"
    };
    const pieceName = pieceMap[lower];
    if (!pieceName) return null;
    const color = ch >= "A" && ch <= "Z" ? "w" : "b";
    return color + pieceName.toUpperCase();
  }
  function parseFen(fenStr) {
    dlog("parseFen:", fenStr);
    for (let i = 0; i < 195; i++) boardState.pieces[i] = null;
    const parts = fenStr.split(/\s+/);
    const posStr = parts[0];
    let fenRank = 11;
    let file = 0;
    for (let i = 0; i < posStr.length; i++) {
      const ch = posStr[i];
      if (ch === "/") {
        fenRank--;
        file = 0;
        continue;
      }
      if (ch === " ") break;
      if (ch >= "1" && ch <= "9") {
        file += parseInt(ch, 10);
        continue;
      }
      const code = parseFenChar(ch);
      if (!code) continue;
      const sq121 = (fenRank - 1) * 11 + file;
      const sq = Sq121ToSq195[sq121];
      if (sq >= 0 && sq < 195 && sqToGrid[sq] !== void 0) {
        boardState.pieces[sq] = code;
      }
      file++;
    }
    if (parts.length > 1) {
      boardState.sideToMove = parts[1] === "w" ? "white" : "black";
    }
    const placed = {};
    for (let s = 0; s < 195; s++) {
      if (boardState.pieces[s]) placed[PrSq(s)] = boardState.pieces[s];
    }
    dlog("  parsed pieces:", placed, "sideToMove=", boardState.sideToMove);
    preloadPieceImages(boardState.pieces);
    renderPieces();
    updateStatus();
  }
  var boardEl = null;
  function initBoard() {
    boardEl = document.getElementById("board");
    if (!boardEl) return;
    buildGridLayout();
    buildGrid();
    renderBoard();
    buildArrowOverlay();
    boardEl.addEventListener("pointerdown", onPointerDown, { passive: false });
    boardEl.addEventListener("pointermove", onPointerMove);
    boardEl.addEventListener("pointerup", onPointerUp);
    boardEl.addEventListener("pointercancel", onPointerCancel);
  }
  var arrowSvg = null;
  function buildArrowOverlay() {
    if (!boardEl) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "board-arrows");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "5";
    boardEl.appendChild(svg);
    arrowSvg = svg;
  }
  function cellCenterPct(sq) {
    const pos = sqToGrid[sq];
    if (!pos) return null;
    const step = 100 / GRID_COLS;
    return { x: (pos.col + 0.5) * step, y: (pos.row + 0.5) * step };
  }
  function clearArrows() {
    if (!arrowSvg) return;
    const els = arrowSvg.querySelectorAll(".hint-arrow");
    els.forEach((el) => {
      el.remove();
    });
  }
  function drawHintArrow(fromSq, toSq) {
    if (!arrowSvg) return;
    clearArrows();
    const a = cellCenterPct(fromSq);
    const b = cellCenterPct(toSq);
    if (!a || !b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-3) return;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const shaftW = 1.4;
    const headW = 3.6;
    const headL = 3;
    const startInset = 1.5;
    const sx = a.x + ux * startInset;
    const sy = a.y + uy * startInset;
    const nx = b.x - ux * headL;
    const ny = b.y - uy * headL;
    const p = [
      [sx + px * shaftW * 0.5, sy + py * shaftW * 0.5],
      [nx + px * shaftW * 0.5, ny + py * shaftW * 0.5],
      [nx + px * headW * 0.5, ny + py * headW * 0.5],
      [b.x, b.y],
      [nx - px * headW * 0.5, ny - py * headW * 0.5],
      [nx - px * shaftW * 0.5, ny - py * shaftW * 0.5],
      [sx - px * shaftW * 0.5, sy - py * shaftW * 0.5]
    ];
    const d = `M ${p.map((pt) => `${pt[0].toFixed(3)},${pt[1].toFixed(3)}`).join(" L ")} Z`;
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("class", "hint-arrow");
    arrow.setAttribute("d", d);
    arrow.setAttribute("fill", "rgba(255,255,0,0.75)");
    arrow.setAttribute("stroke", "rgba(0,0,0,0.7)");
    arrow.setAttribute("stroke-width", "0.35");
    arrow.setAttribute("stroke-linejoin", "round");
    arrowSvg.appendChild(arrow);
  }
  function renderBoard() {
    if (!boardEl) return;
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const sq = gridToSq[row][col];
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        let isFrame = false;
        for (let f = 0; f < FRAME_SQ.length; f++) {
          if (sq === FRAME_SQ[f]) {
            isFrame = true;
            break;
          }
        }
        if (isFrame) {
          cell.classList.add("off-board");
        } else {
          cell.classList.add("playable");
        }
        cell.dataset.sq = String(sq);
        const isLight = (row + col) % 2 === 0;
        cell.classList.add(isLight ? "light" : "dark");
        if (sq === 97) {
          const gc = window.GameController;
          const variant = gc?.variant ?? "Persian";
          if (variant === "Persian") cell.classList.add("centre-persian");
          else if (variant === "Pyramid") cell.classList.add("centre-pyramid");
        }
        boardEl.appendChild(cell);
      }
    }
    renderPieces();
    applyHighlights();
  }
  function renderPieces() {
    if (!boardEl) return;
    const existing = boardEl.querySelectorAll(".piece");
    for (let i = 0; i < existing.length; i++) {
      existing[i].remove();
    }
    let _placed = 0;
    let _skipped = 0;
    for (const sqStr in sqToGrid) {
      const sq = parseInt(sqStr, 10);
      const pieceCode = boardState.pieces[sq];
      if (!pieceCode) continue;
      const pos = sqToGrid[sq];
      const cell = boardEl.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
      if (!cell) {
        _skipped++;
        continue;
      }
      const pieceEl = document.createElement("div");
      pieceEl.className = `piece ${pieceCode}`;
      pieceEl.style.backgroundImage = `url('${getPiecePath(pieceCode)}')`;
      pieceEl.dataset.sq = String(sq);
      if (boardState.flipped) {
        pieceEl.style.transform = "rotate(180deg)";
      }
      cell.appendChild(pieceEl);
      _placed++;
    }
  }
  function applyHighlights() {
    if (!boardEl) return;
    const hl = boardEl.querySelectorAll(".highlight-from,.highlight-to,.highlight-check,.highlight-mate,.selected");
    for (let i = 0; i < hl.length; i++) {
      hl[i].classList.remove("highlight-from", "highlight-to", "highlight-check", "highlight-mate", "selected");
    }
    if (boardState.lastMove) {
      const fromCell = getCellForSq(boardState.lastMove.from);
      const toCell = getCellForSq(boardState.lastMove.to);
      if (fromCell) fromCell.classList.add("highlight-from");
      if (toCell) toCell.classList.add("highlight-to");
    }
    if (boardState.inCheck) {
      const cell = getCellForSq(boardState.inCheck);
      if (cell) cell.classList.add("highlight-check");
    }
    if (boardState.inCheckmate) {
      const cell = getCellForSq(boardState.inCheckmate);
      if (cell) cell.classList.add("highlight-mate");
    }
  }
  function getCellForSq(sq) {
    if (sq == null || sq === void 0) return null;
    const pos = sqToGrid[sq];
    if (!pos) return null;
    return boardEl?.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`) ?? null;
  }
  function updateStatus() {
    const cell = boardEl?.querySelector('[data-sq="102"]');
    if (!cell) return;
    let status;
    if (boardState.inCheckmate) {
      status = boardState.sideToMove === "white" ? "black-wins" : "white-wins";
    } else if (!boardState.active) {
      status = "paused";
    } else {
      status = boardState.sideToMove === "white" ? "white" : "black";
    }
    cell.dataset.status = status;
    const label = status === "white" ? "White to move" : status === "black" ? "Black to move" : status === "white-wins" ? "White wins" : status === "black-wins" ? "Black wins" : "Game paused";
    cell.setAttribute("title", label + (boardState.inCheck ? " (Check!)" : ""));
  }
  function onPointerDown(e) {
    if (!boardEl || !boardState.active) {
      dlog("pointerdown ignored \u2014 boardEl=", !!boardEl, "active=", boardState.active);
      return;
    }
    const cell = e.target.closest(".playable");
    if (!cell) {
      dlog("pointerdown on non-playable cell");
      return;
    }
    const sq = parseInt(cell.dataset.sq, 10);
    const pieceCode = boardState.pieces[sq];
    dlog("pointerdown sq=", sq, "alg=", PrSq(sq), "piece=", pieceCode);
    if (!pieceCode) {
      dlog("  empty square, ignoring");
      return;
    }
    const isWhite = pieceCode.charAt(0) === "w";
    const playerColor = typeof window !== "undefined" ? window.GameController.playerColor : "white";
    const engineOn = typeof window !== "undefined" ? window.GameController.engineOn : false;
    const engineThinking = typeof window !== "undefined" ? window.GameController.engineThinking : false;
    dlog(
      "  playerColor=",
      playerColor,
      "engineOn=",
      engineOn,
      "engineThinking=",
      engineThinking,
      "sideToMove=",
      boardState.sideToMove
    );
    if (engineOn) {
      const isPlayerSide = playerColor === "white" && isWhite || playerColor !== "white" && !isWhite;
      const isEngineSide = playerColor === "white" && !isWhite || playerColor !== "white" && isWhite;
      if (!isPlayerSide && isEngineSide) {
        dlog("  not player side, ignoring");
        return;
      }
    }
    if (engineThinking) {
      dlog("  engine is thinking, ignoring");
      return;
    }
    if (engineOn) {
      const engineColor = playerColor === "white" ? "black" : "white";
      if (boardState.sideToMove === engineColor) {
        dlog("  not player turn, ignoring");
        return;
      }
    }
    boardState.draggedFrom = sq;
    dlog("  accepted drag from", PrSq(sq));
    cell.classList.add("selected");
    boardState.dragGhost = document.createElement("div");
    boardState.dragGhost.className = `piece ${pieceCode}`;
    boardState.dragGhost.style.position = "fixed";
    boardState.dragGhost.style.zIndex = "1000";
    boardState.dragGhost.style.pointerEvents = "none";
    boardState.dragGhost.style.opacity = "0.85";
    boardState.dragGhost.style.backgroundImage = `url('${getPiecePath(pieceCode)}')`;
    boardState.dragGhost.style.backgroundSize = "contain";
    boardState.dragGhost.style.backgroundRepeat = "no-repeat";
    boardState.dragGhost.style.backgroundPosition = "center";
    boardState.dragGhost.style.width = `${String(cell.offsetWidth)}px`;
    boardState.dragGhost.style.height = `${String(cell.offsetHeight)}px`;
    boardState.dragGhost.style.left = `${String(e.clientX - cell.offsetWidth / 2)}px`;
    boardState.dragGhost.style.top = `${String(e.clientY - cell.offsetHeight / 2)}px`;
    document.body.appendChild(boardState.dragGhost);
    boardEl.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!boardState.dragGhost) return;
    boardState.dragGhost.style.left = `${e.clientX - boardState.dragGhost.offsetWidth / 2}px`;
    boardState.dragGhost.style.top = `${e.clientY - boardState.dragGhost.offsetHeight / 2}px`;
    e.preventDefault();
  }
  function onPointerUp(e) {
    if (!boardEl || !boardState.dragGhost || boardState.draggedFrom === null) return;
    boardEl.releasePointerCapture(e.pointerId);
    const fromSq = boardState.draggedFrom;
    const ghost = boardState.dragGhost;
    ghost.remove();
    boardState.dragGhost = null;
    let target = document.elementFromPoint(e.clientX, e.clientY);
    if (target) {
      target = target.closest(".playable");
    }
    const selected = boardEl.querySelector(".selected");
    if (selected) selected.classList.remove("selected");
    if (target) {
      const toSq = parseInt(target.dataset.sq, 10);
      dlog("pointerup drop target sq=", toSq, "alg=", PrSq(toSq), "fromSq=", fromSq, "fromAlg=", PrSq(fromSq));
      if (toSq !== fromSq) {
        const fromAlg = PrSq(fromSq);
        const toAlg = PrSq(toSq);
        const moveStr = typeof fromAlg === "string" && typeof toAlg === "string" ? `${fromAlg}-${toAlg}` : "";
        dlog("  moveStr=", moveStr);
        const gc = window.GameController;
        if (gc?.engine) {
          dlog(`  \u2192 engine.postMessage("parse::${moveStr}")`);
          gc.engine.postMessage(`parse::${moveStr}`);
        } else {
          dlog("  engine is null, cannot send parse");
        }
      } else {
        dlog("pointerup dropped on same square, no move");
      }
    } else {
      dlog("pointerup no drop target found");
    }
    boardState.draggedFrom = null;
  }
  function onPointerCancel(_e) {
    if (boardState.dragGhost) {
      boardState.dragGhost.remove();
      boardState.dragGhost = null;
    }
    const selected = boardEl?.querySelector(".selected");
    if (selected) selected.classList.remove("selected");
    boardState.draggedFrom = null;
  }
  function highlightMove(fromSq, toSq) {
    boardState.lastMove = { from: fromSq, to: toSq };
    applyHighlights();
  }
  function clearHighlights() {
    boardState.lastMove = null;
    boardState.inCheck = null;
    boardState.inCheckmate = null;
    applyHighlights();
  }
  function setCheckHighlight(sq) {
    boardState.inCheck = sq;
    boardState.inCheckmate = null;
    applyHighlights();
  }
  function setCheckmateHighlight(sq) {
    boardState.inCheck = sq;
    boardState.inCheckmate = sq;
    applyHighlights();
  }
  function flipBoard() {
    boardState.flipped = !boardState.flipped;
    if (boardEl) {
      boardEl.style.transform = boardState.flipped ? "rotate(180deg)" : "";
    }
    const pieces = boardEl?.querySelectorAll(".piece");
    if (pieces) {
      for (let i = 0; i < pieces.length; i++) {
        pieces[i].style.transform = boardState.flipped ? "rotate(180deg)" : "";
      }
    }
  }
  function setBoardTheme(themeName) {
    _currentTheme = themeName;
    const boardArea = document.getElementById("board-area");
    if (!boardArea) return;
    boardArea.classList.remove("theme-green", "theme-brown", "theme-blue", "theme-oriental");
    boardArea.classList.add(`theme-${themeName}`);
  }
  function setVariantOverlay(variant) {
    if (!boardEl) return;
    const centre = boardEl.querySelector('[data-sq="97"]');
    if (!centre) return;
    centre.classList.remove("centre-persian", "centre-pyramid");
    if (variant === "Persian") centre.classList.add("centre-persian");
    else if (variant === "Pyramid") centre.classList.add("centre-pyramid");
  }
  function setActive(active) {
    boardState.active = active;
    if (boardEl) {
      boardEl.classList.toggle("inactive", !active);
    }
  }
  function setEngineThinking(thinking) {
    const cell = boardEl?.querySelector('[data-sq="102"]');
    if (!cell) return;
    if (thinking) {
      cell.dataset.status = "thinking";
    } else {
      updateStatus();
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    initBoard();
    setBoardTheme("green");
  });
  window.parseFen = parseFen;
  window.highlightMove = highlightMove;
  window.clearHighlights = clearHighlights;
  window.setCheckHighlight = setCheckHighlight;
  window.setCheckmateHighlight = setCheckmateHighlight;
  window.flipBoard = flipBoard;
  window.setBoardTheme = setBoardTheme;
  window.setActive = setActive;
  window.setEngineThinking = setEngineThinking;
  window.setVariantOverlay = setVariantOverlay;
  window.drawHintArrow = drawHintArrow;
  window.clearArrows = clearArrows;
  window.boardState = boardState;
})();
