import type { LoaderFunction } from '@vercel/remix';
import { json } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import { ValorantApiClient } from '~/utils/valorant-api/valorant-api.server';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';

function requireMatchId(request: Request) {
    const matchId = new URL(request.url).searchParams.get('matchId');
    if (!matchId) {
        throw json(
            {
                error: 'Please provide a match id as query param',
            },
            { status: 400 }
        );
    }
    return matchId;
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUser(request);
    const matchId = requireMatchId(request);
    const includeMap = new URL(request.url).searchParams.get('includeMap');
    const riotRequest = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.match.details(matchId)
    );
    const result = await new RiotGamesApiClient(user.accessToken, user.entitlement).getCached(
        riotRequest,
        {
            key: 'match-details',
            expiration: 3600,
        }
    );
    if (includeMap) {
        const maps = await new ValorantApiClient().getCached(valorantApiEndpoints.maps, {
            key: 'maps',
            expiration: 3600,
        });
    }
};
