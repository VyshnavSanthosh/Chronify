require("dotenv").config();
const { Queue, Worker } = require("bullmq");
const redis = require("../src/utils/redis");

const testQueue = new Queue("testQueue", { connection: redis });

new Worker(
    "testQueue",
    async job => {
        console.log("✔ Worker received job:", job.data);
    },
    { connection: redis }
);

async function addJob() {
    await testQueue.add("example", { message: "Hello Queue!" });
    console.log("✔ Job added to testQueue");
}

addJob();
