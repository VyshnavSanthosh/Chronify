import { Queue } from "bullmq";
import redis from "../utils/redis.js";

// Create queue with ioredis client instance
const emailQueue = new Queue("emailQueue", {
    connection: redis
});

export default emailQueue;