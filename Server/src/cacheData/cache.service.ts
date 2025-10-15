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
    private ttl: number;

    constructor() {
        this.ttl = Number(process.env.CACHE_TTL) || 3600;
    }

    async get(key: string): Promise<CacheData | null> {
        try {
            const cached = await redisClient.get(key);
            if (!cached) return null;

            const data: CacheData = JSON.parse(cached);

            // Check if the cached data is expired
            if (Date.now() > data.expiresAt) {
                await this.delete(key);
                return null;
            }
            return data;
        } catch (error) {
            console.error("Error getting cache:", error);
            return null;
        }
    }

    async set(key: string, rate: number): Promise<void> {
        try {
            const data: CacheData = {
                rate,
                timestamp: Date.now(),
                expiresAt: Date.now() + (this.ttl * 1000)
            };
            await redisClient.set(key, JSON.stringify(data));
        } catch (error) {
            console.log('Cache set error:', error);            
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.log('Cache delete error:', error);
        }
    }

    generateKey(from: string, to: string): string {
        return `rate:${from}:${to}`;
    }
}