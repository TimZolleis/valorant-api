export interface Border {
    uuid: string;
    level: number;
    winsRequired: number;
    displayIcon: string;
    smallIcon: string;
    assetPath: string;
}

export interface ValorantApiCompetitiveSeason {
    uuid: string;
    startTime: Date;
    endTime: Date;
    seasonUuid: string;
    competitiveTiersUuid: string;
    borders: Border[];
    assetPath: string;
}
