import { S } from '../src/engine/state';
import { PIECES, COLOURS, BOOL, FROMSQ, TOSQ, CAPTURED, PROMOTED, FR2SQ, NOMOVE } from '../src/engine/defs';
import { ParseFen } from '../src/engine/board';
import { setVariantDefs } from '../src/engine/variants';
import { init_engine } from '../src/engine/init';
import { GenerateMoves, GenerateCaptures } from '../src/engine/movegen';
import { MakeMove, TakeMove } from '../src/engine/movehandler';

export function setup(variant: string, fen?: string): void {
    setVariantDefs(variant);
    init_engine();
    const useFen = fen ?? S.START_FEN;
    const ok = ParseFen(useFen);
    if (!ok) throw new Error(`ParseFen failed for: ${useFen}`);
}

export function setupEmpty(variant: string, sideToMove: number = COLOURS.WHITE): void {
    const sideChar = sideToMove === COLOURS.WHITE ? 'w' : 'b';
    const fen = `11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111/11111111111 ${sideChar} - - 0 1`;
    setup(variant, fen);
}

export function fenFromPieces(
    pieces: Record<string, string>,
    sideToMove: 'w' | 'b' = 'w',
    castling: string = '-',
    enPas: string = '-',
): string {
    const grid: string[][] = [];
    for (let r = 0; r < 11; r++) grid.push(Array(11).fill('1'));
    for (const [sq, pc] of Object.entries(pieces)) {
        const file = sq.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(sq.slice(1), 10) - 1;
        grid[rank][file] = pc;
    }
    const rows: string[] = [];
    for (let r = 10; r >= 0; r--) rows.push(grid[r].join(''));
    return `${rows.join('/')} ${sideToMove} ${castling} ${enPas} 0 1`;
}

export function sq(alg: string): number {
    const file = alg.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(alg.slice(1), 10) - 1;
    return FR2SQ(file, rank);
}

export interface DecodedMove {
    from: number;
    to: number;
    captured: number;
    promoted: number;
    flags: number;
    raw: number;
}

export function decode(move: number): DecodedMove {
    return {
        from: FROMSQ(move),
        to: TOSQ(move),
        captured: CAPTURED(move),
        promoted: PROMOTED(move),
        flags: move,
        raw: move,
    };
}

export function allPseudoMoves(): DecodedMove[] {
    S.brd_moveListStart[S.brd_ply] = 0;
    S.brd_moveListStart[S.brd_ply + 1] = 0;
    GenerateMoves();
    const start = S.brd_moveListStart[S.brd_ply];
    const end = S.brd_moveListStart[S.brd_ply + 1];
    const out: DecodedMove[] = [];
    for (let i = start; i < end; i++) out.push(decode(S.brd_moveList[i]));
    return out;
}

export function allPseudoCaptures(): DecodedMove[] {
    S.brd_moveListStart[S.brd_ply] = 0;
    S.brd_moveListStart[S.brd_ply + 1] = 0;
    GenerateCaptures();
    const start = S.brd_moveListStart[S.brd_ply];
    const end = S.brd_moveListStart[S.brd_ply + 1];
    const out: DecodedMove[] = [];
    for (let i = start; i < end; i++) out.push(decode(S.brd_moveList[i]));
    return out;
}

export function allLegalMoves(): DecodedMove[] {
    const pseudo = allPseudoMoves();
    const legal: DecodedMove[] = [];
    for (const m of pseudo) {
        if (MakeMove(m.raw)) {
            TakeMove();
            legal.push(m);
        }
    }
    return legal;
}

export function movesFrom(fromSq: number, moves?: DecodedMove[]): DecodedMove[] {
    const list = moves ?? allPseudoMoves();
    return list.filter((m) => m.from === fromSq);
}

export function movesTo(toSq: number, moves?: DecodedMove[]): DecodedMove[] {
    const list = moves ?? allPseudoMoves();
    return list.filter((m) => m.to === toSq);
}

export function findMove(
    fromSq: number,
    toSq: number,
    promoted?: number,
    moves?: DecodedMove[],
): DecodedMove | undefined {
    const list = moves ?? allPseudoMoves();
    return list.find((m) => m.from === fromSq && m.to === toSq && (promoted === undefined || m.promoted === promoted));
}

export function hasMove(fromSq: number, toSq: number, moves?: DecodedMove[]): boolean {
    return findMove(fromSq, toSq, undefined, moves) !== undefined;
}

export function snapshotState() {
    return {
        brd_side: S.brd_side,
        brd_pieces: S.brd_pieces.slice(),
        brd_enPas: S.brd_enPas,
        brd_fiftyMove: S.brd_fiftyMove,
        brd_ply: S.brd_ply,
        brd_hisPly: S.brd_hisPly,
        brd_castlePerm: S.brd_castlePerm,
        brd_posKey: S.brd_posKey,
        brd_pceNum: S.brd_pceNum.slice(),
        brd_material: S.brd_material.slice(),
        brd_pList: S.brd_pList.slice(),
    };
}

export function statesEqual(a: ReturnType<typeof snapshotState>, b: ReturnType<typeof snapshotState>): boolean {
    return stateDiff(a, b).length === 0;
}

export function stateDiff(a: ReturnType<typeof snapshotState>, b: ReturnType<typeof snapshotState>): string[] {
    const diffs: string[] = [];
    if (a.brd_side !== b.brd_side) diffs.push(`brd_side ${a.brd_side} vs ${b.brd_side}`);
    if (a.brd_enPas !== b.brd_enPas) diffs.push(`brd_enPas ${a.brd_enPas} vs ${b.brd_enPas}`);
    if (a.brd_fiftyMove !== b.brd_fiftyMove) diffs.push(`brd_fiftyMove ${a.brd_fiftyMove} vs ${b.brd_fiftyMove}`);
    if (a.brd_ply !== b.brd_ply) diffs.push(`brd_ply ${a.brd_ply} vs ${b.brd_ply}`);
    if (a.brd_hisPly !== b.brd_hisPly) diffs.push(`brd_hisPly ${a.brd_hisPly} vs ${b.brd_hisPly}`);
    if (a.brd_castlePerm !== b.brd_castlePerm) diffs.push(`brd_castlePerm ${a.brd_castlePerm} vs ${b.brd_castlePerm}`);
    if (a.brd_posKey !== b.brd_posKey) diffs.push(`brd_posKey ${a.brd_posKey} vs ${b.brd_posKey}`);
    // Treat NaN === NaN for equality (the latent OFFBOARD-as-piece quirk in
    // UpdateListsMaterial produces NaN entries at index 169 in brd_pceNum;
    // they're stable across MakeMove/TakeMove but JS !== considers NaN !== NaN).
    const numEq = (x: number, y: number) => x === y || (Number.isNaN(x) && Number.isNaN(y));
    const arrEq = (x: number[], y: number[]) => x.length === y.length && x.every((v, i) => numEq(v, y[i]));
    if (!arrEq(a.brd_pieces, b.brd_pieces)) {
        for (let i = 0; i < a.brd_pieces.length; i++) {
            if (!numEq(a.brd_pieces[i], b.brd_pieces[i])) {
                diffs.push(`brd_pieces[${i}] ${a.brd_pieces[i]} vs ${b.brd_pieces[i]}`);
            }
        }
    }
    // Compare only real-piece indices (1..20) in pceNum/material — anything
    // beyond is the OFFBOARD-latent-bug residue.
    for (let p = 1; p <= 20; p++) {
        if (!numEq(a.brd_pceNum[p], b.brd_pceNum[p])) {
            diffs.push(`brd_pceNum[${p}] ${a.brd_pceNum[p]} vs ${b.brd_pceNum[p]}`);
        }
    }
    for (let c = 0; c < 2; c++) {
        if (!numEq(a.brd_material[c], b.brd_material[c])) {
            diffs.push(`brd_material[${c}] ${a.brd_material[c]} vs ${b.brd_material[c]}`);
        }
    }
    // pList: compare only entries within pceNum[piece] for each piece type.
    // Positions beyond pceNum are stale from ClearPiece swaps and never read by the engine.
    // For each piece, compare the set of occupied squares (order doesn't matter — pList
    // is a bag, not a stack).
    for (let pce = 1; pce <= 20; pce++) {
        const nA = a.brd_pceNum[pce];
        const nB = b.brd_pceNum[pce];
        if (nA !== nB) {
            diffs.push(`pceNum for piece ${pce}: ${nA} vs ${nB}`);
            continue;
        }
        if (Number.isNaN(nA)) continue;
        const sqA: number[] = [];
        const sqB: number[] = [];
        for (let i = 0; i < nA; i++) {
            sqA.push(a.brd_pList[pce * 11 + i]);
            sqB.push(b.brd_pList[pce * 11 + i]);
        }
        sqA.sort((x, y) => x - y);
        sqB.sort((x, y) => x - y);
        if (!arrEq(sqA, sqB)) diffs.push(`pList for piece ${pce}: ${sqA} vs ${sqB}`);
    }
    return diffs;
}

export { PIECES, COLOURS, BOOL, NOMOVE };
