import { CacheService } from "../../services/cache.service";
import redisClient from "../../config/redis";

const mockRedisClient = redisClient as jest.Mocked<typeof redisClient>;

describe("CacheService", () => {
    let cacheService: CacheService;

    beforeEach(() => {
        cacheService = CacheService.getInstance();
        jest.clearAllMocks();
    });

    describe("getInstance", () => {
        it("should return the same instance", () => {
            const instance1 = CacheService.getInstance();
            const instance2 = CacheService.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe("get", () => {
        it("should return cached data when valid", async () => {
            const cachedData = {
                rate: 1.5,
                timestamp: Date.now(),
                expiresAt: Date.now() + 10000
            }
            mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(cachedData));

            const result = await cacheService.get("USD:EUR");
            expect(result).toEqual(cachedData);
            expect(mockRedisClient.get).toHaveBeenCalledWith("USD:EUR");
        })

        it("should return null when cache is missing", async () => {
            
        })
    });
})