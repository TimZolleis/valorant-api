import { UserData, ValorantUser } from '~/models/user/ValorantUser';
import type {
    ReauthenticationCookies as PrismaReauthenticationCookies,
    User,
} from '@prisma/client';
import { ReauthenticationCookies } from '~/models/cookies/ReauthenticationCookies';
import { RiotReauthenticationClient } from '~/utils/auth/RiotReauthenticationClient';
import { getStoreOffers } from '~/utils/store/storeoffer.server';
import { prisma } from '~/utils/db/db.server';
import { DateTime } from 'luxon';

export async function checkStore(
    user: User,
    reauthenticationCookies: PrismaReauthenticationCookies
) {
    const storeTime = DateTime.now().set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
    const reauthenticationCookieModel = new ReauthenticationCookies(
        reauthenticationCookies.sub,
        reauthenticationCookies.ssid,
        reauthenticationCookies.clid,
        reauthenticationCookies.csid
    );

    const valorantUser = new ValorantUser(
        '',
        '',
        reauthenticationCookieModel,
        new UserData().fromDatabase(user)
    );
    const authenticatedUser = await new RiotReauthenticationClient()
        .init(valorantUser)
        .then((client) => client.reauthenticate());
    const storefront = await getStoreOffers(authenticatedUser);
    storefront.SkinsPanelLayout.SingleItemStoreOffers.forEach((offer) => {
        prisma.offers
            .upsert({
                where: {
                    uniqueDailyOffer: {
                        puuid: user.puuid,
                        offerId: offer.OfferID,
                        date: storeTime.toJSDate(),
                    },
                },
                create: {
                    puuid: user.puuid,
                    offerId: offer.OfferID,
                    type: 'DAILY',
                    date: storeTime.toJSDate(),
                },
                update: {},
            })
            .catch();
    });
    storefront.FeaturedBundle.Bundle.Items.forEach((item) => {
        prisma.offers
            .upsert({
                where: {
                    uniqueDailyOffer: {
                        puuid: user.puuid,
                        offerId: item.Item.ItemID,
                        date: storeTime.toJSDate(),
                    },
                },
                create: {
                    puuid: user.puuid,
                    offerId: item.Item.ItemID,
                    type: 'FEATURED',
                    date: storeTime.toJSDate(),
                },
                update: {},
            })
            .catch();
    });
}
