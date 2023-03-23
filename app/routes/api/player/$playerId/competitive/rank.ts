import type { LoaderFunction } from '@vercel/remix';
import { json } from '@vercel/remix';
import { requirePlayerUuidAsParam, requireUser } from '~/utils/session/session.server';
import { getPlayerRank } from '~/utils/player/rank.server';

export type PlayerRankRoute = {
    rank: Awaited<ReturnType<typeof getPlayerRank>>;
};
export const loader: LoaderFunction = async ({ request, params }) => {
    const user = await requireUser(request);
    const playerUUid = await requirePlayerUuidAsParam(params);
    const rank = await getPlayerRank(user, playerUUid);

    return json<PlayerRankRoute>({
        rank,
    });
};
