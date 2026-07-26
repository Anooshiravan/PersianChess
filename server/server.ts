import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 8000;
const ROOT = path.join(__dirname, '..');
const LOCAL_DIR = path.join(__dirname, '..', 'local');
const LOG_FILE = path.join(LOCAL_DIR, 'server.log');

const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.map': 'application/json; charset=utf-8',
};

if (!fs.existsSync(LOCAL_DIR)) {
    fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
function log(msg: string): void {
    console.log(msg);
    logStream.write(`${msg}\n`);
}

const server = http.createServer((req, res) => {
    let urlPath = (req.url ?? '/').split('?')[0];

    if (urlPath === '' || urlPath.endsWith('/')) {
        urlPath = `${urlPath}index.html`;
    }
    if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`;

    const filePath = path.join(ROOT, urlPath);

    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    log(`[${new Date().toISOString()}] ${req.method} ${urlPath}`);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                log('  -> 404 Not Found');
                res.writeHead(404);
                res.end('Not Found');
            } else {
                log(`  -> 500 Server Error: ${err.message}`);
                res.writeHead(500);
                res.end('Server Error');
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
        });
        log(`  -> 200 (${data.length} bytes)`);
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    log(`Server running at http://localhost:${PORT}/`);
    log(`Serving files from: ${ROOT}`);
    log(`Listening on all interfaces (0.0.0.0):${PORT}`);
});

process.on('SIGINT', () => {
    logStream.end();
    server.close();
    process.exit(0);
});
