import axios from 'axios';
import launches from './launches.mongo.js';
import planets from './planets.mongo.js';

const DEFAULT_FLIGHT_NUMBER = 1

async function getLatestFlightNumber() {
  const latestLaunch = await launches
    .findOne()
    .sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find({}, { '_id': 0, '__v': 0, })
    .skip(skip)
    .limit(limit)
    .sort({ flightNumber: 1 })
}

async function saveLaunch(launch) {
  try {
    await launches.findOneAndUpdate({
      flightNumber: launch.flightNumber,
    }, launch, { upsert: true })
  } catch (e) {
    console.error('Could not save launch', e);
  }
}


async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target
  })

  if (!planet) {
    throw new Error('No matching planet was found');
  }

  const newFlightNumber = await getLatestFlightNumber() + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['ZTM', 'NASA'],
    flightNumber: newFlightNumber
  })

  return await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne({
    flightNumber: launchId,
  }, {
    upcoming: false,
    success: false,
  });
  return aborted.modifiedCount === 1;
}

const SPACEX_API_URL = 'https://api.spacexdata.com'

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })

  if (firstLaunch) {
    console.log('Launch data already exists');
  } else {
    await populateLaunches()
  }
}

async function populateLaunches() {
  const response = await axios.post(`${SPACEX_API_URL}/v4/launches/query`, {
    "query": {},
    "options": {
      "pagination": false,
      "populate": [
        {
          "path": "rocket",
          "select": {
            "name": 1
          }
        },
        {
          "path": "payloads",
          "select": {
            "customers": 1
          }
        }
      ]
    }
  })

  if (response.status !== 200) {
    console.error('Problem downloading launch data');
    throw new Error('Launch data download failed')
  }

  const launchDocs = response.data.docs
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers']
    })

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    }
    await saveLaunch(launch)
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  })
}
export {
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  loadLaunchesData,
}
