import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, hasMove, PIECES } from './helpers';

// Knight deltas from Defs.js:
// KnDir = [-11, -25, -27, -15, 11, 25, 27, 15]
//   +11 = (+file+2, -rank+1)? Let's decode by delta = f_delta + 13 * r_delta:
//     -11 = f_delta=+2, r_delta=-1   (right 2, down 1)
//     -25 = f_delta=+1, r_delta=-2
//     -27 = f_delta=-1, r_delta=-2
//     -15 = f_delta=-2, r_delta=-1
//     +11 = f_delta=-2, r_delta=+1
//     +25 = f_delta=-1, r_delta=+2
//     +27 = f_delta=+1, r_delta=+2
//     +15 = f_delta=+2, r_delta=+1

describe('knight — reach', () => {
    it('white knight on e5 (interior) reaches 8 squares', () => {
        setup('Persian', fenFromPieces({ e5: 'N', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5'));
        expect(list.map((m) => m.to).sort((a, b) => a - b)).toEqual(
            [sq('c4'), sq('c6'), sq('d3'), sq('d7'), sq('f3'), sq('f7'), sq('g4'), sq('g6')].sort((a, b) => a - b),
        );
        expect(list.every((m) => m.captured === PIECES.EMPTY)).toBe(true);
    });

    it('white knight captures opposing piece', () => {
        setup('Persian', fenFromPieces({ e5: 'N', f7: 'p', f2: 'K', f10: 'k' }, 'w'));
        const cap = movesFrom(sq('e5')).find((m) => m.to === sq('f7'));
        expect(cap).toBeDefined();
        expect(cap?.captured).toBe(PIECES.bP);
    });

    it('white knight cannot land on own piece', () => {
        setup('Persian', fenFromPieces({ e5: 'N', f7: 'P', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('f7'))).toBe(false);
    });

    it('knight in corner-ish square b2 has restricted moves (offboard filtered)', () => {
        // b2 has 3 valid knight targets: c4, d3 (and a4 is off-board file a; b2+11 would be a3 off-board;
        // b2-25 goes to b2-25 which is rank 0 file 1 → off-board too, only rank 1 squares b1..j1 are frame).
        setup('Persian', fenFromPieces({ b2: 'N', f5: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('b2'));
        // Enumerate expected: from (f=1, r=1):
        //   (+2,-1) → (3,0) rank 1 file d = d1 → in FrameSQ (28..36) → OFFBOARD → filtered
        //   (+1,-2) → (2,-1) → off-board (rank -1)
        //   (-1,-2) → (0,-1) → off-board
        //   (-2,-1) → (-1,0) → off-board
        //   (-2,+1) → (-1,2) → off-board
        //   (-1,+2) → (0,3) → a4 = frame → OFFBOARD → filtered
        //   (+1,+2) → (2,3) → c4 ✓
        //   (+2,+1) → (3,2) → d3 ✓
        expect(list.map((m) => m.to).sort((a, b) => a - b)).toEqual([sq('c4'), sq('d3')].sort((a, b) => a - b));
    });
});
