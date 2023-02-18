export interface ValorantCoregameMatchId {
    Subject: string;
    MatchID: string;
    Version: number;
}

export interface ConnectionDetails {
    GameServerHosts: string[];
    GameServerHost: string;
    GameServerPort: number;
    GameServerObfuscatedIP: number;
    GameClientHash: number;
    PlayerKey: string;
}

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
    10: number;
    11: number;
    12: number;
    13: number;
    9: number;
    14?: number;
    15?: number;
    8?: number;
    0?: number;
    6?: number;
    7?: number;
}

export interface SeasonalBadgeInfo {
    SeasonID: string;
    NumberOfWins: number;
    WinsByTier?: any;
    Rank: number;
    LeaderboardRank: number;
}

export interface CoregamePlayer {
    Subject: string;
    TeamID: string;
    CharacterID: string;
    PlayerIdentity: PlayerIdentity;
    SeasonalBadgeInfo: SeasonalBadgeInfo;
    IsCoach: boolean;
    IsAssociated: boolean;
}

export interface MatchmakingData {
    QueueID: string;
    IsRanked: boolean;
}

export interface ValorantCoregameMatch {
    MatchID: string;
    Version: number;
    State: string;
    MapID: string;
    ModeID: string;
    ProvisioningFlow: string;
    GamePodID: string;
    AllMUCName: string;
    TeamMUCName: string;
    TeamVoiceID: string;
    IsReconnectable: boolean;
    ConnectionDetails: ConnectionDetails;
    PostGameDetails?: any;
    Players: CoregamePlayer[];
    MatchmakingData: MatchmakingData;
}
