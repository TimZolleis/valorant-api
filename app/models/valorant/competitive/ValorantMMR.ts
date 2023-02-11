export interface WinsByTier {
    0: number;
    4: number;
    5: number;
    6: number;
}
export interface SeasonalInfo {
    SeasonID: string;
    NumberOfWins: number;
    NumberOfWinsWithPlacements: number;
    NumberOfGames: number;
    Rank: number;
    CapstoneWins: number;
    LeaderboardRank: number;
    CompetitiveTier: number;
    RankedRating: number;
    WinsByTier: WinsByTier;
    GamesNeededForRating: number;
    TotalWinsNeededForRank: number;
}

export interface SeasonalInfoBySeasonID {
    [key: string]: SeasonalInfo;
}

export interface Seeding {
    TotalGamesNeededForRating: number;
    TotalGamesNeededForLeaderboard: number;
    CurrentSeasonGamesNeededForRating: number;
    SeasonalInfoBySeasonID: SeasonalInfoBySeasonID;
}

export interface GameMode {
    TotalGamesNeededForRating: number;
    TotalGamesNeededForLeaderboard: number;
    CurrentSeasonGamesNeededForRating: number;
    SeasonalInfoBySeasonID: SeasonalInfoBySeasonID;
}

export interface QueueSkills {
    competitive: GameMode;
    deathmatch: GameMode;
    onefa: GameMode;
    seeding: Seeding;
    spikerush: GameMode;
    swiftplay: GameMode;
    unrated: GameMode;
}

export interface LatestCompetitiveUpdate {
    MatchID: string;
    MapID: string;
    SeasonID: string;
    MatchStartTime: number;
    TierAfterUpdate: number;
    TierBeforeUpdate: number;
    RankedRatingAfterUpdate: number;
    RankedRatingBeforeUpdate: number;
    RankedRatingEarned: number;
    RankedRatingPerformanceBonus: number;
    CompetitiveMovement: string;
    AFKPenalty: number;
}

export interface ValorantMMR {
    Version: number;
    Subject: string;
    NewPlayerExperienceFinished: boolean;
    QueueSkills: QueueSkills;
    LatestCompetitiveUpdate: LatestCompetitiveUpdate;
    IsLeaderboardAnonymized: boolean;
    IsActRankBadgeHidden: boolean;
}
