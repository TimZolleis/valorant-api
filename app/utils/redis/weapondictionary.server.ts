import { prisma } from '~/utils/db/db.server';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantStoreOffers } from '~/models/valorant/store/ValorantStoreOffers';
import { getItembyItemId, getNextStoreRotationTime } from '~/utils/store/storeoffer.server';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import type { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import { DateTime } from 'luxon';
import MiniSearch from 'minisearch';

type SkinInDictionary = {
    id: string;
    displayName: string;
    imageUrl: string;
};

export async function searchWeapons(name: string) {
    return await prisma.skin.findMany({
        where: {
            displayName: {
                search: `${name}*`,
            },
        },
    });
}

export async function storeWeapons(user: ValorantUser) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(endpoints.store.offers);
    const time = getNextStoreRotationTime();
    const cacheExpirationTime = Math.floor(time.diff(DateTime.now(), 'second').get('second'));
    const offers = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantStoreOffers>(request, {
        key: 'offers',
        expiration: cacheExpirationTime,
    });
    offers.Offers.forEach((offer) => {
        offer.Rewards.forEach(async (reward) => {
            const skin = await prisma.skin.findUnique({
                where: {
                    id: reward.ItemID,
                },
            });
            if (!skin) {
                try {
                    const item = await getItembyItemId(reward.ItemID, reward.ItemTypeID);
                    return prisma.skin
                        .create({
                            data: {
                                id: reward.ItemID,
                                displayName: item.displayName,
                                imageUrl: item.displayIcon,
                            },
                        })
                        .catch();
                } catch (e) {}
            }
        });
    });
    const skinLevels = await getAllSkinLevels();
    await Promise.all(
        skinLevels.map(async (skinLevel) => {
            const skin = await prisma.skin.findUnique({ where: { id: skinLevel.uuid } });
            if (
                !skin &&
                !skinLevel.displayName.toLowerCase().includes('level') &&
                skinLevel.levelItem === null
            ) {
                try {
                    return prisma.skin
                        .create({
                            data: {
                                id: skinLevel.uuid,
                                displayName: skinLevel.displayName,
                                imageUrl: skinLevel.displayIcon,
                            },
                        })
                        .catch();
                } catch (e) {}
            }
        })
    );
}

export async function searchSkin(search: string) {
    await prepareSearch();
    return getSearch().search(search) as unknown as SkinInDictionary[];
}

async function prepareSearch() {
    await storeAllSkinlevels();
    weaponDictionary().forEach((skin, uuid) => {
        const item = {
            id: uuid,
            uuid,
            displayName: skin.displayName,
            imageUrl: skin.imageUrl,
        };
        if (!getSearch().has(uuid)) {
            getSearch().add(item);
        }
    });
}

async function storeAllSkinlevels() {
    if (!global.__weaponDictionary) {
        const allSkinlevels = await getAllSkinLevels();
        allSkinlevels.forEach((skinLevel) => {
            if (
                !skinLevel.displayName.toLowerCase().includes('level') &&
                skinLevel.levelItem === null
            ) {
                const value = {
                    id: skinLevel.uuid,
                    displayName: skinLevel.displayName,
                    imageUrl: skinLevel.displayIcon,
                };
                weaponDictionary().set(skinLevel.uuid, value);
            }
        });
    }
}

async function getAllSkinLevels() {
    return await new ValorantApiClient().getDatabaseCached<ValorantApiWeaponSkin[]>(
        valorantApiEndpoints.weapon.allSkinlevels,
        {
            key: 'skinlevel',
            expiration: 3600,
        }
    );
}

function weaponDictionary() {
    if (!global.__weaponDictionary) {
        global.__weaponDictionary = new Map();
    }
    return global.__weaponDictionary;
}

function getSearch() {
    if (!global.__minisearch) {
        global.__minisearch = new MiniSearch<SkinInDictionary>({
            fields: ['displayName'],
            storeFields: ['displayName', 'id', 'imageUrl'],
        });
    }
    return global.__minisearch;
}

declare global {
    var __weaponDictionary: Map<string, SkinInDictionary>;
    var __minisearch: MiniSearch<SkinInDictionary>;
}
