import type { DataFunctionArgs } from '@vercel/remix';
import { requirePlayerUuidAsParam, requireUser } from '~/utils/session/session.server';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantMatchHistory } from '~/models/valorant/match/ValorantMatchHistory';
import type { History } from '~/models/valorant/match/ValorantMatchHistory';
import { getCharacterByUUid, getMatchDetails, getMatchMap } from '~/utils/match/match.server';
import type { ValorantMatchDetails } from '~/models/valorant/match/ValorantMatchDetails';
import type { ValorantApiMap } from '~/models/valorant-api/ValorantApiMap';
import type { ValorantUser } from '~/models/user/ValorantUser';

export type MatchHistoryRouteData = Awaited<ReturnType<typeof loader>>;
export type MatchHistory = Awaited<ReturnType<typeof getHistory>>;
export async function getRelevantMatchData(
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
                ...playerTeam,
                roundsWon: playerTeam?.roundsWon,
                hasWon: playerTeam?.won,
            },
            enemyTeam: {
                ...enemyTeam,
                roundsWon: enemyTeam?.roundsWon,
                hasWon: enemyTeam?.won,
            },
            matchInfo: matchDetails.matchInfo,
        },
    };
}

async function getHistory(user: ValorantUser, match: History) {
    const details = await getMatchDetails(user, match.MatchID);
    const map = await getMatchMap(details.matchInfo.mapId);
    return await getRelevantMatchData(user.userData.puuid, details, map!);
}

export const loader = async ({ request, params }: DataFunctionArgs) => {
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
            expiration: 300,
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
            return getHistory(user, match);
        })
    );
};
