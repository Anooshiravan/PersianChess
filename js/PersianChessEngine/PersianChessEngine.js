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
//  Default
// ══════════════════════════
var engine_on = false;

// ══════════════════════════
//  Logging
// ══════════════════════════

var debug_log = true;

function debuglog (message)
{
    if (debug_log == true) console.log ("> Engine: " + message);
}

// ══════════════════════════
//  Load Engine files
// ══════════════════════════

importScripts(
  "Defs.js",
  "Variants.js",
  "Competitor.js",
  "InputOutput.js",
  "Board.js",
  "Book.js",
  "MoveGenerator.js",
  "MoveHandler.js",
  // "Perft.js",
  "Evaluator.js",
  "PvTable.js",
  "Search.js",
  "Protocol.js",
  "Init.js"

  
);

// ══════════════════════════
//  Messaging
// ══════════════════════════

self.onmessage = function (e) {
    ProcessGuiMessage(e.data)
}

function SendMessageToGui(title, message)
{
  postMessage(title + "::" + message);
}

function ProcessGuiMessage(message)
{
	debuglog("Message received: " + message);
	var msg_title = message.substr(0, message.indexOf('::'));
	var msg_body = message.substr(message.indexOf('::') + 2);

	switch(msg_title) {
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
        debuglog ("Message not recognised.")
        break
	}
}

function ProcessGuiMessage_Init(message)
{
    switch(message) {
    case "hello":
        SendMessageToGui ("init", "hi");
        break;    
    case "start_engine":
        StartEngine();
        break; 
    case "new_game":
        NewGame();
        var engine_position = BoardToFen().replace(/ .+$/, '');
        SendMessageToGui("pos", engine_position);
        break;   
    case "turn_on":
        engine_on = true;
        SendMessageToGui("init", "engine_is_on");
        break; 
    case "turn_off":
        engine_on = false;
        SendMessageToGui("init", "engine_is_off");
        break;
    case "go":
        if (engine_on) Think();
        break;
    default:
        debuglog ("Init::message not recognised.")
        break
    }
}

function ProcessGuiMessage_Parse(move)
{
    debuglog ("Begin parsing move: " + move);
    var src = CBSQ2SQ(move.split("-")[0]);
    var dst = CBSQ2SQ(move.split("-")[1]);
    var parsed = ParseMove(src, dst);
    if (parsed != NOMOVE) 
    {
        SendMessageToGui("parsed", move + "|" + parsed);
    }
    else
    {
        SendMessageToGui("parsed", "NOMOVE");
        SendPosition();
    }
}

function ProcessGuiMessage_Move(parsed_move)
{
    debuglog("Making move: " + parsed_move);
    MakeMove(parsed_move);
    if (debug_log) PrintBoard();
    SendPosition();
    if (engine_on) Think();
}

function ProcessGuiMessage_Set(message)
{
    var set = message.split("|")[0];
    var value = message.split("|")[1];

    switch(set) {
    case "thinktime":
        debuglog ("Set srch_time:" + value);
        srch_time = value;
        break;    
    case "depth":
        debuglog ("Set srch_depth:" + value);
        srch_depth = value;
        break; 
    case "variant":
        debuglog ("Set variant:" + value);
        variant = value;
        break; 
    default:
        debuglog ("Set::message not recognised.")
        break
    }
}

function ProcessGuiMessage_Do(command)
{
    switch(command) {
    case "flip":
        GameController.BoardFlipped ^= 1;
        SendPosition();
        break;    
    default:
        debuglog ("Do::message not recognised.")
        break
    }
}

// ══════════════════════════
//  Engine functions
// ══════════════════════════

function Think()
{
    debuglog("Starting to think.");
    SendMessageToGui("info", "thinking");
    GameController.PlayerSide = brd_side ^ 1;
    setTimeout(function () {
            StartSearch();
    }, 100);
}

function StartSearch() {
    if (srch_time == undefined || srch_time <= 0) srch_time = 3000;
    debuglog ("Starting search: srch_depth:" + srch_depth + " srch_time: " + srch_time);
    SearchPosition();
    MakeMove(srch_best);
    if (debug_log) PrintBoard();
    var engine_position = BoardToFen().replace(/ .+$/, '');
    SendMessageToGui("pos", engine_position+ "|" + brd_side);
    CheckAndSet();
}

function CheckAndSet() {
    var KingSq = SQUARES.OFFBOARD;
    if (SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1) == BOOL.TRUE) {
        KingSq = PrSq(brd_pList[PCEINDEX(Kings[brd_side], 0)]);
        SendMessageToGui("info", "check|" + KingSq);
    }
    if (GameOver() != BOOL.TRUE) {
        GameController.GameOver = BOOL.FALSE;
    } else {
        GameController.GameOver = BOOL.TRUE;
        GameController.GameSaved = BOOL.TRUE;
    }
    ClearHistory();
    SendGameState();
}

function GameOver() {

    var KingSq = SQUARES.OFFBOARD;

    if (brd_fiftyMove > 100) {
        SendMessageToGui("gameover", "draw|fifty_move_rule|" + SQUARES.NO_SQ);
        return BOOL.TRUE;
    }
    if (ThreeFoldRep() >= 2) {
        SendMessageToGui("gameover", "draw|3_ford_repetition|" + SQUARES.NO_SQ);
        return BOOL.TRUE;
    }
    if (DrawMaterial() == BOOL.TRUE) {
        SendMessageToGui("gameover", "draw|insufficient_material|" + SQUARES.NO_SQ);
        return BOOL.TRUE;
    }
    if (CitadelDraw() == BOOL.TRUE) 
    {
        SendMessageToGui("gameover", "draw|citadel_rule|" + SQUARES.NO_SQ);
        return BOOL.TRUE;
    }

    GenerateMoves();

    var MoveNum = 0;
    var found = 0;
    for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {

        if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
            continue;
        }
        found++;
        TakeMove();
        break;
    }

    if (found != 0) return BOOL.FALSE;
    var InCheck = SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1);
    debuglog('No Move Found, incheck:' + InCheck);

    if (InCheck == BOOL.TRUE) {
        KingSq = PrSq(brd_pList[PCEINDEX(Kings[brd_side], 0)]);
        if (brd_side == COLOURS.WHITE) {
            SendMessageToGui("gameover", "blackwins|checkmate|" + KingSq);
            return BOOL.TRUE;
        } else {
            SendMessageToGui("gameover", "whitewins|checkmate|" + KingSq);
            return BOOL.TRUE;
        }
    } else {
        SendMessageToGui("gameover", "draw|stalemate|" + KingSq);
        return BOOL.TRUE;
    }
    return BOOL.FALSE;
}

function ClearHistory()
{
    for(index = brd_hisPly; index < MAXGAMEMOVES; index++) {
        brd_history[index].move = NOMOVE;
        brd_history[index].fiftyMove = 0;
        brd_history[index].enPas = 0;
        brd_history[index].castlePerm = 0;
    }
}

function SendPosition()
{
    var engine_position = BoardToFen().replace(/ .+$/, '');
    SendMessageToGui("pos", engine_position + "|" + brd_side);
}

function SendGameState()
{
    SendMessageToGui("fen", BoardToFen());
    SendMessageToGui("history", brd_history);
}
