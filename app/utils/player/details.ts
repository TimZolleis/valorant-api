import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantApiPlayerLoadout } from '~/models/valorant-api/ValorantApiPlayerLoadout';
import { getPlayerRank } from '~/utils/player/rank.server';
import { getCompetitiveUpdates } from '~/utils/player/competitiveupdate.server';
import { ValorantApiClient } from '~/utils/valorant-api/valorant-api.client';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import type { ValorantApiPlayerCard } from '~/models/valorant-api/ValorantApiPlayerCard';
import { getPlayerNameService } from '~/utils/player/nameservice.server';

export async function getPlayerLoadout(user: ValorantUser, puuid: string) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.player.loadout(puuid)
    );
    return await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).get<ValorantApiPlayerLoadout>(request);
}

async function getPlayerCardByPlayerCardUuid(playerCardUuid: string) {
    return await new ValorantApiClient().getCached<ValorantApiPlayerCard>(
        valorantApiEndpoints.playerCards.byUuid(playerCardUuid),
        {
            key: 'playercard',
            expiration: 600,
        }
    );
}
