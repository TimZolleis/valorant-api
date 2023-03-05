import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import {
    getAuthorizationHeader,
    getDefaultHeaders,
    getEntitlementsHeader,
} from '~/utils/axios/client.server';
import type { RiotRequest } from '~/models/Request';
import { ReauthenticationRequiredException } from '~/exceptions/ReauthenticationRequiredException';
import { RiotServicesUnavailableException } from '~/exceptions/RiotServicesUnavailableException';
import { TooManyRequestsException } from '~/exceptions/TooManyRequestsException';
import type { CacheConfig } from '~/utils/redis/redis.server';
import {
    constructCacheKey,
    getCachedValue,
    getDatabaseCachedValue,
    storeCachedValue,
    storeDatabaseCachedValue,
} from '~/utils/cache/cache.server';

export class RiotGamesApiClient {
    axiosClient: AxiosInstance;
    accessToken: string;
    entitlement: string;

    constructor(accessToken: string, entitlement: string) {
        this.accessToken = accessToken;
        this.entitlement = entitlement;
        this.axiosClient = this.getAxiosClient(accessToken, entitlement);
    }

    async get<T>(
        request: RiotRequest,
        config?: AxiosRequestConfig<any>,
        useFallback = false
    ): Promise<T> {
        const url = useFallback ? request.getFallback().getUrl() : request.getUrl();
        console.log('Fetching', url);
        return this.axiosClient
            .get(url, config)
            .then((response) => response.data)
            .catch((error) => {
                this.handleError(error);
            });
    }

    async post(
        request: RiotRequest,
        body: Object,
        config?: AxiosRequestConfig<any>,
        useFallback = false
    ) {
        const url = useFallback ? request.getFallback().getUrl() : request.getUrl();
        return this.axiosClient
            .post(url, body, config)
            .then((response) => response.data)
            .catch((error) => this.handleError(error));
    }

    async put(
        request: RiotRequest,
        body: Object,
        config?: AxiosRequestConfig<any>,
        useFallback = false
    ) {
        const url = useFallback ? request.getFallback().getUrl() : request.getUrl();
        return this.axiosClient
            .put(url, body, config)
            .then((response) => response.data)
            .catch((error) => this.handleError(error));
    }

    async getCached<T>(
        request: RiotRequest,
        cacheConfig: CacheConfig,
        config?: AxiosRequestConfig<any>,
        useFallback = false
    ): Promise<T> {
        const url = useFallback ? request.getFallback().getUrl() : request.getUrl();
        const key = constructCacheKey(url, cacheConfig.key);
        try {
            return await getCachedValue(key);
        } catch (error: any) {
            const result = await this.get<T>(request, config, useFallback);
            await storeCachedValue<T>(key, cacheConfig.expiration, result);
            return result;
        }
    }

    async putCached<T>(
        request: RiotRequest,
        body: Object,
        cacheConfig: CacheConfig,
        config?: AxiosRequestConfig<any>,
        useFallback = false
    ): Promise<T> {
        const url = useFallback ? request.getFallback().getUrl() : request.getUrl();
        const key = constructCacheKey(url, cacheConfig.key);
        try {
            return await getCachedValue(key);
        } catch (error: any) {
            const result = await this.put(request, body, config, useFallback);
            await storeCachedValue<T>(key, cacheConfig.expiration, result);
            return result;
        }
    }

    async getDatabaseCached<T>(
        request: RiotRequest,
        cacheConfig: CacheConfig,
        config?: AxiosRequestConfig<any>,
        useFallback = false
    ): Promise<T> {
        const url = useFallback ? request.getFallback().getUrl() : request.getUrl();
        const key = constructCacheKey(url, cacheConfig.key);
        try {
            return await getDatabaseCachedValue(key);
        } catch (error: any) {
            const result = await this.get<T>(request, config, useFallback);
            await storeDatabaseCachedValue<T>(key, cacheConfig.expiration, result);
            return result;
        }
    }

    private handleError(error: any) {
        const statusCode = error.response?.status;
        if (statusCode === 400) {
            throw new ReauthenticationRequiredException();
        }
        if (statusCode >= 500) {
            throw new RiotServicesUnavailableException();
        }
        if (statusCode == 429) {
            throw new TooManyRequestsException();
        }
    }

    private getAxiosClient(accessToken: string, entitlement: string, extraHeaders?: {}) {
        return axios.create({
            headers: {
                ...getDefaultHeaders(),
                ...getAuthorizationHeader(accessToken),
                ...getEntitlementsHeader(entitlement),
                ...extraHeaders,
            },
        });
    }
}
