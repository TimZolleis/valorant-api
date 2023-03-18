import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/utils/db/db.server';
import { checkIfOfferIsInStore, sendReminderEmail } from '~/utils/store/storereminders.server';
import type { User } from '@prisma/client';

export const loader = async ({ request }: DataFunctionArgs) => {
    const reminders = await prisma.reminder.findMany();
    try {
        const foundReminders = await Promise.all(
            reminders.map(async (reminder) => {
                const foundReminder = await prisma.reminder.findUnique({
                    where: { offerId: reminder.offerId },
                });
                if (!foundReminder) return;
                const users = await prisma.user.findMany({
                    where: {
                        reminders: {
                            some: {
                                id: reminder.id,
                            },
                        },
                    },
                });
                const validatedUsers = await Promise.all(
                    await filter<User>(users, async (user: User) => {
                        return await checkIfOfferIsInStore(user, reminder.offerId);
                    })
                );
                return {
                    reminder,
                    validatedUsers,
                };
            })
        );
        const filteredFoundReminders = foundReminders.filter((reminder) => {
            return reminder?.validatedUsers.length !== 0;
        });
        const sentEmails = await Promise.all(
            filteredFoundReminders.map(async (foundReminder) => {
                if (foundReminder === undefined) return;
                return await sendReminderEmail(
                    foundReminder.validatedUsers,
                    foundReminder.reminder
                );
            })
        );

        return json({
            foundReminders: filteredFoundReminders,
            sentEmails,
        });
    } catch (e) {
        return json({ error: e }, { status: 500 });
    }
};

async function filter<T>(array: Array<T>, callback: (item: T) => Promise<boolean>) {
    const sym = Symbol();
    const toFilter = await Promise.all(
        array.map(async (arrayItem) => {
            const hasPassed = await callback(arrayItem);
            if (!hasPassed) return sym;
            return arrayItem;
        })
    );
    return toFilter.filter((item) => {
        return item !== sym;
    }) as T[];
}
