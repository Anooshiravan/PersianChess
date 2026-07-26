import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, findMove, snapshotState, stateDiff, PIECES } from './helpers';
import { MFLAGCA, MFLAGEP, MFLAGPS, MFLAGRZ, MFLAGPROM } from '../src/engine/defs';
import { MakeMove, TakeMove } from '../src/engine/movehandler';
import { S } from '../src/engine/state';

// MakeMove followed by TakeMove must exactly restore engine state
// (side, pieces, pceNum, material, pList[within pceNum], posKey, castlePerm,
// enPas, fiftyMove, ply, hisPly). Perft depth 3-4 exercises this heavily,
// but per-move-type tests here catch regressions with clearer signal.

function _assertRoundTrip(_moveDescription: string) {
    // Assumes engine is in the target position with a legal move ready to be
    // found by `movesFrom`. Caller passes `moveDescription` for readability.
    // Not currently used directly; each test does its own snapshot inline.
}

describe('MakeMove/TakeMove reversibility', () => {
    it('quiet pawn push', () => {
        setup('Persian', fenFromPieces({ e3: 'P', f2: 'K', f10: 'k' }, 'w'));
        const before = snapshotState();
        const move = findMove(sq('e3'), sq('e4'))?.raw;
        expect(MakeMove(move)).toBe(true);
        TakeMove();
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });

    it('double pawn push (sets ep)', () => {
        setup('Persian', fenFromPieces({ e3: 'P', f2: 'K', f10: 'k' }, 'w'));
        const before = snapshotState();
        const move = findMove(sq('e3'), sq('e5'))?.raw;
        expect(move & MFLAGPS).not.toBe(0);
        MakeMove(move);
        expect(S.brd_enPas).toBe(sq('e4'));
        TakeMove();
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });

    it('pawn capture', () => {
        setup('Persian', fenFromPieces({ e3: 'P', d4: 'p', f2: 'K', b10: 'k' }, 'w'));
        const before = snapshotState();
        const move = findMove(sq('e3'), sq('d4'))?.raw;
        MakeMove(move);
        TakeMove();
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });

    it('en passant capture', () => {
        setup('Persian', fenFromPieces({ e7: 'P', d7: 'p', f2: 'K', b10: 'k' }, 'w', '-', 'd8'));
        const before = snapshotState();
        const move = movesFrom(sq('e7')).find((m) => (m.flags & MFLAGEP) !== 0)?.raw;
        MakeMove(move);
        // After ep: e7 empty, d8 has wP, d7 empty (captured pawn removed).
        expect(S.brd_pieces[sq('e7')]).toBe(PIECES.EMPTY);
        expect(S.brd_pieces[sq('d8')]).toBe(PIECES.wP);
        expect(S.brd_pieces[sq('d7')]).toBe(PIECES.EMPTY);
        TakeMove();
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });

    it('promotion (each of Q/R/B/N)', () => {
        setup('Persian', fenFromPieces({ e9: 'P', f2: 'K', b10: 'k' }, 'w'));
        for (const promoTo of [PIECES.wQ, PIECES.wR, PIECES.wB, PIECES.wN]) {
            setup('Persian', fenFromPieces({ e9: 'P', f2: 'K', b10: 'k' }, 'w'));
            const before = snapshotState();
            const move = findMove(sq('e9'), sq('e10'), promoTo)?.raw;
            expect(move & MFLAGPROM).not.toBe(0);
            MakeMove(move);
            expect(S.brd_pieces[sq('e10')]).toBe(promoTo);
            TakeMove();
            expect(stateDiff(before, snapshotState())).toEqual([]);
        }
    });

    it('short castle (WKCA)', () => {
        setup('Persian', fenFromPieces({ f2: 'K', j2: 'R', f10: 'k' }, 'w', 'KQkq'));
        const before = snapshotState();
        const move = movesFrom(sq('f2')).find((m) => (m.flags & MFLAGCA) !== 0 && m.to === sq('i2'))?.raw;
        MakeMove(move);
        // After: K on i2, R on h2, j2 empty.
        expect(S.brd_pieces[sq('i2')]).toBe(PIECES.wK);
        expect(S.brd_pieces[sq('h2')]).toBe(PIECES.wR);
        expect(S.brd_pieces[sq('j2')]).toBe(PIECES.EMPTY);
        TakeMove();
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });

    it('long castle (WQCA)', () => {
        setup('Persian', fenFromPieces({ f2: 'K', b2: 'R', f10: 'k' }, 'w', 'KQkq'));
        const before = snapshotState();
        const move = movesFrom(sq('f2')).find((m) => (m.flags & MFLAGCA) !== 0 && m.to === sq('d2'))?.raw;
        MakeMove(move);
        // After: K on d2, R on e2, b2 empty.
        expect(S.brd_pieces[sq('d2')]).toBe(PIECES.wK);
        expect(S.brd_pieces[sq('e2')]).toBe(PIECES.wR);
        expect(S.brd_pieces[sq('b2')]).toBe(PIECES.EMPTY);
        TakeMove();
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });

    it('rendezvous (Persian)', () => {
        setup('Persian', fenFromPieces({ f2: 'K', g2: 'S', h2: 'B', f10: 'k' }, 'w'));
        const before = snapshotState();
        const move = movesFrom(sq('g2')).find((m) => (m.flags & MFLAGRZ) !== 0)?.raw;
        MakeMove(move);
        expect(S.brd_pieces[sq('g2')]).toBe(PIECES.wB);
        expect(S.brd_pieces[sq('h2')]).toBe(PIECES.wS);
        TakeMove();
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });

    it('deep sequence of moves round-trips', () => {
        // Play 4 moves then undo 4 → state must match initial.
        setup('Persian');
        const before = snapshotState();
        // From starting position, e3-e5 (white), e9-e7 (black), g3-g5 (white), g9-g7 (black).
        const seq: [string, string][] = [
            ['e3', 'e5'],
            ['e9', 'e7'],
            ['g3', 'g5'],
            ['g9', 'g7'],
        ];
        const moves: number[] = [];
        for (const [from, to] of seq) {
            const m = findMove(sq(from), sq(to))!;
            moves.push(m.raw);
            expect(MakeMove(m.raw)).toBe(true);
        }
        // Undo in reverse.
        for (let i = moves.length - 1; i >= 0; i--) {
            TakeMove();
        }
        expect(stateDiff(before, snapshotState())).toEqual([]);
    });
});
