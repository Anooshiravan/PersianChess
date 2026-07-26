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
//  PV Table
// ══════════════════════════

import { NOMOVE, PVENTRIES } from './defs';
import { S } from './state';
import { MakeMove, TakeMove } from './movehandler';
import { MoveExists } from './movegen';

export function GetPvLine(depth: number): number {
    let move: number = ProbePvTable();
    let count: number = 0;

    while (move !== NOMOVE && count < depth) {
        if (MoveExists(move)) {
            MakeMove(move);
            S.brd_PvArray[count++] = move;
        } else {
            break;
        }
        move = ProbePvTable();
    }

    while (S.brd_ply > 0) {
        TakeMove();
    }
    return count;
}

export function StorePvMove(move: number): void {
    const index = S.brd_posKey % PVENTRIES;

    S.brd_PvTable[index].move = move;
    S.brd_PvTable[index].posKey = S.brd_posKey;
}

export function ProbePvTable(): number {
    const index = S.brd_posKey % PVENTRIES;

    if (S.brd_PvTable[index].posKey === S.brd_posKey) {
        return S.brd_PvTable[index].move;
    }

    return NOMOVE;
}
