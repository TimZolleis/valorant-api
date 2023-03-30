export interface TrackerPlayerNameQueryResult {
    data: TrackerPlayer[];
}

export interface TrackerPlayer {
    platformId: number;
    platformSlug: string;
    platformUserIdentifier: string;
    platformUserId: string | null;
    platformUserHandle: string;
    avatarUrl: string | null;
    status: string | null;
    additionalParameters: string | null;
}
