import { CacheService } from '../../services/cache.service';
import redisClient from '../../config/redis';
const mockRedisClient = redisClient as jest.Mocked<typeof redisClient>;

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = CacheService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = CacheService.getInstance();
      const instance2 = CacheService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('get', () => {
    it('should return cached data when valid', async () => {
      const cacheData = {
        rate: 1.5,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000
      };
      
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cacheData));

      const result = await cacheService.get('USD:EUR');
      
      expect(result).toEqual(cacheData);
      expect(mockRedisClient.get).toHaveBeenCalledWith('USD:EUR');
    });

    it('should return null when cache miss', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get('USD:EUR');
      
      expect(result).toBeNull();
    });

    it('should return null when cache expired', async () => {
      const expiredData = {
        rate: 1.5,
        timestamp: Date.now(),
        expiresAt: Date.now() - 1000
      };
      
      mockRedisClient.get.mockResolvedValue(JSON.stringify(expiredData));
      mockRedisClient.del.mockResolvedValue(1);

      const result = await cacheService.get('USD:EUR');
      
      expect(result).toBeNull();
      expect(mockRedisClient.del).toHaveBeenCalledWith('USD:EUR');
    });

    it('should handle redis errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheService.get('USD:EUR');
      
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should cache data successfully', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      const result = await cacheService.set('USD:EUR', 1.5);
      
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'USD:EUR', 
        expect.stringContaining('"rate":1.5')
      );
    });

    it('should handle redis errors gracefully', async () => {
      mockRedisClient.set.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheService.set('USD:EUR', 1.5);
      
      expect(result).toBe(false);
    });
  });

  describe('generateKey', () => {
    it('should generate consistent cache keys', () => {
      const key1 = cacheService.generateKey('USD', 'EUR');
      const key2 = cacheService.generateKey('USD', 'EUR');
      
      expect(key1).toBe('rate:USD:EUR');
      expect(key1).toBe(key2);
    });
  });
});