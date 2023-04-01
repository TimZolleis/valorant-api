import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { CacheConfig } from '~/utils/redis/redis.server';
import { constructCacheKey, getCachedValue, storeCachedValue } from '~/utils/cache/cache.server';
import type { ZodObject, ZodRawShape } from 'zod';
import { a } from '@vercel/edge-config/dist/types-134f6530';

export class UnofficialValorantApi {
    #client: AxiosInstance;

    constructor() {
        this.#client = axios.create({ baseURL: 'https://api.henrikdev.xyz/valorant' });
        return this;
    }

    private async get<T>(endpoint: string, config?: AxiosRequestConfig) {
        return this.#client.get<T>(endpoint, config);
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
            const result = await this.#client.get<T>(endpoint, config);
            await storeCachedValue<T>(cacheConfig.key, cacheConfig.expiration, result.data);
            return result.data;
        }
    }
}

class UnofficialValorantApiEndpoint<T extends ZodRawShape> {
    readonly #url: string;
    #responseBody: ZodObject<T>;

    constructor(url: string, responseBody: ZodObject<T>) {
        this.#url = url;
        this.#responseBody = responseBody;
    }

    async fetch() {
        const res = await new UnofficialValorantApi().getCached<T>(this.#url, {
            key: this.#url,
            expiration: 86400,
        });
        return this.#responseBody.parse(res);
    }
}
