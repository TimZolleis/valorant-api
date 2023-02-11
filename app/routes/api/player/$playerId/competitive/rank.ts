import { LoaderFunction } from '@remix-run/node';
import { requirePlayerUuidAsParam, requireUser } from '~/utils/session/session.server';
import { getPlayerRank } from '~/utils/player/rank.server';

export const loader: LoaderFunction = async ({ request, params }) => {
    const user = await requireUser(request);
    const playerUUid = await requirePlayerUuidAsParam(params);
    return await getPlayerRank(user, playerUUid);
};
