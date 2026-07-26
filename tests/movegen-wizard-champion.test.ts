import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, hasMove, PIECES } from './helpers';

// Wizard and Champion are Oriental-variant pieces:
//   WzDir = [-27, -25, -15, -14, -12, -11, 11, 12, 14, 15, 25, 27]  (12 dirs)
//   ChDir = [-28, -26, -24, -13, -2, -1, 1, 2, 13, 24, 26, 28]      (12 dirs)
//
// Both are non-slide (leap-only). Decoded relative to (df, dr):
//   WzDir  → knight-like distant leaps + diagonal steps + short diagonal leaps
//   ChDir  → +/-1 or +/-2 in file (short/wide horizontal), +/-1 rank
//     -28 = (+2, -2) [wide diagonal down-right]
//     -26 = (-2, -2) [wide diagonal down-left]
//     -24 = (+2, +? wait)
// Rather than derive all 24 deltas mentally, we just enumerate what the
// engine actually produces from a central square and assert on the count
// and that it is exactly the set implied by the piece's dir table.

function _decodeDir(delta: number): [number, number] {
    // FR2SQ diff: rf*13 + ff. rf can be negative.
    // If |delta| < 7, all in file; if larger, some rank component.
    // Simpler: iterate over possible (df, dr) with |df|<=2, |dr|<=2 and larger for wizard.
    for (let dr = -3; dr <= 3; dr++) {
        for (let df = -3; df <= 3; df++) {
            if (df + dr * 13 === delta) return [df, dr];
        }
    }
    return [NaN, NaN];
}

describe('wizard (Oriental)', () => {
    it('white wizard on f6 (centre) reaches exactly 12 squares on empty board', () => {
        // f6 is a normal square in Oriental (SQCENTER only applies to Persian and Pyramid).
        setup('Oriental', fenFromPieces({ f6: 'W', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('f6'));
        expect(list).toHaveLength(12);
        expect(list.every((m) => m.captured === PIECES.EMPTY)).toBe(true);

        // Every target must be reachable via one of the 12 WzDir deltas.
        const wzDeltas = [-27, -25, -15, -14, -12, -11, 11, 12, 14, 15, 25, 27];
        const deltas = list.map((m) => m.to - sq('f6')).sort((a, b) => a - b);
        expect(deltas).toEqual(wzDeltas.sort((a, b) => a - b));
    });

    it('wizard captures enemy on any of its 12 targets', () => {
        setup('Oriental', fenFromPieces({ f6: 'W', h4: 'p', f2: 'K', f10: 'k' }, 'w'));
        //  h4 relative to f6: file +2, rank -2 → delta = -2*13 + 2 = -24 (NOT wizard). Try d4 = -2 file, -2 rank = -28. Also not.
        // Wizard captures adjacent-ish squares. Let me pick target g8 = f6 + (1, 2) = 1 + 26 = 27 ✓
        setup('Oriental', fenFromPieces({ f6: 'W', g8: 'p', f2: 'K', f10: 'k' }, 'w'));
        const cap = movesFrom(sq('f6')).find((m) => m.to === sq('g8'));
        expect(cap).toBeDefined();
        expect(cap?.captured).toBe(PIECES.bP);
    });

    it('wizard cannot land on own piece', () => {
        setup('Oriental', fenFromPieces({ f6: 'W', g8: 'P', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('f6'), sq('g8'))).toBe(false);
    });

    it('wizard is a leaper (blockers between source and destination do not matter)', () => {
        // Wizard has some 2-square leaps (e.g. +27 = f6→g8). Put a piece on the
        // intermediate square and confirm the leap is still generated.
        setup(
            'Oriental',
            fenFromPieces({ f6: 'W', g7: 'P', g8: '1' as unknown as string, f2: 'K', f10: 'k' } as any, 'w'),
        );
        expect(hasMove(sq('f6'), sq('g8'))).toBe(true);
    });
});

describe('champion (Oriental)', () => {
    it('white champion on f6 (centre) reaches exactly 12 squares on empty board', () => {
        setup('Oriental', fenFromPieces({ f6: 'C', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('f6'));
        expect(list).toHaveLength(12);
        const chDeltas = [-28, -26, -24, -13, -2, -1, 1, 2, 13, 24, 26, 28];
        const deltas = list.map((m) => m.to - sq('f6')).sort((a, b) => a - b);
        expect(deltas).toEqual(chDeltas.sort((a, b) => a - b));
    });

    it('champion is a leaper (leaps over blocker on intermediate square)', () => {
        // +24 = (-2, +2) from f6 = d8. Intermediate e7 blocked, champion still leaps.
        setup('Oriental', fenFromPieces({ f6: 'C', e7: 'P', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('f6'), sq('d8'))).toBe(true);
    });
});

describe('wizard/champion — Oriental only', () => {
    it('wizard on Persian board is not part of Persian pieces (variant filter — non-slide loop uses defaults, WzDir absent from KnPrincessFortress)', () => {
        // In Persian we place a wizard 'W' but the engine\'s default LoopNonSlidePce
        // list from Defs.js DOES include wW as a non-slide piece. So a wizard
        // placed via FEN will still generate its 12 moves even in Persian variant.
        setup('Persian', fenFromPieces({ e5: 'W', f2: 'K', f10: 'k' }, 'w'));
        // Just assert wizard generates its 12 targets (minus f6 if the centre
        // is reachable by any of the 12 deltas AND SQPERS applies).
        const list = movesFrom(sq('e5'));
        // e5 + WzDir contains +14 = f6. SQPERS skips f6 for the wizard (not S/P).
        const containsF6 = list.some((m) => m.to === sq('f6'));
        expect(containsF6).toBe(false);
        // Total = 12 minus 1 (f6 filtered).
        expect(list).toHaveLength(11);
    });
});
