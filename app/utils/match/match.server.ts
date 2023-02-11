import { ValorantMatchDetails } from '~/models/valorant/match/ValorantMatchDetails';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import { ValorantApiMap } from '~/models/valorant-api/ValorantApiMap';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import { ValorantUser } from '~/models/user/ValorantUser';

export async function getMatchMap(matchDetails: ValorantMatchDetails) {
    const maps = await new ValorantApiClient().getDatabaseCached<ValorantApiMap[]>(
        valorantApiEndpoints.maps,
        {
            key: 'maps',
            expiration: 3600,
        }
    );
    return maps.find((map) => {
        return map.mapUrl === matchDetails.matchInfo.mapId;
    });
}

export async function getMatchDetails(user: ValorantUser, matchId: string) {
    const riotRequest = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.match.details(matchId)
    );
    return await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getDatabaseCached<ValorantMatchDetails>(riotRequest, {
        key: 'match-details',
        expiration: 3600,
    });
}

export async function getCharacterByUUid(characterId: string) {
    return await new ValorantApiClient().getDatabaseCached(
        valorantApiEndpoints.characterByUuid(characterId),
        {
            key: 'character',
            expiration: 3600,
        }
    );
}
