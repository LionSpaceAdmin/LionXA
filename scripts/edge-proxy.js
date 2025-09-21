#!/usr/bin/env node
// Minimal reverse proxy to unify Next.js (3000) + Dashboard Socket.IO (3001) under a single $PORT
const http = require('http');
const net = require('net');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8080);
const UI_PORT = Number(process.env.UI_PORT || 3000);
const WS_PORT = Number(process.env.DASHBOARD_PORT || 3001);
const TARGET_HTTP = { host: '127.0.0.1', port: UI_PORT };
const TARGET_WS = { host: '127.0.0.1', port: WS_PORT };

function pickTarget(req) {
  try {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (u.pathname.startsWith('/socket.io')) return TARGET_WS;
    if (u.pathname === '/api/health') return TARGET_WS;
  } catch {}
  return TARGET_HTTP;
}

const server = http.createServer((req, res) => {
  const target = pickTarget(req);
  const options = {
    hostname: target.host,
    port: target.port,
    method: req.method,
    path: req.url,
    headers: Object.assign({}, req.headers, {
      host: `${target.host}:${target.port}`,
      'x-forwarded-proto': 'https',
    }),
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (err) => {
    res.statusCode = 502;
    res.end(`Proxy error: ${err.message}`);
  });
  req.pipe(proxyReq);
});

server.on('upgrade', (req, socket, head) => {
  const target = pickTarget(req);
  const upstream = net.connect(target.port, target.host, () => {
    socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
                 'Connection: Upgrade\r\n' +
                 'Upgrade: websocket\r\n' +
                 '\r\n');
    upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });
  upstream.on('error', () => socket.destroy());
});

server.listen(PORT, () => {
  console.log(`[edge-proxy] listening on :${PORT}, proxying /socket.io -> ${WS_PORT}, other -> ${UI_PORT}`);
});
