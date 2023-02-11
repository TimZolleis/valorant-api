import type { LoaderFunction } from '@remix-run/node';
import { requirePlayerUuidAsParam, requireUser } from '~/utils/session/session.server';
import { getPlayerStatistics } from '~/utils/player/statistics.server';
import { json } from '@remix-run/node';

export type PlayerStatisticsRoute = {
    statistics: Awaited<ReturnType<typeof getPlayerStatistics>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const user = await requireUser(request);
    const playerUUid = await requirePlayerUuidAsParam(params);
    const statistics = await getPlayerStatistics(user, playerUUid);
    return json({
        statistics,
    });
};
