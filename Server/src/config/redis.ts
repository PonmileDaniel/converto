import { createClient } from "redis";
import dotenv from "dotenv";
import { appConfig } from "./app.config";

dotenv.config();

const redisClient = createClient({
  password: appConfig.redis.password,
  socket: {
    host: appConfig.redis.host,
    port: appConfig.redis.port,
    connectTimeout: appConfig.redis.connectTimeout
  }
});

redisClient.on('connect', () => {
  console.log('Connected to Redis Successfully');
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export default redisClient;
