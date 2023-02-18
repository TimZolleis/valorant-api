import { DataFunctionArgs, json } from '@remix-run/node';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import { getMatchMap } from '~/utils/match/match.server';

export type MapRoute = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const mapId = params.mapId;
    if (!mapId) {
        throw json({
            error: 'Parameter map ID required!',
        });
    }
    return await getMatchMap(mapId);
};
