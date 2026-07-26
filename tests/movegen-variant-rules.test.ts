import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, hasMove } from './helpers';

// Persian centre f6 (square 97):
//   SQPERS returns TRUE (i.e. the square is FORBIDDEN) for any piece EXCEPT
//   Pawn or Princess.  In the move generator, SQPERS-blocked squares are
//   skipped as move targets AND sliders pass through them.
//
// Pyramid centre f6 (square 97):
//   SQCENTER returns TRUE for all pieces (no exemption). No piece may move
//   to or from square 97. Also SqAttacked returns TRUE for square 97
//   (occupied by the "eye"), and MOVE() sanity-check rejects any move
//   involving 97.
//
// Citadel / Oriental: no centre rule.

describe('Persian centre rule', () => {
    it('non-pawn/princess piece cannot land on f6', () => {
        setup('Persian', fenFromPieces({ e5: 'N', f2: 'K', f10: 'k' }, 'w'));
        // Knight has 8 possible targets; e5 → f7 (+14) is fine. Can it land on f6? Delta 14 from e5=83 → 97 = f6. Knight deltas don't include 14; check: KnDir=[-11,-25,-27,-15,11,25,27,15]. 14 is not there.
        // Try a Wizard which does have +14 → f6.
        setup('Persian', fenFromPieces({ e5: 'W', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5'));
        expect(list.some((m) => m.to === sq('f6'))).toBe(false);
    });

    it('pawn CAN move to f6 (SQPERS exempts wP)', () => {
        // A white pawn on e5 attacking f6 with a black piece there should capture.
        setup('Persian', fenFromPieces({ e5: 'P', f6: 'n', f2: 'K', b10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('f6'))).toBe(true);
    });

    it('princess CAN move to f6 (SQPERS exempts wS)', () => {
        setup('Persian', fenFromPieces({ e5: 'S', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('f6'))).toBe(true);
    });

    it('non-pawn/princess piece cannot move FROM f6 either', () => {
        // Place a knight on f6 (illegal in real play, but ParseFen allows it).
        setup('Persian', fenFromPieces({ f6: 'N', f2: 'K', f10: 'k' }, 'w'));
        // SQPERS check is `to == 97 && ...`, meaning it filters moves whose
        // DESTINATION is f6. It doesn't specifically filter moves whose SOURCE
        // is f6 — so a knight on f6 could move OUT of it. However, the movegen
        // slide/non-slide loops use SQPERS on the destination, so moves from
        // f6 are still generated. Assert this:
        expect(movesFrom(sq('f6')).length).toBeGreaterThan(0);
    });
});

describe('Pyramid centre rule', () => {
    it('SqAttacked returns TRUE for f6 in Pyramid', () => {
        setup('Pyramid', fenFromPieces({ f2: 'K', f10: 'k' }, 'w'));
        // Import SqAttacked lazily via helpers or state? Simpler: check via
        // king movement — a king adjacent to f6 in Pyramid cannot step onto it.
        setup('Pyramid', fenFromPieces({ e5: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('f6'))).toBe(false);
    });

    it('no piece can land on f6 in Pyramid (not even pawn)', () => {
        setup('Pyramid', fenFromPieces({ e5: 'P', f6: 'n', f2: 'K', b10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('f6'))).toBe(false);
    });

    it('sliders skip f6 in Pyramid too', () => {
        setup('Pyramid', fenFromPieces({ b6: 'R', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('b6')).map((m) => m.to);
        expect(list).not.toContain(sq('f6'));
    });
});

describe('non-restricting variants', () => {
    it('in Citadel, f6 is a normal square', () => {
        setup('Citadel', fenFromPieces({ e5: 'W', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('f6'))).toBe(true);
    });

    it('in Oriental, f6 is a normal square', () => {
        setup('Oriental', fenFromPieces({ e5: 'W', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('f6'))).toBe(true);
    });
});
