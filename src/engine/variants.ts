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
//  Variants
// ══════════════════════════

import { S } from './state';

export let START_FEN =
    'f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';

export function setVariantDefs(this_variant: string): void {
    S.variant = this_variant;
    S.variantId =
        this_variant === 'Persian'
            ? 0
            : this_variant === 'Pyramid'
              ? 1
              : this_variant === 'Citadel'
                ? 2
                : this_variant === 'Oriental'
                  ? 3
                  : -1;
    switch (S.variant) {
        case 'Persian':
            START_FEN =
                'f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;
        case 'Pyramid':
            START_FEN =
                'f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;
        case 'Citadel':
            START_FEN =
                'f111111111f/1rnbqkbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;
        case 'Oriental':
            START_FEN =
                'w111111111w/1rnbqkcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;
        default:
            break;
    }
    S.START_FEN = START_FEN;
}

// ══════════════════════════
//  Training Positions
// ══════════════════════════

export function Get_TP_Fen(tp: string): string {
    let tp_fen = START_FEN;

    switch (tp) {
        case 'TP_FEN_1_Citadel':
            tp_fen =
                '11111111111/11111k1s111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_2_Citadel':
            tp_fen =
                'f111111111f/11111k1s111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_3_Citadel':
            tp_fen =
                'f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_4_Citadel':
            tp_fen =
                'f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_5_Citadel':
            tp_fen =
                '1111111111f/11111kbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_6_Citadel':
            tp_fen =
                'f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_7_Citadel':
            tp_fen =
                'f111111111f/1rnb1kbsnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKBSNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_1_Persian':
            tp_fen =
                '11111111111/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_2_Persian':
            tp_fen =
                'f111111111f/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_3_Persian':
            tp_fen =
                'f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_4_Persian':
            tp_fen =
                'f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_5_Persian':
            tp_fen =
                '1111111111f/11111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_6_Persian':
            tp_fen =
                'f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_7_Persian':
            tp_fen =
                'f111111111f/1rnb1ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_1_Pyramid':
            tp_fen =
                '11111111111/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_2_Pyramid':
            tp_fen =
                'f111111111f/11111ks1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_3_Pyramid':
            tp_fen =
                'f111111111f/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_4_Pyramid':
            tp_fen =
                'f111111111f/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_5_Pyramid':
            tp_fen =
                '1111111111f/11111ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_6_Pyramid':
            tp_fen =
                'f111111111f/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_7_Pyramid':
            tp_fen =
                'f111111111f/1rnb1ksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F w KQkq - 0 1';
            break;

        case 'TP_FEN_1_Oriental':
            tp_fen =
                '11111111111/11111kc1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;

        case 'TP_FEN_2_Oriental':
            tp_fen =
                'w111111111w/11111kc1111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;

        case 'TP_FEN_3_Oriental':
            tp_fen =
                'w111111111w/1r111k111r1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;

        case 'TP_FEN_4_Oriental':
            tp_fen =
                'w111111111w/1r1b1k11nr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;

        case 'TP_FEN_5_Oriental':
            tp_fen =
                '1111111111w/11111kcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;

        case 'TP_FEN_6_Oriental':
            tp_fen =
                'w111111111w/1rnbqk11111/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;

        case 'TP_FEN_7_Oriental':
            tp_fen =
                'w111111111w/1rnb1kcbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKCBNR1/W111111111W w KQkq - 0 1';
            break;

        default:
            break;
    }
    return tp_fen;
}
