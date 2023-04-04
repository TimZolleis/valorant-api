import type { ValorantUser } from '~/models/user/ValorantUser';
import { getItembyItemId, getStoreFront, getStoreOffers } from '~/utils/store/storeoffer.server';
import { prisma } from '~/utils/db/db.server';
import { DateTime } from 'luxon';
import type { Reminder, User } from '@prisma/client';
import { DriftmailClient, Mail, Recipient } from 'driftmail';
import { ITEM_TYPES } from '~/config/skinlevels.';
import type {
    FeaturedItem,
    SingleItemStoreOffer,
} from '~/models/valorant/store/ValorantStoreFront';
import type { Offer } from '~/models/valorant/store/ValorantStoreOffers';
import { log } from '@remix-run/dev/dist/logging';

async function parseDailyItems(user: ValorantUser, storeFrontOffers: SingleItemStoreOffer[]) {
    const storeTime = DateTime.now()
        .set({
            hour: 1,
            minute: 0,
            second: 0,
            millisecond: 0,
        })
        .toSeconds();
    return await Promise.all(
        storeFrontOffers.map(async (offer) => {
            return await Promise.all(
                offer.Rewards.map((reward) => {
                    return prisma.offers
                        .upsert({
                            where: {
                                uniqueDailyOffer: {
                                    puuid: user.userData.puuid,
                                    offerId: reward.ItemID,
                                    date: storeTime,
                                },
                            },
                            update: {},
                            create: {
                                puuid: user.userData.puuid,
                                offerId: offer.OfferID,
                                date: storeTime,
                                itemTypeId: reward.ItemTypeID,
                                type: 'DAILY',
                            },
                        })
                        .catch((e) => console.log('Error inserting daily offers', e));
                })
            );
        })
    );
}

async function parseFeaturedItems(user: ValorantUser, featuredOffers: FeaturedItem[]) {
    const storeTime = DateTime.now()
        .set({
            hour: 1,
            minute: 0,
            second: 0,
            millisecond: 0,
        })
        .toSeconds();

    return await Promise.all(
        featuredOffers.map((offer) => {
            return prisma.offers
                .upsert({
                    where: {
                        uniqueDailyOffer: {
                            puuid: user.userData.puuid,
                            offerId: offer.Item.ItemID,
                            date: storeTime,
                        },
                    },
                    update: {},
                    create: {
                        puuid: user.userData.puuid,
                        offerId: offer.Item.ItemID,
                        itemTypeId: offer.Item.ItemTypeID,
                        date: storeTime,
                        type: 'FEATURED',
                    },
                })
                .catch((e) => console.log('Error inserting featured offers', e));
        })
    );
}

export async function checkStore(user: ValorantUser) {
    const storeFront = await getStoreFront(user);
    const daily = await parseDailyItems(user, storeFront.SkinsPanelLayout.SingleItemStoreOffers);
    const featured = await parseFeaturedItems(user, storeFront.FeaturedBundle.Bundle.Items);
    return { featured, daily };
}

export async function checkIfOfferIsInStore(user: User, offerId: string) {
    const offers = await prisma.offers.findMany({
        where: {
            puuid: user.puuid,
        },
    });
    return !!offers.find((offer) => offer.offerId === offerId);
}

export async function sendReminderEmail(user: User, reminder: Reminder) {
    const item = await getItembyItemId(reminder.offerId, ITEM_TYPES.SKINLEVEL);
    const mail = new Mail('StoreReminder');
    mail.addVariables([
        {
            itemName: item.displayName,
        },
        {
            reminderName: reminder.name,
        },
        {
            itemImage: item.displayIcon,
        },
    ]);
    if (!user.reminder_email)
        throw new Error('The user has not set up an email for receiving reminders');

    const recipient = new Recipient(user.reminder_email, {
        playerName: user.gameName,
    });
    mail.addRecipient(recipient);
    const requestId = await new DriftmailClient().send(mail);
    return { user, reminder, requestId };
}
