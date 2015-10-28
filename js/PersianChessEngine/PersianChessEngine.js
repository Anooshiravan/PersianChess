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

var debug_log = false;

function debuglog (message)
{
    if (debug_log == true) postMessage("debug::" + message);
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
        SendPosition();
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
        if (engine_on) MoveNow();
        break;
    default:
        debuglog ("Init::message not recognised.")
        break
    }
}

function ProcessGuiMessage_Parse(move)
{
    debuglog ("Begin parsing move: " + move + " in variant " + variant);
    var src = CBSQ2SQ(move.split("-")[0]);
    var dst = CBSQ2SQ(move.split("-")[1]);
    var parsed = ParseMove(src, dst);
    
    if (parsed != NOMOVE) 
    {
        var msg = move + "|" + parsed;
        var flag = "|quite";
        if((parsed & MFLAGEP)   != 0)   flag = "|en_passant"
        if((parsed & MFLAGCA)   != 0)   flag = "|castle"
        if((parsed & MFLAGRZ)   != 0)   flag = "|rendezvous"
        if((parsed & MFLAGCAP)  != 0)   flag = "|capture"
        if((parsed & MFLAGPROM) != 0)   flag = "|promote"
        msg += flag;
        SendMessageToGui("parsed", msg);
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
    if (engine_on) MoveNow();
}

function ProcessGuiMessage_Set(message)
{
    var set = message.split("|")[0];
    var value = message.split("|")[1];

    switch(set) {
    case "thinktime":
        debuglog ("Set srch_time: " + value);
        srch_time = value;
        break;    
    case "depth":
        debuglog ("Set srch_depth: " + value);
        srch_depth = value;
        break; 
    case "variant":
        debuglog ("Set variant: " + value);
        setVariantDefs(value);
        break; 
    case "fen":
        debuglog ("Set FEN: " + value);
        SetFen(value);
        break;
    case "history":
        debuglog ("Set History: " + value);
        SetHistory(value);
        SendPosition();
        break;
    case "tp":
        debuglog ("Set TP: " + value);
        SetFen(Get_TP_Fen(value));        
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
    case "takeback":
        if (brd_hisPly > 0) {
            TakeMove();
            brd_ply = 0;
            if (debug_log) PrintBoard();
            SendGameState();
            SendPosition();
        }  
        break; 
    case "forward":
        var move = brd_history[brd_hisPly].move;
        if (move != 0 && move != undefined && ParseMove(FROMSQ(move), TOSQ(move)))
        {
            MakeMove(move);
            SendPosition();
        }
        else
        {
            if (engine_on == true) MoveNow();
        }
        break
    default:
        debuglog ("Do::message not recognised.")
        break
    }
}

// ══════════════════════════
//  Engine functions
// ══════════════════════════

function MoveNow()
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
    if (srch_depth == 0 || srch_depth == undefined) srch_depth = MAXDEPTH;
    debuglog ("Starting search: srch_depth: " + srch_depth + " srch_time: " + srch_time);
    SearchPosition();
    MakeMove(srch_best);
    if (debug_log) PrintBoard();
    var engine_position = BoardToFen().replace(/ .+$/, '');
    SendPosition();
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
    var moved = PrSq(FROMSQ(srch_best)) + "-" + PrSq(TOSQ(srch_best));
    SendMessageToGui("pos", engine_position + "|" + brd_side);
}

function SendBestMove(best_move)
{
    var flag = "|quite";
    if((best_move & MFLAGEP)   != 0)   flag = "|en_passant"
    if((best_move & MFLAGCA)   != 0)   flag = "|castle"
    if((best_move & MFLAGRZ)   != 0)   flag = "|rendezvous"
    if((best_move & MFLAGCAP)  != 0)   flag = "|capture"
    if((best_move & MFLAGPROM) != 0)   flag = "|promote"
    SendMessageToGui("bestmove", PrMove(best_move) + flag);
}


function SendGameState()
{
    SendMessageToGui("fen", BoardToFen());
    if (BoardToHistory().length > 1) SendMessageToGui("history", BoardToHistory());
}

function BoardToHistory()
{
    var history = "";
    var index;
    for (index = 0; index < brd_hisPly; ++index) {
        history += PrSq(FROMSQ(brd_history[index].move)) + "-" + PrSq(TOSQ(brd_history[index].move)) + "/" ;
        history += brd_history[index].move + "/";
        history += brd_history[index].posKey + "/";
        history += brd_history[index].fiftyMove + "/";
        history += brd_history[index].enPas + "/";
        history += brd_history[index].castlePerm + "/";
        history += brd_hisPly + "/";
        history += brd_ply;
        history += " ";
    }
    return history;
}

function SetHistory(this_history)
{
    page = this_history.split(" ");
    if (page.length < 2) return;

    for (index = 0; index < page.length - 1 ; ++index) {
        var h_array = page[index].split("/");
        brd_history[index].move = h_array[1];
        brd_history[index].posKey = h_array[2];
        brd_history[index].fiftyMove = h_array[3];
        brd_history[index].enPas = h_array[4];
        brd_history[index].castlePerm = h_array[5];
        brd_hisPly = h_array[6];
        brd_ply = h_array[7];
    }
}


function SetFen(this_fen)
{
    var current_fen = BoardToFen();
    if (ParseFen(this_fen))
    {
        GameController.PlayerSide = brd_side;
        CheckAndSet();
        EvalPosition();
        SendPosition();
    }
    else
    {
        SendMessageToGui("info", "invalid_fen");
        ParseFen(current_fen);
        SendPosition();
    }
}

function ReportEngineError()
{
    var error = variant;
    error += "|";
    error += BoardToFen();
    error += "|";
    if (BoardToHistory().length > 1) error += BoardToHistory();
    SendMessageToGui("report", error);
}