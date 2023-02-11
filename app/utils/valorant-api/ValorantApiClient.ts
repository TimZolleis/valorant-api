import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { ValorantApiNotAvailableException } from '~/exceptions/ValorantApiNotAvailableException';
import type { CacheConfig } from '~/utils/redis/redis.server';
import {
    constructCacheKey,
    getCachedValue,
    getDatabaseCachedValue,
    storeCachedValue,
    storeDatabaseCachedValue,
} from '~/utils/cache/cache.server';

export class ValorantApiClient {
    axiosClient: AxiosInstance;
    static BASE_URL = 'https://valorant-api.com/v1';

    constructor() {
        this.axiosClient = axios.create({
            baseURL: ValorantApiClient.BASE_URL,
        });
    }

    async get<T>(url: string): Promise<T> {
        return this.axiosClient
            .get(url)
            .then((response) => response.data.data)
            .catch((error) => {
                throw new ValorantApiNotAvailableException();
            });
    }
    async getCached<T>(url: string, cacheConfig: CacheConfig): Promise<T> {
        const key = constructCacheKey(url, cacheConfig.key);
        try {
            return await getCachedValue(key);
        } catch (error: any) {
            const result = await this.get<T>(url);
            await storeCachedValue<T>(key, cacheConfig.expiration, result);
            return result;
        }
    }
    async getDatabaseCached<T>(url: string, cacheConfig: CacheConfig): Promise<T> {
        const key = constructCacheKey(url, cacheConfig.key);
        try {
            console.log('Returning cached from DB');
            return await getDatabaseCachedValue<T>(key);
        } catch (error: any) {
            const result = await this.get<T>(url);
            await storeDatabaseCachedValue<T>(key, cacheConfig.expiration, result);
            return result;
        }
    }
}
