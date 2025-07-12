import { Server } from 'socket.io';

export default function handler(req:any, res:any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    res.socket.server.io = io;
    io.on('connection', (socket) => {
      socket.on('chat:new', (msg) => {
        socket.broadcast.emit('chat:receive', msg);
      });
    });
  }
  res.end();
} 