import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { CacheConfig } from '~/utils/redis/redis.server';
import { constructCacheKey, getCachedValue, storeCachedValue } from '~/utils/cache/cache.server';
import process from 'process';
import type { UnofficialValorantApiResponse } from '~/models/unofficial-valorant-api/UnofficialValorantApiResponse';

export class UnofficialValorantApi {
    #client: AxiosInstance;

    constructor() {
        this.#client = axios.create({ baseURL: 'https://api.henrikdev.xyz/valorant' });
        if (process.env.UNOFFICAL_VALORANT_API_KEY) {
            this.#client.defaults.headers.common['Authorization'] =
                process.env.UNOFFICIAL_VALORANT_API_KEY;
        }
        return this;
    }

    private async get<T>(endpoint: string, config?: AxiosRequestConfig) {
        return this.#client.get<UnofficialValorantApiResponse<T>>(endpoint, config);
    }

    async getCached<T>(
        endpoint: string,
        cacheConfig: CacheConfig,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const key = constructCacheKey(endpoint, cacheConfig.key);
        try {
            return await getCachedValue(key);
        } catch (e) {
            const result = await this.#client.get<UnofficialValorantApiResponse<T>>(
                endpoint,
                config
            );
            await storeCachedValue<UnofficialValorantApiResponse<T>>(
                cacheConfig.key,
                cacheConfig.expiration,
                result.data
            );
            return result.data.data;
        }
    }
}
