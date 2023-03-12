import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import { checkStore } from '~/utils/store/storereminders.server';

export const loader = async ({ request }: DataFunctionArgs) => {
    const users = await prisma.user.findMany();
    const failedChecks: string[] = [];
    const successfulChecks: string[] = [];
    await Promise.all(
        users.map(async (user) => {
            try {
                const reauthenticatedUser = await getReauthenticatedUser(user);
                await checkStore(reauthenticatedUser);
                successfulChecks.push(user.puuid);
            } catch (e) {
                failedChecks.push(user.puuid);
            }
        })
    );
    return json({
        message: 'Ran store checks for all users',
        successfulChecks,
        failedChecks,
    });
};
