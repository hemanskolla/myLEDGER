import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: './.env' });

import './db.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.SERVER_PORT ?? 8000;
const app = express();

app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/contacts', contactRoutes);

// Serve the Vite build in production
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));
app.get(/^(?!\/api).*$/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
