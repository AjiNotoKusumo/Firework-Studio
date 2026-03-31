import { Redis } from "ioredis"

const connectionUrl = process.env.REDIS_CONNECTIONURL;

if (!connectionUrl) {
  throw new Error("REDIS_CONNECTIONURL is not defined in environment variables");
}

const redis = new Redis(connectionUrl);

export default redis;