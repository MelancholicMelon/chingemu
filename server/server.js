const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const path      = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'client')));

let anonCounter = 1;                              // running “anonN” counter

io.on('connection', (socket) => {
  const nickname = `anon${anonCounter++}`;
  socket.data.name = nickname;
  socket.emit('name_assigned', nickname); 
  socket.emit('welcome', `Welcome ${nickname}!`);

  console.log('🔌  user', socket.id, '→', nickname);

  socket.on('hello', () => socket.emit('response', 'Hi! Server got your hello.'));

  socket.on('send_message', ({ message }) => {
    io.emit('receive_message', { name: socket.data.name, message });    /* Here is the chat room functionality, sending message to all users */
  });

  socket.on('progress', ({ playerId, percent, error }) => {
    io.emit('progress', { playerId, percent, error, name: socket.data.name });  /* Here is where the progress bar gets broadcasts to every player */
  });

  socket.on('disconnect', () =>
    console.log('❌ ', socket.data.name, 'disconnected'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀  server on http://localhost:${PORT}`));
