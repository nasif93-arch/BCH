import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('helpline.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    category TEXT,
    description TEXT,
    location TEXT,
    photo TEXT,
    voice TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    message TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();
app.use(express.json({ limit: '50mb' }));

// API Routes
app.post('/api/complaints', (req, res) => {
  const { name, phone, category, description, location, photo, voice } = req.body;
  const id = 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  const stmt = db.prepare('INSERT INTO complaints (id, name, phone, category, description, location, photo, voice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, name, phone, category, description, location, photo, voice);
  
  res.json({ id });
});

app.get('/api/complaints/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM complaints WHERE id = ?');
  const complaint = stmt.get(req.params.id);
  if (complaint) {
    res.json(complaint);
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.get('/api/complaints/user/:phone', (req, res) => {
  const stmt = db.prepare('SELECT * FROM complaints WHERE phone = ? ORDER BY created_at DESC');
  const complaints = stmt.all(req.params.phone);
  res.json(complaints);
});

app.get('/api/notifications', (req, res) => {
  const stmt = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20');
  const notifications = stmt.all();
  res.json(notifications);
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: "You are the official AI assistant for Better Chapainawabgonj Helpline. You help citizens of Chapainawabgonj District, Bangladesh with their public service queries, complaint procedures, and emergency information. Be polite, helpful, and support both English and Bangla. If someone asks about an emergency, advise them to use the SOS button or call 999.",
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// Admin routes (simplified)
app.patch('/api/admin/complaints/:id', (req, res) => {
  const { status } = req.body;
  const stmt = db.prepare('UPDATE complaints SET status = ? WHERE id = ?');
  stmt.run(status, req.params.id);
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
