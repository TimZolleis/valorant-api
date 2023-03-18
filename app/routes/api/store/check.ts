import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import { checkStore } from '~/utils/store/storereminders.server';
import { DateTime } from 'luxon';

export const loader = async ({ request }: DataFunctionArgs) => {
    const users = await prisma.user.findMany();
    const failedChecks: string[] = [];
    const successfulChecks: string[] = [];
    const offers = await Promise.all(
        users.map(async (user) => {
            try {
                const reauthenticatedUser = await getReauthenticatedUser(user);
                const { daily, featured } = await checkStore(reauthenticatedUser);
                successfulChecks.push(user.puuid);
                return {
                    user: user.puuid,
                    date: DateTime.now()
                        .setLocale('de-DE')
                        .toLocaleString(DateTime.DATETIME_HUGE_WITH_SECONDS),
                    daily,
                    featured,
                };
            } catch (e) {
                failedChecks.push(user.puuid);
            }
        })
    );
    return json({
        message: 'Ran store checks for all users',
        successfulChecks,
        failedChecks,
        offers,
    });
};
