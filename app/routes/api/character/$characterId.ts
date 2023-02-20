import { DataFunctionArgs } from '@remix-run/node';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { getCharacterByUUid } from '~/utils/match/match.server';

export type CharacterRoute = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const characterUuid = requireParam('characterId', params);
    return await getCharacterByUUid(characterUuid);
};
