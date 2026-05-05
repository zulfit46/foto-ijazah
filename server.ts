import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import multer from 'multer';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google Sheets & Drive Setup
  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ];

  const GAS_URL = process.env.GAS_URL || "https://script.google.com/macros/s/AKfycbxX7neSHURA19qT23PAZdJq_uesgduzODeikKBf1KVxmdvPyGDZPWEZ_HBSUoWVNbw/exec";

  const upload = multer({ storage: multer.memoryStorage() });

  // API Routes
  app.post('/api/login', async (req, res) => {
    try {
      const { nisn, tgl_lahir } = req.body;
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'login', 
          nisn: nisn?.toString().trim(), 
          tgl_lahir: tgl_lahir?.toString().trim() 
        }),
        redirect: 'follow'
      });
      
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error('GAS Response was not JSON:', text);
        res.status(500).json({ 
          success: false, 
          message: 'GAS mengembalikan format non-JSON (HTML). Pastikan Deployment Apps Script sudah diatur ke "Anyone" dan URL sudah benar.' 
        });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'GAS Connection Error: ' + error.message });
    }
  });

  app.post('/api/save-all', upload.single('photo'), async (req: any, res: any) => {
    try {
      const file = req.file;
      let base64 = null;
      let mimetype = null;

      if (file) {
        base64 = file.buffer.toString('base64');
        mimetype = file.mimetype;
      }

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'saveAll', 
          ...req.body,
          mimetype,
          base64
        }),
        redirect: 'follow'
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error('GAS SaveAll Error:', text);
        res.status(500).json({ success: false, message: 'Gagal memproses respon server.' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Koneksi ke server gagal: ' + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
