import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import type { Reminder, User } from '@prisma/client';
import { DateTime } from 'luxon';
import { sendReminderEmail } from '~/utils/store/storereminders.server';

type FoundReminder = {
    user: User;
    reminder: Reminder;
};

async function getDailyUserOffersByOfferId(user: User, offerId: string) {
    return await prisma.offers.findMany({ where: { puuid: user.puuid, offerId } }).then((offers) =>
        offers.find((offer) => {
            const offerDate = DateTime.fromSeconds(offer.date);
            const difference = DateTime.now().diff(offerDate);
            return difference.as('hour') <= 24;
        })
    );
}

async function checkReminderForUsers(reminder: Reminder, users: User[]) {
    const foundReminders: FoundReminder[] = [];
    // Map through users
    for (const user of users) {
        const hasOffers = !!(await getDailyUserOffersByOfferId(user, reminder.offerId));
        if (hasOffers) {
            foundReminders.push({ user, reminder });
        }
    }
    return foundReminders;
}

export const loader = async ({ request }: DataFunctionArgs) => {
    try {
        const remindersWithUsers = await prisma.reminder.findMany({
            include: {
                users: true,
            },
        });
        const totalFoundReminders: FoundReminder[] = [];
        // Map through reminders and check if anyone got it in store
        for (const reminderWithUser of remindersWithUsers) {
            const foundReminders = await checkReminderForUsers(
                reminderWithUser,
                reminderWithUser.users
            );
            totalFoundReminders.push(...foundReminders);
        }
        const sentEmails: { user: User; reminder: Reminder; requestId: string }[] = [];
        const failedEmails: { user: User; reminder: Reminder }[] = [];
        //Map through found reminders and send email
        for (const userWithReminder of totalFoundReminders) {
            try {
                const sentEmail = await sendReminderEmail(
                    userWithReminder.user,
                    userWithReminder.reminder
                );
                sentEmails.push(sentEmail);
            } catch (e) {
                failedEmails.push({
                    user: userWithReminder.user,
                    reminder: userWithReminder.reminder,
                });
            }
        }
        return json({ message: 'Successfully ran reminder checks', sentEmails, failedEmails });
    } catch (e) {
        return json(
            { message: 'Encountered an error running reminder checks', error: e },
            { status: 500 }
        );
    }
};
