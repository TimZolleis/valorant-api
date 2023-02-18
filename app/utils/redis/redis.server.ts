import process from 'process';
import Redis from 'ioredis';

export type CacheConfig = {
    key: string;
    expiration: number;
};

type RedisProvider = 'redis' | 'upstash';

export class RedisConfig {
    provider: RedisProvider;
    databaseUrl: string;
    databasePort: number;
    tlsConfig: Object;

    password: string;

    constructor(provider: RedisProvider) {
        this.provider = provider;
        switch (provider) {
            case 'redis': {
                this.databaseUrl = this.requireEnvironmentVariable('REDIS_URL');
                this.password = this.requireEnvironmentVariable('REDIS_PASSWORD');
                this.databasePort = parseInt(this.requireEnvironmentVariable('REDIS_PORT'));
                this.tlsConfig = {};
                break;
            }
            case 'upstash': {
                this.databaseUrl = this.requireEnvironmentVariable('UPSTASH_URL');
                this.password = this.requireEnvironmentVariable('UPSTASH_PASSWORD');
                this.databasePort = parseInt(this.requireEnvironmentVariable('UPSTASH_PORT'));
                this.tlsConfig = {};
                break;
            }
        }
    }

    private requireEnvironmentVariable(env: string) {
        const envElement = process.env[env];
        if (!envElement) {
            throw new Error('Env not correct');
        }
        return envElement;
    }

    getRedisUrl(useSSL = false) {
        if (useSSL) {
            return `rediss://default:${this.password}@${this.databaseUrl}:${this.databasePort}`;
        }
        return `redis://default:${this.password}@${this.databaseUrl}:${this.databasePort}`;
    }
}

export class RedisClient {
    client: Redis;

    constructor(redisInstance: Redis) {
        this.client = redisInstance;
    }

    async init() {
        await this.client.connect();
        return this;
    }

    async setValue(key: string, expiration: number, value: string) {
        await this.client.setex(key, expiration, value);
    }

    async getValue(key: string) {
        return this.client.get(key);
    }

    async disconnect() {
        await this.client.disconnect();
    }
}

export const getRedisInstance = async (): Promise<RedisClient> => {
    if (!global.__redisClient) {
        global.__redisClient = new RedisClient(getClient());
    }
    return global.__redisClient;
};

function getClient() {
    const config = new RedisConfig('redis');
    return new Redis(config.getRedisUrl(false));
}

export function globalCache() {
    if (!global.__globalCache) {
        global.__globalCache = new Map();
    }
    return global.__globalCache;
}

declare global {
    // This preserves the Redis Client during development
    var __redisClient: RedisClient | undefined;
    var __globalCache: Map<string, string>;
}
