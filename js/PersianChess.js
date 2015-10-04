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

var version = "1.4.0";

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
var START_FEN = "f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1";
var variant = "Persian";
var board_active = true;
var theme = "green";
var current_fen = START_FEN;
var pgn = "";
var engine_move = "";
var check_square = "";
var mate_square = "";
var startup = true;


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
        setTimeout(function () {
            board.position(engine_position);
        }, 300);
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
    board.is_active(true);
}

// Pgn::
function ProcessEngineMessage_Pgn(engine_pgn)
{
    debuglog ("Updating pgn: " + engine_pgn);
    pgn = engine_pgn;
    UpdateMoveList();
    UpdateBoardHighlight();
}

// Fen::
function ProcessEngineMessage_Fen(fen)
{
    debuglog ("Updating current_fen: " + fen);
    current_fen = fen;
}

// Info::
function ProcessEngineMessage_Info(info)
{
    debuglog ("Info: " + info);
    if (info.split("|")[0] == "check")
    {
        var KingSq = info.split("|")[1];
        check_square = KingSq;
        timeout = setTimeout(function(){ PlaySound(check); }, 500);
    }
    else
    {
        check_square = "";
    }

    PlayMoveSound(info);
    
    if (info == "thinking")
    {
        board.logo("wait");
        board.is_active(false);
    }
    if (info == "invalid_fen")
    {
        jAlert("Fen string is invalid.", "Error")
    }
}

// Gameover::
function ProcessEngineMessage_Gameover(message)
{
    var Result = message.split("|")[0];
    var Rule = message.split("|")[1];
    var KingSq = message.split("|")[2];
    debuglog ("Gameover: Result:" + Result + " Rule:" + Rule + " KingSq:" + KingSq);
    mate_square = KingSq;
    board.is_active(false);
    var msg;
    var end_game = Result + "|" + Rule;
    switch(end_game) {
        case "draw|fifty_move_rule":
            msg = "Draw: Fifty move rule";
            GGSound("draw");
            break;
        case "draw|3_ford_repetition":
            msg = "Draw: 3-fold repetition";
            GGSound("draw");
            break;
        case "draw|insufficient_material":
            msg = "Draw: Insufficient material";
            GGSound("draw");
            break;
        case "draw|citadel_rule":
            msg = "Draw: Citadel rule";
            GGSound("draw");
            break;
        case "draw|stalemate":
            msg = "Draw: Stalemate";
            GGSound("draw");
            break;
        case "blackwins|checkmate":
            msg = "Checkmate! Black wins."
            GGSound("blackwins");
            break;
        case "whitewins|checkmate":
            msg = "Checkmate! White wins.";
            GGSound("whitewins");
            break;
        default:
            break;
        }
    Append ("movelist", msg);
    timeout = setTimeout(function(){ 
        jAlert(msg, 'Game Over');
    }, 3000);
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
    function Engine_SetFen(fen)
    {
        debuglog("Setting Engine FEN to: " + fen);
        PersianChessEngine.postMessage("set::fen|" + fen);
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
                PlayMoveSound(ParsedMove.split("|")[2]);
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

function SetVariant(variant)
{
   Engine_SetVariant(variant);
}

function SetTrainingPosition()
{


}

function SetTheme()
{
    PlaySound(click);
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
    PlaySound(click);
    variant = $('#VariantChoice').val();
    switch(variant) {
        case "Persian":
            variantname = "Persian Princess";
            theme = "green";
            break;
        case "ASE":
            variantname = "Egyptian Eye";
            theme = "brown";
            break;
        case "Citadel":
            variantname = "Celtic Citadel";
            theme = "blue";
            break;
        case "Oriental":
            variantname = "Oriental Omega";
            theme = "oriental";
            break;
        default:
            break;
        }
    if (startup == true) {
        SetThinkTime();
        SetVariant(variant);
        PersianChessEngine.postMessage("init::new_game");
        board.theme(theme);
        board.removehighlights();
        startup = false;
    }
    else
    {
        jConfirm("Do you want to start a new game in <b>\"" + variantname + "\"</b> variant?", "New Game", function(r) {
            if (r) {
                SetThinkTime();
                SetVariant(variant);
                PersianChessEngine.postMessage("init::new_game");
                board.theme(theme);
                board.removehighlights();
                timeout = setTimeout(function(){ PlaySound(welcome); }, 500);
            }
        });
    }
}

function FlipBoard()
{
    PlaySound(click);
    board.flip();
    PersianChessEngine.postMessage("do::flip");
    if (PersianChessEngineOn) {
        Engine_Go();
    }
}

function TakeBack()
{
    PlaySound(click);
    PersianChessEngine.postMessage("do::takeback");
    mate_square = "";
    check_square = "";
    board.removehighlights();
}

function MoveForward()
{
    PlaySound(click);
    PersianChessEngine.postMessage("do::forward");
}

function EngineOnOff()
{
    PlaySound(click);
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

function SetPosition()
{
    PlaySound(click);
    var txt;
    jPrompt("Please enter position FEN:", current_fen, "Insert new FEN", function(r) {
    if( r ) 
        {
            var new_fen = r;
            Engine_SetFen(new_fen);
        }
    });
}

function SendGameByMail()
{
    PlaySound(click);

}

function About()
{
    PlaySound(click); 
    var go2web = "<b>Persian Chess Engine | Version " + version + "</b>\r\n© 2009 - 2015 PersianChess.com\r\n\r\nPersian Chess is invented and programmed by:\r\n<b>Anooshiravan Ahmadi</b>\r\n\r\nClick Ok to go to the website for the detailed game information, or Cancel to return to the game.";
     jConfirm(go2web, "About", function(r) {
            if (r) window.open("http://www.persianchess.com/game-rules", "_system", "location=no");
    });  
}

// ══════════════════════════
//  Console Functions
// ══════════════════════════

function isEven(n) {
    n = Number(n);
    return n === 0 || !! (n && !(n % 2));
}

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

function UpdateMoveList()
{
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

function UpdateBoardHighlight()
{
    setTimeout(function () {
        board.highlight(engine_move.split("-")[0], engine_move.split("-")[1])
        if (check_square != "") board.highlight_check(check_square);
        if (mate_square != "") board.highlight_mate (mate_square);
    }, 600);
}

function GGSound(result) {
    if (result == "draw") {
        timeout = setTimeout(function(){ PlaySound(draw); }, 500);
    }
    else if (result == "whitewins") {
        timeout = setTimeout(function(){ PlaySound(checkmate); }, 500);
        timeout = setTimeout(function(){ PlaySound(whitewins); }, 2000);
    }
    else if (result == "blackwins") {
        timeout = setTimeout(function(){ PlaySound(checkmate); }, 500);
        timeout = setTimeout(function(){ PlaySound(blackwins); }, 2000);
    }
    timeout = setTimeout(function(){ PlaySound(gg); }, 3000);
}

function PlayMoveSound(flag)
{
    var delay = 300;
    switch(flag) {
        case "quite":
            setTimeout(function(){ PlaySound(quite_move); }, delay);
            break;
        case "en_passant":
            setTimeout(function(){ PlaySound(capture); }, delay);
            break;
        case "castle":
            setTimeout(function(){ PlaySound(quite_move); }, delay);
            break;
        case "rendezvous":
            setTimeout(function(){ PlaySound(quite_move); }, delay);
            break;
        case "capture":
            setTimeout(function(){ PlaySound(capture); }, delay);
            break;
        case "promote":
            setTimeout(function(){ PlaySound(quite_move); }, delay);
            break;
        default:
            break;
    }
}