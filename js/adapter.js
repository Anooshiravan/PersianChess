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

// Board definitions
var cfg = {
    draggable: true,
    dropOffBoard: 'snapback', // this is the default
    moveSpeed: 300,
    snapbackSpeed: 250,
    snapSpeed: 100,
    position: 'start'
};
var board = new ChessBoard(document.getElementById("board"), cfg);
if (board_debug) board.theme("debug"); else board.theme("green");
var yourMove;
var output = "";
var tt = 3;
var engine_on = true;
var audio_on = false;

// Audio definitions
var welcome = 'audio/welcome.mp3';
var click = 'audio/click.mp3';
var move = 'audio/move.mp3';
var end = 'audio/end.mp3';
var check = 'audio/check.mp3';
var capture = 'audio/capture.mp3';
var checkmate= 'audio/checkmate.mp3';
var whitewins = 'audio/whitewins.mp3';
var blackwins = 'audio/blackwins.mp3';
var draw = 'audio/draw.mp3';
var gg = 'audio/gg.mp3';

var lla;
var lla_loaded = false;
var audio5js = new Audio5js;

function AudioOnOff()
{
    PlaySound(click);
    if (audio_on == true)
    {
        document.getElementById("audio-button").src = "img/footer/audio_off.png";
        audio_on = false;
        document.getElementById('movelist').value += "\r\n> Audio is OFF.";
    }
    else
    {
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
            audio5js.load(sound);
            audio5js.play();
        }
}

// Game funtions

function EngineOnOff()
{
    PlaySound(click);
    if (engine_on == true)
    {
        document.getElementById("engine-button").src = "img/footer/engine_off.png";
        engine_on = false;
        document.getElementById('movelist').value += "\r\n> Engine is OFF.";
    }
    else
    {
        document.getElementById("engine-button").src = "img/footer/engine.png";
        engine_on = true;
        document.getElementById('movelist').value += "\r\n> Engine is ON.";
    }
}

function NewGame() {
    timeout = setTimeout(function(){ PlaySound(welcome); }, 500);
    clearTimeout(EngineDemoTimer);
    ResetBoard();
    ParseFen(START_FEN);
    if (debug) PrintBoard();
    GameController.PlayerSide = brd_side;
    GameController.GameSaved = BOOL.FALSE;
    if (document.getElementById("movelist") != null)
    {
        document.getElementById("movelist").value = "";
    }
}

function ResetGame() {
    PlaySound(click);
    variant = document.getElementById("VariantChoice").value;
    variantname = ""
    switch(variant) {
        case "Persian":
            variantname = "Persian Princess"
            break;
        case "ASE":
            variantname = "Egyptian Eye"
            break;
        case "Citadel":
            variantname = "Celtic Citadel"
            break;
        case "Oriental":
            variantname = "Oriental Omega"
            break;
        default:
            break;
        }
    
    jConfirm("Do you want to start a new game in <b>\"" + variantname + "\"</b> variant?", "New Game", function(r) {
        if (r) {
            setVariantDefs(variant);
            clearTimeout(EngineDemoTimer);
            board.redraw();
            NewGame();
            board.position(START_FEN, true)
        }
    });
}

function AltFEN()
{
    alt_fen_number = document.getElementById("AltFen").value;
    if (alt_fen_number == "0")
    {
        board.removehighlights();
        ResetGame();
    }
    else
    {
        variant = document.getElementById("VariantChoice").value;
        jConfirm("Do you want to set the position to Training Position #" + alt_fen_number + " ?", "Training Position", function(r) {
        if (r) 
            {
                var tp_fen_name = "TP_FEN_" + alt_fen_number + "_" + variant;
                var TP_FEN = window[tp_fen_name];
                ResetBoard();
                board.removehighlights();
                ParseFen(TP_FEN);
                board.position(TP_FEN);
            }
        });
    }
}

function MoveGUIPiece() {
    var fen = BoardToFen().replace(/ .+$/, '');
    board.position(fen);
    board.highlight(PrSq(FROMSQ(srch_best)), PrSq(TOSQ(srch_best)));
    PlaySound(move);
    updateMoveList();
}

function CheckAndSet() {
    if (SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1) == BOOL.TRUE) {
        board.highlight_check(PrSq(brd_pList[PCEINDEX(Kings[brd_side], 0)]));
        PlaySound(check);
        // addNoteToMoveList("[Check!]");
    }
     
    if (CheckResult() != BOOL.TRUE) {
        GameController.GameOver = BOOL.FALSE;
    } else {
        GameController.GameOver = BOOL.TRUE;
        GameController.GameSaved = BOOL.TRUE; // save the game here
    }
}

function CheckResult() {

    if (brd_fiftyMove > 100) {
        addNoteToMoveList("[GAME DRAWN: Fifty move rule]");
        board.wait(false);
        AlertEndGame();
        return BOOL.TRUE;
    }

    if (ThreeFoldRep() >= 2) {
        addNoteToMoveList("[GAME DRAWN: 3-fold repetition]");
        board.wait(false);
        AlertEndGame();
        return BOOL.TRUE;
    }

    if (DrawMaterial() == BOOL.TRUE) {
        addNoteToMoveList("[GAME DRAWN: Insufficient material]");
        board.wait(false);
        AlertEndGame();
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
    console.log('No Move Found, incheck:' + InCheck);

    if (InCheck == BOOL.TRUE) {
        if (brd_side == COLOURS.WHITE) {
            addNoteToMoveList("[BLACK WINS: Checkmate!]");
            board.highlight_mate(PrSq(brd_pList[PCEINDEX(Kings[brd_side], 0)]));
            board.wait(false);
            AlertEndGame();
            return BOOL.TRUE;
        } else {
            addNoteToMoveList("[WHITE WINS: Checkmate!]");
            board.highlight_mate(PrSq(brd_pList[PCEINDEX(Kings[brd_side], 0)]));
            board.wait(false);
            AlertEndGame();
            return BOOL.TRUE;
        }
    } else {
        addNoteToMoveList("[GAME DRAWN: Stalemate]");
        board.wait(false);
        AlertEndGame();
        return BOOL.TRUE;
    }
    updateMoveList();
    return BOOL.FALSE;
}

function MoveNow() {
    PlaySound(click);
    GameController.PlayerSide = brd_side ^ 1;
    board.wait(true);
    setTimeout(function () {
            StartSearch();
    }, 200);
}

var EngineDemoTimer;

function StartEngineDemo() {
    StartSearch();
    pgn = '';
    EngineDemoTimer = setTimeout(arguments.callee, 1000);
    updateMoveList();
    if (GameController.GameOver == BOOL.TRUE) clearTimeout(EngineDemoTimer);
}

function StopEngineDemo() {
    clearTimeout(EngineDemoTimer); 
}

var ChangeSideTimer;

function Flip() {
    PlaySound(click);
    GameController.BoardFlipped ^= 1;
    board.flip();
    var fen = BoardToFen().replace(/ .+$/, '');
    board.position(fen);
    if (engine_on) {
        board.wait(true);
        setTimeout(function () {
            MoveNow();
        }, 200);
    }
    else
    {
        board.wait(false);  
    }
}

function TakeBack() {
    PlaySound(click);
    console.log('TakeBack request... brd_hisPly:' + brd_hisPly);
    if (brd_hisPly > 0) {
        TakeMove();
        brd_ply = 0;
        var fen = BoardToFen().replace(/ .+$/, '');
        board.position(fen);
        updateMoveList();
        board.removehighlights();
        board.wait(false);
    }
}

function SetFen() {
    PlaySound(click);
    var txt;
    jPrompt("Please enter position FEN:", BoardToFen(), "Insert new FEN", function(r) {
    if( r ) 
        {
            var fen = r;
            console.log(fen);
            ParseFen(fen);
            if (debug) PrintBoard();
            var boardFen = BoardToFen().replace(/ .+$/, '');
            board.position(boardFen);
            GameController.PlayerSide = brd_side;
            CheckAndSet();
            EvalPosition();
        }
    });
}


var theme = 'green';

function ChangeTheme() {
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


function PreSearch() {

    if (GameController.GameOver != BOOL.TRUE) {
        srch_thinking = BOOL.TRUE;
        $('#ThinkingImageDiv').append('<image src="images/think3.png" id="ThinkingPng"/>')
        setTimeout(function () {
            StartSearch();
        }, 200);
    }
}

function ManualThinkTime()
{
    if ($('#ThinkTimeChoice').val() == "manual")
    {
        jPrompt("Please enter the number of seconds for engine to think:", "3", "Engine think time", function(r) {
            if(r) 
            {
                if (!isNaN(r) && parseInt(r) > 0)
                {
                    tt = r;
                }
                else
                {
                    jAlert("Please enter a numerical value bigger than 0.", "Incorrect value")
                }
            }        
        });
    }
}

function StartSearch() {
    srch_depth = MAXDEPTH;
    var t = $.now();
    if ($('#ThinkTimeChoice').val() != "manual") 
        {
            if ($('#ThinkTimeChoice').val().substring(0, 1) == "d") {
                srch_depth = parseInt($('#ThinkTimeChoice').val().substring(2, 1));
                srch_time = 300000;
            }
            else
            {
                tt = $('#ThinkTimeChoice').val();
                srch_time = parseInt(tt) * 1000;
            }
        }    
    SearchPosition();
    MakeMove(srch_best);
    if (debug) PrintBoard();
    MoveGUIPiece();
    board.wait(false);
    CheckAndSet();
}

function SendPGN() {
    PlaySound(click);
    var msgsendpgn = "Do you want to send this game as PGN format by email?";
    jConfirm(msgsendpgn, "Send PGN", function(r) {
        if (r) 
            {
                var emailbody = "";
                if (document.getElementById('movelist').value != '')
                {
                    emailbody = document.getElementById('movelist').value;
                    emailbody = emailbody.replace(/(?:\r\n|\r|\n)/g, '%0D%0A');
                    window.open("mailto:?subject=Persian Chess game&body=" + emailbody);
            }
        }
    });
}

function addNoteToMoveList(note)
{
    brd_history_notes[brd_hisPly] = note;
}

function updateMoveList()
{
    var pgn = "";
    var index;
    var nl = "";
    for (index = 0; index < brd_hisPly; ++index) {
        if (isEven(index)) pgn += ((index / 2) + 1).toString() + ". ";
        pgn += PrSq(FROMSQ(brd_history[index].move)) + "-" + PrSq(TOSQ(brd_history[index].move));
        if (brd_history_notes[index] != "" && brd_history_notes[index] != null)
        {
            pgn += " " + brd_history_notes[index];
        }
        if (isEven(index)) pgn += "  ";
        if (!isEven(index)) pgn += "\n";
    }
    
    if (!isEven(index)) nl = "\r\n";

    document.getElementById('movelist').value = pgn + nl + output;
    $("#movelist").trigger("change");
    $('#movelist').scrollTop($('#movelist')[0].scrollHeight);
}

function AlertEndGame() {
    var msg;
    if (brd_history_notes.indexOf('[BLACK WINS: Checkmate!]') > -1) {
        msg = "Checkmate! Black wins.";
        GGSound("blackwins");
    }
    else if (brd_history_notes.indexOf('[WHITE WINS: Checkmate!]') > -1) {
        msg = "Checkmate! White wins.";
        GGSound("whitewins");
    }
    else if (brd_history_notes.indexOf('[GAME DRAWN: Fifty move rule]') > -1) {
        msg = "Draw: Fifty move rule";
        GGSound("draw");
    } 
    else if (brd_history_notes.indexOf('[GAME DRAWN: 3-fold repetition]') > -1) {
        msg = "Draw: 3-fold repetition";
        GGSound("draw");
    } 
    else if (brd_history_notes.indexOf('[GAME DRAWN: Insufficient material]') > -1) {
        msg = "Draw: Insufficient material";
        GGSound("draw");
    } 
    else if (brd_history_notes.indexOf('[GAME DRAWN: Stalemate]') > -1) {
        msg = "Draw: Stalemate";
        GGSound("draw");
    } 

    document.getElementById('movelist').value += "\r\n-----------------------\r\n" + msg + "\r\n-----------------------";
    $("#movelist").trigger("change");
    $('#movelist').scrollTop($('#movelist')[0].scrollHeight);
    brd_history_notes = [];

    timeout = setTimeout(function(){ 
        PlaySound(gg); 
        jAlert(msg, 'Game Over');
    }, 3000);
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
}

function Help() {
    PlaySound(click);
    var go2web = "<b>Persian Chess Engine | Version 1.3.4</b>\r\n© 2009 - 2015 PersianChess.com\r\n\r\nPersian Chess is invented and programmed by:\r\n<b>Anooshiravan Ahmadi</b>\r\n\r\nClick Ok to go to the website for the detailed game information, or Cancel to return to the game.";
     jConfirm(go2web, "About", function(r) {
            if (r) window.open("http://www.persianchess.com/game-rules", "_system", "location=no");
    });
}
