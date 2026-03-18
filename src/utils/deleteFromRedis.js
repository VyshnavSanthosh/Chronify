import redis from "../utils/redis.js";
async function deleteRedisCache(pattern) {
    try {
        let cursor = "0";

        do {
            const [nextCursor, keys] = await redis.scan(
                cursor,
                "MATCH",
                pattern,
                "COUNT",
                100
            );

            cursor = nextCursor;

            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== "0");

    } catch (error) {
        console.error("Redis cache invalidation error:", error);
    }
}

export { deleteRedisCache };