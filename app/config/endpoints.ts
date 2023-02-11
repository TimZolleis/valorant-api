export const endpoints = {
    match: {
        history: (puuid: string) => `/match-history/v1/history/${puuid}`,
        details: (matchId: string) => `/match-details/v1/matches/${matchId}`,
    },
    player: {
        competitiveupdate: (puuid: string) => `/mmr/v1/players/${puuid}/competitiveupdates`,
        mmr: (puuid: string) => `/mmr/v1/players/${puuid}`,
    },
};
