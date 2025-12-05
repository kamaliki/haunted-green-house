import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const key = 'test-key';
      const data = { value: 'test-data' };
      const ttl = 1000; // 1 second

      service.set(key, data, ttl);
      const retrieved = service.get(key);

      expect(retrieved).toEqual(data);
    });

    it('should return undefined for non-existent key', () => {
      const retrieved = service.get('non-existent-key');
      expect(retrieved).toBeUndefined();
    });

    it('should return undefined for expired data', async () => {
      const key = 'test-key';
      const data = { value: 'test-data' };
      const ttl = 100; // 100ms

      service.set(key, data, ttl);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      const retrieved = service.get(key);
      expect(retrieved).toBeUndefined();
    });

    it('should handle different data types', () => {
      service.set('string', 'test', 1000);
      service.set('number', 42, 1000);
      service.set('array', [1, 2, 3], 1000);
      service.set('object', { a: 1, b: 2 }, 1000);

      expect(service.get('string')).toBe('test');
      expect(service.get('number')).toBe(42);
      expect(service.get('array')).toEqual([1, 2, 3]);
      expect(service.get('object')).toEqual({ a: 1, b: 2 });
    });
  });

  describe('invalidate', () => {
    it('should remove a specific cache entry', () => {
      const key = 'test-key';
      const data = { value: 'test-data' };

      service.set(key, data, 1000);
      expect(service.get(key)).toEqual(data);

      service.invalidate(key);
      expect(service.get(key)).toBeUndefined();
    });

    it('should not throw when invalidating non-existent key', () => {
      expect(() => service.invalidate('non-existent')).not.toThrow();
    });
  });

  describe('invalidatePattern', () => {
    it('should remove all entries matching a pattern', () => {
      service.set('predictions:temp:24', { value: 1 }, 1000);
      service.set('predictions:humidity:24', { value: 2 }, 1000);
      service.set('recommendations:latest', { value: 3 }, 1000);
      service.set('weather:latest', { value: 4 }, 1000);

      service.invalidatePattern('predictions:');

      expect(service.get('predictions:temp:24')).toBeUndefined();
      expect(service.get('predictions:humidity:24')).toBeUndefined();
      expect(service.get('recommendations:latest')).toEqual({ value: 3 });
      expect(service.get('weather:latest')).toEqual({ value: 4 });
    });

    it('should handle pattern with no matches', () => {
      service.set('test-key', { value: 1 }, 1000);

      expect(() => service.invalidatePattern('non-matching')).not.toThrow();
      expect(service.get('test-key')).toEqual({ value: 1 });
    });
  });

  describe('clear', () => {
    it('should remove all cache entries', () => {
      service.set('key1', { value: 1 }, 1000);
      service.set('key2', { value: 2 }, 1000);
      service.set('key3', { value: 3 }, 1000);

      service.clear();

      expect(service.get('key1')).toBeUndefined();
      expect(service.get('key2')).toBeUndefined();
      expect(service.get('key3')).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      service.set('key1', { value: 1 }, 1000);
      service.set('key2', { value: 2 }, 1000);

      const stats = service.getStats();

      expect(stats.entryCount).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('should return empty stats for empty cache', () => {
      const stats = service.getStats();

      expect(stats.entryCount).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });
});
