const redis = require("redis");
require("dotenv").config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on('connect', () => console.log('Connected to Redis'))

redisClient.connect();

module.exports = redisClient;
