import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900 });

page.on('console', (m) => {
    const t = m.text();
    if (t.includes('centre-') || t.includes('inCheck') || t.includes('inCheckmate')) console.log('LOG:', t);
});

await page.goto('http://localhost:8000/', { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.GameController?.gameActive === true, { timeout: 10000 });

async function sample(label) {
    const r = await page.evaluate(() => {
        const frames = document.querySelectorAll('.grid-cell.off-board');
        const anomalies = [];
        frames.forEach((el) => {
            const bg = getComputedStyle(el).backgroundColor;
            const bgImage = getComputedStyle(el).backgroundImage;
            const pieceChild = el.querySelector('.piece');
            const cls = el.className;
            const hasHl = /highlight-|selected/.test(cls);
            if (bgImage !== 'none' || pieceChild || hasHl) {
                anomalies.push({ sq: el.dataset.sq, cls, bg, bgImage, hasPiece: !!pieceChild });
            }
        });
        const moves = document.querySelector('#move-list')?.textContent?.trim() ?? '';
        return { anomalyCount: anomalies.length, anomalies, movesPreview: moves.slice(0, 200) };
    });
    console.log(label, JSON.stringify(r));
}

await sample('start');

// start engine autoplay
await page.evaluate(() => {
    window.GameController.engineAutoPlay = true;
    window.GameController.engine.postMessage('do::start_demo');
});

for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    await sample(`after ~${i + 1} demo cycles`);
}

await browser.close();
