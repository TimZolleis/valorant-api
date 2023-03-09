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

async function getAllSkinLevels() {
    return await new ValorantApiClient().getDatabaseCached<ValorantApiWeaponSkin[]>(
        valorantApiEndpoints.weapon.allSkinlevels,
        {
            key: 'skinlevel',
            expiration: 3600,
        }
    );
}
