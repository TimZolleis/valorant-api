import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { Offer, ValorantStoreFront } from '~/models/valorant/store/ValorantStoreFront';
import { DateTime } from 'luxon';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import type { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { RIOT_POINTS_UUID } from '~/config/riot';
import type { ValorantStoreOffers } from '~/models/valorant/store/ValorantStoreOffers';
import { v4 as uuidv4 } from 'uuid';
import { itemTypeToValorantApiUrl } from '~/config/skinlevels.';

function getGenericWeapon() {
    return {
        uuid: uuidv4(),
        displayName: 'Weapon not available',
        levelItem: null,
        displayIcon:
            'https://media.valorant-api.com/weaponskinlevels/1ab72e66-4da3-33a0-164f-908113e075a4/displayicon.png',
        streamedVideo: null,
        assetPath:
            'ShooterGame/Content/Equippables/Guns/Rifles/AK/Standard/AssaultRifle_AK_Standard_Lv1_PrimaryAsset',
    };
}

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

export async function getAllStoreOffers(user: ValorantUser) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(endpoints.store.offers);
    const offers = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantStoreOffers>(request, {
        key: 'storeoffers',
        expiration: 86400,
    });
    return await Promise.all(
        offers.Offers.map((offer) => {
            return Promise.all(
                offer.Rewards.map(async (reward) => {
                    try {
                        return await getItembyItemId(reward.ItemID, reward.ItemTypeID);
                    } catch (e) {
                        return getGenericWeapon();
                    }
                })
            );
        })
    );
}

export async function getDailyOffers(storefront: ValorantStoreFront) {
    return await Promise.all(
        storefront.SkinsPanelLayout.SingleItemStoreOffers.map(async (offer) => {
            const rewards = await Promise.all(
                offer.Rewards.map(async (reward) => {
                    try {
                        return getItembyItemId(reward.ItemID, reward.ItemTypeID);
                    } catch (e) {
                        return getGenericWeapon();
                    }
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
            try {
                const item = await getItembyItemId(offer.Item.ItemID, offer.Item.ItemTypeID);
                return {
                    ...offer,
                    Item: item,
                };
            } catch (e) {
                console.log(e);
                console.log('Type', offer.Item.ItemTypeID);
                console.log('Item', offer.Item.ItemID);

                return {
                    ...offer,
                    Item: getGenericWeapon(),
                };
            }
        })
    );
}

export async function getNightMarket(storefront: ValorantStoreFront) {
    if (!storefront.BonusStore) {
        throw new Error('Night market not available');
    }
    return await Promise.all(
        storefront.BonusStore.BonusStoreOffers.map(async (offer) => {
            const rewards = await Promise.all(
                offer.Offer.Rewards.map((reward) => {
                    try {
                        return getItembyItemId(reward.ItemID, reward.ItemTypeID);
                    } catch (e) {
                        return getGenericWeapon();
                    }
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

export async function getItembyItemId(itemId: string, itemTypeId: string) {
    const url = itemTypeToValorantApiUrl[itemTypeId](itemId);
    if (!url) throw new Error('The provided itemTypeId is invalid');
    return await new ValorantApiClient().getDatabaseCached<ValorantApiWeaponSkin>(url, {
        key: 'skinlevel',
        expiration: 0,
    });
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

export function getNextStoreRotationTime() {
    const time = DateTime.now();
    if (time.get('hour') < 1) {
        return time.set({ hour: 1, minute: 0, second: 0 });
    }
    return DateTime.now().plus({ day: 1 }).set({ hour: 1, minute: 0, second: 0 });
}

function getOfferCost(offer: Offer) {
    return offer.Cost[RIOT_POINTS_UUID];
}
