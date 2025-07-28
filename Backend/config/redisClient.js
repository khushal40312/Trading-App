

const { createClient } = require('redis');

const redisClient = createClient({
  username: 'default',
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_CLOUD_URL,
    port: 14966
  }
});

redisClient.on('error', err => console.log('Redis Client Error', err));
(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
  }
})();


module.exports = redisClient;
