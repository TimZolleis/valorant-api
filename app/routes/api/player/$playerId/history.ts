import type { LoaderFunction } from '@remix-run/node';
import {
    requirePlayerUuid,
    requirePlayerUuidAsParam,
    requireUser,
} from '~/utils/session/session.server';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantMatchHistory } from '~/models/valorant/match/ValorantMatchHistory';
import { getCharacterByUUid, getMatchDetails, getMatchMap } from '~/utils/match/match.server';
import type { ValorantMatchDetails } from '~/models/valorant/match/ValorantMatchDetails';
import type { ValorantApiMap } from '~/models/valorant-api/ValorantApiMap';

async function getRelevantMatchData(
    puuid: string,
    matchDetails: ValorantMatchDetails,
    matchMap: ValorantApiMap
) {
    const player = matchDetails.players.find((player) => {
        return player.subject === puuid;
    });
    const playerTeam = matchDetails.teams.find((team) => {
        return team.teamId === player?.teamId;
    });

    const enemyTeam = matchDetails.teams.find((team) => {
        return team.teamId !== player?.teamId;
    });

    const character = player?.characterId ? await getCharacterByUUid(player?.characterId) : null;
    const playerDetails = {
        subject: player?.subject,
        gameName: player?.gameName,
        tagLine: player?.tagLine,
        stats: player?.stats,
        character,
    };
    return {
        map: matchMap,
        details: {
            player: playerDetails,
            playerTeam: {
                roundsWon: playerTeam?.roundsWon,
                hasWon: playerTeam?.won,
            },
            enemyTeam: {
                roundsWon: enemyTeam?.roundsWon,
                hasWon: enemyTeam?.won,
            },
        },
    };
}
export const loader: LoaderFunction = async ({ request, params }) => {
    const user = await requireUser(request);
    const playerId = await requirePlayerUuidAsParam(params);
    const url = new URL(request.url);
    const startIndex = url.searchParams.get('startIndex') || 0;
    const endIndex = url.searchParams.get('endIndex') ? url.searchParams.get('endIndex') : 10;
    const riotRequest = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.match.history(playerId)
    );
    const matchHistory = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantMatchHistory>(
        riotRequest,
        {
            key: 'match-history',
            expiration: 3600,
        },
        {
            params: {
                startIndex,
                endIndex,
            },
        }
    );
    return await Promise.all(
        matchHistory.History.map(async (match) => {
            const details = await getMatchDetails(user, match.MatchID);
            const map = await getMatchMap(details);
            return await getRelevantMatchData(playerId, details, map!);
        })
    );
};
