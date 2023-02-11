import type { LoaderFunction } from '@remix-run/node';
import { requirePlayerUuidAsParam, requireUser } from '~/utils/session/session.server';
import { getPlayerStatistics } from '~/utils/player/statistics.server';

export const loader: LoaderFunction = async ({ request, params }) => {
    const user = await requireUser(request);
    const playerUUid = await requirePlayerUuidAsParam(params);
    return await getPlayerStatistics(user, playerUUid);
};
