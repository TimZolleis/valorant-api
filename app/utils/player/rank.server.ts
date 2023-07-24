import { ValorantApiClient } from '~/utils/valorant-api/valorant-api.server';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import type { ValorantApiCompetitiveSeason } from '~/models/valorant-api/ValorantApiCompetitiveSeasons';
import { seasonsConfig } from '~/config/season';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { getLatestCompetitiveUpdate } from '~/utils/player/competitiveupdate.server';
import type { ValorantApiCompetitiveTier } from '~/models/valorant-api/ValorantApiCompetitiveTier';

export type PlayerRank = Awaited<ReturnType<typeof getPlayerRank>>;

export async function getCurrentCompetitiveTiers() {
    const competitiveSeasons = await new ValorantApiClient().getCached<
        ValorantApiCompetitiveSeason[]
    >(valorantApiEndpoints.competitiveSeasons, {
        key: 'competitive-seasons',
        expiration: 3600,
    });
    const competitiveTiersUuid = competitiveSeasons.find((season) => {
        return season.seasonUuid === seasonsConfig.currentAct.ID;
    })?.competitiveTiersUuid;
    return await new ValorantApiClient().getCached<ValorantApiCompetitiveTier>(
        valorantApiEndpoints.competitiveTierByUUid(competitiveTiersUuid!),
        {
            key: 'competitive-tiers',
            expiration: 3600,
        }
    );
}

export async function getPlayerRank(user: ValorantUser, playerUuid: string) {
    try {
        const currentCompetitiveTiers = await getCurrentCompetitiveTiers();
        const latestCompetitiveUpdate = await getLatestCompetitiveUpdate(user, playerUuid);
        const tierNumber = latestCompetitiveUpdate.Matches[0]?.TierAfterUpdate || 0;
        const rank = findRank(currentCompetitiveTiers, tierNumber);
        return {
            tier: rank,
            latestRR: latestCompetitiveUpdate.Matches[0]?.RankedRatingAfterUpdate || 0,
        };
    } catch (e) {
        return undefined;
    }
}

export async function getRankByTierNumber(tierNumber: number) {
    const currentCompetitiveTiers = await getCurrentCompetitiveTiers();
    return findRank(currentCompetitiveTiers, tierNumber);
}

function findRank(competitiveTier: ValorantApiCompetitiveTier, tierNumber: number) {
    const rank = competitiveTier.tiers.find((tier) => {
        return tier.tier === tierNumber;
    });
    if (!rank) {
        return competitiveTier.tiers[0];
    }
    return rank;
}
