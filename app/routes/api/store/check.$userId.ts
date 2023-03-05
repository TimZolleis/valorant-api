import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireParam } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';
import { checkStore } from '~/utils/store/storereminders.server';

export const loader = async ({ params }: DataFunctionArgs) => {
    const userId = requireParam('userId', params);
    if (!userId) {
        throw json(
            {
                message: 'Please provide a user id',
            },
            400
        );
    }
    const user = await prisma.user.findUnique({ where: { puuid: userId } });
    if (!user) throw json({ message: 'The user was not found' }, { status: 400 });
    const reauthenticationCookies = await prisma.reauthenticationCookies.findUnique({
        where: {
            puuid: userId,
        },
    });
    if (!reauthenticationCookies) {
        throw json(
            {
                message: 'The user has to login to this service first',
            },
            400
        );
    }
    try {
        await checkStore(user, reauthenticationCookies);
        return json({
            message: 'Store checked successfully',
        });
    } catch (e) {
        return json({
            message: 'There was an error checking the store',
            error: e,
        });
    }
};
