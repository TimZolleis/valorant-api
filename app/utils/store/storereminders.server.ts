import type { ValorantUser } from '~/models/user/ValorantUser';
import { getItembyItemId, getStoreOffers } from '~/utils/store/storeoffer.server';
import { prisma } from '~/utils/db/db.server';
import { DateTime } from 'luxon';
import type { Reminder, User } from '@prisma/client';
import { DriftmailClient, Mail, Recipient } from 'driftmail';
import { ITEM_TYPES } from '~/config/skinlevels.';

export async function checkStore(user: ValorantUser) {
    const storeTime = DateTime.now().set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
    const storefront = await getStoreOffers(user);
    storefront.SkinsPanelLayout.SingleItemStoreOffers.forEach((offer) => {
        prisma.offers
            .upsert({
                where: {
                    uniqueDailyOffer: {
                        puuid: user.userData.puuid,
                        offerId: offer.OfferID,
                        date: storeTime.toJSDate(),
                    },
                },
                create: {
                    puuid: user.userData.puuid,
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
                        puuid: user.userData.puuid,
                        offerId: item.Item.ItemID,
                        date: storeTime.toJSDate(),
                    },
                },
                create: {
                    puuid: user.userData.puuid,
                    offerId: item.Item.ItemID,
                    type: 'FEATURED',
                    date: storeTime.toJSDate(),
                },
                update: {},
            })
            .catch();
    });
}

export async function checkIfOfferIsInStore(user: User, offerId: string) {
    const offers = await prisma.offers.findMany({
        where: {
            puuid: user.puuid,
        },
    });
    return !!offers.find((offer) => offer.offerId === offerId);
}

export async function sendReminderEmail(users: User[], reminder: Reminder) {
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
    const recipients = users.map((user) => {
        if (!user.reminder_email)
            throw new Error('The user has not set up an email for receiving reminders');
        return new Recipient(user.reminder_email, {
            playerName: user.gameName,
        });
    });
    mail.addRecipients(recipients);
    const requestId = await new DriftmailClient().send(mail);
    return await prisma.reminderEmail.create({
        data: {
            id: requestId,
        },
    });
}
