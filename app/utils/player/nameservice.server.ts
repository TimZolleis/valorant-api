import { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import { ValorantNameService } from '~/models/valorant/player/ValorantNameService';

export async function getPlayerNameService(user: ValorantUser, puuid: string) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.player.nameservice
    );
    const nameServices = await new RiotGamesApiClient(user.accessToken, user.entitlement).putCached<
        ValorantNameService[]
    >(request, [puuid], { expiration: 3600, key: `name-service-${puuid}` });
    return nameServices[0];
}
