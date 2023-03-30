import type { Player, ValorantMatchDetails } from '~/models/valorant/match/ValorantMatchDetails';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import type { ValorantApiMap } from '~/models/valorant-api/ValorantApiMap';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantUser } from '~/models/user/ValorantUser';
import type { ValorantApiCharacter } from '~/models/valorant-api/ValorantApiCharacter';
import { prisma } from '~/utils/db/db.server';
import type { Match } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';
import type { getHistory } from '~/routes/__index/index';
import { getPlayerRank } from '~/utils/player/rank.server';
import { getCompetitiveUpdates } from '~/utils/player/competitiveupdate.server';

export async function getMatchMap(mapId: string) {
    const maps = await new ValorantApiClient().getDatabaseCached<ValorantApiMap[]>(
        valorantApiEndpoints.maps,
        {
            key: 'maps',
            expiration: 3600,
        }
    );
    const result = maps.find((map) => {
        return map.mapUrl === mapId;
    });
    if (!result) {
        throw new Error('Map not found!');
    }
    return result;
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

export async function analyzeMatch(user: ValorantUser, matchId: string) {
    const details = await getMatchDetails(user, matchId);
    for (const player of details.players) {
        await storePlayerPerformance(user, player, details);
    }
}

async function storePlayerPerformance(
    user: ValorantUser,
    player: Player,
    details: ValorantMatchDetails
) {
    const competitiveUpdate = await getCompetitiveUpdates(user, player.subject);
    const competitiveMatch = competitiveUpdate.Matches.find(
        (match) => match.MatchID === details.matchInfo.matchId
    );
    const { headShots, bodyShots, legShots } = analyzePlayerShots(player.subject, details);
    await prisma.matchPerformance.upsert({
        where: {
            puuid_matchId: {
                puuid: player.subject,
                matchId: details.matchInfo.matchId,
            },
        },
        update: {},
        create: {
            puuid: player.subject,
            matchId: details.matchInfo.matchId,

            score: player.stats.score,
            kills: player.stats.kills,
            deaths: player.stats.deaths,
            assists: player.stats.assists,

            headShots: headShots,
            bodyShots: bodyShots,
            legShots: legShots,
            totalShots: headShots + bodyShots + legShots,

            rankedRatingBeforeUpdate: competitiveMatch?.RankedRatingBeforeUpdate || 0,
            rankedRatingAfterUpdate: competitiveMatch?.RankedRatingAfterUpdate || 0,
            tierBeforeUpdate: competitiveMatch?.TierBeforeUpdate || 0,
            tierAfterUpdate: competitiveMatch?.TierAfterUpdate || 0,

            roundsPlayed: player.stats.roundsPlayed,
            teamId: player.teamId,
            characterUuid: player.characterId,
        },
    });
}

function analyzePlayerShots(puuid: string, details: ValorantMatchDetails) {
    const relevantPlayerStats = details.roundResults.map((roundResult) => {
        return roundResult.playerStats.filter((playerStats) => {
            return playerStats.subject === puuid;
        });
    });
    let headShots = 0;
    let bodyShots = 0;
    let legShots = 0;
    relevantPlayerStats.forEach((statistics) => {
        statistics.forEach((playerStats) => {
            const roundHeadshotsArray = playerStats.damage.map((damage) => damage.headshots);
            const roundBodyShotsArray = playerStats.damage.map((damage) => damage.bodyshots);
            const roundLegShotsArray = playerStats.damage.map((damage) => damage.legshots);
            if (roundHeadshotsArray.length > 0) {
                headShots += roundHeadshotsArray.reduce(sum);
            }
            if (roundBodyShotsArray.length > 0) {
                bodyShots += roundBodyShotsArray.reduce(sum);
            }
            if (roundLegShotsArray.length > 0) {
                legShots += roundLegShotsArray.reduce(sum);
            }
        });
    });

    return { headShots, bodyShots, legShots };
}

export async function getCharacterByUUid(characterId: string | undefined) {
    if (!characterId) return null;
    return await new ValorantApiClient().getDatabaseCached<ValorantApiCharacter>(
        valorantApiEndpoints.characterByUuid(characterId),
        {
            key: 'character',
            expiration: 3600,
        }
    );
}

export type MatchHistory = Awaited<ReturnType<typeof getHistory>>;

export async function getRelevantMatchData(
    puuid: string,
    matchDetails: ValorantMatchDetails,
    matchMap: ValorantApiMap,
    competitiveMatchUpdate: Match | undefined
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
            competitiveMatchUpdate,
        },
    };
}

function sum(a: number, b: number) {
    return a + b;
}

export async function scheduleMatchForAnalysis(user: ValorantUser, matchId: string) {
    return prisma.matchAnalysisSchedule.upsert({
        where: {
            matchId: matchId,
        },
        update: {},
        create: {
            matchId,
            puuid: user.userData.puuid,
        },
    });
}
