import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, allLegalMoves, movesFrom } from './helpers';

// Legality in this engine is enforced INSIDE MakeMove: if the move leaves
// the mover\'s king in check, MakeMove calls TakeMove and returns BOOL.FALSE.
// `allLegalMoves` filters pseudo-legal moves via MakeMove/TakeMove.

describe('legality — pinned pieces', () => {
    it('a piece absolutely pinned along a file cannot move off the file', () => {
        // White knight on f5 pinned by black rook on f10 to king on f2.
        // The knight has 8 pseudo targets, but any move off the f-file exposes the king → illegal.
        setup('Persian', fenFromPieces({ f2: 'K', f5: 'N', f10: 'r', b10: 'k' }, 'w'));
        const pseudo = movesFrom(sq('f5'));
        const legal = allLegalMoves().filter((m) => m.from === sq('f5'));
        expect(pseudo.length).toBeGreaterThan(0);
        expect(legal.length).toBe(0); // knight can't stay on f-file with a knight move
    });

    it('a rook pinned along a rank can still slide along that rank', () => {
        // Black rook on d5 pinned by white rook on i5 to black king on b5.
        // The pinned rook may move along the pin line (rank 5) but not off it.
        setup('Persian', fenFromPieces({ b5: 'k', d5: 'r', i5: 'R', f2: 'K' }, 'b'));
        const legal = allLegalMoves().filter((m) => m.from === sq('d5'));
        // Along rank 5, black rook can go to c5 (adjacent king), e5, f5 (skipped by SQPERS? f5 is not centre — centre is f6=97).
        // Wait rank 5 line: c5, e5, f5, g5, h5, i5(capture). All on rank 5 → legal.
        const targets = legal.map((m) => m.to);
        expect(targets).toContain(sq('c5'));
        expect(targets).toContain(sq('e5'));
        expect(targets).toContain(sq('i5')); // capture the pinning rook
        // Off the pin (any move to rank ≠ 5) is illegal:
        expect(
            targets.every(
                (t) =>
                    t === sq('c5') ||
                    t === sq('e5') ||
                    t === sq('f5') ||
                    t === sq('g5') ||
                    t === sq('h5') ||
                    t === sq('i5'),
            ),
        ).toBe(true);
    });
});

describe('legality — king safety', () => {
    it('king cannot walk into check', () => {
        // Black rook on b3 controls rank 3. White king on b5 cannot move to b4 or b3.
        setup('Persian', fenFromPieces({ b5: 'K', b3: 'r', j10: 'k' }, 'w'));
        const legal = allLegalMoves().filter((m) => m.from === sq('b5'));
        expect(legal.some((m) => m.to === sq('b4'))).toBe(false);
        expect(legal.some((m) => m.to === sq('b3'))).toBe(false);
        // But c5, c6, b6 are safe.
        expect(legal.some((m) => m.to === sq('c5'))).toBe(true);
    });

    it('king can capture an adjacent attacker if safe afterwards', () => {
        // Black rook on c5 attacks the king on b5, but no back-up defender — king can capture.
        setup('Persian', fenFromPieces({ b5: 'K', c5: 'r', j10: 'k' }, 'w'));
        const legal = allLegalMoves().filter((m) => m.from === sq('b5'));
        expect(legal.some((m) => m.to === sq('c5'))).toBe(true);
    });

    it('king cannot capture a defended attacker', () => {
        // Rook on c5 is defended by another rook on c10.
        setup('Persian', fenFromPieces({ b5: 'K', c5: 'r', c10: 'r', j10: 'k' }, 'w'));
        const legal = allLegalMoves().filter((m) => m.from === sq('b5'));
        expect(legal.some((m) => m.to === sq('c5'))).toBe(false);
    });
});

describe('legality — response to check', () => {
    it('when in check, only moves that resolve check are legal', () => {
        // White king on f2 checked by black rook on f10. Legal responses:
        //  - block the check (any white piece steps onto file f between them)
        //  - capture the rook (needs a piece that reaches f10)
        //  - move the king off file f (and off any other threats)
        setup('Persian', fenFromPieces({ f2: 'K', f10: 'r', d2: 'R', b10: 'k' }, 'w'));
        const legal = allLegalMoves();

        // Any move that leaves king still on file f without blocker is illegal.
        // Blocking moves for wR on d2 → could go to f2 (own king square, no), f3..f9. Let\'s check f5:
        expect(legal.some((m) => m.from === sq('d2') && m.to === sq('f2'))).toBe(false);
        // wR can block at f? need to reach f-file; d2→f2 blocked by own king. d2→d5→f5 is 2 moves.
        // King itself can step off file f: f2→e2, e3, f3(still on file? yes → still in check), g2, g3.
        expect(legal.some((m) => m.from === sq('f2') && m.to === sq('e2'))).toBe(true);
        expect(legal.some((m) => m.from === sq('f2') && m.to === sq('f3'))).toBe(false); // still on file f
    });
});
