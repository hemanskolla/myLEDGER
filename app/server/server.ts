import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: './server/.env' });

import './db.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/contacts', contactRoutes);

const distPath = path.join(__dirname, '../client/dist');
const indexHtml = path.join(distPath, 'index.html');

if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*$/, (_req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  app.get('/', (_req, res) => {
    res.status(503).send(
      '<h2>Client not built</h2>' +
      '<p>Run <code>npm run build</code> in the <code>app/</code> directory, then restart the server.</p>' +
      '<p>For development with hot reload, use <code>npm run start</code> instead.</p>'
    );
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
