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

import {
    COLOURS,
    SQUARES,
    MAXDEPTH,
    Kings,
    PCEINDEX,
    MFLAGEP,
    MFLAGCA,
    MFLAGRZ,
    MFLAGCAP,
    MFLAGPROM,
    FROMSQ,
    TOSQ,
    NOMOVE,
} from './defs';
import { S, debuglog } from './state';
import { BoardToFen, PrintBoard, SqAttacked } from './board';
import { MakeMove, TakeMove } from './movehandler';
import { GenerateMoves } from './movegen';
import { EvalPosition } from './eval';
import { SearchPosition } from './search';
import { PrSq, PrMove, ParseMove } from './input';
import { setVariantDefs, Get_TP_Fen } from './variants';
import { ParseFen } from './board';
import { NewGame, StartEngine } from './init';
import { ThreeFoldRep, DrawMaterial, CitadelDraw, CapturedPieces } from './protocol';

// ══════════════════════════
//  Logging
// ══════════════════════════

declare const postMessage: ((msg: string) => void) | undefined;

function postToGui(msg: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pm = typeof postMessage !== 'undefined' ? postMessage : (globalThis as any).postMessage;
    if (typeof pm === 'function') pm(msg);
}

// ══════════════════════════
//  Messaging
// ══════════════════════════

export function SendMessageToGui(title: string, message: string): void {
    postToGui(`${title}::${message}`);
}

export function ProcessGuiMessage(message: any): void {
    if (typeof message !== 'string') {
        debuglog(`Ignoring non-string message: ${typeof message}`);
        return;
    }
    debuglog(`Message received: ${message}`);
    const msg_title = message.substr(0, message.indexOf('::'));
    const msg_body = message.substr(message.indexOf('::') + 2);

    switch (msg_title) {
        case 'init':
            ProcessGuiMessage_Init(msg_body);
            break;
        case 'parse':
            ProcessGuiMessage_Parse(msg_body);
            break;
        case 'move':
            ProcessGuiMessage_Move(msg_body);
            break;
        case 'set':
            ProcessGuiMessage_Set(msg_body);
            break;
        case 'do':
            ProcessGuiMessage_Do(msg_body);
            break;
        default:
            debuglog('Message not recognised.');
            break;
    }
}

export function ProcessGuiMessage_Init(message: string): void {
    switch (message) {
        case 'hello':
            SendMessageToGui('init', 'hi');
            break;
        case 'start_engine':
            StartEngine();
            break;
        case 'new_game':
            NewGame();
            SendPosition();
            break;
        case 'turn_on':
            S.engine_on = true;
            SendMessageToGui('init', 'engine_is_on');
            break;
        case 'turn_off':
            S.engine_on = false;
            SendMessageToGui('init', 'engine_is_off');
            break;
        case 'go':
            if (S.engine_on) MoveNow();
            break;
        default:
            debuglog('Init::message not recognised.');
            break;
    }
}

export function ProcessGuiMessage_Parse(move: string): void {
    debuglog(`Begin parsing move: ${move} in variant ${S.variant}`);
    const src = CBSQ2SQlocal(move.split('-')[0]);
    const dst = CBSQ2SQlocal(move.split('-')[1]);
    const parsed = ParseMove(src, dst);

    if (parsed !== NOMOVE) {
        let msg = `${move}|${parsed}`;
        let flag = '|quite';
        if ((parsed & MFLAGEP) !== 0) flag = '|en_passant';
        if ((parsed & MFLAGCA) !== 0) flag = '|castle';
        if ((parsed & MFLAGRZ) !== 0) flag = '|rendezvous';
        if ((parsed & MFLAGCAP) !== 0) flag = '|capture';
        if ((parsed & MFLAGPROM) !== 0) flag = '|promote';
        msg += flag;
        SendMessageToGui('parsed', msg);
    } else {
        SendMessageToGui('parsed', 'NOMOVE');
        SendPosition();
    }
}

import { CBSQ2SQ } from './defs';
function CBSQ2SQlocal(s: string): number {
    return CBSQ2SQ(s);
}

export function ProcessGuiMessage_Move(parsed_move_str: string): void {
    const parsed_move = Number(parsed_move_str);
    debuglog(`Making move: ${parsed_move}`);
    MakeMove(parsed_move);
    if (S.debug_log) PrintBoard();
    SendPosition();
    CheckAndSet();
    if (S.engine_on && !S.GameController.GameOver) {
        setTimeout(() => {
            MoveNow();
        }, 100);
    }
}

export function ProcessGuiMessage_Set(message: string): void {
    const set = message.split('|')[0];
    const value = message.split('|')[1];

    switch (set) {
        case 'thinktime':
            debuglog(`Set srch_time: ${value}`);
            S.srch_time = Number(value);
            break;
        case 'depth':
            debuglog(`Set srch_depth: ${value}`);
            S.srch_depth = Number(value);
            break;
        case 'variant':
            debuglog(`Set variant: ${value}`);
            setVariantDefs(value);
            break;
        case 'fen':
            debuglog(`Set FEN: ${value}`);
            SetFen(value);
            break;
        case 'history':
            debuglog(`Set History: ${value}`);
            SetHistory(value);
            SendPosition();
            break;
        case 'tp':
            debuglog(`Set TP: ${value}`);
            SetFen(Get_TP_Fen(value));
            break;
        default:
            debuglog('Set::message not recognised.');
            break;
    }
}

export function ProcessGuiMessage_Do(command: string): void {
    switch (command) {
        case 'flip':
            S.GameController.BoardFlipped = !S.GameController.BoardFlipped;
            SendPosition();
            break;
        case 'takeback':
            if (S.brd_hisPly > 0) {
                TakeMove();
                S.brd_ply = 0;
                if (S.debug_log) PrintBoard();
                S.GameController.GameOver = false;
                SendGameState();
                SendPosition();
            }
            break;
        case 'forward': {
            const move = S.brd_history[S.brd_hisPly].move;
            if (move !== 0 && move !== undefined && ParseMove(FROMSQ(move), TOSQ(move))) {
                MakeMove(move);
                SendPosition();
            } else {
                if (S.engine_on) MoveNow();
            }
            break;
        }
        case 'start_demo':
            StartEngineDemo();
            break;
        case 'stop_demo':
            StopEngineDemo();
            break;
        default:
            debuglog('Do::message not recognised.');
            break;
    }
}

// ══════════════════════════
//  Engine functions
// ══════════════════════════

export function MoveNow(): void {
    debuglog('Starting to think.');
    SendMessageToGui('info', 'thinking');
    S.GameController.PlayerSide = S.brd_side ^ 1;
    setTimeout(() => {
        StartSearch();
    }, 100);
}

export function StartSearch(): void {
    if (S.srch_time === undefined || S.srch_time <= 0) S.srch_time = 3000;
    if (S.srch_depth === 0 || S.srch_depth === undefined) S.srch_depth = MAXDEPTH;
    debuglog(`Starting search: srch_depth: ${S.srch_depth} srch_time: ${S.srch_time}`);
    SearchPosition();
    MakeMove(S.srch_best);
    if (S.debug_log) PrintBoard();
    SendPosition();
    CheckAndSet();
    if (CapturedPieces() !== '') {
        SendMessageToGui('console', CapturedPieces());
    }
}

export function CheckAndSet(): void {
    let KingSq: string | number = SQUARES.OFFBOARD;
    SendMessageToGui(
        'debug',
        `CheckAndSet: side=${S.brd_side} king=${PrSq(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)])}`,
    );
    if (SqAttacked(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)], S.brd_side ^ 1)) {
        KingSq = PrSq(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)]);
        SendMessageToGui('info', `check|${KingSq}`);
    }
    const isOver = GameOver();
    SendMessageToGui('debug', `CheckAndSet: GameOver returned ${isOver}`);
    if (!isOver) {
        S.GameController.GameOver = false;
    } else {
        S.GameController.GameOver = true;
        S.GameController.GameSaved = true;
    }
    ClearHistory();
    SendGameState();
    if (CapturedPieces() !== '' && !S.engine_on) {
        SendMessageToGui('console', CapturedPieces());
    }
}

export function GameOver(): boolean {
    let KingSq: string | number = SQUARES.OFFBOARD;

    if (S.brd_fiftyMove > 100) {
        SendMessageToGui('gameover', `draw|fifty_move_rule|${SQUARES.NO_SQ}`);
        return true;
    }
    if (ThreeFoldRep() >= 2) {
        SendMessageToGui('gameover', `draw|3_ford_repetition|${SQUARES.NO_SQ}`);
        return true;
    }
    if (DrawMaterial()) {
        SendMessageToGui('gameover', `draw|insufficient_material|${SQUARES.NO_SQ}`);
        return true;
    }
    if (CitadelDraw()) {
        SendMessageToGui('gameover', `draw|citadel_rule|${SQUARES.NO_SQ}`);
        return true;
    }

    GenerateMoves();

    let found: number = 0;
    for (let MoveNum = S.brd_moveListStart[S.brd_ply]; MoveNum < S.brd_moveListStart[S.brd_ply + 1]; ++MoveNum) {
        if (!MakeMove(S.brd_moveList[MoveNum])) continue;
        found++;
        TakeMove();
        break;
    }

    if (found !== 0) return false;
    const InCheck = SqAttacked(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)], S.brd_side ^ 1);
    debuglog(`No Move Found, incheck:${InCheck}`);

    if (InCheck) {
        KingSq = PrSq(S.brd_pList[PCEINDEX(Kings[S.brd_side], 0)]);
        if (S.brd_side === COLOURS.WHITE) {
            SendMessageToGui('gameover', `blackwins|checkmate|${KingSq}`);
        } else {
            SendMessageToGui('gameover', `whitewins|checkmate|${KingSq}`);
        }
        return true;
    }
    SendMessageToGui('gameover', `draw|stalemate|${KingSq}`);
    return true;
}

export function ClearHistory(): void {
    for (let index = S.brd_hisPly; index < 2048 /* MAXGAMEMOVES */; index++) {
        S.brd_history[index].move = NOMOVE;
        S.brd_history[index].fiftyMove = 0;
        S.brd_history[index].enPas = 0;
        S.brd_history[index].castlePerm = 0;
    }
}

export function SendPosition(): void {
    const engine_position = BoardToFen().replace(/ .+$/, '');
    SendMessageToGui('pos', `${engine_position}|${S.brd_side}`);
}

export function SendBestMove(best_move: number): void {
    let flag = '|quite';
    if ((best_move & MFLAGEP) !== 0) flag = '|en_passant';
    if ((best_move & MFLAGCA) !== 0) flag = '|castle';
    if ((best_move & MFLAGRZ) !== 0) flag = '|rendezvous';
    if ((best_move & MFLAGCAP) !== 0) flag = '|capture';
    if ((best_move & MFLAGPROM) !== 0) flag = '|promote';
    SendMessageToGui('bestmove', PrMove(best_move) + flag);
}

export function SendGameState(): void {
    SendMessageToGui('fen', BoardToFen());
    if (BoardToHistory().length > 1) SendMessageToGui('history', BoardToHistory());
}

export function BoardToHistory(): string {
    let history = '';
    for (let index = 0; index < S.brd_hisPly; ++index) {
        history += `${PrSq(FROMSQ(S.brd_history[index].move))}-${PrSq(TOSQ(S.brd_history[index].move))}/`;
        history += `${S.brd_history[index].move}/`;
        history += `${S.brd_history[index].posKey}/`;
        history += `${S.brd_history[index].fiftyMove}/`;
        history += `${S.brd_history[index].enPas}/`;
        history += `${S.brd_history[index].castlePerm}/`;
        history += S.brd_hisPly;
        history += ' ';
    }
    return history;
}

export function SetHistory(this_history: string): void {
    const page = this_history.split(' ');
    if (page.length < 2) return;

    for (let index = 0; index < page.length - 1; ++index) {
        const h_array = page[index].split('/');
        S.brd_history[index].move = Number(h_array[1]);
        S.brd_history[index].posKey = Number(h_array[2]);
        S.brd_history[index].fiftyMove = Number(h_array[3]);
        S.brd_history[index].enPas = Number(h_array[4]);
        S.brd_history[index].castlePerm = Number(h_array[5]);
        S.brd_hisPly = Number(h_array[6]);
    }
}

export function SetFen(this_fen: string): void {
    const current_fen = BoardToFen();
    if (ParseFen(this_fen)) {
        S.GameController.PlayerSide = S.brd_side;
        CheckAndSet();
        EvalPosition();
        SendPosition();
    } else {
        SendMessageToGui('info', 'invalid_fen');
        ParseFen(current_fen);
        SendPosition();
    }
}

export function ReportEngineError(): void {
    let error = S.variant;
    error += '|';
    error += BoardToFen();
    error += '|';
    if (BoardToHistory().length > 1) error += BoardToHistory();
    SendMessageToGui('report', error);
}

// ══════════════════════════
//  Engine utilities
// ══════════════════════════

let EngineDemoTimer: ReturnType<typeof setTimeout>;

export function StartEngineDemo(): void {
    StartSearch();
    EngineDemoTimer = setTimeout(StartEngineDemo, 1000);
    if (S.GameController.GameOver) clearTimeout(EngineDemoTimer);
}

export function StopEngineDemo(): void {
    clearTimeout(EngineDemoTimer);
}
