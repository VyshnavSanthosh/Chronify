import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,

});

redis.on("connect", () => {
    console.log("✅ Redis connected");
});

redis.on("error", (err) => {
    console.error("❌ Redis error:", err);
});

redis.on("ready", () => {
    console.log("🚀 Redis is ready to use");
});

redis.on("reconnecting", () => {
    console.log("🔄 Redis reconnecting...");
});

redis.clearProductCache = async () => {
    try {
        const patterns = ["products:*", "product:*"];
        for (const pattern of patterns) {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
                console.log(`✅ Cleared Redis cache for pattern: ${pattern}`);
            }
        }
    } catch (error) {
        console.error("❌ Error clearing Redis cache:", error);
    }
};

export default redis;
