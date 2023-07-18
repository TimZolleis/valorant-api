import type { DataFunctionArgs } from '@vercel/remix';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';
import { getItembyItemId } from '~/utils/store/storeoffer.server';
import { DateTime } from 'luxon';
import { ITEM_TYPES } from '~/config/skinlevels.';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const url = new URL(request.url);
    const reminderName = url.searchParams.get('name');
    const offerId = requireParam('offerId', params);
    const item = await getItembyItemId(offerId, ITEM_TYPES.SKINLEVEL);
    return prisma.user.update({
        where: {
            puuid: user.userData.puuid,
        },
        data: {
            reminders: {
                upsert: {
                    where: {
                        offerId,
                    },
                    create: {
                        name: reminderName || item.displayName,
                        offerId,
                        createdAt: DateTime.now().toSeconds().toString(),
                    },
                    update: {
                        name: reminderName || item.displayName,
                        offerId,
                    },
                },
            },
        },
    });
};
