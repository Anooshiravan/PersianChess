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
 http://www.PersianChess.com/Copyright
 Redistribution of this game design, rules and the engine 
 requires written permission from the author.
----------------------------------------------------------------
*/

var cfg = {
    draggable: true,
    dropOffBoard: 'snapback', // this is the default
    moveSpeed: 300,
    snapbackSpeed: 250,
    snapSpeed: 100,
    position: 'start'
};
var board = new ChessBoard(document.getElementById("board"), cfg);
board.theme("green");
var yourMove;
var output = "";


function NewGame() {
    clearTimeout(EngineDemoTimer);
    if (variant == "Citadel")
        {
            START_FEN = (START_FEN_CITADEL);
            ParseFen(START_FEN_CITADEL);
        }
    else
    {
        START_FEN = (START_FEN_NON_CITADEL);
        ParseFen(START_FEN_NON_CITADEL);
    }
    
    PrintBoard();
    GameController.PlayerSide = brd_side;
    GameController.GameSaved = BOOL.FALSE;
    if (document.getElementById("movelist") != null)
    {
        document.getElementById("movelist").value = "";
    }
}

function ResetGUI() {
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
        default:
            break;
        }
    var reset = confirm("Do you want to start a new game in \"" + variantname + "\" variant?");
    if (reset == true) {
        board.redraw();
        switch(variant) {
        case "Persian":
            board.theme("green");
            break;
        case "ASE":
            board.theme ("brown");
            break;
        case "Citadel":
            
            board.theme ("blue");
            break;
        default:
            break;
        }
        clearTimeout(EngineDemoTimer);
        NewGame();
        board.position('start', true);
        if (variant == "Citadel")
        {
            board.position(START_FEN_CITADEL);
        }
    }
}

function AltFEN()
{
    alt_fen_number = document.getElementById("AltFen").value;
    var alt_fen_reset = confirm("Do you want to set the position to Training Position #" + alt_fen_number + " ? These are so-called \"handicap\" positions with different level of advantage for White.");
    var tp_fen_name = "TP_FEN_" + alt_fen_number;
    var TP_FEN = window[tp_fen_name];
    if (alt_fen_reset == true) {
        if (alt_fen_number == "0")
        {
            ResetGUI();
        }
        else
        {
            ParseFen(TP_FEN);
            board.position(TP_FEN);
        }
    }
}


function MoveGUIPiece() {
    var fen = BoardToFen().replace(/ .+$/, '');
    board.position(fen);
    board.highlight(PrSq(FROMSQ(srch_best)), PrSq(TOSQ(srch_best)));
    updateMoveList();
}


function CheckAndSet() {
    if (SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1) == BOOL.TRUE) {
        board.highlight_check(PrSq(brd_pList[PCEINDEX(Kings[brd_side], 0)]));
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
    GameController.PlayerSide = brd_side ^ 1;
    StartSearch();
}

var EngineDemoTimer;

var engineplay = 0;
function EngineDemo() {
    StartSearch();
    pgn = '';
    if (engineplay < 9) 
       { EngineDemoTimer = setTimeout(arguments.callee, 1000);
          engineplay++;
       }
    updateMoveList();
    if (GameController.GameOver == BOOL.TRUE) clearTimeout(EngineDemoTimer);
}

function StartDemo() {
    
    var demo = confirm("Starting Engine Demo.\nPersian Chess Engine will play 10 moves or until you click on the stop button.");
    if (demo == true) {
        engineplay = 0;
        EngineDemo();
    }
}

function StopDemo() {
    alert("Chess 911 Engine Demo has stopped.");
    clearTimeout(EngineDemoTimer);
}

var ChangeSideTimer;

function Flip() {
    GameController.BoardFlipped ^= 1;
    board.flip();
    var fen = BoardToFen().replace(/ .+$/, '');
    board.position(fen);
    console.log("Flipped:" + GameController.BoardFlipped);
    setTimeout(function () {
        ChangeSide();
    }, 300);
}

function ChangeSide() {
    var colortoplay;
    if (GameController.BoardFlipped == 1) 
    {
        colortoplay = 'Black';
    }
    else
    {
        colortoplay = 'White';
    }
    var changeside = confirm("Board is flipped. Do you want to play " + colortoplay + "?");
    if (changeside == true) {
        MoveNow();
    }
}

function TakeBack() {
    console.log('TakeBack request... brd_hisPly:' + brd_hisPly);
    if (brd_hisPly > 0) {
        TakeMove();
        brd_ply = 0;
        var fen = BoardToFen().replace(/ .+$/, '');
        board.position(fen);
        updateMoveList();
        board.removehighlights();
    }

}

function SetFen() {
    var txt;
    var fen = prompt("Please enter FEN for the new position.", BoardToFen());
    if (fen != null) {
        console.log(fen);
        ParseFen(fen);
        PrintBoard();
        var boardFen = BoardToFen().replace(/ .+$/, '');
        board.position(boardFen);
        GameController.PlayerSide = brd_side;
        CheckAndSet();
        EvalPosition();
    }
}


var theme = 'green';

function ChangeTheme() {
    if (theme == 'brown') {
        theme = 'blue';
        document.getElementById("theme-button").src = "img/footer/green.png";
    } else if (theme == 'blue'){
        theme = 'green';
        document.getElementById("theme-button").src = "img/footer/brown.png";
    } else if (theme == 'green'){
        theme = 'brown';
        document.getElementById("theme-button").src = "img/footer/blue.png";
    }
    board.theme(theme);
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

function StartSearch() {
    srch_depth = MAXDEPTH;
    var t = $.now();
    var tt = $('#ThinkTimeChoice').val();
    // console.log("time:" + t + " TimeChoice:" + tt);
    srch_time = parseInt(tt) * 1000;
    SearchPosition();
    MakeMove(srch_best);
    // PrintBoard();
    MoveGUIPiece();
    board.wait(false);
    CheckAndSet();
}

function SendPGN() {
    var reset = confirm("Do you want to send this game as PGN format by email?");
    if (reset == true) {
    var emailbody = "";
    if (document.getElementById('movelist').value != '')
        {
            emailbody = document.getElementById('movelist').value;
            emailbody = emailbody.replace(/(?:\r\n|\r|\n)/g, '%0D%0A');
            window.open("mailto:?subject=Persian Chess game&body=" + emailbody);
        }
    }
}


function addNoteToMoveList(note)
{
    brd_history_notes[brd_hisPly] = note;
}

function updateMoveList()
{
    var pgn = "";
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
    document.getElementById('movelist').value = pgn + "\r\n" + output;
    $("#movelist").trigger("change");
    $('#movelist').scrollTop($('#movelist')[0].scrollHeight);
}

function AlertEndGame() {
    var msg;
    if (brd_history_notes.indexOf('[BLACK WINS: Checkmate!]') > -1) {
        msg = "Checkmate! Black wins.";
    }
    else if (brd_history_notes.indexOf('[WHITE WINS: Checkmate!]') > -1) {
        msg = "Checkmate! White wins.";
    }
    else if (brd_history_notes.indexOf('[GAME DRAWN: Fifty move rule]') > -1) {
        msg = "Draw: Fifty move rule";
    } 
    else if (brd_history_notes.indexOf('[GAME DRAWN: 3-fold repetition]') > -1) {
        msg = "Draw: 3-fold repetition";
    } 
    else if (brd_history_notes.indexOf('[GAME DRAWN: Insufficient material]') > -1) {
        msg = "Draw: Insufficient material";
    } 
    else if (brd_history_notes.indexOf('[GAME DRAWN: Stalemate]') > -1) {
        msg = "Draw: Stalemate";
    } 
    timeout = setTimeout(function(){ alert(msg); }, 1000);
}


function Help() {
    alert("Persian Chess is invented and programmed by:\r\nAnooshiravan Ahmadi\r\nPlease refer to www.PersianChess.com for the detailed game rules.");
}