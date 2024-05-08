import redis from 'redis';

const client = redis.createClient();

client.on('error', (err) => {
  console.error(`Redis client not connected to the server: ${err}`);
});

// Create Hash function with object
function createHash() {
  const keyValues = {
    Portland: 50,
    Seattle: 80,
    'New York': 20,
    Bogota: 20,
    Cali: 40,
    Paris: 2,
  };

  for (const key of Object.keys(keyValues)) {
    client.hset(
      'HolbertonSchools',
      key,
      keyValues[key],
      redis.print,
    );
  }
}

function displayHash() {
  client.hgetall('HolbertonSchools', (error, object) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log(object);
    }
  });
}

client.on('connect', () => {
  console.log('Redis client connected to the server');
  createHash();
  displayHash();
});
