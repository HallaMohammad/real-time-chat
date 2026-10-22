const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));
const users = new Map();
io.on('connection', (socket) => {
  socket.on('join', (name) => {
    const clean = String(name || '').trim().slice(0, 20) || 'Guest';
    users.set(socket.id, clean);
    io.emit('system',clean + ' joined the chat');
    io.emit('online', users.size);
  });
  socket.on('message', (text) => {
    const name = users.get(socket.id);
    const clean = String(text || '').trim().slice(0,500);
    if (!name || !clean) return;
    io.emit('message', {name: name, text: clean, time: Date.now() });
  });
  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    if (name) {
      io.emit('system', name + ' left the chat');
      io.emit('online', users.size);
    }
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));
