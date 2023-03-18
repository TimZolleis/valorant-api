import { getRedisInstance } from '~/utils/redis/redis.server';
import { prisma } from '~/utils/db/db.server';

export async function getCachedValue(key: string) {
    console.log('Getting from cache');
    const redis = await getRedisInstance();
    const redisValue = await redis.getValue(key);
    if (!redisValue) {
        throw new Error('Cache miss');
    }
    return JSON.parse(redisValue);
}

export async function storeCachedValue<T>(key: string, expiration: number, value: T) {
    const redis = await getRedisInstance();
    const stringValue = JSON.stringify(value);
    return await redis.setValue(key, expiration, stringValue);
}

export async function storePersistentCachedValue<T>(key: string, value: T) {
    const redis = await getRedisInstance();
    const stringValue = JSON.stringify(value);
    return await redis.setPersistentValue(key, stringValue);
}

export function constructCacheKey(url: string, key: string) {
    return `${url}-${key}`;
}

export async function getDatabaseCachedValue<T>(key: string): Promise<T> {
    const databaseValue = await prisma.cache.findUnique({
        where: {
            key,
        },
    });
    if (!databaseValue) {
        throw new Error('Cache miss');
    }
    let value = databaseValue.value;
    while (typeof value === 'string') {
        value = JSON.parse(value);
    }
    return value as T;
}

export async function storeDatabaseCachedValue<T>(key: string, expiration: number, value: T) {
    const stringValue = JSON.stringify(value);
    const hasValue = await prisma.cache.findUnique({
        where: {
            key,
        },
    });
    if (hasValue) {
        return await prisma.cache.update({
            where: {
                key,
            },
            data: {
                value: stringValue,
            },
        });
    } else {
        return await prisma.cache.create({
            data: {
                key,
                value: stringValue,
            },
        });
    }
}
