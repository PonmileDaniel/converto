import appConfig from "../config/app.config";
import redisClient from "../config/redis";
import { CacheData } from "../types";

/**
 * CacheService handles caching of currency rates using Redis.
 * 
 * Responsibilities:
 * - Store fetched exchange rates temporarily for fast retrieval.
 * - Retrieve cached data and check if it has expired.
 * - Delete expired or invalid cache entries.
 * - Generate consistent cache keys for currency pairs.
 */

export class CacheService {
    private static instance: CacheService;
    private ttl: number;
    private cachedHealthy: boolean = true;

    private constructor() {
        this.ttl = appConfig.cache.ttl;
    }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    async get(key: string): Promise<CacheData | null> {
        try {
            if (!this.cachedHealthy) {
                console.warn('Cache marked as unhealthy, skipping get operation');
                return null;
            }

            const cached = await redisClient.get(key);
            if (!cached) {
                return null;
            }

            const data: CacheData = JSON.parse(cached);

            if (Date.now() > data.expiresAt) {
                await this.delete(key);
                return null;
            }
            this.cachedHealthy = true;
            return data;
        } catch (error) {
            console.error("Error getting cache:", error);
            this.cachedHealthy = false;
            return null;
        }
    }

    async set(key: string, rate: number): Promise<boolean> {
        try {
            const data: CacheData = {
                rate,
                timestamp: Date.now(),
                expiresAt: Date.now() + (this.ttl * 1000)
            };
            await redisClient.set(key, JSON.stringify(data));
            this.cachedHealthy = true;
            return true;
        } catch (error) {
            console.error('Cache error:', error);
            this.cachedHealthy = false;
            console.warn(`Failed to cache key: ${key} App continue without cache`);
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        try {
            const result = await redisClient.del(key);
            
            if (process.env.NODE_ENV !== 'production') {
                if (result > 0) {
                    console.log(`Deleted cache key: ${key}`);
                } else {
                    console.log(`Key not found for deletion: ${key}`);
                }   
            }
            this.cachedHealthy = true;
            return result > 0;
        } catch (error) {
            console.error('Cache delete error:', error);
            this.cachedHealthy = false;

            console.warn(`Failed to delete cache key: ${key}`);
            return false;

        }
    }

    isHealthy(): boolean {
        return this.cachedHealthy;
    }

    resetHealth(): void {
        this.cachedHealthy = true;
    }

    generateKey(from: string, to: string): string {
        return `rate:${from}:${to}`;
    }
}