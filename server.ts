import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers from /api folder
import healthHandler from './api/health.js';
import busArrivalHandler from './api/bus-arrival.js';
import generateExcuseHandler from './api/generate-excuse.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Helper adapter for Vercel-style handlers in Express
const adapt = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    await handler(req, res);
  } catch (err: any) {
    console.error('API Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
};

// Mount /api endpoints
app.all('/api/health', adapt(healthHandler));
app.all('/api/health.js', adapt(healthHandler));

app.all('/api/bus-arrival', adapt(busArrivalHandler));
app.all('/api/bus-arrival.js', adapt(busArrivalHandler));

app.all('/api/generate-excuse', adapt(generateExcuseHandler));
app.all('/api/generate-excuse.js', adapt(generateExcuseHandler));

// Configure Vite or serve static files
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CatchUp SG server running on http://0.0.0.0:${PORT}`);
    console.log(`Health endpoint available at http://0.0.0.0:${PORT}/api/health`);
    console.log(`Bus arrival endpoint available at http://0.0.0.0:${PORT}/api/bus-arrival?BusStopCode=04121`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
