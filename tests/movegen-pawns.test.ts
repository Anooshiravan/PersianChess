import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, hasMove, findMove, PIECES } from './helpers';
import { MFLAGPS, MFLAGEP } from '../src/engine/defs';

// Persian Chess playable squares: ranks 2..10 × files b..j (9×9), plus
// four fortress corners a1/k1/a11/k11. Files a and k on ranks 2..10 are
// frame squares (OFFBOARD); ParseFen silently drops pieces placed there.

describe('pawns — quiet moves', () => {
    it('white pawn on rank 3 has single push and double push', () => {
        setup('Persian', fenFromPieces({ e3: 'P', f2: 'K', f10: 'k' }, 'w'));
        const from = sq('e3');
        const list = movesFrom(from);
        expect(list.map((m) => m.to).sort()).toEqual([sq('e4'), sq('e5')].sort());

        const dbl = findMove(from, sq('e5'));
        expect(dbl).toBeDefined();
        expect(dbl?.flags & MFLAGPS).not.toBe(0);
    });

    it('white pawn beyond rank 3 has only single push', () => {
        setup('Persian', fenFromPieces({ e5: 'P', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e5'));
        expect(list.map((m) => m.to)).toEqual([sq('e6')]);
    });

    it('white pawn blocked by piece cannot push', () => {
        setup('Persian', fenFromPieces({ e3: 'P', e4: 'p', f2: 'K', f10: 'k' }, 'w'));
        expect(movesFrom(sq('e3')).filter((m) => m.captured === PIECES.EMPTY)).toHaveLength(0);
    });

    it('white pawn double push blocked by piece on rank 5', () => {
        setup('Persian', fenFromPieces({ e3: 'P', e5: 'p', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e3'));
        // Single push e3→e4 OK; double push e3→e5 blocked.
        expect(list.some((m) => m.to === sq('e4') && m.captured === PIECES.EMPTY)).toBe(true);
        expect(list.some((m) => m.to === sq('e5'))).toBe(false);
    });

    it('black pawn on rank 9 has single and double push', () => {
        setup('Persian', fenFromPieces({ e9: 'p', f2: 'K', f10: 'k' }, 'b'));
        const list = movesFrom(sq('e9'));
        expect(list.map((m) => m.to).sort()).toEqual([sq('e7'), sq('e8')].sort());
        expect(findMove(sq('e9'), sq('e7'))?.flags & MFLAGPS).not.toBe(0);
    });
});

describe('pawns — captures', () => {
    it('white pawn captures diagonally left/right', () => {
        setup('Persian', fenFromPieces({ e3: 'P', d4: 'p', f4: 'p', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('e3'));
        expect(list.some((m) => m.to === sq('d4') && m.captured === PIECES.bP)).toBe(true);
        expect(list.some((m) => m.to === sq('f4') && m.captured === PIECES.bP)).toBe(true);
    });

    it('white pawn cannot capture own piece', () => {
        setup('Persian', fenFromPieces({ e3: 'P', d4: 'P', f2: 'K', f10: 'k' }, 'w'));
        expect(hasMove(sq('e3'), sq('d4'))).toBe(false);
    });

    it('black pawn captures diagonally left/right', () => {
        setup('Persian', fenFromPieces({ e9: 'p', d8: 'P', f8: 'P', f2: 'K', f10: 'k' }, 'b'));
        const list = movesFrom(sq('e9'));
        expect(list.some((m) => m.to === sq('d8') && m.captured === PIECES.wP)).toBe(true);
        expect(list.some((m) => m.to === sq('f8') && m.captured === PIECES.wP)).toBe(true);
    });
});

describe('pawns — en passant', () => {
    it('white pawn captures en passant', () => {
        // Black just double-pushed d9→d7; brd_enPas set by MakeMove = d9 - 13 = d8.
        setup('Persian', fenFromPieces({ e7: 'P', d7: 'p', f2: 'K', f10: 'k' }, 'w', '-', 'd8'));
        const list = movesFrom(sq('e7'));
        const epMove = list.find((m) => (m.flags & MFLAGEP) !== 0);
        expect(epMove).toBeDefined();
        expect(epMove?.to).toBe(sq('d8'));
    });

    it('black pawn captures en passant', () => {
        // White pushed e3→e5, brd_enPas = e3 + 13 = e4.
        setup('Persian', fenFromPieces({ d5: 'p', e5: 'P', f2: 'K', f10: 'k' }, 'b', '-', 'e4'));
        const list = movesFrom(sq('d5'));
        const epMove = list.find((m) => (m.flags & MFLAGEP) !== 0);
        expect(epMove).toBeDefined();
        expect(epMove?.to).toBe(sq('e4'));
    });
});

describe('pawns — promotion', () => {
    it('white pawn on rank 9 pushing to rank 10 creates 4 promotion moves', () => {
        setup('Persian', fenFromPieces({ e9: 'P', f2: 'K', b10: 'k' }, 'w'));
        const list = movesFrom(sq('e9')).filter((m) => m.to === sq('e10'));
        expect(list.map((m) => m.promoted).sort()).toEqual([PIECES.wQ, PIECES.wR, PIECES.wB, PIECES.wN].sort());
    });

    it('white pawn on rank 9 capturing to rank 10 also promotes (4 options)', () => {
        setup('Persian', fenFromPieces({ e9: 'P', d10: 'n', f2: 'K', b10: 'k' }, 'w'));
        const capturePromos = movesFrom(sq('e9')).filter((m) => m.to === sq('d10') && m.captured === PIECES.bN);
        expect(capturePromos.map((m) => m.promoted).sort()).toEqual(
            [PIECES.wQ, PIECES.wR, PIECES.wB, PIECES.wN].sort(),
        );
    });

    it('black pawn on rank 3 pushing to rank 2 promotes to black pieces', () => {
        // Use a position where the pawn's push target is empty.
        setup('Persian', fenFromPieces({ e3: 'p', h2: 'K', f10: 'k' }, 'b'));
        const pushes = movesFrom(sq('e3')).filter((m) => m.to === sq('e2'));
        expect(pushes.map((m) => m.promoted).sort()).toEqual([PIECES.bQ, PIECES.bR, PIECES.bB, PIECES.bN].sort());
    });
});

describe('pawns — edge files (b and j are the outer files of the playable 9×9)', () => {
    it('b-file pawn has right-capture only when appropriate', () => {
        setup('Persian', fenFromPieces({ b3: 'P', c4: 'p', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('b3'));
        expect(list.some((m) => m.to === sq('c4') && m.captured === PIECES.bP)).toBe(true);
        // b3+12 targets file a rank 4 (off-board frame). No captures should land elsewhere.
        const caps = list.filter((m) => m.captured !== PIECES.EMPTY);
        expect(caps.every((m) => m.to === sq('c4'))).toBe(true);
    });

    it('j-file pawn has left-capture only when appropriate', () => {
        setup('Persian', fenFromPieces({ j3: 'P', i4: 'p', f2: 'K', f10: 'k' }, 'w'));
        const list = movesFrom(sq('j3'));
        expect(list.some((m) => m.to === sq('i4') && m.captured === PIECES.bP)).toBe(true);
        // j3+14 targets file k rank 4 (off-board frame).
        const caps = list.filter((m) => m.captured !== PIECES.EMPTY);
        expect(caps.every((m) => m.to === sq('i4'))).toBe(true);
    });
});
