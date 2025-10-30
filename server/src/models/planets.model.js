import { parse } from 'csv-parse';
import fs from 'node:fs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filepath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filepath);

import planets from './planets.mongo.js';

async function getAllPlanets() {
  return await planets.find({}, {
    '_id': 0,
    '__v': 0
  });
}

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
      .pipe(parse({
        comment: '#',
        columns: true
      }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.error(err)
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      })
  })
}

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name
    }, {
      keplerName: planet.kepler_name
    }, { upsert: true });
  } catch (e) {
    console.error('Could not save planet', e);
  }
}

export {
  loadPlanetsData,
  getAllPlanets,
}
