import { Hono } from 'hono';
import { registerRoutes } from './routes/index.js';

const app = new Hono();

registerRoutes(app);

export default app;
