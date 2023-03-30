import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { CacheConfig } from '~/utils/redis/redis.server';
import { constructCacheKey, getCachedValue, storeCachedValue } from '~/utils/cache/cache.server';

export class UnofficialValorantApi {
    #client: AxiosInstance;

    constructor() {
        this.#client = axios.create({ baseURL: 'https://api.henrikdev.xyz/valorant' });
    }

    private async get<T>(endpoint: string, config?: AxiosRequestConfig) {
        return this.#client.get<T>(endpoint, config);
    }

    private async getCached<T>(
        endpoint: string,
        cacheConfig: CacheConfig,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const key = constructCacheKey(endpoint, cacheConfig.key);
        try {
            return await getCachedValue(key);
        } catch (e) {
            const result = await this.#client.get<T>(endpoint, config);
            await storeCachedValue<T>(cacheConfig.key, cacheConfig.expiration, result.data);
            return result.data;
        }
    }
}
