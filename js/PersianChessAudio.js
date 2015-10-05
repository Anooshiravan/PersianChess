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