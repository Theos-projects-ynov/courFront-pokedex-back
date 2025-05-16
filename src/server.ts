import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { setupWebSocketServer } from './config/ws';

const port = process.env.PORT || 3000;
const wsPort = process.env.WS_PORT || 3001;

app.listen(port, () => {
  console.log(`REST API running on http://localhost:${port}`);
});

setupWebSocketServer(wsPort);
