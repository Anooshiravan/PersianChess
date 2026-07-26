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
 Licensed under GNU General Public License 3.0
 ════════════════════════════════════════════════════════════════════
*/

// ══════════════════════════
//  Engine Init
// ══════════════════════════

import { BRD_SQ_NUM, MAXGAMEMOVES, PVENTRIES, NOMOVE, FILES, RANKS, SQUARES, FrameSQ, FR2SQ, RAND_32 } from './defs';
import { S } from './state';
import { SendMessageToGui } from './protocol';
import { ParseFen, PrintBoard } from './board';
import { InitMvvLva } from './search';
import { SendPosition } from './engine';

export function StartEngine(): void {
    init_engine();
    S.engine_on = true;
    SendMessageToGui('init', 'engine_started');
}

export function InitBoardVars(): void {
    S.brd_history.splice(0, S.brd_history.length);
    S.brd_PvTable.splice(0, S.brd_PvTable.length);

    for (let index = 0; index < MAXGAMEMOVES; index++) {
        S.brd_history.push({
            move: NOMOVE,
            castlePerm: 0,
            enPas: 0,
            fiftyMove: 0,
            posKey: 0,
        });
    }

    for (let index = 0; index < PVENTRIES; index++) {
        S.brd_PvTable.push({
            move: NOMOVE,
            posKey: 0,
        });
    }
}

export function EvalInit(): void {
    for (let index = 0; index < 10; ++index) {
        S.PawnRanksWhite[index] = 0;
        S.PawnRanksBlack[index] = 0;
    }
}

export function InitHashKeys(): void {
    for (let index = 0; index < 21 * 195; ++index) {
        S.PieceKeys[index] = RAND_32();
    }

    S.SideKey = RAND_32();

    for (let index = 0; index < 16; ++index) {
        S.CastleKeys[index] = RAND_32();
    }
}

export function InitSq195To121(): void {
    let sq121: number = 0;
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
        S.Sq195ToSq121[index] = 122;
    }

    for (let index = 0; index < 121; ++index) {
        S.Sq121ToSq195[index] = 195;
    }

    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_11; ++rank) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_K; ++file) {
            const sq = FR2SQ(file, rank);
            S.Sq121ToSq195[sq121] = sq;
            S.Sq195ToSq121[sq] = sq121;
            sq121++;
        }
    }
}

export function InitFilesRanksBrd(): void {
    for (let index = 0; index < BRD_SQ_NUM; ++index) {
        S.FilesBrd[index] = SQUARES.OFFBOARD;
        S.RanksBrd[index] = SQUARES.OFFBOARD;
    }

    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_11; ++rank) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_K; ++file) {
            const sq = FR2SQ(file, rank);
            S.FilesBrd[sq] = file;
            S.RanksBrd[sq] = rank;

            if (FrameSQ.indexOf(sq) > -1) {
                S.FilesBrd[sq] = SQUARES.OFFBOARD;
                S.RanksBrd[sq] = SQUARES.OFFBOARD;
            }
        }
    }
}

export function init_engine(): void {
    InitFilesRanksBrd();
    InitSq195To121();
    InitHashKeys();
    InitBoardVars();
    InitMvvLva();
    EvalInit();
    S.srch_thinking = false;
}

export function NewGame(): void {
    init_engine();
    ParseFen(S.START_FEN);
    if (S.debug_log) PrintBoard();
    S.GameController.PlayerSide = S.brd_side;
    S.GameController.GameSaved = false;
    SendMessageToGui('init', 'new_game_started');
    SendPosition();
}
