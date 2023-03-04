import { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import { Offer, ValorantStoreFront } from '~/models/valorant/store/ValorantStoreFront';
import { DateTime } from 'luxon';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import { RIOT_POINTS_UUID } from '~/config/riot';
import { ValorantStoreOffers } from '~/models/valorant/store/ValorantStoreOffers';

export async function getStoreOffers(user: ValorantUser) {
    const time = getNextStoreRotationTime();
    const cacheExpirationTime = Math.floor(time.diff(DateTime.now(), 'second').get('second'));

    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.store.storefront(user.userData.puuid)
    );
    return await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantStoreFront>(request, {
        key: 'storefront',
        expiration: cacheExpirationTime,
    });
}

export async function getDailyOffers(storefront: ValorantStoreFront) {
    return await Promise.all(
        storefront.SkinsPanelLayout.SingleItemStoreOffers.map(async (offer) => {
            const rewards = await Promise.all(
                offer.Rewards.map(async (reward) => {
                    return getItembyItemId(reward.ItemID);
                })
            );
            return {
                ...offer,
                Cost: getOfferCost(offer),
                Rewards: rewards,
            };
        })
    );
}

export async function getFeaturedOffers(storefront: ValorantStoreFront) {
    return await Promise.all(
        storefront.FeaturedBundle.Bundle.Items.map(async (offer) => {
            const item = await getItembyItemId(offer.Item.ItemID);
            return {
                ...offer,
                Item: item,
            };
        })
    );
}

export async function getNightMarket(storefront: ValorantStoreFront) {
    if (!storefront.BonusStore) {
        return undefined;
    }
    return await Promise.all(
        storefront.BonusStore.BonusStoreOffers.map(async (offer) => {
            const rewards = await Promise.all(
                offer.Offer.Rewards.map((reward) => {
                    return getItembyItemId(reward.ItemID);
                })
            );
            return {
                ...offer,
                Offer: {
                    ...offer.Offer,
                    Rewards: rewards,
                    Cost: getOfferCost(offer.Offer),
                },
            };
        })
    );
}

export async function getItembyItemId(itemId: string) {
    return await new ValorantApiClient().getDatabaseCached<ValorantApiWeaponSkin>(
        valorantApiEndpoints.weapon.skinlevel(itemId),
        {
            key: 'skinlevel',
            expiration: 0,
        }
    );
}

export async function getOfferById(user: ValorantUser, offerId: string) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(endpoints.store.offers);
    const time = getNextStoreRotationTime();
    const cacheExpirationTime = Math.floor(time.diff(DateTime.now(), 'second').get('second'));
    const offers = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantStoreOffers>(request, { key: 'offers', expiration: cacheExpirationTime });
    const offer = offers.Offers.find((offer) => offer.OfferID === offerId);
    if (!offer) return undefined;
    return {
        ...offer,
        Cost: getOfferCost(offer),
    };
}

function getNextStoreRotationTime() {
    const time = DateTime.now();
    if (time.get('hour') >= 1) {
        return DateTime.now().plus({ day: 1 }).set({ hour: 1, minute: 0, second: 0 });
    }
    return time.set({ hour: 1, minute: 0, second: 0 });
}

function getOfferCost(offer: Offer) {
    return offer.Cost[RIOT_POINTS_UUID];
}
