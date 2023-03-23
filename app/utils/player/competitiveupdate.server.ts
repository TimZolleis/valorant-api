import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantCompetitiveUpdate } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';
import type { ValorantMMR } from '~/models/valorant/competitive/ValorantMMR';

export async function getLatestCompetitiveUpdate(user: ValorantUser, playerUUid: string) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.player.competitiveupdate(playerUUid)
    );
    return await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantCompetitiveUpdate>(
        request,
        {
            key: 'latest-competitive-update',
            expiration: 300,
        },
        {
            params: {
                queue: 'competitive',
                startIndex: 0,
                endIndex: 1,
            },
        }
    );
}
export async function getPlayerMMR(user: ValorantUser, playerUuid: string) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.player.mmr(playerUuid)
    );
    return await new RiotGamesApiClient(user.accessToken, user.entitlement).getCached<ValorantMMR>(
        request,
        {
            key: 'player-mmr',
            expiration: 1800,
        }
    );
}

export async function getCompetitiveUpdates(user: ValorantUser, playerUUid: string) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.player.competitiveupdate(playerUUid)
    );
    return await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantCompetitiveUpdate>(
        request,
        {
            key: 'competitive-update',
            expiration: 300,
        },
        {
            params: {
                queue: 'competitive',
                startIndex: 0,
                endIndex: 20,
            },
        }
    );
}
