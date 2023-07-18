import type { DataFunctionArgs } from '@vercel/remix';
import { requirePlayerUuidAsParam, requireUser } from '~/utils/session/session.server';
import { getPlayerNameService } from '~/utils/player/nameservice.server';

export type PlayerDetailsRoute = Awaited<ReturnType<typeof loader>>;
export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const playerId = await requirePlayerUuidAsParam(params);
    return await getPlayerNameService(user, playerId);
};
