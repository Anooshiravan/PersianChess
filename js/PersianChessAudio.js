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

var welcome = 'audio/welcome.mp3';
var click = 'audio/click.mp3';
var quite_move = 'audio/move.mp3';
var end = 'audio/end.mp3';
var check = 'audio/check.mp3';
var capture = 'audio/capture.mp3';
var checkmate= 'audio/checkmate.mp3';
var whitewins = 'audio/whitewins.mp3';
var blackwins = 'audio/blackwins.mp3';
var draw = 'audio/draw.mp3';
var gg = 'audio/gg.mp3';

function AudioOnOff()
{
    PlaySound(click);
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
        lla.preloadFX(welcome, welcome, 1, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(click, click, 1, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(move, move, 1, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(end, end, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(check, check, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(capture, capture, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(checkmate, checkmate, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(whitewins, whitewins, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(blackwins, blackwins, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(draw, draw, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
        });
        lla.preloadFX(gg, gg, function(msg){
        }, function(msg){
            console.log( 'error: ' + msg );
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