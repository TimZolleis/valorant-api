import { ValorantUser } from '~/models/user/ValorantUser';
import { getPlayerMMR } from '~/utils/player/competitiveupdate.server';
import { SeasonalInfo, SeasonalInfoBySeasonID } from '~/models/valorant/competitive/ValorantMMR';
import { getRankByTierNumber } from '~/utils/player/rank.server';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';

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
            const seasonDescription = await new ValorantApiClient().getDatabaseCached(
                valorantApiEndpoints.seasonByUuid(seasonId),
                { key: 'season', expiration: 3600 }
            );
            const winrate = calculateWinrate(season.NumberOfWins, season.NumberOfGames);
            console.log('Season', season);
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

function calculateWinrate(gamesWon: number, gamesPlayed: number) {
    return (gamesWon / gamesPlayed) * 100;
}
