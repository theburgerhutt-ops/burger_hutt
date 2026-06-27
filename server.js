const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Internal endpoint for Next API route to trigger socket events
    if (parsedUrl.pathname === '/_internal/socket-emit' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          io.emit(payload.event, payload.data);
          res.writeHead(200);
          res.end('Emitted');
        } catch (e) {
          res.writeHead(400);
          res.end('Bad Request');
        }
      });
      return;
    }

    if (parsedUrl.pathname.startsWith('/socket.io')) {
      return;
    }

    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to socket.io');
    socket.on('disconnect', () => {
      console.log('Client disconnected from socket.io');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
