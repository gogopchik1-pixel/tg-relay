import { WebSocketServer } from 'ws';
import net from 'net';

const PORT = parseInt(process.env.PORT || '8080');
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'changeme';

const TELEGRAM_DCS = {
  '1': { ip: '149.154.175.53', port: 443 },
  '2': { ip: '149.154.167.51', port: 443 },
  '3': { ip: '149.154.175.100', port: 443 },
  '4': { ip: '149.154.167.91', port: 443 },
  '5': { ip: '149.154.71.14', port: 443 },
};

const wss = new WebSocketServer({ port: PORT, maxPayload: 10 * 1024 * 1024 });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  if (token !== AUTH_TOKEN) {
    ws.close(4001, 'Invalid token');
    return;
  }

  const dcId = url.searchParams.get('dc');
  let targetIp = url.searchParams.get('host') || '149.154.167.51';
  let targetPort = parseInt(url.searchParams.get('port') || '443');

  if (dcId && TELEGRAM_DCS[dcId]) {
    targetIp = TELEGRAM_DCS[dcId].ip;
    targetPort = TELEGRAM_DCS[dcId].port;
  }

  console.log(`[RELAY] ${req.socket.remoteAddress} -> ${targetIp}:${targetPort} (dc=${dcId})`);

  const tcp = net.createConnection({ host: targetIp, port: targetPort });
  let wsClosed = false;
  let tcpClosed = false;

  tcp.on('connect', () => {
    console.log(`[RELAY] TCP connected to ${targetIp}:${targetPort}`);
  });

  tcp.on('data', (data) => {
    if (ws.readyState === 1) {
      ws.send(data);
    }
  });

  tcp.on('close', () => {
    tcpClosed = true;
    if (!wsClosed) ws.close(1000, 'TCP closed');
  });

  tcp.on('error', (err) => {
    console.error(`[RELAY] TCP error: ${err.message}`);
    tcpClosed = true;
    if (!wsClosed) ws.close(1011, 'TCP error');
  });

  ws.on('message', (data) => {
    if (!tcpClosed) {
      tcp.write(data);
    }
  });

  ws.on('close', () => {
    wsClosed = true;
    if (!tcpClosed) tcp.destroy();
  });

  ws.on('error', (err) => {
    console.error(`[RELAY] WS error: ${err.message}`);
    wsClosed = true;
    if (!tcpClosed) tcp.destroy();
  });
});

console.log(`[RELAY] Listening on port ${PORT}`);
