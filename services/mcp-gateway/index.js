/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('http');
const url = require('url');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = process.cwd();

const ALLOWED = new Set((process.env.MCP_ALLOWED_SERVERS || 'filesystem,fetch,shell')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean));

function serverBinary(name) {
  const map = {
    filesystem: '@modelcontextprotocol/server-filesystem',
    fetch: '@modelcontextprotocol/server-fetch',
    shell: '@modelcontextprotocol/server-shell',
  };
  const pkg = map[name];
  if (!pkg) return null;
  return path.join(ROOT, 'node_modules', pkg, 'dist', 'index.js');
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, allowed: Array.from(ALLOWED) }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, request, client) => {
  const { query } = url.parse(request.url, true);
  const name = (query.server || 'filesystem').toString();
  if (!ALLOWED.has(name)) {
    ws.close(1008, 'server not allowed');
    return;
  }
  const entry = serverBinary(name);
  if (!entry) {
    ws.close(1011, 'server not found');
    return;
  }

  const env = { ...process.env };
  if (name === 'shell' && !('ALLOW_UNSAFE' in env)) {
    env.ALLOW_UNSAFE = '0';
  }

  const child = spawn('node', [entry], { stdio: ['pipe', 'pipe', 'pipe'], env });

  const cleanup = () => {
    try { child.kill('SIGTERM'); } catch (_) {}
  };
  ws.on('close', cleanup);
  ws.on('error', cleanup);

  // Bridge: WS -> child stdin
  ws.on('message', (data) => {
    try {
      if (Buffer.isBuffer(data)) {
        child.stdin.write(data);
      } else {
        child.stdin.write(String(data));
      }
    } catch (_) {}
  });

  // Bridge: child stdout/stderr -> WS
  child.stdout.on('data', (chunk) => {
    try { ws.send(chunk); } catch (_) {}
  });
  child.stderr.on('data', (chunk) => {
    try { ws.send(chunk); } catch (_) {}
  });

  child.on('exit', (code, signal) => {
    try { ws.close(1011, `child exited: ${code || ''} ${signal || ''}`); } catch (_) {}
  });
});

function extractBearer(header) {
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  return m ? m[1] : null;
}

server.on('upgrade', (request, socket, head) => {
  const { pathname, query } = url.parse(request.url, true);
  if (pathname !== '/ws') {
    socket.destroy();
    return;
  }

  const expected = process.env.AUTH_TOKEN || '';
  const headerToken = extractBearer(request.headers['authorization']);
  const qpToken = typeof query?.token === 'string' ? query.token : null;
  const provided = headerToken || qpToken || '';

  if (!expected || provided !== expected) {
    try {
      socket.write('HTTP/1.1 401 Unauthorized\r\n');
      socket.write('Connection: close\r\n');
      socket.write('Content-Type: text/plain; charset=utf-8\r\n');
      socket.write('\r\n');
      socket.write('Unauthorized');
      socket.end();
    } catch (_) {}
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MCP Gateway listening on :${PORT}`);
});
