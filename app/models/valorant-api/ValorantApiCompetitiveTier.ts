export interface Tier {
    tier: number;
    tierName: string;
    division: string;
    divisionName: string;
    color: string;
    backgroundColor: string;
    smallIcon: string;
    largeIcon: string;
    rankTriangleDownIcon: string;
    rankTriangleUpIcon: string;
}

export interface ValorantApiCompetitiveTier {
    uuid: string;
    assetObjectName: string;
    tiers: Tier[];
    assetPath: string;
}


