import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 10000
  }
});

redisClient.on('connect', () => {
  console.log('Connected to Redis Successfully');
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export default redisClient;
