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

function Platform()
{
    // if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) { // for all cordova user agents
    if (navigator.userAgent.match(/(Android)/)) {
      return "Android";
    } 
    else {
      return "Browser";
    }
}

function is_Android()
{
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
var audio_checkmate= 'audio/checkmate.mp3';
var audio_whitewins = 'audio/whitewins.mp3';
var audio_blackwins = 'audio/blackwins.mp3';
var audio_draw = 'audio/draw.mp3';
var audio_gg = 'audio/gg.mp3';

function AudioOnOff()
{
    PlaySound(audio_click);
    if (audio_on == true)
    {
        audio5js = null;
        document.getElementById("audio-button").src = "img/footer/audio_off.png";
        audio_on = false;
        document.getElementById('movelist').value += "\r\n> Audio is OFF.";
    }
    else
    {
        audio5js = new Audio5js;
        document.getElementById("audio-button").src = "img/footer/audio.png";
        audio_on = true;
        document.getElementById('movelist').value += "\r\n> Audio is ON.";
    }
}


function LoadAudio()
{
    // Turn on audio for Android, it remains off for browsers until user choose to turn audio on
    if (is_Android())
    {
        document.getElementById("audio-button").src = "img/footer/audio.png";
        audio_on = true;
    }
    if( window.plugins && window.plugins.LowLatencyAudio ) {
        lla = window.plugins.LowLatencyAudio;
        lla_loaded = true;

        // preload audio resource
        lla.preloadFX(audio_welcome, audio_welcome, 1, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_click, audio_click, 1, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_move, audio_move, 1, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_end, audio_end, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_check, audio_check, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_capture, audio_capture, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_checkmate, audio_checkmate, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_whitewins, audio_whitewins, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_blackwins, audio_blackwins, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_draw, audio_draw, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
        lla.preloadFX(audio_gg, audio_gg, function(msg){
        }, function(msg){
            debuglog( 'error: ' + msg );
        });
    }
    else
    {
        lla_loaded = false;
    }
}

function PlaySound(sound)
{
    if (audio_on == false) return;

    if (lla_loaded == true) 
        {
            lla.play(sound);
        }
    else
        {
            if (audio5js != null)
            {
                audio5js.load(sound);
                audio5js.play();
            }
        }
}


// ══════════════════════════
//  Local Storage
// ══════════════════════════


function LocalStorageAvailable() 
{
    try 
    {
        return 'localStorage' in window && window['localStorage'] !== null;
    } 
    catch (e) 
    {
        return false;
    }
}

function Set_LocalStorageValue(name, value)
{
    if (LocalStorageAvailable())
    {
        try
        {
            localStorage.setItem(name, value);
        }
        catch(e){}
    }
    else
    {
        try
        {
            $.cookie(name, value, { expires: 7, path: '/' });
        }
        catch(e){}
    }
}


function Get_LocalStorageValue(name)
{
    if (LocalStorageAvailable())
    {
        try
        {
            return localStorage.getItem(name);
        }
        catch(e){}
    }
    else
    {
        try
        {
            return $.cookie(name);
        }
        catch(e){}
    }
}

function RestoreGameSettings()
{
    if (vs_engine()) return;
    
    // FEN
    var ls_fen = Get_LocalStorageValue("fen");
    if (ls_fen != undefined && ls_fen != "" && ls_fen != null) Engine_SetFen(ls_fen);

    // PGN
    var ls_history = Get_LocalStorageValue("history");
    if (ls_history != undefined && ls_history != "" && ls_history != null) 
    {
            Engine_SetHistory(ls_history);
            HistoryToPGN(ls_history);
            UpdateMoveList();
    }
}

function ResetGameSettings()
{
    var ls_fen = "";
    Set_LocalStorageValue("fen", ls_fen)

    var ls_history = "";
    Set_LocalStorageValue("history", ls_history)

}


// ══════════════════════════
//  Engine competition
// ══════════════════════════
var this_engine = '';

function vs_engine()
{
    try
    {
        if (window.self !== window.top)
        {
            window.onmessage = function(e){
                if (e.data != '') {
                    PlayForeignEngine(e.data);
                }
            };
            return true;
        }
        else
        {
            return false;
        }
    }
    catch(ex)
    {
        return false;
    }
}

function PlayForeignEngine(message)
{
    if (gameover) return;

    if (vs_engine()) 
    {
        if (message == "request")
        {
            window.top.postMessage("fen-" + current_fen, '*');
            engine = "engine1";
            return;
        }

        if (message.startsWith('fen'))
        {
            this_fen = message.split('-')[1];
            Engine_SetFen(this_fen);
            engine = "engine2";
            board.theme("blue");
            return;
        }

        move = message;
        if (board_active) {
            PersianChessEngine.postMessage("parse::" + move);
            setTimeout(function () {
                if (ParsedMove.split("|")[0] == move) 
                {
                    Engine_MakeMove(ParsedMove.split("|")[1]);
                    PlayMoveSound(ParsedMove.split("|")[2]);
                }
                else
                {
                    window.top.postMessage("request", '*');
                }
            }, 300);
        }
    }
}

function PostMoveToForeignEngine(this_move)
{
    if (this_engine == '') 
    {
        window.top.postMessage("engine1-" + this_move, '*');
    }
    else
    {
        window.top.postMessage(engine + "-" + this_move, '*');   
    }
}