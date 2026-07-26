#!/usr/bin/env node
// Live-app probe: opens the served app, loads a FEN via set::fen, and prints
// every console.log line the page emits so we can see the exact message flow.

import puppeteer from 'puppeteer';

const FEN =
    process.argv[2] ??
    'f111111111f/1rnbqkb1nr1/1ppp1111pp1/1111p11ps11/11111pp1K11/11111111111/11111111111/111111P1111/1PPPPP1PPP1/1RNBQ1SBNR1/F111111111F w KQkq - 0 1';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

const logs = [];
page.on('console', (msg) => {
    const text = msg.text();
    logs.push(text);
    console.log(text);
});
page.on('pageerror', (err) => console.error('PAGE ERR:', err.message));

await page.goto('http://localhost:8000/', { waitUntil: 'networkidle0' });

// Wait for engine to become ready
await page.waitForFunction(() => window.GameController?.gameActive === true, { timeout: 10000 });

console.log('--- game active, sending set::fen ---');
await page.evaluate((fen) => {
    window.GameController.engine.postMessage('set::variant|Persian');
    window.GameController.engine.postMessage(`set::fen|${fen}`);
}, FEN);

// give the engine and app time to process
await new Promise((r) => setTimeout(r, 1500));

console.log('--- final state ---');
const state = await page.evaluate(() => ({
    gameOver: window.GameController.gameOver,
    reason: window.GameController.gameOverReason,
    sq: window.GameController.gameOverSq,
    dialogOpen: !!document.getElementById('gameover-dialog')?.open,
}));
console.log(JSON.stringify(state, null, 2));

await browser.close();
