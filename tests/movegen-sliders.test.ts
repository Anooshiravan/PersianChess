import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, hasMove, PIECES } from './helpers';

// From Defs.js:
//   RkDir = [-1, -13, 1, 13]           (file-1, rank-1, file+1, rank+1)
//   BiDir = [-12, -14, 12, 14]         (up-right, up-left mirrored — diagonals)
//   PieceRookFortressQueen       → R, F, Q slide like rook
//   PieceBishopPrincessQueen     → B, S (Princess), Q slide like bishop
//   PieceKnightPrincessFortress  → N, S, F jump like knight (non-slide)
// So:
//   Rook (R) = rook slides
//   Bishop (B) = bishop slides
//   Queen (Q) = rook + bishop slides
//   Fortress (F) = rook slides + knight jumps
//   Princess (S) = bishop slides + knight jumps

describe('rook — slides orthogonally', () => {
    it('white rook on e5 (empty board) reaches full cross on the playable 9×9', () => {
        setup('Persian', fenFromPieces({ e5: 'R', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5')).map((m) => m.to);
        // File e: e2..e10 minus e5. Rank 5: b5..j5 minus e5. e10 blocked? f10 is king, e10 empty.
        const expected = [
            sq('e2'),
            sq('e3'),
            sq('e4'),
            sq('e6'),
            sq('e7'),
            sq('e8'),
            sq('e9'),
            sq('e10'),
            sq('b5'),
            sq('c5'),
            sq('d5'),
            sq('f5'),
            sq('g5'),
            sq('h5'),
            sq('i5'),
            sq('j5'),
        ];
        expect(list.sort((a, b) => a - b)).toEqual(expected.sort((a, b) => a - b));
    });

    it('white rook stops before own piece, captures enemy', () => {
        setup('Persian', fenFromPieces({ e5: 'R', e7: 'P', h5: 'p', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5'));
        // Upward: e5→e6 (empty) OK; e5→e7 blocked by own P → not present
        expect(list.some((m) => m.to === sq('e6'))).toBe(true);
        expect(list.some((m) => m.to === sq('e7'))).toBe(false);
        expect(list.some((m) => m.to === sq('e8'))).toBe(false);
        // Rightward: e5→f5, g5 empty; e5→h5 captures; e5→i5 not present
        expect(list.some((m) => m.to === sq('h5') && m.captured === PIECES.bP)).toBe(true);
        expect(list.some((m) => m.to === sq('i5'))).toBe(false);
    });

    it('rook has no diagonal moves', () => {
        setup('Persian', fenFromPieces({ e5: 'R', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5'));
        expect(list.some((m) => m.to === sq('f6'))).toBe(false);
        expect(list.some((m) => m.to === sq('d4'))).toBe(false);
    });
});

describe('bishop — slides diagonally', () => {
    it('white bishop on e5 reaches its two diagonals (skipping Persian centre f6, reaching fortress corners)', () => {
        // Persian rule: SQPERS blocks non-Pawn/Princess from landing on f6 (=97).
        // The bishop slides THROUGH f6 without stopping/landing and continues
        // until it hits an off-board frame square or a blocker.
        // Diagonal NE from e5: f6(skip), g7, h8, i9, j10, k11 (fortress corner reachable)
        // Diagonal NW from e5: d6, c7, b8 (then a9 is frame → stop)
        // Diagonal SE from e5: f4, g3, h2 (then i1 is frame → stop)
        // Diagonal SW from e5: d4, c3, b2, a1 (fortress corner reachable)
        setup('Persian', fenFromPieces({ e5: 'B', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5')).map((m) => m.to);
        const expected = [
            // NE (f6 skipped by SQPERS)
            sq('g7'),
            sq('h8'),
            sq('i9'),
            sq('j10'),
            sq('k11'),
            // NW
            sq('d6'),
            sq('c7'),
            sq('b8'),
            // SE
            sq('f4'),
            sq('g3'),
            sq('h2'),
            // SW
            sq('d4'),
            sq('c3'),
            sq('b2'),
            sq('a1'),
        ];
        expect(list.sort((a, b) => a - b)).toEqual(expected.sort((a, b) => a - b));
    });

    it('bishop cannot make orthogonal moves', () => {
        setup('Persian', fenFromPieces({ e5: 'B', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('e6'))).toBe(false);
        expect(hasMove(sq('e5'), sq('f5'))).toBe(false);
    });
});

describe('queen — rook + bishop', () => {
    it('white queen on e5 (empty board) reaches full 8-direction reach', () => {
        setup('Persian', fenFromPieces({ e5: 'Q', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5')).map((m) => m.to);
        // Rook squares
        const rookSquares = [
            sq('e2'),
            sq('e3'),
            sq('e4'),
            sq('e6'),
            sq('e7'),
            sq('e8'),
            sq('e9'),
            sq('e10'),
            sq('b5'),
            sq('c5'),
            sq('d5'),
            sq('f5'),
            sq('g5'),
            sq('h5'),
            sq('i5'),
            sq('j5'),
        ];
        const bishopSquares = [
            // NE (f6 skipped by SQPERS)
            sq('g7'),
            sq('h8'),
            sq('i9'),
            sq('j10'),
            sq('k11'),
            sq('d6'),
            sq('c7'),
            sq('b8'),
            sq('f4'),
            sq('g3'),
            sq('h2'),
            sq('d4'),
            sq('c3'),
            sq('b2'),
            sq('a1'),
        ];
        const expected = [...rookSquares, ...bishopSquares];
        expect(list.sort((a, b) => a - b)).toEqual(expected.sort((a, b) => a - b));
    });
});

describe('fortress — rook slides + knight jumps', () => {
    it('white fortress on e5 has rook lines AND knight targets', () => {
        setup('Persian', fenFromPieces({ e5: 'F', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5')).map((m) => m.to);
        const rookSquares = [
            sq('e2'),
            sq('e3'),
            sq('e4'),
            sq('e6'),
            sq('e7'),
            sq('e8'),
            sq('e9'),
            sq('e10'),
            sq('b5'),
            sq('c5'),
            sq('d5'),
            sq('f5'),
            sq('g5'),
            sq('h5'),
            sq('i5'),
            sq('j5'),
        ];
        const knightSquares = [sq('c4'), sq('c6'), sq('d3'), sq('d7'), sq('f3'), sq('f7'), sq('g4'), sq('g6')];
        const expected = [...rookSquares, ...knightSquares];
        expect(list.sort((a, b) => a - b)).toEqual(expected.sort((a, b) => a - b));
    });

    it('fortress at its starting corner a1 has restricted knight targets', () => {
        setup('Persian', fenFromPieces({ a1: 'F', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('a1')).map((m) => m.to);
        // From a1 = FR2SQ(0,0) = 27:
        //   Rook +1 → b1 (frame, off-board) → stop immediately
        //   Rook -1 → off
        //   Rook +13 → a2 (frame) → stop
        //   Rook -13 → off
        //   Knight (+2,-1) → off (rank -1)
        //   Knight (+1,-2) → off
        //   Knight (-1,-2) → off
        //   Knight (-2,-1) → off
        //   Knight (-2,+1) → off
        //   Knight (-1,+2) → (-1,2) off
        //   Knight (+1,+2) → b3 (frame) → OFFBOARD skip. Wait — b3 is (file 1, rank 2) which is a REAL square (file b, rank 3). Let me recheck.
        //   Wait b3 is file b (index 1), rank 3 (index 2). FR2SQ(1, 2) = 27+1+26 = 54. And FrameSQ has 53 (a3), 63 (k3) — b3=54 is NOT in FrameSQ → real square.
        //   Knight (+1,+2) from (0,0) → (1,2) → b3 ✓
        //   Knight (+2,+1) from (0,0) → (2,1) → c2 ✓
        expect(list.sort((a, b) => a - b)).toEqual([sq('b3'), sq('c2')].sort((a, b) => a - b));
    });
});

describe('princess — bishop slides + knight jumps', () => {
    it('white princess on e5 has bishop lines AND knight targets', () => {
        // Princess (S) is exempt from SQPERS — it CAN land on f6 in Persian,
        // and it continues past f6 on the same diagonal.
        setup('Persian', fenFromPieces({ e5: 'S', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5')).map((m) => m.to);
        const bishopSquares = [
            // NE (f6 included — princess is allowed on the centre)
            sq('f6'),
            sq('g7'),
            sq('h8'),
            sq('i9'),
            sq('j10'),
            sq('k11'),
            sq('d6'),
            sq('c7'),
            sq('b8'),
            sq('f4'),
            sq('g3'),
            sq('h2'),
            sq('d4'),
            sq('c3'),
            sq('b2'),
            sq('a1'),
        ];
        const knightSquares = [sq('c4'), sq('c6'), sq('d3'), sq('d7'), sq('f3'), sq('f7'), sq('g4'), sq('g6')];
        const expected = [...bishopSquares, ...knightSquares];
        expect(list.sort((a, b) => a - b)).toEqual(expected.sort((a, b) => a - b));
    });

    it('princess is NOT a rook (no orthogonal slides)', () => {
        setup('Persian', fenFromPieces({ e5: 'S', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e5'), sq('e6'))).toBe(false); // one up (rook direction)
        expect(hasMove(sq('e5'), sq('f5'))).toBe(false); // one right
    });
});

describe('sliders — blockers', () => {
    it('bishop slides stop at first blocker on each diagonal', () => {
        // f6 is skipped by Persian rule but the diagonal continues past it,
        // so g7 (own P) is the effective NE blocker.
        setup(
            'Persian',
            fenFromPieces(
                {
                    e5: 'B',
                    g7: 'P', // NE diag, own → not captured, stops before
                    c3: 'p', // SW diag, enemy → captured, stops after
                    f2: 'K',
                    f10: 'k',
                },
                'w',
            ),
        );
        const list = movesFrom(sq('e5'));
        // NE: f6 skipped, g7 blocked (own) → NOTHING generated on NE
        expect(list.some((m) => m.to === sq('f6'))).toBe(false);
        expect(list.some((m) => m.to === sq('g7'))).toBe(false);
        expect(list.some((m) => m.to === sq('h8'))).toBe(false);

        expect(list.some((m) => m.to === sq('d4'))).toBe(true);
        expect(list.some((m) => m.to === sq('c3') && m.captured === PIECES.bP)).toBe(true);
        expect(list.some((m) => m.to === sq('b2'))).toBe(false); // past blocker
        expect(list.some((m) => m.to === sq('a1'))).toBe(false); // past blocker
    });

    it('rook cannot move onto Persian centre f6 either', () => {
        // Rook slides along rank 6 from b6→j6; f6 is skipped, movement passes through it.
        setup('Persian', fenFromPieces({ b6: 'R', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('b6')).map((m) => m.to);
        // Along rank 6, rook should reach c6, d6, e6, (f6 skipped), g6, h6, i6, j6
        expect(list).toContain(sq('e6'));
        expect(list).not.toContain(sq('f6'));
        expect(list).toContain(sq('g6'));
        expect(list).toContain(sq('j6'));
    });
});
