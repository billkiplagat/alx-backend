import express from 'express';
import { createClient } from 'redis';
import { Queue } from 'kue';
import { promisify } from 'util';

const app = express();
const PORT = 1245;

// Create Redis client
const client = createClient();
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

// Reserve seat function
const reserveSeat = async (number) => {
  await setAsync('available_seats', number);
};

// Get current available seats function
const getCurrentAvailableSeats = async () => {
  const availableSeats = await getAsync('available_seats');
  return parseInt(availableSeats);
};

let reservationEnabled = true;

const queue = new Queue();

// Route to get the number of available seats
app.get('/available_seats', async (_, res) => {
  const numberOfAvailableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: numberOfAvailableSeats.toString() });
});

// Route to reserve a seat
app.get('/reserve_seat', async (_, res) => {
  if (!reservationEnabled) {
    res.json({ status: 'Reservation are blocked' });
    return;
  }

  const job = queue.create('reserve_seat').save((err) => {
    if (err) {
      res.json({ status: 'Reservation failed' });
    } else {
      res.json({ status: 'Reservation in process' });
    }
  });

  job.on('complete', (result) => {
    console.log(`Seat reservation job ${job.id} completed`);
  });

  job.on('failed', (errorMessage) => {
    console.log(`Seat reservation job ${job.id} failed: ${errorMessage}`);
  });
});

// Route to process the queue and reserve seats
app.get('/process', async (_, res) => {
  res.json({ status: 'Queue processing' });

  try {
    const availableSeats = await getCurrentAvailableSeats();
    if (availableSeats <= 0) {
      reservationEnabled = false;
      return;
    }

    await reserveSeat(availableSeats - 1);
  } catch (error) {
    console.error(`Error processing queue: ${error.message}`);
  }
});

app.listen(PORT, async () => {
  try {
    await reserveSeat(50);
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
  }
});

export default app;
