import fs from 'node:fs';
import app from './app.js';
import https from 'node:https';
import dotenv from 'dotenv';
import path from 'node:path';
import { mongoConnect } from './services/mongo.js';
import { loadPlanetsData } from './models/planets.model.js'
import { loadLaunchesData } from './models/launches.model.js';
import { fileURLToPath } from 'node:url';

const __filepath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filepath);

dotenv.config({ path: path.join(__dirname, '../.env') })

const PORT = process.env.PORT || 8000;

// Express as a middleware
const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}, app)

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  })
}

startServer();
