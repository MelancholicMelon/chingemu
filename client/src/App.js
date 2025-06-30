import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// Connect once so every component shares the same socket
const socket = io('http://localhost:3001');

// Sentence the players must type
const TARGET = 'The quick brown fox jumps over the lazy dog.';

export default function App() {
  /* ---------------- CHAT STATE ---------------- */
  const [serverMsg,   setServerMsg] = useState('');   // "welcome" greeting
  const [serverReply, setServerReply] = useState(''); // reply to "hello"
  const [chatLog,     setChatLog]   = useState([]);   // array of {name,message}
  const [name,        setName]      = useState('');   // server‑assigned name
  const [chatInput,   setChatInput] = useState('');   // current chat text

  /* ---------------- GAME STATE ---------------- */
  const [typed,       setTyped]     = useState('');   // what I (this tab) typed
  const [progressMap, setProgress]  = useState({});   // { playerId: { percent, name, error } }

  // stable id for this browser tab
  const playerId = useRef('_' + Math.random().toString(36).slice(2, 10)).current;

  /* ------------- SOCKET LISTENERS ------------- */
  useEffect(() => {
    // Basic greetings
    socket.on('welcome',  (data) => setServerMsg(data));
    socket.on('response', (data) => setServerReply(data));

    // Receive server‑assigned nickname
    socket.on('name_assigned', (nick) => setName(nick));

    // Chat events
    socket.on('receive_message', (data) => setChatLog((prev) => [...prev, data]));

    // Typing‑race events
    socket.on('progress', ({ playerId: id, percent, name, error }) => {
      setProgress((prev) => ({ ...prev, [id]: { percent, name, error } })); // This usestate stores the progress of each player
    });

    return () => {
      socket.off('welcome');
      socket.off('response');
      socket.off('name_assigned');
      socket.off('receive_message');
      socket.off('progress');
    };
  }, []);

  /* ---------------- CHAT ACTIONS ---------------- */
  const handleHello = () => socket.emit('hello');

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || !name) return;
    socket.emit('send_message', { message: text });
    setChatInput('');
  };

  /* ---------------- GAME ACTIONS ---------------- */
  const handleType = (e) => {
    const value = e.target.value;
    setTyped(value);

    // Detect typo: typed string must equal TARGET prefix
    const error = !TARGET.startsWith(value);

    // Keep previous percent so bar freezes when error occurs
    const prevPercent = progressMap[playerId]?.percent || 0;
    let percent = prevPercent;

    if (!error) {
      percent = Math.min(100, Math.floor((value.length / TARGET.length) * 100));
    }

    // Broadcast my state (name will be attached server‑side)
    const payload = {
      playerId,
      percent,
      error,
    };

    socket.emit('progress', payload);

    // Update local immediately so my UI is snappy
    setProgress((prev) => ({ ...prev, [playerId]: { ...payload, name } }));
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans‑serif' }}>

      {/* ---------- LEFT: CHAT ---------- */}
      <aside style={{ width: '33%', minWidth: '260px', borderRight: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
        <h2>Socket.IO Chat</h2>
        <p><strong>Server says on connect:</strong> {serverMsg}</p>
        <button onClick={handleHello}>Send Hello</button>
        <p><strong>Server replied:</strong> {serverReply}</p>

        <hr />
        <h3>Chat (you are <em>{name || '…'}</em>)</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message…"
            style={{ flex: 1 }}
            disabled={!name}
          />
          <button onClick={sendMessage} disabled={!name}>Send</button>
        </div>
        <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
          {chatLog.map((item, idx) => (
            <li key={idx}><strong>{item.name}:</strong> {item.message}</li>
          ))}
        </ul>
      </aside>

      {/* ---------- RIGHT: TYPING RACE ---------- */}
      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <h2>Typing Race</h2>
        <p style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>{TARGET}</p>
        <input
          value={typed}
          onChange={handleType} // On change, we update the value and send progress to server
          placeholder={name ? 'Start typing…' : 'Waiting for name…'}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          disabled={!name}
        />

        {Object.entries(progressMap).map(([id, { percent, name: nick, error }]) => ( // Render all progress from all players
          <div key={id} style={{ marginBottom: '0.75rem' }}> 
            <span style={{ fontSize: '0.8rem', color: '#666' }}>{nick}</span>
            <div style={{ width: '100%', height: '8px', background: '#ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${percent}%`, height: '100%', background: error ? '#f87171' : '#4ade80' }} />
            </div>
          </div>
        ))}
      </main>

    </div>
  );
}
