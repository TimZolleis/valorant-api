export interface Match {
    MatchID: string;
    MapID: string;
    SeasonID: string;
    MatchStartTime: any;
    TierAfterUpdate: number;
    TierBeforeUpdate: number;
    RankedRatingAfterUpdate: number;
    RankedRatingBeforeUpdate: number;
    RankedRatingEarned: number;
    RankedRatingPerformanceBonus: number;
    CompetitiveMovement: string;
    AFKPenalty: number;
}

export interface ValorantCompetitiveUpdate {
    Version: number;
    Subject: string;
    Matches: Match[];
}


