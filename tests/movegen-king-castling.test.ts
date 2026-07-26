import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, hasMove, PIECES } from './helpers';
import { MFLAGCA } from '../src/engine/defs';

// Starting position:
//   Rank 2: 1RNBQKSBNR1  (files b..j = R N B Q K S B N R)
//     b2=R, c2=N, d2=B, e2=Q, f2=K, g2=S, h2=B, i2=N, j2=R
// King short-castle (WKCA) in the JS engine encodes MOVE(F2, I2, ...) — king
// jumps 3 files right onto its rook. Long-castle encodes MOVE(F2, D2, ...).

describe('king — reach on 8 neighbouring squares', () => {
    it('king in the middle has 8 moves', () => {
        setup('Persian', fenFromPieces({ e5: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5'))
            .map((m) => m.to)
            .sort((a, b) => a - b);
        const expected = [sq('d4'), sq('d5'), sq('d6'), sq('e4'), sq('e6'), sq('f4'), sq('f5'), sq('f6')].sort(
            (a, b) => a - b,
        );
        // Persian rule: f6 (=97) is blocked for the king (SQPERS filters it out).
        // So the king should NOT be able to move to f6.
        expect(expected.includes(sq('f6'))).toBe(true);
        const filtered = expected.filter((s) => s !== sq('f6'));
        expect(list).toEqual(filtered);
    });

    it('king cannot capture own piece', () => {
        setup('Persian', fenFromPieces({ e5: 'K', e6: 'P', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('e6'))).toBe(false);
    });

    it('king captures enemy neighbour', () => {
        setup('Persian', fenFromPieces({ e5: 'K', e6: 'p', f10: 'k' }, 'w'));
        const cap = movesFrom(sq('e5')).find((m) => m.to === sq('e6'));
        expect(cap).toBeDefined();
        expect(cap?.captured).toBe(PIECES.bP);
    });
});

describe('castling — availability', () => {
    it('white short castle (WKCA) generated when g2/h2/i2 empty and squares not attacked', () => {
        // Castle-short encoded as MOVE(F2 → I2). Rooks live on b2 and j2.
        setup('Persian', fenFromPieces({ f2: 'K', j2: 'R', f10: 'k' }, 'w', 'KQkq'));
        const cas = movesFrom(sq('f2')).find((m) => (m.flags & MFLAGCA) !== 0);
        expect(cas).toBeDefined();
        expect(cas?.to).toBe(sq('i2'));
    });

    it('white long castle (WQCA) generated when c2/d2/e2 empty and safe', () => {
        // Long castle encoded as MOVE(F2 → D2). Rook on b2.
        setup('Persian', fenFromPieces({ f2: 'K', b2: 'R', f10: 'k' }, 'w', 'KQkq'));
        const cas = movesFrom(sq('f2')).filter((m) => (m.flags & MFLAGCA) !== 0);
        expect(cas.some((m) => m.to === sq('d2'))).toBe(true);
    });

    it('short castle blocked by piece in the path', () => {
        setup('Persian', fenFromPieces({ f2: 'K', h2: 'N', j2: 'R', f10: 'k' }, 'w', 'KQkq'));
        expect(hasMove(sq('f2'), sq('i2'))).toBe(false);
    });

    it('short castle blocked when a path square is attacked', () => {
        // Place a black rook on h5 attacking down file h to h2 (and beyond).
        setup('Persian', fenFromPieces({ f2: 'K', j2: 'R', h5: 'r', f10: 'k' }, 'w', 'KQkq'));
        expect(hasMove(sq('f2'), sq('i2'))).toBe(false);
    });

    it('castle rights zero means no castle move generated', () => {
        setup('Persian', fenFromPieces({ f2: 'K', j2: 'R', f10: 'k' }, 'w', '-'));
        expect(movesFrom(sq('f2')).some((m) => (m.flags & MFLAGCA) !== 0)).toBe(false);
    });

    it('black short castle (BKCA) generated similarly on rank 10', () => {
        setup('Persian', fenFromPieces({ f10: 'k', j10: 'r', f2: 'K' }, 'b', 'KQkq'));
        expect(movesFrom(sq('f10')).some((m) => (m.flags & MFLAGCA) !== 0 && m.to === sq('i10'))).toBe(true);
    });

    it('black long castle (BQCA) generated similarly on rank 10', () => {
        setup('Persian', fenFromPieces({ f10: 'k', b10: 'r', f2: 'K' }, 'b', 'KQkq'));
        expect(movesFrom(sq('f10')).some((m) => (m.flags & MFLAGCA) !== 0 && m.to === sq('d10'))).toBe(true);
    });
});
