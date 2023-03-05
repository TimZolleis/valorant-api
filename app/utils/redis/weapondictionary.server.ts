import { prisma } from '~/utils/db/db.server';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantStoreOffers } from '~/models/valorant/store/ValorantStoreOffers';
import { of } from 'rxjs';
import { getItembyItemId } from '~/utils/store/storeoffer.server';

export async function searchWeapons(name: string) {
    return await prisma.skin.findMany({
        where: {
            displayName: {
                search: name,
            },
        },
    });
}

export async function storeWeapons(user: ValorantUser) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(endpoints.store.offers);
    const offers = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantStoreOffers>(request, {
        key: 'storeoffers',
        expiration: 86400,
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
                    const item = await getItembyItemId(reward.ItemID);
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
}
