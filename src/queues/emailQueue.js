const { Queue } = require("bullmq");
const redis = require("../utils/redis"); // use existing ioredis instance

// Create queue with ioredis client instance
const emailQueue = new Queue("emailQueue", {
    connection: redis
});

module.exports = emailQueue;