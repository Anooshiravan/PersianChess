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
// ══════════════════════════
//  Logging
// ══════════════════════════

var debug_log = true;
var debug_to_console = false;

function debuglog (message)
{
    if (debug_log == true) {
        console.log ("> " + message);
    }
    if (debug_to_console == true) {
        Append("console", "> " + message);
    }
}

// ══════════════════════════
//  Game state
// ══════════════════════════
var theme = "green";
var brd_history = null;
var brd_hisPly = 0;
var current_fen = null;

// ══════════════════════════
//  Init engine
// ══════════════════════════

var PersianChessEngineValid = true;
var PersianChessEngineOn = true;
var PersianChessEngine;

        function StartEngine()
        {
            debuglog ("Starting WebWorker Engine...")

            if (!PersianChessEngineValid) {
                return false;
            }

            if (PersianChessEngine == null) {
                PersianChessEngineValid = true;
                try {
                    PersianChessEngine = new Worker("js/PersianChessEngine/PersianChessEngine.js");
                    PersianChessEngine.onmessage = function (e) {
                        ProcessEngineMessage(e.data)
                    }
                    PersianChessEngine.error = function (e) {
                        debuglog("Error from WebWorker Engine:" + e.message);
                    }
                    PersianChessEngine.postMessage("init::hello");
                } catch (error) {
                    PersianChessEngineValid = false;
                        debuglog("Failed to load the WebWorker Engine." + error);
                }
            }
            return PersianChessEngineValid;
        }

StartEngine();

// ══════════════════════════
//  Engine Message processing
// ══════════════════════════

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

function ProcessEngineMessage(message)
{
    var msg_title = message.substr(0, message.indexOf('::'));
    var msg_body = message.substr(message.indexOf('::') + 2);
    switch(msg_title) {
    case "init":
        ProcessEngineMessage_Init(msg_body);
        break;
    case "parsed":
        ProcessEngineMessage_Parsed(msg_body);
        break;
    case "pos":
        ProcessEngineMessage_Pos(msg_body);
        break;
    case "pgn":
        ProcessEngineMessage_Pgn(msg_body);
        break;
    case "fen":
        ProcessEngineMessage_Fen(msg_body);
        break;
    case "history":
        ProcessEngineMessage_History(msg_body);
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
    default:
        debuglog ("Message not recognised: " + message)
        break
    }
}

// Init::
function ProcessEngineMessage_Init(message)
{
    switch(message) {
        case "hi":
            debuglog ("Engine connected.");
            PersianChessEngine.postMessage("init::start_engine");
            break;
        case "engine_started":
            debuglog ("Engine started.");
            StartNewGame();
            break;
        case "new_game_started":
            debuglog ("New game started. Turning the Engine on, set the default thinktime, variant and depth.");
            Engine_TurnOn();
            break;
        case "engine_is_on":
            debuglog ("Engine is on.");
            PersianChessEngineOn = true;
            break;
        case "engine_is_off":
            debuglog ("Engine is off.");
            PersianChessEngineOn = false;
            break;
        default:
            debuglog ("Message not recognised.");
            break
    }
}

// Parsed::
var ParsedMove = "NOMOVE";
function ProcessEngineMessage_Parsed(message)
{
    debuglog ("Move parsed by enigne: " + message);
    // Move is parsed by enigne 
    ParsedMove = message;
}

// Pos::
function ProcessEngineMessage_Pos(message)
{
    debuglog ("Engine Position received: " + message)
    var engine_position = message.split("|")[0];
    var gui_position = board.fen();
    if (engine_position == gui_position) 
    {
        debuglog ("Position is up to date.")
    }
    else
    {
        debuglog ("Updating GUI position...");
        board.position(engine_position);
    }
    var board_side = message.split("|")[1];

    switch(board_side) {
        case '0':
            board.logo ("white_to_move");
            break;
        case '1':
            board.logo ("black_to_move");
            break;
        default:
            break
    }
    from_square = message.split("|")[2].split("-")[0];
    to_square = message.split("|")[2].split("-")[1];
    board.highlight(from_square, to_square);
    board.is_active(true);
}

// Pgn::
function ProcessEngineMessage_Pgn(pgn)
{
    Append("movelist", pgn);
}

// Fen::
function ProcessEngineMessage_Fen(fen)
{
    debuglog ("Updating current_fen: " + fen);
    current_fen = fen;
}

// History::
function ProcessEngineMessage_History(history)
{
    debuglog ("Updating brd_history.");
    brd_history = history;
}

// Info::
function ProcessEngineMessage_Info(info)
{
    debuglog ("Info: " + info);
    if (info.split("|")[0] == "check")
    {
        var KingSq = info.split("|")[1];
        board.highlight_check(KingSq);
    }
    if (info.split("|")[0] == "thinking")
    {
        board.logo("wait");
        board.is_active(false);
    }
}

// Gameover::
function ProcessEngineMessage_Gameover(message)
{
    var Result = message.split("|")[0];
    var Rule = message.split("|")[1];
    var KingSq = message.split("|")[2];
    debuglog ("Gameover: Result:" + Result + " Rule:" + Rule + " KingSq:" + KingSq);
    board.highlight_mate(KingSq);
    board.is_active(false);
}

// Console::
function ProcessEngineMessage_Console(message)
{
    Append("console", message);
    debuglog ("Print to console: " + message);
}

function ProcessEngineMessage_Debug(message)
{
    debuglog ("Eng_DBG: " + message);
}



// ══════════════════════════
//  Engine Functions
// ══════════════════════════
    function Engine_MakeMove(ParsedMove)
    {
        debuglog("Engine to move: " + ParsedMove);
        PersianChessEngine.postMessage("move::" + ParsedMove);
    }
    function Engine_Go()
    {
        debuglog("Engine to think.");
        PersianChessEngine.postMessage("init::go");
    }
    function Engine_TurnOn()
    {
        debuglog("Turn on Engine.");
        PersianChessEngine.postMessage("init::turn_on");
    }
    function Engine_TurnOff()
    {
        debuglog("Turn off Engine.");
        PersianChessEngine.postMessage("init::turn_off");
    }
    function Engine_SetThinkTime(thinktime)
    {
        debuglog("Setting Engine think time to: " + thinktime);
        PersianChessEngine.postMessage("set::thinktime|" + thinktime);
    }
    function Engine_SetVariant(variant)
    {
        debuglog("Setting Engine variant to: " + variant);
        PersianChessEngine.postMessage("set::variant|" + variant);
    }
    function Engine_SetSearchDepth(depth)
    {
        debuglog("Setting Engine max depth to: " + depth);
        PersianChessEngine.postMessage("set::depth|" + depth);
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
        debuglog ("Message sent to Engine to parse move:" + move);
        setTimeout(function () {
            if (ParsedMove.split("|")[0] == move) 
            {
                Engine_MakeMove(ParsedMove.split("|")[1]);
            }
        }, 100);
    }
};

function ProcessBoardPosChange(oldPos, newPos)
{
    // Do nothing
    // debuglog("Board Position Changed.");
    // debuglog("New position: " + ChessBoard.objToFen(newPos));
}

// ══════════════════════════
//  GUI Functions
// ══════════════════════════

function SetThinkTime()
{
    var thinktime = $('#ThinkTimeChoice').val();
    var type = thinktime.split("|")[0];
    var value = thinktime.split("|")[1];

    switch(type) {
        case 's':
            var miliseconds = value * 1000;
            Engine_SetThinkTime(miliseconds);
            Engine_SetSearchDepth(16);
            break;
        case 'm':
            jPrompt("Please enter the number of seconds for engine to think:", "3", "Engine think time", function(r) {
                if(r) 
                {
                    if (!isNaN(r) && parseInt(r) > 0)
                    {
                        var miliseconds = r * 1000;
                        Engine_SetThinkTime(miliseconds);
                        Engine_SetSearchDepth(16);
                    }
                    else
                    {
                        jAlert("Please enter a numerical value bigger than 0.", "Incorrect value")
                    }
                }        
            });
            break;
        case 'na':
            break;
        case 'd':
            var infinite_thinktime = 2147483647;
            Engine_SetThinkTime(infinite_thinktime);
            Engine_SetSearchDepth(value);
            break;
        default:
            break
    }
}

function SetVariant()
{

}

function SetTrainingPosition()
{


}

function SetTheme()
{
    // PlaySound(click);
    switch(theme) {
        case "green":
            theme = 'brown';
            document.getElementById("theme-button").src = "img/footer/blue.png";
            break;
        case "brown":
            theme = 'blue';
            document.getElementById("theme-button").src = "img/footer/oriental.png";
            break;
        case "blue":
            theme = 'oriental';
            document.getElementById("theme-button").src = "img/footer/green.png";
            break;
        case "oriental":
            theme = 'green';
            document.getElementById("theme-button").src = "img/footer/brown.png";
            break;
        default:
            break;
        }
    board.theme(theme);
    board.wait(false);
}

function StartNewGame()
{
    SetThinkTime();
    SetVariant();
    PersianChessEngine.postMessage("init::new_game");
    board.removehighlights();
}

function FlipBoard()
{
    // PlaySound(click);
    board.flip();
    PersianChessEngine.postMessage("do::flip");
    if (PersianChessEngineOn) {
        Engine_Go();
    }
}

function MoveBack()
{

}

function MoveForward()
{

}

function EngineOnOff()
{
    // PlaySound(click);
    if (PersianChessEngineOn)
    {
        Engine_TurnOff();
        document.getElementById("engine-button").src = "img/footer/engine_off.png";
        Append("console", "Engine is OFF.")
    }
    else
    {
        Engine_TurnOn();
        document.getElementById("engine-button").src = "img/footer/engine.png";
        Append("console", "Engine is ON.")
    }
}

function AudioOnOff()
{

}

function SetPositionFen()
{

}

function SendGameByMail()
{

}

function About()
{
    
}

// ══════════════════════════
//  Console Functions
// ══════════════════════════

function Append(id, line)
{
    switch(id) {
        case "movelist":
            document.getElementById('movelist').value = line;
            $("#movelist").trigger("change");
            $('#movelist').scrollTop($('#movelist')[0].scrollHeight);
            break;
        case "console":
            document.getElementById('console').value += "\r\n" + line;
            $("#console").trigger("change");
            $('#console').scrollTop($('#console')[0].scrollHeight);
            break;
        default:
            debuglog ("ID is not recognised.")
            break;
    }
}
