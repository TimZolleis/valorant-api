import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type {
    ValorantPregameMatch,
    ValorantPregameMatchId,
} from '~/models/valorant/match/ValorantPregameMatch';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import type {
    ValorantCoregameMatch,
    ValorantCoregameMatchId,
} from '~/models/valorant/match/ValorantCoregameMatch';
import { NoCoregameFoundException } from '~/exceptions/NoCoregameFoundException';

export async function getRunningPregameMatch(user: ValorantUser, puuid: string) {
    const client = new RiotGamesApiClient(user.accessToken, user.entitlement);
    const getMatchIdRequest = new RiotRequest(user.userData.region).buildMatchUrl(
        endpoints.match.pre.getMatchId(puuid)
    );
    try {
        const matchId = await client
            .get<ValorantPregameMatchId>(getMatchIdRequest)
            .then((res) => res.MatchID);

        const getMatchRequest = new RiotRequest(user.userData.region).buildMatchUrl(
            endpoints.match.pre.getMatch(matchId)
        );
        return await client.getCached<ValorantPregameMatch>(getMatchRequest, {
            key: 'pregame-match',
            expiration: 10,
        });
    } catch (e) {
        throw new NoPregameFoundException();
    }
}

export async function getRunningCoregameMatch(user: ValorantUser, puuid: string) {
    const client = new RiotGamesApiClient(user.accessToken, user.entitlement);
    const getMatchIdRequest = new RiotRequest(user.userData.region).buildMatchUrl(
        endpoints.match.core.getMatchId(puuid)
    );

    try {
        const matchId = await client
            .get<ValorantCoregameMatchId>(getMatchIdRequest)
            .then((res) => res.MatchID);
        const getMatchRequest = new RiotRequest(user.userData.region).buildMatchUrl(
            endpoints.match.core.getMatch(matchId)
        );
        return await client.getCached<ValorantCoregameMatch>(getMatchRequest, {
            key: 'coregame-match',
            expiration: 10,
        });
    } catch (e) {
        throw new NoCoregameFoundException();
    }
}
