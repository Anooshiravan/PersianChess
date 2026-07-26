"use strict";
(() => {
  // src/app.ts
  var DEBUG_DEFAULT = true;
  function dlog(...args) {
    const on = typeof window !== "undefined" && window.PC_DEBUG !== void 0 ? window.PC_DEBUG : DEBUG_DEFAULT;
    if (on) console.log("[app]", ...args);
  }
  if (typeof window !== "undefined" && window.PC_DEBUG === void 0) {
    window.PC_DEBUG = DEBUG_DEFAULT;
  }
  function enginePost(msg) {
    dlog("\u2192 engine:", msg);
    if (GameController.engine) GameController.engine.postMessage(msg);
    else dlog("  (engine is null, dropped)");
  }
  var _shared = {
    engine: null,
    engineOn: true,
    engineThinking: false,
    engineAutoPlay: false,
    playerColor: "white",
    variant: "Persian",
    variantIndex: 0,
    thinkTime: 3e3,
    depth: 10,
    audioEnabled: true,
    hintEnabled: false,
    gameOver: false,
    gameActive: false,
    currentFen: null,
    history: [],
    moveList: [],
    redoStack: [],
    lastFen: null,
    gameOverReason: "",
    gameOverSq: null,
    lastHint: null,
    pendingHint: false,
    suppressArrowClear: 0
  };
  window.GameController = _shared;
  self.GameController = _shared;
  var GameController = _shared;
  var AudioSystem = {
    sounds: {},
    playing: [],
    load() {
      const soundFiles = [
        "check",
        "capture",
        "click",
        "draw",
        "end",
        "gg",
        "blackwins",
        "whitewins",
        "checkmate",
        "welcome",
        "move"
      ];
      for (let i = 0; i < soundFiles.length; i++) {
        this.sounds[soundFiles[i]] = new Audio(`audio/${soundFiles[i]}.mp3`);
      }
    },
    play(name) {
      if (!GameController.audioEnabled) return;
      const src = this.sounds[name];
      if (!src) return;
      const inst = new Audio(src.src);
      this.playing.push(inst);
      const cleanup = () => {
        const idx = this.playing.indexOf(inst);
        if (idx >= 0) this.playing.splice(idx, 1);
      };
      inst.addEventListener("ended", cleanup);
      inst.addEventListener("error", cleanup);
      const p = inst.play();
      if (p && typeof p.catch === "function")
        p.catch(() => {
          cleanup();
        });
    },
    stop(name) {
      const sound = this.sounds[name];
      if (sound) sound.pause();
    }
  };
  AudioSystem.load();
  var StorageSystem = {
    get(key) {
      try {
        return localStorage.getItem(`pc:${key}`);
      } catch (_e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`pc:${key}`, value);
      } catch (_e) {
      }
    },
    getGame(slot) {
      try {
        return JSON.parse(localStorage.getItem(`pc:game:${slot}`) || "{}");
      } catch (_e) {
        return null;
      }
    },
    setGame(slot, data) {
      try {
        localStorage.setItem(`pc:game:${slot}`, JSON.stringify(data));
      } catch (_e) {
      }
    }
  };
  function initEngine() {
    if (!("Worker" in window)) {
      showToast("Web Workers not supported by this browser");
      return false;
    }
    try {
      GameController.engine = new Worker("js/engine-worker.mjs");
      GameController.engine.onmessage = onEngineMessage;
      GameController.engine.onerror = onEngineError;
      enginePost("init::hello");
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(`Failed to initialize engine: ${msg}`);
      return false;
    }
  }
  function onEngineError(e) {
    console.error("Engine worker error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    showToast(`Engine error: ${msg}`);
    GameController.engine = null;
    GameController.gameActive = false;
  }
  function onWorkerError(msg) {
    console.error("WORKER FATAL:", msg);
    showToast(`Worker failed: ${msg}`);
    GameController.engine = null;
    GameController.gameActive = false;
  }
  function onEngineMessage(message) {
    const data = typeof message === "string" ? message : message.data;
    dlog("\u2190 engine:", data);
    const idx = data.indexOf("::");
    if (idx < 0) {
      dlog("  unknown format (no ::), ignoring");
      return;
    }
    const title = data.substring(0, idx);
    const body = data.substring(idx + 2);
    switch (title) {
      case "init":
        handleInit(body);
        break;
      case "pos":
        handlePos(body);
        break;
      case "fen":
        handleFen(body);
        break;
      case "bestmove":
        handleBestMove(body);
        break;
      case "parsed":
        handleParsed(body);
        break;
      case "gameover":
        handleGameOver(body);
        break;
      case "info":
        handleInfo(body);
        break;
      case "console":
        handleConsole(body);
        break;
      case "debug":
        handleDebug(body);
        break;
      case "worker_error":
        onWorkerError(body);
        break;
      case "history":
        break;
      default:
        console.log("Unhandled:", title, body);
        break;
    }
  }
  function handleInit(body) {
    if (!GameController.engine) return;
    switch (body) {
      case "hi":
        enginePost("init::start_engine");
        break;
      case "engine_started":
        showToast("Engine ready");
        enginePost("init::new_game");
        GameController.gameActive = true;
        break;
      case "new_game_started":
        GameController.gameActive = true;
        GameController.gameOver = false;
        GameController.engineThinking = false;
        setEngineThinkingUI(false);
        break;
      case "engine_is_on":
        GameController.engineOn = true;
        showToast("Engine enabled");
        break;
      case "engine_is_off":
        GameController.engineOn = false;
        showToast("Engine disabled");
        break;
    }
  }
  function handlePos(body) {
    const parts = body.split("|");
    const fen = parts[0];
    const sideInt = parseInt(parts[1], 10);
    dlog("handlePos: fen=", fen, "sideInt=", sideInt);
    GameController.currentFen = fen;
    const _bs = window.boardState;
    if (_bs) _bs.inCheck = null;
    if (GameController.suppressArrowClear > 0) {
      GameController.suppressArrowClear--;
    } else if (typeof window.clearArrows === "function") {
      window.clearArrows();
    }
    window.boardState.sideToMove = sideInt === 0 ? "white" : "black";
    parseFen(fen);
    if (GameController.engineOn && !GameController.gameOver) {
      const engineColor = GameController.playerColor === "white" ? "black" : "white";
      if (engineColor === "black" && sideInt === 1 || engineColor === "white" && sideInt === 0) {
      }
    }
  }
  function handleFen(body) {
    if (!body) return;
    GameController.currentFen = body;
  }
  function handleBestMove(body) {
    if (!GameController.engine) return;
    const parts = body.split("|");
    const moveStr = parts[0];
    const flag = parts[1] || "quite";
    if (GameController.pendingHint) {
      GameController.pendingHint = false;
      GameController.lastHint = moveStr;
      GameController.suppressArrowClear = 2;
      _showHintArrow(moveStr);
      enginePost("do::takeback");
      GameController.engineThinking = false;
      setEngineThinkingUI(false);
      setTimeout(() => _showHintArrow(moveStr), 50);
      return;
    }
    const moveParts = moveStr.split("-");
    const fromSq = sqFromAlg(moveParts[0]);
    const toSq = sqFromAlg(moveParts[1]);
    highlightMove(fromSq, toSq);
    if (flag === "capture") {
      AudioSystem.play("capture");
    } else {
      AudioSystem.play("move");
    }
    addMoveToList(moveStr);
    GameController.engineThinking = false;
    setEngineThinkingUI(false);
  }
  function handleParsed(body) {
    if (!GameController.engine) {
      dlog("handleParsed: engine null");
      return;
    }
    if (body === "NOMOVE") {
      dlog("handleParsed: NOMOVE");
      showToast("Invalid move");
      return;
    }
    const parts = body.split("|");
    const moveStr = parts[0];
    const parsedInt = parts[1];
    const flag = parts[2] || "quite";
    dlog("handleParsed: moveStr=", moveStr, "parsedInt=", parsedInt, "flag=", flag);
    enginePost(`move::${parsedInt}`);
    const moveParts = moveStr.split("-");
    const fromSq = sqFromAlg(moveParts[0]);
    const toSq = sqFromAlg(moveParts[1]);
    highlightMove(fromSq, toSq);
    if (flag === "capture") {
      AudioSystem.play("capture");
    } else {
      AudioSystem.play("move");
    }
    addMoveToList(moveStr);
    if (importQueue.length > 0) {
      setTimeout(pumpImportQueue, 20);
    }
  }
  function handleGameOver(body) {
    dlog("handleGameOver body=", body);
    const parts = body.split("|");
    const result = parts[0];
    const reason = parts[1] || "unknown";
    const sqStr = parts[2];
    const sq = sqStr && sqStr !== "168" && /^[a-k]\d+$/.test(sqStr) ? sqFromAlg(sqStr) : null;
    GameController.gameOver = true;
    GameController.gameOverReason = reason;
    GameController.gameOverSq = sq;
    if (typeof window.setCheckmateHighlight === "function") {
      window.setCheckmateHighlight(sq);
    }
    let winnerText = "";
    switch (result) {
      case "whitewins":
        winnerText = "White wins!";
        AudioSystem.play("whitewins");
        break;
      case "blackwins":
        winnerText = "Black wins!";
        AudioSystem.play("blackwins");
        break;
      case "draw":
        winnerText = `Draw (${reason})`;
        AudioSystem.play("draw");
        break;
      default:
        winnerText = "Game over";
        AudioSystem.play("end");
        break;
    }
    const resultEl = document.getElementById("gameover-result");
    if (resultEl) {
      resultEl.textContent = winnerText;
    }
    const dialogEl = document.getElementById("gameover-dialog");
    if (dialogEl) {
      dialogEl.showModal();
    }
  }
  function handleInfo(body) {
    if (body === "thinking") {
      GameController.engineThinking = true;
      setEngineThinkingUI(true);
    } else if (body === "invalid_fen") {
      showToast("Invalid FEN");
    } else if (body.indexOf("hint|") === 0) {
      const hintBody = body.substring(5);
      GameController.lastHint = /^[a-k]\d+-[a-k]\d+$/.test(hintBody) ? hintBody : null;
    } else if (body.indexOf("check|") === 0) {
      const sqStr = body.split("|")[1];
      const sq = /^[a-k]\d+$/.test(sqStr) ? sqFromAlg(sqStr) : NaN;
      if (Number.isFinite(sq) && sq > 0 && sq < 195) {
        if (typeof window.setCheckHighlight === "function") {
          window.setCheckHighlight(sq);
        }
        AudioSystem.play("check");
      }
    }
  }
  function handleConsole(body) {
    const textarea = document.getElementById("console");
    if (textarea) {
      textarea.value += `${body}
`;
      textarea.scrollTop = textarea.scrollHeight;
    }
  }
  function handleDebug(body) {
    console.log("[Engine]", body);
  }
  function addMoveToList(moveStr) {
    GameController.redoStack = [];
    const moveNum = Math.floor(GameController.history.length / 2) + 1;
    const isWhite = GameController.history.length % 2 === 0;
    if (isWhite) {
      GameController.moveList.push({
        num: moveNum,
        white: moveStr,
        black: null
      });
    } else {
      if (GameController.moveList.length > 0) {
        GameController.moveList[GameController.moveList.length - 1].black = moveStr;
      }
    }
    GameController.history.push(moveStr);
    renderMoveList();
    saveCurrentGame();
  }
  function renderMoveList() {
    const container = document.getElementById("move-list");
    if (!container) return;
    let html = "";
    for (let i = 0; i < GameController.moveList.length; i++) {
      const entry = GameController.moveList[i];
      html += `<div class="move-row"><span class="move-num">${entry.num}.</span>`;
      html += `<span class="move-text">${entry.white}</span>`;
      if (entry.black) {
        html += ` <span class="move-text">${entry.black}</span>`;
      }
      html += "</div>";
    }
    container.innerHTML = html || '<div style="opacity:0.5; text-align:center; padding:12px;">No moves yet</div>';
    container.scrollTop = container.scrollHeight;
  }
  function startNewGame(variantName, playerColor) {
    GameController.variant = variantName;
    GameController.playerColor = playerColor;
    GameController.gameActive = true;
    GameController.gameOver = false;
    GameController.history = [];
    GameController.moveList = [];
    GameController.engineThinking = false;
    GameController.lastFen = null;
    GameController.currentFen = null;
    GameController.lastHint = null;
    clearHighlights();
    const _bs = window.boardState;
    if (_bs) _bs.inCheck = null;
    if (_bs) _bs.inCheckmate = null;
    enginePost(`set::variant|${variantName}`);
    enginePost("init::new_game");
    const variantTheme = {
      Persian: "green",
      Oriental: "oriental",
      Pyramid: "brown",
      Citadel: "blue"
    };
    const theme = variantTheme[variantName] ?? "green";
    changeTheme(theme);
    const themeSel = document.getElementById("theme-select");
    if (themeSel) themeSel.value = theme;
    if (typeof window.setVariantOverlay === "function") {
      window.setVariantOverlay(variantName);
    }
    saveCurrentGame();
    showToast(`New ${variantName} game started`);
  }
  function flipGame() {
    if (!GameController.engine) return;
    flipBoard();
    enginePost("do::flip");
  }
  function popOnePly() {
    if (GameController.history.length === 0) return;
    const popped = GameController.history.pop();
    if (popped) GameController.redoStack.push(popped);
    if (GameController.moveList.length === 0) return;
    const last = GameController.moveList[GameController.moveList.length - 1];
    if (GameController.history.length % 2 === 1) {
      last.black = null;
    } else {
      GameController.moveList.pop();
    }
  }
  function undoMove() {
    if (GameController.history.length === 0) return;
    if (GameController.engineThinking) return;
    popOnePly();
    if (GameController.engine) enginePost("do::takeback");
    renderMoveList();
    refreshLastMoveHighlight();
    saveCurrentGame();
  }
  function pushOnePlyForward() {
    if (GameController.redoStack.length === 0) return false;
    const moveStr = GameController.redoStack.pop();
    const moveNum = Math.floor(GameController.history.length / 2) + 1;
    const isWhite = GameController.history.length % 2 === 0;
    if (isWhite) {
      GameController.moveList.push({ num: moveNum, white: moveStr, black: null });
    } else if (GameController.moveList.length > 0) {
      GameController.moveList[GameController.moveList.length - 1].black = moveStr;
    }
    GameController.history.push(moveStr);
    if (GameController.engine) enginePost("do::forward");
    return true;
  }
  function refreshLastMoveHighlight() {
    const last = GameController.history[GameController.history.length - 1];
    if (!last) {
      clearHighlights();
      return;
    }
    const parts = last.split("-");
    if (parts.length !== 2) return;
    const fromSq = sqFromAlg(parts[0]);
    const toSq = sqFromAlg(parts[1]);
    highlightMove(fromSq, toSq);
  }
  function forwardMove() {
    if (GameController.engineThinking) return;
    if (!pushOnePlyForward()) return;
    renderMoveList();
    refreshLastMoveHighlight();
    saveCurrentGame();
  }
  function jumpToStart() {
    if (GameController.engineThinking) return;
    while (GameController.history.length > 0) {
      popOnePly();
      if (GameController.engine) enginePost("do::takeback");
    }
    GameController.moveList = [];
    renderMoveList();
    refreshLastMoveHighlight();
    saveCurrentGame();
  }
  function jumpToEnd() {
    if (GameController.engineThinking) return;
    while (pushOnePlyForward()) {
    }
    renderMoveList();
    refreshLastMoveHighlight();
    saveCurrentGame();
  }
  function toggleEngine() {
    if (GameController.engine && GameController.engineOn) {
      enginePost("init::turn_off");
    } else if (GameController.engine) {
      enginePost("init::turn_on");
    }
  }
  function setThinkTime(seconds) {
    GameController.thinkTime = seconds * 1e3;
    if (GameController.engine) {
      enginePost(`set::thinktime|${GameController.thinkTime}`);
    }
  }
  function toggleAudio() {
    GameController.audioEnabled = !GameController.audioEnabled;
    if (!GameController.audioEnabled) {
      AudioSystem.stop("move");
      AudioSystem.stop("capture");
      AudioSystem.stop("check");
    }
  }
  function toggleHint() {
    GameController.hintEnabled = !GameController.hintEnabled;
    if (GameController.hintEnabled && GameController.gameActive && GameController.engine) {
      enginePost("init::go");
    }
  }
  function changeTheme(themeName) {
    window.setBoardTheme(themeName);
    StorageSystem.set("theme", themeName);
  }
  function _showHintArrow(hint) {
    const parts = hint.split("-");
    if (parts.length !== 2) return;
    const fromSq = sqFromAlg(parts[0]);
    const toSq = sqFromAlg(parts[1]);
    drawHintArrow(fromSq, toSq);
  }
  function _requestHint() {
    if (!GameController.gameActive || GameController.engineThinking) return;
    const hint = GameController.lastHint;
    if (hint) {
      _showHintArrow(hint);
      return;
    }
    if (!GameController.engine) return;
    GameController.pendingHint = true;
    enginePost("init::go");
  }
  function saveCurrentGame() {
    if (!GameController.gameActive) return;
    const gameData = {
      fen: GameController.currentFen,
      history: GameController.history,
      moveList: GameController.moveList,
      variant: GameController.variant,
      playerColor: GameController.playerColor,
      timestamp: Date.now()
    };
    const slot = StorageSystem.get("lastSaveSlot") || "g1";
    StorageSystem.setGame(slot, gameData);
  }
  function loadGame(slot) {
    const data = StorageSystem.getGame(slot);
    if (!data) {
      showToast(`No game saved in slot ${slot}`);
      return;
    }
    GameController.variant = data.variant;
    GameController.playerColor = data.playerColor;
    GameController.history = data.history || [];
    GameController.moveList = data.moveList || [];
    GameController.gameActive = true;
    GameController.gameOver = false;
    if (GameController.engine && data.fen) {
      enginePost(`set::variant|${data.variant}`);
      enginePost(`set::fen|${data.fen}`);
    }
    renderMoveList();
    showToast(`Game loaded from ${slot}`);
  }
  var importQueue = [];
  function exportPgn() {
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, ".");
    let pgn = "";
    pgn += '[Event "Persian Chess"]\n';
    pgn += `[Date "${dateStr}"]
`;
    pgn += `[Variant "${GameController.variant}"]
`;
    pgn += `[PlayerColor "${GameController.playerColor}"]
`;
    pgn += '[Result "*"]\n\n';
    const parts = [];
    for (const entry of GameController.moveList) {
      let s = `${entry.num}. ${entry.white}`;
      if (entry.black) s += ` ${entry.black}`;
      parts.push(s);
    }
    pgn += `${parts.join(" ")} *
`;
    return pgn;
  }
  function parsePgn(text) {
    const variantMatch = text.match(/\[Variant\s+"([^"]+)"\]/);
    const colorMatch = text.match(/\[PlayerColor\s+"([^"]+)"\]/);
    const variant = variantMatch ? variantMatch[1] : "Persian";
    const playerColor = colorMatch ? colorMatch[1] : "white";
    const body = text.replace(/\[[^\]]*\]/g, "");
    const moves = [];
    const re = /[a-k]\d{1,2}-[a-k]\d{1,2}/g;
    for (const match of body.matchAll(re)) moves.push(match[0]);
    if (moves.length === 0) return null;
    return { variant, playerColor, moves };
  }
  function pumpImportQueue() {
    if (importQueue.length === 0) return;
    const move = importQueue.shift();
    enginePost(`parse::${move}`);
  }
  function importPgn(text) {
    const parsed = parsePgn(text);
    if (!parsed) {
      showToast("Could not parse PGN");
      return;
    }
    startNewGame(parsed.variant, parsed.playerColor);
    importQueue = parsed.moves.slice();
    setTimeout(pumpImportQueue, 100);
  }
  function loadTrainingPosition(index) {
    if (!GameController.engine) return;
    const tpName = `TP_FEN_${index}_${GameController.variant}`;
    enginePost(`set::tp|${tpName}`);
    showToast(`Training position ${index} loaded`);
  }
  function startDemo() {
    if (!GameController.engine) return;
    GameController.engineAutoPlay = true;
    enginePost("do::start_demo");
  }
  function stopDemo() {
    if (!GameController.engine) return;
    GameController.engineAutoPlay = false;
    enginePost("do::stop_demo");
  }
  function showToast(message, duration) {
    duration = duration || 2e3;
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, duration);
  }
  function setEngineThinkingUI(thinking) {
    const bs = window.boardState;
    if (bs) bs.active = !thinking;
    setActive(!thinking);
    if (typeof window.setEngineThinking === "function") {
      window.setEngineThinking(thinking);
    }
  }
  function bindUI() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
      tabBtns[i].addEventListener("click", function() {
        const tabName = this.dataset.tab;
        if (!tabName) return;
        for (let j = 0; j < tabBtns.length; j++) {
          tabBtns[j].classList.remove("active");
        }
        document.querySelectorAll(".tab-content").forEach((el) => {
          el.classList.remove("active");
        });
        this.classList.add("active");
        const tabEl = document.getElementById(`tab-${tabName}`);
        if (tabEl) tabEl.classList.add("active");
      });
    }
    const toggleBtn = document.getElementById("panel-toggle");
    const sidePanel = document.getElementById("side-panel");
    if (toggleBtn && sidePanel) {
      toggleBtn.addEventListener("click", function() {
        void this;
        sidePanel.classList.toggle("open");
      });
      document.addEventListener("click", function(e) {
        void this;
        if (!sidePanel.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidePanel.classList.remove("open");
        }
      });
    }
    const btnNewGame = document.getElementById("btn-new");
    const dialogNew = document.getElementById("new-game-dialog");
    if (btnNewGame) {
      btnNewGame.addEventListener("click", () => {
        if (dialogNew) dialogNew.showModal();
      });
    }
    const btnStart = document.getElementById("btn-start-game");
    if (btnStart && dialogNew) {
      btnStart.addEventListener("click", () => {
        const variant = document.getElementById("variant-choice")?.value || "Persian";
        const color = (document.getElementById("color-choice")?.value || "white").toLowerCase();
        dialogNew.close();
        startNewGame(variant, color);
      });
    }
    const btnCancel = document.getElementById("btn-cancel-game");
    if (btnCancel && dialogNew) {
      btnCancel.addEventListener("click", () => {
        dialogNew.close();
      });
    }
    const btnOkFromOver = document.getElementById("btn-ok-from-over");
    if (btnOkFromOver) {
      btnOkFromOver.addEventListener("click", () => {
        const dialog = document.getElementById("gameover-dialog");
        if (dialog) dialog.close();
      });
    }
    const btnFlip = document.getElementById("btn-flip");
    if (btnFlip) {
      btnFlip.addEventListener("click", flipGame);
    }
    const btnUndo = document.getElementById("btn-undo");
    if (btnUndo) {
      btnUndo.addEventListener("click", undoMove);
    }
    document.getElementById("btn-hint")?.addEventListener("click", _requestHint);
    document.getElementById("btn-move")?.addEventListener("click", () => {
      if (GameController.gameActive && GameController.engine) enginePost("init::go");
    });
    document.getElementById("btn-forward")?.addEventListener("click", forwardMove);
    document.getElementById("btn-start")?.addEventListener("click", jumpToStart);
    document.getElementById("btn-end")?.addEventListener("click", jumpToEnd);
    const importDialog = document.getElementById("import-dialog");
    const exportDialog = document.getElementById("export-dialog");
    const importText = document.getElementById("import-pgn-text");
    const exportText = document.getElementById("export-pgn-text");
    document.getElementById("btn-import")?.addEventListener("click", () => {
      if (importText) importText.value = "";
      importDialog?.showModal();
    });
    document.getElementById("btn-import-cancel")?.addEventListener("click", () => importDialog?.close());
    document.getElementById("btn-import-ok")?.addEventListener("click", () => {
      const text = importText?.value || "";
      importDialog?.close();
      if (text.trim().length > 0) importPgn(text);
    });
    document.getElementById("btn-export")?.addEventListener("click", () => {
      if (exportText) exportText.value = exportPgn();
      exportDialog?.showModal();
    });
    document.getElementById("btn-export-close")?.addEventListener("click", () => exportDialog?.close());
    document.getElementById("btn-export-copy")?.addEventListener("click", () => {
      const text = exportText?.value || "";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
          () => showToast("PGN copied to clipboard"),
          () => showToast("Copy failed")
        );
      } else if (exportText) {
        exportText.select();
        try {
          document.execCommand("copy");
          showToast("PGN copied to clipboard");
        } catch (_e) {
          showToast("Copy failed");
        }
      }
    });
    const engineSwitch = document.getElementById("engine-switch");
    if (engineSwitch) {
      engineSwitch.addEventListener("change", function() {
        toggleEngine();
        this.value = GameController.engineOn ? "on" : "off";
      });
    }
    const thinkTimeRange = document.getElementById("think-time");
    const thinkTimeValue = document.getElementById("think-time-value");
    if (thinkTimeRange && thinkTimeValue) {
      thinkTimeRange.addEventListener("input", function() {
        const val = parseInt(this.value, 10);
        thinkTimeValue.textContent = `${val}s`;
        setThinkTime(val);
      });
    }
    const audioSwitch = document.getElementById("audio-switch");
    if (audioSwitch) {
      audioSwitch.addEventListener("change", function() {
        toggleAudio();
        this.value = GameController.audioEnabled ? "on" : "off";
      });
    }
    const hintSwitch = document.getElementById("hint-switch");
    if (hintSwitch) {
      hintSwitch.addEventListener("change", function() {
        toggleHint();
        this.value = GameController.hintEnabled ? "on" : "off";
      });
    }
    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
      themeSelect.addEventListener("change", function() {
        changeTheme(this.value);
      });
    }
    const slotDialog = document.getElementById("slot-dialog");
    const slotTitle = document.getElementById("slot-dialog-title");
    let slotMode = "save";
    document.getElementById("btn-save")?.addEventListener("click", () => {
      slotMode = "save";
      if (slotTitle) slotTitle.textContent = "Save Game";
      slotDialog?.showModal();
    });
    document.getElementById("btn-load")?.addEventListener("click", () => {
      slotMode = "load";
      if (slotTitle) slotTitle.textContent = "Load Game";
      slotDialog?.showModal();
    });
    document.getElementById("btn-slot-cancel")?.addEventListener("click", () => slotDialog?.close());
    document.getElementById("btn-slot-ok")?.addEventListener("click", () => {
      const slot = document.getElementById("save-load-slot")?.value || "g1";
      StorageSystem.set("lastSaveSlot", slot);
      if (slotMode === "save") {
        saveCurrentGame();
        showToast(`Game saved to ${slot}`);
      } else {
        loadGame(slot);
      }
      slotDialog?.close();
    });
    const tpChoice = document.getElementById("tp-choice");
    if (tpChoice) {
      tpChoice.addEventListener("change", function() {
        loadTrainingPosition(parseInt(this.value, 10));
      });
    }
    initEngine();
    const btnDemoStart = document.getElementById("btn-demo-start");
    const btnDemoStop = document.getElementById("btn-demo-stop");
    if (btnDemoStart) {
      btnDemoStart.addEventListener("click", startDemo);
    }
    if (btnDemoStop) {
      btnDemoStop.addEventListener("click", stopDemo);
    }
  }
  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLElement && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA"))
      return;
    switch (e.key) {
      case "n":
      case "N":
        document.getElementById("btn-new")?.click();
        break;
      case "f":
      case "F":
        flipGame();
        break;
      case "u":
      case "U":
        undoMove();
        break;
      case "Escape": {
        const dialogs = document.querySelectorAll("dialog[open]");
        dialogs.forEach((dialog) => {
          dialog.close();
        });
        break;
      }
    }
  });
  function registerServiceWorker() {
  }
  function sqFromAlg(moveAlg) {
    const columns = "abcdefghijk";
    const f = columns.indexOf(moveAlg[0]);
    const r = parseInt(moveAlg.substring(1), 10);
    return f + 1 + (r + 1) * 13;
  }
  document.addEventListener("DOMContentLoaded", () => {
    bindUI();
    const savedTheme = StorageSystem.get("theme");
    if (savedTheme) {
      changeTheme(savedTheme);
      const themeSel = document.getElementById("theme-select");
      if (themeSel) themeSel.value = savedTheme;
    }
    const savedAudio = StorageSystem.get("audio");
    if (savedAudio) {
      GameController.audioEnabled = savedAudio === "on";
      const audioSel = document.getElementById("audio-switch");
      if (audioSel) audioSel.value = GameController.audioEnabled ? "on" : "off";
    }
    const savedSlot = StorageSystem.get("lastSaveSlot");
    if (savedSlot) {
      const slotInput = document.getElementById("save-load-slot");
      if (slotInput) slotInput.value = savedSlot;
    }
    registerServiceWorker();
  });
})();
