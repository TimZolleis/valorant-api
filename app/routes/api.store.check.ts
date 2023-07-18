import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import { checkStore } from '~/utils/store/storereminders.server';
import { DateTime } from 'luxon';

export const loader = async ({ request }: DataFunctionArgs) => {
    const startTime = DateTime.now();
    const users = await prisma.user.findMany();
    const failedChecks: Object[] = [];
    const successfulChecks: string[] = [];
    const offers = await Promise.all(
        users.map(async (user) => {
            try {
                const reauthenticatedUser = await getReauthenticatedUser(user);
                const { daily, featured } = await checkStore(reauthenticatedUser);
                successfulChecks.push(user.puuid);
                console.log(`Check for ${user.puuid} was successful`);
                return {
                    user: user.puuid,
                    date: DateTime.now()
                        .setLocale('de-DE')
                        .toLocaleString(DateTime.DATETIME_HUGE_WITH_SECONDS),
                    daily,
                    featured,
                };
            } catch (e) {
                console.log(`Check for ${user.puuid} failed because of ${e}`);
                failedChecks.push({
                    user: user.puuid,
                    error: e,
                });
            }
        })
    );
    const endTime = DateTime.now();
    const diff = endTime.diff(startTime, ['milliseconds']).milliseconds;
    return json({
        message: `Ran store checks for all users in ${diff}ms`,
        successfulChecks,
        failedChecks,
        offers,
    });
};
