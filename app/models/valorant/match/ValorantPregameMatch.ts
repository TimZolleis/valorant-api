export interface PlayerIdentity {
    Subject: string;
    PlayerCardID: string;
    PlayerTitleID: string;
    AccountLevel: number;
    PreferredLevelBorderID: string;
    Incognito: boolean;
    HideAccountLevel: boolean;
}

export interface WinsByTier {
    [key: string]: number | null;
}

export interface SeasonalBadgeInfo {
    SeasonID: string;
    NumberOfWins: number;
    WinsByTier?: any;
    Rank: number;
    LeaderboardRank: number;
}

export interface PregamePlayer {
    Subject: string;
    CharacterID?: string;
    CharacterSelectionState: string;
    PregamePlayerState: string;
    CompetitiveTier: number;
    PlayerIdentity: PlayerIdentity;
    SeasonalBadgeInfo: SeasonalBadgeInfo;
    IsCaptain: boolean;
}

export interface Team {
    TeamID: string;
    Players: PregamePlayer[];
}

export interface AllyTeam {
    TeamID: string;
    Players: PregamePlayer[];
}

export interface CastedVotes {}

export interface ValorantPregameMatch {
    ID: string;
    Version: number;
    Teams: Team[];
    AllyTeam: AllyTeam;
    EnemyTeam?: any;
    ObserverSubjects: any[];
    MatchCoaches: any[];
    EnemyTeamSize: number;
    EnemyTeamLockCount: number;
    PregameState: string;
    LastUpdated: string;
    MapID: string;
    MapSelectPool: any[];
    BannedMapIDs: any[];
    CastedVotes: CastedVotes;
    MapSelectSteps: any[];
    MapSelectStep: number;
    Team1: string;
    GamePodID: string;
    Mode: string;
    VoiceSessionID: string;
    MUCName: string;
    QueueID: string;
    ProvisioningFlowID: string;
    IsRanked: boolean;
    PhaseTimeRemainingNS: number;
    StepTimeRemainingNS: number;
    altModesFlagADA: boolean;
    TournamentMetadata?: any;
    RosterMetadata?: any;
}

export interface ValorantPregameMatchId {
    Subject: string;
    MatchID: string;
    Version: number;
}
