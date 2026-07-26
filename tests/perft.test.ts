import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { setVariantDefs } from '../src/engine/variants';
import { init_engine } from '../src/engine/init';
import { ParseFen } from '../src/engine/board';
import { S } from '../src/engine/state';
import { Perft } from '../src/engine/perft';

interface Truth {
    [variant: string]: { [depth: string]: number };
}
const truth: Truth = JSON.parse(readFileSync(join(__dirname, 'perft_ground_truth.json'), 'utf8'));

function runPerft(variant: string, depth: number): number {
    setVariantDefs(variant);
    init_engine();
    ParseFen(S.START_FEN);
    S.perft_leafNodes = 0;
    Perft(depth);
    return S.perft_leafNodes;
}

describe('perft parity with old JS engine', () => {
    beforeAll(() => {
        // Silence console output from debuglog / etc during tests.
    });

    for (const variant of ['Persian', 'Pyramid', 'Citadel', 'Oriental']) {
        for (const depth of [1, 2, 3, 4]) {
            it(`${variant} depth ${depth}`, () => {
                const expected = truth[variant][`depth_${depth}`];
                const actual = runPerft(variant, depth);
                expect(actual).toBe(expected);
            });
        }
    }
});
