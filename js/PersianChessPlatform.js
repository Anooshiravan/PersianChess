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
// ══════════════════════════
//  Platform
// ══════════════════════════

function Platform() {
    // if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) { // for all cordova user agents
    if (navigator.userAgent.match(/(Android)/)) {
        return "Android";
    } else {
        return "Browser";
    }
}

function is_Android() {
    if (Platform() == "Android") return true;
    else return false;
}

var platform = Platform();
if (is_Android()) debug_log = false;

// ══════════════════════════
//  Audio
// ══════════════════════════

var audio_on = false;
var lla;
var lla_loaded = false;
var audio5js = null;

var audio_welcome = 'audio/welcome.mp3';
var audio_click = 'audio/click.mp3';
var audio_move = 'audio/move.mp3';
var audio_end = 'audio/end.mp3';
var audio_check = 'audio/check.mp3';
var audio_capture = 'audio/capture.mp3';
var audio_checkmate = 'audio/checkmate.mp3';
var audio_whitewins = 'audio/whitewins.mp3';
var audio_blackwins = 'audio/blackwins.mp3';
var audio_draw = 'audio/draw.mp3';
var audio_gg = 'audio/gg.mp3';

function AudioOnOff() {
    PlaySound(audio_click);
    if (document.getElementById("audio_switch").value == "off") {
        if (!is_Android()) audio5js = null;
        audio_on = false;
    } else {
        if (!is_Android()) audio5js = new Audio5js;
        audio_on = true;
    }

    Set_LocalStorageValue("audio", document.getElementById("audio_switch").value);
}

function LoadAudio() {
    if (window.plugins && window.plugins.LowLatencyAudio) {

        lla = window.plugins.LowLatencyAudio;
        lla_loaded = true;

        // preload audio resource
        lla.preloadFX(audio_welcome, audio_welcome, 1, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 2);
        });
        lla.preloadFX(audio_click, audio_click, 1, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_move, audio_move, 1, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_end, audio_end, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_check, audio_check, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_capture, audio_capture, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_checkmate, audio_checkmate, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_whitewins, audio_whitewins, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_blackwins, audio_blackwins, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_draw, audio_draw, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
        lla.preloadFX(audio_gg, audio_gg, function(msg) {}, function(msg) {
            debuglog('error: ' + msg, 3);
        });
    } else {
        lla_loaded = false;
    }
}

function PlaySound(sound) {
    if (audio_on == false) return;

    if (lla_loaded == true) {
        lla.play(sound);
    } else {
        if (audio5js != null) {
            audio5js.load(sound);
            audio5js.play();
        }
    }
}


// ══════════════════════════
//  Local Storage
// ══════════════════════════


function LocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function Set_LocalStorageValue(name, value) {
    if (LocalStorageAvailable()) {
        try {
            localStorage.setItem(name, value);
        } catch (e) {}
    } else {
        try {
            $.cookie(name, value, {
                expires: 7,
                path: '/'
            });
        } catch (e) {}
    }
}


function Get_LocalStorageValue(name) {
    if (LocalStorageAvailable()) {
        try {
            return localStorage.getItem(name);
        } catch (e) {}
    } else {
        try {
            return $.cookie(name);
        } catch (e) {}
    }
}

function RestoreGameSettings() {
    if (vs_engine()) return;

    // Variant
    var ls_variant = Get_LocalStorageValue("variant");
    if (ls_variant != undefined && ls_variant != "" && ls_variant != null) {
        Engine_SetVariant(ls_variant);
        board.set_variant(ls_variant);
        board.theme(GetVariantTheme(ls_variant));
    }

    // FEN
    var ls_fen = Get_LocalStorageValue("fen");
    if (ls_fen != undefined && ls_fen != "" && ls_fen != null && ls_fen != START_FEN) {
        Engine_SetFen(ls_fen);
    }

    // History
    var ls_history = Get_LocalStorageValue("history");
    if (ls_history != undefined && ls_history != "" && ls_history != null) {
        Engine_SetHistory(ls_history);
        HistoryToPGN(ls_history);
        UpdateMoveList();
    }

    // Theme
    var ls_theme = Get_LocalStorageValue("theme");
    if (ls_theme != undefined && ls_theme != "" && ls_theme != null) {
        board.theme(ls_theme);
    }

    // ThinkTime
    var ls_thinktime = Get_LocalStorageValue("thinktime");
    if (ls_thinktime != undefined && ls_thinktime != "" && ls_thinktime != null) {
        $('#ThinkTimeChoice').val(ls_thinktime);
        $('#ThinkTimeChoice').slider('refresh');
        SetThinkTime();
    }

    // Audio
    var ls_audio = Get_LocalStorageValue("audio");
    if (ls_audio != undefined && ls_audio != "" && ls_audio != null) {
        if (ls_audio == 'on') {
            audio_on = true;
            $("#audio_switch").val('on').flipswitch().flipswitch('refresh');
        } else {
            audio_on = false;
            $("#audio_switch").val('off').flipswitch().flipswitch('refresh');
        }
    } else {
        // Turn on audio for Android on first app start
        if (is_Android()) {
            audio_on = true;
            $("#audio_switch").val('on').flipswitch().flipswitch('refresh');
        }
    }


    // Engine
    var ls_engine = Get_LocalStorageValue("engine");
    if (ls_engine != undefined && ls_engine != "" && ls_engine != null) {
        if (ls_engine == 'on') {
            Engine_TurnOn();
            $("#engine_switch").val('on').flipswitch().flipswitch('refresh');
        } else {
            Engine_TurnOff();
            $("#engine_switch").val('off').flipswitch().flipswitch('refresh');
        }
    }


}

function ResetGameSettings() {
    Set_LocalStorageValue("fen", "");
    Set_LocalStorageValue("history", "");
    Set_LocalStorageValue("theme", "");
}


function SaveGameToLS() {
    PersianChessEngine.postMessage("do::stop_demo");
    var game_location = document.getElementById("SaveLoadChoice").value;
    var game_content = Get_LocalStorageValue("variant") + "#" + Get_LocalStorageValue("fen") + "#" + Get_LocalStorageValue("history");
    Set_LocalStorageValue(game_location, game_content);

    var game_name = document.getElementById("SaveLoadChoice").options[document.getElementById("SaveLoadChoice").selectedIndex].text;
    msg = "Game is saved as: " + game_name;
    $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
    $('#do_popup').popup('open');
}


function LoadGameFromLS() {
    PersianChessEngine.postMessage("do::stop_demo");
    var game_location = document.getElementById("SaveLoadChoice").value;
    var game_content = Get_LocalStorageValue(game_location);
    var game_name = '';

    if (game_content == undefined || game_content == "" || game_content == null) {
        game_name = document.getElementById("SaveLoadChoice").options[document.getElementById("SaveLoadChoice").selectedIndex].text;
        msg = game_name + " not found.";
        $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
        $('#do_popup').popup('open');
        return;
    }

    var variant = game_content.split("#")[0];
    var fen = game_content.split("#")[1];
    var history = game_content.split("#")[2];

    Set_LocalStorageValue("variant", variant);
    Set_LocalStorageValue("fen", fen);
    Set_LocalStorageValue("history", history);

    RestoreGameSettings();

    game_name = document.getElementById("SaveLoadChoice").options[document.getElementById("SaveLoadChoice").selectedIndex].text;
    msg = game_name + " is loaded.";
    $('#do_popup').html("<div class='courier_new_big'>" + msg + "</div>");
    $('#do_popup').popup('open');
}

function LoadReport(report) {
    var variant = report.split("|")[0];
    var fen = report.split("|")[1];
    var history = report.split("|")[2];

    Set_LocalStorageValue("variant", variant);
    Set_LocalStorageValue("fen", fen);
    Set_LocalStorageValue("history", history);

    RestoreGameSettings();
}

// ══════════════════════════
//  Engine competition
// ══════════════════════════
var this_engine = '';

function vs_engine() {
    try {
        if (window.self !== window.top) {
            window.onmessage = function(e) {
                if (e.data != '') {
                    PlayForeignEngine(e.data);
                }
            };
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        return false;
    }
}

function PlayForeignEngine(message) {
    if (gameover) return;

    if (vs_engine()) {
        if (message == "request") {
            window.top.postMessage("fen-" + current_fen, '*');
            engine = "engine1";
            return;
        }

        if (message.startsWith('fen')) {
            this_fen = message.split('-')[1];
            Engine_SetFen(this_fen);
            engine = "engine2";
            board.theme("blue");
            return;
        }

        move = message;
        if (board_active) {
            PersianChessEngine.postMessage("parse::" + move);
            setTimeout(function() {
                if (ParsedMove.split("|")[0] == move) {
                    Engine_MakeMove(ParsedMove.split("|")[1]);
                    PlayMoveSound(ParsedMove.split("|")[2]);
                } else {
                    window.top.postMessage("request", '*');
                }
            }, 300);
        }
    }
}

function PostMoveToForeignEngine(this_move) {
    if (this_engine == '') {
        window.top.postMessage("engine1-" + this_move, '*');
    } else {
        window.top.postMessage(engine + "-" + this_move, '*');
    }
}

// ══════════════════════════
//  Orientation
// ══════════════════════════

window.onresize = function(event) {
    screenResize();
};


var spinner_length;

function screenResize() {
    var winHeight = document.body.parentNode.clientHeight;
    var winWidth = document.body.parentNode.clientWidth;
    var board_width;
    var board_container_width = 0;
    var board_container_float = "";
    var console_container_width = 0;
    var console_container_float = "";
    var controls_container_width = 0;
    var controls_container_float = "";


    if (winWidth > winHeight) // Landscape
    {
        board_container_width = winHeight;
        board_container_height = board_container_width;
        board_container_float = "left";
        board_width = board_container_width;

        controls_container_width = 42;
        controls_container_height = winHeight;
        controls_container_float = "right";

        console_container_width = winWidth - board_container_width - controls_container_width - 20;
        console_container_height = winHeight - 12;
        console_container_float = "right";
    } else {
        board_container_width = winWidth;
        board_container_height = board_container_width;
        board_container_float = "left";
        board_width = board_container_width + 6;

        controls_container_width = winWidth;
        controls_container_height = 42;
        controls_container_float = "left";

        console_container_width = winWidth;
        console_container_height = winHeight - board_container_height - controls_container_height - 12;
        console_container_float = "left";

    }

    spinner_length = Math.round(board_width / 150);
    spinner_radius = Math.round(board_width / 40);


    document.getElementById("board_container").style.width = board_container_width + 'px';
    document.getElementById("board_container").style.height = board_container_height + 'px';
    document.getElementById("board_container").style.float = board_container_float;
    document.getElementById("board").style.width = board_width + 'px';

    document.getElementById("console_container").style.width = console_container_width + 'px';
    document.getElementById("console_container").style.height = console_container_height + 'px';
    document.getElementById("console_container").style.float = console_container_float;


    document.getElementById("controls_container").style.width = controls_container_width + 'px';
    document.getElementById("controls_container").style.height = controls_container_height + 'px';
    document.getElementById("controls_container").style.float = controls_container_float;

}
screenResize();


$("#board").dblclick(function() {
    FlipBoard();
});
