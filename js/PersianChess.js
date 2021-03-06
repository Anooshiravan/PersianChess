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

 Engine is Licensed under GNU General Public License 3.0
 Redistributions of the source code must retain the above copyright notice. 
 Redistributions in binary form must reproduce the above copyright notice 
 by a method visible to the users.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.

 Variant redistribution and reproduction:
 Redistribution and/or reproduction of this chess variant (including design
 and game rules) digitally or on-board, requires written permission from 
 the author/inventor.
════════════════════════════════════════════════════════════════════
*/

var version = "1.4.8";

// ══════════════════════════
//  Logging
// ══════════════════════════

var debug_log_level = 0;
var debug_to_console = false;

function debuglog(message, level) {
    if (level <= debug_log_level) console.log("> " + message);
    if (debug_to_console) Append("movelist", "> " + message);
}

// ══════════════════════════
//  Game state
// ══════════════════════════

var START_FEN = "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
var variant = "Persian";
var board_active = true;
var theme = "green";
var current_fen = START_FEN;
var pgn = "";
var engine_move = "";
var gameover = false;
var engine_thinking = false;
var engine_autoplay = false;


// ══════════════════════════
//  Init engine
// ══════════════════════════

var PersianChessEngineValid = true;
var PersianChessEngineOn = true;
var PersianChessEngine;

function StartEngine() {
    debuglog("Restoring fen from local storage...", 1);
    var ls_fen = Get_LocalStorageValue("fen");
    if (ls_fen != undefined && ls_fen != "" && ls_fen != null) {
        START_FEN = ls_fen;
    }

    debuglog("Starting WebWorker Engine...", 1);

    if (!PersianChessEngineValid) {
        return false;
    }

    PersianChessEngineValid = true;
    try {
        PersianChessEngine = new Worker("js/PersianChessEngine/PersianChessEngine.js");
        PersianChessEngine.onmessage = function(e) {
            ProcessEngineMessage(e.data);
        };
        PersianChessEngine.onerror = function(e) {
            e.preventDefault();
            return false;
        };
        PersianChessEngine.error = function(e) {
            e.preventDefault();
            return false;
        };
        PersianChessEngine.postMessage("init::hello");
    } catch (error) {
        PersianChessEngineValid = false;
        debuglog("Failed to load the WebWorker Engine." + error, 1);
        Append("movelist", "Failed to load the WebWorker Engine. \r\n" + error);
        setTimeout(function() {
            FallBackToOlderVersion();
        }, 1500);
    }
    return PersianChessEngineValid;
}

StartEngine();


function RestartEngine() {
    try {
        PersianChessEngine.terminate();
        PersianChessEngine = undefined;
        PersianChessEngineValid = true;
        setTimeout(function() {
            StartEngine();
        }, 700);
    } catch (error) {
        Append("movelist", error);
    }
}

function FallBackToOlderVersion() {
    var r = confirm("Your device does not support web workers.\r\nDo you want to use an older version?");
    if (r == true) {
        window.location = "old/index.html";
    }
}



// ══════════════════════════
//  Engine Message processing
// ══════════════════════════

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.indexOf(str) === 0;
    };
}

function ProcessEngineMessage(message) {
    var msg_title = message.substr(0, message.indexOf('::'));
    var msg_body = message.substr(message.indexOf('::') + 2);
    switch (msg_title) {
        case "init":
            ProcessEngineMessage_Init(msg_body);
            break;
        case "parsed":
            ProcessEngineMessage_Parsed(msg_body);
            break;
        case "pos":
            ProcessEngineMessage_Pos(msg_body);
            break;
        case "history":
            ProcessEngineMessage_History(msg_body);
            break;
        case "bestmove":
            ProcessEngineMessage_BestMove(msg_body);
            break;
        case "fen":
            ProcessEngineMessage_Fen(msg_body);
            break;
        case "gameover":
            ProcessEngineMessage_Gameover(msg_body);
            break;
        case "info":
            ProcessEngineMessage_Info(msg_body);
            break;
        case "console":
            ProcessEngineMessage_Console(msg_body);
            break;
        case "debug":
            ProcessEngineMessage_Debug(msg_body);
            break;
        case "report":
            ProcessEngineMessage_Report(msg_body);
            break;
        default:
            debuglog("Message not recognised: " + message);
            break;
    }
}

// Init::
function ProcessEngineMessage_Init(message) {
    switch (message) {
        case "hi":
            debuglog("Engine connected.", 1);
            var msg = "> Engine connected.";
            if (lla_loaded == true) msg += "\r\n> LLA loaded.";
            Append("movelist", msg);
            PersianChessEngine.postMessage("init::start_engine");
            break;
        case "engine_started":
            debuglog("Engine started.", 2);
            Engine_SetFen(START_FEN);
            Engine_TurnOn();
            RestoreGameSettings();
            break;
        case "new_game_started":
            debuglog("New game started. Turning the Engine on, set the default thinktime, variant and depth.", 2);
            if (PersianChessEngineOn) Engine_TurnOn();
            break;
        case "engine_is_on":
            debuglog("Engine is on.", 1);
            PersianChessEngineOn = true;
            break;
        case "engine_is_off":
            debuglog("Engine is off.", 1);
            PersianChessEngineOn = false;
            break;
        default:
            debuglog("Message not recognised.", 1);
            break;
    }
}

// Parsed::
var ParsedMove = "NOMOVE";

function ProcessEngineMessage_Parsed(message) {
    debuglog("Move parsed by enigne: " + message, 1);
    if (message == "NOMOVE") {
        board.removehighlights();
    } else {
        ParsedMove = message;
        setTimeout(function() {
            board.move(ParsedMove);
        }, 10);
    }
}

// Pos::
function ProcessEngineMessage_Pos(message) {
    debuglog("Engine Position received: " + message, 1);
    var engine_position = message.split("|")[0];
    setTimeout(function() {
        board.position(engine_position);
    }, 500);

    var board_side = message.split("|")[1];
    switch (board_side) {
        case '0':
            board.logo("white_to_move");
            break;
        case '1':
            board.logo("black_to_move");
            break;
        default:
            break;
    }
    board.is_active(true);
    engine_thinking = false;
}

// Pgn::
function ProcessEngineMessage_History(engine_history) {
    debuglog("Updating History: " + engine_history, 2);
    Set_LocalStorageValue("history", engine_history);

    HistoryToPGN(engine_history);

    UpdateMoveList();
    UpdateBoardHighlight();
}

// Pgn::
function ProcessEngineMessage_BestMove(message) {
    var move = message.split("|")[0];
    var flag = message.split("|")[1];
    PostMoveToForeignEngine(message);
    PlayMoveSound(flag);
}

// Fen::
function ProcessEngineMessage_Fen(fen) {
    debuglog("Updating current_fen: " + fen, 2);
    current_fen = fen;
    Set_LocalStorageValue("fen", current_fen);
}

// Info::
function ProcessEngineMessage_Info(info) {
    debuglog("Info: " + info, 2);
    if (info.split("|")[0] == "check") {
        var KingSq = info.split("|")[1];
        timeout = setTimeout(function() {
            PlaySound(audio_check);
            board.removehighlights();
            board.highlight_check(KingSq);
        }, 500);
    }
    if (info.split("|")[0] == "hint") {
        var hint = info.split("|")[1].replace("-", " > ");
        if (document.getElementById("hint_switch").value == "on" && engine_autoplay == false) {
            $('#do_popup').html("<div align=\"center\"><div><img src='img/hint.png' border=0>&nbsp" + hint + "</div>");
            timeout = setTimeout(function() {
                $('#do_popup').popup('open');
            }, 300);
        }
    }
    if (info == "thinking") {
        board.logo("wait");
        board.is_active(false);
        engine_thinking = true;
    }
    if (info == "invalid_fen") {
        Append("movelist", "Fen string is invalid.");
    }
}

// Gameover::
function ProcessEngineMessage_Gameover(message) {
    var Result = message.split("|")[0];
    var Rule = message.split("|")[1];
    var KingSq = message.split("|")[2];
    debuglog("Gameover: Result:" + Result + " Rule:" + Rule + " KingSq:" + KingSq, 1);
    timeout = setTimeout(function() {
        board.removehighlights();
        board.highlight_mate(KingSq);
    }, 500);
    board.is_active(false);
    var msg;
    var end_game = Result + "|" + Rule;
    switch (end_game) {
        case "draw|fifty_move_rule":
            msg = "Draw: Fifty move rule";
            PlayGGSound("draw");
            break;
        case "draw|3_ford_repetition":
            msg = "Draw: 3-fold repetition";
            PlayGGSound("draw");
            break;
        case "draw|insufficient_material":
            msg = "Draw: Insufficient material";
            PlayGGSound("draw");
            break;
        case "draw|citadel_rule":
            msg = "Draw: Citadel rule";
            PlayGGSound("draw");
            break;
        case "draw|stalemate":
            msg = "Draw: Stalemate";
            PlayGGSound("draw");
            break;
        case "blackwins|checkmate":
            msg = "Checkmate! Black wins.";
            PlayGGSound("blackwins");
            break;
        case "whitewins|checkmate":
            msg = "Checkmate! White wins.";
            PlayGGSound("whitewins");
            break;
        default:
            break;
    }
    Append("movelist", msg);
    gameover = true;

    $('#do_popup').html("<div align=\"center\"><b>Game over</b></div><div>" + msg + "</div>");
    timeout = setTimeout(function() {
        $('#do_popup').popup('open');
    }, 300);
}

// Console::
function ProcessEngineMessage_Console(message) {
    Append("console", message);
    debuglog("Print to console: " + message, 2);
}

function ProcessEngineMessage_Debug(message) {
    debuglog("Eng_DBG: " + message, 1);
}

function ProcessEngineMessage_Report(message) {
    debuglog("Eng_Report: " + message, 0);
    var agent = navigator.userAgent;
    var report = agent + '\r\n----------------\r\n' + message;
    $.ajax({
        type: "POST",
        url: "http:/www.persianchess.com/error_handler/report.php",
        dataType: "text",
        data: {
            action: 'report_engine_error',
            gamestate: report
        },
        success: function(data) {
            debuglog("Ajax: " + data, 1);
        },
        error: function(textStatus, errorThrown) {
            debuglog("Ajax Status: " + JSON.stringify(textStatus) + " | Ajax Error:" + errorThrown, 1);
        }
    });
}


// ══════════════════════════
//  Engine Functions
// ══════════════════════════
function Engine_MakeMove(ParsedMove) {
    debuglog("Engine to move: " + ParsedMove, 2);
    PersianChessEngine.postMessage("move::" + ParsedMove);
}

function Engine_Go() {
    debuglog("Engine to think.", 2);
    PersianChessEngine.postMessage("init::go");
}

function Engine_TurnOn() {
    debuglog("Turn on Engine.", 2);
    PersianChessEngine.postMessage("init::turn_on");
}

function Engine_TurnOff() {
    debuglog("Turn off Engine.", 2);
    PersianChessEngine.postMessage("init::turn_off");
}

function Engine_SetThinkTime(thinktime) {
    debuglog("Setting Engine think time to: " + thinktime, 2);
    PersianChessEngine.postMessage("set::thinktime|" + thinktime);
}

function Engine_SetVariant(variant) {
    debuglog("Setting Engine variant to: " + variant, 2);
    PersianChessEngine.postMessage("set::variant|" + variant);
}

function Engine_SetSearchDepth(depth) {
    debuglog("Setting Engine max depth to: " + depth, 2);
    PersianChessEngine.postMessage("set::depth|" + depth);
}

function Engine_SetFen(fen) {
    debuglog("Setting Engine FEN to: " + fen, 2);
    PersianChessEngine.postMessage("set::fen|" + fen);
}

function Engine_SetTP(tp) {
    debuglog("Setting Engine TP to: " + tp, 2);
    PersianChessEngine.postMessage("set::tp|" + tp);
}

function Engine_SetHistory(history) {
    debuglog("Setting Engine History to: " + history, 2);
    PersianChessEngine.postMessage("set::history|" + history);
}

function Engine_StartDemo() {
    if (PersianChessEngineOn) {
        debuglog("Start Engine Demo");
        PersianChessEngine.postMessage("do::start_demo");
        engine_autoplay = true;
        msg = "Engine AutoPlay is started.";
        $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
        $('#do_popup').popup('open');
    } else {
        msg = "No AutoPlay when Engine is off.";
        $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
        $('#do_popup').popup('open');
    }
}

function Engine_StopDemo() {
    debuglog("Stop Engine Demo");
    PersianChessEngine.postMessage("do::stop_demo");
    engine_autoplay = false;
    msg = "Engine AutoPlay is stopped.";
    $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
    $('#do_popup').popup('open');
}

// ══════════════════════════
//  GUI Functions
// ══════════════════════════

function SetThinkTime() {
    var thinktime = $('#ThinkTimeChoice').val();
    Set_LocalStorageValue("thinktime", thinktime);
    var miliseconds = thinktime * 1000;
    Engine_SetThinkTime(miliseconds);
}


function SetVariant(variant) {
    if (engine_thinking) return;
    Engine_SetVariant(variant);
    Set_LocalStorageValue("variant", variant);
}

function SetTrainingPosition() {
    var tp_number = document.getElementById("TPChoice").value;
    var tp_choice = document.getElementById("TPChoice");
    var tp_name = tp_choice.options[tp_choice.selectedIndex].text;

    if (tp_number == "0") {
        StartNewGame();
        msg = "Standard Position for \"" + GetVariantName(variant) + "\"";
        $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
        $('#do_popup').popup('open');
    } else {
        var tp = "TP_FEN_" + tp_number + "_" + variant;
        Engine_SetTP(tp);
        msg = "Training Position " + tp_number + ": \"" + tp_name + "\" for \"" + GetVariantName(variant) + "\"";
        $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
        $('#do_popup').popup('open');
    }
}

function SetTheme(theme) {
    PlaySound(audio_click);
    board.theme(theme);
    Set_LocalStorageValue("theme", theme);
}

function GetVariantTheme(variant) {
    switch (variant) {
        case "Persian":
            return "green";
        case "ASE":
            return "brown";
        case "Citadel":
            return "blue";
        case "Oriental":
            return "oriental";
        default:
            break;
    }
}

function GetVariantName(variant) {
    switch (variant) {
        case "Persian":
            return "Persian Princess";
        case "ASE":
            return "Egyptian Eye";
        case "Citadel":
            return "Celtic Citadel";
        case "Oriental":
            return "Oriental Omega";
        default:
            break;
    }
}


function StartNewGame() {
    PlaySound(audio_click);
    variant = $('#VariantChoice').val();
    theme = GetVariantTheme(variant);

    if (engine_thinking) RestartEngine();
    PersianChessEngine.postMessage("do::stop_demo");
    engine_autoplay = false;
    SetThinkTime();
    SetVariant(variant);
    ResetGameSettings();
    PersianChessEngine.postMessage("init::new_game");
    board.theme(theme);
    board.removehighlights();
    ClearConsole();
    $("#newgame_panel").panel("close");
    timeout = setTimeout(function() {
        PlaySound(audio_welcome);
    }, 500);

    if ($('#ColorChoice').val() == "Black" && board.orientation() == "white") {
        FlipBoard();
    }

    if ($('#ColorChoice').val() == "Black") Engine_Go();

    if ($('#ColorChoice').val() == "White" && board.orientation() == "black") {
        FlipBoard();
    }

}

function FlipBoard() {
    PlaySound(audio_click);
    board.flip();
    PersianChessEngine.postMessage("do::flip");

    if (PersianChessEngineOn) {
        // Engine_Go();
    }
}

function TakeBack() {
    try {

        PersianChessEngine.postMessage("do::stop_demo");
        engine_autoplay = false;
        if (engine_thinking) {
            RestartEngine();
        } else {
            PersianChessEngine.postMessage("do::takeback");
        }

        PlaySound(audio_click);
        board.removehighlights();
    } catch (error) {
        Append("movelist", error);
    }
}

function MoveForward() {
    if (engine_thinking) return;
    PlaySound(audio_click);
    PersianChessEngine.postMessage("do::forward");
}

function EngineOnOff() {
    PlaySound(audio_click);
    if (engine_thinking) RestartEngine();

    if (document.getElementById("engine_switch").value == "on") {
        Engine_TurnOn();
        PersianChessEngineOn = true;
    } else {
        Engine_TurnOff();
        PersianChessEngine.postMessage("do::stop_demo");
        PersianChessEngineOn = false;
    }

    Set_LocalStorageValue("engine", document.getElementById("engine_switch").value);
}

function SetPosition() {
    // Retired
}

function SendGameByMail() {
    // Retired
}



// ══════════════════════════════
//  Console and Audio Functions
// ══════════════════════════════

function isEven(n) {
    return (n % 2 == 0);
}

function Append(id, line) {
    switch (id) {
        case "movelist":
            document.getElementById("movelist").value = line;
            $("#movelist").trigger("change");
            $("#movelist").scrollTop($("#movelist")[0].scrollHeight);
            break;
        case "console":
            if (document.getElementById("console").value.startsWith("If")) {
                document.getElementById("console").value = line;
            } else {
                document.getElementById("console").value += "\r\n" + line;
            }
            $("#console").trigger("change");
            $("#console").scrollTop($("#console")[0].scrollHeight);
            break;
        default:
            debuglog("ID is not recognised.", 2);
            break;
    }
}

function ClearConsole() {
    document.getElementById("movelist").value = "";
    document.getElementById("console").value = "";
}

function UpdateMoveList() {
    var movelist = "";
    pgn_array = pgn.split(" ");
    for (index = 0; index < pgn_array.length - 1; ++index) {
        if (isEven(index)) movelist += ((index / 2) + 1).toString() + ". ";
        movelist += pgn_array[index];
        if (isEven(index)) movelist += "  ";
        if (!isEven(index)) movelist += "\n";
        if (index == pgn_array.length - 2) engine_move = pgn_array[index];
    }
    Append("movelist", movelist);
}

function HistoryToPGN(history) {
    pgn = "";
    page = history.split(" ");
    for (index = 0; index < page.length - 1; ++index) {
        var h_array = page[index].split("/");
        pgn += h_array[0] + " ";
    }
}

function UpdateBoardHighlight() {
    board.removehighlights();
    if (PersianChessEngineOn) {
        setTimeout(function() {
            board.highlight(engine_move.split("-")[0], engine_move.split("-")[1]);
        }, 700);
    }
}

function PlayGGSound(result) {
    if (result == "draw") {
        timeout = setTimeout(function() {
            PlaySound(audio_draw);
        }, 500);
    } else if (result == "whitewins") {
        timeout = setTimeout(function() {
            PlaySound(audio_checkmate);
        }, 500);
        timeout = setTimeout(function() {
            PlaySound(audio_whitewins);
        }, 2000);
    } else if (result == "blackwins") {
        timeout = setTimeout(function() {
            PlaySound(audio_checkmate);
        }, 500);
        timeout = setTimeout(function() {
            PlaySound(audio_blackwins);
        }, 2000);
    }
    timeout = setTimeout(function() {
        PlaySound(audio_gg);
    }, 3000);
}

function PlayMoveSound(flag) {
    var delay = 300;
    switch (flag) {
        case "quite":
            setTimeout(function() {
                PlaySound(audio_move);
            }, delay);
            break;
        case "en_passant":
            setTimeout(function() {
                PlaySound(audio_capture);
            }, delay);
            break;
        case "castle":
            setTimeout(function() {
                PlaySound(audio_move);
            }, delay);
            break;
        case "rendezvous":
            setTimeout(function() {
                PlaySound(audio_move);
            }, delay);
            break;
        case "capture":
            setTimeout(function() {
                PlaySound(audio_capture);
            }, delay);
            break;
        case "promote":
            setTimeout(function() {
                PlaySound(audio_move);
            }, delay);
            break;
        default:
            break;
    }
}

// ══════════════════════════
//  Board Event processing
// ══════════════════════════

var onBoardPosChange = function(oldPos, newPos) {
    ProcessBoardPosChange(oldPos, newPos);
};

var onBoardPieceDrop = function(source, target, piece, newPos, oldPos, orientation) {
    move = source + "-" + target;
    if (board_active) {
        PersianChessEngine.postMessage("parse::" + move);
        debuglog("Message sent to Engine to parse move:" + move, 2);
        setTimeout(function() {
            if (ParsedMove.split("|")[0] == move) {
                Engine_MakeMove(ParsedMove.split("|")[1]);
                PlayMoveSound(ParsedMove.split("|")[2]);
                if (PersianChessEngineOn == false) {
                    setTimeout(function() {
                        FlipBoard();
                    }, 700);
                }
            }
        }, 100);
    }
};

function boardMoved(source, target) {
    move = source + "-" + target;
    board.move(move);
    if (board_active) {
        PersianChessEngine.postMessage("parse::" + move);
        debuglog("Message sent to Engine to parse move:" + move, 2);
        setTimeout(function() {
            if (ParsedMove.split("|")[0] == move) {
                Engine_MakeMove(ParsedMove.split("|")[1]);
                PlayMoveSound(ParsedMove.split("|")[2]);
                if (PersianChessEngineOn == false) {
                    setTimeout(function() {
                        FlipBoard();
                    }, 400);
                }
            }
        }, 600);
    }
}


// ══════════════════════════
//  Init board
// ══════════════════════════

var cfg = {
    draggable: true,
    dropOffBoard: 'snapback', // this is the default
    moveSpeed: 300,
    snapbackSpeed: 250,
    snapSpeed: 100,
    position: 'start',
    onDrop: onBoardPieceDrop
};
var board = new ChessBoard(document.getElementById("board"), cfg);


// ══════════════════════════
//  Windowing
// ══════════════════════════

function ToggleConsole() {
    PlaySound(audio_click);
    $("#console").toggle();
    $("#console").trigger("change");
    $("#console").scrollTop($("#console")[0].scrollHeight);
    $("#movelist").toggle();
    $("#movelist").trigger("change");
    $("#movelist").scrollTop($("#movelist")[0].scrollHeight);
}
$("#console").hide();


// Capture back button
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    document.addEventListener("backbutton", function(e) {
        TakeBack();
    }, false);

    // Load Audio
    LoadAudio();
}

// Sizing the screen
window.addEventListener("touchmove", function(e) {
    e.preventDefault();
}, false);

window.onresize = function(event) {
    screenResize();
    board.resize();
};

//settings
$.cookie.raw = true;

var theme = Get_LocalStorageValue("theme");
$('select[name^="Theme"] option[value="' + theme + '"]').attr("selected", "selected");

$(document).on("pagecreate", function() {
    $("#ThinkTimeChoice").on('slidestop', function(event) {
        SetThinkTime();
    });
});

// fastclick.js attach to buttons

var setting_btn = document.getElementById('setting_button');
var newgame_btn = document.getElementById('newgame_button');
var takebak_btn = document.getElementById('takebak_button');
var forward_btn = document.getElementById('forward_button');
var flip_btn = document.getElementById('flip_button');
var toggle_btn = document.getElementById('toggle_button');

FastClick.attach(setting_btn);
FastClick.attach(newgame_btn);
FastClick.attach(takebak_btn);
FastClick.attach(forward_btn);
FastClick.attach(flip_btn);
FastClick.attach(toggle_btn);
