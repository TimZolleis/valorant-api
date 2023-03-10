import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import { checkStore } from '~/utils/store/storereminders.server';

export const loader = async ({ request }: DataFunctionArgs) => {
    const users = await prisma.user.findMany();
    try {
        const errors = await Promise.all(
            users.map(async (user) => {
                const reauthenticatedUser = await getReauthenticatedUser(user);
                await checkStore(reauthenticatedUser);
            })
        );
        return json({
            message: 'All user stores checked successfully',
            errors,
        });
    } catch (e) {
        throw e;
    }
};
