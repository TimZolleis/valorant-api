import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import { endpoints } from '~/config/endpoints';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import { ValorantApiCompetitiveSeason } from '~/models/valorant-api/ValorantApiCompetitiveSeasons';
import { seasonsConfig } from '~/config/season';
import { ValorantUser } from '~/models/user/ValorantUser';
import { getLatestCompetitiveUpdate } from '~/utils/player/competitiveupdate.server';
import { ValorantApiCompetitiveTier } from '~/models/valorant-api/ValorantApiCompetitiveTier';
import { ValorantCompetitiveUpdate } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';

export async function getCurrentCompetitiveTiers() {
    const competitiveSeasons = await new ValorantApiClient().getDatabaseCached<
        ValorantApiCompetitiveSeason[]
    >(valorantApiEndpoints.competitiveSeasons, {
        key: 'competitive-seasons',
        expiration: 3600,
    });
    const competitiveTiersUuid = competitiveSeasons.find((season) => {
        return season.seasonUuid === seasonsConfig.currentAct.ID;
    })?.competitiveTiersUuid;
    return await new ValorantApiClient().getDatabaseCached<ValorantApiCompetitiveTier>(
        valorantApiEndpoints.competitiveTierByUUid(competitiveTiersUuid!),
        {
            key: 'competitive-tiers',
            expiration: 3600,
        }
    );
}

export async function getPlayerRank(user: ValorantUser, playerUuid: string) {
    const currentCompetitiveTiers = await getCurrentCompetitiveTiers();
    const latestCompetitiveUpdate = await getLatestCompetitiveUpdate(user, playerUuid);
    const rank = findRank(
        currentCompetitiveTiers,
        latestCompetitiveUpdate.Matches[0].TierAfterUpdate
    );
    return {
        tier: rank,
        latestRR: latestCompetitiveUpdate.Matches[0].RankedRatingAfterUpdate,
    };
}

export async function getRankByTierNumber(tierNumber: number) {
    const currentCompetitiveTiers = await getCurrentCompetitiveTiers();
    return findRank(currentCompetitiveTiers, tierNumber);
}

function findRank(competitiveTier: ValorantApiCompetitiveTier, tierNumber: number) {
    return competitiveTier.tiers.find((tier) => {
        return tier.tier === tierNumber;
    });
}
