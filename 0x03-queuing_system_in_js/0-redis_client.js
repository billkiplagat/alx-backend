import redis from 'redis';

// Create a new Redis client
const client = redis.createClient();

// Handle the 'error' event
client.on('error', (err) => {
  console.error(`Redis client not connected to the server: ${err}`);
});

// Handle the 'connect' event
client.on('connect', () => {
  console.log('Redis client connected to the server');
});
