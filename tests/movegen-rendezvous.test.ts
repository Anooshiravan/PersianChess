import { describe, it, expect } from 'vitest';
import { setup, fenFromPieces, sq, movesFrom, PIECES, snapshotState, statesEqual, stateDiff } from './helpers';
import { MFLAGRZ } from '../src/engine/defs';
import { S } from '../src/engine/state';
import { MakeMove, TakeMove } from '../src/engine/movehandler';

// Rendezvous is a special Persian move: with wS on G2 (Princess-home) and
// wB on H2 (Bishop-home), a G2→H2 move swaps them AND upgrades:
//   G2 becomes wB (bishop)
//   H2 becomes wS (Princess)  [wC in Oriental]
// Analogous for black on rank 10 (G10, H10).

describe('rendezvous — move generation', () => {
    it('white rendezvous G2 → H2 generated when wS on G2 and wB on H2', () => {
        setup('Persian', fenFromPieces({ f2: 'K', g2: 'S', h2: 'B', f10: 'k' }, 'w'));
        const rz = movesFrom(sq('g2')).find((m) => (m.flags & MFLAGRZ) !== 0);
        expect(rz).toBeDefined();
        expect(rz?.to).toBe(sq('h2'));
    });

    it('black rendezvous G10 → H10 generated when bS on G10 and bB on H10', () => {
        setup('Persian', fenFromPieces({ f10: 'k', g10: 's', h10: 'b', f2: 'K' }, 'b'));
        const rz = movesFrom(sq('g10')).find((m) => (m.flags & MFLAGRZ) !== 0);
        expect(rz).toBeDefined();
        expect(rz?.to).toBe(sq('h10'));
    });

    it('no rendezvous generated when pieces are not in the required positions', () => {
        setup('Persian', fenFromPieces({ f2: 'K', g2: 'S', h2: 'N', f10: 'k' }, 'w'));
        const rz = movesFrom(sq('g2')).find((m) => (m.flags & MFLAGRZ) !== 0);
        expect(rz).toBeUndefined();
    });
});

describe('rendezvous — MakeMove effect + reversibility', () => {
    it('white rendezvous swaps pieces (G2 becomes wB, H2 becomes wS)', () => {
        setup('Persian', fenFromPieces({ f2: 'K', g2: 'S', h2: 'B', f10: 'k' }, 'w'));
        const before = snapshotState();
        const rz = movesFrom(sq('g2')).find((m) => (m.flags & MFLAGRZ) !== 0)!;
        MakeMove(rz.raw);
        expect(S.brd_pieces[sq('g2')]).toBe(PIECES.wB);
        expect(S.brd_pieces[sq('h2')]).toBe(PIECES.wS);
        TakeMove();
        const diffs = stateDiff(before, snapshotState());
        expect(diffs).toEqual([]);
    });

    it('Oriental rendezvous MakeMove produces wC on H2 (not wS)', () => {
        // Oriental uses Champion instead of Princess. The rendezvous move
        // generator only fires when brd_pieces[G2] == wS, but the Oriental
        // starting position has wC on G2 — so under normal play this move
        // never gets generated in Oriental. If we force it via a FEN with
        // wS on G2, MakeMove places wC on H2 per the Oriental branch.
        setup('Oriental', fenFromPieces({ f2: 'K', g2: 'S', h2: 'B', f10: 'k' }, 'w'));
        const rz = movesFrom(sq('g2')).find((m) => (m.flags & MFLAGRZ) !== 0);
        expect(rz).toBeDefined();
        MakeMove(rz?.raw);
        expect(S.brd_pieces[sq('h2')]).toBe(PIECES.wC);
        expect(S.brd_pieces[sq('g2')]).toBe(PIECES.wB);
    });

    it('Oriental rendezvous is NOT reversible when FEN-forced with wS on G2 (documents a JS engine quirk)', () => {
        // TakeMove\'s Oriental branch assumes the piece originally on G2 was wC
        // (the natural Oriental starting piece). It restores wC to G2 regardless
        // of what was there before MakeMove. So if we start with wS on G2 (an
        // "impossible" position in real Oriental play), the round-trip loses
        // that wS → wC transformation. This is a genuine JS engine quirk,
        // preserved by the faithful TS port.
        setup('Oriental', fenFromPieces({ f2: 'K', g2: 'S', h2: 'B', f10: 'k' }, 'w'));
        const before = snapshotState();
        const rz = movesFrom(sq('g2')).find((m) => (m.flags & MFLAGRZ) !== 0)!;
        MakeMove(rz.raw);
        TakeMove();
        const after = snapshotState();
        // The state does NOT return to `before` — G2 is now wC instead of wS.
        expect(after.brd_pieces[sq('g2')]).toBe(PIECES.wC);
        expect(before.brd_pieces[sq('g2')]).toBe(PIECES.wS);
        expect(statesEqual(before, after)).toBe(false);
    });
});
