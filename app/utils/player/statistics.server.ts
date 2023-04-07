import type { ValorantUser } from '~/models/user/ValorantUser';
import { getPlayerMMR } from '~/utils/player/competitiveupdate.server';
import type {
    SeasonalInfo,
    SeasonalInfoBySeasonID,
} from '~/models/valorant/competitive/ValorantMMR';
import { getRankByTierNumber } from '~/utils/player/rank.server';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import type { ValorantApiSeason } from '~/models/valorant-api/ValorantApiSeason';
import { prisma } from '~/utils/db/db.server';
import { DateTime } from 'luxon';

export async function getPlayerStatistics(user: ValorantUser, playerUuid: string) {
    const mmr = await getPlayerMMR(user, playerUuid);
    const competitiveSkills = mmr.QueueSkills.competitive;
    const seasonalStatistics = await getSeasonalStatistics(
        competitiveSkills.SeasonalInfoBySeasonID
    );
    const totalStatistics = await getTotalStatistics(competitiveSkills.SeasonalInfoBySeasonID);
    return { totalStatistics, seasonalStatistics };
}

async function getTotalStatistics(seasonalInfoBySeasonID: SeasonalInfoBySeasonID) {
    const { totalGames, totalWins } = getTotalGamesAndWins(seasonalInfoBySeasonID);
    const winrate = calculateWinrate(totalWins, totalGames);
    const topRank = await getTopRank(seasonalInfoBySeasonID);
    return { winrate, topRank };
}

async function getSeasonalStatistics(seasonalInfoBySeasonID: SeasonalInfoBySeasonID) {
    const seasonsIds = Object.keys(seasonalInfoBySeasonID);
    return await Promise.all(
        seasonsIds.map(async (seasonId) => {
            const season = seasonalInfoBySeasonID[seasonId];
            const seasonDescription =
                await new ValorantApiClient().getDatabaseCached<ValorantApiSeason>(
                    valorantApiEndpoints.seasonByUuid(seasonId),
                    { key: 'season', expiration: 3600 }
                );
            const winrate = calculateWinrate(season.NumberOfWins, season.NumberOfGames);
            const highestRank = await getSeasonalTopRank(season);
            return {
                seasonID: season.SeasonID,
                season: seasonDescription,
                winrate,
                highestRank,
            };
        })
    );
}

async function getTopRank(seasonalInfoBySeasonID: SeasonalInfoBySeasonID) {
    const seasonIds = Object.keys(seasonalInfoBySeasonID);
    let highestRank = 0;
    seasonIds.forEach((seasonId) => {
        const season = seasonalInfoBySeasonID[seasonId];
        if (season.WinsByTier) {
            const tiersPlayedIn = Object.keys(season.WinsByTier);
            tiersPlayedIn.forEach((tierPlayedIn) => {
                const tierPlayedInAsNumber = parseInt(tierPlayedIn);
                if (tierPlayedInAsNumber > highestRank) {
                    highestRank = tierPlayedInAsNumber;
                }
            });
        }
    });
    return await getRankByTierNumber(highestRank);
}

async function getSeasonalTopRank(season: SeasonalInfo) {
    let highestRank = 0;
    if (season !== null && season.WinsByTier) {
        const tiersPlayedIn = Object.keys(season?.WinsByTier);
        tiersPlayedIn.forEach((tierPlayedIn) => {
            const tierPlayedInAsNumber = parseInt(tierPlayedIn);
            if (tierPlayedInAsNumber > highestRank) {
                highestRank = tierPlayedInAsNumber;
            }
        });
        return await getRankByTierNumber(highestRank);
    }
    return null;
}

function getTotalGamesAndWins(seasonalInfoBySeasonID: SeasonalInfoBySeasonID) {
    const seasonIds = Object.keys(seasonalInfoBySeasonID);
    let totalGames = 0;
    let totalWins = 0;
    seasonIds.forEach((seasonId) => {
        const season = seasonalInfoBySeasonID[seasonId];
        totalGames += season.NumberOfGames;
        totalWins += season.NumberOfWins;
    });
    return { totalGames, totalWins };
}

export async function getDailyRoundPerformance(puuid: string) {
    const dailyMatches = await prisma.matchPerformance.findMany({
        where: {
            puuid: puuid,
            matchStartTime: {
                gte: DateTime.now().startOf('day').toJSDate(),
                lt: DateTime.now().endOf('day').toJSDate(),
            },
        },
    });
    const dailyAcs = dailyMatches.reduce(
        (a, b) => {
            const score = b.score;
            const averageScore = b.score / b.roundsPlayed;
            return {
                totalScore: a.totalScore + score,
                averageScore: a.averageScore + averageScore,
            };
        },
        { totalScore: 0, averageScore: 0 }
    );

    const dailyKDA = dailyMatches.reduce(
        (a, b) => {
            return {
                kills: a.kills + b.kills,
                deaths: a.deaths + b.deaths,
                assists: a.assists + b.assists,
            };
        },
        { kills: 0, deaths: 0, assists: 0 }
    );

    const dailyAccuracy = dailyMatches.reduce(
        (a, b) => {
            return {
                headShots: a.headShots + b.headShots,
                bodyShots: a.bodyShots + b.bodyShots,
                legShots: a.legShots + b.legShots,
                totalShots: a.totalShots + b.totalShots,
            };
        },
        { headShots: 0, bodyShots: 0, legShots: 0, totalShots: 0 }
    );

    return { dailyAcs, dailyKDA, dailyAccuracy, gamesPlayed: dailyMatches.length };
}

function calculateWinrate(gamesWon: number, gamesPlayed: number) {
    return (gamesWon / gamesPlayed) * 100;
}
